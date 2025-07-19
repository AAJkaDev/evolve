import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withRateLimit } from '@/lib/ratelimit';
import { MediaSearchResponse } from '@/features/mediaSearch';
import { fetchPexelsImages } from '@/features/mediaSearch/pexels';
import fetchYouTube from '@/features/mediaSearch/youtube';

// Input validation schema
const MediaSearchRequestSchema = z.object({
  query: z.string()
    .trim()
    .min(3, 'Query must be at least 3 characters')
    .max(500, 'Query must be at most 500 characters'),
});





/**
 * Main API handler
 */
async function handleMediaSearch(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { query } = MediaSearchRequestSchema.parse(body);

    // Fetch from both sources in parallel
    const [images, videos] = await Promise.all([
      fetchPexelsImages(query),
      fetchYouTube(query),
    ]);

    // Prepare response
    const response: MediaSearchResponse = {
      images,
      videos,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });

  } catch (error) {
    console.error('Media search API error:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request',
          details: error.errors,
        },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}

// Export POST handler with rate limiting
export const POST = withRateLimit(async (request: Request) => {
  return handleMediaSearch(request as NextRequest);
});
