import React from 'react';
import { Message } from '@/types';
import { formatTimestamp } from '@/utils';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div
      className={`flex ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 border-2 border-dashed rounded-lg shadow-sm ${
          message.role === 'user'
            ? 'bg-[#4285F4] text-white border-[#4285F4] shadow-blue-200/50'
            : 'bg-[#F8F8F4] text-[var(--evolve-charcoal)] border-[var(--evolve-charcoal)]/40 shadow-gray-200/30'
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed font-medium">{message.content}</p>
        <p className={`text-xs mt-2 ${
          message.role === 'user' ? 'text-white/80' : 'text-[var(--evolve-charcoal)]/60'
        }`}>
          {formatTimestamp(message.timestamp)}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
