/**
 * YouTube Thumbnail Utilities
 * 
 * Comprehensive thumbnail URL generation and validation for YouTube videos
 * Handles all YouTube thumbnail domains and quality levels with robust fallbacks
 */

export interface ThumbnailOptions {
  quality?: 'maxres' | 'hq' | 'mq' | 'default';
  domain?: 'i.ytimg.com' | 'i3.ytimg.com' | 'img.youtube.com';
}

/**
 * All available YouTube thumbnail domains
 */
export const YOUTUBE_DOMAINS = [
  'i.ytimg.com',
  'i3.ytimg.com', 
  'img.youtube.com'
] as const;

/**
 * All available YouTube thumbnail qualities
 */
export const THUMBNAIL_QUALITIES = [
  'hqdefault',    // High quality (480x360) - most reliable
  'mqdefault',    // Medium quality (320x180)
  'default',      // Default quality (120x90)
  'maxresdefault' // Maximum resolution (1280x720) - not always available
] as const;

/**
 * Generate YouTube thumbnail URL
 */
export function generateThumbnailUrl(
  videoId: string, 
  quality: typeof THUMBNAIL_QUALITIES[number] = 'hqdefault',
  domain: typeof YOUTUBE_DOMAINS[number] = 'i.ytimg.com'
): string {
  return `https://${domain}/vi/${videoId}/${quality}.jpg`;
}

/**
 * Get the most reliable thumbnail URL for a YouTube video
 * Uses hqdefault with i.ytimg.com as it's available for 99.9% of videos
 */
export function getReliableThumbnailUrl(videoId: string): string {
  return generateThumbnailUrl(videoId, 'hqdefault', 'i.ytimg.com');
}

/**
 * Generate complete fallback chain for YouTube thumbnails
 * Returns array of URLs in order of reliability
 */
export function getThumbnailFallbackChain(videoId: string): string[] {
  const fallbackUrls: string[] = [];
  
  // Start with most reliable combinations
  fallbackUrls.push(generateThumbnailUrl(videoId, 'hqdefault', 'i.ytimg.com'));
  fallbackUrls.push(generateThumbnailUrl(videoId, 'hqdefault', 'i3.ytimg.com'));
  fallbackUrls.push(generateThumbnailUrl(videoId, 'hqdefault', 'img.youtube.com'));
  
  // Try maxres (higher quality but less reliable)
  fallbackUrls.push(generateThumbnailUrl(videoId, 'maxresdefault', 'img.youtube.com'));
  fallbackUrls.push(generateThumbnailUrl(videoId, 'maxresdefault', 'i.ytimg.com'));
  
  // Medium quality fallbacks
  fallbackUrls.push(generateThumbnailUrl(videoId, 'mqdefault', 'i.ytimg.com'));
  fallbackUrls.push(generateThumbnailUrl(videoId, 'mqdefault', 'i3.ytimg.com'));
  fallbackUrls.push(generateThumbnailUrl(videoId, 'mqdefault', 'img.youtube.com'));
  
  // Default quality fallbacks (lowest quality but most reliable)
  fallbackUrls.push(generateThumbnailUrl(videoId, 'default', 'i.ytimg.com'));
  fallbackUrls.push(generateThumbnailUrl(videoId, 'default', 'i3.ytimg.com'));
  fallbackUrls.push(generateThumbnailUrl(videoId, 'default', 'img.youtube.com'));
  
  return fallbackUrls;
}

/**
 * Get next thumbnail URL in fallback chain
 */
export function getNextThumbnailUrl(videoId: string, currentUrl: string): string | null {
  const fallbackChain = getThumbnailFallbackChain(videoId);
  const currentIndex = fallbackChain.indexOf(currentUrl);
  
  if (currentIndex === -1 || currentIndex >= fallbackChain.length - 1) {
    return null; // No more fallbacks available
  }
  
  return fallbackChain[currentIndex + 1];
}

/**
 * Validate if a thumbnail URL is working
 * Returns a promise that resolves to true if the image loads successfully
 */
export function validateThumbnailUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      // Check if image has valid dimensions
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    };
    
    img.onerror = () => resolve(false);
    
    // Set timeout to avoid hanging
    setTimeout(() => resolve(false), 5000);
    
    img.src = url;
  });
}

/**
 * Find the first working thumbnail URL from the fallback chain
 * Returns a promise that resolves to the first working URL or null
 */
export async function findWorkingThumbnailUrl(videoId: string): Promise<string | null> {
  const fallbackChain = getThumbnailFallbackChain(videoId);
  
  for (const url of fallbackChain) {
    const isWorking = await validateThumbnailUrl(url);
    if (isWorking) {
      return url;
    }
  }
  
  return null; // No working thumbnail found
}

/**
 * Extract video ID from YouTube URL
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Check if video ID is valid (11 characters, alphanumeric and some special chars)
 */
export function isValidVideoId(videoId: string): boolean {
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
}
