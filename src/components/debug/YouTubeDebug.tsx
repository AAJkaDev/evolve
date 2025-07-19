import React, { useState } from 'react';
import { youtubeAuth } from '@/services/youtubeAuth';
import { validateEnvVars } from '@/config/env';

export const YouTubeDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    let info = 'YouTube Authentication Diagnostics:\n\n';

    try {
      // Check environment variables
      info += '1. Environment Variables:\n';
      const env = validateEnvVars();
      info += `   ✅ PEXELS_API_KEY: ${env.PEXELS_API_KEY ? 'Present' : 'Missing'}\n`;
      info += `   ✅ YT_API_KEY: ${env.YT_API_KEY ? 'Present' : 'Missing'}\n`;
      info += `   ✅ GOOGLE_CLIENT_ID: ${env.GOOGLE_CLIENT_ID ? 'Present' : 'Missing'}\n`;
      info += `   📝 Client ID: ${env.GOOGLE_CLIENT_ID?.substring(0, 20)}...\n\n`;

      // Check if Google API is available
      info += '2. Google API Status:\n';
      info += `   🌐 window.gapi: ${window.gapi ? 'Available' : 'Not loaded'}\n`;
      if (window.gapi) {
        info += `   🔧 gapi.load: Available\n`;
        info += `   🔐 gapi.auth2: ${window.gapi.auth2 ? 'Available' : 'Not loaded'}\n`;
      }
      info += '\n';

      // Check current auth state
      info += '3. Current Auth State:\n';
      info += `   🔑 Is Signed In: ${youtubeAuth.isSignedIn()}\n`;
      const user = youtubeAuth.getUser();
      if (user) {
        info += `   👤 User: ${user.name} (${user.email})\n`;
        info += `   🎵 Playlists: ${youtubeAuth.getPlaylists().length}\n`;
      }
      info += '\n';

      // Check localStorage
      info += '4. Local Storage:\n';
      const token = localStorage.getItem('youtube_auth_token');
      const userData = localStorage.getItem('youtube_user');
      const playlists = localStorage.getItem('youtube_playlists');
      info += `   🎫 Token: ${token ? 'Present' : 'Missing'}\n`;
      info += `   👤 User Data: ${userData ? 'Present' : 'Missing'}\n`;
      info += `   📋 Playlists: ${playlists ? 'Present' : 'Missing'}\n\n`;

      // Test Google API loading
      info += '5. Testing Google API Load:\n';
      try {
        // Try to load Google API
        await new Promise<void>((resolve, reject) => {
          if (window.gapi) {
            info += '   ✅ Google API already loaded\n';
            resolve();
            return;
          }

          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js';
          script.onload = () => {
            info += '   ✅ Google API script loaded successfully\n';
            resolve();
          };
          script.onerror = () => {
            info += '   ❌ Failed to load Google API script\n';
            reject(new Error('Script load failed'));
          };
          document.head.appendChild(script);
        });

        // Wait for gapi to be available
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (window.gapi) {
          info += '   ✅ gapi object is available\n';
        } else {
          info += '   ❌ gapi object not available after script load\n';
        }
      } catch (error) {
        info += `   ❌ Google API load test failed: ${error}\n`;
      }

    } catch (error) {
      info += `\n❌ Diagnostics failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`;
    }

    setDebugInfo(info);
    setIsLoading(false);
  };

  const testSignIn = async () => {
    setIsLoading(true);
    try {
      const user = await youtubeAuth.signIn();
      setDebugInfo(prev => prev + `\n✅ Sign-in successful: ${user.name}\n`);
    } catch (error) {
      setDebugInfo(prev => prev + `\n❌ Sign-in failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }
    setIsLoading(false);
  };

  const clearStorage = () => {
    localStorage.removeItem('youtube_auth_token');
    localStorage.removeItem('youtube_user');
    localStorage.removeItem('youtube_playlists');
    setDebugInfo(prev => prev + '\n🧹 Local storage cleared\n');
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">YouTube Auth Debug</h3>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={runDiagnostics}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Running...' : 'Run Diagnostics'}
        </button>
        
        <button
          onClick={testSignIn}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Test Sign In
        </button>
        
        <button
          onClick={clearStorage}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Clear Storage
        </button>
      </div>

      {debugInfo && (
        <pre className="bg-white p-4 rounded border text-sm overflow-auto max-h-96 whitespace-pre-wrap">
          {debugInfo}
        </pre>
      )}
    </div>
  );
};
