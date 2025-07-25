import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { chatService } from '@/services';
import { Message, ConversationTurn, UseChatOptions, UseChatReturn } from '@/types';
import { ChatRequest } from '@/types/chat';

// Media search detection
const MEDIA_SEARCH_PATTERNS = {
  images: /\[SEARCH:Images\]\s*(.+)/i,
  videos: /\[SEARCH:Videos\]\s*(.+)/i,
  both: /\[SEARCH:Both\]\s*(.+)/i,
};

// Research tool detection
const RESEARCH_PATTERN = /\[TOOL:Research\]\s*(.+)/i;

// Socratic mode detection
const SOCRATIC_MODE_PATTERN = /\[MODE:Socratic\]\s*(.+)/i;


const extractMediaSearchInfo = (content: string) => {
  for (const [type, pattern] of Object.entries(MEDIA_SEARCH_PATTERNS)) {
    const match = content.match(pattern);
    if (match) {
      return {
        type: type as 'images' | 'videos' | 'both',
        query: match[1]?.trim() || '',
        originalContent: content, // Keep original for combined processing
      };
    }
  }
  return null;
};

const extractResearchInfo = (content: string) => {
  const match = content.match(RESEARCH_PATTERN);
  if (match) {
    return {
      query: match[1]?.trim() || '',
      originalContent: content, // Keep original for combined processing
    };
  }
  return null;
};

// NEW: Extract combined mode information
const extractCombinedModeInfo = (content: string) => {
  console.log('🔍 Checking for combinations in:', content);
  
  // Check for tool + learning mode combinations
  // Example: [SEARCH:Videos] [TOOL:TutorMode] how to become rich
  const toolWithLearningPattern = /\[((?:TOOL|SEARCH):[^\]]+)\]\s*\[TOOL:([^\]]+)\]\s*(.+)/i;
  const toolWithLearningMatch = content.match(toolWithLearningPattern);
  
  if (toolWithLearningMatch) {
    console.log('📚 Found tool + learning mode:', toolWithLearningMatch);
    return {
      type: 'tool_with_learning_mode',
      toolTag: toolWithLearningMatch[1], // e.g., "SEARCH:Videos"
      learningModeTag: toolWithLearningMatch[2], // e.g., "TutorMode"
      query: toolWithLearningMatch[3]?.trim() || '',
      originalContent: content,
    };
  }
  
  // Check for tool + Socratic combinations
  // Example: [SEARCH:Videos] [MODE:Socratic] how to become rich
  const toolWithSocraticPattern = /\[((?:TOOL|SEARCH):[^\]]+)\]\s*\[MODE:Socratic\]\s*(.+)/i;
  const toolWithSocraticMatch = content.match(toolWithSocraticPattern);
  
  if (toolWithSocraticMatch) {
    console.log('🤔 Found tool + Socratic mode:', toolWithSocraticMatch);
    return {
      type: 'tool_with_socratic',
      toolTag: toolWithSocraticMatch[1], // e.g., "SEARCH:Videos"
      query: toolWithSocraticMatch[2]?.trim() || '',
      originalContent: content,
    };
  }
  
  console.log('❌ No combinations found');
  return null;
};

