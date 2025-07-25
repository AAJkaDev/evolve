import { NextRequest } from 'next/server';
import { createLLMRouter } from '@/services';
import { ChatMessage, ChatRequest } from '@/types/chat';
import { validateMessages } from '@/utils';
import { enzoSystemInstruction } from '@/services/gemini.service';
import { createSocraticSystemMessage, getSocraticContextForState } from '@/config/socratic-system-prompt';
import { 
  getLearningMode,
  LearningModePrompt 
} from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const requestBody: ChatRequest = await request.json();
    const { messages, mode } = requestBody;
    
    // Get abort signal from request
    const abortSignal = request.signal;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!validateMessages(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid message format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get LLM router service (Groq primary, Gemini fallback)
    const llmRouter = createLLMRouter();

    // Handle Socratic mode with system prompt instead of microservice
    if (mode === 'socratic') {
      console.log('Processing in Socratic mode with system prompt (streaming)...');
      
      // Get the last user message for context engineering
      const lastUserMessage = messages[messages.length - 1];
      const messageCount = messages.filter(msg => msg.role === 'user').length;
      
      // Create Socratic system instruction with context engineering
      const socraticContext = getSocraticContextForState(messageCount, lastUserMessage?.content || '');
      const socraticSystemInstruction: ChatMessage = {
        role: 'system',
        content: createSocraticSystemMessage() + '\n\n' + socraticContext
      };

      const processedMessages: ChatMessage[] = [
        socraticSystemInstruction,
        ...messages.filter((msg: ChatMessage) => msg.role !== 'system')
      ];

      // Create a readable stream for Socratic mode
      const encoder = new TextEncoder();
      let controller: ReadableStreamDefaultController<Uint8Array>;

      const readableStream = new ReadableStream({
        start(controllerParam) {
          controller = controllerParam;
        },
        cancel() {
          console.log('Socratic stream cancelled by client');
        },
      });

      // Send streamed request via LLM router with Socratic system prompt
      llmRouter.sendStreamedMessage(processedMessages, (chunk: string) => {
        try {
          if (abortSignal.aborted) {
            console.log('Socratic request aborted, stopping chunk processing');
            controller.close();
            return;
          }
          
          const data = `data: ${JSON.stringify({ chunk })}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch (err) {
          console.error('Socratic chunk encoding error:', err);
        }
      }, abortSignal).then(() => {
        try {
          if (!abortSignal.aborted) {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          }
        } catch (err) {
          console.error('Socratic stream close error:', err);
        }
      }).catch((error) => {
        console.error('Socratic streaming error:', error);
        try {
          if (!abortSignal.aborted) {
            const errorData = `data: ${JSON.stringify({ error: error.message })}\n\n`;
            controller.enqueue(encoder.encode(errorData));
          }
          controller.close();
        } catch (err) {
          console.error('Socratic error handling error:', err);
        }
      });
      
      // Handle abort signal for Socratic mode
      abortSignal.addEventListener('abort', () => {
        console.log('Socratic request aborted by client');
        try {
          controller.close();
        } catch (err) {
          console.error('Error closing Socratic controller on abort:', err);
        }
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Continue with standard/default chat flow for mode === 'standard' or undefined
    console.log(`Processing in standard mode (mode: ${mode || 'undefined'})...`);

    // Default system instruction (fallback)
    const mermaidSystemInstruction: ChatMessage = {
      role: 'system',
      content: `You are Enzo, an expert AI assistant who provides clear, helpful responses.

**Response Protocol:**
1. **Standard Response:** Normal conversational text and code blocks for any request not asking for diagrams.
2. **Diagram Response:** When user asks for diagrams/visuals:
   - If they also want explanation: Put explanation above "---" then Mermaid diagram below
   - If diagram only: Just provide the Mermaid diagram

**CRITICAL Mermaid Syntax Rules (MUST FOLLOW EXACTLY):**
- Use ONLY simple node IDs: A, B, C, D, etc. (single letters or simple names)
- Node shapes: [Square], (Rounded), {Diamond}, ((Circle))
- Arrows: ONLY use --> (never |>, ->, |-->, or any other variations)
- Labels: Keep them short and avoid special characters like |, >, <, &, quotes
- Start with: graph TD or graph LR (never just "graph")
- Example format:
  \`\`\`mermaid
  graph TD
      A[Start] --> B[Process]
      B --> C[End]
  \`\`\`
- NO PIPE SYMBOLS (|) in arrows - this causes syntax errors
- NO ANGLE BRACKETS (> <) in arrows - use only -->
- Keep node labels simple and clean`
    };

    // Mind Map system instruction
    const markmapSystemInstruction: ChatMessage = {
      role: 'system',
      content: enzoSystemInstruction
    };

    // PROJECT CHAMELEON: Dynamic Mode Switcher
    // Process messages with learning mode detection and tool prioritization
    let systemInstruction: ChatMessage;
    const processedMessages: ChatMessage[] = [];

    // Check the last user message for mode tags and tool tags
    const lastUserMessage = messages[messages.length - 1];
    const messageContent = lastUserMessage?.content || '';

    // PRIORITY 1: Mind Map tool takes absolute priority over learning modes
    if (messageContent.startsWith('[TOOL:MindMap]')) {
      console.log('🗺️ Mind Map tool detected - using enhanced Enzo system instruction');
      systemInstruction = markmapSystemInstruction;
      
      // Remove the tag from the message
      const cleanedMessages = messages.map(msg => {
        if (msg === lastUserMessage) {
          return {
            ...msg,
            content: msg.content.replace('[TOOL:MindMap]', '').trim()
          };
        }
        return msg;
      });
      
      processedMessages.push(
        systemInstruction,
        ...cleanedMessages.filter((msg: ChatMessage) => msg.role !== 'system')
      );
    }
    // PRIORITY 2: Learning Mode Detection (Project Chameleon)
    else {
      // Check for learning mode tags in the format [TOOL:TutorMode], [TOOL:StudyBuddy], etc.
      let selectedLearningMode: LearningModePrompt | null = null;
      let cleanedMessageContent = messageContent;

      // Detect learning mode tool tags
      if (messageContent.startsWith('[TOOL:TutorMode]')) {
        selectedLearningMode = getLearningMode('tutor');
        cleanedMessageContent = messageContent.replace('[TOOL:TutorMode]', '').trim();
        console.log('🎓 Tutor Mode activated');
      } else if (messageContent.startsWith('[TOOL:StudyBuddy]')) {
        selectedLearningMode = getLearningMode('study-buddy');
        cleanedMessageContent = messageContent.replace('[TOOL:StudyBuddy]', '').trim();
        console.log('🤝 Study Buddy Mode activated');
      } else if (messageContent.startsWith('[TOOL:Questioner]')) {
        selectedLearningMode = getLearningMode('questioner');
        cleanedMessageContent = messageContent.replace('[TOOL:Questioner]', '').trim();
        console.log('🤔 Questioner Mode activated');
      } else if (messageContent.startsWith('[TOOL:SpoonFeeding]')) {
        selectedLearningMode = getLearningMode('spoon-feeding');
        cleanedMessageContent = messageContent.replace('[TOOL:SpoonFeeding]', '').trim();
        console.log('🥄 Spoon Feeding Mode activated');
      } else if (messageContent.startsWith('[TOOL:PracticalLearning]')) {
        selectedLearningMode = getLearningMode('practical-learning');
        cleanedMessageContent = messageContent.replace('[TOOL:PracticalLearning]', '').trim();
        console.log('🛠️ Practical Learning Mode activated');
      }

      // Use the selected learning mode or fallback to standard
      if (selectedLearningMode) {
        // Create system instruction from the selected learning mode
        systemInstruction = {
          role: 'system',
          content: selectedLearningMode.systemPrompt
        };
        
        // Clean the message content by removing the mode tag
        const cleanedMessages = messages.map(msg => {
          if (msg === lastUserMessage) {
            return {
              ...msg,
              content: cleanedMessageContent
            };
          }
          return msg;
        });
        
        processedMessages.push(
          systemInstruction,
          ...cleanedMessages.filter((msg: ChatMessage) => msg.role !== 'system')
        );
      } else {
        // PRIORITY 3: Default to standard Mermaid system instruction
        console.log('📊 No learning mode detected - using standard Mermaid system instruction');
        systemInstruction = mermaidSystemInstruction;
        
        processedMessages.push(
          systemInstruction,
          ...messages.filter((msg: ChatMessage) => msg.role !== 'system')
        );
      }
    }

    // Create a readable stream
    const encoder = new TextEncoder();
    let controller: ReadableStreamDefaultController<Uint8Array>;

    const readableStream = new ReadableStream({
      start(controllerParam) {
        controller = controllerParam;
      },
      cancel() {
        console.log('Stream cancelled by client');
        // This will be called when the client aborts the request
      },
    });

    // Send streamed request via LLM router
    llmRouter.sendStreamedMessage(processedMessages, (chunk: string) => {
      try {
        // Check if request was aborted
        if (abortSignal.aborted) {
          console.log('Request aborted, stopping chunk processing');
          controller.close();
          return;
        }
        
        const data = `data: ${JSON.stringify({ chunk })}\n\n`;
        controller.enqueue(encoder.encode(data));
      } catch (err) {
        console.error('Chunk encoding error:', err);
      }
    }, abortSignal).then(() => {
      // Signal end of stream
      try {
        if (!abortSignal.aborted) {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      } catch (err) {
        console.error('Stream close error:', err);
      }
    }).catch((error) => {
      console.error('Streaming error:', error);
      try {
        if (!abortSignal.aborted) {
          const errorData = `data: ${JSON.stringify({ error: error.message })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
        }
        controller.close();
      } catch (err) {
        console.error('Error handling error:', err);
      }
    });
    
    // Handle abort signal
    abortSignal.addEventListener('abort', () => {
      console.log('Request aborted by client');
      try {
        controller.close();
      } catch (err) {
        console.error('Error closing controller on abort:', err);
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Chat Stream API Error:', error);
    
    // Check if any LLM service is available
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!groqKey && !geminiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'No LLM service configured. Please set GROQ_API_KEY or GEMINI_API_KEY in your environment variables.',
          details: 'Missing server-side API keys'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

