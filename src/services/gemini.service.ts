import { GoogleGenerativeAI, GenerativeModel, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { ChatMessage } from './chat.service';

export interface GeminiConfig {
  model: string;
  apiKey: string;
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
}

export class GeminiService {
  private static instance: GeminiService;
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private apiKey: string;
  private modelName: string = 'gemini-1.5-flash';

  private constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    
    this.apiKey = apiKey;
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    // Configure the model with optimized settings
    this.model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
  }

  static getInstance(apiKey?: string): GeminiService {
    if (!GeminiService.instance) {
      // For server-side usage, prioritize server-side API key
      const key = apiKey || process.env.GEMINI_API_KEY;
      if (!key) {
        throw new Error('Gemini API key not found. Please set GEMINI_API_KEY environment variable for server-side usage.');
      }
      GeminiService.instance = new GeminiService(key);
    }
    return GeminiService.instance;
  }

  /**
   * Convert chat messages to Gemini format
   */
  private formatMessagesForGemini(messages: ChatMessage[]): Array<{ role: string; parts: Array<{ text: string }> }> {
    const formattedMessages: Array<{ role: string; parts: Array<{ text: string }> }> = [];
    
    for (const message of messages) {
      // Skip system messages for now - we'll handle them separately
      if (message.role === 'system') {
        continue;
      }
      
      // Map OpenAI roles to Gemini roles
      const geminiRole = message.role === 'assistant' ? 'model' : 'user';
      
      formattedMessages.push({
        role: geminiRole,
        parts: [{ text: message.content }],
      });
    }
    
    return formattedMessages;
  }

  /**
   * Get system prompt from messages
   */
  private getSystemPrompt(messages: ChatMessage[]): string {
    const systemMessage = messages.find(msg => msg.role === 'system');
    return systemMessage ? systemMessage.content : 'You are Enzo, a helpful AI assistant created by Evolve. You are knowledgeable, friendly, and always strive to provide accurate and helpful responses. When generating Mermaid diagrams, ensure they follow proper syntax and are properly formatted within code blocks.';
  }

  /**
   * Send a non-streaming message to Gemini
   */
  async sendMessage(messages: ChatMessage[]): Promise<string> {
    try {
      console.log('Sending request to Gemini API with model:', this.modelName);
      console.log('Messages:', JSON.stringify(messages, null, 2));

      const systemPrompt = this.getSystemPrompt(messages);
      const formattedMessages = this.formatMessagesForGemini(messages);

      // If we have conversation history, use chat session
      if (formattedMessages.length > 1) {
        const chat = this.model.startChat({
          history: formattedMessages.slice(0, -1), // All but the last message
        });

        // Add system prompt to the last user message
        const lastMessage = formattedMessages[formattedMessages.length - 1];
        const promptWithSystem = `${systemPrompt}\n\nUser: ${lastMessage.parts[0].text}`;

        const result = await chat.sendMessage(promptWithSystem);
        const response = await result.response;
        const text = response.text();

        console.log('✅ Gemini API SUCCESS:', {
          model: this.modelName,
          responseLength: text.length,
        });

        return text;
      } else {
        // Single message - use generateContent
        const userMessage = formattedMessages[0]?.parts[0]?.text || '';
        const promptWithSystem = `${systemPrompt}\n\nUser: ${userMessage}`;

        const result = await this.model.generateContent(promptWithSystem);
        const response = await result.response;
        const text = response.text();

        console.log('✅ Gemini API SUCCESS:', {
          model: this.modelName,
          responseLength: text.length,
        });

        return text;
      }
    } catch (error) {
      console.error('❌ Gemini API Error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID')) {
          throw new Error('Invalid Gemini API key. Please check your API key configuration.');
        } else if (error.message.includes('QUOTA_EXCEEDED')) {
          throw new Error('Gemini API quota exceeded. Please try again later.');
        } else if (error.message.includes('RATE_LIMIT_EXCEEDED')) {
          throw new Error('Rate limit exceeded. Please wait before sending another message.');
        } else {
          throw new Error(`Gemini API request failed: ${error.message}`);
        }
      }
      
      throw new Error('Unknown error occurred while communicating with Gemini API');
    }
  }

  /**
   * Send a streaming message to Gemini
   */
  async sendStreamedMessage(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      console.log('Sending streaming request to Gemini API with model:', this.modelName);

      const systemPrompt = this.getSystemPrompt(messages);
      const formattedMessages = this.formatMessagesForGemini(messages);

      // If we have conversation history, use chat session
      if (formattedMessages.length > 1) {
        const chat = this.model.startChat({
          history: formattedMessages.slice(0, -1), // All but the last message
        });

        // Add system prompt to the last user message
        const lastMessage = formattedMessages[formattedMessages.length - 1];
        const promptWithSystem = `${systemPrompt}\n\nUser: ${lastMessage.parts[0].text}`;

        const result = await chat.sendMessageStream(promptWithSystem);
        
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            onChunk(chunkText);
          }
        }
      } else {
        // Single message - use generateContentStream
        const userMessage = formattedMessages[0]?.parts[0]?.text || '';
        const promptWithSystem = `${systemPrompt}\n\nUser: ${userMessage}`;

        const result = await this.model.generateContentStream(promptWithSystem);
        
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            onChunk(chunkText);
          }
        }
      }

      console.log('✅ Gemini streaming completed successfully');
    } catch (error) {
      console.error('❌ Gemini streaming error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID')) {
          throw new Error('Invalid Gemini API key. Please check your API key configuration.');
        } else if (error.message.includes('QUOTA_EXCEEDED')) {
          throw new Error('Gemini API quota exceeded. Please try again later.');
        } else if (error.message.includes('RATE_LIMIT_EXCEEDED')) {
          throw new Error('Rate limit exceeded. Please wait before sending another message.');
        } else {
          throw new Error(`Gemini streaming failed: ${error.message}`);
        }
      }
      
      throw new Error('Unknown error occurred during Gemini streaming');
    }
  }

  /**
   * Test the Gemini API connection
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
      console.error('Gemini connection test failed:', error);
      return false;
    }
  }

  /**
   * Get model information
   */
  getModelInfo(): { name: string; apiKey: string } {
    return {
      name: this.modelName,
      apiKey: this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'Not set'
    };
  }
}

export const createGeminiService = (apiKey?: string): GeminiService => {
  return GeminiService.getInstance(apiKey);
};
