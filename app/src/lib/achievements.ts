import { Achievement, KnowledgeRank } from "@prisma/client"

interface CheckAchievementsInput {
  existingAchievements: Achievement[]
  totalLocalLogs: number
  currentStreak: number
  originCount: number
  isFirstLog: boolean
  isFirstLocal: boolean
  isFirstBag: boolean
  isFirstVerified: boolean
  isFirstLesson: boolean
  isEarlyBird: boolean
  isNightOwl: boolean
  totalBagLogs: number
  prevRank: KnowledgeRank
  newRank: KnowledgeRank
}

export function checkAchievements(input: CheckAchievementsInput): Achievement[] {
  const {
    existingAchievements,
    totalLocalLogs,
    currentStreak,
    originCount,
    isFirstLog,
    isFirstLocal,
    isFirstBag,
    isFirstVerified,
    isFirstLesson,
    isEarlyBird,
    isNightOwl,
    totalBagLogs,
    prevRank,
    newRank,
  } = input

  const earned = new Set(existingAchievements)
  const newOnes: Achievement[] = []

  function tryEarn(a: Achievement) {
    if (!earned.has(a)) {
      earned.add(a)
      newOnes.push(a)
    }
  }

  if (isFirstLog) tryEarn("FIRST_LOG")
  if (isFirstLocal) tryEarn("FIRST_LOCAL")
  if (isFirstBag) tryEarn("FIRST_BAG")
  if (isFirstVerified) tryEarn("FIRST_VERIFIED")
  if (isFirstLesson) tryEarn("LESSON_FIRST")
  if (isEarlyBird) tryEarn("EARLY_BIRD")
  if (isNightOwl) tryEarn("NIGHT_OWL")

  if (currentStreak >= 3) tryEarn("STREAK_3")
  if (currentStreak >= 7) tryEarn("STREAK_7")
  if (currentStreak >= 14) tryEarn("STREAK_14")
  if (currentStreak >= 30) tryEarn("STREAK_30")

  if (totalLocalLogs >= 5) tryEarn("LOCAL_5")
  if (totalLocalLogs >= 25) tryEarn("LOCAL_25")
  if (totalLocalLogs >= 100) tryEarn("LOCAL_100")

  if (originCount >= 3) tryEarn("ORIGINS_3")
  if (originCount >= 5) tryEarn("ORIGINS_5")
  if (originCount >= 10) tryEarn("ORIGINS_10")

  if (totalBagLogs >= 10) tryEarn("BAG_COLLECTOR")

  const rankOrder: KnowledgeRank[] = [
    "COFFEE_LOVER",
    "ENTHUSIAST",
    "SPECIALTY_DRINKER",
    "CONNOISSEUR",
    "BARISTA",
  ]
  if (rankOrder.indexOf(newRank) > rankOrder.indexOf(prevRank)) {
    if (newRank === "ENTHUSIAST") tryEarn("REACHED_ENTHUSIAST")
    if (newRank === "SPECIALTY_DRINKER") tryEarn("REACHED_SPECIALTY")
    if (newRank === "CONNOISSEUR") tryEarn("REACHED_CONNOISSEUR")
    if (newRank === "BARISTA") tryEarn("REACHED_BARISTA")
  }

  return newOnes
}

export const ACHIEVEMENT_META: Record<
  Achievement,
  { label: string; description: string; emoji: string }
> = {
  FIRST_LOG: { label: "First Sip", description: "Logged your first coffee", emoji: "☕" },
  FIRST_LOCAL: {
    label: "Local Love",
    description: "Visited a local shop for the first time",
    emoji: "🏠",
  },
  FIRST_BAG: {
    label: "Bag Buyer",
    description: "Bought your first bag from a local roaster",
    emoji: "🛍️",
  },
  FIRST_VERIFIED: {
    label: "Receipt Keeper",
    description: "Verified a purchase with a receipt",
    emoji: "✅",
  },
  STREAK_3: { label: "3-Day Streak", description: "Logged 3 days in a row", emoji: "🔥" },
  STREAK_7: { label: "Week Warrior", description: "7-day streak!", emoji: "🔥" },
  STREAK_14: { label: "Two Weeks Strong", description: "14-day streak!", emoji: "🔥" },
  STREAK_30: { label: "Monthly Maven", description: "30-day streak!", emoji: "👑" },
  LOCAL_5: {
    label: "Local Regular",
    description: "5 local shop visits",
    emoji: "🌟",
  },
  LOCAL_25: {
    label: "Community Champion",
    description: "25 local shop visits",
    emoji: "💚",
  },
  LOCAL_100: {
    label: "Local Legend",
    description: "100 local shop visits",
    emoji: "🏆",
  },
  SHIELD_EARNED: {
    label: "Shield Bearer",
    description: "Earned your first streak shield",
    emoji: "🛡️",
  },
  CHAIN_BREAKER: {
    label: "Chain Breaker",
    description: "Chose local 5 times after a chain visit",
    emoji: "⛓️",
  },
  ORIGINS_3: { label: "Globe Trotter", description: "Tried 3 coffee origins", emoji: "🌍" },
  ORIGINS_5: {
    label: "World Explorer",
    description: "Tried 5 coffee origins",
    emoji: "🗺️",
  },
  ORIGINS_10: {
    label: "Coffee Cartographer",
    description: "Tried 10 coffee origins",
    emoji: "🧭",
  },
  MISSION_FIRST: {
    label: "Mission Possible",
    description: "Completed your first mission",
    emoji: "🎯",
  },
  LESSON_FIRST: {
    label: "Student of the Bean",
    description: "Completed your first lesson",
    emoji: "📚",
  },
  TRIVIA_STREAK_7: {
    label: "Trivia Master",
    description: "Answered daily trivia 7 days in a row",
    emoji: "🧠",
  },
  REACHED_ENTHUSIAST: {
    label: "Enthusiast",
    description: "Reached Enthusiast rank",
    emoji: "🌱",
  },
  REACHED_SPECIALTY: {
    label: "Specialty Drinker",
    description: "Reached Specialty Drinker rank",
    emoji: "🔍",
  },
  REACHED_CONNOISSEUR: {
    label: "Connoisseur",
    description: "Reached Connoisseur rank",
    emoji: "🎨",
  },
  REACHED_BARISTA: {
    label: "Barista",
    description: "Reached Barista rank — top of the game!",
    emoji: "👨‍🍳",
  },
  EARLY_BIRD: {
    label: "Early Bird",
    description: "Logged a coffee before 7am",
    emoji: "🌅",
  },
  NIGHT_OWL: {
    label: "Night Owl",
    description: "Logged a coffee after 9pm",
    emoji: "🌙",
  },
  BAG_COLLECTOR: {
    label: "Bean Hoarder",
    description: "Bought 10 bags of coffee",
    emoji: "🛒",
  },
}
