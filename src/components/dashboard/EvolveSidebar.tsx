"use client";

import { useState, useCallback, useMemo, memo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  PiSparkle,
  PiChatCircle,
  PiBooks,
  PiLightbulb,
  PiInfinity,
  PiUsers,
  PiClockCounterClockwise,
  PiTargetDuotone,
  PiCaretLeft,
  PiCaretRight,
  PiNotebook,
  PiCode,
  PiHeart,
  PiStar,
  PiFlame,
  PiTreeStructure
} from 'react-icons/pi';

interface SidebarProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

// EVOLVE's unique "Learning Realms" - Creative naming inspired by the project's identity
const learningRealms = [
  {
    id: 'evolve-chat',
    name: 'Neural Chat',
    description: 'AI-powered conversations',
    icon: PiChatCircle,
    path: '/chat',
    color: '#4285F4',
    section: 'core'
  },
  {
    id: 'knowledge-realm',
    name: 'Knowledge Realm',
    description: 'Your learning subjects',
    icon: PiBooks,
    path: '/dashboard/subjects',
    color: '#34C9A3',
    section: 'core'
  },
  {
    id: 'insight-lab',
    name: 'Insight Lab',
    description: 'Project-based learning',
    icon: PiLightbulb,
    path: '/dashboard/projects',
    color: '#FFB623',
    section: 'core'
  },
  {
    id: 'infinity-canvas',
    name: 'Infinity Canvas',
    description: 'Mind maps & connections',
    icon: PiInfinity,
    path: '/dashboard/canvas',
    color: '#E5533C',
    section: 'creation'
  },
  {
    id: 'code-forge',
    name: 'Code Forge',
    description: 'Programming workspace',
    icon: PiCode,
    path: '/dashboard/code',
    color: '#9C27B0',
    section: 'creation'
  },
  {
    id: 'memory-vault',
    name: 'Memory Vault',
    description: 'Chat history & notes',
    icon: PiClockCounterClockwise,
    path: '/dashboard/history',
    color: '#607D8B',
    section: 'memory'
  },
  {
    id: 'learning-chronicles',
    name: 'Learning Chronicles',
    description: 'Your progress journey',
    icon: PiNotebook,
    path: '/dashboard/progress',
    color: '#4CAF50',
    section: 'memory'
  },
  {
    id: 'achievement-nexus',
    name: 'Achievement Nexus',
    description: 'Milestones & rewards',
    icon: PiTargetDuotone,
    path: '/dashboard/achievements',
    color: '#FF9800',
    section: 'growth'
  },
  {
    id: 'learning-tribe',
    name: 'Learning Tribe',
    description: 'Community & collaboration',
    icon: PiUsers,
    path: '/dashboard/community',
    color: '#8BC34A',
    section: 'growth'
  }
];

const sectionNames = {
  core: 'Core Spaces',
  creation: 'Creation Studios',
  memory: 'Memory Vaults',
  growth: 'Growth Realms'
};

// Memoized realm button for ultra performance
const RealmButton = memo(({ 
  realm, 
  isActive, 
  hoveredRealm, 
  onHover, 
  onHoverEnd, 
  onClick 
}: {
  realm: typeof learningRealms[0];
  isActive: boolean;
  hoveredRealm: string | null;
  onHover: (id: string) => void;
  onHoverEnd: () => void;
  onClick: (realm: typeof learningRealms[0]) => void;
}) => {
  const IconComponent = realm.icon;
  
  return (
    <button
      onClick={() => onClick(realm)}
      onMouseEnter={() => onHover(realm.id)}
      onMouseLeave={onHoverEnd}
      className={`
        w-full group relative overflow-hidden rounded-xl p-3 text-left transition-all duration-150
        ${isActive 
          ? 'bg-white border-2 border-dashed shadow-lg' 
          : 'bg-white/60 border border-dashed border-gray-300 hover:bg-white hover:border-gray-400'
        }
      `}
      style={{
        borderColor: isActive ? realm.color : undefined
      }}
    >
      {/* Hover Effect Background */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-150"
        style={{ background: `linear-gradient(135deg, ${realm.color}20, ${realm.color}05)` }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex items-center gap-3">
        <div 
          className={`
            w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150
            ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-white'}
          `}
          style={{ 
            backgroundColor: isActive ? realm.color : `${realm.color}15`,
            ...(hoveredRealm === realm.id && !isActive ? { backgroundColor: realm.color } : {})
          }}
        >
          <IconComponent className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`
            font-semibold text-sm transition-colors duration-150 mb-0.5
            ${isActive ? 'text-gray-900' : 'text-gray-900'}
          `}>
            {realm.name}
          </h3>
          <p className="text-xs text-gray-600 transition-colors duration-150 line-clamp-1">
            {realm.description}
          </p>
        </div>

        {/* Active Indicator */}
        {isActive && (
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: realm.color }}
          />
        )}
      </div>

      {/* Corner decoration */}
      {(isActive || hoveredRealm === realm.id) && (
        <div
          className="absolute top-2 right-2 w-1 h-1 rounded-full opacity-30"
          style={{ backgroundColor: realm.color }}
        />
      )}
    </button>
  );
});
RealmButton.displayName = 'RealmButton';

