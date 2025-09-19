"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion } from "framer-motion";
import { ModeToggle } from "./modeToggle";
import { NavigationMenuDemo } from "./navigationMenu";
import { Earth } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <section className="py-2 px-4 flex items-center justify-evenly fixed w-full top-0 z-100 border-b backdrop-blur-2xl">
        <div className="container max-w-7xl">
          <div className="rounded-md">
            <div className="grid grid-cols-2 lg:grid-cols-2 p-2 items-center px-4 md:pr-2">
              <Link className="flex items-center gap-2" href={"/"}>
                <Earth/>
                <p className="text-2xl md:flex hidden">Exoplanetarium</p>
              </Link>

              <div className="flex justify-end gap-4">
                <div className="lg:flex justify-center items-center hidden">
                  <NavigationMenuDemo />
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-menu md:hidden"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <line
                    x1="3"
                    y1="6"
                    x2="21"
                    y2="6"
                    className={twMerge(
                      "origin-left transition",
                      isOpen && "rotate-45 -translate-y-1"
                    )}
                  ></line>
                  <line
                    x1="3"
                    y1="12"
                    x2="21"
                    y2="12"
                    className={twMerge("transition", isOpen && "opacity-0")}
                  ></line>
                  <line
                    x1="3"
                    y1="18"
                    x2="21"
                    y2="18"
                    className={twMerge(
                      "origin-left transition",
                      isOpen && "-rotate-45 translate-y-1"
                    )}
                  ></line>
                </svg>
                <Button
                  className="cursor-pointer hidden md:inline-flex items-center"
                  variant={"ghost"}
                >
                  Log in
                </Button>
                <Button className="cursor-pointer hidden md:inline-flex items-center">
                  <a href="#pricing">Sign Up</a>
                </Button>
                <ModeToggle className="cursor-pointer hidden md:inline-flex items-center" />
              </div>
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col items-center gap-4 py-4">
                    <NavigationMenuDemo className="flex flex-col space-y-2" />
                    <Button
                      className="cursor-pointer md:inline-flex items-center"
                      variant={"ghost"}
                    >
                      Log in
                    </Button>
                    <Button className="cursor-pointer md:inline-flex items-center">
                      <a href="#signUpOptions">Sign Up</a>
                    </Button>
                    <ModeToggle className="cursor-pointer md:inline-flex items-center" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
      <div className="pb-[86px] md:pb-[98px] lg:pb-[130px]"></div>
    </>
  );
}
