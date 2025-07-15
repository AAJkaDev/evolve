import { createGeminiService } from './gemini.service';
import { validateMessages, getErrorMessage } from '@/utils';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatMessageRequest {
  messages: ChatMessage[];
}

export interface ChatMessageResponse {
  message: string;
  timestamp: string;
}

export class ChatService {
  private static instance: ChatService;
  private geminiService: ReturnType<typeof createGeminiService> | null = null;
  
  private constructor() {
    // Only initialize Gemini service on server-side
    if (typeof window === 'undefined' && process.env.GEMINI_API_KEY) {
      try {
        this.geminiService = createGeminiService();
      } catch (error) {
        console.warn('Failed to initialize Gemini service:', error);
      }
    }
  }
  
  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }
  
  /**
   * Send a non-streaming message (uses API route)
   */
  async sendMessage(messages: ChatMessage[]): Promise<ChatMessageResponse> {
    return this.sendMessageViaAPI(messages);
  }

  /**
   * Send a streaming message (uses API route)
   */
  async sendStreamedMessage(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void
  ): Promise<void> {
    return this.sendStreamedMessageViaAPI(messages, onChunk);
  }

  /**
   * Send a non-streaming message using API route
   */
  async sendMessageViaAPI(messages: ChatMessage[]): Promise<ChatMessageResponse> {
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

  /**
   * Send a streaming message using API route
   */
  async sendStreamedMessageViaAPI(
    messages: ChatMessage[],
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

  /**
   * Test the connection to Gemini API (server-side only)
   */
  async testConnection(): Promise<boolean> {
    if (!this.geminiService) {
      console.warn('ChatService: Gemini service not available (client-side)');
      return false;
    }
    
    try {
      return await this.geminiService.testConnection();
    } catch (error) {
      console.error('ChatService: Connection test failed:', error);
      return false;
    }
  }

  /**
   * Get information about the current AI model (server-side only)
   */
  getModelInfo(): { provider: string; model: string; apiKey: string } {
    if (!this.geminiService) {
      return {
        provider: 'Google Gemini',
        model: 'gemini-1.5-flash',
        apiKey: 'Not available (client-side)'
      };
    }
    
    const geminiInfo = this.geminiService.getModelInfo();
    return {
      provider: 'Google Gemini',
      model: geminiInfo.name,
      apiKey: geminiInfo.apiKey
    };
  }

}

export const chatService = ChatService.getInstance();
