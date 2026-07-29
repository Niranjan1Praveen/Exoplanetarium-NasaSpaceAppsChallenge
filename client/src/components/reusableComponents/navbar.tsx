"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { NavigationMenuDemo } from "./navigationMenu";
import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Logo from "./logo";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Navigating from inside the mobile sheet must close it, otherwise the
  // panel stays over the new page.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent the page behind the open mobile sheet from scrolling.
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Logo width={20} />
          </Link>

          <div className="hidden lg:flex lg:items-center lg:gap-3">
            <NavigationMenuDemo />
            <SignedOut>
              <Button variant="ghost" size="sm" asChild>
                <SignInButton />
              </Button>
              <Button size="sm" asChild>
                <SignUpButton />
              </Button>
            </SignedOut>
            <SignedIn>
              <Button size="sm" asChild>
                <Link href="/explore">
                  Explore
                  <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <UserButton />
            </SignedIn>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <button
              type="button"
              onClick={() => setIsOpen((v) => !v)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-nav"
              className="inline-flex size-10 items-center justify-center rounded-md hover:bg-accent"
            >
              {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="mobile-nav"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t bg-background lg:hidden"
            >
              <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto px-4 py-4 sm:px-6">
                <NavigationMenuDemo stacked />
                <div className="mt-6 flex flex-col gap-2 border-t pt-4">
                  <SignedOut>
                    <Button variant="ghost" className="w-full" asChild>
                      <SignInButton />
                    </Button>
                    <Button className="w-full" asChild>
                      <SignUpButton />
                    </Button>
                  </SignedOut>
                  <SignedIn>
                    <Button className="w-full" asChild>
                      <Link href="/explore">
                        Explore
                        <ArrowRight className="ml-1 size-4" />
                      </Link>
                    </Button>
                  </SignedIn>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer matching the fixed header height. */}
      <div className="h-16" aria-hidden />
    </>
  );
}
