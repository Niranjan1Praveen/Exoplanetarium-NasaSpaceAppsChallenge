"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe } from "../ui/globe";

const ScrollGlobe = () => {
  const [showGlobe, setShowGlobe] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowGlobe(true);
      } else {
        setShowGlobe(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      initial={{ x: 200, opacity: 0 }}
      animate={showGlobe ? { x: 0, opacity: 1 } : { x: 200, opacity: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 20 }}
      className="fixed bottom-6 right-6 w-24 h-24 z-50 pointer-events-none"
    >
      <Globe />
    </motion.div>
  );
};

export default ScrollGlobe;
