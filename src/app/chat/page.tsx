"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useChat } from "@/hooks/useChat";
import { ChatInput, ChatLoading, ChatError } from "@/components";
import ChatMessage from "@/components/chat/ChatMessage";
import { ResearchInline } from "@/components/chat/ResearchInline";
import { ChatBackground } from "@/components/chat/ChatBackground";
import { useTheme } from "@/contexts/ThemeContext";
import { 
  PiArrowLeft,
  PiSparkle,
  PiTrash,
  PiToggleLeft,
  PiToggleRight
} from "react-icons/pi";

export default function Chat() {
  const router = useRouter();
  const { theme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [streamEnabled, setStreamEnabled] = useState(true);
  const [showResearchPanel, setShowResearchPanel] = useState(false);
  const [researchQuery, setResearchQuery] = useState("");
  const [completedResearchQueries, setCompletedResearchQueries] = useState<Set<string>>(new Set());
  
const { 
    turns, 
    isLoading, 
    error, 
    sendMessage, 
    clearMessages, 
    retry, 
    handleRetry, 
    handleEditAndResubmit,
    stopGeneration
  } = useChat({
    stream: streamEnabled,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Get the last user message for media search context
  const lastUserPrompt = turns.length > 0 ? turns[turns.length - 1].userMessage.content : '';

  // Handle pending message from dashboard
  useEffect(() => {
    const pendingMessage = sessionStorage.getItem('pendingMessage');
    if (pendingMessage) {
      sessionStorage.removeItem('pendingMessage');
      sendMessage(pendingMessage);
    }
  }, [sendMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [turns]);

  // Handle message sending with research tool detection
  const handleSendMessage = (message: string) => {
    // Check if this is a research tool request
    if (message.includes('[TOOL:Research]')) {
      const query = message.replace('[TOOL:Research]', '').trim();
      setResearchQuery(query);
      setShowResearchPanel(true);
      return;
    }
    
    sendMessage(message);
  };

  // Handle research completion - add to chat history
  const handleResearchComplete = (query: string) => {
    // Prevent duplicate research results for the same query
    if (completedResearchQueries.has(query)) {
      return;
    }
    
    // Mark this query as completed
    setCompletedResearchQueries(prev => new Set(prev).add(query));
    
    // Close the research panel since we're done
    setShowResearchPanel(false);
    
    // Add a clean conversation turn to the chat history
    // The user asked the question, AI provided the answer
    sendMessage(`Research: ${query}`);
  };

  // Handle clicking on research message to reopen panel
  const handleResearchMessageClick = (data: unknown) => {
    const researchData = data as { query: string };
    setResearchQuery(researchData.query);
    setShowResearchPanel(true);
  };

  return (
<div className={`w-full h-screen ${theme === 'dark' ? 'bg-transparent' : 'bg-[#F5F5EC]'} flex flex-col overflow-hidden relative ${theme === 'dark' ? 'dark' : ''}`}>
      <ChatBackground />
      {/* Theme-aware Dot Background Layer */}
      {theme === 'light' && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundSize: '20px 20px',
            backgroundImage: `radial-gradient(#1A1A1A 1px, transparent 1px)`,
            opacity: 0.12,
          }}
        />
      )}
      
      {/* Theme-aware Radial gradient overlay for faded edges effect - only for light mode */}
      {theme === 'light' && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, transparent 10%, rgba(245, 245, 236, 0.8) 70%)`,
            maskImage: `radial-gradient(ellipse at center, transparent 20%, black 80%)`,
          }}
        />
      )}
      
      {/* Minimal Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative z-20 backdrop-blur-md border-b border-dashed ${
          theme === 'dark' 
            ? 'bg-black/80 border-white/20' 
            : 'bg-white/70 border-[#1A1A1A]/20'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left - Back button and Logo */}
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => router.push('/dashboard')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-xl border border-dashed hover:border-[#4285F4] transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800/80 border-white/30'
                    : 'bg-white/80 border-[#1A1A1A]/30'
                }`}
              >
                <PiArrowLeft className={`w-5 h-5 ${
                  theme === 'dark' ? 'text-white' : 'text-[#1A1A1A]'
                }`} />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#4285F4] to-[#34C9A3] rounded-lg flex items-center justify-center">
                  <PiSparkle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className={`text-lg font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-[#1A1A1A]'
                  }`}>EVOLVE</span>
                  <span className={`text-sm ml-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-[#363636]/70'
                  }`}>Chat</span>
                </div>
              </div>
            </div>
            
            {/* Right - Settings */}
            <div className="flex items-center gap-2">
              {/* Stream Toggle */}
              <motion.button
                onClick={() => setStreamEnabled(!streamEnabled)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed hover:border-[#4285F4] transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800/80 border-white/20'
                    : 'bg-white/80 border-[#1A1A1A]/20'
                }`}
                title={streamEnabled ? "Disable streaming" : "Enable streaming"}
              >
                {streamEnabled ? (
                  <PiToggleRight className="w-5 h-5 text-[#4285F4]" />
                ) : (
                  <PiToggleLeft className={`w-5 h-5 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-[#363636]'
                  }`} />
                )}
                <span className={`text-xs font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-[#363636]'
                }`}>Stream</span>
              </motion.button>
              
              {/* Clear Messages */}
              <motion.button
                onClick={clearMessages}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-xl border border-dashed hover:border-[#E5533C] transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800/80 border-white/20'
                    : 'bg-white/80 border-[#1A1A1A]/20'
                }`}
                title="Clear all messages"
              >
                <PiTrash className={`w-5 h-5 hover:text-[#E5533C] ${
                  theme === 'dark' ? 'text-gray-300' : 'text-[#363636]'
                }`} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Chat area */}
        <div className={`${showResearchPanel ? 'w-1/2' : 'w-full'} transition-all duration-300 flex flex-col`}>
          {/* Messages container */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {turns.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-32"
                >
                  <div className={`inline-flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-full border border-dashed border-[#4285F4]/40 mb-6 ${
                    theme === 'dark' ? 'bg-gray-800/70' : 'bg-white/70'
                  }`}>
                    <div className="w-2 h-2 bg-[#4285F4] rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-[#4285F4]">EVOLVE AI Ready</span>
                    <div className="w-2 h-2 bg-[#34C9A3] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                  </div>
                  
                  <h2 className={`text-3xl font-bold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-[#1A1A1A]'
                  }`}>Ready to Learn?</h2>
                  <p className={`text-lg mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-[#363636]/80'
                  }`}>Ask me anything about your subjects, projects, or learning goals.</p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-[#363636]/60'
                  }`}>I&apos;m here to help you understand complex concepts, solve problems, and guide your learning journey.</p>
                </motion.div>
              ) : (
                turns.map((turn, turnIndex) => (
                  <motion.div 
                    key={turn.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: turnIndex * 0.1 }}
                    className="space-y-4"
                  >
                    {/* Render User Message */}
                    <ChatMessage 
                      message={turn.userMessage} 
                      turnIndex={turnIndex}
                      onEdit={(newContent) => handleEditAndResubmit(turnIndex, newContent)}
                    />
                    
                    {/* Render AI Responses */}
                    {turn.aiResponses.map((response, responseIndex) => (
                      <ChatMessage 
                        key={response.id}
                        message={response} 
                        turnIndex={turnIndex}
                        responseIndex={responseIndex}
                        totalResponses={turn.aiResponses.length}
                        onRetry={() => handleRetry(turnIndex)}
                        onResearchClick={handleResearchMessageClick}
                      />
                    ))}
                  </motion.div>
                ))
              )}
              {isLoading && <ChatLoading />}
              {error && <ChatError error={error} onRetry={retry} />}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>

          {/* Fixed chat input at bottom */}
          <div className={`flex-shrink-0 backdrop-blur-md border-t border-dashed ${
            theme === 'dark' 
              ? 'bg-black/80 border-white/20' 
              : 'bg-white/80 border-[#1A1A1A]/20'
          }`}>
            <div className="max-w-4xl mx-auto px-6 py-4">
              <ChatInput 
                onSendMessage={handleSendMessage} 
                isLoading={isLoading}
                lastUserPrompt={lastUserPrompt}
                onStop={stopGeneration}
              />
            </div>
          </div>
        </div>

        {/* Research panel */}
        {showResearchPanel && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '50%', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-dashed border-[#1A1A1A]/20 bg-white/90 backdrop-blur-md flex flex-col"
          >
            {/* Research panel header */}
            <div className="p-4 border-b border-dashed border-[#1A1A1A]/20 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#34C9A3]/20 rounded-lg flex items-center justify-center">
                  <PiSparkle className="w-4 h-4 text-[#34C9A3]" />
                </div>
                <h3 className="font-semibold text-[#1A1A1A]">Research Panel</h3>
              </div>
              <motion.button
                onClick={() => setShowResearchPanel(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-xl hover:bg-[#F5F5EC] transition-colors"
                title="Close research panel"
              >
                <span className="text-[#363636] font-bold">✕</span>
              </motion.button>
            </div>
            
            {/* Research component */}
            <div className="flex-1 overflow-y-auto p-4">
              <ResearchInline 
                initialQuery={researchQuery} 
                onResearchComplete={handleResearchComplete}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

