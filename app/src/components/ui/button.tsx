"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-bold rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-roast-500 text-white hover:bg-roast-600 font-display",
        secondary:
          "border-2 border-roast-500 text-roast-500 bg-transparent hover:bg-roast-50 font-display",
        ghost:
          "bg-transparent text-chain-400 underline text-sm font-sans hover:text-roast-700",
        local:
          "bg-local-500 text-white hover:bg-local-600 font-display",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 font-display",
      },
      size: {
        sm: "text-sm px-4 py-2",
        md: "text-base px-6 py-3.5",
        lg: "text-lg px-8 py-4",
        icon: "w-12 h-12 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
}
