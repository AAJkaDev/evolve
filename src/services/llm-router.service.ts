import { createGroqService } from './groq.service';
import { createGeminiService } from './gemini.service';
import { ChatMessage } from '@/types/chat';

interface UsageMetrics {
  groqDailyCount: number;
  groqMinuteCount: number;
  lastGroqRequest: Date;
}

export class LLMRouterService {
  private static instance: LLMRouterService;
  private groqService: ReturnType<typeof createGroqService> | null = null;
  private geminiService: ReturnType<typeof createGeminiService> | null = null;
  
  // Usage tracking (in production, this should be stored in Redis/database)
  private usageMetrics: UsageMetrics = {
    groqDailyCount: 0,
    groqMinuteCount: 0,
    lastGroqRequest: new Date(0)
  };

  // Rate limits for Groq free tier
  private readonly GROQ_DAILY_LIMIT = 15000; // Conservative limit for free tier
  private readonly GROQ_MINUTE_LIMIT = 1000; // Conservative per-minute limit

  private constructor() {
    // Initialize services
    if (typeof window === 'undefined') {
      // Try to initialize Groq service
      if (process.env.GROQ_API_KEY) {
        try {
          this.groqService = createGroqService();
          console.log('✅ Groq service initialized successfully');
        } catch (error) {
          console.warn('❌ Failed to initialize Groq service:', error);
          this.groqService = null;
        }
      } else {
        console.log('⚠️ GROQ_API_KEY not found, skipping Groq initialization');
      }

      // Initialize Gemini service as fallback
      if (process.env.GEMINI_API_KEY) {
        try {
          this.geminiService = createGeminiService();
          console.log('✅ Gemini service initialized as fallback');
        } catch (error) {
          console.warn('Failed to initialize Gemini service:', error);
        }
      }
    }
  }

  static getInstance(): LLMRouterService {
    if (!LLMRouterService.instance) {
      LLMRouterService.instance = new LLMRouterService();
    }
    return LLMRouterService.instance;
  }

  /**
   * Check if Groq should be used based on rate limits and availability
   */
  private shouldUseGroq(): boolean {
    if (!this.groqService) {
      console.log('Groq service not available, using Gemini');
      return false;
    }

    const now = new Date();
    const daysSinceLastRequest = Math.floor((now.getTime() - this.usageMetrics.lastGroqRequest.getTime()) / (1000 * 60 * 60 * 24));
    const minutesSinceLastRequest = Math.floor((now.getTime() - this.usageMetrics.lastGroqRequest.getTime()) / (1000 * 60));

    // Reset daily counter if it's a new day
    if (daysSinceLastRequest >= 1) {
      this.usageMetrics.groqDailyCount = 0;
    }

    // Reset minute counter if it's been more than a minute
    if (minutesSinceLastRequest >= 1) {
      this.usageMetrics.groqMinuteCount = 0;
    }

    // Check if we're within limits
    const withinDailyLimit = this.usageMetrics.groqDailyCount < this.GROQ_DAILY_LIMIT;
    const withinMinuteLimit = this.usageMetrics.groqMinuteCount < this.GROQ_MINUTE_LIMIT;

    if (!withinDailyLimit) {
      console.log(`Groq daily limit reached (${this.usageMetrics.groqDailyCount}/${this.GROQ_DAILY_LIMIT}), using Gemini fallback`);
      return false;
    }

    if (!withinMinuteLimit) {
      console.log(`Groq minute limit reached (${this.usageMetrics.groqMinuteCount}/${this.GROQ_MINUTE_LIMIT}), using Gemini fallback`);
      return false;
    }

    return true;
  }

  /**
   * Update usage metrics after a successful Groq request
   */
  private updateGroqUsage(): void {
    this.usageMetrics.groqDailyCount++;
    this.usageMetrics.groqMinuteCount++;
    this.usageMetrics.lastGroqRequest = new Date();
  }

  /**
   * Send a non-streaming message with automatic fallback
   */
  async sendMessage(messages: ChatMessage[]): Promise<{ message: string; provider: string }> {
    const useGroq = this.shouldUseGroq();

    if (useGroq && this.groqService) {
      try {
        console.log('🚀 Using Groq as primary LLM');
        const response = await this.groqService.sendMessage(messages);
        this.updateGroqUsage();
        return { message: response, provider: 'Groq Cloud' };
      } catch (error) {
        console.warn('🔄 Groq failed, falling back to Gemini:', error);
        // Fall through to Gemini
      }
    }

    // Use Gemini as fallback
    if (this.geminiService) {
      console.log('🎯 Using Gemini as fallback');
      const response = await this.geminiService.sendMessage(messages);
      return { message: response, provider: 'Google Gemini' };
    }

    throw new Error('No LLM service available');
  }

  /**
   * Send a streaming message with automatic fallback
   */
  async sendStreamedMessage(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    abortSignal?: AbortSignal
  ): Promise<{ provider: string }> {
    const useGroq = this.shouldUseGroq();

    if (useGroq && this.groqService) {
      try {
        console.log('🚀 Using Groq streaming as primary LLM');
        await this.groqService.sendStreamedMessage(messages, onChunk, abortSignal);
        this.updateGroqUsage();
        return { provider: 'Groq Cloud' };
      } catch (error) {
        console.warn('🔄 Groq streaming failed, falling back to Gemini:', error);
        // Fall through to Gemini
      }
    }

    // Use Gemini as fallback
    if (this.geminiService) {
      console.log('🎯 Using Gemini streaming as fallback');
      await this.geminiService.sendStreamedMessage(messages, onChunk, abortSignal);
      return { provider: 'Google Gemini' };
    }

    throw new Error('No LLM service available');
  }

  /**
   * Test connection to both services
   */
  async testConnections(): Promise<{ groq: boolean; gemini: boolean }> {
    const results = {
      groq: false,
      gemini: false
    };

    if (this.groqService) {
      try {
        results.groq = await this.groqService.testConnection();
      } catch (error) {
        console.error('Groq connection test failed:', error);
      }
    }

    if (this.geminiService) {
      try {
        results.gemini = await this.geminiService.testConnection();
      } catch (error) {
        console.error('Gemini connection test failed:', error);
      }
    }

    return results;
  }

  /**
   * Get current usage metrics
   */
  getUsageMetrics(): UsageMetrics & { groqAvailable: boolean; geminiAvailable: boolean } {
    return {
      ...this.usageMetrics,
      groqAvailable: !!this.groqService,
      geminiAvailable: !!this.geminiService
    };
  }

  /**
   * Get model information for the currently preferred service
   */
  getModelInfo(): { provider: string; model: string; apiKey: string; fallbackAvailable: boolean } {
    const useGroq = this.shouldUseGroq();
    
    if (useGroq && this.groqService) {
      const groqInfo = this.groqService.getModelInfo();
      return {
        provider: groqInfo.provider,
        model: groqInfo.name,
        apiKey: groqInfo.apiKey,
        fallbackAvailable: !!this.geminiService
      };
    }

    if (this.geminiService) {
      const geminiInfo = this.geminiService.getModelInfo();
      return {
        provider: 'Google Gemini',
        model: geminiInfo.name,
        apiKey: geminiInfo.apiKey,
        fallbackAvailable: false
      };
    }

    return {
      provider: 'None',
      model: 'No service available',
      apiKey: 'Not configured',
      fallbackAvailable: false
    };
  }
}

export const createLLMRouter = (): LLMRouterService => {
  return LLMRouterService.getInstance();
};
