"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { DrinkType } from "@prisma/client"

const DRINKS: { type: DrinkType; label: string; emoji: string }[] = [
  { type: "ESPRESSO", label: "Espresso", emoji: "☕" },
  { type: "AMERICANO", label: "Americano", emoji: "🫖" },
  { type: "LATTE", label: "Latte", emoji: "🥛" },
  { type: "CAPPUCCINO", label: "Cappuccino", emoji: "☁️" },
  { type: "FLAT_WHITE", label: "Flat White", emoji: "⬜" },
  { type: "CORTADO", label: "Cortado", emoji: "🥃" },
  { type: "COLD_BREW", label: "Cold Brew", emoji: "🧊" },
  { type: "POUR_OVER", label: "Pour Over", emoji: "💧" },
  { type: "MACCHIATO", label: "Macchiato", emoji: "🍶" },
  { type: "MOCHA", label: "Mocha", emoji: "🍫" },
  { type: "OTHER", label: "Other", emoji: "✨" },
]

interface DrinkSelectorProps {
  selected: DrinkType | null
  onSelect: (type: DrinkType) => void
}

export function DrinkSelector({ selected, onSelect }: DrinkSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display font-800 text-2xl text-roast-900">What did you get?</h2>
        <p className="text-sm text-chain-400 mt-1">Pick your drink</p>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {DRINKS.map((d) => (
          <motion.button
            key={d.type}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(d.type)}
            className={cn(
              "flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all cursor-pointer",
              selected === d.type
                ? "border-roast-500 bg-roast-50"
                : "border-roast-100 bg-white hover:border-roast-300"
            )}
          >
            <span className="text-2xl">{d.emoji}</span>
            <span className="text-xs font-semibold text-roast-900">{d.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