export default function EvolveSidebar({ isOpen, onToggle }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const [hoveredRealm, setHoveredRealm] = useState<string | null>(null);

  // Memoized grouped realms to prevent re-calculation
  const groupedRealms = useMemo(() => {
    return learningRealms.reduce((acc, realm) => {
      if (!acc[realm.section]) acc[realm.section] = [];
      acc[realm.section].push(realm);
      return acc;
    }, {} as Record<string, typeof learningRealms>);
  }, []);

  // Optimized handlers with useCallback
  const handleRealmClick = useCallback((realm: typeof learningRealms[0]) => {
    router.push(realm.path);
  }, [router]);

  const isRealmActive = useCallback((path: string) => {
    return pathname === path || pathname.startsWith(path);
  }, [pathname]);

  const handleRealmHover = useCallback((id: string) => {
    setHoveredRealm(id);
  }, []);

  const handleRealmHoverEnd = useCallback(() => {
    setHoveredRealm(null);
  }, []);

  const toggleSidebar = useCallback(() => {
    onToggle(!isOpen);
  }, [isOpen, onToggle]);

  // Memoized user name
  const userName = useMemo(() => user?.firstName || 'Student', [user?.firstName]);

  return (
    <div
      className={`fixed left-0 top-0 z-50 h-screen w-80 bg-white/95 border-r border-gray-200 overflow-hidden flex flex-col transition-transform duration-200 ease-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{
        boxShadow: isOpen ? '8px 0 32px rgba(0, 0, 0, 0.08)' : 'none'
      }}
    >
      {/* Simplified Background */}
      <div 
        className="absolute inset-0 opacity-5" 
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }} 
      />
      
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-12 top-20 w-10 h-12 bg-white/95 rounded-r-xl border border-gray-200 border-l-0 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all duration-150 z-10"
      >
        {isOpen ? <PiCaretLeft className="w-5 h-5" /> : <PiCaretRight className="w-5 h-5" />}
      </button>

      {/* Header Section - Optimized */}
      <div className="relative z-10 p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
            <PiSparkle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">EVOLVE</h2>
            <p className="text-sm text-gray-600">Learning Realms</p>
          </div>
        </div>
        
        {/* Welcome Message with Progress Bar - Optimized */}
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
          <p className="text-sm text-gray-900 font-semibold mb-1">
            Welcome, {userName}!
          </p>
          <p className="text-xs text-gray-600 mb-2">
            Explore your learning journey
          </p>
          
          {/* Simplified Progress Bar */}
          <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-1000"
              style={{ width: '45%' }}
            />
          </div>
        </div>
      </div>

      {/* Learning Realms - Ultra Optimized */}
      <div className="relative z-10 flex-1 p-4 space-y-2 min-h-0 overflow-y-auto">
        {Object.entries(groupedRealms).map(([section, realms]) => (
          <div key={section}>
            {/* Section Header - Optimized */}
            <div className="flex items-center gap-3 mb-2 px-1">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
                {sectionNames[section as keyof typeof sectionNames]}
              </span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            {/* Realms in Section - Ultra Optimized */}
            <div className="space-y-1">
              {realms.map((realm) => {
                const isActive = isRealmActive(realm.path);
                
                return (
                  <RealmButton
                    key={realm.id}
                    realm={realm}
                    isActive={isActive}
                    hoveredRealm={hoveredRealm}
                    onHover={handleRealmHover}
                    onHoverEnd={handleRealmHoverEnd}
                    onClick={handleRealmClick}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Section - Optimized */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200">
        <div className="flex justify-around items-center">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center hover:scale-105 transition-transform duration-150 cursor-pointer">
              <PiStar className="w-5 h-5 text-white" />
            </div>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center hover:scale-105 transition-transform duration-150 cursor-pointer">
              <PiHeart className="w-5 h-5 text-white" />
            </div>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center hover:scale-105 transition-transform duration-150 cursor-pointer">
              <PiFlame className="w-5 h-5 text-white" />
            </div>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center hover:scale-105 transition-transform duration-150 cursor-pointer">
              <PiTreeStructure className="w-5 h-5 text-white" />
            </div>
        </div>
        <p className="text-xs text-center text-gray-600 mt-4 italic">
          &quot;Empower your learning one realm at a time.&quot;
        </p>
      </div>
    </div>
  );
}
