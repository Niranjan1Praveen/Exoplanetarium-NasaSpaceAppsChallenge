"use client";

import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";

const features = [
  "Networked note-taking",
  "End to end encryption",
  "Chrome and Safari web clipper",
  "Kindle highlights sync",
  "Kindle offline sync",
  "iOS app",
];

export default function Pricing() {
  return (
    <section className="container mx-auto max-w-5xl px-4 py-20 text-center flex flex-col items-center">
      <Badge variant={"secondary"} className="my-2">Get access</Badge>

      {/* Heading */}
      <h2 className="text-3xl font-bold sm:text-4xl">
        We like keeping things simple <br />
        One plan one price.
      </h2>

      {/* Price */}
      <div className="my-8 flex items-center justify-center gap-2">
        <p className="text-6xl font-bold">$10</p>
        <p className="text-sm text-muted-foreground">
          /month
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-x-20 gap-y-4">
        {features.map((feature) => (
          <div key={feature} className="flex space-x-2 text-left">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </div>

      <Button size="lg" variant={"outline"} className="mt-10">
        Start your 14-day trial
      </Button>
    </section>
  );
}
