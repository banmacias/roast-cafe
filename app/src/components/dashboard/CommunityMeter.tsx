"use client"

import { motion } from "framer-motion"

interface CommunityMeterProps {
  count: number
  goal: number
}

export function CommunityMeter({ count, goal }: CommunityMeterProps) {
  const pct = Math.min(100, Math.round((count / goal) * 100))

  return (
    <div className="card space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-display font-700 text-sm text-roast-900">🌍 Community this month</p>
        <span className="text-xs font-bold text-local-500">{pct}%</span>
      </div>
      <div className="xp-bar">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #10b981, #059669)" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
      <p className="text-xs text-chain-400">
        <span className="font-bold text-roast-900">{count.toLocaleString()}</span> / {goal.toLocaleString()} local visits
      </p>
    </div>
  )
}
