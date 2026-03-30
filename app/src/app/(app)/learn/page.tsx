"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TriviaCard } from "@/components/learn/TriviaCard"
import { TriviaResult } from "@/components/learn/TriviaResult"
import { LevelUpModal } from "@/components/gamification/LevelUpModal"
import type { KnowledgeRank } from "@prisma/client"

interface TriviaQuestion {
  id: string
  text: string
  options: string[]
}

interface AnswerResult {
  correct: boolean
  correctIdx: number
  explanation: string
  xpGained: number
  newKnowledgeXP: number
  newRank: KnowledgeRank
  rankChanged: boolean
  newAchievements: string[]
}

export default function LearnPage() {
  const [question, setQuestion] = useState<TriviaQuestion | null>(null)
  const [loading, setLoading] = useState(true)
  const [alreadyAnswered, setAlreadyAnswered] = useState(false)
  const [result, setResult] = useState<AnswerResult | null>(null)
  const [levelUpRank, setLevelUpRank] = useState<KnowledgeRank | null>(null)

  useEffect(() => {
    fetch("/api/trivia/today")
      .then((r) => r.json())
      .then((data) => {
        if (data.alreadyAnswered) setAlreadyAnswered(true)
        else if (data.question) setQuestion(data.question)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleAnswer(questionId: string, selectedIdx: number) {
    const res = await fetch("/api/trivia/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, selectedIdx }),
    })
    const data: AnswerResult = await res.json()
    setResult(data)
    if (data.rankChanged) {
      setTimeout(() => setLevelUpRank(data.newRank), 1500)
    }
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="pt-2">
          <div className="shimmer h-7 w-40 mb-2" />
          <div className="shimmer h-4 w-60" />
        </div>
        <div className="card space-y-4">
          <div className="shimmer h-5 w-full" />
          <div className="shimmer h-5 w-4/5" />
          <div className="space-y-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="shimmer h-12 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 relative">
      <LevelUpModal rank={levelUpRank} onClose={() => setLevelUpRank(null)} />

      <div className="pt-2">
        <h1 className="font-display font-800 text-2xl text-roast-900">Daily Quiz</h1>
        <p className="text-sm text-chain-400">+10 Knowledge XP for correct answers</p>
      </div>

      {alreadyAnswered ? (
        <div className="card text-center py-10">
          <p className="text-4xl mb-3">✅</p>
          <p className="font-display font-700 text-roast-900">Done for today!</p>
          <p className="text-sm text-chain-400 mt-1">
            Come back tomorrow for a new question.
          </p>
        </div>
      ) : (
        <div className="card">
          <AnimatePresence mode="wait">
            {!result && question && (
              <motion.div
                key="question"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <TriviaCard question={question} onAnswered={handleAnswer} />
              </motion.div>
            )}
            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <TriviaResult
                  correct={result.correct}
                  correctIdx={result.correctIdx}
                  explanation={result.explanation}
                  xpGained={result.xpGained}
                  newRank={result.newRank}
                  rankChanged={result.rankChanged}
                  onDone={() => setAlreadyAnswered(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Coming soon: Lesson modules */}
      <div className="card border-2 border-dashed border-roast-200 text-center py-6 space-y-2">
        <p className="text-2xl">📚</p>
        <p className="font-display font-700 text-roast-900">Lesson Modules — Coming Soon</p>
        <p className="text-sm text-chain-400">
          Structured courses on origins, brewing, tasting, and barista skills.
        </p>
      </div>
    </div>
  )
}
