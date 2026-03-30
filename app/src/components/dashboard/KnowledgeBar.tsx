"use client"

import { motion } from "framer-motion"
import { RANK_EMOJIS, RANK_LABELS } from "@/lib/xp"
import type { KnowledgeRank } from "@prisma/client"

interface KnowledgeBarProps {
  rank: KnowledgeRank
  xp: number
  xpToNext: number
  progress: number
}

export function KnowledgeBar({ rank, xp, xpToNext, progress }: KnowledgeBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">{RANK_EMOJIS[rank]}</span>
          <span className="font-display font-800 text-roast-900">{RANK_LABELS[rank]}</span>
        </div>
        {xpToNext > 0 ? (
          <span className="text-xs text-chain-400 font-medium">{xpToNext} XP to next</span>
        ) : (
          <span className="text-xs text-local-500 font-bold">MAX RANK</span>
        )}
      </div>
      <div className="xp-bar">
        <motion.div
          className="xp-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
      <p className="text-xs text-chain-400 font-medium">{xp} Knowledge XP total</p>
    </div>
  )
}
