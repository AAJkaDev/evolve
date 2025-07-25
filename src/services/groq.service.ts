import Groq from 'groq-sdk';
import { ChatMessage } from '@/types/chat';

export interface GroqConfig {
  model: string;
  apiKey: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

export class GroqService {
  private static instance: GroqService;
  private client: Groq;
  private apiKey: string;
  private modelName: string = 'llama-3.1-8b-instant';

  private constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Groq API key is required');
    }
    
    this.apiKey = apiKey;
    this.client = new Groq({
      apiKey: apiKey,
    });
  }

  static getInstance(apiKey?: string): GroqService {
    if (!GroqService.instance) {
      const key = apiKey || process.env.GROQ_API_KEY;
      if (!key) {
        throw new Error('Groq API key not found. Please set GROQ_API_KEY environment variable for server-side usage.');
      }
      GroqService.instance = new GroqService(key);
    }
    return GroqService.instance;
  }

  /**
   * Convert chat messages to Groq format
   */
  private formatMessagesForGroq(messages: ChatMessage[]): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
    return messages.map(message => ({
      role: message.role === 'assistant' ? 'assistant' as const : message.role === 'system' ? 'system' as const : 'user' as const,
      content: message.content,
    }));
  }

  /**
   * Send a non-streaming message to Groq
   */
  async sendMessage(messages: ChatMessage[]): Promise<string> {
    try {
      console.log('Sending request to Groq API with model:', this.modelName);
      console.log('Messages:', JSON.stringify(messages, null, 2));

      const formattedMessages = this.formatMessagesForGroq(messages);

      const response = await this.client.chat.completions.create({
        model: this.modelName,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.95,
        stream: false,
      });

      const text = response.choices[0]?.message?.content || '';

      console.log('✅ Groq API SUCCESS:', {
        model: this.modelName,
        responseLength: text.length,
        usage: response.usage,
      });

      return text;
    } catch (error) {
      console.error('❌ Groq API Error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new Error('Invalid Groq API key. Please check your API key configuration.');
        } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
          throw new Error('Groq API rate limit or quota exceeded. Please try again later.');
        } else if (error.message.includes('model')) {
          throw new Error(`Groq model error: ${error.message}`);
        } else {
          throw new Error(`Groq API request failed: ${error.message}`);
        }
      }
      
      throw new Error('Unknown error occurred while communicating with Groq API');
    }
  }

  /**
   * Send a streaming message to Groq
   */
  async sendStreamedMessage(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    abortSignal?: AbortSignal
  ): Promise<void> {
    try {
      console.log('Sending streaming request to Groq API with model:', this.modelName);

      const formattedMessages = this.formatMessagesForGroq(messages);

      const stream = await this.client.chat.completions.create({
        model: this.modelName,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.95,
        stream: true,
      });

      for await (const chunk of stream) {
        // Check if request was aborted
        if (abortSignal?.aborted) {
          console.log('Groq streaming aborted by client');
          return;
        }
        
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          onChunk(content);
        }
      }

      console.log('✅ Groq streaming completed successfully');
    } catch (error) {
      console.error('❌ Groq streaming error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new Error('Invalid Groq API key. Please check your API key configuration.');
        } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
          throw new Error('Groq API rate limit or quota exceeded. Please try again later.');
        } else if (error.message.includes('model')) {
          throw new Error(`Groq model error: ${error.message}`);
        } else {
          throw new Error(`Groq streaming failed: ${error.message}`);
        }
      }
      
      throw new Error('Unknown error occurred during Groq streaming');
    }
  }

  /**
   * Test the Groq API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const testMessage: ChatMessage = {
        role: 'user',
        content: 'Hello, this is a test message.'
      };
      
      const response = await this.sendMessage([testMessage]);
      return response.length > 0;
    } catch (error) {
      console.error('Groq connection test failed:', error);
      return false;
    }
  }

  /**
   * Get model information
   */
  getModelInfo(): { name: string; apiKey: string; provider: string } {
    return {
      name: this.modelName,
      apiKey: this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'Not set',
      provider: 'Groq Cloud'
    };
  }
}

export const createGroqService = (apiKey?: string): GroqService => {
  return GroqService.getInstance(apiKey);
};
