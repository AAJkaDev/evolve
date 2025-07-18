"use client";

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';
import MermaidDiagram from '../chat/MermaidDiagram';
import DiagramModal from '../chat/DiagramModal';
import { MarkdownMindMap } from '../chat/MarkdownMindMap';

interface FormattedMessageProps {
  content: string;
  className?: string;
}

const FormattedMessage = ({ content, className }: FormattedMessageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalChart, setModalChart] = useState("");

  const handleFullscreen = (chart: string) => {
    setModalChart(chart);
    setIsModalOpen(true);
  };

  // --- PRIORITY LOGIC START ---
  // PRIORITY 1: Check for Mind Map content first (absolute priority)
  // Mind Map content is identified by starting with '# Mind Map' pattern
  if (content.trim().startsWith('# Mind Map') || content.includes('# Mind Map')) {
    // This is Mind Map content - render with MarkdownMindMap component
    return (
      <div className={`flex flex-col gap-4 ${className || ''}`}>
        <MarkdownMindMap 
          markdown={content}
          height="500px"
          showToolbar={true}
          autoFit={true}
          title="Mind Map"
          className="border-2 border-blue-200 rounded-lg"
        />
      </div>
    );
  }

  // PRIORITY 2: Check for Mermaid diagrams (only if not Mind Map)
  const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/;
  const mermaidMatch = content.match(mermaidRegex);

  if (mermaidMatch) {
    const mermaidCode = mermaidMatch[1];
    // Split the content by the entire mermaid block to find text before it
    const parts = content.split(mermaidMatch[0]);
    const textContent = parts[0].trim();

    return (
      <div className={`flex flex-col gap-4 ${className || ''}`}>
        {/* Render the text part only if it exists */}
        {textContent && (
          <ReactMarkdown
            components={{
              code: ({ className, children, ...props }) => {
                const languageMatch = /language-(\w+)/.exec(className || '');
                // Block code has a language class, inline code doesn't
                return languageMatch ? (
                  <CodeBlock
                    language={languageMatch[1]}
                    code={String(children).replace(/\n$/, '')}
                    {...props}
                  />
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {textContent.replace("---", "")}
          </ReactMarkdown>
        )}
        {/* Render the Mermaid diagram */}
        <MermaidDiagram chart={mermaidCode} onFullscreen={() => handleFullscreen(mermaidCode)} />
        {isModalOpen && <DiagramModal chart={modalChart} onClose={() => setIsModalOpen(false)} />}
      </div>
    );
  }

  // PRIORITY 3: Default case - regular markdown content
  return (
    <div className={className || ''}>
      <ReactMarkdown
        components={{
          code({ className, children, ...props }) {
            const languageMatch = /language-(\w+)/.exec(className || '');
            // Block code has a language class, inline code doesn't
            return languageMatch ? (
              <CodeBlock
                language={languageMatch[1]}
                code={String(children).replace(/\n$/, '')}
                {...props}
              />
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
  // --- PRIORITY LOGIC END ---
};

export default FormattedMessage;
