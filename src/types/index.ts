import React from 'react';

// Core types for the application
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface UseChatOptions {
  initialMessages?: Message[];
  stream?: boolean;
}

export interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  retry: () => Promise<void>;
}

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

export interface APIResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface Subject {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: React.ReactElement;
  available: boolean;
}
