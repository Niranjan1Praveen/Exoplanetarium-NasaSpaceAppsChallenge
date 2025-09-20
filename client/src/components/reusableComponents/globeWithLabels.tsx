"use client";

import { useState, useEffect } from "react";
import { Globe } from "../ui/globe";
import { motion, AnimatePresence } from "framer-motion";

const labels = [
  "Stellar radius",
  "Temperature",
  "Potential habitability?",
  "Distance from Earth",
  "Orbital period",
  "Surface gravity",
  "Escape velocity",
];

export default function GlobeWithLabels() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % labels.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const positions = [
    { top: "5%", left: "50%", transform: "translateX(-50%)" },
    { top: "50%", left: "5%", transform: "translateY(-30%)" },
    { top: "10%", left: "50%", transform: "translateX(-30%)" },
    { top: "50%", right: "2%", transform: "translateY(-50%)" },
    { top: "5%", left: "50%", transform: "translateX(-50%)" },
    { top: "10%", left: "50%", transform: "translateX(-40%)" },
    { top: "50%", right: "5%", transform: "translateY(-50%)" },
  ];

  return (
    <motion.div
      initial={{ y: 200, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative flex size-full items-center justify-center px-40 pt-8 pb-40 md:pb-40 overflow-hidden"
    >
      <Globe className="top-[10px]" />

      <AnimatePresence>
        <motion.div
          key={index}
          initial={{ opacity: 0, filter: "blur(6px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.8, delay: 2 }}
          className="absolute flex flex-col items-center text-sm"
          style={positions[index]}
        >
          <span className="italic">{labels[index]}</span>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
