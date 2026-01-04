"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      // Checked state with gradient and shadow
      "data-[state=checked]:bg-gradient-primary data-[state=checked]:border-primary/30 data-[state=checked]:shadow-[0_2px_8px_rgba(99,102,241,0.3),0_0_0_1px_rgba(99,102,241,0.1)]",
      // Unchecked state with better contrast for light theme
      "data-[state=unchecked]:bg-slate-200 data-[state=unchecked]:border-slate-300 data-[state=unchecked]:shadow-[0_2px_6px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(0,0,0,0.05)]",
      // Dark theme unchecked state
      "dark:data-[state=unchecked]:bg-slate-700 dark:data-[state=unchecked]:border-slate-600 dark:data-[state=unchecked]:shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(0,0,0,0.2)]",
      // Hover and active states
      "hover:shadow-xl hover:data-[state=checked]:shadow-[0_4px_12px_rgba(99,102,241,0.4),0_0_0_1px_rgba(99,102,241,0.15)] active:scale-95",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full ring-0 transition-all duration-300",
        // Light theme thumb
        "bg-white border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.05)]",
        // Dark theme thumb
        "dark:bg-slate-100 dark:border-slate-300 dark:shadow-[0_2px_6px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.1)]",
        // Position and scale
        "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 data-[state=checked]:scale-110",
        // Enhanced shadow when checked
        "data-[state=checked]:shadow-[0_3px_8px_rgba(99,102,241,0.35),0_0_0_1px_rgba(255,255,255,0.2)]",
        "dark:data-[state=checked]:shadow-[0_3px_10px_rgba(99,102,241,0.5),0_0_0_1px_rgba(255,255,255,0.15)]"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch } 
