"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  EvolveSidebar 
} from '@/components';
// Enhanced subject data with descriptions and colors
const subjects = [
  {
    id: 'maths',
    title: 'MATHEMATICS',
    shortTitle: 'MATHS',
    description: 'Master calculus, algebra, and mathematical reasoning through interactive problem-solving and visual learning.',
    color: '#4285F4',
    path: '/dashboard/subjects/maths',
    icon: '∑',
    stats: { lessons: 24, progress: 0 }
  },
  {
    id: 'english',
    title: 'ENGLISH LITERATURE',
    shortTitle: 'ENGLISH',
    description: 'Enhance your writing, reading comprehension, and literary analysis skills with AI-powered feedback.',
    color: '#34C9A3',
    path: '/dashboard/subjects/english',
    icon: '✍',
    stats: { lessons: 18, progress: 0 }
  },
  {
    id: 'dsa',
    title: 'DATA STRUCTURES & ALGORITHMS',
    shortTitle: 'DSA',
    description: 'Build strong programming foundations with hands-on coding exercises and algorithm visualization.',
    color: '#FFB623',
    path: '/dashboard/subjects/dsa',
    icon: '⟨⟩',
    stats: { lessons: 32, progress: 0 }
  },
  {
    id: 'oops',
    title: 'OBJECT ORIENTED PROGRAMMING',
    shortTitle: "OOP'S",
    description: 'Learn OOP principles through practical projects and real-world application development.',
    color: '#E5533C',
    path: '/dashboard/subjects/oops',
    icon: '⚡',
    stats: { lessons: 28, progress: 0 }
  },
  {
    id: 'ssd',
    title: 'SYSTEM SOFTWARE DESIGN',
    shortTitle: 'SSD',
    description: 'Understand system architecture, design patterns, and software engineering principles.',
    color: '#9C27B0',
    path: '/dashboard/subjects/ssd',
    icon: '⚙',
    stats: { lessons: 22, progress: 0 }
  },
  {
    id: 'evs',
    title: 'ENVIRONMENTAL STUDIES',
    shortTitle: 'EVS',
    description: 'Explore sustainability, ecology, and environmental impact through interactive case studies.',
    color: '#4CAF50',
    path: '/dashboard/subjects/evs',
    icon: '🌱',
    stats: { lessons: 16, progress: 0 }
  }
];

