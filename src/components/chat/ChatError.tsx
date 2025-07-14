import React from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';

interface ChatErrorProps {
  error: string;
  onRetry: () => void;
}

export const ChatError: React.FC<ChatErrorProps> = ({ error, onRetry }) => {
  return (
    <div className="flex justify-center px-4 pb-4">
      <div className="max-w-md px-4 py-3 rounded-lg bg-[var(--evolve-warning)] border-2 border-dashed border-[var(--evolve-charcoal)] text-white">
        <div className="flex items-center space-x-2">
          <FiAlertCircle size={16} className="line-art-icon" />
          <span className="text-sm font-medium">{error}</span>
          <Button
            onClick={onRetry}
            variant="ghost"
            size="sm"
            className="ml-2 p-1 text-white hover:bg-white hover:text-[var(--evolve-warning)] border border-white rounded"
            title="Retry"
          >
            <FiRefreshCw size={14} className="line-art-icon" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatError;
