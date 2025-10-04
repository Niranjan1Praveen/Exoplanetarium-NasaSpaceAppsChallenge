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
import Logo from "./logo";

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Exoplanet Lab",
    href: "/lab",
    description:
      "Draw your own exoplanets and get them classified based on color patterns and features.",
  },
  {
    title: "Exoplanet Timeline",
    href: "/timeline",
    description:
      "Explore the history of exoplanet discovery with 3D satellite models and interactive visualization.",
  },
  {
    title: "Stellar Data Viewer",
    href: "/stellar-data",
    description:
      "View detailed data about stars and their planetary systems in an interactive, 3D interface.",
  },
  {
    title: "Habitability Analyzer",
    href: "/habitability",
    description:
      "Analyze exoplanets for potential habitability based on atmospheric and orbital data.",
  },
  {
    title: "Orbital Simulator",
    href: "/simulator",
    description:
      "Simulate planetary orbits and observe the dynamics of different exoplanetary systems.",
  },
  {
    title: "Exoplanet Explorer",
    href: "/explorer",
    description:
      "A discovery tool that lets you browse, filter, and learn about thousands of known exoplanets.",
  },
];

interface NavigationMenuDemoProps {
  /** Extra classes to apply to the trigger button */
  className?: string;
}
export function NavigationMenuDemo({ className }: NavigationMenuDemoProps) {
  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList className={className}>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Home</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
                    href="/"
                  >
                    <div className="mt-4 mb-2 text-lg font-medium">
                      <Logo/>
                    </div>
                    <p className="text-muted-foreground text-sm leading-tight">
                      Explore, draw, and visualize exoplanets with interactive
                      3D tools.
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <ListItem href="/lab" title="Exoplanet Play">
                Draw your own exoplanets and see them classified based on their
                color patterns.
              </ListItem>
              <ListItem href="/play" title="Exoplanet Lab">
                Classify and analyze exoplanets.
              </ListItem>
              <ListItem href="/about" title="About Us">
                Learn more about our mission to make exoplanet exploration
                accessible and educational.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
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
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/pricing">Pricing</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/contact">Contact</Link>
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
