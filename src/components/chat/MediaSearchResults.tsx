import React, { useState } from 'react';
import { ImageGrid } from './ImageGrid';
import { VideoGrid } from './VideoGrid';
import { ImageResult, VideoResult } from '@/features/mediaSearch/types';

interface MediaSearchResultsProps {
  searchType: 'images' | 'videos' | 'both';
  query: string;
  results: {
    images?: ImageResult[];
    videos?: VideoResult[];
  };
}

export const MediaSearchResults: React.FC<MediaSearchResultsProps> = ({
  searchType,
  query,
  results,
}) => {
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>(
    searchType === 'videos' ? 'videos' : 'images'
  );

  const hasImages = results.images && results.images.length > 0;
  const hasVideos = results.videos && results.videos.length > 0;

  // If only one type of media, don't show tabs
  const showTabs = searchType === 'both' && hasImages && hasVideos;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {searchType === 'images' && 'Images for'}
            {searchType === 'videos' && 'Videos for'}
            {searchType === 'both' && 'Media results for'}
            {' "'}
            <span className="text-blue-600 dark:text-blue-400">{query}</span>
            {'"'}
          </h3>
          
          {/* Direct Search Link for Videos */}
          {(searchType === 'videos' || (searchType === 'both' && hasVideos)) && (
            <button
              onClick={() => {
                const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
                window.open(youtubeSearchUrl, '_blank', 'noopener,noreferrer');
              }}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 group"
              title="Search directly on YouTube"
            >
              <span className="font-medium">direct search</span>
              <span className="text-sm group-hover:translate-x-0.5 transition-transform duration-200">↗</span>
            </button>
          )}
        </div>
        
        {/* Tabs for 'both' search type */}
        {showTabs && (
          <div className="flex mt-2 space-x-1">
            {hasImages && (
              <button
                onClick={() => setActiveTab('images')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'images'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                }`}
              >
                Images ({results.images?.length || 0})
              </button>
            )}
            {hasVideos && (
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'videos'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                }`}
              >
                Videos ({results.videos?.length || 0})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Show images */}
        {((searchType === 'images' || searchType === 'both') && hasImages && 
          (!showTabs || activeTab === 'images')) && (
          <ImageGrid images={results.images!} />
        )}

        {/* Show videos */}
        {((searchType === 'videos' || searchType === 'both') && hasVideos && 
          (!showTabs || activeTab === 'videos')) && (
          <VideoGrid videos={results.videos!} query={query} />
        )}

        {/* No results message */}
        {!hasImages && !hasVideos && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No {searchType === 'both' ? 'media' : searchType} found for &ldquo;{query}&rdquo;</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaSearchResults;
