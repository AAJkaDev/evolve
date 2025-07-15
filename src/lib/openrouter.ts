import axios from 'axios';
import { OPENROUTER_CONFIG } from '@/config/openrouter';
import { simulateTyping } from './mockAI';

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
    // Primary model: GLM-4-32b (working and reliable)
    const primaryModel = 'thudm/glm-4-32b:free';
    
    // Fallback models in order of preference
    const fallbackModels = [
      'mistralai/mistral-7b-instruct:free',
      'google/gemma-2-9b-it:free'
    ];
    
    // Try primary model first
    try {
      console.log('Sending request to OpenRouter with PRIMARY model:', primaryModel);
      console.log('Messages:', JSON.stringify(messages, null, 2));
      
      const response = await axios.post<OpenRouterResponse>(
        `${this.baseUrl}/chat/completions`,
        {
          model: primaryModel,
          messages,
          max_tokens: 2048, // Reduced for free models
          temperature: 0.6,
          top_p: 0.95,
          frequency_penalty: 0,
          presence_penalty: 0,
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
      
      console.log('✅ PRIMARY model SUCCESS:', {
        status: response.status,
        statusText: response.statusText,
        model: primaryModel,
        usage: response.data.usage
      });

      if (!response.data.choices || response.data.choices.length === 0) {
        throw new Error('No response from OpenRouter API');
      }

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error(`❌ PRIMARY model failed (${primaryModel}):`, error);
      
      if (axios.isAxiosError(error)) {
        console.log('Primary model error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          model: primaryModel
        });
        
        if (error.response?.status === 401) {
          throw new Error('Invalid API key. Please check your OpenRouter API key.');
        }
      }
      
      console.log('🔄 Trying fallback models...');
    }
    
    // Try fallback models
    for (const modelId of fallbackModels) {
      try {
        console.log('Sending request to OpenRouter with FALLBACK model:', modelId);
        
        const response = await axios.post<OpenRouterResponse>(
          `${this.baseUrl}/chat/completions`,
          {
            model: modelId,
            messages,
            max_tokens: 1024, // Even more conservative for fallbacks
            temperature: 0.6,
            top_p: 0.95,
            frequency_penalty: 0,
            presence_penalty: 0,
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
        
        console.log('✅ FALLBACK model SUCCESS:', {
          status: response.status,
          statusText: response.statusText,
          model: modelId,
          usage: response.data.usage
        });

        if (!response.data.choices || response.data.choices.length === 0) {
          throw new Error('No response from OpenRouter API');
        }

        return response.data.choices[0].message.content;
      } catch (error) {
        console.error(`❌ FALLBACK model failed (${modelId}):`, error);
        
        if (axios.isAxiosError(error)) {
          console.log('Fallback model error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            model: modelId
          });
          
          if (error.response?.status === 401) {
            throw new Error('Invalid API key. Please check your OpenRouter API key.');
          }
          
          // Continue to next fallback model
          if (modelId === fallbackModels[fallbackModels.length - 1]) {
            // This is the last fallback model, throw the error
            const errorMessage = error.response?.data?.error?.message || error.message;
            throw new Error(`All model requests failed. Last error: ${errorMessage}`);
          }
          
          // Continue to next model
          continue;
        }
        
        // For non-axios errors, if this is the last model, throw the error
        if (modelId === fallbackModels[fallbackModels.length - 1]) {
          throw error;
        }
      }
    }
    
    throw new Error('All model requests failed');
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
      
      // Send error message to client instead of mock response
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      await simulateTyping(`Error: ${errorMessage}`, onChunk);
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
