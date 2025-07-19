import React, { useState } from 'react';
import { VideoResult } from '@/features/mediaSearch';
import VideoModal from './VideoModal';
import { Play, ExternalLink } from 'lucide-react';

interface VideoGridProps {
  videos: VideoResult[];
  query?: string;
}

export const VideoGrid: React.FC<VideoGridProps> = ({ videos, query }) => {
  const [selectedVideo, setSelectedVideo] = useState<VideoResult | null>(null);
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);

  const handleVideoClick = (video: VideoResult) => {
    setSelectedVideo(video);
  };

  const handleCloseModal = () => {
    setSelectedVideo(null);
  };

  const handleWatchOnYouTube = (e: React.MouseEvent, watchUrl: string) => {
    e.stopPropagation();
    window.open(watchUrl, '_blank', 'noopener,noreferrer');
  };

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <Play className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium">No videos found</p>
        <p className="text-xs mt-1">Try a different search term</p>
      </div>
    );
  }

  return (
    <>
      {/* Results Info */}
      {query && (
        <div className="mb-4 pb-3 border-b border-gray-100">
          <p className="text-xs text-gray-500">
            Showing {videos.length} curated results
          </p>
        </div>
      )}

      {/* Minimal Grid Layout - 2x2 for 4 videos */}
      <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="group relative bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            onMouseEnter={() => setHoveredVideo(video.id)}
            onMouseLeave={() => setHoveredVideo(null)}
          >
            {/* YouTube Embed Container */}
            <div className="relative aspect-video bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1&showinfo=0&controls=1`}
                title={video.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading={index < 4 ? 'eager' : 'lazy'}
                referrerPolicy="strict-origin-when-cross-origin"
              />
              
              {/* Hover Overlay with Actions */}
              <div className={`absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-200 ${
                hoveredVideo === video.id ? 'opacity-100' : 'opacity-0'
              }`}>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVideoClick(video)}
                    className="bg-white/90 hover:bg-white text-gray-900 p-2.5 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
                    title="View in modal"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleWatchOnYouTube(e, video.watchUrl)}
                    className="bg-red-600/90 hover:bg-red-600 text-white p-2.5 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
                    title="Watch on YouTube"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Minimal Video Info */}
            <div className="p-3">
              <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2 mb-1.5">
                {video.title}
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                {video.channel}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Video Modal */}
      {selectedVideo && (
        <VideoModal
          videoId={selectedVideo.id}
          title={selectedVideo.title}
          channel={selectedVideo.channel}
          embedUrl={selectedVideo.embedUrl}
          watchUrl={selectedVideo.watchUrl}
          isOpen={!!selectedVideo}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default VideoGrid;
