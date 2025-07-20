import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { SearchRequest, SearchResponse, ErrorResponse } from '@/types/research';

interface UseResearchOptions {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  refreshInterval?: number;
}

interface UseResearchReturn {
  // Data states
  data: SearchResponse | null;
  error: ErrorResponse | null;
  isLoading: boolean;
  isValidating: boolean;
  
  // Actions
  research: (query: string, maxResults?: number) => Promise<SearchResponse | null>;
  clear: () => void;
  retry: () => void;
  
  // Current query state
  currentQuery: string | null;
}

// SWR fetcher function
const researchFetcher = async (url: string, request: SearchRequest): Promise<SearchResponse> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json();
    const error = new Error(errorData.error || 'Research request failed');
    (error as unknown as { info: ErrorResponse; status: number }).info = errorData;
    (error as unknown as { info: ErrorResponse; status: number }).status = response.status;
    throw error;
  }

  return response.json();
};

// Health check fetcher
const healthFetcher = async (url: string) => {
  const response = await fetch(url);
  return response.json();
};

export function useResearch(options: UseResearchOptions = {}): UseResearchReturn {
  const [currentQuery, setCurrentQuery] = useState<string | null>(null);
  const [currentRequest, setCurrentRequest] = useState<SearchRequest | null>(null);

  // SWR configuration
  const swrOptions = {
    revalidateOnFocus: options.revalidateOnFocus ?? false,
    revalidateOnReconnect: options.revalidateOnReconnect ?? true,
    refreshInterval: options.refreshInterval ?? 0,
    shouldRetryOnError: true,
    errorRetryCount: 2,
    errorRetryInterval: 5000,
  };

  // Main research SWR hook
  const {
    data,
    error: swrError,
    isLoading,
    isValidating,
    mutate: mutateSWR,
  } = useSWR(
    currentRequest ? ['/api/search-research', currentRequest] : null,
    ([url, request]) => researchFetcher(url, request),
    swrOptions
  );


  // Transform SWR error to our error format
  const error: ErrorResponse | null = swrError 
    ? {
        error: swrError.message,
        details: swrError.info?.details || 'An unexpected error occurred',
      }
    : null;

  // Research function
  const research = useCallback(async (
    query: string, 
    maxResults: number = 10
  ): Promise<SearchResponse | null> => {
      if (!query.trim()) {
        throw new Error('Query cannot be empty');
      }

      if (maxResults < 1 || maxResults > 20) {
        throw new Error('maxResults must be between 1 and 20');
      }

      const request: SearchRequest = {
        query: query.trim(),
        max_results: maxResults,
      };

      // Check if the current query and request are the same to avoid duplicate requests
      if (query === currentQuery) {
        return null;
      }

      setCurrentQuery(query);
      setCurrentRequest(request);

      try {
        // Mutate with the new request to trigger SWR
        const result = await mutateSWR(
          researchFetcher('/api/search-research', request),
          {
            revalidate: false,
          }
        );
        
        return result || null;
      } catch (err) {
        // Error will be handled by SWR and available in the error state
        console.error('Research failed:', err);
        return null;
      }
  }, [currentQuery, mutateSWR]);

  // Clear function
  const clear = useCallback(() => {
    setCurrentQuery(null);
    setCurrentRequest(null);
    mutateSWR(undefined, { revalidate: false });
  }, [mutateSWR]);

  // Retry function
  const retry = useCallback(() => {
    if (currentRequest) {
      mutateSWR();
    }
  }, [currentRequest, mutateSWR]);

  return {
    data: data || null,
    error,
    isLoading,
    isValidating,
    research,
    clear,
    retry,
    currentQuery,
  };
}

// Hook for health status
export function useResearchHealth() {
  const { data, error, isLoading } = useSWR(
    '/api/search-research',
    healthFetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: false,
      shouldRetryOnError: true,
      errorRetryCount: 3,
    }
  );

  return {
    isHealthy: data?.status === 'healthy',
    isDegraded: data?.status === 'degraded',
    isUnhealthy: data?.status === 'unhealthy' || !!error,
    healthData: data,
    isLoading,
    error,
  };
}
