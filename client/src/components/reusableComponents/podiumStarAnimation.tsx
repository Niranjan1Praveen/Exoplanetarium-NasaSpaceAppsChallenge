"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function PodiumStarAnimation() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg p-6 h-64 overflow-hidden">
      {/* Podium base */}
      <div className="flex items-end justify-center gap-4 w-full">
        {/* Left bar */}
        <motion.div
          className="w-16 bg-muted-foreground rounded"
          initial={{ height: 100 }}
          animate={{ height: [100, 140, 100] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Center bar */}
        <motion.div
          className="w-16 bg-gray-400/60 rounded"
          initial={{ height: 144 }}
          animate={{ height: [144, 180, 144] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Right bar */}
        <motion.div
          className="w-16 bg-gray-300/50 rounded"
          initial={{ height: 128 }}
          animate={{ height: [128, 160, 128] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>
    </div>
  );
}
