"use client";

import React, { useEffect, useRef, useCallback } from "react";

interface GlobalCursorProps {
  userName?: string;
}

export const GlobalCursor: React.FC<GlobalCursorProps> = ({ userName = "User" }) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorPointerRef = useRef<HTMLDivElement>(null);
  const userBubbleRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(false);
  const isHoveringRef = useRef(false);
  const isClickingRef = useRef(false);

  const colors = [
    "#0ea5e9",
    "#737373", 
    "#14b8a6",
    "#22c55e",
    "#3b82f6",
    "#ef4444",
    "#eab308",
  ];

  const currentColor = colors[Math.floor(Math.random() * colors.length)];

  // Ultra-fast mouse position update using transform instead of state
  const updateMousePosition = useCallback((e: MouseEvent) => {
    if (cursorRef.current) {
      // Use transform for hardware acceleration - no reflows/repaints
      cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    isVisibleRef.current = true;
    if (cursorRef.current) {
      cursorRef.current.style.opacity = '1';
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    isVisibleRef.current = false;
    if (cursorRef.current) {
      cursorRef.current.style.opacity = '0';
    }
  }, []);
  
  const handleMouseDown = useCallback(() => {
    isClickingRef.current = true;
    if (cursorPointerRef.current) {
      cursorPointerRef.current.style.transform = 'scale(0.8) scaleX(-1) rotate(-15deg)';
    }
    // Show ripple effect
    if (rippleRef.current) {
      rippleRef.current.style.opacity = '1';
      rippleRef.current.style.transform = 'scale(1)';
      setTimeout(() => {
        if (rippleRef.current) {
          rippleRef.current.style.opacity = '0';
          rippleRef.current.style.transform = 'scale(0)';
        }
      }, 300);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isClickingRef.current = false;
    if (cursorPointerRef.current) {
      const scale = isHoveringRef.current ? 1.2 : 1;
      cursorPointerRef.current.style.transform = `scale(${scale}) scaleX(-1) rotate(-15deg)`;
    }
  }, []);

  const handleMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const isClickable = target.closest('button, a, input, textarea, select, [role="button"], [onclick]');
    const wasHovering = isHoveringRef.current;
    isHoveringRef.current = !!isClickable;
    
    if (wasHovering !== isHoveringRef.current) {
      if (cursorPointerRef.current) {
        const scale = isClickingRef.current ? 0.8 : isHoveringRef.current ? 1.2 : 1;
        cursorPointerRef.current.style.transform = `scale(${scale}) scaleX(-1) rotate(-15deg)`;
      }
      
      // Show/hide user bubble instantly
      if (userBubbleRef.current) {
        if (isHoveringRef.current) {
          userBubbleRef.current.style.opacity = '1';
          userBubbleRef.current.style.transform = 'scale(1) translate(25px, -10px)';
        } else {
          userBubbleRef.current.style.opacity = '0';
          userBubbleRef.current.style.transform = 'scale(0.5) translate(25px, 5px)';
        }
      }
    }
  }, []);

  useEffect(() => {
    // Hide default cursor globally
    document.body.style.cursor = 'none';
    document.documentElement.style.cursor = 'none';

    // Add global styles to hide cursor on all elements
    const style = document.createElement('style');
    style.innerHTML = `
      *, *::before, *::after {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    // Use passive listeners for better performance
    document.addEventListener('mousemove', updateMousePosition, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    document.addEventListener('mousedown', handleMouseDown, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseover', handleMouseOver, { passive: true });

    return () => {
      document.removeEventListener('mousemove', updateMousePosition);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
      
      // Cleanup styles
      document.body.style.cursor = '';
      document.documentElement.style.cursor = '';
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [updateMousePosition, handleMouseEnter, handleMouseLeave, handleMouseDown, handleMouseUp, handleMouseOver]);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{
        opacity: 0,
        willChange: 'transform',
        transition: 'opacity 0.1s ease-out'
      }}
    >
      {/* Main cursor pointer */}
      <div
        ref={cursorPointerRef}
        className="relative"
        style={{
          transform: 'scale(1) scaleX(-1) rotate(-15deg)',
          willChange: 'transform',
          transition: 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 16 16"
          className="transform -translate-x-1 -translate-y-1"
          style={{ 
            filter: `drop-shadow(2px 2px 4px rgba(0,0,0,0.3))`,
          }}
        >
          <path
            d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z"
            fill={currentColor}
            stroke="white"
            strokeWidth="0.5"
          />
        </svg>
      </div>

      {/* User name bubble that appears on hover */}
      <div
        ref={userBubbleRef}
        className="absolute whitespace-nowrap"
        style={{
          opacity: 0,
          transform: 'scale(0.5) translate(15px, 5px)',
          willChange: 'transform, opacity',
          transition: 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
      >
        <div
          className="px-3 py-1.5 rounded-full text-xs font-medium text-white shadow-lg"
          style={{ backgroundColor: currentColor }}
        >
          {userName}
        </div>
      </div>

      {/* Click ripple effect */}
      <div
        ref={rippleRef}
        className="absolute rounded-full border-2 pointer-events-none"
        style={{ 
          borderColor: currentColor,
          left: -1,
          top: -14,
          width: 24,
          height: 24,
          opacity: 0,
          transform: 'scale(0)',
          willChange: 'transform, opacity',
          transition: 'all 0.3s ease-out'
        }}
      />
    </div>
  );
};
