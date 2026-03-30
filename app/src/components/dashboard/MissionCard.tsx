"use client"

import { motion } from "framer-motion"
import type { MissionProgress } from "@/types"

interface MissionCardProps {
  mission: MissionProgress
}

export function MissionCard({ mission }: MissionCardProps) {
  const pct = Math.min(100, (mission.current / mission.target) * 100)

  return (
    <div className="card space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{mission.emoji}</span>
          <div>
            <p className="font-display font-700 text-sm text-roast-900">{mission.title}</p>
            <p className="text-xs text-chain-400">{mission.description}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-bold text-roast-500">+{mission.pointReward} pts</p>
        </div>
      </div>
      <div className="xp-bar">
        <motion.div
          className="h-full rounded-full bg-roast-500"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between">
        <span className="text-xs font-medium text-chain-400">
          {mission.current}/{mission.target}
        </span>
        {mission.completed && (
          <span className="text-xs font-bold text-local-500">✓ Complete!</span>
        )}
      </div>
    </div>
  )
}
