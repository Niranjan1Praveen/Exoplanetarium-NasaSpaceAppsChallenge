"use client";

import React, { forwardRef, useRef } from "react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "../ui/animated-beam";
import { Brain } from "lucide-react";

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-12 items-center justify-center p-3",
        className
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export function AnimatedBeamDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);


  return (
    <div
      className="relative flex w-full max-w-[500px] items-center justify-center overflow-hidden p-10"
      ref={containerRef}
    >
      <div className="flex size-full flex-col items-stretch justify-between gap-10">
  {/* Ref1 */}
  <Circle ref={div1Ref}>
    <Brain />
  </Circle>

  {/* Ref2 + Ref3 in a horizontal row */}
  <div className="flex flex-row items-center justify-between w-full gap-6">
    <Circle ref={div2Ref} className="bg-primary rounded-full size-4" />
    <Circle ref={div3Ref} className="bg-primary rounded-full size-4" />
    <Circle ref={div4Ref} className="bg-primary rounded-full size-4" />
    <Circle ref={div5Ref} className="bg-primary rounded-full size-4" />

  </div>
</div>


      <AnimatedBeam
        duration={3}
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div2Ref}
        className="absolute opacity-50"
      />

      <AnimatedBeam
        duration={3}
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div3Ref}
        className="absolute opacity-50"
      />
      <AnimatedBeam
        duration={3}
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div4Ref}
        className="absolute opacity-50"
      />
      <AnimatedBeam
        duration={3}
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div5Ref}
        className="absolute opacity-50"
      />
    </div>
  );
}
