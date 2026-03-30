"use client"

import { cn } from "@/lib/utils"

interface StreakCounterProps {
  streak: number
  shields: number
  className?: string
}

export function StreakCounter({ streak, shields, className }: StreakCounterProps) {
  const isActive = streak > 0
  const flameColor =
    streak >= 30
      ? "text-purple-500"
      : streak >= 14
        ? "text-orange-500"
        : streak >= 7
          ? "text-amber-500"
          : isActive
            ? "text-roast-500"
            : "text-chain-400"

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-1.5">
        <span
          className={cn("text-2xl leading-none", isActive && "flame-active", flameColor)}
        >
          🔥
        </span>
        <span
          className={cn(
            "font-display text-xl font-800",
            isActive ? "text-roast-900" : "text-chain-400"
          )}
        >
          {streak}
        </span>
      </div>

      {shields > 0 && (
        <div className="flex items-center gap-1 bg-roast-100 rounded-full px-2.5 py-1">
          <span className="text-sm">🛡️</span>
          <span className="text-xs font-bold text-roast-700">{shields}</span>
        </div>
      )}
    </div>
  )
}
