import { SignInButton, SignUpButton } from '@clerk/nextjs';
import Image from 'next/image';
import { 
  PiBookOpenText, 
  PiPencilLine, 
  PiRocketLaunch, 
  PiLightbulb, 
  PiGraduationCap,
  PiPuzzlePiece,
  PiGithubLogo,
  PiGoogleLogo
} from 'react-icons/pi';

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-[#F5F5EC] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 opacity-10">
        <PiPencilLine className="text-6xl text-black transform rotate-12" />
      </div>
      <div className="absolute top-20 right-20 opacity-10">
        <PiLightbulb className="text-5xl text-black transform -rotate-12" />
      </div>
      <div className="absolute bottom-20 left-20 opacity-10">
        <PiGraduationCap className="text-7xl text-black transform rotate-6" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-10">
        <PiPuzzlePiece className="text-6xl text-black transform -rotate-6" />
      </div>
      
      {/* Main content */}
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        {/* Logo/Brand */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/logo.svg"
              alt="EVOLVE Logo"
              width={80}
              height={80}
              className="mr-3"
            />
            <h1 className="text-6xl font-bold text-[#1A1A1A] tracking-wide">
              EVOLVE
            </h1>
          </div>
          <div className="w-32 h-1 bg-[#4285F4] mx-auto mb-4 rounded-full"></div>
        </div>
        
        {/* Tagline */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-[#1A1A1A] mb-4">
            Get Ready To <span className="text-[#4285F4]">EVOLVE</span>
          </h2>
          <p className="text-lg text-[#363636] max-w-2xl mx-auto leading-relaxed">
            Transform your learning experience with AI-powered personalized education. 
            Master university subjects through project-based learning, visual diagrams, 
            and interactive problem-solving.
          </p>
        </div>
        
        {/* Features */}
        <div className="flex items-center justify-center gap-8 mb-12">
          <div className="flex items-center gap-2">
            <PiBookOpenText className="text-2xl text-[#34C9A3]" />
            <span className="text-[#363636] font-medium">AI Learning</span>
          </div>
          <div className="flex items-center gap-2">
            <PiPuzzlePiece className="text-2xl text-[#FFB623]" />
            <span className="text-[#363636] font-medium">Project Based</span>
          </div>
          <div className="flex items-center gap-2">
            <PiLightbulb className="text-2xl text-[#4285F4]" />
            <span className="text-[#363636] font-medium">Visual Learning</span>
          </div>
        </div>
        
        {/* Authentication buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignInButton mode="modal">
              <button className="sketch-btn text-lg px-8 py-3 bg-white text-black hover:bg-[#4285F4] hover:text-white transition-colors duration-300">
                Sign In to Continue
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="sketch-btn text-lg px-8 py-3 bg-[#4285F4] text-black hover:bg-[#34C9A3] hover:text-blue-600 transition-colors duration-300">
                Get Started Free
              </button>
            </SignUpButton>
          </div>
          
          {/* OAuth providers info */}
          <div className="mt-6">
            <p className="text-sm text-[#363636] mb-3">Sign in with:</p>
            <div className="flex justify-center gap-6">
              <div className="flex items-center gap-2 text-[#363636]">
                <PiGithubLogo className="text-xl" />
                <span className="text-sm">GitHub</span>
              </div>
              <div className="flex items-center gap-2 text-[#363636]">
                <PiGoogleLogo className="text-xl" />
                <span className="text-sm">Google</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-[#363636]">
            Join thousands of students already learning with EVOLVE
          </p>
        </div>
      </div>
    </div>
  );
}

