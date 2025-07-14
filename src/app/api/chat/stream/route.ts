import { NextRequest } from 'next/server';
import { getOpenRouterClient, OpenRouterMessage } from '@/lib/openrouter';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate message format
    for (const message of messages) {
      if (!message.role || !message.content) {
        return new Response(
          JSON.stringify({ error: 'Invalid message format: role and content are required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (!['user', 'assistant', 'system'].includes(message.role)) {
        return new Response(
          JSON.stringify({ error: 'Invalid message role: must be user, assistant, or system' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get OpenRouter client
    const client = getOpenRouterClient();

    // Add system message if not present
    const systemMessage: OpenRouterMessage = {
      role: 'system',
      content: 'You are a helpful AI assistant. Provide clear, accurate, and concise responses to user queries.'
    };

    const processedMessages: OpenRouterMessage[] = [
      systemMessage,
      ...messages.filter((msg: OpenRouterMessage) => msg.role !== 'system')
    ];

    // Create a readable stream
    const encoder = new TextEncoder();
    let controller: ReadableStreamDefaultController<Uint8Array>;

    const readableStream = new ReadableStream({
      start(controllerParam) {
        controller = controllerParam;
      },
      cancel() {
        console.log('Stream cancelled');
      },
    });

    // Send streamed request to OpenRouter API
    client.sendStreamedMessage(processedMessages, (chunk: string) => {
      try {
        const data = `data: ${JSON.stringify({ chunk })}\n\n`;
        controller.enqueue(encoder.encode(data));
      } catch (err) {
        console.error('Chunk encoding error:', err);
      }
    }).then(() => {
      // Signal end of stream
      try {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (err) {
        console.error('Stream close error:', err);
      }
    }).catch((error) => {
      console.error('Streaming error:', error);
      try {
        const errorData = `data: ${JSON.stringify({ error: error.message })}\n\n`;
        controller.enqueue(encoder.encode(errorData));
        controller.close();
      } catch (err) {
        console.error('Error handling error:', err);
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
