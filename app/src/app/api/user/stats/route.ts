import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getXPToNextRank } from "@/lib/xp"
import { getMonthKey } from "@/lib/utils"
import { getWeeklyMissions } from "@/lib/missions"
import type { MissionProgress } from "@/types"
import { LogType } from "@prisma/client"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  const [user, recentLogs, recentAchievements, communityCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        achievements: { orderBy: { earnedAt: "desc" }, take: 3 },
      },
    }),
    prisma.brewLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.userAchievement.findMany({
      where: { userId },
      orderBy: { earnedAt: "desc" },
      take: 3,
    }),
    prisma.communityLog.count({
      where: { month: getMonthKey() },
    }),
  ])

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const rankInfo = getXPToNextRank(user.knowledgeXP)

  // Calculate mission progress
  const missions = getWeeklyMissions()
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const weekLogs = await prisma.brewLog.findMany({
    where: { userId, createdAt: { gte: weekStart } },
  })

  const missionProgress: MissionProgress[] = missions.map((m) => {
    let current = 0

    if (m.type === "LOCAL_DRINKS") {
      current = weekLogs.filter(
        (l) => l.logType === LogType.DRINK_LOCAL
      ).length
    } else if (m.type === "LOCAL_BAGS") {
      current = weekLogs.filter((l) => l.logType === LogType.BAG_LOCAL).length
    } else if (m.type === "DIFFERENT_SHOPS") {
      const shops = new Set(
        weekLogs
          .filter((l) => l.logType === LogType.DRINK_LOCAL || l.logType === LogType.BAG_LOCAL)
          .map((l) => l.shopName)
          .filter(Boolean)
      )
      current = shops.size
    } else if (m.type === "STREAK_DAYS") {
      current = Math.min(user.currentStreak, m.target)
    } else if (m.type === "NEW_ORIGIN") {
      current = weekLogs.filter((l) => l.originCountry).length > 0 ? 1 : 0
    }

    return {
      ...m,
      current,
      completed: current >= m.target,
    }
  })

  return NextResponse.json({
    pointBalance: user.pointBalance,
    knowledgeXP: user.knowledgeXP,
    knowledgeRank: user.knowledgeRank,
    knowledgeProgress: rankInfo.progress,
    knowledgeXPToNext: rankInfo.xpToNext,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    streakShields: user.streakShields,
    recentLogs,
    recentAchievements: recentAchievements.map((a) => a.achievement),
    communityMonthlyLocal: communityCount,
    communityMonthlyGoal: 10000,
    missions: missionProgress,
  })
}
