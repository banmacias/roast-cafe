"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft } from "lucide-react"
import { TypeSelector } from "@/components/log/TypeSelector"
import { ShopInput } from "@/components/log/ShopInput"
import { ReceiptCapture } from "@/components/log/ReceiptCapture"
import { DrinkSelector } from "@/components/log/DrinkSelector"
import { OriginSelector } from "@/components/log/OriginSelector"
import { RECEIPT_BONUS } from "@/lib/xp"
import type { LogType, DrinkType } from "@prisma/client"
import type { LogFormData } from "@/types"

type Step = "type" | "shop" | "receipt" | "drink" | "origin" | "submitting"

export default function LogPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("type")
  const [form, setForm] = useState<Partial<LogFormData>>({})
  const [error, setError] = useState<string | null>(null)

  const isLocal = form.logType === "DRINK_LOCAL" || form.logType === "BAG_LOCAL"
  const isBag = form.logType === "BAG_LOCAL" || form.logType === "BAG_CHAIN"

  async function submit(finalForm: Partial<LogFormData>) {
    setStep("submitting")
    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      // Pass result to success page via URL params
      const params = new URLSearchParams({
        logId: data.logId,
        points: String(data.pointsEarned + data.bonusPoints),
        streak: String(data.newStreak),
        achievements: data.newAchievements.join(","),
        shieldEarned: String(data.shieldEarned),
      })
      router.push(`/log/success?${params}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setStep("type")
    }
  }

  const stepBack: Record<Step, Step | null> = {
    type: null,
    shop: "type",
    receipt: "shop",
    drink: isLocal ? "receipt" : "type",
    origin: "drink",
    submitting: null,
  }

  function goBack() {
    const prev = stepBack[step]
    if (prev) setStep(prev)
    else router.back()
  }

  const slideVariants = {
    enter: { x: 40, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
  }

  if (step === "submitting") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-4xl animate-spin">☕</div>
          <p className="font-display font-700 text-roast-900">Logging your coffee...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pt-2">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full bg-roast-100 flex items-center justify-center active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 text-roast-700" />
        </button>
        <div className="flex-1 flex gap-1">
          {["type", ...(isLocal ? ["shop", "receipt"] : []), "drink", ...(isBag ? ["origin"] : [])].map(
            (s, i) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  s === step || (["type", "shop", "receipt"].indexOf(s) < ["type", "shop", "receipt"].indexOf(step)) ? "bg-roast-500" : "bg-roast-100"
                }`}
              />
            )
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25 }}
        >
          {step === "type" && (
            <TypeSelector
              onSelect={(logType: LogType) => {
                setForm({ logType })
                if (logType === "DRINK_LOCAL" || logType === "BAG_LOCAL") {
                  setStep("shop")
                } else {
                  setStep("drink")
                }
              }}
            />
          )}

          {step === "shop" && (
            <ShopInput
              value={form.shopName ?? ""}
              onChange={(v) => setForm((f) => ({ ...f, shopName: v }))}
              onNext={() => setStep("receipt")}
            />
          )}

          {step === "receipt" && form.logType && (
            <ReceiptCapture
              bonusPoints={RECEIPT_BONUS[form.logType]}
              onVerified={({ url, verified, merchantName }) => {
                setForm((f) => ({
                  ...f,
                  receiptUrl: url,
                  receiptVerified: verified,
                  shopName: f.shopName || merchantName || f.shopName,
                }))
                setStep("drink")
              }}
              onSkip={() => setStep("drink")}
            />
          )}

          {step === "drink" && !isBag && (
            <DrinkSelector
              selected={(form.drinkType as DrinkType) ?? null}
              onSelect={(drinkType) => {
                const updated = { ...form, drinkType }
                setForm(updated)
                submit(updated)
              }}
            />
          )}

          {step === "drink" && isBag && (
            <OriginSelector
              selected={form.originCountry ?? null}
              onSelect={(country) => {
                const updated = { ...form, originCountry: country ?? undefined }
                setForm(updated)
                submit(updated)
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
