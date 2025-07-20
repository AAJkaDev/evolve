import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiX, FiSearch, FiExternalLink, FiRefreshCw, FiAlertCircle, FiClock } from 'react-icons/fi';
import { useTheme } from 'next-themes';
import { useResearch } from '@/hooks/useResearch';
import { Citation } from '@/types/research';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

// Loading skeleton component
const LoadingSkeleton: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const skeletonBg = isDark ? 'bg-gray-700' : 'bg-gray-200';

  return (
    <div className="animate-pulse space-y-4">
      {/* Query skeleton */}
      <div className="space-y-2">
        <div className={`h-4 ${skeletonBg} rounded w-3/4`}></div>
        <div className={`h-3 ${skeletonBg} rounded w-1/2`}></div>
      </div>
      
      {/* Answer skeleton */}
      <div className="space-y-3">
        <div className={`h-6 ${skeletonBg} rounded w-1/4`}></div>
        <div className={`h-4 ${skeletonBg} rounded w-full`}></div>
        <div className={`h-4 ${skeletonBg} rounded w-5/6`}></div>
        <div className={`h-4 ${skeletonBg} rounded w-4/5`}></div>
        <div className={`h-4 ${skeletonBg} rounded w-3/4`}></div>
        <div className={`h-4 ${skeletonBg} rounded w-full`}></div>
        <div className={`h-4 ${skeletonBg} rounded w-2/3`}></div>
      </div>
      
      {/* Citations skeleton */}
      <div className="space-y-3">
        <div className={`h-5 ${skeletonBg} rounded w-1/3`}></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className={`h-4 ${skeletonBg} rounded w-5/6`}></div>
            <div className={`h-3 ${skeletonBg} rounded w-3/4`}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Citation component
const CitationItem: React.FC<{ citation: Citation; isDark: boolean }> = ({ citation, isDark }) => {
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-300' : 'text-gray-600';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const hoverBg = isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50';

  const handleClick = useCallback(() => {
    if (citation.url) {
      window.open(citation.url, '_blank', 'noopener,noreferrer');
    }
  }, [citation.url]);

  return (
    <div 
      className={`p-4 border ${borderColor} rounded-lg ${hoverBg} transition-colors cursor-pointer group`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`View source: ${citation.title}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-blue-600 bg-blue-100 rounded-full`}>
              {citation.id}
            </span>
            <h4 className={`font-medium ${textPrimary} truncate group-hover:text-blue-600 transition-colors`}>
              {citation.title || 'Untitled Source'}
            </h4>
          </div>
          {citation.snippet && (
            <p className={`mt-2 text-sm ${textSecondary} line-clamp-2`}>
              {citation.snippet}
            </p>
          )}
          {citation.url && (
            <p className={`mt-1 text-xs ${textMuted} truncate`}>
              {new URL(citation.url).hostname}
            </p>
          )}
        </div>
        <FiExternalLink className={`ml-2 ${textMuted} group-hover:text-blue-600 transition-colors flex-shrink-0`} size={16} />
      </div>
    </div>
  );
};

export const ResearchModal: React.FC<ResearchModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Research hook
  const { data, error, isLoading, research, clear, retry, currentQuery } = useResearch();

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    if (query.trim()) {
      await research(query.trim(), 10);
    }
  }, [research]);

  // Auto-search on initial query
  useEffect(() => {
    if (isOpen && initialQuery && !currentQuery) {
      setSearchQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [isOpen, initialQuery, currentQuery, handleSearch]);

  // Focus management and keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Enter' && document.activeElement === searchInputRef.current) {
        e.preventDefault();
        handleSearch(searchQuery);
      }

      // Tab navigation within modal
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
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
      
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, searchQuery, handleSearch]);

  // Clean up on modal close
  useEffect(() => {
    if (!isOpen) {
      clear();
      setSearchQuery('');
    }
  }, [isOpen, clear]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="research-modal-title">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div ref={modalRef} className={`relative w-full max-w-4xl h-full max-h-[90vh] ${modalBg} rounded-lg shadow-2xl flex flex-col overflow-hidden motion-reduce:transition-none`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${borderColor}`}>
          <div className="flex items-center space-x-4">
            <h2 id="research-modal-title" className={`text-2xl font-semibold ${textPrimary}`}>Deep Research</h2>
            {(isLoading || data) && (
              <div className={`flex items-center space-x-2 text-sm ${textMuted}`}>
                {isLoading && (
                  <>
                    <FiClock size={16} />
                    <span>Researching...</span>
                  </>
                )}
                {data && !isLoading && (
                  <span>
                    {data.citations.length} sources found
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className={`p-2 ${textMuted} hover:${textSecondary} ${hoverBg} rounded-full transition-colors motion-reduce:transition-none`}
            title="Close (Esc)"
            aria-label="Close research modal"
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch(searchQuery);
                  }
                }}
                placeholder="What would you like to research in-depth?"
                className={`w-full pl-10 pr-32 py-3 ${inputBg} ${inputBorder} ${textPrimary} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                aria-label="Research query"
                disabled={isLoading}
              />
              <div className="absolute right-3 flex items-center space-x-2">
                {isLoading && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Researching...</span>
                  </div>
                )}
                {!isLoading && (
                  <button
                    onClick={() => handleSearch(searchQuery)}
                    disabled={!searchQuery.trim()}
                    className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Search
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-6 space-y-6">
            {/* Error State */}
            {error && !isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <FiAlertCircle className="mx-auto text-red-500" size={48} />
                  <div>
                    <h3 className={`text-lg font-medium ${textPrimary}`}>Research Failed</h3>
                    <p className={`mt-1 ${textSecondary}`}>{error.error}</p>
                    {error.details && (
                      <p className={`mt-1 text-sm ${textMuted}`}>{error.details}</p>
                    )}
                  </div>
                  <button
                    onClick={retry}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <FiRefreshCw size={16} />
                    <span>Try Again</span>
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && <LoadingSkeleton />}

            {/* Results */}
            {data && !isLoading && (
              <div className="space-y-6">
                {/* Query */}
                <div>
                  <h3 className={`text-sm font-medium ${textMuted} uppercase tracking-wide`}>Research Query</h3>
                  <p className={`mt-1 text-lg ${textPrimary}`}>{data.query}</p>
                </div>

                {/* Answer */}
                <div>
                  <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Research Summary</h3>
                  <div className={`prose prose-lg max-w-none ${isDark ? 'prose-invert' : ''}`}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Customize link styling
                        a: ({ ...props }) => (
                          <a
                            {...props}
                            className="text-blue-600 hover:text-blue-700 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        ),
                        // Customize code styling
                        code: ({ className, ...props }) => (
                          <code
                            {...props}
                            className={className || `px-1 py-0.5 rounded text-sm ${isDark ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800'}`}
                          />
                        ),
                      }}
                    >
                      {data.answer}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Citations */}
                {data.citations.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Sources & Citations</h3>
                    <div className="grid gap-3">
                      {data.citations.map((citation) => (
                        <CitationItem
                          key={citation.id}
                          citation={citation}
                          isDark={isDark}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!data && !isLoading && !error && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <FiSearch className={`mx-auto ${textMuted}`} size={48} />
                  <div>
                    <h3 className={`text-lg font-medium ${textPrimary}`}>Start Your Research</h3>
                    <p className={`mt-1 ${textSecondary}`}>Enter a query above to begin deep research with AI-powered synthesis.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
