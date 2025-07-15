import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import CodeBlock from './CodeBlock';
import type { Components } from 'react-markdown';

interface FormattedMessageProps {
  content: string;
  className?: string;
}

const FormattedMessage: React.FC<FormattedMessageProps> = ({ content, className = '' }) => {
  const components: Components = {
    // Custom code block renderer
    code: ({ node, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : undefined;
      
      // Determine if this is inline or block code
      const hasLanguageClass = Boolean(match);
      const parentIsPreElement = (node as unknown as { parent?: { tagName?: string } })?.parent?.tagName === 'pre';
      const isBlockCode = hasLanguageClass || parentIsPreElement;
      
      if (isBlockCode) {
        return (
          <CodeBlock
            code={String(children).replace(/\n$/, '')}
            language={language}
            className="my-4"
          />
        );
      }
      
      // Inline code
      return (
        <code 
          className="px-2 py-1 bg-[var(--evolve-charcoal)]/10 rounded text-sm font-mono text-[var(--evolve-charcoal)] border border-dashed border-[var(--evolve-charcoal)]/20"
          {...props}
        >
          {children}
        </code>
      );
    },
    
    // Custom pre renderer for code blocks
    pre: ({ children, ...props }) => {
      // Check if children contain a code element
      if (React.isValidElement(children) && children.type === 'code') {
        const codeElement = children;
        const codeProps = codeElement.props as { className?: string; children?: React.ReactNode };
        
        // Extract language from className (e.g., "language-javascript")
        const className = codeProps.className || '';
        const languageMatch = /language-(\w+)/.exec(className);
        const language = languageMatch ? languageMatch[1] : undefined;
        
        // Extract code content from children
        const codeContent = String(codeProps.children).replace(/\n$/, '');
        
        return (
          <CodeBlock
            code={codeContent}
            language={language}
            className="my-4"
          />
        );
      }
      
      // Handle nested code elements (in case of multiple children)
      if (React.Children.count(children) > 0) {
        const codeChild = React.Children.toArray(children).find(
          (child) => React.isValidElement(child) && child.type === 'code'
        );
        
        if (codeChild && React.isValidElement(codeChild)) {
          const codeProps = codeChild.props as { className?: string; children?: React.ReactNode };
          const className = codeProps.className || '';
          const languageMatch = /language-(\w+)/.exec(className);
          const language = languageMatch ? languageMatch[1] : undefined;
          const codeContent = String(codeProps.children).replace(/\n$/, '');
          
          return (
            <CodeBlock
              code={codeContent}
              language={language}
              className="my-4"
            />
          );
        }
      }
      
      // Fallback to regular pre element for non-code content
      return <pre {...props}>{children}</pre>;
    },
    
    // Enhanced headings with EVOLVE styling
    h1: ({ children, ...props }) => (
      <h1 className="text-2xl font-bold text-[var(--evolve-charcoal)] mb-4 mt-6 border-b-2 border-dashed border-[var(--evolve-charcoal)]/20 pb-2" {...props}>
        {children}
      </h1>
    ),
    
    h2: ({ children, ...props }) => (
      <h2 className="text-xl font-semibold text-[var(--evolve-charcoal)] mb-3 mt-5" {...props}>
        {children}
      </h2>
    ),
    
    h3: ({ children, ...props }) => (
      <h3 className="text-lg font-semibold text-[var(--evolve-charcoal)] mb-2 mt-4" {...props}>
        {children}
      </h3>
    ),
    
    h4: ({ children, ...props }) => (
      <h4 className="text-base font-medium text-[var(--evolve-charcoal)] mb-2 mt-3" {...props}>
        {children}
      </h4>
    ),
    
    h5: ({ children, ...props }) => (
      <h5 className="text-sm font-medium text-[var(--evolve-charcoal)] mb-1 mt-2" {...props}>
        {children}
      </h5>
    ),
    
    h6: ({ children, ...props }) => (
      <h6 className="text-xs font-medium text-[var(--evolve-charcoal)] mb-1 mt-2" {...props}>
        {children}
      </h6>
    ),
    
    // Enhanced paragraphs
    p: ({ children, ...props }) => (
      <p className="text-[var(--evolve-charcoal)] mb-4 leading-relaxed" {...props}>
        {children}
      </p>
    ),
    
    // Enhanced lists
    ul: ({ children, ...props }) => (
      <ul className="list-disc list-inside mb-4 space-y-1 text-[var(--evolve-charcoal)] pl-4" {...props}>
        {children}
      </ul>
    ),
    
    ol: ({ children, ...props }) => (
      <ol className="list-decimal list-inside mb-4 space-y-1 text-[var(--evolve-charcoal)] pl-4" {...props}>
        {children}
      </ol>
    ),
    
    li: ({ children, ...props }) => (
      <li className="mb-1" {...props}>
        {children}
      </li>
    ),
    
    // Enhanced blockquotes
    blockquote: ({ children, ...props }) => (
      <blockquote className="border-l-4 border-[var(--evolve-blue)] bg-[var(--evolve-blue)]/5 pl-4 py-2 mb-4 italic text-[var(--evolve-charcoal)]" {...props}>
        {children}
      </blockquote>
    ),
    
    // Enhanced tables
    table: ({ children, ...props }) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border-2 border-dashed border-[var(--evolve-charcoal)]/30 rounded-lg" {...props}>
          {children}
        </table>
      </div>
    ),
    
    thead: ({ children, ...props }) => (
      <thead className="bg-[var(--evolve-charcoal)]/5" {...props}>
        {children}
      </thead>
    ),
    
    tbody: ({ children, ...props }) => (
      <tbody {...props}>
        {children}
      </tbody>
    ),
    
    tr: ({ children, ...props }) => (
      <tr className="border-b border-dashed border-[var(--evolve-charcoal)]/20" {...props}>
        {children}
      </tr>
    ),
    
    th: ({ children, ...props }) => (
      <th className="px-4 py-2 text-left font-semibold text-[var(--evolve-charcoal)] border-r border-dashed border-[var(--evolve-charcoal)]/20 last:border-r-0" {...props}>
        {children}
      </th>
    ),
    
    td: ({ children, ...props }) => (
      <td className="px-4 py-2 text-[var(--evolve-charcoal)] border-r border-dashed border-[var(--evolve-charcoal)]/20 last:border-r-0" {...props}>
        {children}
      </td>
    ),
    
    // Enhanced links
    a: ({ children, href, ...props }) => (
      <a 
        href={href} 
        className="text-[var(--evolve-blue)] hover:text-[var(--evolve-blue)]/80 underline decoration-dashed underline-offset-2 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    ),
    
    // Enhanced emphasis
    em: ({ children, ...props }) => (
      <em className="italic text-[var(--evolve-charcoal)]" {...props}>
        {children}
      </em>
    ),
    
    // Enhanced strong
    strong: ({ children, ...props }) => (
      <strong className="font-bold text-[var(--evolve-charcoal)]" {...props}>
        {children}
      </strong>
    ),
    
    // Enhanced horizontal rule
    hr: ({ ...props }) => (
      <hr className="border-0 border-t-2 border-dashed border-[var(--evolve-charcoal)]/30 my-6" {...props} />
    ),
    
    // Enhanced images
    img: ({ src, alt }) => (
      <Image 
        src={typeof src === 'string' ? src : ''} 
        alt={alt || ''} 
        width={800}
        height={600}
        className="max-w-full h-auto rounded-lg border-2 border-dashed border-[var(--evolve-charcoal)]/30 my-4"
        unoptimized
      />
    ),
  };

  return (
    <div className={`formatted-message ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default FormattedMessage;
