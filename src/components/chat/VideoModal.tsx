import React, { useEffect, useState } from 'react';
import { FiX, FiExternalLink } from 'react-icons/fi';
// import { YouTubeConnection } from '../youtube/YouTubeConnection'; // Hidden - requires paid integration
import { YouTubeActions } from '../youtube/YouTubeActions';
// import { YouTubeUser } from '@/services/youtubeAuth'; // Hidden - connection functionality disabled

interface VideoModalProps {
  videoId: string;
  title: string;
  channel: string;
  embedUrl: string;
  watchUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  videoId,
  title,
  channel,
  embedUrl,
  watchUrl,
  isOpen,
  onClose,
}) => {
  const [isYouTubeConnected] = useState(false); // Always false since connection is hidden
  // const [youtubeUser, setYoutubeUser] = useState<YouTubeUser | null>(null); // Hidden

  // const handleYouTubeConnectionChange = (connected: boolean, user: YouTubeUser | null) => {
  //   setIsYouTubeConnected(connected);
  //   setYoutubeUser(user);
  // }; // Hidden - connection functionality disabled

  // Handle keyboard shortcuts - must be called before any early returns
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {title}
            </h3>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-gray-600 truncate">
                {channel}
              </p>
              {/* YouTube Connection Status - HIDDEN (requires paid integration) */}
              {/* <YouTubeConnection onConnectionChange={handleYouTubeConnectionChange} /> */}
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            title="Close (Esc)"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Video Container */}
        <div className="relative bg-black">
          <div className="aspect-video">
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              loading="lazy"
            />
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="p-4 bg-white border-t border-gray-200">
          {/* YouTube Actions */}
          <div className="flex items-center justify-between mb-3">
            <YouTubeActions 
              videoId={videoId}
              videoTitle={title}
              isConnected={isYouTubeConnected}
            />
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
          
          {/* YouTube Compliance */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* YouTube Badge */}
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-red-600 rounded-sm flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">YouTube</span>
              </div>
              
              {/* Watch on YouTube Link */}
              <a
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                <FiExternalLink size={16} />
                <span>Watch on YouTube</span>
              </a>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="mt-3 text-xs text-gray-500 text-center">
            This video is embedded from YouTube for educational purposes. All rights belong to the original creator.
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
