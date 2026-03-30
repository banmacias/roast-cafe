"use client"

import { motion, AnimatePresence } from "framer-motion"
import ConfettiExplosion from "react-confetti-explosion"
import { RANK_EMOJIS, RANK_LABELS } from "@/lib/xp"
import type { KnowledgeRank } from "@prisma/client"

interface LevelUpModalProps {
  rank: KnowledgeRank | null
  onClose: () => void
}

export function LevelUpModal({ rank, onClose }: LevelUpModalProps) {
  if (!rank) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-roast-900/80 z-50 flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.5, y: 40 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="bg-white rounded-3xl p-8 text-center max-w-xs w-full relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <ConfettiExplosion
              force={0.6}
              duration={2500}
              particleCount={80}
              colors={["#d97706", "#10b981", "#f59e0b", "#92400e"]}
            />
          </div>
          <div className="text-6xl mb-4">{RANK_EMOJIS[rank]}</div>
          <p className="text-sm font-semibold text-chain-400 uppercase tracking-widest mb-1">
            Rank Up!
          </p>
          <h2 className="font-display font-800 text-3xl text-roast-900 mb-2">
            {RANK_LABELS[rank]}
          </h2>
          <p className="text-sm text-chain-400 mb-6">
            You&apos;ve earned the {RANK_LABELS[rank]} rank through your coffee knowledge.
            Keep learning!
          </p>
          <button onClick={onClose} className="btn-primary">
            Awesome! 🎉
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
