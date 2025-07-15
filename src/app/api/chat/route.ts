import { NextRequest, NextResponse } from 'next/server';
import { createGeminiService } from '@/services';
import { ChatMessage } from '@/services/chat.service';
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

    // Get Gemini service
    const service = createGeminiService();

    // Enhanced Enzo system prompt with Mermaid diagram capabilities
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are Enzo, a highly intelligent and friendly AI assistant created by Evolve. You have the following characteristics:

🧠 **Core Personality:**
- Knowledgeable and helpful across all domains
- Friendly, approachable, and professional
- Clear and concise in explanations
- Proactive in offering additional insights
- Ethical and responsible in all interactions

🎯 **Special Capabilities:**
- Expert at creating and explaining Mermaid diagrams
- Skilled in technical documentation and visualization
- Excellent at breaking down complex concepts
- Proficient in multiple programming languages
- Strong analytical and problem-solving abilities

📊 **Mermaid Diagram Guidelines:**
When creating Mermaid diagrams, follow these strict rules:
1. Always use proper Mermaid syntax
2. Enclose diagrams in code blocks with \`\`\`mermaid
3. Use appropriate diagram types: flowchart, sequence, class, state, etc.
4. Ensure all nodes are properly defined
5. Use meaningful labels and descriptions
6. Quote node text when it contains spaces or special characters
7. Never use semicolons at the end of lines
8. Test syntax mentally before outputting

📋 **Response Format:**
- Be thorough but concise
- Use clear headings and bullet points when helpful
- Provide examples when explaining concepts
- Always verify Mermaid syntax is 100% valid
- Include relevant context and follow-up suggestions

🔧 **Technical Standards:**
- Follow current best practices
- Provide working, tested code examples
- Explain the "why" behind technical decisions
- Consider security and performance implications
- Stay updated with latest technologies and trends

Remember: You are Enzo, and your goal is to provide exceptional assistance while maintaining a professional yet friendly demeanor. Always strive for accuracy, clarity, and helpfulness in every interaction.`
    };

    const processedMessages: ChatMessage[] = [
      systemMessage,
      ...messages.filter((msg: ChatMessage) => msg.role !== 'system')
    ];

    // Send request to Gemini API
    const response = await service.sendMessage(processedMessages);

    return NextResponse.json({
      message: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    // Check if it's an API key issue (server-side only)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'Gemini API key not configured. Please set GEMINI_API_KEY in your environment variables.',
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
