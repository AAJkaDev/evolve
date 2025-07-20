import React from 'react';
import { FiSearch, FiClock, FiExternalLink } from 'react-icons/fi';
import { useTheme } from 'next-themes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Citation {
  id: number;
  url: string;
  title: string;
  snippet: string;
}

interface ResearchLoadingProps {
  query: string;
  status: string;
  stage: string;
}

interface ResearchResultsProps {
  query: string;
  answer: string;
  citations: Citation[];
  sources: string[];
}

// Loading component for research in progress
export const ResearchLoading: React.FC<ResearchLoadingProps> = ({ query, status, stage }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const skeletonBg = isDark ? 'bg-gray-700' : 'bg-gray-200';

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
          <FiSearch className="w-4 h-4 text-blue-600 animate-pulse" />
        </div>
        <div>
          <h3 className="font-semibold text-blue-900">Deep Research</h3>
          <p className="text-sm text-blue-700">Researching: &ldquo;{query}&rdquo;</p>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 text-sm text-blue-700">
        <FiClock className="w-4 h-4 animate-spin" />
        <span>{status}</span>
      </div>

      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-blue-600">
          <span>Stage: {stage}</span>
          <span>Please wait...</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-1000 animate-pulse"
            style={{ 
              width: stage === 'initializing' ? '20%' : 
                     stage === 'searching' ? '60%' : 
                     stage === 'crawling' ? '80%' : '90%' 
            }}
          />
        </div>
      </div>

      {/* Loading skeleton */}
      <div className="animate-pulse space-y-3 pt-2">
        <div className={`h-4 ${skeletonBg} rounded w-3/4`}></div>
        <div className={`h-4 ${skeletonBg} rounded w-5/6`}></div>
        <div className={`h-4 ${skeletonBg} rounded w-2/3`}></div>
      </div>
    </div>
  );
};

// Citation component with improved title handling
const CitationItem: React.FC<{ citation: Citation; isDark: boolean }> = ({ citation, isDark }) => {
  const handleCitationClick = () => {
    window.open(citation.url, '_blank', 'noopener,noreferrer');
  };

  // Generate a proper title from URL if title is empty or "untitled"
  const getDisplayTitle = () => {
    if (citation.title && citation.title.toLowerCase() !== 'untitled' && citation.title.trim() !== '') {
      return citation.title;
    }
    
    // Extract a readable title from URL
    if (citation.url) {
      try {
        const url = new URL(citation.url);
        const hostname = url.hostname.replace('www.', '');
        const pathParts = url.pathname.split('/').filter(part => part.length > 0);
        
        if (pathParts.length > 0) {
          // Use the last meaningful path segment as title
          const lastPart = pathParts[pathParts.length - 1];
          const cleanedPart = lastPart
            .replace(/-/g, ' ')
            .replace(/_/g, ' ')
            .replace(/\.(html|php|aspx|jsp)$/i, '')
            .replace(/[0-9]{4,}/g, '') // Remove long numbers
            .trim();
          
          if (cleanedPart.length > 2) {
            return `${hostname} - ${cleanedPart}`;
          }
        }
        
        return hostname;
      } catch {
        return 'Web Source';
      }
    }
    
    return 'Source Document';
  };

  return (
    <div 
      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
        isDark 
          ? 'bg-gray-800 border-gray-600 hover:bg-gray-750' 
          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
      }`}
      onClick={handleCitationClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-1 rounded ${
              isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
            }`}>
              [{citation.id}]
            </span>
            <h4 className={`font-medium text-sm truncate ${
              isDark ? 'text-gray-200' : 'text-gray-900'
            }`}>
              {getDisplayTitle()}
            </h4>
          </div>
          <p className={`text-xs leading-relaxed line-clamp-2 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {citation.snippet}
          </p>
        </div>
        <FiExternalLink className={`w-4 h-4 flex-shrink-0 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`} />
      </div>
    </div>
  );
};

// Results component for completed research
interface ResearchResultsExtendedProps extends ResearchResultsProps {
  onResearchClick?: (data: unknown) => void;
}

export const ResearchResults: React.FC<ResearchResultsExtendedProps> = ({ 
  query, 
  answer, 
  citations,
  sources,
  onResearchClick 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleClick = () => {
    if (onResearchClick) {
      onResearchClick({
        query,
        answer,
        citations,
        sources
      });
    }
  };

  return (
    <div 
      className="space-y-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-4 transition-colors border border-gray-200 dark:border-gray-700"
      onClick={handleClick}
      title="Click to reopen in research panel"
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
          <FiSearch className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Research Complete</h3>
          <p className="text-sm text-gray-600">Query: &ldquo;{query}&rdquo;</p>
        </div>
      </div>

      {/* Answer */}
      <div className="prose prose-sm max-w-none">
        <div className={`prose prose-sm max-w-none ${isDark ? 'prose-invert' : ''}`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {answer}
          </ReactMarkdown>
        </div>
      </div>

      {/* Citations */}
      {citations && citations.length > 0 && (
        <div className="space-y-3">
          <h4 className={`font-semibold text-sm ${
            isDark ? 'text-gray-200' : 'text-gray-900'
          }`}>
            Sources & Citations ({citations.length})
          </h4>
          <div className="grid gap-2">
            {citations.map((citation) => (
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
  );
};

// Main component that handles both loading and results
interface ResearchMessageProps {
  content: string;
  onResearchClick?: (data: unknown) => void;
}

export const ResearchMessage: React.FC<ResearchMessageProps> = ({ content, onResearchClick }) => {
  try {
    const data = JSON.parse(content);
    
    if (data.type === 'research_loading') {
      return (
        <ResearchLoading 
          query={data.query}
          status={data.status}
          stage={data.stage}
        />
      );
    }
    
    if (data.type === 'research_results') {
      return (
        <ResearchResults 
          query={data.query}
          answer={data.answer}
          citations={data.citations}
          sources={data.sources}
          onResearchClick={onResearchClick}
        />
      );
    }
    
    return <div>Unknown research message type</div>;
  } catch (error) {
    console.error('Error parsing research message:', error);
    return <div>Error displaying research results</div>;
  }
};
