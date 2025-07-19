import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { MediaSearchResponse } from '@/features/mediaSearch';

// Debounce utility
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Fetcher function for SWR
async function mediaSearchFetcher(url: string, query: string): Promise<MediaSearchResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    
    // Show global error toast for network failures
    if (response.status >= 500) {
      // Show global error toast for network failures
      if (typeof window !== 'undefined') {
        // Log server error for debugging
        console.error('Media search server error:', errorData.error);
      }
    } else if (response.status === 429) {
      // Rate limit - show specific message
      if (typeof window !== 'undefined') {
        console.warn('Media search rate limit exceeded');
      }
    }
    
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

interface UseMediaSearchResult {
  data: MediaSearchResponse | undefined;
  error: Error | undefined;
  isLoading: boolean;
}

/**
 * React hook for media search with debouncing and SWR caching
 * 
 * @param query - Search query string, null to disable search
 * @returns Object with data, error, and isLoading state
 */
export function useMediaSearch(query: string | null): UseMediaSearchResult {
  // Debounce the query by 600ms to avoid excessive API calls
  const debouncedQuery = useDebounce(query, 600);
  
  // Create SWR cache key - only when query is not null
  const swrKey = useMemo(() => {
    if (debouncedQuery === null || debouncedQuery.trim() === '') {
      return null;
    }
    return ['media', debouncedQuery.trim()];
  }, [debouncedQuery]);

  // Use SWR for data fetching with caching
  const { data, error, isLoading } = useSWR(
    swrKey,
    swrKey ? ([, query]) => mediaSearchFetcher('/api/media-search', query) : null,
    {
      // SWR configuration
      revalidateOnFocus: false, // Don't refetch on window focus
      revalidateOnReconnect: true, // Refetch on network reconnect
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
      errorRetryCount: 2, // Retry failed requests twice
      errorRetryInterval: 1000, // Wait 1 second between retries
      onError: (error) => {
        // Global error handling
        console.error('Media search error:', error);
        
        // Show global error toast for network failures
        if (typeof window !== 'undefined') {
          // Check if it's a network error
          if (error.message.includes('fetch') || error.message.includes('Network')) {
            // You can integrate with your toast system here
            // For now, we'll use console.error
            console.error('Network error during media search:', error.message);
          }
        }
      },
    }
  );

  return {
    data,
    error,
    isLoading: isLoading || false,
  };
}

export default useMediaSearch;
