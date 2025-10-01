"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function AtmosphericChallenges() {
  const [blips, setBlips] = useState<{ top: number; left: number }[]>([]);

  // Generate random positions only on the client
  useEffect(() => {
    const positions = [...Array(5)].map(() => ({
      top: 30 + Math.random() * 150,
      left: 30 + Math.random() * 150,
    }));
    setBlips(positions);
  }, []);

  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* central planet */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 via-pink-400 to-indigo-500 shadow-lg"
      />

      {/* faint orbiting signals */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`orbit-${i}`}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 0.6, 0], scale: [0.6, 1.2, 1.5] }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 1.2,
          }}
          className="absolute w-40 h-40 rounded-full border border-pink-400/30"
        />
      ))}

      {/* weak signal blips */}
      {blips.map((pos, i) => (
        <motion.div
          key={`dot-${i}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.8,
          }}
          className="absolute w-2 h-2 rounded-full bg-pink-400"
          style={{
            top: `${pos.top}px`,
            left: `${pos.left}px`,
          }}
        />
      ))}
    </div>
  );
}