const extractSocraticInfo = (content: string) => {
  const match = content.match(SOCRATIC_MODE_PATTERN);
  if (match) {
    return {
      query: match[1]?.trim() || '',
      originalContent: content,
    };
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
  const [mode, setMode] = useState<'standard' | 'socratic'>('standard');
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentLoadingMessageRef = useRef<{ turnIndex: number; messageId: string } | null>(null);

  const generateId = useCallback(() => crypto.randomUUID(), []);

// Legacy messages array for backward compatibility
  const messages = useMemo(() => {
    const flatMessages: Message[] = [];
    turns.forEach(turn => {
      flatMessages.push(turn.userMessage);
      flatMessages.push(...turn.aiResponses);
    });
    return flatMessages;
  }, [turns]);

// Keep study modes active until manually ended
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Preserve current state
      // Adjust based on the current active mode, whether it's socratic or any other study mode
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, []);

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
  }, [turns, buildApiMessages, stream, generateId]);

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
  }, [generateId]);

  // Handle research queries
  const handleResearchQuery = useCallback(async (
    turnIndex: number, 
    query: string
  ) => {
    try {
      // Create initial loading message with research status
      const loadingMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: JSON.stringify({
          type: 'research_loading',
          query,
          status: 'Starting deep research...',
          stage: 'initializing'
        }),
        timestamp: new Date(),
      };

      // Add loading message to the turn
      setTurns(prev => prev.map((t, i) => 
        i === turnIndex 
          ? { ...t, aiResponses: [loadingMessage] }
          : t
      ));

      // Update loading status - Stage 1: Searching
      setTurns(prev => prev.map((t, i) => 
        i === turnIndex 
          ? {
              ...t,
              aiResponses: t.aiResponses.map(msg => 
                msg.id === loadingMessage.id 
                  ? { 
                      ...msg, 
                      content: JSON.stringify({
                        type: 'research_loading',
                        query,
                        status: 'Searching for relevant sources...',
                        stage: 'searching'
                      })
                    }
                  : msg
              )
            }
          : t
      ));

      // Call the research API
      const response = await fetch('/api/search-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          max_results: 10,
        }),
      });

      if (!response.ok) {
        throw new Error(`Research failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Create a research result message
      const researchMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: JSON.stringify({
          type: 'research_results',
          query,
          answer: data.answer,
          citations: data.citations,
          sources: data.sources,
        }),
        timestamp: new Date(),
      };

      // Replace loading message with research results
      setTurns(prev => prev.map((t, i) => 
        i === turnIndex 
          ? { ...t, aiResponses: [researchMessage] }
          : t
      ));
    } catch (error) {
      console.error('Research error:', error);
      throw error;
    }
  }, [generateId]);

  // Helper function to handle study mode responses
  const handleStudyModeResponse = useCallback(async (
    query: string,
    learningModeTag: string
  ): Promise<Message | null> => {
    try {
      // Build the study mode message for API
      const studyModeContent = `[TOOL:${learningModeTag}] ${query}`;
      
      const apiMessages = buildApiMessages();
      apiMessages.push({
        role: 'user',
        content: studyModeContent,
      });

      const chatRequest: ChatRequest = {
        messages: apiMessages,
        mode: 'standard',
      };

      const { message, timestamp } = await chatService.sendChatRequest(chatRequest);
      
      return {
        id: generateId(),
        role: 'assistant',
        content: message,
        timestamp: new Date(timestamp),
      };
    } catch (error) {
      console.error('Study mode response error:', error);
      return null;
    }
  }, [buildApiMessages, generateId]);

  // Helper function to handle Socratic responses
  const handleSocraticResponse = useCallback(async (
    query: string
  ): Promise<Message | null> => {
    try {
      const apiMessages = buildApiMessages();
      apiMessages.push({
        role: 'user',
        content: query,
      });

      const chatRequest: ChatRequest = {
        messages: apiMessages,
        mode: 'socratic',
      };

      const { message, timestamp } = await chatService.sendChatRequest(chatRequest);
      
      return {
        id: generateId(),
        role: 'assistant',
        content: message,
        timestamp: new Date(timestamp),
      };
    } catch (error) {
      console.error('Socratic response error:', error);
      return null;
    }
  }, [buildApiMessages, generateId]);

  // Helper function to handle tool responses
  const handleToolResponse = useCallback(async (
    query: string,
    toolTag: string
  ): Promise<Message | null> => {
    try {
      // Handle different tool types
      if (toolTag.startsWith('SEARCH:')) {
        // Media search tools
        const searchType = toolTag.replace('SEARCH:', '').toLowerCase();
        const mediaType = searchType === 'images' ? 'images' : 
                         searchType === 'videos' ? 'videos' : 'both';
        
        const response = await fetch('/api/media-search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            type: mediaType,
          }),
        });

        if (!response.ok) {
          throw new Error(`Media search failed: ${response.statusText}`);
        }

        const data = await response.json();
        
        return {
          id: generateId(),
          role: 'assistant',
          content: JSON.stringify({
            type: 'media_search_results',
            searchType: mediaType,
            query,
            results: data,
          }),
          timestamp: new Date(),
        };
        
      } else if (toolTag === 'TOOL:Research') {
        // Research tool
        const response = await fetch('/api/search-research', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            max_results: 10,
          }),
        });

        if (!response.ok) {
          throw new Error(`Research failed: ${response.statusText}`);
        }

        const data = await response.json();
        
        return {
          id: generateId(),
          role: 'assistant',
          content: JSON.stringify({
            type: 'research_results',
            query,
            answer: data.answer,
            citations: data.citations,
            sources: data.sources,
          }),
          timestamp: new Date(),
        };
        
      } else {
        // Other tools (MindMap, Practice, Connections, Code)
        const apiMessages = buildApiMessages();
        apiMessages.push({
          role: 'user',
          content: `[${toolTag}] ${query}`,
        });

        const chatRequest: ChatRequest = {
          messages: apiMessages,
          mode: 'standard',
        };

        const { message, timestamp } = await chatService.sendChatRequest(chatRequest);
        
        return {
          id: generateId(),
          role: 'assistant',
          content: message,
          timestamp: new Date(timestamp),
        };
      }
    } catch (error) {
      console.error('Tool response error:', error);
      return null;
    }
  }, [buildApiMessages, generateId]);

  // NEW: Handle combined modes (study mode + tool)
  const handleCombinedMode = useCallback(async (
    turnIndex: number,
    combinedInfo: {
      type: string;
      toolTag?: string;
      learningModeTag?: string;
      query: string;
      originalContent: string;
    }
  ) => {
    console.log('🔄 Processing combined mode:', combinedInfo);
    
    const responses: Message[] = [];
    
    if (combinedInfo.type === 'tool_with_learning_mode') {
      console.log('📚 Tool + Learning Mode combination');
      
      // First, handle the study mode response
      const studyModeMessage = await handleStudyModeResponse(
        combinedInfo.query, 
        combinedInfo.learningModeTag || ''
      );
      if (studyModeMessage) {
        responses.push(studyModeMessage);
      }
      
      // Then, handle the tool response
      const toolMessage = await handleToolResponse(
        combinedInfo.query,
        combinedInfo.toolTag || ''
      );
      if (toolMessage) {
        responses.push(toolMessage);
      }
      
    } else if (combinedInfo.type === 'tool_with_socratic') {
      console.log('🤔 Tool + Socratic Mode combination');
      
      // First, handle the Socratic mode response
      const socraticMessage = await handleSocraticResponse(
        combinedInfo.query
      );
      if (socraticMessage) {
        responses.push(socraticMessage);
      }
      
      // Then, handle the tool response
      const toolMessage = await handleToolResponse(
        combinedInfo.query,
        combinedInfo.toolTag || ''
      );
      if (toolMessage) {
        responses.push(toolMessage);
      }
    }
    
    // Add all responses to the turn
    if (responses.length > 0) {
      setTurns(prev => prev.map((t, i) => 
        i === turnIndex 
          ? { ...t, aiResponses: responses }
          : t
      ));
    }
  }, [handleStudyModeResponse, handleSocraticResponse, handleToolResponse, setTurns]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    console.log('🔍 Processing message:', content.trim());

    // COMBINED MODE PROCESSING: Check for combinations first
    const combinedModeInfo = extractCombinedModeInfo(content.trim());
    
    // Check if this is a Socratic mode query first
    const socraticInfo = extractSocraticInfo(content.trim());
    
    // Check if this is a media search query
    const mediaSearchInfo = extractMediaSearchInfo(content.trim());
    
    // Check if this is a research query
    const researchInfo = extractResearchInfo(content.trim());
    
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

    // NEW: Handle combined modes first (highest priority)
    if (combinedModeInfo) {
      console.log('🎯 Combined mode detected:', combinedModeInfo);
      try {
        await handleCombinedMode(newTurnIndex, combinedModeInfo);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Combined mode failed');
        setTurns(prev => prev.filter(t => t.id !== newTurn.id));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Handle Socratic mode queries
    if (socraticInfo) {
      try {
        // For Socratic mode, set the mode and send the cleaned content
        setMode('socratic');
        
        // Build API messages from existing turns plus the new user message
        const apiMessages = buildApiMessages(); // Get all previous context
        apiMessages.push({
          role: userMessage.role,
          content: socraticInfo.query, // Use cleaned content without the MODE tag
        });

        // Create ChatRequest with Socratic mode
        const chatRequest: ChatRequest = {
          messages: apiMessages,
          mode: 'socratic',
        };

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
          await chatService.sendStreamingChatRequest(chatRequest, (chunk) => {
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
          });
        } else {
          const { message, timestamp } = await chatService.sendChatRequest(chatRequest);
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
        setError(err instanceof Error ? err.message : 'Socratic mode failed');
        // Remove the turn if Socratic mode fails
        setTurns(prev => prev.filter(t => t.id !== newTurn.id));
      } finally {
        setIsLoading(false);
        // Keep Socratic mode active for the session instead of resetting
        // setMode('standard'); // Removed to maintain Socratic session continuity
      }
      return;
    }

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

    // Handle research queries
    if (researchInfo) {
      try {
        await handleResearchQuery(newTurnIndex, researchInfo.query);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Research failed');
        // Remove the turn if research fails
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

      // Create ChatRequest with current mode
      const chatRequest: ChatRequest = {
        messages: apiMessages,
        mode: mode,
      };

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
        await chatService.sendStreamingChatRequest(chatRequest, (chunk) => {
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
        });
      } else {
        const { message, timestamp } = await chatService.sendChatRequest(chatRequest);
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
      // Reset mode back to 'standard' after each message is sent
      setMode('standard');
    }
    }, [turns, isLoading, buildApiMessages, stream, handleMediaSearch, handleResearchQuery, mode, handleCombinedMode, generateId]);

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
    // Socratic mode management
    mode,
    setMode,
  };
}
