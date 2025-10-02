"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe } from "../ui/globe";

const ScrollGlobe = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 450);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      initial={{
        top: "50%",
        left: "50%",
        x: "-50%",
        y: "-50%",
        zIndex: 10, 
      }}
      animate={
        scrolled
          ? {
              bottom: "1.5rem",
              right: "1.5rem",
              top: "auto",
              left: "auto",
              x: 0,
              y: 0,
              zIndex: 0, 
            }
          : {
              top: "80%",
              left: "50%",
              x: "-50%",
              y: "-50%",
              bottom: "auto",
              right: "auto",
              zIndex: 0,
            }
      }
      transition={{ type: "spring", stiffness: 80, damping: 20 }}
      className="fixed w-24 h-24 pointer-events-none"
    >
      <Globe />
    </motion.div>
  );
};

export default ScrollGlobe;
