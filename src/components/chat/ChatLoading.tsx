import React from 'react';

export const ChatLoading: React.FC = () => {
  return (
    <div className="flex justify-start px-4 pb-4">
      <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-[var(--evolve-secondary)] border-2 border-dashed border-[var(--evolve-charcoal)]">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-dashed border-[var(--evolve-charcoal)]"></div>
          <span className="text-[var(--evolve-charcoal)] font-medium">AI is thinking...</span>
        </div>
      </div>
    </div>
  );
};

export default ChatLoading;
