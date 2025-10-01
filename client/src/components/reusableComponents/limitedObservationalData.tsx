"use client";

import { motion } from "framer-motion";

export default function LimitedObservationalData() {
  return (
    <div className="relative p-6 w-64 flex flex-col space-y-2 overflow-hidden">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          initial={{ scaleX: 1, opacity: 0.6 }}
          animate={{ scaleX: [1, 0.4, 1], opacity: [0.6, 1, 0.6] }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
          className={`h-3 w-${i % 2 === 0 ? "full" : "4/5"} rounded bg-muted-foreground/40`}
        />
      ))}

      

      <motion.div
        initial={{ x: 0 }}
        animate={{ x: [0, 20, -20, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-6 left-1/2 w-2 h-2 bg-pink-400 rounded-full"
      />
    </div>
  );
}
