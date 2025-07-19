import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiSearch } from 'react-icons/fi';
import { useTheme } from 'next-themes';
import { useMediaSearch } from '@/hooks/useMediaSearch';
import ImageGrid from './ImageGrid';
import VideoGrid from './VideoGrid';

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const MediaModal: React.FC<MediaModalProps> = ({
  isOpen,
  onClose,
  initialQuery,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const imagesTabRef = useRef<HTMLButtonElement>(null);
  const videosTabRef = useRef<HTMLButtonElement>(null);

  // Debounced search query for API calls
  const debouncedQuery = searchQuery.trim() || initialQuery || '';
  const { data, error, isLoading } = useMediaSearch(debouncedQuery);

  // Focus management and keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Arrow key navigation for tabs
      if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && 
          (document.activeElement === imagesTabRef.current || document.activeElement === videosTabRef.current)) {
        e.preventDefault();
        if (e.key === 'ArrowLeft') {
          if (activeTab === 'videos') {
            setActiveTab('images');
            imagesTabRef.current?.focus();
          }
        } else if (e.key === 'ArrowRight') {
          if (activeTab === 'images') {
            setActiveTab('videos');
            videosTabRef.current?.focus();
          }
        }
      }

      // Tab navigation within modal
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      
      // Auto-focus search input when modal opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, activeTab]);

  if (!isOpen) return null;

  // Theme-aware classes
  const modalBg = isDark ? 'bg-gray-900' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-300' : 'text-gray-600';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const inputBg = isDark ? 'bg-gray-800' : 'bg-white';
  const inputBorder = isDark ? 'border-gray-600' : 'border-gray-300';
  const hoverBg = isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="media-modal-title">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div ref={modalRef} className={`relative w-full max-w-6xl h-full max-h-[90vh] ${modalBg} rounded-lg shadow-2xl flex flex-col overflow-hidden motion-reduce:transition-none`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${borderColor}`}>
          <div className="flex items-center space-x-4">
            <h2 id="media-modal-title" className={`text-2xl font-semibold ${textPrimary}`}>Find Images & Videos</h2>
            <div className={`text-sm ${textMuted}`}>
              {data && (
                <span>
                  {data.images.length} images, {data.videos.length} videos
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 ${textMuted} hover:${textSecondary} ${hoverBg} rounded-full transition-colors motion-reduce:transition-none`}
            title="Close (Esc)"
            aria-label="Close media search modal"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className={`p-6 border-b ${borderColor}`}>
          <div className="relative">
            <div className="relative flex items-center">
              <FiSearch className={`absolute left-3 ${textMuted}`} size={20} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for images and videos..."
                className={`w-full pl-10 pr-4 py-3 ${inputBg} ${inputBorder} ${textPrimary} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                aria-label="Search for images and videos"
              />
              {isLoading && (
                <div className="absolute right-3 flex items-center space-x-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Searching...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${borderColor}`} role="tablist" aria-label="Media type selection">
          <button
            ref={imagesTabRef}
            onClick={() => setActiveTab('images')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'images'
                ? 'border-blue-500 text-blue-600'
                : `border-transparent ${textMuted} hover:${textSecondary}`
            }`}
            role="tab"
            aria-selected={activeTab === 'images'}
            aria-controls="images-panel"
            tabIndex={activeTab === 'images' ? 0 : -1}
          >
            Images ({data?.images.length || 0})
          </button>
          <button
            ref={videosTabRef}
            onClick={() => setActiveTab('videos')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'videos'
                ? 'border-blue-500 text-blue-600'
                : `border-transparent ${textMuted} hover:${textSecondary}`
            }`}
            role="tab"
            aria-selected={activeTab === 'videos'}
            aria-controls="videos-panel"
            tabIndex={activeTab === 'videos' ? 0 : -1}
          >
            Videos ({data?.videos.length || 0})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="text-center py-12">
              <div className="text-red-500 mb-2">Error loading media</div>
              <div className={`text-sm ${textMuted}`}>{error.message}</div>
            </div>
          )}

          {isLoading && (
            <div className="space-y-6">
              {/* Skeleton Loading */}
              {activeTab === 'images' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <SkeletonImageCard key={i} isDark={isDark} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <SkeletonVideoCard key={i} isDark={isDark} />
                  ))}
                </div>
              )}
            </div>
          )}

          {data && !isLoading && (
            <>
              {/* Images Tab */}
              {activeTab === 'images' && (
                <div id="images-panel" role="tabpanel" aria-labelledby="images-tab">
                  <ImageGrid images={data.images} query={searchQuery || ''} />
                </div>
              )}

              {/* Videos Tab */}
              {activeTab === 'videos' && (
                <div id="videos-panel" role="tabpanel" aria-labelledby="videos-tab">
                  <VideoGrid videos={data.videos} query={searchQuery || ''} />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Legal Note */}
        <div className={`p-4 border-t ${borderColor} ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className={`text-xs ${textMuted} text-center space-y-1`}>
            <p>
              Images provided by <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">Pexels</a> • 
              Videos from <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-600">YouTube</a>
            </p>
            <p>All content is used for educational purposes only. Please respect original creators and licensing terms.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton Components
const SkeletonImageCard: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const skeletonBg = isDark ? 'bg-gray-700' : 'bg-gray-200';
  const shimmer = isDark ? 'animate-pulse' : 'animate-pulse';
  
  return (
    <div className={`${skeletonBg} ${shimmer} rounded-lg aspect-square`}>
      <div className="w-full h-full rounded-lg"></div>
    </div>
  );
};

const SkeletonVideoCard: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const skeletonBg = isDark ? 'bg-gray-700' : 'bg-gray-200';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const shimmer = isDark ? 'animate-pulse' : 'animate-pulse';
  
  return (
    <div className={`${cardBg} rounded-lg shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
      <div className={`${skeletonBg} ${shimmer} aspect-video`}></div>
      <div className="p-4 space-y-3">
        <div className={`${skeletonBg} ${shimmer} h-4 rounded`}></div>
        <div className={`${skeletonBg} ${shimmer} h-3 rounded w-3/4`}></div>
        <div className={`${skeletonBg} ${shimmer} h-3 rounded w-1/2`}></div>
        <div className={`${skeletonBg} ${shimmer} h-8 rounded`}></div>
      </div>
    </div>
  );
};



export default MediaModal;
