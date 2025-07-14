import { OpenRouterMessage } from '@/types';
import { validateMessages, getErrorMessage } from '@/utils';

export interface ChatMessageRequest {
  messages: OpenRouterMessage[];
}

export interface ChatMessageResponse {
  message: string;
  timestamp: string;
}

export class ChatService {
  private static instance: ChatService;
  
  private constructor() {}
  
  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }
  
  async sendMessage(messages: OpenRouterMessage[]): Promise<ChatMessageResponse> {
    if (!validateMessages(messages)) {
      throw new Error('Invalid messages format');
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          if (errorData.details) {
            errorMessage += ` (${errorData.details})`;
          }
        } catch {
          // If we can't parse the error response, use the default message
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return {
        message: data.message,
        timestamp: data.timestamp
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async sendStreamedMessage(
    messages: OpenRouterMessage[],
    onChunk: (chunk: string) => void
  ): Promise<void> {
    if (!validateMessages(messages)) {
      throw new Error('Invalid messages format');
    }

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              break;
            }
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.chunk) {
                onChunk(parsed.chunk);
              } else if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (e) {
              console.warn('Failed to parse streaming data:', e);
            }
          }
        }
      }
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }
}

export const chatService = ChatService.getInstance();
