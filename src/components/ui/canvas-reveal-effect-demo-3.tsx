"use client";
import React from "react";

import { motion } from "motion/react";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";

export default function CanvasRevealEffectDemo3() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="h-full w-full bg-background dark:bg-black">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="h-full w-full absolute inset-0"
        >
          <CanvasRevealEffect
            animationSpeed={3}
            containerClassName="bg-transparent"
            colors={[
              [59, 130, 246],
              [139, 92, 246],
            ]}
            opacities={[0.1, 0.1, 0.1, 0.2, 0.2, 0.3, 0.3, 0.4, 0.4, 0.6]}
            dotSize={1.5}
            showGradient={false}
          />
        </motion.div>
        {/* Subtle overlay for better content readability */}
        <div className="absolute inset-0 bg-background/80 dark:bg-black/60" />
      </div>
    </div>
  );
}

