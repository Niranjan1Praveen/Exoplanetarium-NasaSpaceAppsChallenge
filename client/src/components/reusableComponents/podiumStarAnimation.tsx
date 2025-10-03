"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function PodiumStarAnimation() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg p-6 h-64 relative overflow-hidden">
      {/* Podium base */}
      <div className="flex items-end justify-center gap-4 w-full">
        <div className="w-16 h-28 bg-gray-300/50 rounded" />
        <div className="w-16 h-36 bg-gray-400/60 rounded" />
        <div className="w-16 h-32 bg-gray-300/50 rounded" />
      </div>

      
    </div>
  );
}
