import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    
    return NextResponse.json({
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey ? `${apiKey.substring(0, 8)}...` : 'Not found',
      envVars: {
        OPENROUTER_API_KEY: !!process.env.OPENROUTER_API_KEY,
        NEXT_PUBLIC_OPENROUTER_API_KEY: !!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'Not set',
      }
    });
  } catch (error) {
    console.error('Test API Error:', error);
    return NextResponse.json(
      { error: 'Test API failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
