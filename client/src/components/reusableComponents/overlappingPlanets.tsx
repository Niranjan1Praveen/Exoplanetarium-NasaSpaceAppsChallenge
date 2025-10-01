"use client";

import { motion } from "framer-motion";

export default function OverlappingPlanets() {
  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* First planet */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0.8 }}
        animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-blue-400 to-cyan-600 mix-blend-screen"
        style={{ left: "72px" }}
      />

      {/* Second planet */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0.8 }}
        animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 mix-blend-screen"
        style={{ right: "72px" }}
      />

      {/* Overlap highlight (blurred region) */}
      <motion.div
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-28 h-28 rounded-full bg-pink-200/40 blur-2xl"
      />
    </div>
  );
}
