"use client";

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';
import MermaidDiagram from '../chat/MermaidDiagram';
import DiagramModal from '../chat/DiagramModal';

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

  // --- GUARDIAN LOGIC START ---
  // This logic parses the message BEFORE it's rendered.
  const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/;
  const match = content.match(mermaidRegex);

  // Case 1: A valid mermaid block is found.
  if (match) {
    const mermaidCode = match[1];
    // Split the content by the entire mermaid block to find text before it.
    const parts = content.split(match[0]);
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
        {/* Render the diagram part */}
        <MermaidDiagram chart={mermaidCode} onFullscreen={() => handleFullscreen(mermaidCode)} />
        {isModalOpen && <DiagramModal chart={modalChart} onClose={() => setIsModalOpen(false)} />}
      </div>
    );
  }
  // --- GUARDIAN LOGIC END ---

  // Case 2: No mermaid block found, render as a normal message.
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
};

export default FormattedMessage;
