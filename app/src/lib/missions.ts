// Missions are defined statically — they rotate weekly
// In production these could be stored in DB, but static definitions keep it simple

export interface Mission {
  id: string
  title: string
  description: string
  emoji: string
  pointReward: number
  type: "LOCAL_DRINKS" | "LOCAL_BAGS" | "DIFFERENT_SHOPS" | "STREAK_DAYS" | "NEW_ORIGIN"
  target: number
}

export const WEEKLY_MISSIONS: Mission[] = [
  {
    id: "local_drinks_3",
    title: "Local Love",
    description: "Log 3 drinks from local shops this week",
    emoji: "☕",
    pointReward: 50,
    type: "LOCAL_DRINKS",
    target: 3,
  },
  {
    id: "buy_a_bag",
    title: "Bean Buyer",
    description: "Buy a bag of beans from a local roaster",
    emoji: "🛍️",
    pointReward: 60,
    type: "LOCAL_BAGS",
    target: 1,
  },
  {
    id: "two_shops",
    title: "Shop Hopper",
    description: "Visit 2 different local shops this week",
    emoji: "🗺️",
    pointReward: 75,
    type: "DIFFERENT_SHOPS",
    target: 2,
  },
  {
    id: "streak_5",
    title: "Consistency is Key",
    description: "Log coffee 5 days in a row",
    emoji: "🔥",
    pointReward: 80,
    type: "STREAK_DAYS",
    target: 5,
  },
  {
    id: "new_origin",
    title: "Origin Explorer",
    description: "Try a coffee from a new origin country",
    emoji: "🌍",
    pointReward: 90,
    type: "NEW_ORIGIN",
    target: 1,
  },
]

// Returns 2 missions for the current week based on week number
export function getWeeklyMissions(): Mission[] {
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
  const idx1 = weekNumber % WEEKLY_MISSIONS.length
  const idx2 = (weekNumber + 2) % WEEKLY_MISSIONS.length
  return [WEEKLY_MISSIONS[idx1], WEEKLY_MISSIONS[idx2]]
}
