import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Message } from '@/types';
import { formatTimestamp } from '@/utils';
import { FormattedMessage } from '@/components';
import { MarkdownMindMap } from './MarkdownMindMap';
import MindMapModal from './MindMapModal';
import MessageControls from './MessageControls';
import MediaSearchResults from './MediaSearchResults';
import { Check, X } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  turnIndex?: number;
  responseIndex?: number;
  totalResponses?: number;
  onRetry?: () => void;
  onEdit?: (newContent: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  turnIndex, 
  responseIndex, 
  totalResponses, 
  onRetry, 
  onEdit 
}) => {
  const [isMindMapOpen, setIsMindMapOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Function to detect if a message is a mind map
  const isMindMap = useCallback((content: string) => {
    return content.trim().startsWith('# Mind Map');
  }, []);

  // Function to detect if a message contains media search results
  const isMediaSearchResult = useCallback((content: string) => {
    try {
      const parsed = JSON.parse(content);
      return parsed.type === 'media_search_results';
    } catch {
      return false;
    }
  }, []);

  // Function to parse media search results
  const parseMediaSearchResult = useCallback((content: string) => {
    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  }, []);

  // Handle copy functionality
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  }, [message.content]);

  // Handle edit functionality
  const handleEditClick = useCallback(() => {
    setIsEditing(true);
    setEditContent(message.content);
  }, [message.content]);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 200; // Maximum height before scrolling
      
      if (scrollHeight <= maxHeight) {
        textarea.style.height = `${scrollHeight}px`;
        textarea.style.overflowY = 'hidden';
      } else {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = 'auto';
      }
    }
  }, []);

  // Handle textarea content change
  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditContent(e.target.value);
    adjustTextareaHeight();
  }, [adjustTextareaHeight]);

  // Handle save edit
  const handleSaveEdit = useCallback(() => {
    if (editContent.trim() && editContent.trim() !== message.content) {
      onEdit?.(editContent.trim());
    }
    setIsEditing(false);
  }, [editContent, message.content, onEdit]);

  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditContent(message.content);
  }, [message.content]);

  // Handle keydown events in textarea
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  }, [handleSaveEdit, handleCancelEdit]);

  // Effect to adjust textarea height when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      adjustTextareaHeight();
    }
  }, [isEditing, adjustTextareaHeight]);

  // Handle share functionality (placeholder)
  const handleShare = useCallback(() => {
    // Placeholder for future share functionality
    console.log('Share functionality not yet implemented');
  }, []);

  // Handle like functionality (placeholder)
  const handleLike = useCallback(() => {
    // Placeholder for future like functionality
    console.log('Like functionality not yet implemented');
  }, []);

  // Handle dislike functionality (placeholder)
  const handleDislike = useCallback(() => {
    // Placeholder for future dislike functionality
    console.log('Dislike functionality not yet implemented');
  }, []);

  return (
    <div
      className={`flex group ${
        message.role === 'user' ? 'justify-start' : 'justify-start'
      }`}
    >
      <div
        className={`relative px-4 py-3 border-2 border-dashed rounded-lg shadow-sm w-full ${
          message.role === 'user'
            ? 'bg-[#4285F4] text-white border-[#4285F4] shadow-blue-200/50'
            : 'bg-[#F8F8F4] text-[var(--evolve-charcoal)] border-[var(--evolve-charcoal)]/40 shadow-gray-200/30'
        }`}
      >
        <div className="message-content">
          {message.role === 'user' ? (
            isEditing ? (
              // Edit mode for user messages - seamless in-place editing
              <div className="flex items-start gap-3">
                <textarea
                  ref={textareaRef}
                  value={editContent}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-white placeholder-white/50 border-none outline-none resize-none font-medium leading-relaxed"
                  placeholder="Edit your message..."
                  autoFocus
                  style={{
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    lineHeight: 'inherit',
                  }}
                />
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={handleSaveEdit}
                    className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-200"
                    title="Save changes (Enter)"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-200"
                    title="Cancel changes (Esc)"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              // Normal display for user messages
              <p className="whitespace-pre-wrap leading-relaxed font-medium text-white">
                {message.content}
              </p>
            )
          ) : (
            // AI message content
            isMindMap(message.content) ? (
              <>
                <MarkdownMindMap 
                  markdown={message.content} 
                  onFullscreen={() => setIsMindMapOpen(true)}
                  className="ai-message-content"
                  height="200px"
                />
                <MindMapModal 
                  isOpen={isMindMapOpen} 
                  onClose={() => setIsMindMapOpen(false)} 
                  markdown={message.content}
                />
              </>
            ) : isMediaSearchResult(message.content) ? (
              // Media search results
              (() => {
                const mediaData = parseMediaSearchResult(message.content);
                return mediaData ? (
                  <MediaSearchResults
                    searchType={mediaData.searchType}
                    query={mediaData.query}
                    results={mediaData.results}
                  />
                ) : (
                  <FormattedMessage 
                    content={message.content} 
                    className="ai-message-content"
                  />
                );
              })()
            ) : (
              <FormattedMessage 
                content={message.content} 
                className="ai-message-content"
              />
            )
          )}
        </div>
        
        {/* Message Controls */}
        {!isEditing && (
          <div className="flex items-center justify-between mt-2">
            <p className={`text-xs ${
              message.role === 'user' ? 'text-white/80' : 'text-[var(--evolve-charcoal)]/60'
            }`}>
              {formatTimestamp(message.timestamp)}
            </p>
            
            <MessageControls
              isUser={message.role === 'user'}
              message={message.content}
              turnIndex={turnIndex}
              responseIndex={responseIndex}
              totalResponses={totalResponses}
              onRetry={onRetry}
              onEdit={handleEditClick}
              onCopy={handleCopy}
              onShare={handleShare}
              onLike={handleLike}
              onDislike={handleDislike}
              isMediaSearchResult={isMediaSearchResult(message.content)}
            />
          </div>
        )}
        
        {/* Show timestamp when editing */}
        {isEditing && (
          <p className="text-xs mt-2 text-white/80">
            {formatTimestamp(message.timestamp)} • Press Enter to save, Esc to cancel
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
