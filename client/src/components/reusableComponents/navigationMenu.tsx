"use client";

import * as React from "react";
import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

/** Every entry here points at a route that actually exists. */
const play: { title: string; href: string; description: string }[] = [
  {
    title: "Play Home",
    href: "/play",
    description: "Pick an interactive way to explore how exoplanets are found.",
  },
  {
    title: "Draw & Classify",
    href: "/play/draw",
    description:
      "Paint a planet surface and watch it get classified from its colour and pattern.",
  },
  {
    title: "Discovery Methods",
    href: "/play/discoveryMethods",
    description:
      "Play with transit, radial velocity, microlensing, imaging and astrometry.",
  },
  {
    title: "Discovery Timeline",
    href: "/play/timeline",
    description:
      "Walk the missions that found these worlds, in interactive 3D.",
  },
];

const lab: { title: string; href: string; description: string }[] = [
  {
    title: "Lab Home",
    href: "/lab",
    description: "Research tools for classifying and analysing exoplanets.",
  },
  {
    title: "Exoplanet Classifier",
    href: "/lab/exoplanet",
    description:
      "Explore planet types and how model features map to a classification.",
  },
  {
    title: "Atmospheric Analysis",
    href: "/lab/atmosphericAnalysis",
    description:
      "Inspect transit light curves and atmospheric signals in detail.",
  },
];

interface NavigationMenuDemoProps {
  /** Extra classes to apply to the menu list */
  className?: string;
  /** Collapse to a plain stacked link list, used inside the mobile sheet. */
  stacked?: boolean;
}

export function NavigationMenuDemo({
  className,
  stacked = false,
}: NavigationMenuDemoProps) {
  // The hover-triggered dropdowns are unusable on touch, so small screens get
  // a flat list of the same links instead.
  if (stacked) {
    return (
      <nav className={className} aria-label="Main">
        <div className="space-y-6">
          <div>
            <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Play
            </p>
            <ul className="space-y-1">
              {play.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Lab
            </p>
            <ul className="space-y-1">
              {lab.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <ul className="space-y-1 border-t pt-4">
              <li>
                <Link
                  href="/explore"
                  className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
                >
                  Explore
                </Link>
              </li>
              <li>
                <Link
                  href="/team"
                  className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
                >
                  Team
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList className={className}>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Play</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[360px] gap-2 md:w-[440px] md:grid-cols-2">
              {play.map((item) => (
                <ListItem key={item.href} title={item.title} href={item.href}>
                  {item.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Lab</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[360px] gap-2 md:w-[440px] md:grid-cols-2">
              {lab.map((item) => (
                <ListItem key={item.href} title={item.title} href={item.href}>
                  {item.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/team">Team</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
