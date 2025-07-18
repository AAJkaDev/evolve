import { useState, useCallback, useMemo } from 'react';
import { chatService } from '@/services';
import { Message, ConversationTurn, UseChatOptions, UseChatReturn } from '@/types';

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

  // Generate AI response for a specific turn
  const generateAiResponse = useCallback(async (
    turnIndex: number, 
    toolMode: 'default' | 'markmap' = 'default'
  ) => {
    const turn = turns[turnIndex];
    if (!turn) return;

    // Create loading message
    const loadingMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

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
    }
  }, [turns, buildApiMessages, stream]);

  const sendMessage = useCallback(async (content: string, toolMode: 'default' | 'markmap' = 'default') => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

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
  }, [turns, isLoading, buildApiMessages, stream]);

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
  };
}
