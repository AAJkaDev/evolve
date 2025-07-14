// Utility functions for the application
export const generateId = (): string => Math.random().toString(36).substring(2, 15);

export const formatTimestamp = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

interface MessageObject {
  role: string;
  content: string;
}

export const validateMessage = (message: unknown): boolean => {
  return message !== null &&
         typeof message === 'object' &&
         message !== undefined &&
         'role' in message &&
         'content' in message &&
         typeof (message as MessageObject).role === 'string' && 
         typeof (message as MessageObject).content === 'string' &&
         ['user', 'assistant', 'system'].includes((message as MessageObject).role);
};

export const validateMessages = (messages: unknown): boolean => {
  return Array.isArray(messages) && messages.every(validateMessage);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const isValidApiKey = (apiKey: string | undefined): boolean => {
  return typeof apiKey === 'string' && apiKey.length > 0;
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};
