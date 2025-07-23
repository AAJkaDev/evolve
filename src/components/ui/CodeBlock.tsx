import React, { useState } from 'react';
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
  
  return (
    <div className={`relative group rounded-lg overflow-hidden border-2 border-dashed border-gray-300 bg-white shadow-md ${className}`}>
      {/* Header with language and buttons */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-dashed border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            {detectedLanguage}
          </span>
          {fileName && (
            <span className="text-xs text-gray-500">
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
                ? 'bg-green-500 text-white border-green-500' 
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:text-blue-600'
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
              bg-white text-gray-700 border-2 border-dashed
              border-gray-300 hover:border-blue-500 
              hover:text-blue-600 transition-all duration-200
            "
          >
            <Download className="w-3 h-3" />
            <span>Download</span>
          </button>
        </div>
      </div>
      
      {/* Code Content */}
      <div className="relative">
        <pre className="m-0 p-4 text-sm leading-relaxed bg-transparent overflow-x-auto font-mono text-gray-800">
          <code>{cleanCode}</code>
        </pre>
      </div>
      
      {/* Feedback message */}
      {copiedText && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md">
          {copiedText}
        </div>
      )}
    </div>
  );
};

export default CodeBlock;
