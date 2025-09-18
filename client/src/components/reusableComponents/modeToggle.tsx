"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AnimatedThemeToggler } from "../ui/animated-theme-toggler"
import clsx from "clsx"

interface ModeToggleProps {
  /** Extra classes to apply to the trigger button */
  className?: string
}

export function ModeToggle({ className }: ModeToggleProps) {
  const { setTheme } = useTheme()

  return (
   <div className={clsx(className, "flex items-center justify-center")}>
      <AnimatedThemeToggler />
    </div>
  )
}
