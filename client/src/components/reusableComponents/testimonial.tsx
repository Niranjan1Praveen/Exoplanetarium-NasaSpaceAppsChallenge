"use client";

import { Badge } from "@/components/ui/badge";
import { Particles } from "../ui/particles";
import { Reviews } from "./reviews";

export function Testimonial() {
  return (
    <section className="flex items-center justify-center py-16 sm:px-6 lg:px-8">
      <div className="max-w-7xl relative w-full flex flex-col items-center justify-center text-center px-4 py-16 overflow-hidden">
        {/* <Particles className="absolute inset-0 -z-10" quantity={50} /> */}
        <div className="mt-8">
          <Badge variant="secondary">Wall of love</Badge>
          <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
            Loved by thinkers
          </h2>
          <p className="my-2 text-sm text-muted-foreground">
            Here’s what people are saying about us
          </p>
        </div>
        <Reviews />
      </div>
    </section>
  );
}
