import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { memo } from 'react';
import ThemeAwareLogo from '@/components/ui/ThemeAwareLogo';
import { 
  PiBookOpenText, 
  PiPencilLine, 
  PiLightbulb, 
  PiGraduationCap,
  PiPuzzlePiece,
  PiGithubLogo,
  PiGoogleLogo
} from 'react-icons/pi';
import Switch from '@/components/ui/Switch';
import { useTheme } from '@/contexts/ThemeContext';
import DarkModeBackground from '@/components/ui/DarkModeBackground';

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

export default function OnboardingPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
      {isDark ? (
        <DarkModeBackground />
      ) : (
        <>
          <OptimizedBackground />
          <FloatingElements />
        </>
      )}

      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 opacity-10">
        <PiPencilLine className="text-6xl text-foreground transform rotate-12" />
      </div>
      <div className="absolute top-20 right-20 opacity-10">
        <PiLightbulb className="text-5xl text-foreground transform -rotate-12" />
      </div>
      <div className="absolute bottom-20 left-20 opacity-10">
        <PiGraduationCap className="text-7xl text-foreground transform rotate-6" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-10">
        <PiPuzzlePiece className="text-6xl text-foreground transform -rotate-6" />
      </div>
      
      {/* Main content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen text-center px-4">
        
        {/* Theme Toggle - Top Right */}
        <div className="absolute top-8 right-8 z-30">
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Theme</span>
            <Switch />
          </div>
        </div>

        {/* Logo/Brand */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <ThemeAwareLogo
              width={80}
              height={80}
              className="mr-3"
            />
            <h1 className={`text-6xl font-bold tracking-wide ${isDark ? 'text-white' : 'text-gray-900'}`}>
              EVOLVE
            </h1>
          </div>
          <div className="w-32 h-1 bg-[#4285F4] mx-auto mb-4 rounded-full"></div>
        </div>
        
        {/* Tagline */}
        <div className="mb-8">
          <h2 className={`text-3xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Get Ready To <span className="text-[#4285F4]">EVOLVE</span>
          </h2>
          <p className={`text-lg max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Transform your learning experience with AI-powered personalized education. 
            Master university subjects through project-based learning, visual diagrams, 
            and interactive problem-solving.
          </p>
        </div>
        
        {/* Features */}
        <div className="flex flex-wrap items-center justify-center gap-8 mb-12">
          <div className="flex items-center gap-2">
            <PiBookOpenText className="text-2xl text-[#34C9A3]" />
            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>AI Learning</span>
          </div>
          <div className="flex items-center gap-2">
            <PiPuzzlePiece className="text-2xl text-[#FFB623]" />
            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Project Based</span>
          </div>
          <div className="flex items-center gap-2">
            <PiLightbulb className="text-2xl text-[#4285F4]" />
            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Visual Learning</span>
          </div>
        </div>
        
        {/* Authentication buttons */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignInButton mode="modal">
              <button className={`sketch-btn text-lg px-8 py-3 transition-colors duration-300 rounded-lg border-2 font-medium ${
                isDark 
                  ? 'bg-gray-800 border-gray-600 text-white hover:bg-[#4285F4] hover:border-[#4285F4]' 
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-[#4285F4] hover:text-white hover:border-[#4285F4]'
              }`}>
                Sign In to Continue
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="sketch-btn text-lg px-8 py-3 bg-[#4285F4] text-white hover:bg-[#34C9A3] hover:text-white transition-colors duration-300 rounded-lg border-2 border-[#4285F4] hover:border-[#34C9A3] font-medium">
                Get Started Free
              </button>
            </SignUpButton>
          </div>
          
          {/* OAuth providers info */}
          <div className="mt-6">
            <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Sign in with:</p>
            <div className="flex justify-center gap-6">
              <div className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <PiGithubLogo className="text-xl" />
                <span className="text-sm">GitHub</span>
              </div>
              <div className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <PiGoogleLogo className="text-xl" />
                <span className="text-sm">Google</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Join thousands of students already learning with EVOLVE
          </p>
        </div>
      </div>
    </div>
  );
}

