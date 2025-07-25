import { createLLMRouter } from './llm-router.service';
import { createGeminiService } from './gemini.service';
import { validateMessages, getErrorMessage } from '@/utils';
import { ChatMessage, ChatRequest, ChatResponse } from '@/types/chat';

// Legacy interface for backward compatibility
export interface ChatMessageRequest {
  messages: ChatMessage[];
  mode?: 'default' | 'markmap' | 'standard' | 'socratic';
}

export interface ChatMessageResponse {
  message: string;
  timestamp: string;
}

export class ChatService {
  private static instance: ChatService;
  private llmRouter: ReturnType<typeof createLLMRouter> | null = null;
  private geminiService: ReturnType<typeof createGeminiService> | null = null;
  
  private constructor() {
    // Initialize services on server-side
    if (typeof window === 'undefined') {
      try {
        this.llmRouter = createLLMRouter();
      } catch (error) {
        console.warn('Failed to initialize LLM router:', error);
      }
      
      // Keep Gemini service for legacy compatibility
      if (process.env.GEMINI_API_KEY) {
        try {
          this.geminiService = createGeminiService();
        } catch (error) {
          console.warn('Failed to initialize Gemini service:', error);
        }
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
  async sendMessage(messages: ChatMessage[], toolMode?: 'default' | 'markmap', abortSignal?: AbortSignal): Promise<ChatMessageResponse> {
    return this.sendMessageViaAPI(messages, toolMode, abortSignal);
  }

  /**
   * Send a streaming message (uses API route)
   */
  async sendStreamedMessage(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    toolMode?: 'default' | 'markmap',
    abortSignal?: AbortSignal
  ): Promise<void> {
    return this.sendStreamedMessageViaAPI(messages, onChunk, toolMode, abortSignal);
  }

  /**
   * Send a chat request with mode support (new unified interface)
   */
  async sendChatRequest(request: ChatRequest, abortSignal?: AbortSignal): Promise<ChatResponse> {
    if (!validateMessages(request.messages)) {
      throw new Error('Invalid messages format');
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: abortSignal,
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
   * Send a streaming chat request with mode support (new unified interface)
   */
  async sendStreamingChatRequest(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    abortSignal?: AbortSignal
  ): Promise<void> {
    if (!validateMessages(request.messages)) {
      throw new Error('Invalid messages format');
    }

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: abortSignal,
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
   * Send a non-streaming message using API route
   */
  async sendMessageViaAPI(messages: ChatMessage[], toolMode?: 'default' | 'markmap', abortSignal?: AbortSignal): Promise<ChatMessageResponse> {
    if (!validateMessages(messages)) {
      throw new Error('Invalid messages format');
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages, mode: toolMode || 'default' }),
        signal: abortSignal,
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
    onChunk: (chunk: string) => void,
    toolMode?: 'default' | 'markmap',
    abortSignal?: AbortSignal
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
        body: JSON.stringify({ messages, mode: toolMode || 'default' }),
        signal: abortSignal,
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
   * Test the connection to LLM services (server-side only)
   */
  async testConnection(): Promise<boolean> {
    if (!this.llmRouter) {
      console.warn('ChatService: LLM router not available (client-side)');
      return false;
    }
    
    try {
      const results = await this.llmRouter.testConnections();
      return results.groq || results.gemini;
    } catch (error) {
      console.error('ChatService: Connection test failed:', error);
      return false;
    }
  }

  /**
   * Get information about the current AI model (server-side only)
   */
  getModelInfo(): { provider: string; model: string; apiKey: string; fallbackAvailable?: boolean } {
    if (!this.llmRouter) {
      return {
        provider: 'Unknown',
        model: 'Not available (client-side)',
        apiKey: 'Not available (client-side)'
      };
    }
    
    return this.llmRouter.getModelInfo();
  }

}

export const chatService = ChatService.getInstance();
