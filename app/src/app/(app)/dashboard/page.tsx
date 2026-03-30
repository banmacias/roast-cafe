import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getXPToNextRank, isLocalLog } from "@/lib/xp"
import { getMonthKey } from "@/lib/utils"
import { getWeeklyMissions } from "@/lib/missions"
import { StreakCounter } from "@/components/dashboard/StreakCounter"
import { KnowledgeBar } from "@/components/dashboard/KnowledgeBar"
import { PointsCard } from "@/components/dashboard/PointsCard"
import { CommunityMeter } from "@/components/dashboard/CommunityMeter"
import { MissionCard } from "@/components/dashboard/MissionCard"
import { RecentLogs } from "@/components/dashboard/RecentLogs"
import { LogType } from "@prisma/client"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user!.id!

  const [user, recentLogs, communityCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.brewLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.communityLog.count({ where: { month: getMonthKey() } }),
  ])

  if (!user) return null

  const rankInfo = getXPToNextRank(user.knowledgeXP)

  // Calculate mission progress
  const missions = getWeeklyMissions()
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const weekLogs = await prisma.brewLog.findMany({
    where: { userId, createdAt: { gte: weekStart } },
  })

  const missionProgress = missions.map((m) => {
    let current = 0
    if (m.type === "LOCAL_DRINKS") {
      current = weekLogs.filter((l) => l.logType === LogType.DRINK_LOCAL).length
    } else if (m.type === "LOCAL_BAGS") {
      current = weekLogs.filter((l) => l.logType === LogType.BAG_LOCAL).length
    } else if (m.type === "DIFFERENT_SHOPS") {
      const shops = new Set(
        weekLogs
          .filter((l) => isLocalLog(l.logType))
          .map((l) => l.shopName)
          .filter(Boolean)
      )
      current = shops.size
    } else if (m.type === "STREAK_DAYS") {
      current = Math.min(user.currentStreak, m.target)
    } else if (m.type === "NEW_ORIGIN") {
      current = weekLogs.filter((l) => l.originCountry).length > 0 ? 1 : 0
    }
    return { ...m, current, completed: current >= m.target }
  })

  const todayLogged = recentLogs.some((l) => {
    const d = new Date(l.createdAt)
    const now = new Date()
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    )
  })

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="font-display font-800 text-xl text-roast-900">
            {todayLogged ? "Good job today! ☕" : "Good morning! ☕"}
          </h1>
          <p className="text-xs text-chain-400">
            {todayLogged ? "You already logged today" : "Don't forget to log your coffee"}
          </p>
        </div>
        <StreakCounter streak={user.currentStreak} shields={user.streakShields} />
      </div>

      {/* Knowledge rank bar */}
      <div className="card">
        <KnowledgeBar
          rank={user.knowledgeRank}
          xp={user.knowledgeXP}
          xpToNext={rankInfo.xpToNext}
          progress={rankInfo.progress}
        />
      </div>

      {/* Roast Points */}
      <PointsCard points={user.pointBalance} />

      {/* Log CTA */}
      {!todayLogged && (
        <Link href="/log">
          <div className="btn-primary text-center py-4 text-lg rounded-2xl">
            + Log Today&apos;s Coffee
          </div>
        </Link>
      )}

      {/* Daily trivia CTA */}
      <Link href="/learn">
        <div className="card flex items-center gap-3 border-2 border-roast-200 hover:border-roast-400 transition-colors cursor-pointer">
          <span className="text-2xl">📚</span>
          <div>
            <p className="font-display font-700 text-sm text-roast-900">Today&apos;s Quiz</p>
            <p className="text-xs text-chain-400">Earn Knowledge XP — free, no purchase needed</p>
          </div>
          <span className="ml-auto text-roast-400">→</span>
        </div>
      </Link>

      {/* Missions */}
      <div className="space-y-2">
        <h2 className="font-display font-700 text-sm text-roast-900">This Week&apos;s Missions</h2>
        {missionProgress.map((m) => (
          <MissionCard key={m.id} mission={m} />
        ))}
      </div>

      {/* Community meter */}
      <CommunityMeter count={communityCount} goal={10000} />

      {/* Recent logs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-700 text-sm text-roast-900">Recent Logs</h2>
          <Link href="/history" className="text-xs text-roast-500 font-semibold">
            See all →
          </Link>
        </div>
        <RecentLogs logs={recentLogs} />
      </div>
    </div>
  )
}
