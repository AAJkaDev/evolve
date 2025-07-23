import { cn } from "@/lib/utils";
import React from "react";

interface ChatDotBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  dotColor?: string;
  dotSize?: string;
  spacing?: string;
  opacity?: number;
}

export default function ChatDotBackground({ 
  className,
  children,
  dotColor = "#1A1A1A",
  dotSize = "1px",
  spacing = "20px",
  opacity = 0.08
}: ChatDotBackgroundProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Dot pattern background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundSize: `${spacing} ${spacing}`,
          backgroundImage: `radial-gradient(${dotColor} ${dotSize}, transparent ${dotSize})`,
          opacity: opacity,
        }}
      />
      
      {/* Radial gradient overlay for faded edges effect */}
      <div 
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 10%, rgba(245, 245, 236, 0.8) 70%)`,
          maskImage: `radial-gradient(ellipse at center, transparent 20%, black 80%)`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
