"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { GlowingStarsBackground } from "@/components/ui/glowing-stars";

export const ChatBackground = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering theme-specific content after mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Return null during SSR/hydration to prevent mismatch
  if (!mounted) {
    return null;
  }

  // Render background based on current theme
  if (theme === 'dark') {
    return <GlowingStarsBackground />;
  }

  // Light theme: render paper texture background
  return (
    <div className="paper-texture fixed inset-0 w-full h-full -z-10" />
  );
};
