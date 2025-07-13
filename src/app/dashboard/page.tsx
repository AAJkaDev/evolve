"use client";

import { useUser, SignOutButton } from '@clerk/nextjs';
import Image from 'next/image';
import { PiRocketLaunch, PiGraduationCap, PiBookOpenText, PiUser } from 'react-icons/pi';

export default function Dashboard() {
  const { user } = useUser();
  
  return (
    <div className="min-h-screen bg-[#F5F5EC] relative">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-dashed border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image
                src="/logo.svg"
                alt="EVOLVE Logo"
                width={32}
                height={32}
                className="mr-2"
              />
              <h1 className="text-2xl font-bold text-[#1A1A1A]">EVOLVE</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <PiUser className="text-xl text-[#363636]" />
                <span className="text-[#363636] font-medium">Hello, {user?.firstName}!</span>
              </div>
              <SignOutButton>
                <button className="sketch-btn text-sm px-4 py-2 bg-[#E5533C] text-black hover:bg-[#FFB623] hover:text-black transition-colors duration-300">
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#1A1A1A] mb-4">
            Welcome to Your Learning Dashboard
          </h2>
          <p className="text-lg text-[#363636] max-w-2xl mx-auto">
            Your personalized AI-powered learning journey starts here. 
            Choose from our available subjects to begin your EVOLVE experience.
          </p>
        </div>
        
        {/* Subject Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Data Structures & Algorithms */}
          <div className="bg-white p-6 rounded-lg shadow-md border-2 border-dashed border-[#4285F4] hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <PiBookOpenText className="text-3xl text-[#4285F4] mr-3" />
              <h3 className="text-xl font-semibold text-[#1A1A1A]">Data Structures & Algorithms</h3>
            </div>
            <p className="text-[#363636] mb-4">
              Master fundamental programming concepts with visual learning and hands-on coding.
            </p>
            <button className="sketch-btn text-sm px-4 py-2 bg-[#4285F4] text-black hover:bg-[#34C9A3] hover:text-black transition-colors duration-300">
              Start Learning
            </button>
          </div>
          
          {/* Object Oriented Programming */}
          <div className="bg-white p-6 rounded-lg shadow-md border-2 border-dashed border-[#34C9A3] hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <PiGraduationCap className="text-3xl text-[#34C9A3] mr-3" />
              <h3 className="text-xl font-semibold text-[#1A1A1A]">Object Oriented Programming</h3>
            </div>
            <p className="text-[#363636] mb-4">
              Learn OOP principles through interactive projects and real-world applications.
            </p>
            <button className="sketch-btn text-sm px-4 py-2 bg-[#34C9A3] text-black hover:bg-white hover:text-[#34C9A3] transition-colors duration-300">
              Start Learning
            </button>
          </div>
          
          {/* More subjects coming soon */}
          <div className="bg-white p-6 rounded-lg shadow-md border-2 border-dashed border-[#FFB623] hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <PiRocketLaunch className="text-3xl text-[#FFB623] mr-3" />
              <h3 className="text-xl font-semibold text-[#1A1A1A]">More Subjects</h3>
            </div>
            <p className="text-[#363636] mb-4">
              Additional first-year university subjects will be available soon.
            </p>
            <button className="sketch-btn text-sm px-4 py-2 bg-[#FFB623] text-black hover:bg-white hover:text-[#FFB623] transition-colors duration-300" disabled>
              Coming Soon
            </button>
          </div>
        </div>
        
        {/* Features Preview */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-[#1A1A1A] mb-8">What Makes EVOLVE Special</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#4285F4] rounded-full flex items-center justify-center mx-auto mb-4">
                <PiBookOpenText className="text-2xl text-white" />
              </div>
              <h4 className="font-semibold text-[#1A1A1A] mb-2">AI-Powered Learning</h4>
              <p className="text-sm text-[#363636]">Personalized content and instant feedback</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#34C9A3] rounded-full flex items-center justify-center mx-auto mb-4">
                <PiGraduationCap className="text-2xl text-white" />
              </div>
              <h4 className="font-semibold text-[#1A1A1A] mb-2">Project-Based Learning</h4>
              <p className="text-sm text-[#363636]">Learn by doing real-world projects</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FFB623] rounded-full flex items-center justify-center mx-auto mb-4">
                <PiRocketLaunch className="text-2xl text-white" />
              </div>
              <h4 className="font-semibold text-[#1A1A1A] mb-2">Visual Learning</h4>
              <p className="text-sm text-[#363636]">Diagrams and interactive visualizations</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#E5533C] rounded-full flex items-center justify-center mx-auto mb-4">
                <PiUser className="text-2xl text-white" />
              </div>
              <h4 className="font-semibold text-[#1A1A1A] mb-2">Personalized Path</h4>
              <p className="text-sm text-[#363636]">Adaptive learning tailored to you</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
