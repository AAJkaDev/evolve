import React from 'react';
import ChatMessage from '@/components/chat/ChatMessage';
import { Message } from '@/types';

interface ChatMessagesProps {
  messages: Message[];
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  return (
    <div className="p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="text-center text-[var(--evolve-dark-gray)] mt-20">
          <p className="text-lg mb-2 text-[var(--evolve-charcoal)] font-medium">Welcome to Enzo Chat!</p>
          <p className="text-sm">Start a conversation by typing a message below.</p>
        </div>
      ) : (
        messages.map((message) => <ChatMessage key={message.id} message={message} />)
      )}
    </div>
  );
};

export default ChatMessages;

