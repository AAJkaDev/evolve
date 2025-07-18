import { useEffect, useRef, useState, useCallback } from 'react';
import { Markmap } from 'markmap-view';
import { Toolbar } from 'markmap-toolbar';
import * as d3 from 'd3';
import { 
  markmapOptions, 
  customStyles, 
  transformMarkdownToMindMap,
  validateMarkdownStructure,
  defaultMarkdownTemplate 
} from '@/lib/markmap-config';

interface UseMarkmapOptions {
  initialMarkdown?: string;
  autoFit?: boolean;
  showToolbar?: boolean;
  onError?: (error: string) => void;
  onDataChange?: (data: unknown) => void;
}

interface UseMarkmapReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  toolbarRef: React.RefObject<HTMLDivElement | null>;
  markmap: Markmap | null;
  toolbar: Toolbar | null;
  isLoading: boolean;
  error: string | null;
  updateMarkdown: (markdown: string) => void;
  fitToView: () => void;
  downloadSVG: (filename?: string) => void;
  resetView: () => void;
  toggleToolbar: () => void;
  validateMarkdown: (markdown: string) => ReturnType<typeof validateMarkdownStructure>;
  isInitialized: boolean;
}

export function useMarkmap(options: UseMarkmapOptions = {}): UseMarkmapReturn {
  const {
    initialMarkdown = defaultMarkdownTemplate,
    autoFit = true,
    showToolbar = true,
    onError,
    onDataChange,
  } = options;

  // Refs for DOM elements
  const containerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  
  // State management
  const [markmap, setMarkmap] = useState<Markmap | null>(null);
  const [toolbar, setToolbar] = useState<Toolbar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [toolbarVisible, setToolbarVisible] = useState(showToolbar);

  // Internal state
  const currentData = useRef<unknown>(null);
  const styleElement = useRef<HTMLStyleElement | null>(null);

  // Initialize styles
  const initializeStyles = useCallback(() => {
    if (styleElement.current) return;
    
    styleElement.current = document.createElement('style');
    styleElement.current.textContent = customStyles;
    document.head.appendChild(styleElement.current);
  }, []);

  // Clean up styles
  const cleanupStyles = useCallback(() => {
    if (styleElement.current) {
      document.head.removeChild(styleElement.current);
      styleElement.current = null;
    }
  }, []);

  // Initialize markmap instance
  const initializeMarkmap = useCallback(() => {
    if (!containerRef.current) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Initialize styles
      initializeStyles();

      // Create markmap instance
      const svg = d3.select(containerRef.current)
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

      const mm = Markmap.create(svg.node()!, markmapOptions);
      
      // Create toolbar if enabled
      let tb: Toolbar | null = null;
      if (toolbarVisible && toolbarRef.current) {
        tb = new Toolbar();
        tb.attach(mm);
        tb.setItems([
          'zoomIn',
          'zoomOut',
          'fit',
          'recenter',
        ]);
        toolbarRef.current.appendChild(tb.render());
      }

      // Transform and render initial data
      const result = transformMarkdownToMindMap(initialMarkdown);
      if (result.success && result.root) {
        mm.setData(result.root);
        if (autoFit) {
          setTimeout(() => mm.fit(), 100);
        }
        currentData.current = result.root;
        onDataChange?.(result.root);
      } else {
        throw new Error(result.error || 'Failed to transform markdown');
      }

      setMarkmap(mm);
      setToolbar(tb);
      setIsInitialized(true);
      setIsLoading(false);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize markmap';
      setError(errorMessage);
      setIsLoading(false);
      onError?.(errorMessage);
      console.error('Markmap initialization error:', err);
    }
  }, [initialMarkdown, autoFit, toolbarVisible, onError, onDataChange, initializeStyles]);

  // Update markdown content
  const updateMarkdown = useCallback((markdown: string) => {
    if (!markmap) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = transformMarkdownToMindMap(markdown);
      if (result.success && result.root) {
        markmap.setData(result.root);
        if (autoFit) {
          setTimeout(() => markmap.fit(), 100);
        }
        currentData.current = result.root;
        onDataChange?.(result.root);
      } else {
        throw new Error(result.error || 'Failed to transform markdown');
      }

      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update markdown';
      setError(errorMessage);
      setIsLoading(false);
      onError?.(errorMessage);
      console.error('Markmap update error:', err);
    }
  }, [markmap, autoFit, onError, onDataChange]);

  // Fit to view
  const fitToView = useCallback(() => {
    if (markmap) {
      markmap.fit();
    }
  }, [markmap]);

  // Download SVG
  const downloadSVG = useCallback((filename: string = 'mindmap.svg') => {
    if (!containerRef.current) return;

    try {
      const svg = containerRef.current.querySelector('svg');
      if (!svg) throw new Error('SVG not found');

      // Clone the SVG to avoid modifying the original
      const clonedSvg = svg.cloneNode(true) as SVGElement;
      
      // Set proper dimensions
      const rect = svg.getBoundingClientRect();
      clonedSvg.setAttribute('width', rect.width.toString());
      clonedSvg.setAttribute('height', rect.height.toString());
      
      // Add styles inline
      const styleEl = document.createElement('style');
      styleEl.textContent = customStyles;
      clonedSvg.insertBefore(styleEl, clonedSvg.firstChild);

      // Create blob and download
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clonedSvg);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download SVG';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('SVG download error:', err);
    }
  }, [onError]);

  // Reset view to original state
  const resetView = useCallback(() => {
    if (markmap && currentData.current) {
      markmap.setData(currentData.current as Parameters<typeof markmap.setData>[0]);
      setTimeout(() => markmap.fit(), 100);
    }
  }, [markmap]);

  // Toggle toolbar visibility
  const toggleToolbar = useCallback(() => {
    setToolbarVisible(prev => !prev);
  }, []);

  // Validate markdown structure
  const validateMarkdown = useCallback((markdown: string) => {
    return validateMarkdownStructure(markdown);
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (markmap) {
      markmap.destroy();
    }
    if (toolbar) {
      // Toolbar cleanup - no detach method available
      // The toolbar will be removed when the DOM element is cleared
    }
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    if (toolbarRef.current) {
      toolbarRef.current.innerHTML = '';
    }
    cleanupStyles();
  }, [markmap, toolbar, cleanupStyles]);

  // Initialize on mount
  useEffect(() => {
    initializeMarkmap();
    
    return cleanup;
  }, [initializeMarkmap, cleanup]);

  // Handle toolbar visibility changes
  useEffect(() => {
    if (!isInitialized) return;

    cleanup();
    initializeMarkmap();
  }, [toolbarVisible, isInitialized, cleanup, initializeMarkmap]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (markmap && autoFit) {
        setTimeout(() => markmap.fit(), 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [markmap, autoFit]);

  return {
    containerRef,
    toolbarRef,
    markmap,
    toolbar,
    isLoading,
    error,
    updateMarkdown,
    fitToView,
    downloadSVG,
    resetView,
    toggleToolbar,
    validateMarkdown,
    isInitialized,
  };
}

export default useMarkmap;
