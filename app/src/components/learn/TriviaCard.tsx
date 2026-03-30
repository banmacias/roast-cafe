"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface Question {
  id: string
  text: string
  options: string[]
}

interface TriviaCardProps {
  question: Question
  onAnswered: (questionId: string, selectedIdx: number) => void
}

export function TriviaCard({ question, onAnswered }: TriviaCardProps) {
  const [selected, setSelected] = useState<number | null>(null)

  function handleSelect(idx: number) {
    if (selected !== null) return
    setSelected(idx)
    setTimeout(() => onAnswered(question.id, idx), 600)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-display font-700 text-lg text-roast-900 leading-snug">
        {question.text}
      </h3>
      <div className="space-y-2.5">
        {question.options.map((opt, idx) => (
          <motion.button
            key={idx}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(idx)}
            disabled={selected !== null}
            className={cn(
              "w-full text-left px-4 py-3.5 rounded-2xl border-2 font-medium text-sm transition-colors cursor-pointer",
              selected === null
                ? "border-roast-200 bg-white hover:border-roast-400 text-roast-900"
                : selected === idx
                  ? "border-roast-500 bg-roast-50 text-roast-900"
                  : "border-chain-200 bg-chain-200/30 text-chain-400"
            )}
          >
            <span className="font-bold mr-2">
              {String.fromCharCode(65 + idx)}.
            </span>
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
