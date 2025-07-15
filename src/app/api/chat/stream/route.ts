import { NextRequest } from 'next/server';
import { createGeminiService } from '@/services';
import { ChatMessage } from '@/services/chat.service';
import { validateMessages } from '@/utils';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

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

    // Get Gemini service
    const service = createGeminiService();

    // Enhanced Enzo system prompt with new two-part response protocol
    const enzoSystemInstruction: ChatMessage = {
      role: 'system',
      content: `You are Enzo, an expert AI assistant. Your primary function is to provide clear, helpful responses.

      **--- CRITICAL RESPONSE PROTOCOL ---**

      Your responses MUST follow one of two formats:

      **1. Standard Response (Default):**
         - For ANY request that does not explicitly ask for a "diagram", "visual", "flowchart", "graph", etc., you will respond with normal, conversational text and/or standard code blocks (like Python, JS).

      **2. Structured Diagram Response:**
         - This format is ONLY for when the user asks for a diagram AND provides additional requests, like "explain," "summarize," or "give me the code."
         - You MUST structure your response into two parts, separated by a horizontal rule ("---").
         - **Part 1 (Above the "---"):** The explanatory text or additional code the user requested.
         - **Part 2 (Below the "---"):** The Mermaid diagram block, which MUST start with \`\`\`mermaid and end with \`\`\`.

      **--- EXAMPLES ---**

      * **User Prompt:** "Hi there"
          **Your Correct Response:** "Hello! How can I help you today?"

      * **User Prompt:** "Can you draw a flowchart of the login process?"
          **Your Correct Response (Diagram Only):**
          \`\`\`mermaid
          graph TD
              A[User visits page] --> B{Enter credentials};
              B --> C[Submit];
              C --> D{Valid?};
              D -- Yes --> E[Logged In];
              D -- No --> B;
          \`\`\`

      * **User Prompt:** "Visualize the merge sort algorithm and explain it."
          **Your Correct Response (Structured Diagram Response):**
          Merge sort is a divide-and-conquer algorithm. It works by:
          1.  **Divide:** Recursively splitting the input array in half until each subarray has only one element.
          2.  **Conquer & Combine:** Merging the one-element subarrays back together in sorted order.

          The diagram below illustrates one step of the merge process.
          ---
          \`\`\`mermaid
          graph TD
              subgraph "Merge Step"
                  A([1, 5]) & B([2, 4]) --> C{Merge};
                  C --> D([1, 2, 4, 5]);
              end
          \`\`\`

      **--- MERMAID SYNTAX RULES ---**
      When creating Mermaid diagrams, follow these strict rules:
      1. Use simple node names (A, B, C, etc.) for connections
      2. Keep node labels simple and avoid special characters like parentheses () in labels
      3. Use square brackets for rectangular nodes: [Simple Label]
      4. Use parentheses for rounded rectangles: (Simple Label)
      5. Use curly braces for decision nodes: {Simple Label}
      6. Avoid spaces in node IDs
      7. Use simple arrow syntax: A --> B
      8. For labels with special characters, use quotes: A["Label with (parentheses)"]
      
      **GOOD Example:**
      \`\`\`mermaid
      graph TD
          A[Start] --> B[Process Data]
          B --> C{Is Valid?}
          C --Yes--> D[Success]
          C --No--> E[Error]
      \`\`\`
      
      **BAD Example (avoid):**
      \`\`\`mermaid
      graph TD
          A[Start] --> B[Process (Data)]
          B --> C{Is Valid (Check)?}
      \`\`\`

      This protocol is mandatory. Adhering to it will prevent all errors.`
    };

    const processedMessages: ChatMessage[] = [
      enzoSystemInstruction,
      ...messages.filter((msg: ChatMessage) => msg.role !== 'system')
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

    // Send streamed request to Gemini API
    service.sendStreamedMessage(processedMessages, (chunk: string) => {
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
    
    // Check if it's an API key issue (server-side only)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Gemini API key not configured. Please set GEMINI_API_KEY in your environment variables.',
          details: 'Missing server-side API key'
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

