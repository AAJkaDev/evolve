import React from 'react';
import { youtubeAuth } from '@/services/youtubeAuth';
import { Share2, Heart } from 'lucide-react';

interface YouTubeActionsProps {
  videoId: string;
  videoTitle: string;
  isConnected: boolean; // Keep for future use when connection features are re-enabled
}

export const YouTubeActions: React.FC<YouTubeActionsProps> = ({
  videoId,
  videoTitle,
  isConnected // eslint-disable-line @typescript-eslint/no-unused-vars -- Keep for future use when connection features are re-enabled
}) => {
  // Removed playlist-related state since those features are hidden

  const handleShare = async () => {
    const shareUrl = youtubeAuth.getShareUrl(videoId);
    
    if (navigator.share) {
      // Use native share API if available
      try {
        await navigator.share({
          title: videoTitle,
          url: shareUrl
        });
      } catch {
        // User cancelled or error occurred, fallback to clipboard
        await copyToClipboard(shareUrl);
      }
    } else {
      // Fallback to clipboard
      await copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You might want to show a toast notification here
      console.log('Video URL copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Playlist functionality hidden (requires paid integration)
  // const handleAddToPlaylist = async (playlistId: string) => { ... }
  // const playlists = youtubeAuth.getPlaylists();

  // Always show Share and Like buttons (they work independently)
  // Hide Save to Playlist and connection messages

  return (
    <div className="flex items-center gap-4">
      {/* Share Button - Works independently */}
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-800 transition-colors group"
        title="Share video"
      >
        <Share2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
        <span className="font-medium">Share</span>
      </button>

      {/* Save to Playlist - HIDDEN (requires paid integration) */}
      {/* 
      <div className="relative">
        <button
          onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
          disabled={isAddingToPlaylist}
          className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-800 transition-colors group disabled:opacity-50"
          title="Save to playlist"
        >
          <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">
            {isAddingToPlaylist ? 'Saving...' : 'Save'}
          </span>
        </button>

        {showPlaylistMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-700 mb-2 px-2">
                Save to playlist
              </div>
              <div className="max-h-32 overflow-y-auto">
                {playlists.length > 0 ? (
                  playlists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => handleAddToPlaylist(playlist.id)}
                      className="w-full text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    >
                      <div className="font-medium truncate">{playlist.title}</div>
                      <div className="text-gray-500 text-xs">
                        {playlist.itemCount} videos
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-2 py-2 text-xs text-gray-500">
                    No playlists found
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      */}

      {/* Like Button - Works independently */}
      <button
        onClick={() => {
          // Open YouTube video in new tab for liking
          // We can't programmatically like videos due to YouTube API restrictions
          const watchUrl = youtubeAuth.getShareUrl(videoId);
          window.open(watchUrl, '_blank', 'noopener,noreferrer');
        }}
        className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-800 transition-colors group"
        title="Like on YouTube (opens in new tab)"
      >
        <Heart className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
        <span className="font-medium">Like</span>
      </button>

      {/* Close playlist menu when clicking outside - HIDDEN */}
      {/* 
      {showPlaylistMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowPlaylistMenu(false)}
        />
      )}
      */}
    </div>
  );
};
