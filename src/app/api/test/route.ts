import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check server-side API key (primary)
    const serverApiKey = process.env.OPENROUTER_API_KEY;
    // Check client-side API key (if used for specific client-side operations)
    const clientApiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    
    return NextResponse.json({
      serverSide: {
        hasApiKey: !!serverApiKey,
        apiKeyPrefix: serverApiKey ? `${serverApiKey.substring(0, 8)}...` : 'Not found',
        status: serverApiKey ? 'configured' : 'missing'
      },
      clientSide: {
        hasApiKey: !!clientApiKey,
        apiKeyPrefix: clientApiKey ? `${clientApiKey.substring(0, 8)}...` : 'Not found',
        status: clientApiKey ? 'configured' : 'missing',
        warning: clientApiKey ? 'Client-side API key is exposed to browsers' : null
      },
      envVars: {
        OPENROUTER_API_KEY: !!serverApiKey,
        NEXT_PUBLIC_OPENROUTER_API_KEY: !!clientApiKey,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'Not set',
      },
      security: {
        recommendation: 'Use OPENROUTER_API_KEY for server-side operations only',
        warning: 'NEXT_PUBLIC_OPENROUTER_API_KEY should only be used for non-sensitive client-side operations'
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
