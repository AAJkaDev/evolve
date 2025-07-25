import React from 'react';
import { HiLightBulb } from 'react-icons/hi';

interface SuggestionChipProps {
  onClick: () => void;
  visible?: boolean;
  className?: string;
  isEndMode?: boolean;
}

export const SuggestionChip: React.FC<SuggestionChipProps> = ({
  onClick,
  visible = true,
  className = '',
  isEndMode = false
}) => {
  if (!visible) return null;

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex
        items-center
        gap-2
        px-4
        py-2
        bg-gradient-to-r
        ${isEndMode 
          ? 'from-red-500 to-red-600' 
          : 'from-purple-500 to-indigo-600'
        }
        text-white
        text-sm
        font-medium
        rounded-full
        shadow-lg
        hover:shadow-xl
        hover:scale-105
        active:scale-95
        transform
        transition-all
        duration-200
        ease-out
        border
        border-white/20
        backdrop-blur-sm
        ${className}
      `}
      type="button"
      title={isEndMode 
        ? "End Socratic Mode - Return to standard chat" 
        : "Switch to Socratic Mode - Ask guided questions to deepen understanding"
      }
    >
      {isEndMode ? (
        <>
          <span className="text-red-300">×</span>
          <span className="whitespace-nowrap">End Socratic Mode</span>
        </>
      ) : (
        <>
          <HiLightBulb className="text-yellow-300 animate-pulse" size={16} />
          <span className="whitespace-nowrap">Socratic Mode</span>
          <div className="flex items-center">
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full ml-1">
              NEW
            </span>
          </div>
        </>
      )}
    </button>
  );
};

export default SuggestionChip;
