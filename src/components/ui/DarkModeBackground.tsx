"use client";
import React, { useMemo, useCallback } from "react";
import { motion } from "motion/react";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";

// Memoized overlay component to prevent re-renders
const MemoizedOverlay = React.memo(() => (
  <div 
    className="absolute inset-0"
    style={{
      background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.6) 100%)',
      willChange: 'auto' // Optimize for performance
    }}
  />
));
MemoizedOverlay.displayName = 'MemoizedOverlay';

// Memoized canvas effect with optimized settings
const MemoizedCanvasEffect = React.memo(() => (
  <CanvasRevealEffect
    animationSpeed={1.5} // Reduced from 2.5 for better performance
    containerClassName="bg-transparent"
    colors={[
      [59, 130, 246],   // Blue
      [139, 92, 246],   // Purple
      [34, 197, 163]    // Teal
    ]}
    opacities={[0.1, 0.1, 0.2, 0.2, 0.25, 0.25, 0.3, 0.3, 0.4, 0.6]} // Reduced opacity range for performance
    dotSize={2} // Larger dots for better visibility
    showGradient={false}
  />
));
MemoizedCanvasEffect.displayName = 'MemoizedCanvasEffect';

export default function DarkModeBackground() {
  const [hovered, setHovered] = React.useState(false);
  
  // Memoized handlers to prevent recreation on every render
  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);
  
  // Memoized animation values
  const animationValues = useMemo(() => ({
    opacity: hovered ? 0.85 : 0.6, // Slightly reduced max opacity
    transition: { duration: 0.2 } // Faster, smoother transition
  }), [hovered]);
  
  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="fixed inset-0 overflow-hidden z-0"
      style={{
        willChange: 'auto', // Optimize for performance
        contain: 'layout style paint', // CSS containment for better performance
        width: '100vw',
        height: '100vh',
        left: 0,
        top: 0
      }}
    >
      {/* Base black background with full coverage */}
      <div 
        className="absolute bg-black" 
        style={{ 
          willChange: 'auto',
          width: '100%',
          height: '100%',
          left: 0,
          top: 0,
          right: 0,
          bottom: 0
        }}
      />
      
      {/* Optimized canvas effect with full coverage */}
      <motion.div
        className="absolute"
        animate={{ opacity: animationValues.opacity }}
        transition={animationValues.transition}
        style={{
          willChange: 'opacity', // Only animate opacity for better performance
          backfaceVisibility: 'hidden', // Prevent flickering
          perspective: 1000, // Enable hardware acceleration
          width: '100%',
          height: '100%',
          left: 0,
          top: 0,
          right: 0,
          bottom: 0
        }}
      >
        <MemoizedCanvasEffect />
      </motion.div>
      
      {/* Memoized overlay for consistent performance */}
      <MemoizedOverlay />
    </div>
  );
}
