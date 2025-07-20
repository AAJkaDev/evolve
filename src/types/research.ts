// Type definitions for the research API

export interface SearchRequest {
  query: string;
  max_results?: number;
}

export interface Citation {
  id: number;
  url: string;
  title: string;
  snippet: string;
}

export interface SearchResponse {
  query: string;
  answer: string;
  citations: Citation[];
  sources: string[];
}

export interface ErrorResponse {
  error: string;
  details?: string;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  worker_url: string;
  worker_health?: unknown;
  worker_status?: number;
  error?: string;
  timestamp: string;
}
