/**
 * Thumbnail Test Component
 * 
 * Debug component to test YouTube thumbnail loading with various fallback strategies
 */

import React, { useState, useEffect } from 'react';
import { getThumbnailFallbackChain, getReliableThumbnailUrl } from '@/features/mediaSearch/thumbnailUtils';

interface ThumbnailTestProps {
  videoId: string;
}

export const ThumbnailTest: React.FC<ThumbnailTestProps> = ({ videoId }) => {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [loadedUrls, setLoadedUrls] = useState<string[]>([]);
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const [fallbackChain, setFallbackChain] = useState<string[]>([]);

  useEffect(() => {
    const chain = getThumbnailFallbackChain(videoId);
    const reliable = getReliableThumbnailUrl(videoId);
    
    setFallbackChain(chain);
    setCurrentUrl(reliable);
    setLoadedUrls([]);
    setFailedUrls([]);
    
    console.log('Thumbnail Test for video:', videoId);
    console.log('Reliable URL:', reliable);
    console.log('Fallback chain:', chain);
  }, [videoId]);

  const handleImageLoad = (url: string) => {
    console.log('✅ Thumbnail loaded successfully:', url);
    setLoadedUrls(prev => [...prev, url]);
  };

  const handleImageError = (url: string) => {
    console.log('❌ Thumbnail failed to load:', url);
    setFailedUrls(prev => [...prev, url]);
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Thumbnail Test for Video: {videoId}</h3>
      
      {/* Current Thumbnail */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Current Thumbnail (Reliable URL):</h4>
        <div className="relative w-48 h-27 bg-gray-200 rounded">
          <img
            src={currentUrl}
            alt={`Thumbnail for ${videoId}`}
            className="w-full h-full object-cover rounded"
            onLoad={() => handleImageLoad(currentUrl)}
            onError={() => handleImageError(currentUrl)}
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        </div>
        <p className="text-sm text-gray-600 mt-1">{currentUrl}</p>
      </div>

      {/* Fallback Chain Test */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Fallback Chain Test:</h4>
        <div className="grid grid-cols-3 gap-2">
          {fallbackChain.slice(0, 6).map((url, index) => (
            <div key={index} className="text-center">
              <div className="relative w-24 h-18 bg-gray-200 rounded mb-1">
                <img
                  src={url}
                  alt={`Fallback ${index + 1}`}
                  className="w-full h-full object-cover rounded"
                  onLoad={() => handleImageLoad(url)}
                  onError={() => handleImageError(url)}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-xs text-gray-500">#{index + 1}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <h5 className="font-medium text-green-600 mb-1">✅ Loaded ({loadedUrls.length}):</h5>
          <ul className="text-xs text-gray-600 max-h-20 overflow-y-auto">
            {loadedUrls.map((url, index) => (
              <li key={index} className="truncate">{url}</li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className="font-medium text-red-600 mb-1">❌ Failed ({failedUrls.length}):</h5>
          <ul className="text-xs text-gray-600 max-h-20 overflow-y-auto">
            {failedUrls.map((url, index) => (
              <li key={index} className="truncate">{url}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailTest;
