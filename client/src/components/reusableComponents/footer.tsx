import React from "react";
import Link from "next/link";
import { Github } from "lucide-react";
import Logo from "./logo";

/**
 * Every link here resolves to a real route. The previous version had eight
 * dead `href="#"` entries, disabled social icons and a fabricated postal
 * address, none of which described anything that exists.
 */
const play = [
  { label: "Play Home", href: "/play" },
  { label: "Draw & Classify", href: "/play/draw" },
  { label: "Discovery Methods", href: "/play/discoveryMethods" },
  { label: "Discovery Timeline", href: "/play/timeline" },
];

const lab = [
  { label: "Lab Home", href: "/lab" },
  { label: "Exoplanet Classifier", href: "/lab/exoplanet" },
  { label: "Atmospheric Analysis", href: "/lab/atmosphericAnalysis" },
];

const site = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Team", href: "/team" },
];

const REPO_URL =
  "https://github.com/Niranjan1Praveen/Exoplanetarium-NasaSpaceAppsChallenge";

export default function Footer() {
  return (
    <footer className="px-6 py-12 md:px-16">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-16">
        <div className="col-span-2 sm:col-span-2 lg:col-span-1">
          <Logo width={40} />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Discovering worlds beyond our solar system through AI-powered
            analysis and immersive visualization.
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-semibold">Play</h3>
          <ul className="space-y-2 text-sm">
            {play.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-semibold">Lab</h3>
          <ul className="space-y-2 text-sm">
            {lab.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-semibold">Site</h3>
          <ul className="space-y-2 text-sm">
            {site.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t pt-6 text-sm md:flex-row">
        <p className="text-muted-foreground">
          © 2025 Exoplanetarium. Built for the NASA Space Apps Challenge.
        </p>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Source on GitHub"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <Github className="size-5" />
          <span>Source</span>
        </a>
      </div>
    </footer>
  );
}
