import axios from 'axios';
import { OPENROUTER_CONFIG } from '@/config/openrouter';
import { getMockAIResponse, simulateTyping } from './mockAI';

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl: string = OPENROUTER_CONFIG.API_URL;
  private model: string = OPENROUTER_CONFIG.MODEL_ID;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenRouter API key is required');
    }
    this.apiKey = apiKey;
  }

  async sendMessage(messages: OpenRouterMessage[]): Promise<string> {
    try {
      const response = await axios.post<OpenRouterResponse>(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages,
          ...OPENROUTER_CONFIG.DEFAULT_PARAMS,
          stream: false,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            'X-Title': 'Evolve Chat App',
          },
          timeout: OPENROUTER_CONFIG.TIMEOUT,
        }
      );

      if (!response.data.choices || response.data.choices.length === 0) {
        throw new Error('No response from OpenRouter API');
      }

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid API key. Please check your OpenRouter API key.');
        } else if (error.response?.status === 429) {
          // Use mock AI response when rate limited
          console.log('Rate limit exceeded, using mock AI response');
          const userMessage = messages.find(m => m.role === 'user')?.content || '';
          return getMockAIResponse(userMessage);
        } else if (error.response?.status === 500) {
          throw new Error('OpenRouter service is temporarily unavailable.');
        } else {
          const errorMessage = error.response?.data?.error?.message || error.message;
          throw new Error(`API request failed: ${errorMessage}`);
        }
      }
      
      // Fallback to mock AI for any other errors
      console.log('API error, using mock AI response');
      const userMessage = messages.find(m => m.role === 'user')?.content || '';
      return getMockAIResponse(userMessage);
    }
  }

  async sendStreamedMessage(
    messages: OpenRouterMessage[],
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      const response = await this.sendMessage(messages);
      
      // Use simulateTyping for better streaming simulation
      await simulateTyping(response, onChunk);
    } catch (error) {
      console.error('OpenRouter Streaming Error:', error);
      
      // Fallback to mock AI with streaming simulation
      const userMessage = messages.find(m => m.role === 'user')?.content || '';
      const mockResponse = getMockAIResponse(userMessage);
      await simulateTyping(mockResponse, onChunk);
    }
  }
}

// Singleton instance
let openRouterClient: OpenRouterClient | null = null;

export function getOpenRouterClient(): OpenRouterClient {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenRouter API key not found. Please set OPENROUTER_API_KEY environment variable.');
  }
  
  if (!openRouterClient) {
    openRouterClient = new OpenRouterClient(apiKey);
  }
  
  return openRouterClient;
}
