import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const RANK_ORDER = [
  "COFFEE_LOVER",
  "ENTHUSIAST",
  "SPECIALTY_DRINKER",
  "CONNOISSEUR",
  "BARISTA",
]

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [user, modules] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { knowledgeRank: true },
    }),
    prisma.module.findMany({
      orderBy: { order: "asc" },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          include: {
            progress: {
              where: { userId: session.user.id },
              select: { correct: true },
            },
          },
        },
      },
    }),
  ])

  const userRankIdx = RANK_ORDER.indexOf(user?.knowledgeRank ?? "COFFEE_LOVER")

  const modulesWithStatus = modules.map((m) => {
    const moduleRankIdx = RANK_ORDER.indexOf(m.rankUnlock)
    const locked = moduleRankIdx > userRankIdx

    const lessonsWithProgress = m.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      order: l.order,
      completed: l.progress.length > 0,
      questionsCount: 0,
    }))

    const completedLessons = lessonsWithProgress.filter((l) => l.completed).length

    return {
      id: m.id,
      title: m.title,
      description: m.description,
      emoji: m.emoji,
      rankUnlock: m.rankUnlock,
      locked,
      lessons: lessonsWithProgress,
      progress: m.lessons.length > 0 ? completedLessons / m.lessons.length : 0,
    }
  })

  return NextResponse.json({ modules: modulesWithStatus })
}
