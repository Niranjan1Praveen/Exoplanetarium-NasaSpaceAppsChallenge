"use client";

import React, { useRef, ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ScrollAnimationProps {
  children: ReactNode;
  containerHeight?: string;
  verticalMovement?: number;
  horizontalMovement?: number;
  scaleRange?: [number, number, number];
  horizontalStart?: number;
  className?: string;
  easing?: number[];
}

export default function ScrollAnimation({
  children,
  containerHeight = "min-h-[200vh]",
  verticalMovement = 500,
  horizontalMovement = 400,
  scaleRange = [1, 0.9, 0.8],
  horizontalStart = 0.5,
  className = "",
  easing = [0.25, 0.1, 0.25, 1] // Default ease-in-out
}: ScrollAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Vertical movement with easing
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [0, verticalMovement],
  );
  
  // Horizontal movement with easing
  const x = useTransform(
    scrollYProgress,
    [0, horizontalStart, 1],
    [0, 0, horizontalMovement],
  );

  // Scale transformation with easing
  const scale = useTransform(
    scrollYProgress, 
    [0, 0.5, 1], 
    scaleRange,
  );

  return (
    <div ref={containerRef} className={`relative w-full ${containerHeight} ${className}`}>
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ 
            y, 
            x,
            scale,
          }}
          className="absolute"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}