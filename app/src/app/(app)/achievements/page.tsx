import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AchievementBadge } from "@/components/gamification/AchievementBadge"
import { ACHIEVEMENT_META } from "@/lib/achievements"
import { KnowledgeBar } from "@/components/dashboard/KnowledgeBar"
import { getXPToNextRank } from "@/lib/xp"
import { Achievement } from "@prisma/client"

const ALL_ACHIEVEMENTS = Object.keys(ACHIEVEMENT_META) as Achievement[]

export default async function AchievementsPage() {
  const session = await auth()
  const userId = session!.user!.id!

  const [user, userAchievements] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.userAchievement.findMany({
      where: { userId },
      orderBy: { earnedAt: "asc" },
    }),
  ])

  if (!user) return null

  const unlocked = new Map(userAchievements.map((a) => [a.achievement, a.earnedAt]))
  const rankInfo = getXPToNextRank(user.knowledgeXP)
  const unlockedList = ALL_ACHIEVEMENTS.filter((a) => unlocked.has(a))
  const lockedList = ALL_ACHIEVEMENTS.filter((a) => !unlocked.has(a))

  return (
    <div className="p-4 space-y-5">
      <div className="pt-2">
        <h1 className="font-display font-800 text-2xl text-roast-900">Achievements</h1>
        <p className="text-sm text-chain-400">
          {unlockedList.length} / {ALL_ACHIEVEMENTS.length} unlocked
        </p>
      </div>

      {/* Knowledge rank */}
      <div className="card">
        <KnowledgeBar
          rank={user.knowledgeRank}
          xp={user.knowledgeXP}
          xpToNext={rankInfo.xpToNext}
          progress={rankInfo.progress}
        />
      </div>

      {/* Unlocked */}
      {unlockedList.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display font-700 text-sm text-roast-900">
            Unlocked ({unlockedList.length})
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {unlockedList.map((a) => (
              <AchievementBadge
                key={a}
                achievement={a}
                unlocked
                earnedAt={unlocked.get(a)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {lockedList.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display font-700 text-sm text-chain-400">
            Locked ({lockedList.length})
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {lockedList.map((a) => (
              <AchievementBadge key={a} achievement={a} unlocked={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
