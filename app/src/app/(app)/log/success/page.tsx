"use client"

import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import ConfettiExplosion from "react-confetti-explosion"
import { CoffeeFact } from "@/components/ai/CoffeeFact"
import { AchievementBadge } from "@/components/gamification/AchievementBadge"
import { ACHIEVEMENT_META } from "@/lib/achievements"
import type { Achievement } from "@prisma/client"
import Link from "next/link"
import { Suspense } from "react"

function SuccessContent() {
  const params = useSearchParams()
  const logId = params.get("logId") ?? ""
  const points = parseInt(params.get("points") ?? "0")
  const streak = parseInt(params.get("streak") ?? "0")
  const achievementsStr = params.get("achievements") ?? ""
  const shieldEarned = params.get("shieldEarned") === "true"
  const newAchievements = achievementsStr
    ? (achievementsStr.split(",").filter(Boolean) as Achievement[])
    : []

  return (
    <div className="min-h-screen p-4 flex flex-col items-center">
      {/* Confetti */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 pointer-events-none z-50">
        <ConfettiExplosion
          force={0.5}
          duration={2500}
          particleCount={70}
          colors={["#d97706", "#10b981", "#f59e0b", "#92400e", "#fff"]}
        />
      </div>

      <div className="w-full max-w-sm space-y-5 pt-8">
        {/* Points earned */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-center space-y-1"
        >
          <p className="text-6xl">🎉</p>
          <motion.p
            className="font-display font-800 text-5xl text-roast-500"
            initial={{ scale: 1.4 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            +{points} pts
          </motion.p>
          <p className="text-chain-400 font-medium">Roast Points earned</p>
        </motion.div>

        {/* Streak + shield */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-4"
        >
          <div className="card text-center px-6">
            <p className="text-2xl">🔥</p>
            <p className="font-display font-800 text-xl text-roast-900">{streak}</p>
            <p className="text-xs text-chain-400">day streak</p>
          </div>
          {shieldEarned && (
            <div className="card text-center px-6">
              <p className="text-2xl">🛡️</p>
              <p className="font-display font-800 text-lg text-roast-900">+1</p>
              <p className="text-xs text-chain-400">shield earned</p>
            </div>
          )}
        </motion.div>

        {/* New achievements */}
        {newAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card"
          >
            <p className="font-display font-700 text-sm text-roast-900 mb-3">
              🏆 New Achievement{newAchievements.length > 1 ? "s" : ""}!
            </p>
            <div className="flex gap-4 flex-wrap">
              {newAchievements.map((a) => (
                <AchievementBadge key={a} achievement={a} unlocked animate />
              ))}
            </div>
          </motion.div>
        )}

        {/* AI coffee fact */}
        {logId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <CoffeeFact logId={logId} />
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <Link href="/dashboard">
            <div className="btn-primary text-center">Back to Dashboard</div>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
