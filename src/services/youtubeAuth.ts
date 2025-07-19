import { validateEnvVars } from '@/config/env';

// YouTube OAuth scopes needed for our features
const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl'
].join(' ');

export interface YouTubeUser {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  itemCount: number;
}

class YouTubeAuthService {
  private accessToken: string | null = null;
  private user: YouTubeUser | null = null;
  private playlists: YouTubePlaylist[] = [];

  constructor() {
    // Only load auth state on client-side
    if (typeof window !== 'undefined') {
      this.loadAuthState();
    }
  }

  /**
   * Initialize Google OAuth and sign in user
   */
  async signIn(): Promise<YouTubeUser> {
    try {
      console.log('Starting YouTube sign-in process...');
      
      const { GOOGLE_CLIENT_ID } = validateEnvVars();
      console.log('Using Google Client ID:', GOOGLE_CLIENT_ID ? 'Present' : 'Missing');
      
      if (!GOOGLE_CLIENT_ID) {
        throw new Error('Google Client ID is not configured');
      }
      
      // Load Google API
      console.log('Loading Google API...');
      await this.loadGoogleAPI();
      console.log('Google API loaded successfully');
      
      // Initialize Google Auth
      console.log('Initializing Google Auth...');
      await new Promise<void>((resolve, reject) => {
        try {
          window.gapi.load('auth2', () => {
            console.log('Auth2 module loaded, initializing...');
            window.gapi.auth2.init({
              client_id: GOOGLE_CLIENT_ID,
              scope: YOUTUBE_SCOPES
            }).then(() => {
              console.log('Google Auth initialized successfully');
              resolve();
            }).catch((initError: Error) => {
              console.error('Google Auth initialization failed:', initError);
              reject(initError);
            });
          });
        } catch (loadError) {
          console.error('Failed to load auth2 module:', loadError);
          reject(loadError);
        }
      });

      // Sign in user
      console.log('Getting auth instance...');
      const authInstance = window.gapi.auth2.getAuthInstance();
      
      if (!authInstance) {
        throw new Error('Failed to get Google Auth instance');
      }
      
      console.log('Prompting user to sign in...');
      const googleUser = await authInstance.signIn({
        prompt: 'select_account'
      });
      
      if (!googleUser) {
        throw new Error('User cancelled sign-in or sign-in failed');
      }
      
      console.log('User signed in successfully');
      
      // Get access token and user info
      const authResponse = googleUser.getAuthResponse();
      if (!authResponse || !authResponse.access_token) {
        throw new Error('Failed to get access token from Google');
      }
      
      this.accessToken = authResponse.access_token;
      const profile = googleUser.getBasicProfile();
      
      if (!profile) {
        throw new Error('Failed to get user profile from Google');
      }
      
      this.user = {
        id: profile.getId(),
        name: profile.getName(),
        email: profile.getEmail(),
        picture: profile.getImageUrl()
      };

      console.log('User profile retrieved:', this.user.name);

      // Save auth state
      this.saveAuthState();
      
      // Load user's playlists
      console.log('Loading user playlists...');
      await this.loadPlaylists();
      
      console.log('YouTube sign-in completed successfully');
      return this.user;
    } catch (error) {
      console.error('YouTube sign-in failed:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('popup_blocked')) {
          throw new Error('Sign-in popup was blocked. Please allow popups for this site.');
        } else if (error.message.includes('access_denied')) {
          throw new Error('Access denied. Please grant permission to access your YouTube account.');
        } else if (error.message.includes('network')) {
          throw new Error('Network error. Please check your internet connection.');
        }
        throw error;
      }
      
      throw new Error('Failed to connect to YouTube account. Please try again.');
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      
      this.accessToken = null;
      this.user = null;
      this.playlists = [];
      
      // Clear saved auth state (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('youtube_auth_token');
        localStorage.removeItem('youtube_user');
        localStorage.removeItem('youtube_playlists');
      }
    } catch (error) {
      console.error('YouTube sign-out failed:', error);
    }
  }

  /**
   * Check if user is signed in
   */
  isSignedIn(): boolean {
    return this.accessToken !== null && this.user !== null;
  }

  /**
   * Get current user
   */
  getUser(): YouTubeUser | null {
    return this.user;
  }

  /**
   * Get user's playlists
   */
  getPlaylists(): YouTubePlaylist[] {
    return this.playlists;
  }

  /**
   * Add video to playlist
   */
  async addToPlaylist(playlistId: string, videoId: string): Promise<void> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch('https://www.googleapis.com/youtube/v3/playlistItems', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snippet: {
            playlistId: playlistId,
            resourceId: {
              kind: 'youtube#video',
              videoId: videoId
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add video to playlist');
      }
    } catch (error) {
      console.error('Error adding to playlist:', error);
      throw error;
    }
  }

  /**
   * Share video (get shareable URL)
   */
  getShareUrl(videoId: string): string {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  /**
   * Load Google API script
   */
  private async loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if Google API is already loaded
      if (window.gapi) {
        console.log('Google API already loaded');
        resolve();
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src="https://apis.google.com/js/api.js"]');
      if (existingScript) {
        console.log('Google API script already exists, waiting for load...');
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Google API')));
        return;
      }

      console.log('Loading Google API script...');
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('Google API script loaded');
        // Wait a bit for gapi to be fully initialized
        setTimeout(() => {
          if (window.gapi) {
            resolve();
          } else {
            reject(new Error('Google API loaded but gapi object not available'));
          }
        }, 100);
      };
      
      script.onerror = (error) => {
        console.error('Failed to load Google API script:', error);
        reject(new Error('Failed to load Google API script'));
      };
      
      document.head.appendChild(script);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        reject(new Error('Google API loading timed out'));
      }, 10000);
    });
  }

  /**
   * Load user's playlists from YouTube API
   */
  private async loadPlaylists(): Promise<void> {
    if (!this.accessToken) return;

    try {
      const response = await fetch(
        'https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=50',
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        this.playlists = data.items.map((item: { id: string, snippet: { title: string, description: string }, contentDetails: { itemCount: number } }) => ({
          id: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          itemCount: item.contentDetails.itemCount
        }));

        // Save playlists to localStorage (client-side only)
        if (typeof window !== 'undefined') {
          localStorage.setItem('youtube_playlists', JSON.stringify(this.playlists));
        }
      }
    } catch (error) {
      console.error('Failed to load playlists:', error);
    }
  }

  /**
   * Save auth state to localStorage
   */
  private saveAuthState(): void {
    if (typeof window !== 'undefined') {
      if (this.accessToken) {
        localStorage.setItem('youtube_auth_token', this.accessToken);
      }
      if (this.user) {
        localStorage.setItem('youtube_user', JSON.stringify(this.user));
      }
    }
  }

  /**
   * Load auth state from localStorage
   */
  private loadAuthState(): void {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('youtube_auth_token');
    const userStr = localStorage.getItem('youtube_user');
    const playlistsStr = localStorage.getItem('youtube_playlists');

    if (token) {
      this.accessToken = token;
    }
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
      } catch {
        console.error('Failed to parse saved user data');
      }
    }
    if (playlistsStr) {
      try {
        this.playlists = JSON.parse(playlistsStr);
      } catch {
        console.error('Failed to parse saved playlists data');
      }
    }
  }
}

// Global instance
export const youtubeAuth = new YouTubeAuthService();

// Type declarations for Google API
interface GoogleUser {
  getAuthResponse: () => { access_token: string };
  getBasicProfile: () => {
    getId: () => string;
    getName: () => string;
    getEmail: () => string;
    getImageUrl: () => string;
  };
}

interface GAPIAuth2 {
  init: (config: { client_id: string; scope: string }) => Promise<void>;
  getAuthInstance: () => {
    signIn: (options: { prompt: string }) => Promise<GoogleUser>;
    signOut: () => Promise<void>;
  };
}

interface GAPI {
  load: (module: string, callback: () => void) => void;
  auth2: GAPIAuth2;
}

declare global {
  interface Window {
    gapi: GAPI;
  }
}