export default function SubjectsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-[#F5F5EC] relative overflow-hidden">
      {/* Main Sidebar */}
      <EvolveSidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />
      
      {/* Dotted Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, #1A1A1A 1px, transparent 0),
            radial-gradient(circle at 21px 21px, #4285F4 0.5px, transparent 0)
          `,
          backgroundSize: '20px 20px, 40px 40px'
        }} 
      />
      
      {/* Main Content Area */}
      <div className="h-screen flex flex-col">
        {/* Main Content */}
        <main className="flex-1 overflow-hidden relative">
          {/* Enhanced Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Large geometric patterns */}
            <div className="absolute top-16 left-16 w-32 h-32 border border-dashed border-[#4285F4]/15 rounded-full animate-pulse" style={{ animationDuration: '3s' }} />
            <div className="absolute top-20 right-20 w-24 h-24 border border-dashed border-[#34C9A3]/15 rounded-full" />
            <div className="absolute bottom-20 left-24 w-28 h-28 border border-dashed border-[#FFB623]/15 rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-24 right-28 w-20 h-20 border border-dashed border-[#E5533C]/15 rounded-full" />
            
            {/* Medium floating elements */}
            <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-[#4285F4]/25 rounded-full animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
            <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-[#34C9A3]/30 rounded-full animate-bounce" style={{ animationDuration: '2.5s' }} />
            <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-[#FFB623]/25 rounded-full animate-bounce" style={{ animationDuration: '3s', animationDelay: '1s' }} />
            <div className="absolute bottom-1/4 right-1/4 w-3.5 h-3.5 bg-[#E5533C]/20 rounded-full animate-bounce" style={{ animationDuration: '2.2s', animationDelay: '0.8s' }} />
            
            {/* Subtle brand elements */}
            <div className="absolute top-1/2 left-12 text-6xl font-bold text-[#4285F4]/[0.03] select-none" style={{ fontFamily: 'var(--font-geist-sans)' }}>EVOLVE</div>
            <div className="absolute top-1/3 right-12 text-4xl font-bold text-[#34C9A3]/[0.03] rotate-12 select-none" style={{ fontFamily: 'var(--font-geist-sans)' }}>AI</div>
            <div className="absolute bottom-1/2 left-1/2 text-3xl font-bold text-[#FFB623]/[0.03] -rotate-6 select-none" style={{ fontFamily: 'var(--font-geist-sans)' }}>LEARN</div>
            
            {/* Tech-inspired patterns */}
            <div className="absolute top-10 left-1/2 w-16 h-16 border border-dashed border-[#4285F4]/10 rotate-45" />
            <div className="absolute bottom-10 right-1/2 w-12 h-12 border border-dashed border-[#34C9A3]/10 rotate-12" />
            
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.015]" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, #4285F4 1px, transparent 0)',
              backgroundSize: '60px 60px'
            }} />
            
            {/* Neural network inspired connections */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.02]" preserveAspectRatio="none">
              <defs>
                <pattern id="neural" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1" fill="#4285F4" />
                  <circle cx="80" cy="30" r="1" fill="#34C9A3" />
                  <circle cx="50" cy="70" r="1" fill="#FFB623" />
                  <line x1="20" y1="20" x2="80" y2="30" stroke="#4285F4" strokeWidth="0.5" />
                  <line x1="20" y1="20" x2="50" y2="70" stroke="#34C9A3" strokeWidth="0.5" />
                  <line x1="80" y1="30" x2="50" y2="70" stroke="#FFB623" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#neural)" />
            </svg>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 h-full flex flex-col">
            {/* Compact Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center mb-8 flex-shrink-0"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-dashed border-[#4285F4]/30 mb-4"
              >
                <div className="w-1.5 h-1.5 bg-[#4285F4] rounded-full animate-pulse" />
                <span className="text-xs font-medium text-[#4285F4] tracking-wide">AI-POWERED LEARNING</span>
                <div className="w-1.5 h-1.5 bg-[#34C9A3] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              </motion.div>
              
              <h1 className="text-5xl font-bold text-[#1A1A1A] mb-3 tracking-tight" style={{ fontFamily: 'var(--font-geist-sans)' }}>
                Choose Your
                <span className="block text-transparent bg-gradient-to-r from-[#4285F4] to-[#34C9A3] bg-clip-text">
                  Learning Path
                </span>
              </h1>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base text-[#363636]/70 max-w-xl mx-auto"
              >
                Interactive subjects designed for university students with AI-powered assistance.
              </motion.p>
            </motion.div>

            {/* Optimized Subjects Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
            >
              {subjects.map((subject, index) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.7, 
                    delay: 0.8 + (index * 0.1),
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    y: -8,
                    scale: 1.02,
                    transition: { duration: 0.3, ease: "easeOut" }
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="group"
                >
                  <Link href={subject.path}>
                    <div className="bg-white/85 backdrop-blur-md rounded-2xl p-6 shadow-lg border-2 border-dashed border-[#E5E5E5] hover:border-[#4285F4] transition-all duration-400 cursor-pointer h-full flex flex-col relative overflow-hidden">
                      {/* Subject Icon */}
                      <div className="flex items-center justify-center mb-4">
                        <motion.div 
                          className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                          style={{ backgroundColor: subject.color }}
                          whileHover={{ 
                            scale: 1.05,
                            rotate: 3,
                            transition: { duration: 0.2 }
                          }}
                        >
                          {subject.icon}
                        </motion.div>
                      </div>
                      
                      {/* Subject Title */}
                      <h3 
                        className="text-xl font-bold text-[#1A1A1A] mb-2 text-center group-hover:text-[#4285F4] transition-colors duration-300"
                        style={{ fontFamily: 'var(--font-geist-sans)' }}
                      >
                        {subject.shortTitle}
                      </h3>
                      
                      {/* Subject Description */}
                      <p className="text-sm text-[#363636]/70 text-center leading-snug mb-4 flex-1 line-clamp-3">
                        {subject.description}
                      </p>
                      
                      {/* Subject Stats */}
                      <div className="flex items-center justify-center gap-4 pt-3 border-t border-gray-200 mt-auto">
                        <div className="text-center">
                          <div className="text-base font-bold" style={{ color: subject.color }}>
                            {subject.stats.lessons}
                          </div>
                          <div className="text-xs text-[#363636]/60">Lessons</div>
                        </div>
                        <div className="w-px h-6 bg-gray-200" />
                        <div className="text-center">
                          <div className="text-base font-bold text-[#363636]">
                            {subject.stats.progress}%
                          </div>
                          <div className="text-xs text-[#363636]/60">Progress</div>
                        </div>
                      </div>
                      
                      {/* Hover Effect Background */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-8 transition-opacity duration-400 rounded-2xl"
                        style={{ background: `linear-gradient(135deg, ${subject.color}15, ${subject.color}03)` }}
                      />
                      
                      {/* Corner decoration */}
                      <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ backgroundColor: subject.color }} />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
            
          </div>
        </main>
      </div>
    </div>
  );
}
