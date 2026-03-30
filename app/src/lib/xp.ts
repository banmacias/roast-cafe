import { KnowledgeRank, LogType } from "@prisma/client"

// --- Roast Points (purchase-based) ---
export const BASE_POINTS: Record<LogType, number> = {
  DRINK_LOCAL: 25,
  BAG_LOCAL: 40,
  DRINK_CHAIN: 10,
  BAG_CHAIN: 15,
}

export const RECEIPT_BONUS: Record<LogType, number> = {
  DRINK_LOCAL: 5,
  BAG_LOCAL: 10,
  DRINK_CHAIN: 0,
  BAG_CHAIN: 0,
}

export function getStreakBonus(streak: number): number {
  if (streak >= 30) return 20
  if (streak >= 7) return 10
  if (streak >= 4) return 5
  if (streak >= 2) return 2
  return 0
}

export function isLocalLog(logType: LogType): boolean {
  return logType === "DRINK_LOCAL" || logType === "BAG_LOCAL"
}

export function calculatePoints(
  logType: LogType,
  receiptVerified: boolean,
  streak: number,
  isNewOrigin: boolean
): { base: number; bonus: number; bonusReason: string | null } {
  const base = BASE_POINTS[logType]
  let bonus = 0
  const reasons: string[] = []

  if (receiptVerified && RECEIPT_BONUS[logType] > 0) {
    bonus += RECEIPT_BONUS[logType]
    reasons.push(`+${RECEIPT_BONUS[logType]} receipt bonus`)
  }

  const streakBonus = getStreakBonus(streak)
  if (streakBonus > 0) {
    bonus += streakBonus
    reasons.push(`+${streakBonus} streak bonus`)
  }

  if (isNewOrigin) {
    bonus += 15
    reasons.push("+15 new origin!")
  }

  return {
    base,
    bonus,
    bonusReason: reasons.length > 0 ? reasons.join(", ") : null,
  }
}

// --- Knowledge XP (lesson/trivia-based) ---
export const TRIVIA_CORRECT_XP = 10
export const TRIVIA_WRONG_XP = 2
export const LESSON_COMPLETE_XP = 25
export const MODULE_COMPLETE_XP = 50

// --- Knowledge Rank thresholds ---
export const RANK_THRESHOLDS: Record<KnowledgeRank, number> = {
  COFFEE_LOVER: 0,
  ENTHUSIAST: 100,
  SPECIALTY_DRINKER: 300,
  CONNOISSEUR: 600,
  BARISTA: 1000,
}

export const RANK_LABELS: Record<KnowledgeRank, string> = {
  COFFEE_LOVER: "Coffee Lover",
  ENTHUSIAST: "Enthusiast",
  SPECIALTY_DRINKER: "Specialty Drinker",
  CONNOISSEUR: "Connoisseur",
  BARISTA: "Barista",
}

export const RANK_EMOJIS: Record<KnowledgeRank, string> = {
  COFFEE_LOVER: "☕",
  ENTHUSIAST: "🌱",
  SPECIALTY_DRINKER: "🔍",
  CONNOISSEUR: "🎨",
  BARISTA: "👨‍🍳",
}

export function getRankFromXP(xp: number): KnowledgeRank {
  if (xp >= RANK_THRESHOLDS.BARISTA) return "BARISTA"
  if (xp >= RANK_THRESHOLDS.CONNOISSEUR) return "CONNOISSEUR"
  if (xp >= RANK_THRESHOLDS.SPECIALTY_DRINKER) return "SPECIALTY_DRINKER"
  if (xp >= RANK_THRESHOLDS.ENTHUSIAST) return "ENTHUSIAST"
  return "COFFEE_LOVER"
}

export function getXPToNextRank(xp: number): {
  current: KnowledgeRank
  next: KnowledgeRank | null
  xpInCurrentRank: number
  xpForCurrentRank: number
  xpToNext: number
  progress: number
} {
  const current = getRankFromXP(xp)
  const ranks: KnowledgeRank[] = [
    "COFFEE_LOVER",
    "ENTHUSIAST",
    "SPECIALTY_DRINKER",
    "CONNOISSEUR",
    "BARISTA",
  ]
  const currentIdx = ranks.indexOf(current)
  const next = currentIdx < ranks.length - 1 ? ranks[currentIdx + 1] : null

  const currentThreshold = RANK_THRESHOLDS[current]
  const nextThreshold = next ? RANK_THRESHOLDS[next] : RANK_THRESHOLDS[current]

  const xpInCurrentRank = xp - currentThreshold
  const xpForCurrentRank = nextThreshold - currentThreshold
  const xpToNext = next ? nextThreshold - xp : 0
  const progress = next ? Math.min(100, (xpInCurrentRank / xpForCurrentRank) * 100) : 100

  return { current, next, xpInCurrentRank, xpForCurrentRank, xpToNext, progress }
}

// --- Streak logic ---
export function calculateStreak(
  currentStreak: number,
  shields: number,
  lastLogDate: Date | null
): { newStreak: number; newShields: number; shieldUsed: boolean } {
  if (!lastLogDate) return { newStreak: 1, newShields: shields, shieldUsed: false }

  const now = new Date()
  const last = new Date(lastLogDate)

  // Same day — streak unchanged
  const diffDays = Math.floor(
    (now.setHours(0, 0, 0, 0) - last.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
  )

  if (diffDays === 0) {
    return { newStreak: currentStreak, newShields: shields, shieldUsed: false }
  }

  if (diffDays === 1) {
    // Consecutive day
    return { newStreak: currentStreak + 1, newShields: shields, shieldUsed: false }
  }

  if (diffDays === 2 && shields > 0) {
    // Missed one day but have a shield
    return { newStreak: currentStreak + 1, newShields: shields - 1, shieldUsed: true }
  }

  // Streak broken
  return { newStreak: 1, newShields: shields, shieldUsed: false }
}
