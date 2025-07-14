import { useState, useCallback } from 'react';
import { chatService } from '@/services';
import { Message, UseChatOptions, UseChatReturn } from '@/types';


export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { initialMessages = [], stream = false } = options;
  
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string>('');

  const generateId = () => crypto.randomUUID();

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setLastUserMessage(content.trim());

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      if (stream) {
        // Create assistant message for streaming
        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        const apiMessages = [...messages, userMessage].map(msg => ({
          role: msg.role,
          content: msg.content,
        }));
        
        await chatService.sendStreamedMessage(apiMessages, (chunk) => {
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, content: msg.content + chunk }
              : msg
          ));
        });
      } else {
        const apiMessages = [...messages, userMessage].map(msg => ({
          role: msg.role,
          content: msg.content,
        }));
        
        const { message, timestamp } = await chatService.sendMessage(apiMessages);
        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: message,
          timestamp: new Date(timestamp),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, stream]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const retry = useCallback(async () => {
    if (lastUserMessage && !isLoading) {
      await sendMessage(lastUserMessage);
    }
  }, [lastUserMessage, isLoading, sendMessage]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    retry,
  };
}
