/**
 * Environment Variables Configuration
 * 
 * Required environment variables for the media search feature:
 * 
 * Add these to your .env.local file:
 * PEXELS_API_KEY=f9Mbfd58FNQZLNUJOJEzesEC2eUKeCRV8ShxYErIrFTDSFyeE7nVn62c
 * YT_API_KEY=AIzaSyCLGO2oiUausQS5O7lZB21fBwMHWmRuPfk
 * GOOGLE_CLIENT_ID=319885625479-dcs6da1j4qaurb52dfbnivqtrlh98nap.apps.googleusercontent.com
 * 
 * Also add these to your Supabase project secrets for production deployment.
 */

// Fallback API keys for development (updated with user's provided keys)
const FALLBACK_KEYS = {
  PEXELS_API_KEY: 'f9Mbfd58FNQZLNUJOJEzesEC2eUKeCRV8ShxYErIrFTDSFyeE7nVn62c',
  YT_API_KEY: 'AIzaSyCLGO2oiUausQS5O7lZB21fBwMHWmRuPfk', // User's YouTube Data API v3 key
  GOOGLE_CLIENT_ID: '319885625479-dcs6da1j4qaurb52dfbnivqtrlh98nap.apps.googleusercontent.com', // User's Google OAuth Client ID
};

export const ENV_CONFIG = {
  PEXELS_API_KEY: process.env.PEXELS_API_KEY || FALLBACK_KEYS.PEXELS_API_KEY,
  YT_API_KEY: process.env.YT_API_KEY || FALLBACK_KEYS.YT_API_KEY,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || FALLBACK_KEYS.GOOGLE_CLIENT_ID,
} as const;

// Validate required environment variables
export function validateEnvVars() {
  const missing = [];
  const usingFallbacks = [];
  
  if (!ENV_CONFIG.PEXELS_API_KEY) {
    missing.push('PEXELS_API_KEY');
  } else if (ENV_CONFIG.PEXELS_API_KEY === FALLBACK_KEYS.PEXELS_API_KEY) {
    usingFallbacks.push('PEXELS_API_KEY');
  }
  
  if (!ENV_CONFIG.YT_API_KEY) {
    missing.push('YT_API_KEY');
  } else if (ENV_CONFIG.YT_API_KEY === FALLBACK_KEYS.YT_API_KEY) {
    usingFallbacks.push('YT_API_KEY');
  }
  
  if (!ENV_CONFIG.GOOGLE_CLIENT_ID) {
    missing.push('GOOGLE_CLIENT_ID');
  } else if (ENV_CONFIG.GOOGLE_CLIENT_ID === FALLBACK_KEYS.GOOGLE_CLIENT_ID) {
    usingFallbacks.push('GOOGLE_CLIENT_ID');
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please add them to your .env.local file and Supabase secrets.'
    );
  }
  
  if (usingFallbacks.length > 0) {
    console.warn(
      `Using fallback API keys for development: ${usingFallbacks.join(', ')}\n` +
      'For production, add your own keys to .env.local and Supabase secrets.'
    );
  }
  
  return ENV_CONFIG;
}
