import { validateEnvVars } from '@/config/env';
import { VideoResult } from './types';
import { getReliableThumbnailUrl } from './thumbnailUtils';

// YouTube API response types
interface YouTubeSearchItem {
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
    channelTitle: string;
    liveBroadcastContent: string;
    publishTime: string;
  };
}

interface YouTubeSearchResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  regionCode: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubeSearchItem[];
}

interface YouTubeVideoDetails {
  id: string;
  contentDetails: {
    duration: string;
  };
}

interface YouTubeVideoDetailsResponse {
  kind: string;
  etag: string;
  items: YouTubeVideoDetails[];
}

interface YouTubeErrorResponse {
  error: {
    code: number;
    message: string;
    errors: Array<{
      message: string;
      domain: string;
      reason: string;
    }>;
  };
}

/**
 * Get YouTube thumbnail URL with reliable fallback
 * Uses the new thumbnail utilities for maximum reliability
 */
function getValidThumbnail(videoId: string): string {
  // Use the utility function for most reliable thumbnail URL
  const thumbnailUrl = getReliableThumbnailUrl(videoId);
  console.log(`Generated thumbnail URL for ${videoId}: ${thumbnailUrl}`);
  return thumbnailUrl;
}

/**
 * Parse YouTube duration format (PT#M#S) to seconds
 * Example: PT4M13S = 4 minutes 13 seconds = 253 seconds
 */
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Comprehensive check for short-form content
 * Filters out YouTube Shorts and other short-form indicators
 */
function isShorts(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  
  // Common short-form indicators
  const shortFormIndicators = [
    '#shorts',
    '#short',
    'shorts',
    'tiktok',
    'quick tip',
    'in 60 seconds',
    'in 30 seconds',
    'in seconds',
    '60 second',
    '30 second',
    'one minute',
    '1 minute',
    'quick',
    'fast',
    'rapid',
    'instant'
  ];
  
  // Check if title contains any short-form indicators
  return shortFormIndicators.some(indicator => lowerTitle.includes(indicator));
}

/**
 * Fetch educational videos from YouTube Data API v3
 * 
 * Uses search.list endpoint with educational focus
 * Filters out shorts and validates thumbnails
 */
export default async function fetchYouTube(query: string): Promise<VideoResult[]> {
  try {
    const { YT_API_KEY } = validateEnvVars();
    
    // Build search parameters for highest quality, most relevant content
    const searchParams = new URLSearchParams({
      part: 'snippet',
      q: query.trim(),
      type: 'video',
      maxResults: '4', // Limit to 4 videos for cleaner UI
      videoDefinition: 'high', // High definition videos only
      videoDuration: 'any', // We'll filter out shorts with enhanced detection below
      order: 'relevance', // Most relevant first (like YouTube search)
      videoEmbeddable: 'true', // Only embeddable videos
      videoSyndicated: 'true', // Only syndicated videos
      safeSearch: 'moderate', // Safe content
      key: YT_API_KEY || '',
    });

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${searchParams}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'EVOLVE-Educational-Platform/1.0',
        },
        // 10 second timeout for API call
        signal: AbortSignal.timeout(10000),
      }
    );

    // Handle quota exceeded (403) - return empty array
    if (response.status === 403) {
      const errorData: YouTubeErrorResponse = await response.json().catch(() => ({ 
        error: { code: 403, message: 'Quota exceeded', errors: [] } 
      }));
      
      // Check if it's specifically a quota error
      const isQuotaError = errorData.error.errors.some(
        err => err.reason === 'quotaExceeded' || err.reason === 'dailyLimitExceeded'
      );
      
      if (isQuotaError) {
        console.warn('YouTube API quota exceeded');
        return [];
      }
    }

    // Handle other HTTP errors
    if (!response.ok) {
      const errorData: YouTubeErrorResponse = await response.json().catch(() => ({ 
        error: { code: response.status, message: 'Unknown error', errors: [] } 
      }));
      console.error(`YouTube API error ${response.status}:`, errorData.error.message);
      return [];
    }

    const data: YouTubeSearchResponse = await response.json();
    
    // Filter out shorts based on title first
    const titleFilteredItems = data.items.filter(item => 
      item.id.videoId && !isShorts(item.snippet.title)
    );

    // Get video IDs for duration check
    const videoIds = titleFilteredItems.map(item => item.id.videoId).join(',');
    
    // Fetch video details to get actual durations
    let durationFilteredItems = titleFilteredItems;
    if (videoIds) {
      try {
        const detailsParams = new URLSearchParams({
          part: 'contentDetails',
          id: videoIds,
          key: YT_API_KEY || '',
        });

        const detailsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?${detailsParams}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'EVOLVE-Educational-Platform/1.0',
            },
            signal: AbortSignal.timeout(10000),
          }
        );

        if (detailsResponse.ok) {
          const detailsData: YouTubeVideoDetailsResponse = await detailsResponse.json();
          
          // Filter videos by duration (must be > 3 minutes)
          const validVideoIds = new Set(
            detailsData.items
              .filter((video: YouTubeVideoDetails) => {
                const duration = parseDuration(video.contentDetails.duration);
                return duration >= 180; // 3 minutes in seconds
              })
              .map((video: YouTubeVideoDetails) => video.id)
          );
          
          // Keep only videos that meet duration requirement
          durationFilteredItems = titleFilteredItems.filter(item => 
            validVideoIds.has(item.id.videoId)
          );
        }
      } catch (error) {
        console.warn('Failed to fetch video durations, using title filtering only:', error);
      }
    }

    // Process each video with thumbnail validation
    const videoResults: VideoResult[] = [];
    
    for (const item of durationFilteredItems) {
      try {
        const videoId = item.id.videoId;
        
        // Get reliable thumbnail URL
        const validThumbnail = getValidThumbnail(videoId);
        
        const videoResult: VideoResult = {
          id: videoId,
          title: item.snippet.title,
          channel: item.snippet.channelTitle,
          thumb: validThumbnail,
          published: item.snippet.publishedAt,
          description: item.snippet.description.length > 200 
            ? item.snippet.description.substring(0, 200) + '...'
            : item.snippet.description,
          watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
        };
        
        videoResults.push(videoResult);
        
      } catch (error) {
        // Skip this video on thumbnail validation error
        console.warn(`Failed to process video ${item.id.videoId}:`, error);
        continue;
      }
    }

    return videoResults;

  } catch (error) {
    // Handle network errors, timeouts, etc.
    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        console.error('YouTube API request timed out');
      } else if (error.name === 'AbortError') {
        console.error('YouTube API request was aborted');
      } else {
        console.error('Error fetching from YouTube:', error.message);
      }
    } else {
      console.error('Unknown error fetching from YouTube:', error);
    }
    
    // Always return empty array on error - graceful degradation
    return [];
  }
}

/**
 * Get YouTube video embed URL with additional parameters
 */
export function getYouTubeEmbedUrl(videoId: string, options?: {
  autoplay?: boolean;
  controls?: boolean;
  modestbranding?: boolean;
}): string {
  const params = new URLSearchParams();
  
  if (options?.autoplay) params.set('autoplay', '1');
  if (options?.controls === false) params.set('controls', '0');
  if (options?.modestbranding) params.set('modestbranding', '1');
  
  const queryString = params.toString();
  return `https://www.youtube.com/embed/${videoId}${queryString ? `?${queryString}` : ''}`;
}

/**
 * Get YouTube video watch URL with timestamp
 */
export function getYouTubeWatchUrl(videoId: string, startTime?: number): string {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  return startTime ? `${url}&t=${startTime}s` : url;
}
