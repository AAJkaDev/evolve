"use client";

import { useUser } from '@clerk/nextjs';
import { PiBookOpenText, PiGraduationCap, PiRocketLaunch, PiUser } from 'react-icons/pi';
import { DashboardHeader, SubjectCard } from '@/components';
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
  
  return (
    <div className="min-h-screen bg-[#F5F5EC] relative">
      <DashboardHeader user={user} />
      
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} onStartLearning={(id) => console.log(`Starting learning for subject ${id}`)} />
          ))}
        </div>
        
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
