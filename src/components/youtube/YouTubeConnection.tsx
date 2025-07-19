import React, { useState, useEffect } from 'react';
import { youtubeAuth, YouTubeUser } from '@/services/youtubeAuth';

interface YouTubeConnectionProps {
  onConnectionChange?: (connected: boolean, user: YouTubeUser | null) => void;
}

export const YouTubeConnection: React.FC<YouTubeConnectionProps> = ({ 
  onConnectionChange 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<YouTubeUser | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check initial connection status
    const connected = youtubeAuth.isSignedIn();
    const currentUser = youtubeAuth.getUser();
    
    setIsConnected(connected);
    setUser(currentUser);
    
    // Notify parent component
    onConnectionChange?.(connected, currentUser);
  }, [onConnectionChange]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const connectedUser = await youtubeAuth.signIn();
      setIsConnected(true);
      setUser(connectedUser);
      onConnectionChange?.(true, connectedUser);
    } catch (error) {
      console.error('Failed to connect to YouTube:', error);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to YouTube';
      alert(`Connection failed: ${errorMessage}`);
      
      // Reset connection state
      setIsConnected(false);
      setUser(null);
      onConnectionChange?.(false, null);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await youtubeAuth.signOut();
      setIsConnected(false);
      setUser(null);
      onConnectionChange?.(false, null);
    } catch (error) {
      console.error('Failed to disconnect from YouTube:', error);
    }
  };

  if (isConnected && user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <img 
            src={user.picture} 
            alt={user.name}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-xs text-gray-600 font-medium">
            {user.name}
          </span>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          title="Disconnect YouTube account"
        >
          disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
      title="Connect your YouTube account to save videos and access playlists"
    >
      <div className="w-4 h-4 bg-red-600 rounded-sm flex items-center justify-center">
        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      </div>
      <span className="font-medium">
        {isConnecting ? 'connecting...' : 'connect youtube'}
      </span>
    </button>
  );
};
