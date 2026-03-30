"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { LogType } from "@prisma/client"

interface LogOption {
  type: LogType
  label: string
  sublabel: string
  emoji: string
  points: number
  isLocal: boolean
}

const OPTIONS: LogOption[] = [
  {
    type: "DRINK_LOCAL",
    label: "Local Drink",
    sublabel: "Independent shop",
    emoji: "☕",
    points: 25,
    isLocal: true,
  },
  {
    type: "BAG_LOCAL",
    label: "Local Bag",
    sublabel: "Independent roaster",
    emoji: "🛍️",
    points: 40,
    isLocal: true,
  },
  {
    type: "DRINK_CHAIN",
    label: "Chain Drink",
    sublabel: "Starbucks, etc.",
    emoji: "☕",
    points: 10,
    isLocal: false,
  },
  {
    type: "BAG_CHAIN",
    label: "Chain Bag",
    sublabel: "Supermarket brand",
    emoji: "🛍️",
    points: 15,
    isLocal: false,
  },
]

interface TypeSelectorProps {
  onSelect: (type: LogType) => void
}

export function TypeSelector({ onSelect }: TypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display font-800 text-2xl text-roast-900">What did you do?</h2>
        <p className="text-sm text-chain-400 mt-1">Local shops earn more points 💚</p>
      </div>

      {/* Local options — prominent */}
      <div className="grid grid-cols-2 gap-3">
        {OPTIONS.filter((o) => o.isLocal).map((option) => (
          <OptionTile key={option.type} option={option} onSelect={onSelect} />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-roast-100" />
        <span className="text-xs text-chain-400 font-medium">or</span>
        <div className="flex-1 h-px bg-roast-100" />
      </div>

      {/* Chain options — smaller */}
      <div className="grid grid-cols-2 gap-3">
        {OPTIONS.filter((o) => !o.isLocal).map((option) => (
          <OptionTile key={option.type} option={option} onSelect={onSelect} small />
        ))}
      </div>
    </div>
  )
}

function OptionTile({
  option,
  onSelect,
  small,
}: {
  option: LogOption
  onSelect: (type: LogType) => void
  small?: boolean
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={() => onSelect(option.type)}
      className={cn(
        "rounded-2xl border-2 text-left transition-all active:scale-95 cursor-pointer",
        option.isLocal
          ? "bg-local-100 border-local-500 p-4"
          : "bg-white border-chain-200 p-3"
      )}
    >
      <div className="flex flex-col gap-1">
        <span className={cn("leading-none", option.isLocal ? "text-3xl" : "text-2xl")}>
          {option.emoji}
        </span>
        <p
          className={cn(
            "font-display font-800 text-roast-900",
            option.isLocal ? "text-base mt-2" : "text-sm mt-1"
          )}
        >
          {option.label}
        </p>
        <p className="text-xs text-chain-400">{option.sublabel}</p>
        <p
          className={cn(
            "font-bold mt-1",
            option.isLocal ? "text-local-600 text-sm" : "text-chain-400 text-xs"
          )}
        >
          +{option.points} pts
        </p>
      </div>
    </motion.button>
  )
}
