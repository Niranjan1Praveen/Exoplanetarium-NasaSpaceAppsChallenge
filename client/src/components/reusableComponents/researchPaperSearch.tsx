"use client";

import { motion, useAnimation } from "framer-motion";
import { Search } from "lucide-react";
import { useEffect } from "react";

export default function PaperSearchAnimation() {
  const controls = useAnimation();

  useEffect(() => {
    const animate = async () => {
      while (true) {
        await controls.start({
          x: 40,
          y: 20,
          transition: { duration: 1, ease: "easeInOut" },
        });
        await controls.start({
          x: 200,
          y: 60,
          transition: { duration: 1, ease: "easeInOut" },
        });
        await controls.start({
          x: 100,
          y: 120,
          transition: { duration: 1, ease: "easeInOut" },
        });
      }
    };
    animate();
  }, [controls]);

  return (
    <div className="relative rounded-lg p-4 overflow-hidden m-8 h-full">
      {/* Fake paper lines */}
      <div className="space-y-4">
        <div className="h-3 bg-gray-300/40  w-5/6 rounded" />
        <div className="h-3 bg-gray-300/40 rounded w-2/6" />
        <div className="h-3 bg-gray-300/40 rounded w-5/6" />
        <div className="h-3 bg-gray-300/40 rounded w-2/3" />
        <div className="h-3 bg-gray-300/40 rounded w-1/4" />
        <div className="h-3 bg-gray-300/40 rounded w-1/2" />

      </div>

      {/* Animated Search Icon */}
      <motion.div
        animate={controls}
        className="absolute top-0 left-0 w-10 h-10 rounded-full shadow-md flex items-center justify-center"
      >
        <Search className="w-7 h-7" />
      </motion.div>
    </div>
  );
}
