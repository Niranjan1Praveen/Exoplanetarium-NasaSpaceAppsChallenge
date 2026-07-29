import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

/**
 * Previously an email capture whose submit handler only console.logged the
 * address — visitors would have been handing over an email that went nowhere.
 * It now points at the part of the site that actually exists.
 */
export function FooterCta() {
  return (
    <section className="flex w-full flex-col items-center space-y-4 bg-gradient-to-b from-background/90 to-background px-4 py-16 text-center">
      <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
        Explore Distant Worlds with Exoplanetarium
      </h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        Draw and classify your own planet, play with the methods astronomers use
        to find real ones, and walk the timeline of every mission that looked.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/explore">
            Start Exploring
            <ArrowRight className="ml-1 size-4" />
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/play">Try the interactives</Link>
        </Button>
      </div>
    </section>
  );
}
