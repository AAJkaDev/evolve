import React from 'react';
import { FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
  onClearMessages: () => void;
  streamEnabled?: boolean;
  onStreamToggle?: (enabled: boolean) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  title = "Chat with Enzo",
  subtitle = "Powered by OpenRouter API with smart fallback",
  onClearMessages,
  streamEnabled = false,
  onStreamToggle
}) => {
  const router = useRouter();
  
  const handleBackClick = () => {
    router.push('/dashboard');
  };
  return (
    <div className="flex justify-center px-4 py-3">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-3">
            {/* Back Button */}
            <Button
              onClick={handleBackClick}
              variant="ghost"
              size="sm"
              className="p-2 text-[var(--evolve-dark-gray)] hover:text-[var(--evolve-charcoal)] hover:bg-[var(--evolve-paper)] rounded-full"
              title="Back to dashboard"
            >
              <FiArrowLeft size={16} className="line-art-icon" />
            </Button>
            
            {/* Title and Subtitle */}
            <div className="flex flex-col">
              <h1 className="text-xl font-medium text-[var(--evolve-charcoal)]">{title}</h1>
              <p className="text-xs text-[var(--evolve-dark-gray)] mt-0.5 opacity-75">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {onStreamToggle && (
              <label className="flex items-center space-x-2 text-sm text-[var(--evolve-dark-gray)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={streamEnabled}
                  onChange={(e) => onStreamToggle(e.target.checked)}
                  className="w-4 h-4 text-[var(--evolve-primary)] border border-[var(--evolve-charcoal)] rounded focus:ring-[var(--evolve-primary)] focus:ring-1"
                />
                <span className="text-xs">Stream</span>
              </label>
            )}
            <Button
              onClick={onClearMessages}
              variant="ghost"
              size="sm"
              className="p-2 text-[var(--evolve-dark-gray)] hover:text-[var(--evolve-warning)] hover:bg-[var(--evolve-paper)] rounded-full"
              title="Clear messages"
            >
              <FiTrash2 size={16} className="line-art-icon" />
            </Button>
          </div>
        </div>
        <div className="h-px bg-[var(--evolve-charcoal)] opacity-20 mt-2"></div>
      </div>
    </div>
  );
};

export default ChatHeader;
