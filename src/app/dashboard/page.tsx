"use client";

import { useUser, useClerk } from '@clerk/nextjs';
import { useState, useCallback, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PiArrowRight,
  PiBooks,
  PiChatCircle,
  PiUser,
  PiGear,
  PiSignOut,
  PiMagnifyingGlass,
  PiSidebar
} from 'react-icons/pi';
import { ChatInput, EvolveSidebar } from '@/components';
import Switch from '@/components/ui/Switch';
import DarkModeBackground from '@/components/ui/DarkModeBackground';
import ThemeAwareLogo from '@/components/ui/ThemeAwareLogo';
import { useTheme } from '@/contexts/ThemeContext';

// Memoized background component with faded grid effect
const OptimizedBackground = memo(() => (
  <div className="fixed inset-0 bg-white">
    <div 
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(to right, #e4e4e7 1px, transparent 1px),
          linear-gradient(to bottom, #e4e4e7 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
        willChange: 'auto'
      }}
    />
    {/* Radial gradient overlay for faded look */}
    <div 
      className="pointer-events-none absolute inset-0 bg-white"
      style={{
        maskImage: 'radial-gradient(ellipse at center, transparent 20%, black)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 20%, black)'
      }}
    />
  </div>
));
OptimizedBackground.displayName = 'OptimizedBackground';

// Memoized floating elements with pure CSS animations
const FloatingElements = memo(() => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div 
      className="absolute top-1/4 left-1/6 w-2 h-2 bg-blue-500/20 rounded-full"
      style={{
        animation: 'float-slow 8s ease-in-out infinite',
        willChange: 'transform'
      }}
    />
    <div 
      className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-green-500/25 rounded-full"
      style={{
        animation: 'float-medium 6s ease-in-out infinite 2s',
        willChange: 'transform'
      }}
    />
    <div 
      className="absolute bottom-1/3 left-1/4 w-2.5 h-2.5 bg-yellow-500/15 rounded-full"
      style={{
        animation: 'float-fast 4s ease-in-out infinite 1s',
        willChange: 'transform'
      }}
    />
  </div>
));
FloatingElements.displayName = 'FloatingElements';


