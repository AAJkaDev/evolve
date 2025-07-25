import React, { useRef, useEffect, useCallback } from 'react';
import { FiBookOpen } from 'react-icons/fi';

// Learning Mode Tool Tags
const learningModeTools = {
  'TutorMode': { tag: '[TOOL:TutorMode]', display: 'Tutor Mode', color: '#4285F4', icon: '👨‍🏫' },
  'StudyBuddy': { tag: '[TOOL:StudyBuddy]', display: 'Study Buddy', color: '#34C9A3', icon: '🤝' },
  'Questioner': { tag: '[TOOL:Questioner]', display: 'Questioner', color: '#FFB623', icon: '🤔' },
  'SpoonFeeding': { tag: '[TOOL:SpoonFeeding]', display: 'Spoon Feeding', color: '#E5533C', icon: '🥄' },
  'PracticalLearning': { tag: '[TOOL:PracticalLearning]', display: 'Practical Learning', color: '#9C27B0', icon: '🛠️' }
} as const;

interface StudyModesChipProps {
  visible?: boolean;
  className?: string;
  onModeSelect: (modeKey: keyof typeof learningModeTools) => void;
  onEndMode?: () => void; // New prop for ending the current mode
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  activeLearningMode: keyof typeof learningModeTools | null;
}

export const StudyModesChip: React.FC<StudyModesChipProps> = ({
  visible = true,
  className = '',
  onModeSelect,
  onEndMode,
  isMenuOpen,
  onToggleMenu,
  activeLearningMode
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      onToggleMenu();
    }
  }, [onToggleMenu]);

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen, handleClickOutside]);

  if (!visible) return null;

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={activeLearningMode ? onEndMode : onToggleMenu}
        className={`
          inline-flex
          items-center
          gap-2
          px-4
          py-2
          bg-gradient-to-r
          ${activeLearningMode 
            ? 'from-red-500 to-red-600' 
            : 'from-blue-400 to-green-500'
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
        `}
        type="button"
        title={activeLearningMode 
          ? `End ${learningModeTools[activeLearningMode].display} - Return to standard chat`
          : "Choose your AI teaching style"
        }
      >
        {activeLearningMode ? (
          <>
            <span className="text-red-300">×</span>
            <span className="whitespace-nowrap">End {learningModeTools[activeLearningMode].display}</span>
          </>
        ) : (
          <>
            <FiBookOpen className="text-white" size={16} />
            <span className="whitespace-nowrap">Study Modes</span>
          </>
        )}
      </button>

      {/* Study Modes Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute left-0 bottom-full mb-2 w-64 bg-white rounded-lg shadow-xl border-2 border-gray-200 z-50 overflow-hidden">
          <div className="p-1">
            <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-green-50 border-b border-gray-100">
              <div className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center">
                <FiBookOpen className="mr-1" size={12} />
                Learning Modes
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Choose your AI teaching style</div>
            </div>
            <div className="space-y-1 p-1">
              {Object.entries(learningModeTools).map(([key, mode]) => (
                <button
                  key={key}
                  className="w-full px-3 py-2.5 text-left hover:bg-gray-50 rounded-md transition-all duration-200 flex items-center text-sm group border-l-2 border-transparent hover:border-gray-300"
                  onClick={() => onModeSelect(key as keyof typeof learningModeTools)}
                  title={mode.display}
                >
                  <div className="flex items-center w-full">
                    <span 
                      className="mr-3 text-lg p-1.5 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
                      style={{ backgroundColor: `${mode.color}15` }}
                    >
                      {mode.icon}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 group-hover:text-gray-700">
                        {mode.display}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {key === 'TutorMode' && 'Structured teaching with clear explanations'}
                        {key === 'StudyBuddy' && 'Collaborative learning with encouragement'}
                        {key === 'Questioner' && 'Socratic method with guided questions'}
                        {key === 'SpoonFeeding' && 'Direct, comprehensive step-by-step guidance'}
                        {key === 'PracticalLearning' && 'Hands-on, project-based approach'}
                      </div>
                    </div>
                    <div 
                      className="w-2 h-2 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: mode.color }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyModesChip;
