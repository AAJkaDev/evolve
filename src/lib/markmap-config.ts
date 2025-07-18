import { Transformer } from 'markmap-lib';
import { IMarkmapOptions } from 'markmap-view';

// Brand-aligned color scheme for mind map nodes
export const CEREBRUM_COLORS = [
  '#3b82f6', // Primary blue
  '#10b981', // Emerald green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#84cc16', // Lime
  '#ec4899', // Pink
  '#6366f1', // Indigo
];

// Core markmap configuration options
export const markmapOptions: Partial<IMarkmapOptions> = {
  color: (node) => {
    // Use a simple rotating color scheme based on the node's level or id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const index = ((node as any).d || 0) % CEREBRUM_COLORS.length;
    return CEREBRUM_COLORS[index];
  },
  duration: 500,
  maxWidth: 300,
  spacingVertical: 8,
  spacingHorizontal: 120,
  paddingX: 8,
  autoFit: true,
  fitRatio: 0.95,
};

// Additional styling for enhanced visual appeal
export const customStyles = `
  .markmap-node {
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .markmap-node:hover {
    opacity: 0.8;
  }
  
  .markmap-node circle {
    stroke-width: 2;
    stroke: #fff;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
  }
  
  .markmap-node text {
    font-weight: 500;
    text-shadow: 0 1px 2px rgba(0,0,0,0.1);
  }
  
  .markmap-link {
    stroke-width: 2;
    stroke-opacity: 0.7;
    transition: all 0.2s ease;
  }
  
  .markmap-link:hover {
    stroke-opacity: 1;
    stroke-width: 3;
  }
  
  .markmap-toolbar {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

// Initialize the transformer for converting markdown to mind map data
export const transformer = new Transformer();

// Function to transform markdown content into mind map data structure
export function transformMarkdownToMindMap(markdown: string) {
  try {
    // Transform the markdown into a tree structure
    const { root, features } = transformer.transform(markdown);
    
    // Return the transformed data with features for rendering
    return {
      root,
      features,
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Error transforming markdown to mind map:', error);
    return {
      root: null,
      features: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Utility function to validate markdown structure for mind maps
export function validateMarkdownStructure(markdown: string): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // Check for basic structure
  if (!markdown.trim()) {
    issues.push('Markdown content is empty');
    suggestions.push('Add some content with headers and bullet points');
    return { isValid: false, issues, suggestions };
  }
  
  // Check for headers
  const hasHeaders = /^#+\s/m.test(markdown);
  if (!hasHeaders) {
    issues.push('No headers found in markdown');
    suggestions.push('Add headers (# ## ###) to create a hierarchical structure');
  }
  
  // Check for list items
  const hasListItems = /^[\s]*[-*+]\s/m.test(markdown);
  if (!hasListItems) {
    suggestions.push('Consider adding bullet points (-) for better mind map structure');
  }
  
  // Check for overly deep nesting (more than 6 levels)
  const deepNesting = /^#{7,}/m.test(markdown);
  if (deepNesting) {
    issues.push('Markdown has very deep nesting (7+ levels)');
    suggestions.push('Consider flattening the structure to 6 levels or fewer');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
  };
}

// Default markdown template for empty states
export const defaultMarkdownTemplate = `# Mind Map

## Key Concepts
- Concept 1
- Concept 2
- Concept 3

## Important Points
- Point A
- Point B
- Point C

## Actions
- Action 1
- Action 2
- Action 3
`;

// Export configuration object for easy access
export const markmapConfig = {
  options: markmapOptions,
  colors: CEREBRUM_COLORS,
  styles: customStyles,
  transformer,
  transform: transformMarkdownToMindMap,
  validate: validateMarkdownStructure,
  defaultTemplate: defaultMarkdownTemplate,
};
