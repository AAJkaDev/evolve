import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PiUser, PiChatCircle } from 'react-icons/pi';
import { SignOutButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/Button';
import type { UserResource } from '@clerk/types';

interface DashboardHeaderProps {
  user: UserResource | null | undefined;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
  return (
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
            <Link href="/chat">
              <Button
                variant="primary"
                size="sm"
                className="px-4 py-2 bg-[#4285F4] text-black hover:bg-[#34C9A3] hover:text-black transition-colors duration-300 flex items-center gap-2"
              >
                <PiChatCircle className="text-lg" />
                Chat with me
              </Button>
            </Link>
            <SignOutButton>
              <Button
                variant="danger"
                size="sm"
                className="px-4 py-2 bg-[#E5533C] text-black hover:bg-[#FFB623] hover:text-black transition-colors duration-300"
              >
                Sign Out
              </Button>
            </SignOutButton>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
