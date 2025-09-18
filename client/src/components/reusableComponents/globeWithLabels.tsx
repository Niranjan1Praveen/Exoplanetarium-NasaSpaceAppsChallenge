"use client"

import { useState, useEffect } from "react"
import { Globe } from "../ui/globe"
import { motion, AnimatePresence } from "framer-motion"

const labels = [
  "Stellar radius",
  "Temperature",
  "Distance from Earth",
  "Orbital period",
]

export default function GlobeWithLabels() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % labels.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const positions = [
    { top: "5%", left: "50%", transform: "translateX(-50%)" },
    { top: "50%", left: "5%", transform: "translateY(-50%)" },
    { bottom: "5%", left: "50%", transform: "translateX(-50%)" },
    { top: "50%", right: "5%", transform: "translateY(-50%)" },
  ]

  return (
    <div className="relative flex size-full items-center justify-center px-40 pt-8 pb-40 md:pb-40 overflow-hidden">
      <Globe className="top-[10px]"/>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, filter: "blur(6px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.8 }}
          className="absolute flex flex-col items-center text-sm text-muted-foreground"
          style={positions[index]}
        >
          <span>{labels[index]}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
