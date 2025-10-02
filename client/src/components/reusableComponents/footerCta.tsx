"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function FooterCta() {
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    console.log("Email submitted:", email);
  };

  return (
    <section className="w-full flex flex-col items-center text-center px-4 py-16 space-y-4 bg-gradient-to-b from-background/90 to-background">
      <h2 className="text-3xl md:text-4xl font-bold">
        Explore Distant Worlds with Exoplanetarium
      </h2>
      <p className="mt-2 text-md text-muted-foreground max-w-md">
        Join our AI-powered platform to discover, classify, and visualize exoplanets. Perfect for researchers and curious minds alike.
      </p>

      <div className="mt-6 flex w-full max-w-md flex-col sm:flex-row items-center sm:space-x-2 space-y-2 sm:space-y-0">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSubmit} className="w-full sm:w-auto">
          Get Early Access
        </Button>
      </div>

      <p className="mt-4 text-xs text-muted-foreground max-w-sm">
        No credit card required &nbsp; • &nbsp; Stay updated with our latest discoveries
      </p>
    </section>
  );
}
