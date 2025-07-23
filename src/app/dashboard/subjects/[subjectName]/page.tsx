"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  EvolveSidebar,
  ChatInput
} from '@/components';

export default function SubjectPage() {
  const params = useParams();
  const subjectName = params.subjectName as string;
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Format subject name for display (convert URL param to readable format)
  const displayName = subjectName?.toUpperCase().replace('-', ' ') || '';
  
  // Handle chat message sending
  const handleSendMessage = async (message: string) => {
    setIsLoading(true);
    // Simulate message processing
    setTimeout(() => {
      setIsLoading(false);
      console.log(`Message sent for ${displayName}: ${message}`);
    }, 1000);
  };
  
  const handleStopGeneration = () => {
    setIsLoading(false);
    console.log('Generation stopped');
  };

  return (
    <div className="min-h-screen bg-[#F5F5EC] relative overflow-hidden">
      {/* Main Sidebar */}
      <EvolveSidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />
      
      {/* Main Content Area */}
      <div className="flex flex-col h-screen">

        {/* Main Content Area - Notebook Style */}
        <main className="flex-1 overflow-hidden">
          {/* Notebook-style content area */}
          <div className="h-full relative">
            {/* Main notebook container with dashed border */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mx-8 my-6 h-[calc(100%-3rem)] bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-dashed border-[#1A1A1A] overflow-hidden flex flex-col"
            >
              {/* Notebook content area */}
              <div className="flex-1 p-8 overflow-y-auto">
                {/* Notebook lines - matching the design */}
                <div className="space-y-6">
                  {/* Generate notebook lines */}
                  {Array.from({ length: 12 }, (_, i) => (
                    <div key={i} className="h-6 border-b border-gray-300 w-full" />
                  ))}
                </div>
                
                {/* Placeholder content area */}
                <div className="absolute top-8 left-8 right-8">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-[#363636] text-lg leading-relaxed"
                  >
                    {/* Subject content will appear here */}
                    <p className="mb-4 text-[#1A1A1A] font-medium">
                      Welcome to your {displayName} learning space!
                    </p>
                    <p className="mb-4">
                      This is where your learning content, notes, and exercises will appear. 
                      Use the chat below to ask questions, request explanations, or get help with problems.
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
        
        {/* Chat Input at Bottom */}
        <footer className="flex-shrink-0">
          <div className="bg-white/90 backdrop-blur-md border-t-2 border-dashed border-[#1A1A1A]">
            {/* Tools button container matching the design */}
            <div className="px-8 py-4 flex items-center justify-between">
              {/* Left side - Plus button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full border-2 border-dashed border-[#1A1A1A] bg-white flex items-center justify-center hover:bg-[#F5F5EC] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </motion.button>
              
              {/* Center - Tools button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-white border-2 border-dashed border-[#1A1A1A] rounded-full font-bold text-[#1A1A1A] hover:bg-[#F5F5EC] transition-colors"
              >
                TOOLS
              </motion.button>
              
              {/* Right side - Mic and Filter buttons */}
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full border-2 border-dashed border-[#1A1A1A] bg-white flex items-center justify-center hover:bg-[#F5F5EC] transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full border-2 border-dashed border-[#1A1A1A] bg-white flex items-center justify-center hover:bg-[#F5F5EC] transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"></polygon>
                  </svg>
                </motion.button>
              </div>
            </div>
            
            {/* Enhanced ChatInput component */}
            <div className="px-4 pb-4">
              <ChatInput 
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                placeholder={`Ask questions about ${displayName}...`}
                onStop={handleStopGeneration}
              />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

