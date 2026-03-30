"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface CoffeeFactProps {
  logId: string
}

export function CoffeeFact({ logId }: CoffeeFactProps) {
  const [fact, setFact] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/ai/coffee-fact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logId }),
    })
      .then((r) => r.json())
      .then((data) => {
        setFact(data.fact)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [logId])

  return (
    <div className="card space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-lg">☕</span>
        <p className="font-display font-700 text-sm text-roast-900">Coffee Fact</p>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <div className="shimmer h-4 w-full" />
            <div className="shimmer h-4 w-4/5" />
            <div className="shimmer h-4 w-3/5" />
          </motion.div>
        ) : fact ? (
          <motion.p
            key="fact"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-sm text-roast-700 leading-relaxed"
          >
            {fact}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
