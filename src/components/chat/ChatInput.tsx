import React, { useState } from 'react';
import { FiSend } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
  placeholder = "Type your message..."
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="p-4 flex justify-center">
      <div className="w-full max-w-4xl">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            fullWidth
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            isLoading={isLoading}
            size="md"
            variant="primary"
          >
            <FiSend size={18} className="line-art-icon" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
