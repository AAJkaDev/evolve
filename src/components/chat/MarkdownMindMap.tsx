import React, { useRef, useCallback } from 'react';
import { MindMapRenderer, MindMapRendererRef } from '@/components/ui/MindMapRenderer';

interface MarkdownMindMapProps {
  markdown: string;
  className?: string;
  height?: string;
  showToolbar?: boolean;
  autoFit?: boolean;
  onError?: (error: string) => void;
  onFullscreen?: () => void;
  title?: string;
  isFullscreen?: boolean;
}

export function MarkdownMindMap({
  markdown,
  onFullscreen,
  isFullscreen = false
}: MarkdownMindMapProps) {
  const rendererRef = useRef<MindMapRendererRef>(null);
  
  // Handle copy markdown
  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(markdown);
    // You can add a toast notification here for better UX
  }, [markdown]);

  // Handle download
  const handleDownload = useCallback(() => {
    rendererRef.current?.download();
  }, []);
  
  return (
    <div className="flex flex-col h-full">
      <div className={`w-full flex-grow overflow-hidden ${isFullscreen ? 'h-full' : 'h-[500px]'}`}>
        <MindMapRenderer ref={rendererRef} markdown={markdown} />
        
        {!markdown?.trim() && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm">
            <div className="text-center p-6">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Content
              </h3>
              <p className="text-sm text-gray-600">
                Provide markdown content to generate a mind map
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* --- BUTTONS UI START --- */}
      <div className="flex-shrink-0 bg-gray-50/50 p-2 border-t border-dashed border-gray-300 flex items-center justify-end gap-2">
        {!isFullscreen && (
          <button 
            onClick={onFullscreen} 
            className="bg-gray-700 text-white text-xs font-semibold py-1.5 px-3 rounded-md hover:bg-gray-600 transition-colors"
          >
            Fullscreen
          </button>
        )}
        <button 
          onClick={handleCopyCode}
          className="bg-blue-500 text-white text-xs font-semibold py-1.5 px-3 rounded-md hover:bg-blue-600 transition-colors"
        >
          Copy Code
        </button>
        <button 
          onClick={handleDownload}
          className="bg-green-500 text-white text-xs font-semibold py-1.5 px-3 rounded-md hover:bg-green-600 transition-colors"
        >
          Download
        </button>
      </div>
      {/* --- BUTTONS UI END --- */}
    </div>
  );
}

export default MarkdownMindMap;
