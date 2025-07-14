export const OPENROUTER_CONFIG = {
  // OpenRouter API endpoint
  API_URL: 'https://openrouter.ai/api/v1',
  
  // Mistral-7B model identifier (using correct OpenRouter model ID)
  MODEL_ID: 'mistralai/mistral-7b-instruct:free',
  
  // Default model parameters
  DEFAULT_PARAMS: {
    max_tokens: 2048,
    temperature: 0.7,
    top_p: 0.9,
    frequency_penalty: 0,
    presence_penalty: 0,
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // Rate limiting settings
  RATE_LIMIT: {
    requests_per_minute: 60,
    tokens_per_minute: 50000,
  },
  
  // Security settings
  SECURITY: {
    max_message_length: 10000,
    max_messages_per_conversation: 100,
    allowed_roles: ['user', 'assistant', 'system'],
  },
  
  // Error messages
  ERROR_MESSAGES: {
    INVALID_API_KEY: 'Invalid OpenRouter API key. Please check your configuration.',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please wait before sending another message.',
    SERVICE_UNAVAILABLE: 'OpenRouter service is temporarily unavailable. Please try again later.',
    NETWORK_ERROR: 'Network error occurred. Please check your connection and try again.',
    INVALID_REQUEST: 'Invalid request format. Please check your message and try again.',
    TIMEOUT: 'Request timed out. Please try again.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again later.',
  },
} as const;

export type OpenRouterConfig = typeof OPENROUTER_CONFIG;
