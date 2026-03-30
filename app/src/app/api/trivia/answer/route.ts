import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getRankFromXP, TRIVIA_CORRECT_XP, TRIVIA_WRONG_XP } from "@/lib/xp"
import { checkAchievements } from "@/lib/achievements"

export async function POST(req: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { questionId, selectedIdx } = await req.json()

  const question = await prisma.question.findUnique({
    where: { id: questionId },
  })
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { achievements: true },
  })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const correct = selectedIdx === question.correctIdx
  const xpGained = correct ? TRIVIA_CORRECT_XP : TRIVIA_WRONG_XP
  const newKnowledgeXP = user.knowledgeXP + xpGained
  const newRank = getRankFromXP(newKnowledgeXP)
  const prevRank = user.knowledgeRank
  const rankChanged = newRank !== prevRank

  const existingAchievements = user.achievements.map((a) => a.achievement)
  const newAchievements = checkAchievements({
    existingAchievements,
    totalLocalLogs: 0,
    currentStreak: user.currentStreak,
    originCount: 0,
    isFirstLog: false,
    isFirstLocal: false,
    isFirstBag: false,
    isFirstVerified: false,
    isFirstLesson: false,
    isEarlyBird: false,
    isNightOwl: false,
    totalBagLogs: 0,
    prevRank,
    newRank,
  })

  await prisma.$transaction([
    prisma.userProgress.create({
      data: {
        userId: userId,
        questionId,
        correct,
        knowledgeXP: xpGained,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { knowledgeXP: newKnowledgeXP, knowledgeRank: newRank },
    }),
    ...(newAchievements.length > 0
      ? [
          prisma.userAchievement.createMany({
            data: newAchievements.map((a) => ({ userId: userId, achievement: a })),
            skipDuplicates: true,
          }),
        ]
      : []),
  ])

  return NextResponse.json({
    correct,
    correctIdx: question.correctIdx,
    explanation: question.explanation,
    xpGained,
    newKnowledgeXP,
    newRank,
    rankChanged,
    newAchievements,
  })
}
