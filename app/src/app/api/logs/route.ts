import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  calculatePoints,
  calculateStreak,
  getRankFromXP,
  isLocalLog,
} from "@/lib/xp"
import { checkAchievements } from "@/lib/achievements"
import { LogType, DrinkType, KnowledgeRank } from "@prisma/client"
import { getMonthKey } from "@/lib/utils"
import type { LogResult } from "@/types"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const body = await req.json()

  const {
    logType,
    shopName,
    drinkType,
    originCountry,
    receiptUrl,
    receiptVerified = false,
    rating,
    notes,
  } = body as {
    logType: LogType
    shopName?: string
    drinkType?: DrinkType
    originCountry?: string
    receiptUrl?: string
    receiptVerified?: boolean
    rating?: number
    notes?: string
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      achievements: true,
      originStamps: true,
    },
  })

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  // Check if this origin is new
  const isNewOrigin =
    !!originCountry &&
    !user.originStamps.some((s) => s.country === originCountry)

  // Calculate streak
  const { newStreak, newShields, shieldUsed } = calculateStreak(
    user.currentStreak,
    user.streakShields,
    user.lastLogDate
  )

  // Calculate points
  const { base, bonus, bonusReason } = calculatePoints(
    logType,
    receiptVerified,
    newStreak,
    isNewOrigin
  )
  const totalPoints = base + bonus

  // Shield earned for local logs
  const shieldEarned = isLocalLog(logType)
  const finalShields = Math.min(3, (shieldUsed ? newShields : user.streakShields) + (shieldEarned ? 1 : 0))

  // Time-based achievements
  const hour = new Date().getHours()
  const isEarlyBird = hour < 7
  const isNightOwl = hour >= 21

  // Count existing logs for achievements
  const [totalLocalLogs, totalBagLogs] = await Promise.all([
    prisma.brewLog.count({
      where: { userId, logType: { in: ["DRINK_LOCAL", "BAG_LOCAL"] } },
    }),
    prisma.brewLog.count({
      where: { userId, logType: { in: ["BAG_LOCAL", "BAG_CHAIN"] } },
    }),
  ])

  const existingAchievements = user.achievements.map((a) => a.achievement)

  const newAchievements = checkAchievements({
    existingAchievements,
    totalLocalLogs: totalLocalLogs + 1,
    currentStreak: newStreak,
    originCount: user.originStamps.length + (isNewOrigin ? 1 : 0),
    isFirstLog: totalLocalLogs + totalBagLogs === 0,
    isFirstLocal: isLocalLog(logType) && totalLocalLogs === 0,
    isFirstBag:
      (logType === "BAG_LOCAL" || logType === "BAG_CHAIN") && totalBagLogs === 0,
    isFirstVerified: receiptVerified && !existingAchievements.includes("FIRST_VERIFIED"),
    isFirstLesson: false,
    isEarlyBird,
    isNightOwl,
    totalBagLogs: totalBagLogs + (logType === "BAG_LOCAL" || logType === "BAG_CHAIN" ? 1 : 0),
    prevRank: user.knowledgeRank,
    newRank: user.knowledgeRank,
  })

  // Check for shield earned achievement
  if (shieldEarned && !existingAchievements.includes("SHIELD_EARNED")) {
    newAchievements.push("SHIELD_EARNED")
  }

  const newPointBalance = user.pointBalance + totalPoints
  const now = new Date()
  const monthKey = getMonthKey(now)

  // Transactionally create log + update user + create community entry
  const [brewLog] = await prisma.$transaction([
    prisma.brewLog.create({
      data: {
        userId,
        logType,
        shopName: shopName ?? null,
        drinkType: drinkType ?? null,
        originCountry: originCountry ?? null,
        receiptUrl: receiptUrl ?? null,
        receiptVerified,
        rating: rating ?? null,
        notes: notes ?? null,
        pointsEarned: base,
        bonusPoints: bonus,
        bonusReason: bonusReason ?? null,
        streakDay: newStreak,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        pointBalance: newPointBalance,
        currentStreak: newStreak,
        longestStreak: Math.max(user.longestStreak, newStreak),
        streakShields: finalShields,
        lastLogDate: now,
      },
    }),
    ...(newAchievements.length > 0
      ? [
          prisma.userAchievement.createMany({
            data: newAchievements.map((a) => ({ userId, achievement: a })),
            skipDuplicates: true,
          }),
        ]
      : []),
    ...(isNewOrigin && originCountry
      ? [
          prisma.originStamp.upsert({
            where: { userId_country: { userId, country: originCountry } },
            create: { userId, country: originCountry, firstLogId: "pending" },
            update: {},
          }),
        ]
      : []),
    ...(isLocalLog(logType)
      ? [
          prisma.communityLog.create({
            data: { userId, logId: "pending", month: monthKey },
          }),
        ]
      : []),
  ])

  // Update firstLogId for origin stamp
  if (isNewOrigin && originCountry) {
    await prisma.originStamp.updateMany({
      where: { userId, country: originCountry, firstLogId: "pending" },
      data: { firstLogId: brewLog.id },
    })
  }

  // Update logId for community log
  if (isLocalLog(logType)) {
    await prisma.communityLog.updateMany({
      where: { userId, logId: "pending", month: monthKey },
      data: { logId: brewLog.id },
    })
  }

  const result: LogResult = {
    logId: brewLog.id,
    pointsEarned: base,
    bonusPoints: bonus,
    bonusReason,
    newStreak,
    shieldUsed,
    shieldEarned,
    newAchievements,
    newRank: null,
  }

  return NextResponse.json(result)
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "20")
  const month = searchParams.get("month")

  const where = {
    userId: session.user.id,
    ...(month
      ? {
          createdAt: {
            gte: new Date(`${month}-01`),
            lt: new Date(
              month.split("-")[0] +
                "-" +
                String(parseInt(month.split("-")[1]) + 1).padStart(2, "0") +
                "-01"
            ),
          },
        }
      : {}),
  }

  const [logs, total] = await Promise.all([
    prisma.brewLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.brewLog.count({ where }),
  ])

  return NextResponse.json({ logs, total, page, pages: Math.ceil(total / limit) })
}
