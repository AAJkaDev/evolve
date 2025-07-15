import axios from 'axios';
import { OPENROUTER_CONFIG } from '@/config/openrouter';
import { OpenRouterMessage, OpenRouterResponse } from '@/types';
import { isValidApiKey } from '@/utils';
import { mockAIService } from './mock-ai.service';

export class OpenRouterService {
  private static instance: OpenRouterService;
  private apiKey: string;
  private baseUrl: string = OPENROUTER_CONFIG.API_URL;
  private model: string = OPENROUTER_CONFIG.MODEL_ID;

  private constructor(apiKey: string) {
    if (!isValidApiKey(apiKey)) {
      throw new Error('OpenRouter API key is required');
    }
    this.apiKey = apiKey;
  }

  static getInstance(apiKey?: string): OpenRouterService {
    if (!OpenRouterService.instance) {
      // For server-side usage, prioritize server-side API key
      const key = apiKey || process.env.OPENROUTER_API_KEY;
      if (!key) {
        throw new Error('OpenRouter API key not found. Please set OPENROUTER_API_KEY environment variable for server-side usage.');
      }
      OpenRouterService.instance = new OpenRouterService(key);
    }
    return OpenRouterService.instance;
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
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://evolve-xi.vercel.app/',
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
          return mockAIService.generateResponse(userMessage);
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
      return mockAIService.generateResponse(userMessage);
    }
  }

  async sendStreamedMessage(
    messages: OpenRouterMessage[],
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      const response = await this.sendMessage(messages);
      
      // Use mock AI service for streaming simulation
      await mockAIService.simulateStreaming(response, onChunk);
    } catch (error) {
      console.error('OpenRouter Streaming Error:', error);
      
      // Fallback to mock AI with streaming simulation
      const userMessage = messages.find(m => m.role === 'user')?.content || '';
      const mockResponse = mockAIService.generateResponse(userMessage);
      await mockAIService.simulateStreaming(mockResponse, onChunk);
    }
  }
}

export const createOpenRouterService = (apiKey?: string): OpenRouterService => {
  return OpenRouterService.getInstance(apiKey);
};
