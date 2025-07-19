import { useState, useCallback, useMemo, useRef } from 'react';
import { chatService } from '@/services';
import { Message, ConversationTurn, UseChatOptions, UseChatReturn } from '@/types';

// Media search detection
const MEDIA_SEARCH_PATTERNS = {
  images: /\[SEARCH:Images\]\s*(.+)/i,
  videos: /\[SEARCH:Videos\]\s*(.+)/i,
  both: /\[SEARCH:Both\]\s*(.+)/i,
};



const extractMediaSearchInfo = (content: string) => {
  for (const [type, pattern] of Object.entries(MEDIA_SEARCH_PATTERNS)) {
    const match = content.match(pattern);
    if (match) {
      return {
        type: type as 'images' | 'videos' | 'both',
        query: match[1]?.trim() || '',
      };
    }
  }
  return null;
};

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { initialMessages = [], initialTurns = [], stream = false } = options;
  
  // New turn-based state structure
  const [turns, setTurns] = useState<ConversationTurn[]>(() => {
    // Convert initial messages to turns if provided
    if (initialMessages.length > 0 && initialTurns.length === 0) {
      const convertedTurns: ConversationTurn[] = [];
      for (let i = 0; i < initialMessages.length; i += 2) {
        const userMessage = initialMessages[i];
        const aiMessage = initialMessages[i + 1];
        if (userMessage && userMessage.role === 'user') {
          convertedTurns.push({
            id: crypto.randomUUID(),
            userMessage,
            aiResponses: aiMessage && aiMessage.role === 'assistant' ? [aiMessage] : [],
            timestamp: userMessage.timestamp,
          });
        }
      }
      return convertedTurns;
    }
    return initialTurns;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentLoadingMessageRef = useRef<{ turnIndex: number; messageId: string } | null>(null);

  const generateId = () => crypto.randomUUID();

  // Legacy messages array for backward compatibility
  const messages = useMemo(() => {
    const flatMessages: Message[] = [];
    turns.forEach(turn => {
      flatMessages.push(turn.userMessage);
      flatMessages.push(...turn.aiResponses);
    });
    return flatMessages;
  }, [turns]);

  // Build API messages from turns for context
  const buildApiMessages = useCallback((upToTurnIndex?: number) => {
    const turnsToInclude = upToTurnIndex !== undefined ? turns.slice(0, upToTurnIndex + 1) : turns;
    const apiMessages: { role: 'user' | 'assistant' | 'system'; content: string }[] = [];
    
    turnsToInclude.forEach(turn => {
      apiMessages.push({
        role: turn.userMessage.role,
        content: turn.userMessage.content,
      });
      // Only include the latest AI response for context
      if (turn.aiResponses.length > 0) {
        const latestResponse = turn.aiResponses[turn.aiResponses.length - 1];
        apiMessages.push({
          role: latestResponse.role,
          content: latestResponse.content,
        });
      }
    });
    
    return apiMessages;
  }, [turns]);

  // Stop current AI response generation
  const stopGeneration = useCallback(() => {
    console.log('stopGeneration called');
    
    // Immediately set loading to false for instant UI feedback
    setIsLoading(false);
    
    // Remove current loading message immediately
    if (currentLoadingMessageRef.current) {
      const { turnIndex, messageId } = currentLoadingMessageRef.current;
      setTurns(prev => prev.map((t, i) => 
        i === turnIndex 
          ? {
              ...t,
              aiResponses: t.aiResponses.filter(msg => msg.id !== messageId)
            }
          : t
      ));
      currentLoadingMessageRef.current = null;
    }
    
    // Then abort the request
    if (abortControllerRef.current) {
      console.log('Aborting request...');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Clear any error state
    setError(null);
  }, []);

  // Generate AI response for a specific turn
  const generateAiResponse = useCallback(async (
    turnIndex: number, 
    toolMode: 'default' | 'markmap' = 'default'
  ) => {
    const turn = turns[turnIndex];
    if (!turn) return;

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    // Create loading message
    const loadingMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    // Track the loading message for immediate removal if stopped
    currentLoadingMessageRef.current = { turnIndex, messageId: loadingMessage.id };
    
    // Add loading message to the turn
    setTurns(prev => prev.map((t, i) => 
      i === turnIndex 
        ? { ...t, aiResponses: [...t.aiResponses, loadingMessage] }
        : t
    ));

    try {
      const apiMessages = buildApiMessages(turnIndex - 1); // Context up to previous turn
      apiMessages.push({
        role: turn.userMessage.role,
        content: turn.userMessage.content,
      });

      if (stream) {
        await chatService.sendStreamedMessage(apiMessages, (chunk) => {
          setTurns(prev => prev.map((t, i) => 
            i === turnIndex 
              ? {
                  ...t,
                  aiResponses: t.aiResponses.map(msg => 
                    msg.id === loadingMessage.id 
                      ? { ...msg, content: msg.content + chunk }
                      : msg
                  )
                }
              : t
          ));
        }, toolMode, abortControllerRef.current.signal);
      } else {
        const { message, timestamp } = await chatService.sendMessage(apiMessages, toolMode, abortControllerRef.current.signal);
        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: message,
          timestamp: new Date(timestamp),
        };
        
        // Replace loading message with actual response
        setTurns(prev => prev.map((t, i) => 
          i === turnIndex 
            ? {
                ...t,
                aiResponses: t.aiResponses.map(msg => 
                  msg.id === loadingMessage.id ? assistantMessage : msg
                )
              }
            : t
        ));
      }
    } catch (err) {
      // Don't show error for aborted requests
      if (err instanceof Error && err.name === 'AbortError') {
        // Just remove the loading message for aborted requests
        setTurns(prev => prev.map((t, i) => 
          i === turnIndex 
            ? {
                ...t,
                aiResponses: t.aiResponses.filter(msg => msg.id !== loadingMessage.id)
              }
            : t
        ));
        return;
      }
      
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      // Remove loading message on error
      setTurns(prev => prev.map((t, i) => 
        i === turnIndex 
          ? {
              ...t,
              aiResponses: t.aiResponses.filter(msg => msg.id !== loadingMessage.id)
            }
          : t
      ));
    } finally {
      // Clean up abort controller and loading message reference
      abortControllerRef.current = null;
      currentLoadingMessageRef.current = null;
    }
  }, [turns, buildApiMessages, stream]);

  // Handle media search queries
  const handleMediaSearch = useCallback(async (
    turnIndex: number, 
    query: string, 
    type: 'images' | 'videos' | 'both'
  ) => {
    try {
      // Call the media search API
      const response = await fetch('/api/media-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          type,
        }),
      });

      if (!response.ok) {
        throw new Error(`Media search failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Create a media search result message
      const mediaMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: JSON.stringify({
          type: 'media_search_results',
          searchType: type,
          query,
          results: data,
        }),
        timestamp: new Date(),
      };

      // Add the media results to the turn
      setTurns(prev => prev.map((t, i) => 
        i === turnIndex 
          ? { ...t, aiResponses: [mediaMessage] }
          : t
      ));
    } catch (error) {
      console.error('Media search error:', error);
      throw error;
    }
  }, []);

  const sendMessage = useCallback(async (content: string, toolMode: 'default' | 'markmap' = 'default') => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    // Check if this is a media search query
    const mediaSearchInfo = extractMediaSearchInfo(content.trim());
    
    // Create user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    // Create new conversation turn
    const newTurn: ConversationTurn = {
      id: generateId(),
      userMessage,
      aiResponses: [],
      timestamp: new Date(),
    };

    // Get the correct turn index (current turns length)
    const newTurnIndex = turns.length;

    // Add new turn to state
    setTurns(prev => [...prev, newTurn]);

    // Handle media search queries
    if (mediaSearchInfo) {
      try {
        await handleMediaSearch(newTurnIndex, mediaSearchInfo.query, mediaSearchInfo.type);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Media search failed');
        // Remove the turn if media search fails
        setTurns(prev => prev.filter(t => t.id !== newTurn.id));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      // Build API messages from existing turns plus the new user message
      const apiMessages = buildApiMessages(); // Get all previous context
      apiMessages.push({
        role: userMessage.role,
        content: userMessage.content,
      });

      // Create loading message
      const loadingMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      // Add loading message to the new turn
      setTurns(prev => prev.map((t, i) => 
        i === newTurnIndex 
          ? { ...t, aiResponses: [loadingMessage] }
          : t
      ));

      if (stream) {
        await chatService.sendStreamedMessage(apiMessages, (chunk) => {
          setTurns(prev => prev.map((t, i) => 
            i === newTurnIndex 
              ? {
                  ...t,
                  aiResponses: t.aiResponses.map(msg => 
                    msg.id === loadingMessage.id 
                      ? { ...msg, content: msg.content + chunk }
                      : msg
                  )
                }
              : t
          ));
        }, toolMode);
      } else {
        const { message, timestamp } = await chatService.sendMessage(apiMessages, toolMode);
        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: message,
          timestamp: new Date(timestamp),
        };
        
        // Replace loading message with actual response
        setTurns(prev => prev.map((t, i) => 
          i === newTurnIndex 
            ? {
                ...t,
                aiResponses: t.aiResponses.map(msg => 
                  msg.id === loadingMessage.id ? assistantMessage : msg
                )
              }
            : t
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      // Remove the turn if AI response fails
      setTurns(prev => prev.filter(t => t.id !== newTurn.id));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [turns, isLoading, buildApiMessages, stream, handleMediaSearch]);

  const clearMessages = useCallback(() => {
    setTurns([]);
    setError(null);
  }, []);

  const retry = useCallback(async () => {
    if (turns.length === 0 || isLoading) return;
    
    const lastTurn = turns[turns.length - 1];
    await sendMessage(lastTurn.userMessage.content);
  }, [turns, isLoading, sendMessage]);

  // New function: Retry AI response for a specific turn
  const handleRetry = useCallback(async (turnIndex: number) => {
    if (turnIndex < 0 || turnIndex >= turns.length || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await generateAiResponse(turnIndex);
    } finally {
      setIsLoading(false);
    }
  }, [turns, isLoading, generateAiResponse]);

  // New function: Edit user message and resubmit
  const handleEditAndResubmit = useCallback(async (turnIndex: number, newContent: string) => {
    if (turnIndex < 0 || turnIndex >= turns.length || isLoading || !newContent.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Update user message content and clear AI responses
      const updatedUserMessage: Message = {
        ...turns[turnIndex].userMessage,
        content: newContent.trim(),
        timestamp: new Date(),
      };
      
      setTurns(prev => prev.map((turn, i) => 
        i === turnIndex 
          ? {
              ...turn,
              userMessage: updatedUserMessage,
              aiResponses: [],
              timestamp: new Date(),
            }
          : i > turnIndex 
            ? null // Remove all subsequent turns
            : turn
      ).filter(Boolean) as ConversationTurn[]);
      
      // Generate new AI response
      await generateAiResponse(turnIndex);
    } finally {
      setIsLoading(false);
    }
  }, [turns, isLoading, generateAiResponse]);

  return {
    // Legacy support
    messages,
    // New turn-based structure
    turns,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    retry,
    // New advanced functions
    handleRetry,
    handleEditAndResubmit,
    stopGeneration,
  };
}
