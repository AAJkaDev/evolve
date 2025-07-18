import React, { useState, useRef, useEffect } from 'react';
import { FiPlus, FiMic } from 'react-icons/fi';
import { IoSend } from 'react-icons/io5';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

// Complete tool definitions with all six tools
const tools = {
  'MindMap': { tag: '[TOOL:MindMap]', display: 'Mind Map' },
  'Search': { tag: '[TOOL:Search]', display: 'Search & Research' },
  'Videos': { tag: '[TOOL:Videos]', display: 'Find Relevant Videos' },
  'Practice': { tag: '[TOOL:Practice]', display: 'Practice & Test' },
  'Connections': { tag: '[TOOL:Connections]', display: 'Explore Connections' },
  'Code': { tag: '[TOOL:Code]', display: 'Code Environment' }
} as const;

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
  placeholder = "Type your message..."
}) => {
  const [input, setInput] = useState('');
  const [activeTool, setActiveTool] = useState<keyof typeof tools | null>(null);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
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
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  // Handle click outside to close tools menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target as Node)) {
        setIsToolsMenuOpen(false);
      }
    };

    if (isToolsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isToolsMenuOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as React.FormEvent);
    }
  };

  const handleToolSelect = (toolKey: keyof typeof tools) => {
    setActiveTool(toolKey);
    setIsToolsMenuOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      const messageContent = activeTool 
        ? `${tools[activeTool].tag} ${input}`
        : input;
      
      onSendMessage(messageContent);
      setInput('');
      setActiveTool(null); // Reset tool after sending
    }
  };

  const clearActiveTool = () => {
    setActiveTool(null);
  };

  return (
    <div className="p-4 flex justify-center">
      <div className="w-full max-w-4xl">
        <form onSubmit={handleSubmit}>
          {/* Main Container with Dotted Border */}
          <div className="border-2 border-dotted border-gray-400 rounded-lg bg-white p-4 flex items-center gap-4">
            
            {/* Left Side - Input Area */}
            <div className="flex-grow">
              <div className="flex items-center flex-wrap gap-2">
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
                        <button
                          className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 rounded-md transition-colors duration-200 flex items-center text-sm"
                          onClick={() => handleToolSelect('Search')}
                        >
                          <span className="mr-3 text-gray-300">•</span>
                          Search & Research
                        </button>
                        <button
                          className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 rounded-md transition-colors duration-200 flex items-center text-sm"
                          onClick={() => handleToolSelect('MindMap')}
                        >
                          <span className="mr-3 text-gray-300">•</span>
                          Generate Visuals
                        </button>
                        <button
                          className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 rounded-md transition-colors duration-200 flex items-center text-sm"
                          onClick={() => handleToolSelect('Videos')}
                        >
                          <span className="mr-3 text-gray-300">•</span>
                          Find Relevant Videos
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
                type="submit"
                disabled={!input.trim() || isLoading}
                className="
                  p-2
                  text-gray-600
                  hover:text-gray-800
                  hover:bg-gray-100
                  disabled:text-gray-400
                  disabled:cursor-not-allowed
                  rounded-full
                  transition-colors
                  flex
                  items-center
                  justify-center
                "
                title="Send message"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                ) : (
                  <IoSend size={20} />
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
