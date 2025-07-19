import { Redis } from '@upstash/redis';

// Initialize Redis client (using Upstash Redis for serverless compatibility)
// Fallback to in-memory rate limiting for development
let redis: Redis | null = null;
try {
  // Only initialize Redis if environment variables are present
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (redisUrl && redisToken) {
    redis = Redis.fromEnv();
    console.log('Redis initialized successfully');
  } else {
    console.warn('Redis environment variables not found, using in-memory rate limiting for development');
  }
} catch (error) {
  console.warn('Redis initialization failed, using in-memory rate limiting for development:', error instanceof Error ? error.message : 'Unknown error');
  redis = null;
}

// In-memory rate limiting for development (when Redis is not available)
const memoryStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Token bucket rate limiter using Redis
 * 30 calls per minute per IP address
 */
export async function rateLimit(identifier: string): Promise<RateLimitResult> {
  const key = `rate_limit:${identifier}`;
  const window = 60; // 1 minute in seconds
  const limit = 30; // 30 requests per minute
  const now = Math.floor(Date.now() / 1000);
  
  // Use Redis if available, otherwise fall back to in-memory store
  if (redis) {
    try {
      // Simple Redis operations instead of pipeline to avoid URL parsing issues
      const current = await redis.get(key) as number | null;
      
      if (current === null) {
        // First request - set initial count
        await redis.setex(key, window, 1);
        return {
          success: true,
          limit,
          remaining: limit - 1,
          reset: now + window,
        };
      }
      
      if (current >= limit) {
        // Rate limit exceeded
        const ttl = await redis.ttl(key);
        return {
          success: false,
          limit,
          remaining: 0,
          reset: now + (ttl > 0 ? ttl : window),
        };
      }
      
      // Increment counter
      const newCount = await redis.incr(key);
      
      // Set expiration if it doesn't exist
      const ttl = await redis.ttl(key);
      if (ttl === -1) {
        await redis.expire(key, window);
      }
      
      return {
        success: true,
        limit,
        remaining: Math.max(0, limit - newCount),
        reset: now + (ttl > 0 ? ttl : window),
      };
      
    } catch (error) {
      console.error('Redis rate limiting error, falling back to in-memory:', error instanceof Error ? error.message : 'Unknown error');
      // Fall through to in-memory fallback
      redis = null; // Disable Redis for subsequent requests to avoid repeated errors
    }
  }
  
  // In-memory fallback for development
  const stored = memoryStore.get(identifier);
  
  // Clean up expired entries
  if (stored && stored.resetTime <= now) {
    memoryStore.delete(identifier);
  }
  
  const current = memoryStore.get(identifier);
  
  if (!current) {
    // First request - set initial count
    memoryStore.set(identifier, { count: 1, resetTime: now + window });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: now + window,
    };
  }
  
  if (current.count >= limit) {
    // Rate limit exceeded
    return {
      success: false,
      limit,
      remaining: 0,
      reset: current.resetTime,
    };
  }
  
  // Increment counter
  current.count++;
  memoryStore.set(identifier, current);
  
  return {
    success: true,
    limit,
    remaining: Math.max(0, limit - current.count),
    reset: current.resetTime,
  };
}

/**
 * Get client IP address from request headers
 */
export function getClientIP(request: Request): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to a default identifier
  return 'unknown';
}

/**
 * Middleware wrapper for API routes to apply rate limiting
 */
export function withRateLimit(handler: (request: Request) => Promise<Response>) {
  return async (request: Request): Promise<Response> => {
    // Skip rate limiting in development if Redis is not configured
    if (!redis && process.env.NODE_ENV === 'development') {
      console.log('Skipping rate limiting in development (Redis not configured)');
      return handler(request);
    }
    
    try {
      const clientIP = getClientIP(request);
      const rateLimitResult = await rateLimit(clientIP);
      
      if (!rateLimitResult.success) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded',
            limit: rateLimitResult.limit,
            remaining: rateLimitResult.remaining,
            reset: rateLimitResult.reset,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': rateLimitResult.limit.toString(),
              'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
              'X-RateLimit-Reset': rateLimitResult.reset.toString(),
            },
          }
        );
      }
      
      // Add rate limit headers to successful responses
      const response = await handler(request);
      
      // Clone response to add headers
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
        },
      });
      
      return newResponse;
    } catch (error) {
      console.error('Rate limiting middleware error:', error);
      // If rate limiting fails, just proceed with the request
      return handler(request);
    }
  };
}
