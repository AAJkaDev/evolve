import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiPlus, FiMic, FiSearch } from 'react-icons/fi';
import { IoSend } from 'react-icons/io5';
import { PiImagesSquareDuotone } from 'react-icons/pi';
import { SuggestionChip } from './SuggestionChip';
import { StudyModesChip } from './StudyModesChip';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  lastUserPrompt?: string;
  onStop?: () => void;
  setMode?: (mode: 'standard' | 'socratic') => void;
}

// Complete tool definitions with media search options and Socratic mode
const tools = {
  'MindMap': { tag: '[TOOL:MindMap]', display: 'Mind Map' },
  'Search': { tag: '[TOOL:Search]', display: 'Search & Research' },
  'Research': { tag: '[TOOL:Research]', display: 'Research & Synthesis' },
  'Practice': { tag: '[TOOL:Practice]', display: 'Practice & Test' },
  'Connections': { tag: '[TOOL:Connections]', display: 'Explore Connections' },
  'Code': { tag: '[TOOL:Code]', display: 'Code Environment' },
  'Images': { tag: '[SEARCH:Images]', display: 'Find Images' },
  'MediaVideos': { tag: '[SEARCH:Videos]', display: 'Find Videos' },
  'MediaBoth': { tag: '[SEARCH:Both]', display: 'Find Images & Videos' }
} as const;

// PROJECT CHAMELEON: Learning Mode Tool Tags
const learningModeTools = {
  'TutorMode': { tag: '[TOOL:TutorMode]', display: 'Tutor Mode', color: '#4285F4', icon: '👨‍🏫' },
  'StudyBuddy': { tag: '[TOOL:StudyBuddy]', display: 'Study Buddy', color: '#34C9A3', icon: '🤝' },
  'Questioner': { tag: '[TOOL:Questioner]', display: 'Questioner', color: '#FFB623', icon: '🤔' },
  'SpoonFeeding': { tag: '[TOOL:SpoonFeeding]', display: 'Spoon Feeding', color: '#E5533C', icon: '🥄' },
  'PracticalLearning': { tag: '[TOOL:PracticalLearning]', display: 'Practical Learning', color: '#9C27B0', icon: '🛠️' }
} as const;

// Socratic mode configuration
const socraticMode = {
  tag: '[MODE:Socratic]',
  display: 'Socratic Mode'
};

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
  placeholder = "Type your message...",
  onStop,
  setMode
}) => {
  const [input, setInput] = useState('');
  const [activeTool, setActiveTool] = useState<keyof typeof tools | null>(null);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [showChip, setShowChip] = useState(false);
  const [socraticModeActive, setSocraticModeActive] = useState(false);
  // PROJECT CHAMELEON: Study Modes State
  const [activeLearningMode, setActiveLearningMode] = useState<keyof typeof learningModeTools | null>(null);
  const [isStudyModesMenuOpen, setIsStudyModesMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const studyModesMenuRef = useRef<HTMLDivElement>(null);

  // Optimized auto-resize textarea with useCallback
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 192; // max-h-48 (12rem = 192px)
      
      if (scrollHeight <= maxHeight) {
        textarea.style.height = `${scrollHeight}px`;
        textarea.style.overflowY = 'hidden';
      } else {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = 'auto';
      }
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);



  // Optimized click outside handler for both menus
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target as Node)) {
      setIsToolsMenuOpen(false);
    }
    if (studyModesMenuRef.current && !studyModesMenuRef.current.contains(event.target as Node)) {
      setIsStudyModesMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isToolsMenuOpen || isStudyModesMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isToolsMenuOpen, isStudyModesMenuOpen, handleClickOutside]);

  // Optimized handlers with useCallback
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Show chip when user starts typing (either for starting Socratic mode or ending it)
    if (value.trim() && !showChip) {
      setShowChip(true);
    } else if (!value.trim() && showChip) {
      setShowChip(false);
    }
  }, [showChip]);


  const handleToolSelect = useCallback((toolKey: keyof typeof tools) => {
    setActiveTool(toolKey);
    setIsToolsMenuOpen(false);
  }, []);

