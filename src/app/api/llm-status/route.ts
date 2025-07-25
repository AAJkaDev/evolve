import { NextResponse } from 'next/server';
import { createLLMRouter } from '@/services';

export async function GET() {
  try {
    // Get LLM router instance
    const llmRouter = createLLMRouter();

    // Test connections
    const connections = await llmRouter.testConnections();
    
    // Get usage metrics
    const metrics = llmRouter.getUsageMetrics();
    
    // Get model info
    const modelInfo = llmRouter.getModelInfo();

    return NextResponse.json({
      status: 'success',
      connections: {
        groq: connections.groq,
        gemini: connections.gemini
      },
      currentProvider: {
        provider: modelInfo.provider,
        model: modelInfo.model,
        fallbackAvailable: modelInfo.fallbackAvailable
      },
      usage: {
        groqDailyCount: metrics.groqDailyCount,
        groqMinuteCount: metrics.groqMinuteCount,
        lastGroqRequest: metrics.lastGroqRequest,
        services: {
          groqAvailable: metrics.groqAvailable,
          geminiAvailable: metrics.geminiAvailable
        }
      },
      environment: {
        groqConfigured: !!process.env.GROQ_API_KEY,
        geminiConfigured: !!process.env.GEMINI_API_KEY
      }
    });

  } catch (error) {
    console.error('LLM Status API Error:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        environment: {
          groqConfigured: !!process.env.GROQ_API_KEY,
          geminiConfigured: !!process.env.GEMINI_API_KEY
        }
      },
      { status: 500 }
    );
  }
}

// Optional: Allow CORS for development
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
