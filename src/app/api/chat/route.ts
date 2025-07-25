import { NextRequest, NextResponse } from 'next/server';
import { createLLMRouter } from '@/services';
import { ChatMessage, ChatRequest } from '@/types/chat';
import { validateMessages } from '@/utils';
import { createSocraticSystemMessage, getSocraticContextForState } from '@/config/socratic-system-prompt';

export async function POST(request: NextRequest) {
  try {
    const requestBody: ChatRequest = await request.json();
    const { messages, mode } = requestBody;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array is required' },
        { status: 400 }
      );
    }

    if (!validateMessages(messages)) {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    // Get LLM router service (Groq primary, Gemini fallback)
    const llmRouter = createLLMRouter();

    // Handle Socratic mode with system prompt instead of microservice
    if (mode === 'socratic') {
      console.log('Processing in Socratic mode with system prompt...');
      
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

      // Send request via LLM router with Socratic system prompt
      const result = await llmRouter.sendMessage(processedMessages);

      return NextResponse.json({
        message: result.message,
        timestamp: new Date().toISOString(),
        provider: result.provider
      });
    }

    // Continue with standard/default chat flow for mode === 'standard' or undefined
    console.log(`Processing in standard mode (non-streaming, mode: ${mode || 'undefined'})...`);

    // Condensed Enzo system prompt
    const enzoSystemInstruction: ChatMessage = {
      role: 'system',
      content: `You are Enzo, an expert AI assistant who provides clear, helpful responses.

**Response Protocol:**
1. **Standard Response:** Normal conversational text and code blocks for any request not asking for diagrams.
2. **Diagram Response:** When user asks for diagrams/visuals:
   - If they also want explanation: Put explanation above "---" then Mermaid diagram below
   - If diagram only: Just provide the Mermaid diagram

**Mermaid Rules:**
- Use simple node IDs (A, B, C)
- Square brackets [Label], parentheses (Label), curly braces {Decision}
- Simple arrows: A --> B
- Avoid special characters in labels`
    };

    const processedMessages: ChatMessage[] = [
      enzoSystemInstruction,
      ...messages.filter((msg: ChatMessage) => msg.role !== 'system')
    ];

    // Send request via LLM router
    const result = await llmRouter.sendMessage(processedMessages);

    return NextResponse.json({
      message: result.message,
      timestamp: new Date().toISOString(),
      provider: result.provider
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    // Check if any LLM service is available
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!groqKey && !geminiKey) {
      return NextResponse.json(
        { 
          error: 'No LLM service configured. Please set GROQ_API_KEY or GEMINI_API_KEY in your environment variables.',
          details: 'Missing server-side API keys'
        },
        { status: 500 }
      );
    }
    
    // Return appropriate error response
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: error.message,
          details: error.stack?.split('\n')[0] || 'No additional details'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
