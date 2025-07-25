// Chat-specific type definitions for Project Socrates

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  mode?: 'standard' | 'socratic';
}

export interface ChatResponse {
  message: string;
  timestamp: string;
}

export interface StreamingChatChunk {
  chunk?: string;
  error?: string;
}

// Legacy support for existing tool modes
export interface ChatMessageRequest {
  messages: ChatMessage[];
  mode?: 'default' | 'markmap' | 'standard' | 'socratic';
}

export interface ChatMessageResponse {
  message: string;
  timestamp: string;
}

// Socratic-specific types for future Python microservice integration
export interface SocraticRequest {
  messages: ChatMessage[];
  context?: {
    subject?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    learningObjectives?: string[];
  };
}

export interface SocraticResponse {
  response: string;
  questions: string[];
  insights: string[];
  nextSteps: string[];
}
