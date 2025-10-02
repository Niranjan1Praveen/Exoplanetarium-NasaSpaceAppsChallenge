"use client";

import { useState, useEffect } from "react";
import { Globe } from "../ui/globe";
import { motion, AnimatePresence } from "framer-motion";

const labels = [
  "Stellar radius: 1.1 R☉",
  "Temperature: 5800 K",
  "Potential habitability?",
  "Distance from Earth: 620 light years",
  "Orbital period: 385 days",
  "Surface gravity: 1.1 g",
  "Escape velocity: 11.2 km/s",
];


export default function GlobeWithLabels() {
  const [index, setIndex] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % labels.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const maxShift = 300;
  const yShift = Math.min(scrollY * 0.3, maxShift);

  const positions = [
    { top: "5%", left: "50%", transform: "translateX(-50%)" },
    { top: "40%", left: "2%", transform: "translateY(-30%)" },
    { top: "10%", left: "50%", transform: "translateX(-30%)" },
    { top: "50%", right: "2%", transform: "translateY(-50%)" },
    { top: "5%", left: "50%", transform: "translateX(-50%)" },
    { top: "10%", left: "50%", transform: "translateX(-40%)" },
    { top: "30%", right: "3%", transform: "translateY(-50%)" },
  ];

  return (
    <motion.div
      animate={{ y: yShift }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="relative flex size-full items-center justify-center px-40 pt-8 pb-35 md:pb-35 overflow-hidden"
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
