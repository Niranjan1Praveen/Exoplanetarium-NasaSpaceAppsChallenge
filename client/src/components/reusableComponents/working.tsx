"use client";

import {
  ArrowUpRight,
  ArrowUpZA,
  File,
  LucideArrowDownLeftFromSquare,
  LucideArrowDownLeftSquare,
  LucideArrowDownRightSquare,
  LucideArrowUpRightFromSquare,
  LucideArrowUpRightSquare,
} from "lucide-react";
import { workingSteps } from "../../../public/data/workingSteps";
import { Badge } from "../ui/badge";
import { AnimatedBeamDemo } from "./animatedBeamDemo";
import { motion } from "framer-motion";

export default function Working() {
  return (
    <section className="flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <section className="container max-w-7xl text-center space-y-4">
        <Badge variant={"secondary"}>How it Works?</Badge>
        <h2 className="mb-12 text-center text-2xl font-bold sm:text-3xl">
          AI-Powered Sales Intelligence in 3 Steps
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
          {workingSteps.map((step, i) => (
            <div
              key={step.title}
              className="relative flex flex-col items-center gap-2 rounded-xl border p-6 text-center justify-between"
            >
              <h3 className="mb-2 font-semibold">{step.title}</h3>

              {i === 0 && (
                <div className="relative rounded-md bg-muted p-6 shadow-md w-64 h-80 flex flex-col space-y-4">
                  <div className="h-3 w-3/5 rounded bg-muted-foreground/40" />
                  <div className="h-6 w-4/5 rounded bg-muted-foreground/30" />
                  <div className="h-3 w-full rounded bg-muted-foreground/40" />
                  <div className="h-3 w-1/3 rounded bg-muted-foreground/40" />
                  <div className="h-3 w-full rounded bg-muted-foreground/40" />
                  <div className="h-3 w-2/3 rounded bg-muted-foreground/40" />
                  <div className="h-10 w-full rounded bg-muted-foreground/30" />
                  <div className="h-3 w-3/5 rounded bg-muted-foreground/40" />
                  <div className="h-3 w-full rounded bg-muted-foreground/40" />

                  <motion.div
                    initial={{ height: 20 }}
                    animate={{ height: 300 }}
                    transition={{
                      duration: 6,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                    className="mt-auto h-20 w-full rounded-md border border-dashed border-primary bg-transparent absolute bottom-0 left-0"
                  />
                </div>
              )}
              {i === 1 && (
                <div className="w-full">
                  <AnimatedBeamDemo />
                </div>
              )}
              {i === 2 && (
                <div className="relative flex w-full items-center justify-center space-x-2">
                  <div className="absolute z-[-10] h-40 w-40 rounded-full bg-muted" />
                  {[...Array(3)].map((_, i) =>
                    i === 1 ? (
                      <motion.div
                        key={i}
                        className="h-28 w-28 flex items-center justify-center"
                        whileHover={{ scale: 0.9 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        <File className="h-40 w-40 fill-primary/20" />
                      </motion.div>
                    ) : (
                      <File key={i} className="h-40 w-40 fill-primary/20" />
                    )
                  )}
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
