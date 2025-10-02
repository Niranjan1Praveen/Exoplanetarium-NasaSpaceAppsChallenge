"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe } from "../ui/globe";

const ScrollGlobe = () => {
  const [stage, setStage] = useState<"center" | "bottomRight" | "finalCenter">(
    "center"
  );
  useEffect(() => {
    const handleScroll = () => {
  const maxScroll = document.body.scrollHeight - window.innerHeight;

      if (window.scrollY > maxScroll - 800) {
        setStage("finalCenter");
      } else if (window.scrollY > 500) {
        setStage("bottomRight");
      } else {
        setStage("center");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      initial={{
        top: "0%",
        left: "0%",
        x: "0%",
        y: "0%",
        scale: 0,
        opacity: 0,
        zIndex: 0,
      }}
      animate={
        stage === "center"
          ? {
              top: "80%",
              left: "50%",
              x: "-50%",
              y: "-50%",
              bottom: "auto",
              right: "auto",
              scale: 1,
              opacity: 1,
              zIndex: 0,
            }
          : stage === "bottomRight"
          ? {
              bottom: "1.5rem",
              right: "1.5rem",
              top: "auto",
              left: "auto",
              x: 0,
              y: 0,
              scale: 1,
              opacity: 1,
              zIndex: 0,
            }
          : {
              top: "80%",
              left: "50%",
              x: "-50%",
              y: "-50%",
              bottom: "auto",
              right: "auto",
              scale: 1,
              opacity: 0,
              zIndex: 20,
            }
      }
      transition={{ type: "spring", stiffness: 80, damping: 20 }}
      className="fixed w-24 h-24 pointer-events-none"
    >
      <Globe/>
    </motion.div>
  );
};

export default ScrollGlobe;
