import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page has drifted out of orbit.",
  robots: { index: false, follow: false },
};

const suggestions = [
  { label: "Explore", href: "/explore", hint: "Pick between the Lab and Play" },
  { label: "Play", href: "/play", hint: "Interactive exoplanet experiments" },
  { label: "Lab", href: "/lab", hint: "Classification and analysis tools" },
  { label: "Team", href: "/team", hint: "Who built this" },
];

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <p className="text-7xl font-bold tracking-tight sm:text-8xl">404</p>
      <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
        This page has drifted out of orbit
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The page you were looking for doesn&apos;t exist, or it moved somewhere
        else in the system.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/">
            <Home className="mr-1 size-4" />
            Back home
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/explore">
            Start exploring
            <ArrowRight className="ml-1 size-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-12 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
        {suggestions.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border p-4 text-left transition-colors hover:bg-accent"
          >
            <p className="font-medium">{item.label}</p>
            <p className="text-sm text-muted-foreground">{item.hint}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
