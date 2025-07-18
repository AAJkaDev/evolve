import React, { useState } from 'react';
import { 
  Edit3, 
  Copy, 
  RotateCcw, 
  ThumbsUp, 
  ThumbsDown, 
  Share2,
  Check 
} from 'lucide-react';

interface MessageControlsProps {
  isUser: boolean;
  message: string;
  turnIndex?: number;
  responseIndex?: number;
  totalResponses?: number;
  onRetry?: () => void;
  onEdit?: () => void;
  onCopy?: () => void;
  onShare?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
  className?: string;
}

export const MessageControls: React.FC<MessageControlsProps> = ({
  isUser,
  message,
  responseIndex = 0,
  totalResponses = 1,
  onRetry,
  onEdit,
  onCopy,
  onShare,
  onLike,
  onDislike,
  className = '',
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [likeState, setLikeState] = useState<'liked' | 'disliked' | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      onCopy?.();
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleLike = () => {
    setLikeState(prev => prev === 'liked' ? null : 'liked');
    onLike?.();
  };

  const handleDislike = () => {
    setLikeState(prev => prev === 'disliked' ? null : 'disliked');
    onDislike?.();
  };

  const handleShare = () => {
    onShare?.();
  };

  const handleEdit = () => {
    onEdit?.();
  };

  const handleRetry = () => {
    onRetry?.();
  };

  // Get base button styling based on message type
  const getButtonClass = (isActive?: boolean, activeClass?: string) => {
    const baseClass = "group p-1.5 rounded-md transition-colors duration-200";
    
    if (isActive && activeClass) {
      return `${baseClass} ${activeClass}`;
    }
    
    if (isUser) {
      return `${baseClass} hover:bg-white/10`;
    }
    
    return `${baseClass} hover:bg-gray-100`;
  };
  
  // Get icon styling based on message type
  const getIconClass = (isActive?: boolean, activeClass?: string) => {
    if (isActive && activeClass) {
      return activeClass;
    }
    
    if (isUser) {
      return "text-white/70 group-hover:text-white";
    }
    
    return "text-gray-500 group-hover:text-gray-700";
  };

  return (
    <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${className}`}>
      {/* Edit Button - Only for user messages */}
      {isUser && (
        <button
          onClick={handleEdit}
          className={getButtonClass()}
          title="Edit message"
        >
          <Edit3 size={14} className={getIconClass()} />
        </button>
      )}

      {/* Copy Button - For all messages */}
      <button
        onClick={handleCopy}
        className={getButtonClass()}
        title="Copy message"
      >
        {copySuccess ? (
          <Check size={14} className="text-green-500" />
        ) : (
          <Copy size={14} className={getIconClass()} />
        )}
      </button>

      {/* Retry Button - Only for AI messages */}
      {!isUser && (
        <button
          onClick={handleRetry}
          className={getButtonClass()}
          title={`Retry (${totalResponses > 1 ? `Try ${responseIndex + 1} of ${totalResponses}` : 'Generate new response'})`}
        >
          <RotateCcw size={14} className={getIconClass()} />
        </button>
      )}

      {/* Like Button - Only for AI messages */}
      {!isUser && (
        <button
          onClick={handleLike}
          className={getButtonClass(
            likeState === 'liked',
            'bg-green-50'
          )}
          title="Like response"
        >
          <ThumbsUp 
            size={14} 
            className={getIconClass(
              likeState === 'liked',
              'text-green-500'
            )} 
          />
        </button>
      )}

      {/* Dislike Button - Only for AI messages */}
      {!isUser && (
        <button
          onClick={handleDislike}
          className={getButtonClass(
            likeState === 'disliked',
            'bg-red-50'
          )}
          title="Dislike response"
        >
          <ThumbsDown 
            size={14} 
            className={getIconClass(
              likeState === 'disliked',
              'text-red-500'
            )} 
          />
        </button>
      )}

      {/* Share Button - For all messages */}
      <button
        onClick={handleShare}
        className={getButtonClass()}
        title="Share message"
      >
        <Share2 size={14} className={getIconClass()} />
      </button>

      {/* Response Counter - Only for AI messages with multiple responses */}
      {!isUser && totalResponses > 1 && (
        <div className={`ml-2 px-2 py-1 text-xs rounded-full ${
          isUser 
            ? 'text-white/80 bg-white/10' 
            : 'text-gray-500 bg-gray-100'
        }`}>
          {responseIndex + 1} of {totalResponses}
        </div>
      )}
    </div>
  );
};

export default MessageControls;
