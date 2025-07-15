import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Download, Check } from 'lucide-react';
import { copyToClipboard, downloadFile, getFileExtension, detectLanguage } from '@/utils/textFormatter';

interface CodeBlockProps {
  code: string;
  language?: string;
  theme?: 'light' | 'dark';
  showLineNumbers?: boolean;
  fileName?: string;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language: providedLanguage,
  theme = 'light',
  showLineNumbers = true,
  fileName,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  
  const detectedLanguage = providedLanguage || detectLanguage(code);
  const cleanCode = code.trim();
  
  const handleCopy = async () => {
    const success = await copyToClipboard(cleanCode);
    if (success) {
      setCopied(true);
      setCopiedText('Copied!');
      setTimeout(() => {
        setCopied(false);
        setCopiedText('');
      }, 2000);
    } else {
      setCopiedText('Failed to copy');
      setTimeout(() => setCopiedText(''), 2000);
    }
  };
  
  const handleDownload = () => {
    const extension = getFileExtension(detectedLanguage);
    const filename = fileName || `code_snippet.${extension}`;
    downloadFile(cleanCode, filename);
  };
  
  const codeStyle = theme === 'dark' ? oneDark : oneLight;
  
  return (
    <div className={`relative group rounded-lg overflow-hidden border-2 border-dashed border-[var(--evolve-charcoal)]/40 bg-[var(--evolve-paper)] shadow-md ${className}`}>
      {/* Header with language and buttons */}
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--evolve-charcoal)]/5 border-b border-dashed border-[var(--evolve-charcoal)]/20">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--evolve-charcoal)]/80 uppercase tracking-wide">
            {detectedLanguage}
          </span>
          {fileName && (
            <span className="text-xs text-[var(--evolve-charcoal)]/60">
              {fileName}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={copied}
            className={`
              flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium
              transition-all duration-200 border-2 border-dashed
              ${copied 
                ? 'bg-[var(--evolve-mint)] text-white border-[var(--evolve-mint)]' 
                : 'bg-white text-[var(--evolve-charcoal)] border-[var(--evolve-charcoal)]/30 hover:border-[var(--evolve-blue)] hover:text-[var(--evolve-blue)]'
              }
            `}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
          
          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="
              flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium
              bg-white text-[var(--evolve-charcoal)] border-2 border-dashed
              border-[var(--evolve-charcoal)]/30 hover:border-[var(--evolve-blue)] 
              hover:text-[var(--evolve-blue)] transition-all duration-200
            "
          >
            <Download className="w-3 h-3" />
            <span>Download</span>
          </button>
        </div>
      </div>
      
      {/* Code Content */}
      <div className="relative">
        <SyntaxHighlighter
          language={detectedLanguage}
          style={codeStyle}
          showLineNumbers={showLineNumbers}
          wrapLines={true}
          wrapLongLines={true}
          customStyle={{
            margin: 0,
            padding: '16px',
            fontSize: '14px',
            lineHeight: '1.4',
            backgroundColor: 'transparent',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
          }}
          lineNumberStyle={{
            color: 'var(--evolve-charcoal)',
            opacity: 0.5,
            fontSize: '12px',
            paddingRight: '12px',
          }}
        >
          {cleanCode}
        </SyntaxHighlighter>
      </div>
      
      {/* Feedback message */}
      {copiedText && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-[var(--evolve-charcoal)] text-white text-xs rounded-md">
          {copiedText}
        </div>
      )}
    </div>
  );
};

export default CodeBlock;
