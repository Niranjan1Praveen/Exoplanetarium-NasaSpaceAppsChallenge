"use client";

import {
  Rocket,
  Share2,
  Lock,
  Search,
  Calendar,
  BookOpen,
  Smartphone,
  Network,
} from "lucide-react";

const features = [
  {
    title: "Built for speed",
    description: "Instantly sync your notes across devices",
    icon: Rocket,
  },
  {
    title: "Networked notes",
    description: "Form a graph of ideas with backlinked notes",
    icon: Network,
  },
  {
    title: "iOS app",
    description: "Capture ideas on the go, online or offline",
    icon: Smartphone,
  },
  {
    title: "End-to-end encryption",
    description: "Only you can access your notes",
    icon: Lock,
  },
  {
    title: "Calendar integration",
    description: "Keep track of meetings and agendas",
    icon: Calendar,
  },
  {
    title: "Publishing",
    description: "Share anything you write with one click",
    icon: Share2,
  },
  {
    title: "Instant capture",
    description: "Save snippets from your browser and Kindle",
    icon: BookOpen,
  },
  {
    title: "Frictionless search",
    description: "Easily recall and index past notes and ideas",
    icon: Search,
  },
];

export default function Features() {
  return (
    <section className="flex items-center justify-center py-16 sm:px-6 lg:px-8">
      <div className="relative max-w-5xl px-4 border-l border-r py-2">
        <div className="grid gap-8 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex flex-col items-start space-y-2" 
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/40 bg-gradient-to-r from-background"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/20 bg-gradient-to-l from-background"></div>
      </div>
    </section>
  );
}
