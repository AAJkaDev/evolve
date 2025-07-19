import { validateEnvVars } from '@/config/env';
import { ImageResult } from './types';

// Pexels API response types
interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

interface PexelsResponse {
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  total_results: number;
  next_page?: string;
}

interface PexelsErrorResponse {
  error: string;
}

/**
 * Fetch educational images from Pexels API
 * 
 * Usage: Educational display only - not for wallpaper apps
 * Includes proper photographer attribution as required by Pexels license
 */
export async function fetchPexelsImages(query: string): Promise<ImageResult[]> {
  try {
    const { PEXELS_API_KEY } = validateEnvVars();
    
    // Build search URL with parameters for highest quality, most popular images
    const searchParams = new URLSearchParams({
      query: query.trim(),
      per_page: '15', // Get more images for better selection
      orientation: 'all', // Allow all orientations
      size: 'large', // Prefer larger images for better quality
      // Note: Pexels returns results by relevance and popularity by default
    });

    const response = await fetch(
      `https://api.pexels.com/v1/search?${searchParams}`,
      {
        method: 'GET',
        headers: {
          'Authorization': PEXELS_API_KEY || '',
          'User-Agent': 'EVOLVE-Educational-Platform/1.0',
        },
        // 10 second timeout
        signal: AbortSignal.timeout(10000),
      }
    );

    // Handle rate limiting (429) - return empty array as requested
    if (response.status === 429) {
      console.warn('Pexels API rate limit exceeded (429)');
      return [];
    }

    // Handle other HTTP errors
    if (!response.ok) {
      const errorData: PexelsErrorResponse = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`Pexels API error ${response.status}:`, errorData.error);
      return [];
    }

    const data: PexelsResponse = await response.json();
    
    // Map Pexels photos to our ImageResult format
    return data.photos.map((photo): ImageResult => ({
      id: photo.id,
      thumb: photo.src.medium, // Use medium size for thumbnails (responsive)
      full: photo.src.original, // Use original for full-size display
      alt: photo.alt || `Photo by ${photo.photographer}`, // Use Pexels alt text or fallback
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      pexelsUrl: photo.url, // Link back to Pexels for proper attribution
    }));

  } catch (error) {
    // Handle network errors, timeouts, etc.
    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        console.error('Pexels API request timed out');
      } else if (error.name === 'AbortError') {
        console.error('Pexels API request was aborted');
      } else {
        console.error('Error fetching from Pexels:', error.message);
      }
    } else {
      console.error('Unknown error fetching from Pexels:', error);
    }
    
    // Always return empty array on error - graceful degradation
    return [];
  }
}

/**
 * Get attribution text for a Pexels image
 * Use this to display proper credit as required by Pexels license
 */
export function getPexelsAttribution(image: ImageResult): string {
  return `Photo by ${image.photographer} on Pexels`;
}

/**
 * Get attribution HTML for a Pexels image with proper links
 * Use this for rich attribution display
 */
export function getPexelsAttributionHTML(image: ImageResult): string {
  return `Photo by <a href="${image.photographerUrl}" target="_blank" rel="noopener noreferrer">${image.photographer}</a> on <a href="${image.pexelsUrl}" target="_blank" rel="noopener noreferrer">Pexels</a>`;
}
