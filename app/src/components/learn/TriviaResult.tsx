"use client"

import { motion } from "framer-motion"
import ConfettiExplosion from "react-confetti-explosion"
import type { KnowledgeRank } from "@prisma/client"
import { RANK_LABELS } from "@/lib/xp"

interface TriviaResultProps {
  correct: boolean
  correctIdx: number
  explanation: string
  xpGained: number
  newRank: KnowledgeRank
  rankChanged: boolean
  onDone: () => void
}

export function TriviaResult({
  correct,
  explanation,
  xpGained,
  newRank,
  rankChanged,
  onDone,
}: TriviaResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {correct && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <ConfettiExplosion
            force={0.4}
            duration={2000}
            particleCount={50}
            colors={["#d97706", "#10b981", "#f59e0b"]}
          />
        </div>
      )}

      <div
        className={`card text-center py-6 ${correct ? "bg-local-100 border-local-500 border-2" : "bg-red-50 border-red-200 border-2"}`}
      >
        <div className="text-4xl mb-2">{correct ? "🎉" : "💡"}</div>
        <p className="font-display font-800 text-xl text-roast-900">
          {correct ? "Correct!" : "Not quite!"}
        </p>
        <p className="font-bold text-roast-500 mt-1">+{xpGained} Knowledge XP</p>
      </div>

      <div className="card">
        <p className="text-sm font-bold text-roast-900 mb-1">Explanation</p>
        <p className="text-sm text-roast-700 leading-relaxed">{explanation}</p>
      </div>

      {rankChanged && (
        <div className="card bg-roast-50 border-2 border-roast-300 text-center py-4">
          <p className="font-display font-800 text-roast-900">🎊 Rank Up!</p>
          <p className="text-sm text-roast-700">You&apos;re now a {RANK_LABELS[newRank]}!</p>
        </div>
      )}

      <button onClick={onDone} className="btn-primary">
        Done
      </button>
    </motion.div>
  )
}
