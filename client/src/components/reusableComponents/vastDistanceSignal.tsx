"use client";

import { motion } from "framer-motion";

export default function AtmosphericChallenges() {
  return (
    <div className="relative flex items-center justify-center w-80 h-64 rotate-150">
      <div className="absolute left-8 w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 shadow-lg" />

      <div className="absolute right-8 w-16 h-16 rounded-full bg-gradient-to-tr from-pink-400 to-red-500 shadow-lg" />

      <motion.div
        initial={{ x: 0, opacity: 0 }}
        animate={{ x: 160, opacity: [0, 1, 1, 0] }}
        transition={{
          duration: 4,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse", 
        }}
        className="absolute top-1/2 left-16 h-1 w-4 bg-pink-500 rounded-full"
      />

      <motion.div
        initial={{ x: 0, opacity: 0 }}
        animate={{ x: -160, opacity: [0, 1, 1, 0] }}
        transition={{
          duration: 3,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
          delay: 2, 
        }}
        className="absolute top-1/2 right-16 h-1 w-4 bg-pink-500 rounded-full"
      />
    </div>
  );
}
