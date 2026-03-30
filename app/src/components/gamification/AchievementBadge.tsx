"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ACHIEVEMENT_META } from "@/lib/achievements"
import type { Achievement } from "@prisma/client"

interface AchievementBadgeProps {
  achievement: Achievement
  unlocked: boolean
  earnedAt?: Date
  size?: "sm" | "md" | "lg"
  animate?: boolean
}

export function AchievementBadge({
  achievement,
  unlocked,
  earnedAt,
  size = "md",
  animate = false,
}: AchievementBadgeProps) {
  const meta = ACHIEVEMENT_META[achievement]
  const sizeClasses = {
    sm: "w-14 h-14 text-2xl",
    md: "w-16 h-16 text-3xl",
    lg: "w-20 h-20 text-4xl",
  }

  return (
    <motion.div
      initial={animate ? { scale: 0, opacity: 0 } : false}
      animate={animate ? { scale: 1, opacity: 1 } : false}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="flex flex-col items-center gap-1.5 text-center"
    >
      <div
        className={cn(
          "rounded-2xl flex items-center justify-center",
          sizeClasses[size],
          unlocked
            ? "bg-roast-100 shadow-md shadow-roast-200"
            : "bg-chain-200 opacity-50 relative"
        )}
      >
        <span className={unlocked ? "" : "grayscale"}>{meta.emoji}</span>
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/20">
            <span className="text-xs">🔒</span>
          </div>
        )}
      </div>
      <div>
        <p
          className={cn(
            "text-xs font-bold leading-tight",
            unlocked ? "text-roast-900" : "text-chain-400"
          )}
        >
          {meta.label}
        </p>
        {unlocked && earnedAt && (
          <p className="text-[10px] text-chain-400">
            {new Date(earnedAt).toLocaleDateString()}
          </p>
        )}
        {!unlocked && (
          <p className="text-[10px] text-chain-400 leading-tight">{meta.description}</p>
        )}
      </div>
    </motion.div>
  )
}
