"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeAwareLogo from '@/components/ui/ThemeAwareLogo';
import { 
  PiHouse, 
  PiHouseFill,
  PiBrain,
  PiBrainFill,
  PiCode,
  PiCodeFill,
  PiUser,
  PiUserFill,
  PiGear,
  PiGearFill
} from 'react-icons/pi';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
}

interface FloatingLeftSidebarProps {
  forceCollapsed?: boolean;
}

const FloatingLeftSidebar: React.FC<FloatingLeftSidebarProps> = ({ forceCollapsed = false }) => {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(false);
  
  // Check if we're on a subjects page (should be collapsed)
  const shouldBeCollapsed = forceCollapsed || pathname.startsWith('/dashboard/subjects');
  const isExpanded = shouldBeCollapsed ? isManuallyExpanded : (isHovered || isManuallyExpanded);
  
  // Check if we're on individual subject page (not just subjects overview)
  const isIndividualSubjectPage = pathname.startsWith('/dashboard/subjects/') && pathname !== '/dashboard/subjects';
  
  const handleToggleExpanded = () => {
    if (shouldBeCollapsed) {
      setIsManuallyExpanded(!isManuallyExpanded);
    }
  };

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'HOME',
      href: '/dashboard',
      icon: <PiHouse className="w-5 h-5" />,
      activeIcon: <PiHouseFill className="w-5 h-5" />
    },
    {
      id: 'memory',
      label: 'MEMORY',
      href: '/dashboard/memory',
      icon: <PiBrain className="w-5 h-5" />,
      activeIcon: <PiBrainFill className="w-5 h-5" />
    },
    {
      id: 'subjects',
      label: 'SUBJECTS',
      href: '/dashboard/subjects',
      icon: <PiCode className="w-5 h-5" />,
      activeIcon: <PiCodeFill className="w-5 h-5" />
    },
    {
      id: 'profile',
      label: 'PROFILE',
      href: '/dashboard/profile',
      icon: <PiUser className="w-5 h-5" />,
      activeIcon: <PiUserFill className="w-5 h-5" />
    }
  ];

  // Ultra-smooth animation configurations
  const springConfig = {
    type: "spring" as const,
    stiffness: 260,
    damping: 20,
    mass: 1
  };

  const sidebarVariants = {
    collapsed: { 
      width: shouldBeCollapsed ? '4rem' : '5rem',
      height: shouldBeCollapsed ? '4rem' : 'auto',
      transition: {
        ...springConfig,
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    },
    expanded: { 
      width: '14rem',
      height: 'auto',
      transition: {
        ...springConfig,
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const containerVariants = {
    hidden: { 
      x: shouldBeCollapsed ? -60 : -100, 
      opacity: 0,
      scale: shouldBeCollapsed ? 0.9 : 0.8
    },
    visible: { 
      x: 0, 
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
        mass: 1,
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`fixed left-4 z-50 ${isIndividualSubjectPage ? 'bottom-6' : 'top-1/2 -translate-y-1/2'}`}
    >
      <motion.div
        variants={sidebarVariants}
        animate={isExpanded ? "expanded" : "collapsed"}
        onMouseEnter={() => !shouldBeCollapsed && setIsHovered(true)}
        onMouseLeave={() => {
          if (!shouldBeCollapsed) {
            setIsHovered(false);
            setHoveredItem(null);
          }
        }}
        onClick={shouldBeCollapsed ? handleToggleExpanded : undefined}
        className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border-2 border-black overflow-hidden cursor-pointer relative"
        style={{ willChange: 'width' }}
      >
        {shouldBeCollapsed && !isExpanded ? (
          // Minimal logo-only view for subjects pages
          <div className="w-16 h-16 flex items-center justify-center">
            <motion.div 
              className="flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              onMouseEnter={() => setHoveredItem('logo')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <motion.div
                animate={{ 
                  rotate: hoveredItem === 'logo' ? 360 : 0,
                  scale: hoveredItem === 'logo' ? 1.1 : 1
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="cursor-pointer flex items-center justify-center"
              >
                <ThemeAwareLogo
                  width={28}
                  height={28}
                  className="opacity-90"
                />
              </motion.div>
            </motion.div>
            
            {/* Hover tooltip */}
            <AnimatePresence>
              {hoveredItem === 'logo' && (
                <motion.div
                  initial={{ opacity: 0, x: -10, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.8 }}
                  className="absolute left-16 bg-[#1A1A1A] text-white px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap z-50"
                >
                  Click to expand
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1A1A1A] rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          // Full sidebar view
          <motion.div 
            className="py-6 px-4"
            animate={{
              justifyContent: isExpanded ? 'flex-start' : 'center'
            }}
            transition={springConfig}
          >
            {/* Logo Section - Ultra Smooth */}
            <motion.div 
              className={`mb-8 flex items-center ${isExpanded ? 'justify-start' : 'justify-center'}`}
              animate={{
                justifyContent: isExpanded ? 'flex-start' : 'center'
              }}
              transition={springConfig}
            >
              <Link href="/dashboard" className="block">
                <motion.div 
                  className="relative group"
                  whileHover={{ 
                    scale: 1.08,
                    transition: {
                      type: "spring",
                      stiffness: 400,
                      damping: 25
                    }
                  }}
                  whileTap={{ scale: 0.92 }}
                >
                  {/* Logo Glow Effect */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-[#4285F4]/10 to-[#4285F4]/5 rounded-xl blur-xl"
                    animate={{
                      opacity: hoveredItem === 'logo' ? 0.8 : 0.4,
                      scale: hoveredItem === 'logo' ? 1.2 : 1
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                  
                  {/* Logo Container */}
                  <motion.div 
                    className="relative flex items-center justify-center w-12 h-12 bg-white border-2 border-[#4285F4]/20 rounded-xl shadow-sm"
                    whileHover={{ borderColor: 'rgba(66, 133, 244, 0.5)' }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      animate={{ rotate: hoveredItem === 'logo' ? 360 : 0 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    >
                      <ThemeAwareLogo
                        width={28}
                        height={28}
                        className="opacity-90"
                      />
                    </motion.div>
                  </motion.div>
                </motion.div>
              </Link>
              
              <AnimatePresence mode="wait">
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, x: -20, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0, 
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 25
                      }
                    }}
                    exit={{ 
                      opacity: 0, 
                      x: -10, 
                      scale: 0.9,
                      transition: { duration: 0.2 }
                    }}
                    className="ml-3 overflow-hidden"
                  >
                    <motion.h2 
                      className="font-bold text-xl text-[#1A1A1A] leading-none"
                      initial={{ y: 20 }}
                      animate={{ y: 0 }}
                      transition={{ delay: 0.1, ...springConfig }}
                    >
                      EVOLVE
                    </motion.h2>
                    <motion.p 
                      className="text-xs text-[#363636]/60 mt-0.5"
                      initial={{ y: 20 }}
                      animate={{ y: 0 }}
                      transition={{ delay: 0.15, ...springConfig }}
                    >
                      Learning Platform
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href || (item.id === 'subjects' && pathname.startsWith('/dashboard/subjects'));
              const isItemHovered = hoveredItem === item.id;
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="block"
                  >
                    <motion.div
                      className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} p-3 rounded-xl transition-colors duration-200 relative ${
                        isActive 
                          ? 'bg-[#4285F4] text-white shadow-lg' 
                          : isItemHovered
                          ? 'bg-[#F5F5EC] text-[#1A1A1A]'
                          : 'text-[#363636]'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Active Indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute inset-0 bg-[#4285F4] rounded-xl"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      
                      {/* Icon Container */}
                      <motion.div 
                        className="relative z-10 flex items-center justify-center w-6 h-6"
                        animate={{ 
                          scale: isActive || isItemHovered ? 1.1 : 1
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {isActive || isItemHovered ? item.activeIcon : item.icon}
                      </motion.div>
                      
                      {/* Label */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className={`ml-3 font-medium text-sm whitespace-nowrap relative z-10 ${
                              isActive ? 'text-white' : ''
                            }`}
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="my-4 h-px bg-gray-200" />

          {/* Settings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/dashboard/settings"
              onMouseEnter={() => setHoveredItem('settings')}
              onMouseLeave={() => setHoveredItem(null)}
              className="block"
            >
              <motion.div
                className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} p-3 rounded-xl transition-colors duration-200 ${
                  pathname === '/dashboard/settings'
                    ? 'bg-[#4285F4] text-white shadow-lg'
                    : hoveredItem === 'settings'
                    ? 'bg-[#F5F5EC] text-[#1A1A1A]'
                    : 'text-[#363636]'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className="flex items-center justify-center w-6 h-6"
                  animate={{ 
                    scale: pathname === '/dashboard/settings' || hoveredItem === 'settings' ? 1.1 : 1,
                    rotate: hoveredItem === 'settings' ? 180 : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {pathname === '/dashboard/settings' || hoveredItem === 'settings' 
                    ? <PiGearFill className="w-5 h-5" /> 
                    : <PiGear className="w-5 h-5" />
                  }
                </motion.div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className={`ml-3 font-medium text-sm whitespace-nowrap ${
                        pathname === '/dashboard/settings' ? 'text-white' : ''
                      }`}
                    >
                      Settings
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          </motion.div>

          {/* Collapse Indicator */}
          <AnimatePresence>
            {!isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2"
              >
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default FloatingLeftSidebar;
