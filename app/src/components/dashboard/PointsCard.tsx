"use client"

import { motion } from "framer-motion"
import { Coins } from "lucide-react"

interface PointsCardProps {
  points: number
}

export function PointsCard({ points }: PointsCardProps) {
  return (
    <div className="card flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-roast-100 flex items-center justify-center">
          <Coins className="w-5 h-5 text-roast-500" />
        </div>
        <div>
          <p className="text-xs text-chain-400 font-medium">Roast Points</p>
          <motion.p
            className="font-display font-800 text-roast-900 text-xl"
            key={points}
            initial={{ scale: 1.2, color: "#d97706" }}
            animate={{ scale: 1, color: "#1c0a00" }}
            transition={{ duration: 0.4 }}
          >
            {points.toLocaleString()}
          </motion.p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-chain-400">≈ ${(points / 100).toFixed(2)}</p>
        <p className="text-xs text-local-500 font-semibold">Future Roast Card</p>
      </div>
    </div>
  )
}
