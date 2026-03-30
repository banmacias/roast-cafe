import { Achievement, BrewLog, KnowledgeRank, LogType, User } from "@prisma/client"

export type UserWithStats = User & {
  achievements: { achievement: Achievement }[]
  originStamps: { country: string }[]
  _count: { brewLogs: number }
}

export interface DashboardStats {
  pointBalance: number
  knowledgeXP: number
  knowledgeRank: KnowledgeRank
  knowledgeProgress: number
  knowledgeXPToNext: number
  currentStreak: number
  longestStreak: number
  streakShields: number
  recentLogs: BrewLog[]
  recentAchievements: Achievement[]
  communityMonthlyLocal: number
  communityMonthlyGoal: number
}

export interface LogFormData {
  logType: LogType
  shopName?: string
  drinkType?: string
  originCountry?: string
  receiptUrl?: string
  receiptVerified?: boolean
  rating?: number
  notes?: string
}

export interface LogResult {
  logId: string
  pointsEarned: number
  bonusPoints: number
  bonusReason: string | null
  newStreak: number
  shieldUsed: boolean
  shieldEarned: boolean
  newAchievements: Achievement[]
  newRank: KnowledgeRank | null
}

export interface ReceiptVerifyResult {
  verified: boolean
  merchantName: string | null
  date: string | null
  coffeeItems: string[]
}

export interface MissionProgress {
  id: string
  title: string
  description: string
  emoji: string
  pointReward: number
  current: number
  target: number
  completed: boolean
}
