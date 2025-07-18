import React, { useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { MarkdownMindMap } from './MarkdownMindMap';

interface MindMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  markdown: string;
  title?: string;
}

export function MindMapModal({
  isOpen,
  onClose,
  markdown,
  title = 'Full-Screen Mind Map'
}: MindMapModalProps) {

  const handleKeydown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeydown);
    } else {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeydown);
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [isOpen, handleKeydown]);


  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-[#F5F5EC]/90 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div 
        className="relative w-full h-full max-w-[95vw] max-h-[95vh] bg-white rounded-lg shadow-2xl border-2 border-dashed border-gray-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold hover:bg-red-600 transition-transform hover:scale-110"
        >
          &times;
        </button>

        <MarkdownMindMap 
          markdown={markdown} 
          height="100%" 
          showToolbar={true}
          autoFit={true}
          title={title}
          isFullscreen={true}
          className="h-full"
        />
      </div>
    </div>,
    document.body
  );
}

export default MindMapModal;