export default function Dashboard() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { theme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  
  const isDark = theme === 'dark';
  
  // Ultra-optimized handlers with stable references
  const handleSendMessage = useCallback((message: string) => {
    if (message.trim()) {
      sessionStorage.setItem('pendingMessage', message.trim());
      router.push('/chat');
    }
  }, [router]);

  const handleStopGeneration = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleDSAClick = useCallback(() => {
    handleSendMessage("Help me get started with Data Structures and Algorithms");
  }, [handleSendMessage]);

  const handleOOPClick = useCallback(() => {
    handleSendMessage("Explain Object-Oriented Programming concepts with examples");
  }, [handleSendMessage]);

  const handleStudyPlanClick = useCallback(() => {
    handleSendMessage("Create a study plan for first-year computer science");
  }, [handleSendMessage]);

  const toggleSidebar = useCallback(() => {
    setShowSidebar(prev => !prev);
  }, []);

  const toggleMenu = useCallback(() => {
    setShowMenu(prev => !prev);
  }, []);

  const navigateToSubjects = useCallback(() => {
    router.push('/dashboard/subjects');
  }, [router]);

  // Memoized user display name
  const userName = useMemo(() => user?.firstName || 'Student', [user?.firstName]);
  
  return (
    <div className={`min-h-screen relative overflow-hidden ${isDark ? 'dark' : ''}`}>
      {/* Optimized Static CSS Animations */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(-3px, -6px); }
          50% { transform: translate(3px, 6px); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translate(3px, 6px); }
          50% { transform: translate(-3px, -6px); }
        }
        @keyframes float-fast {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.1); opacity: 0.25; }
        }
      `}</style>

      {/* Background Components - Conditional based on theme */}
      <div className="fixed inset-0 z-0">
        {isDark ? (
          <DarkModeBackground />
        ) : (
          <>
            <OptimizedBackground />
            <FloatingElements />
          </>
        )}
      </div>

      {/* Optimized Navigation */}
      <nav className={`relative z-10 p-1 border transition-colors duration-300 ${
        isDark 
          ? 'bg-transparent border-gray-600/1 ' 
          : 'bg-white border-gray-200/30 shadow-2xl shadow-black/10 shadow-outer'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Side - Optimized */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className={`p-2 rounded-xl border hover:border-blue-500 hover:bg-blue-500 hover:text-white transition-colors duration-150 ${
                  isDark 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                title="Toggle Learning Realms"
              >
                <PiSidebar className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <ThemeAwareLogo width={50} height={50} />
                <span className={`text-xl font-bold transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>EVOLVE</span>
              </div>
            </div>
            
            {/* Theme Toggle and User Menu - Optimized */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle Switch */}
              <Switch />
              
              <div className="relative">
                <button
                  onClick={toggleMenu}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border hover:border-blue-500 transition-colors duration-150 ${
                    isDark 
                      ? 'bg-gray-800 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <PiUser className="w-4 h-4 text-white" />
                  </div>
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {userName}
                  </span>
                </button>
                
                {showMenu && (
                  <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl shadow-lg border overflow-hidden ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <button 
                      onClick={navigateToSubjects}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 ${
                        isDark ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-50 text-gray-900'
                      }`}
                    >
                      <PiBooks className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">My Subjects</span>
                    </button>
                    <button className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 ${
                      isDark ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-50 text-gray-900'
                    }`}>
                      <PiGear className={`w-4 h-4 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`} />
                      <span className="text-sm font-medium">Settings</span>
                    </button>
                    <button 
                      onClick={() => signOut()}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 border-t ${
                        isDark 
                          ? 'hover:bg-gray-700 border-gray-700 text-white' 
                          : 'hover:bg-gray-50 border-gray-100 text-gray-900'
                      }`}
                    >
                      <PiSignOut className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-red-500">Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Ultra-Fast Main Content */}
      <main className="relative z-20 flex-1 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-4xl mx-auto px-6">
          
          {/* Optimized Welcome Section */}
          <div className="text-center mb-12">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-400 mb-6 ${
              isDark ? 'bg-gray-800/95' : 'bg-white/95'
            }`}>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-blue-500">AI-Powered Learning</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
            
            <h1 className={`text-6xl md:text-7xl font-bold mb-4 leading-none transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Hello,
              <br />
              <span className="text-transparent bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text">
                {userName}
              </span>
            </h1>
            
            <p className={`text-xl max-w-2xl mx-auto mb-2 transition-colors duration-300 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              What would you like to learn today?
            </p>
            
            <p className={`text-sm mb-8 transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Type your question below and hit enter to start chatting with EVOLVE AI
            </p>
          </div>

          {/* Optimized Chat Input Section */}
          <div className="mb-8">
          <div className={`rounded-2xl p-1 border-0 transition-colors duration-300 ${
  isDark 
    ? 'bg-white/10 border-gray-800/1 shadow-[0_0_100px_20px_rgba(0,0,0,1)]' 
    : 'bg-white border-gray-200/30 shadow-[0_0_20px_1px_rgba(0,0,0,0.2)]'
}`}>

              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                placeholder="Ask me anything about your subjects, projects, or learning goals..."
                onStop={handleStopGeneration}
              />
            </div>
          </div>

          {/* Ultra-Fast Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <button
              onClick={handleDSAClick}
              className={`group backdrop-blur-sm rounded-xl p-4 border border-blue-300 hover:border-blue-500 transition-colors duration-150 text-left ${
                isDark 
                  ? 'bg-gray-800/95 hover:bg-gray-700/95' 
                  : 'bg-white/95 hover:bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150 ${
                  isDark 
                    ? 'bg-blue-900/50 group-hover:bg-blue-800/70' 
                    : 'bg-blue-100 group-hover:bg-blue-200'
                }`}>
                  <PiBooks className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium mb-1 transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Start Learning DSA</h3>
                  <p className={`text-xs transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Get started with algorithms</p>
                </div>
                <PiArrowRight className={`w-4 h-4 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-150 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`} />
              </div>
            </button>

            <button
              onClick={handleOOPClick}
              className={`group backdrop-blur-sm rounded-xl p-4 border border-green-300 hover:border-green-500 transition-colors duration-150 text-left ${
                isDark 
                  ? 'bg-gray-800/95 hover:bg-gray-700/95' 
                  : 'bg-white/95 hover:bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150 ${
                  isDark 
                    ? 'bg-green-900/50 group-hover:bg-green-800/70' 
                    : 'bg-green-100 group-hover:bg-green-200'
                }`}>
                  <PiChatCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium mb-1 transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Learn OOP</h3>
                  <p className={`text-xs transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Object-oriented concepts</p>
                </div>
                <PiArrowRight className={`w-4 h-4 group-hover:text-green-500 group-hover:translate-x-1 transition-all duration-150 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`} />
              </div>
            </button>

            <button
              onClick={handleStudyPlanClick}
              className={`group backdrop-blur-sm rounded-xl p-4 border border-yellow-300 hover:border-yellow-500 transition-colors duration-150 text-left ${
                isDark 
                  ? 'bg-gray-800/95 hover:bg-gray-700/95' 
                  : 'bg-white/95 hover:bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150 ${
                  isDark 
                    ? 'bg-yellow-900/50 group-hover:bg-yellow-800/70' 
                    : 'bg-yellow-100 group-hover:bg-yellow-200'
                }`}>
                  <PiMagnifyingGlass className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium mb-1 transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Study Plan</h3>
                  <p className={`text-xs transition-colors duration-300 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Personalized roadmap</p>
                </div>
                <PiArrowRight className={`w-4 h-4 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all duration-150 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`} />
              </div>
            </button>
          </div>
        </div>
      </main>
      
      {/* EVOLVE Sidebar */}
      <EvolveSidebar 
        isOpen={showSidebar} 
        onToggle={setShowSidebar} 
      />
    </div>
  );
}
