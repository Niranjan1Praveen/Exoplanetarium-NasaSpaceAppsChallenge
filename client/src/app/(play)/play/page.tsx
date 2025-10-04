"use client";

import Link from "next/link";
import React from "react";
import { Particles } from "@/components/ui/particles";
import { Highlighter } from "@/components/ui/highlighter";

interface ServiceOptionProps {
  title: string;
  description: string;
  href: string;
  counter: number;
  highlightedText?: string;
}

const ServiceOption: React.FC<ServiceOptionProps> = ({
  title,
  description,
  href,
  counter,
  highlightedText,
}) => {
  const renderHighlightedTitle = () => {
    if (!highlightedText) {
      return title;
    }

    const parts = title.split(new RegExp(`(${highlightedText})`, "gi"));

    return parts.map((part, index) => {
      if (part.toLowerCase() === highlightedText.toLowerCase()) {
        return (
          <span key={index} className="inline-block will-change-auto">
            <Highlighter action="underline" color="#FF9800">
              {part}
            </Highlighter>
          </span>
        );
      }
      return part;
    });
  };

  return (
    <Link href={href}>
      <div className="flex flex-col items-center justify-center rounded-2xl p-6 hover:scale-105 transition-transform duration-300 max-w-84 transform-gpu will-change-transform">
        <span className="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-2xl text-primary-foreground">
          {counter}
        </span>

        <h2 className="text-4xl md:text-5xl text-center font-semibold mb-3 leading-snug">
          {renderHighlightedTitle()}
        </h2>
        <p className="text-xl text-center text-muted-foreground">
          {description}
        </p>
      </div>
    </Link>
  );
};

const ExoplanetOptions: React.FC = () => {
  return (
    <main className="relative min-h-screen flex items-center justify-center bg-background px-4">
      <Particles
        className="absolute inset-0"
        quantity={200}
        size={0.1}
        ease={80}
        refresh
      />
      <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
        <ServiceOption
          counter={1}
          title="Draw and Classify your Exoplanet"
          description="Draw your own exoplanet and see how it gets classified based on color and shape patterns."
          href="/play/draw"
          highlightedText="Classify" 
        />
        <ServiceOption
          counter={2}
          title="Exoplanet Discovery Methods"
          description="Unveiling distant worlds through stellar wobbles, transits, imaging, and microlensing — the science behind discovering new exoplanets."
          href="/play/discoveryMethods"
          highlightedText="Discovery" 
        />
        <ServiceOption
          counter={3}
          title="Exoplanet Exploration Timeline"
          description="Explore the history of exoplanet discovery with interactive 3D models of satellites and missions."
          href="/play/timeline"
          highlightedText="Timeline"
        />
      </div>
    </main>
  );
};

export default ExoplanetOptions;
