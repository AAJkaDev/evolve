import { NextRequest, NextResponse } from 'next/server';
import { createOpenRouterService } from '@/services';
import { OpenRouterMessage } from '@/types';
import { validateMessages } from '@/utils';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

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

    // Get OpenRouter service
    const service = createOpenRouterService();

    // Add system message if not present
    const systemMessage: OpenRouterMessage = {
      role: 'system',
      content: 'You are a helpful AI assistant. Provide clear, accurate, and concise responses to user queries.'
    };

    const processedMessages: OpenRouterMessage[] = [
      systemMessage,
      ...messages.filter((msg: OpenRouterMessage) => msg.role !== 'system')
    ];

    // Send request to OpenRouter API
    const response = await service.sendMessage(processedMessages);

    return NextResponse.json({
      message: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    // Check if it's an API key issue (server-side only)
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'OpenRouter API key not configured. Please set OPENROUTER_API_KEY in your environment variables.',
          details: 'Missing server-side API key'
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
