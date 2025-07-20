"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PiBookOpenText,
  PiGraduationCap,
  PiBank,
  PiChatCircle,
  PiNotePencil,
  PiChartBar,
  PiUsers
} from 'react-icons/pi';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  href: string;
}

const FloatingRightSidebar: React.FC = () => {
  const { user } = useUser();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // Check if we're on subjects pages where sidebar should be collapsed by default
  const isSubjectsPage = pathname?.includes('/subjects');
  
  // Check if we're on individual subject page (not just subjects overview)
  const isIndividualSubjectPage = pathname?.startsWith('/dashboard/subjects/') && pathname !== '/dashboard/subjects';
  
  // In subjects pages, use collapsed mode by default
  const shouldShowCollapsed = isSubjectsPage && !isSidebarExpanded;

  const quickActions: QuickAction[] = [
    {
      id: 'notes',
      label: 'My Notes',
      icon: <PiNotePencil className="w-5 h-5" />,
      color: '#4285F4',
      href: '/dashboard/notes'
    },
    {
      id: 'courses',
      label: 'Courses',
      icon: <PiBookOpenText className="w-5 h-5" />,
      color: '#34C9A3',
      href: '/dashboard/courses'
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: <PiGraduationCap className="w-5 h-5" />,
      color: '#FFB623',
      href: '/dashboard/achievements'
    },
    {
      id: 'campus',
      label: 'Campus',
      icon: <PiBank className="w-5 h-5" />,
      color: '#E5533C',
      href: '/dashboard/campus'
    }
  ];

  // Ultra-smooth animation configurations
  const springConfig = {
    type: "spring" as const,
    stiffness: 260,
    damping: 25,
    mass: 1
  };

  return (
    <>
      {shouldShowCollapsed ? (
        /* Collapsed Profile Icon Button for Subjects Pages */
        <motion.div
          initial={{ x: 150, opacity: 0, scale: 0.8 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 20,
            mass: 1
          }}
          className={`fixed right-6 z-40 ${isIndividualSubjectPage ? 'bottom-6' : 'top-1/2 -translate-y-1/2'}`}
        >
          <motion.button
            onClick={() => setIsSidebarExpanded(true)}
            whileHover={{ 
              scale: 1.1,
              rotate: 5,
              transition: { type: "spring", stiffness: 400, damping: 25 }
            }}
            whileTap={{ scale: 0.9 }}
            className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border-2 border-black p-3 cursor-pointer group"
          >
            <motion.div 
              className="w-12 h-12 bg-[#4285F4] rounded-full flex items-center justify-center relative overflow-hidden"
              whileHover={{ 
                backgroundColor: "#34C9A3",
                rotate: 360,
                scale: 1.05
              }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-white font-bold text-lg">
                {user?.firstName?.[0] || 'U'}
              </span>
            </motion.div>
          </motion.button>
        </motion.div>
      ) : (
        /* Full Sidebar */
        <motion.div
          initial={{ x: 150, opacity: 0, scale: 0.8 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 20,
            mass: 1,
            staggerChildren: 0.1
          }}
          className={`fixed right-6 z-40 ${isIndividualSubjectPage ? 'bottom-6' : 'top-1/2 -translate-y-1/2'}`}
        >
          <motion.div 
            className="flex flex-col gap-4"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            animate="visible"
          >
            {/* User Profile Section */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ 
                scale: 1.05,
                transition: { type: "spring", stiffness: 400, damping: 25 }
              }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border-2 border-black p-4 relative"
            >
              {/* Close button for subjects pages */}
              {isSubjectsPage && (
                <motion.button
                  onClick={() => setIsSidebarExpanded(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-2 right-2 w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                >
                  ✕
                </motion.button>
              )}
              <div className="flex items-center justify-center mb-3">
                <motion.div 
                  className="w-12 h-12 bg-[#4285F4] rounded-full flex items-center justify-center relative overflow-hidden"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="text-white font-bold text-lg">
                    {user?.firstName?.[0] || 'U'}
                  </span>
                </motion.div>
              </div>
              <p className="text-sm font-medium text-center text-[#1A1A1A]">
                {user?.firstName || 'Student'}
              </p>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border-2 border-black p-4"
            >
              <h3 className="text-sm font-bold text-[#1A1A1A] mb-4 text-center">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <Link
                    key={action.id}
                    href={action.href}
                    className="group"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1, ...springConfig }}
                      whileHover={{ 
                        scale: 1.08,
                        transition: { type: "spring", stiffness: 400, damping: 25 }
                      }}
                      whileTap={{ scale: 0.92 }}
                      className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 hover:border-black transition-all duration-300"
                    >
                      <motion.div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center mb-2 mx-auto"
                        style={{ backgroundColor: `${action.color}20` }}
                        whileHover={{ 
                          backgroundColor: `${action.color}30`,
                          scale: 1.1
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div style={{ color: action.color }}>
                          {action.icon}
                        </div>
                      </motion.div>
                      <p className="text-xs font-medium text-center text-[#363636]">
                        {action.label}
                      </p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* AI Assistant Button */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ 
                scale: 1.05,
                transition: { type: "spring", stiffness: 400, damping: 25 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/chat">
                <motion.div 
                  className="bg-[#4285F4] text-white rounded-2xl shadow-xl p-4 cursor-pointer relative overflow-hidden"
                  whileHover={{ backgroundColor: "#34C9A3" }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-center gap-2 relative z-10">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <PiChatCircle className="w-6 h-6" />
                    </motion.div>
                    <span className="font-medium">Chat with Enzo</span>
                  </div>
                </motion.div>
              </Link>
            </motion.div>

            {/* Stats Toggle Button */}
            <motion.button
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ 
                scale: 1.05,
                transition: { type: "spring", stiffness: 400, damping: 25 }
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border-2 border-black p-4"
            >
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <PiChartBar className="w-5 h-5 text-[#363636]" />
                </motion.div>
                <span className="text-sm font-medium text-[#363636]">Stats</span>
              </div>
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {/* Expandable Stats Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 100, rotateY: 90 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              x: 0, 
              rotateY: 0,
              transition: {
                type: "spring",
                stiffness: 200,
                damping: 25,
                staggerChildren: 0.1
              }
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8, 
              x: 50, 
              rotateY: -90,
              transition: { duration: 0.3 }
            }}
            className="fixed right-80 top-1/2 -translate-y-1/2 z-30"
          >
            <motion.div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border-2 border-black p-6 w-64">
              <motion.h3 
                className="text-lg font-bold text-[#1A1A1A] mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Your Progress
              </motion.h3>
              
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-[#363636]">DSA Progress</span>
                    <span className="text-sm font-bold text-[#4285F4]">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div 
                      className="bg-[#4285F4] h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-[#363636]">OOP Progress</span>
                    <span className="text-sm font-bold text-[#34C9A3]">60%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div 
                      className="bg-[#34C9A3] h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '60%' }}
                      transition={{ duration: 1, delay: 0.4 }}
                    />
                  </div>
                </motion.div>

                <motion.div 
                  className="pt-4 border-t border-gray-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#363636]">Projects Completed</span>
                    <span className="text-sm font-bold text-[#FFB623]">12</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#363636]">Study Streak</span>
                    <span className="text-sm font-bold text-[#E5533C]">7 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#363636]">Learning Hours</span>
                    <span className="text-sm font-bold text-[#1A1A1A]">48h</span>
                  </div>
                </motion.div>

                <Link href="/dashboard/community">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-4 bg-[#F5F5EC] rounded-xl p-3 cursor-pointer hover:bg-[#E5E5DC] transition-colors"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <PiUsers className="w-5 h-5 text-[#363636]" />
                      <span className="text-sm font-medium text-[#363636]">View Community</span>
                    </div>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingRightSidebar;
