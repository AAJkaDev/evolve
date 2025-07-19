import React from 'react';

// Core types for the application
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// New conversation turn structure
export interface ConversationTurn {
  id: string;
  userMessage: Message;
  aiResponses: Message[];
  timestamp: Date;
}

export interface UseChatOptions {
  initialMessages?: Message[];
  initialTurns?: ConversationTurn[];
  stream?: boolean;
}

export interface UseChatReturn {
  // Legacy support for existing components
  messages: Message[];
  // New turn-based structure
  turns: ConversationTurn[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string, toolMode?: 'default' | 'markmap') => Promise<void>;
  clearMessages: () => void;
  retry: () => Promise<void>;
  // New functions for advanced controls
  handleRetry: (turnIndex: number) => Promise<void>;
  handleEditAndResubmit: (turnIndex: number, newContent: string) => Promise<void>;
  stopGeneration: () => void;
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
