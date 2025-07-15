
// Utility functions for text formatting and processing

export const detectLanguage = (code: string): string => {
  const trimmed = code.trim();
  
  // JavaScript/TypeScript patterns
  if (trimmed.includes('function') || trimmed.includes('const') || trimmed.includes('let') || trimmed.includes('var')) {
    if (trimmed.includes('interface') || trimmed.includes('type') || trimmed.includes(': string') || trimmed.includes(': number')) {
      return 'typescript';
    }
    return 'javascript';
  }
  
  // Python patterns
  if (trimmed.includes('def ') || trimmed.includes('import ') || trimmed.includes('from ') || trimmed.includes('print(')) {
    return 'python';
  }
  
  // Java patterns
  if (trimmed.includes('public class') || trimmed.includes('public static void') || trimmed.includes('import java.')) {
    return 'java';
  }
  
  // C++ patterns
  if (trimmed.includes('#include') || trimmed.includes('iostream') || trimmed.includes('std::')) {
    return 'cpp';
  }
  
  // C patterns
  if (trimmed.includes('#include') && trimmed.includes('stdio.h')) {
    return 'c';
  }
  
  // CSS patterns
  if (trimmed.includes('{') && trimmed.includes('}') && trimmed.includes(':') && !trimmed.includes('function')) {
    return 'css';
  }
  
  // HTML patterns
  if (trimmed.includes('<') && trimmed.includes('>') && trimmed.includes('</')) {
    return 'html';
  }
  
  // SQL patterns
  if (trimmed.includes('SELECT') || trimmed.includes('INSERT') || trimmed.includes('UPDATE') || trimmed.includes('DELETE')) {
    return 'sql';
  }
  
  // JSON patterns
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // Not valid JSON
    }
  }
  
  // Bash/Shell patterns
  if (trimmed.includes('#!/bin/bash') || trimmed.includes('#!/bin/sh') || trimmed.includes('echo ')) {
    return 'bash';
  }
  
  return 'text';
};

export const getFileExtension = (language: string): string => {
  const extensions: { [key: string]: string } = {
    javascript: 'js',
    typescript: 'ts',
    python: 'py',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    css: 'css',
    html: 'html',
    sql: 'sql',
    json: 'json',
    bash: 'sh',
    shell: 'sh',
    text: 'txt',
  };
  
  return extensions[language] || 'txt';
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text to clipboard:', err);
    return false;
  }
};

export const downloadFile = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const formatText = (text: string): string => {
  // Clean up text formatting
  return text
    .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
    .replace(/^\s+|\s+$/g, '') // Trim whitespace
    .replace(/\t/g, '  '); // Replace tabs with spaces
};

export const extractCodeBlocks = (text: string): Array<{ language: string; code: string; index: number }> => {
  const codeBlocks: Array<{ language: string; code: string; index: number }> = [];
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const language = match[1] || detectLanguage(match[2]);
    const code = match[2].trim();
    codeBlocks.push({
      language,
      code,
      index: match.index
    });
  }
  
  return codeBlocks;
};

export const processTextForDisplay = (text: string): string => {
  // Process text for better display
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
    .replace(/`([^`]+)`/g, '<code>$1</code>') // Inline code
    .replace(/\n/g, '<br>'); // Line breaks
};

export const isCodeBlock = (text: string): boolean => {
  return text.includes('```') || text.includes('<code>') || text.includes('function') || text.includes('class');
};

export const cleanCodeBlock = (code: string): string => {
  return code
    .replace(/^```[\w]*\n?/, '') // Remove opening code fence
    .replace(/\n?```$/, '') // Remove closing code fence
    .trim();
};
