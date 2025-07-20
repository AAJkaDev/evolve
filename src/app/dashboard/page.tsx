"use client";

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PiBookOpenText, 
  PiGraduationCap, 
  PiRocketLaunch, 
  PiUser,
  PiMagnifyingGlass,
  PiBell,
  PiSparkle
} from 'react-icons/pi';
import { 
  FloatingLeftSidebar, 
  FloatingRightSidebar, 
  SubjectCard 
} from '@/components';
import { Subject } from '@/types';

const subjects: Subject[] = [
  {
    id: "1",
    title: "Data Structures & Algorithms",
    description: "Master fundamental programming concepts with visual learning and hands-on coding.",
    color: "#4285F4",
    icon: <PiBookOpenText className="text-3xl text-[#4285F4] mr-3" />,
    available: true,
  },
  {
    id: "2",
    title: "Object Oriented Programming",
    description: "Learn OOP principles through interactive projects and real-world applications.",
    color: "#34C9A3",
    icon: <PiGraduationCap className="text-3xl text-[#34C9A3] mr-3" />,
    available: true,
  },
  {
    id: "3",
    title: "More Subjects",
    description: "Additional first-year university subjects will be available soon.",
    color: "#FFB623",
    icon: <PiRocketLaunch className="text-3xl text-[#FFB623] mr-3" />,
    available: false,
  },
];

export default function Dashboard() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div className="min-h-screen bg-[#F5F5EC] relative overflow-hidden">
      {/* Floating Left Sidebar */}
      <FloatingLeftSidebar />
      
      {/* Floating Right Sidebar */}
      <FloatingRightSidebar />
      
      {/* Main Content Area */}
      <div className="flex flex-col h-screen">
        {/* Top Header Bar */}
        <header className="bg-white/80 backdrop-blur-md border-b-2 border-dashed border-black">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Search Bar */}
              <div className="flex-1 max-w-2xl mx-auto">
                <div className="relative">
                  <PiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-[#363636] w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search subjects, topics, or projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[#F5F5EC] rounded-xl border-2 border-transparent focus:border-black focus:outline-none transition-all duration-200 text-[#1A1A1A] placeholder-[#363636]/60"
                  />
                </div>
              </div>
              
              {/* Notification Bell */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="ml-4 p-3 rounded-xl bg-white shadow-md border border-gray-200 hover:border-black transition-all duration-200"
              >
                <PiBell className="w-5 h-5 text-[#363636]" />
              </motion.button>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border-2 border-black relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#4285F4]/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#34C9A3]/10 rounded-full blur-3xl" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <PiSparkle className="w-6 h-6 text-[#FFB623]" />
                    <span className="text-sm font-medium text-[#363636]">AI-Powered Learning Platform</span>
                  </div>
                  
                  <h1 className="text-5xl font-bold text-[#1A1A1A] mb-4">
                    Welcome back, {user?.firstName || 'Student'}!
                  </h1>
                  <p className="text-lg text-[#363636] max-w-3xl">
                    Your personalized learning journey continues. Pick up where you left off 
                    or explore new subjects tailored to your university curriculum.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Featured Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Your Subjects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject, index) => (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  >
                    <SubjectCard 
                      subject={subject} 
                      onStartLearning={(id) => console.log(`Starting learning for subject ${id}`)} 
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-16"
            >
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-8">What Makes EVOLVE Special</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-200 hover:border-black transition-all duration-200"
                >
                  <div className="w-12 h-12 bg-[#4285F4]/20 rounded-xl flex items-center justify-center mb-4">
                    <PiBookOpenText className="text-xl text-[#4285F4]" />
                  </div>
                  <h4 className="font-semibold text-[#1A1A1A] mb-2">AI-Powered</h4>
                  <p className="text-sm text-[#363636]">Personalized content & instant feedback</p>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-200 hover:border-black transition-all duration-200"
                >
                  <div className="w-12 h-12 bg-[#34C9A3]/20 rounded-xl flex items-center justify-center mb-4">
                    <PiGraduationCap className="text-xl text-[#34C9A3]" />
                  </div>
                  <h4 className="font-semibold text-[#1A1A1A] mb-2">Project-Based</h4>
                  <p className="text-sm text-[#363636]">Learn by doing real projects</p>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-200 hover:border-black transition-all duration-200"
                >
                  <div className="w-12 h-12 bg-[#FFB623]/20 rounded-xl flex items-center justify-center mb-4">
                    <PiRocketLaunch className="text-xl text-[#FFB623]" />
                  </div>
                  <h4 className="font-semibold text-[#1A1A1A] mb-2">Visual Learning</h4>
                  <p className="text-sm text-[#363636]">Interactive visualizations</p>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-200 hover:border-black transition-all duration-200"
                >
                  <div className="w-12 h-12 bg-[#E5533C]/20 rounded-xl flex items-center justify-center mb-4">
                    <PiUser className="text-xl text-[#E5533C]" />
                  </div>
                  <h4 className="font-semibold text-[#1A1A1A] mb-2">Personalized</h4>
                  <p className="text-sm text-[#363636]">Adaptive learning paths</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
