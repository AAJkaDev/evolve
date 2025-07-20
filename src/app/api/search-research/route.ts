import { NextRequest, NextResponse } from 'next/server';

// Types for request/response data
interface SearchRequest {
  query: string;
  max_results?: number;
}

interface Citation {
  id: number;
  url: string;
  title: string;
  snippet: string;
}

interface SearchResponse {
  query: string;
  answer: string;
  citations: Citation[];
  sources: string[];
}

interface ErrorResponse {
  error: string;
  details?: string;
}

// Environment configuration
const PYTHON_WORKER_URL = process.env.PYTHON_WORKER_URL || 'http://localhost:8000';
const API_TIMEOUT = 300000; // 5 minutes for complex research tasks

// Utility function to validate request body
function validateSearchRequest(body: unknown): body is SearchRequest {
  return (
    typeof body === 'object' &&
    body !== null &&
    typeof (body as Record<string, unknown>).query === 'string' &&
    ((body as Record<string, unknown>).query as string).trim().length > 0 &&
    ((body as Record<string, unknown>).max_results === undefined || 
     (typeof (body as Record<string, unknown>).max_results === 'number' && 
      ((body as Record<string, unknown>).max_results as number) > 0 && 
      ((body as Record<string, unknown>).max_results as number) <= 20))
  );
}

// Utility function to handle timeout
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    
    if (!validateSearchRequest(body)) {
      return NextResponse.json<ErrorResponse>(
        { 
          error: 'Invalid request format',
          details: 'Request must include a valid query string and optional max_results (1-20)'
        },
        { status: 400 }
      );
    }

    const { query, max_results = 10 } = body;

    // Log the incoming request (without sensitive data)
    console.log(`[API] Research request received for query: "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`);
    
    // Prepare request to Python microservice
    const workerRequest: SearchRequest = {
      query,
      max_results
    };

    const workerUrl = `${PYTHON_WORKER_URL}/research`;
    
    // Make request to Python microservice with timeout
    const workerResponse = await withTimeout(
      fetch(workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'NextJS-API-Bridge/1.0'
        },
        body: JSON.stringify(workerRequest)
      }),
      API_TIMEOUT
    );

    // Check if the worker service is reachable
    if (!workerResponse.ok) {
      const errorText = await workerResponse.text();
      console.error(`[API] Python worker error (${workerResponse.status}):`, errorText);
      
      if (workerResponse.status === 404) {
        return NextResponse.json<ErrorResponse>(
          { 
            error: 'No relevant results found',
            details: 'The search did not return any relevant URLs or content'
          },
          { status: 404 }
        );
      }
      
      if (workerResponse.status >= 500) {
        return NextResponse.json<ErrorResponse>(
          { 
            error: 'Research service temporarily unavailable',
            details: 'The backend research service encountered an error. Please try again later.'
          },
          { status: 503 }
        );
      }
      
      return NextResponse.json<ErrorResponse>(
        { 
          error: 'Research request failed',
          details: `Service returned status ${workerResponse.status}`
        },
        { status: 502 }
      );
    }

    // Parse response from Python microservice
    const searchResult: SearchResponse = await workerResponse.json();
    
    // Validate response structure
    if (!searchResult.answer || !Array.isArray(searchResult.citations)) {
      console.error('[API] Invalid response format from Python worker:', searchResult);
      return NextResponse.json<ErrorResponse>(
        { 
          error: 'Invalid response format',
          details: 'The research service returned an unexpected response format'
        },
        { status: 502 }
      );
    }

    // Log successful completion
    console.log(`[API] Research completed successfully. Answer length: ${searchResult.answer.length}, Citations: ${searchResult.citations.length}`);

    // Sanitize and enhance the response
    const sanitizedResponse: SearchResponse = {
      query: searchResult.query,
      answer: searchResult.answer,
      citations: searchResult.citations.map((citation, index) => ({
        id: index + 1, // Ensure sequential IDs
        url: citation.url,
        title: citation.title || 'Untitled Source',
        snippet: citation.snippet || ''
      })),
      sources: searchResult.sources || []
    };

    // Return successful response
    return NextResponse.json<SearchResponse>(sanitizedResponse, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    // Handle different types of errors
    console.error('[API] Unexpected error in search-research route:', error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json<ErrorResponse>(
        { 
          error: 'Invalid JSON in request body',
          details: 'Please ensure the request body contains valid JSON'
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === 'Request timeout') {
      return NextResponse.json<ErrorResponse>(
        { 
          error: 'Research timeout',
          details: 'The research process took too long to complete. Please try with a more specific query.'
        },
        { status: 408 }
      );
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json<ErrorResponse>(
        { 
          error: 'Research service temporarily unavailable',
          details: 'The backend research service is not available. This feature requires a Python microservice to be running.'
        },
        { status: 503 }
      );
    }

    // Generic error response
    return NextResponse.json<ErrorResponse>(
      { 
        error: 'Internal server error',
        details: 'An unexpected error occurred while processing your research request'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    // Check if Python worker is accessible
    const healthUrl = `${PYTHON_WORKER_URL}/health`;
    const healthResponse = await withTimeout(
      fetch(healthUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'NextJS-API-Bridge/1.0'
        }
      }),
      5000 // 5 second timeout for health check
    );

    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      return NextResponse.json({
        status: 'healthy',
        worker_url: PYTHON_WORKER_URL,
        worker_health: healthData,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        status: 'degraded',
        worker_url: PYTHON_WORKER_URL,
        worker_status: healthResponse.status,
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }

  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      worker_url: PYTHON_WORKER_URL,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