// PROJECT CHAMELEON: Learning Mode Handlers
const handleLearningModeSelect = useCallback((modeKey: keyof typeof learningModeTools) => {
  console.log(`🎓 Learning Mode selected: ${modeKey}`);
  
  // COMBINED MODE LOGIC: Clear conflicting modes but allow tools
  setSocraticModeActive(false); // Clear Socratic mode (study modes conflict with Socratic)
  // DON'T clear active tools - allow combination!
  
  // Set the new learning mode
  setActiveLearningMode(modeKey);
  setIsStudyModesMenuOpen(false);
  
  // Set appropriate chat mode
  if (setMode) {
    setMode('standard'); // All learning modes use standard for now
  }
}, [setMode]);

  const clearActiveLearningMode = useCallback(() => {
    setActiveLearningMode(null);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      let messageContent = input;
      
      // COMBINED MODE LOGIC: Support both study mode AND tool together
      // Priority 1: Add learning mode tag if active
      if (activeLearningMode) {
        messageContent = `${learningModeTools[activeLearningMode].tag} ${input}`;
      }
      // Priority 2: Add Socratic mode tag if active (but not if learning mode is active)
      else if (socraticModeActive) {
        messageContent = `${socraticMode.tag} ${input}`;
      }
      
      // Priority 3: Add tool tag if active (can combine with study modes)
      if (activeTool) {
        // If we already have a learning mode or Socratic mode, prepend the tool tag
        if (activeLearningMode || socraticModeActive) {
          messageContent = `${tools[activeTool].tag} ${messageContent}`;
        } else {
          // Just tool, no study mode
          messageContent = `${tools[activeTool].tag} ${input}`;
        }
      }
      
      console.log('🚀 Sending combined message:', messageContent);
      onSendMessage(messageContent);
      setInput('');
      setActiveTool(null); // Reset tool after sending
      // Keep learning modes and Socratic mode active - don't reset them!
      setShowChip(false); // Hide chip after sending message
    }
  }, [input, isLoading, activeTool, activeLearningMode, socraticModeActive, onSendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as React.FormEvent);
    }
  }, [handleSubmit]);

  const clearActiveTool = useCallback(() => {
    setActiveTool(null);
  }, []);

  // Clear Socratic mode
  const clearSocraticMode = useCallback(() => {
    setSocraticModeActive(false);
    if (setMode) {
      setMode('standard');
    }
  }, [setMode]);

  // Make Socratic mode persistent
  useEffect(() => {
    if (socraticModeActive && setMode) {
      setMode('socratic');
    }
  }, [socraticModeActive, setMode]);

  // Handle suggestion chip click
  const handleSuggestionChipClick = useCallback(() => {
    if (socraticModeActive) {
      // If Socratic mode is active, this click should end it
      console.log('Ending Socratic mode');
      clearSocraticMode();
    } else {
      // If Socratic mode is not active, this click should start it
      console.log('Socratic mode selected');
      
      // COMBINED MODE LOGIC: Clear conflicting modes but allow tools
      setActiveLearningMode(null); // Clear any active learning mode (Socratic conflicts with study modes)
      // DON'T clear active tools - allow combination!
      
      // Set the chat mode to 'socratic' for the next message
      if (setMode) {
        setMode('socratic');
      }
      
      // Activate Socratic mode tag
      setSocraticModeActive(true);
    }
    setShowChip(false); // Hide chip after clicking
  }, [setMode, socraticModeActive, clearSocraticMode]);


  return (
    <>
      <div className="p-4 flex justify-center">
        <div className="w-full max-w-4xl relative">
          {/* Popup Chips - positioned absolutely above input */}
          {showChip && (
            <div className="absolute bottom-full left-0 right-0 mb-3 flex justify-center gap-3 z-10">
              <SuggestionChip
                onClick={handleSuggestionChipClick}
                visible={showChip}
                isEndMode={socraticModeActive}
                className="animate-in slide-in-from-bottom-2 duration-300"
              />
              <StudyModesChip
                visible={showChip}
                onModeSelect={handleLearningModeSelect}
                onEndMode={clearActiveLearningMode}
                isMenuOpen={isStudyModesMenuOpen}
                onToggleMenu={() => setIsStudyModesMenuOpen(!isStudyModesMenuOpen)}
                activeLearningMode={activeLearningMode}
                className="animate-in slide-in-from-bottom-2 duration-300"
              />
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
          {/* Main Container with Dotted Border */}
          <div className="border-2 border-dotted border-gray-400 rounded-lg bg-white p-4 flex items-center gap-4">
            
            {/* Left Side - Input Area */}
            <div className="flex-grow">
              <div className="flex items-center flex-wrap gap-2">
                {/* Socratic Mode Tag */}
                {socraticModeActive && (
                  <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 text-xs px-2 py-1 rounded-md border border-purple-200">
                    <span className="mr-1">{socraticMode.display}</span>
                    <button
                      type="button"
                      onClick={clearSocraticMode}
                      className="ml-1 hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                    >
                      <span className="text-purple-600 font-bold text-xs leading-none">×</span>
                    </button>
                  </div>
                )}

                {/* PROJECT CHAMELEON: Active Learning Mode Tag */}
                {activeLearningMode && (
                  <div 
                    className="inline-flex items-center text-white text-xs px-2 py-1 rounded-md border-2 border-opacity-30"
                    style={{
                      backgroundColor: learningModeTools[activeLearningMode].color,
                      borderColor: learningModeTools[activeLearningMode].color
                    }}
                  >
                    <span className="mr-1 text-sm">{learningModeTools[activeLearningMode].icon}</span>
                    <span className="mr-1 font-medium">{learningModeTools[activeLearningMode].display}</span>
                    <button
                      type="button"
                      onClick={clearActiveLearningMode}
                      className="ml-1 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
                    >
                      <span className="text-white font-bold text-xs leading-none">×</span>
                    </button>
                  </div>
                )}
                
                {/* Active Tool Tag */}
                {activeTool && (
                  <div className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md border border-blue-200">
                    <span className="mr-1">{tools[activeTool].display}</span>
                    <button
                      type="button"
                      onClick={clearActiveTool}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                      <span className="text-blue-600 font-bold text-xs leading-none">×</span>
                    </button>
                  </div>
                )}
                
                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  disabled={isLoading}
                  rows={1}
                  className="
                    flex-grow
                    min-h-[2.5rem]
                    max-h-48
                    p-2
                    bg-transparent
                    border-none
                    outline-none
                    resize-none
                    text-gray-900
                    placeholder-gray-500
                    disabled:text-gray-500
                    disabled:cursor-not-allowed
                    font-medium
                    text-base
                    leading-6
                  "
                  style={{
                    fontFamily: 'inherit',
                    lineHeight: '1.5',
                  }}
                />
              </div>
            </div>
            
            {/* Right Side - Action Buttons Row */}
            <div className="flex items-center gap-3">
              {/* Plus Button */}
              <button
                type="button"
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                title="Add attachment"
              >
                <FiPlus size={20} />
              </button>
              
              {/* Tools Button */}
              <div className="relative" ref={toolsMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
                  className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                >
                  TOOLS
                </button>
                
                {/* Tools Popover Menu */}
                {isToolsMenuOpen && (
                  <div className="absolute right-0 bottom-full mb-2 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-600 z-50">
                    <div className="p-2">
                      <div className="space-y-1">
                        {/* Show regular tools only when NO study mode is active */}
                        {!activeLearningMode && !socraticModeActive && (
                          <>
                            {/* Hidden: Basic Search & Research tool */}
                            {false && (
                              <button
                                className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 rounded-md transition-colors duration-200 flex items-center text-sm"
                                onClick={() => handleToolSelect('Search')}
                              >
                                <span className="mr-3 text-gray-300">•</span>
                                Search & Research
                              </button>
                            )}
                            
                            {/* Hidden: Advanced Research & Synthesis tool */}
                            {false && (
                              <button
                                className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 rounded-md transition-colors duration-200 flex items-center text-sm font-medium"
                                onClick={() => handleToolSelect('Research')}
                                title="AI-powered deep research with citations"
                              >
                                <FiSearch className="mr-3 text-blue-400" size={16} />
                                <span className="flex-1">Research & Synthesis</span>
                                <span className="text-xs text-blue-400 ml-2">NEW</span>
                              </button>
                            )}
                            <button
                              className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 rounded-md transition-colors duration-200 flex items-center text-sm"
                              onClick={() => handleToolSelect('MindMap')}
                            >
                              <span className="mr-3 text-gray-300">•</span>
                              Generate Visuals
                            </button>
                            <button
                              className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 rounded-md transition-colors duration-200 flex items-center text-sm"
                              onClick={() => handleToolSelect('Practice')}
                            >
                              <span className="mr-3 text-gray-300">•</span>
                              Practice & Test
                            </button>
                            <button
                              className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 rounded-md transition-colors duration-200 flex items-center text-sm"
                              onClick={() => handleToolSelect('Connections')}
                            >
                              <span className="mr-3 text-gray-300">•</span>
                              Explore Connections
                            </button>
                            <button
                              className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 rounded-md transition-colors duration-200 flex items-center text-sm"
                              onClick={() => handleToolSelect('Code')}
                            >
                              <span className="mr-3 text-gray-300">•</span>
                              Code Environment
                            </button>
                          </>
                        )}
                        
                        {/* Generate Visuals - Always available when study modes are active */}
                        {(activeLearningMode || socraticModeActive) && (
                          <>
                            <div className="px-3 py-1 text-xs text-gray-400 uppercase tracking-wide font-medium">
                              Available Tools
                            </div>
                            <button
                              className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 rounded-md transition-colors duration-200 flex items-center text-sm"
                              onClick={() => handleToolSelect('MindMap')}
                            >
                              <span className="mr-3 text-gray-300">•</span>
                              Generate Visuals
                            </button>
                            <div className="border-t border-gray-600 pt-2 mt-2"></div>
                          </>
                        )}
                        
                        {/* Media Search Section - Always visible */}
                        <div className={`${!activeLearningMode && !socraticModeActive ? 'border-t border-gray-600 pt-2 mt-2' : ''}`}>
                          <div className="px-3 py-1 text-xs text-gray-400 uppercase tracking-wide font-medium">
                            {(activeLearningMode || socraticModeActive) ? 'Media Search' : 'Media Search'}
                          </div>
                          <button
                            className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 rounded-md transition-colors duration-200 flex items-center text-sm"
                            onClick={() => handleToolSelect('MediaBoth')}
                            title="Find Images & Videos"
                          >
                            <PiImagesSquareDuotone className="mr-3 text-gray-300" size={16} />
                            Find Images & Videos
                          </button>
                          
                          {/* Sub-options with indentation */}
                          <div className="ml-4 mt-1 space-y-1">
                            <button
                              className="w-full px-3 py-1.5 text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors duration-200 flex items-center text-xs"
                              onClick={() => handleToolSelect('Images')}
                              title="Find Images Only"
                            >
                              <span className="mr-2 text-gray-400">→</span>
                              Images
                            </button>
                            <button
                              className="w-full px-3 py-1.5 text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors duration-200 flex items-center text-xs"
                              onClick={() => handleToolSelect('MediaVideos')}
                              title="Find Videos Only"
                            >
                              <span className="mr-2 text-gray-400">→</span>
                              Videos
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Microphone Button */}
              <button
                type="button"
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                title="Voice input"
              >
                <FiMic size={20} />
              </button>
              
              {/* Send Button */}
              <button
                type={isLoading ? "button" : "submit"}
                disabled={!input.trim() && !isLoading}
                className={`
                  p-2
                  text-gray-600
                  rounded-full
                  transition-all
                  duration-200
                  flex
                  items-center
                  justify-center
                  ${isLoading 
                    ? 'cursor-pointer hover:bg-red-50 hover:scale-105 active:scale-95' 
                    : (!input.trim() 
                      ? 'cursor-not-allowed disabled:text-gray-400' 
                      : 'cursor-pointer hover:text-gray-800 hover:bg-gray-100'
                    )
                  }
                `}
                title={isLoading ? "Click to stop generation" : "Send message"}
                onClick={isLoading ? (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Stop button clicked'); // Debug log
                  onStop?.();
                } : undefined}
                onMouseDown={isLoading ? (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                } : undefined}
              >
                {isLoading ? (
                  <div className="relative flex items-center justify-center">
                    {/* Spinning loader */}
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 pointer-events-none"></div>
                    {/* Red glowing stop dot - bigger and more visible */}
                    <div 
                      className="absolute w-3 h-3 bg-red-500 rounded-full animate-pulse pointer-events-none"
                      style={{
                        boxShadow: '0 0 12px rgba(239, 68, 68, 1), 0 0 24px rgba(239, 68, 68, 0.6), 0 0 36px rgba(239, 68, 68, 0.3)'
                      }}
                    />
                    {/* Invisible larger click area for better UX */}
                    <div className="absolute inset-0 w-6 h-6 -m-1 pointer-events-none" />
                  </div>
                ) : (
                  <IoSend size={20} />
                )}
              </button>
            </div>
          </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChatInput;
