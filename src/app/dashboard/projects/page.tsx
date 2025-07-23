"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  EvolveSidebar 
} from '@/components';
import { PiLightbulb } from 'react-icons/pi';

export default function ProjectsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F5EC] relative overflow-hidden">
      {/* Main Sidebar */}
      <EvolveSidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />
      
      {/* Main Content Area */}
      <div className="flex flex-col h-screen">
        <main className="flex-1 overflow-hidden">
          <div className="h-full relative">
            {/* Main container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mx-8 my-6 h-[calc(100%-3rem)] bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-dashed border-[#1A1A1A] overflow-hidden flex flex-col"
            >
              {/* Content area */}
              <div className="flex-1 p-8 overflow-y-auto flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-center"
                >
                  <PiLightbulb className="w-16 h-16 text-[#FFB623] mx-auto mb-4" />
                  <h1 className="text-4xl font-bold text-[#1A1A1A] mb-4">Insight Lab</h1>
                  <p className="text-lg text-[#363636] max-w-md mx-auto">
                    Welcome to your project-based learning space. This is where you&apos;ll work on innovative projects and gain hands-on experience.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
