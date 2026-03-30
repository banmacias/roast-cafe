import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import { CheckCircle } from "lucide-react"

const LOG_TYPE_LABELS = {
  DRINK_LOCAL: "☕ Local Drink",
  DRINK_CHAIN: "☕ Chain Drink",
  BAG_LOCAL: "🛍️ Local Bag",
  BAG_CHAIN: "🛍️ Chain Bag",
}

const DRINK_LABELS: Record<string, string> = {
  ESPRESSO: "Espresso",
  AMERICANO: "Americano",
  LATTE: "Latte",
  CAPPUCCINO: "Cappuccino",
  FLAT_WHITE: "Flat White",
  CORTADO: "Cortado",
  COLD_BREW: "Cold Brew",
  POUR_OVER: "Pour Over",
  MACCHIATO: "Macchiato",
  MOCHA: "Mocha",
  OTHER: "Coffee",
}

export default async function HistoryPage() {
  const session = await auth()
  const userId = session!.user!.id!

  const logs = await prisma.brewLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const totalLocal = logs.filter(
    (l) => l.logType === "DRINK_LOCAL" || l.logType === "BAG_LOCAL"
  ).length
  const totalPoints = logs.reduce((s, l) => s + l.pointsEarned + l.bonusPoints, 0)
  const pctLocal = logs.length > 0 ? Math.round((totalLocal / logs.length) * 100) : 0

  return (
    <div className="p-4 space-y-4">
      <div className="pt-2">
        <h1 className="font-display font-800 text-2xl text-roast-900">Coffee History</h1>
        <p className="text-sm text-chain-400">{logs.length} logs total</p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="card text-center">
          <p className="font-display font-800 text-xl text-roast-500">{logs.length}</p>
          <p className="text-xs text-chain-400">Total logs</p>
        </div>
        <div className="card text-center">
          <p className="font-display font-800 text-xl text-local-500">{pctLocal}%</p>
          <p className="text-xs text-chain-400">Local</p>
        </div>
        <div className="card text-center">
          <p className="font-display font-800 text-xl text-roast-500">{totalPoints.toLocaleString()}</p>
          <p className="text-xs text-chain-400">Points</p>
        </div>
      </div>

      {/* Log list */}
      {logs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">☕</p>
          <p className="font-display font-700 text-roast-900">No logs yet</p>
          <p className="text-sm text-chain-400 mt-1">Start logging your coffee!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="card flex items-start justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm text-roast-900">
                    {LOG_TYPE_LABELS[log.logType]}
                  </span>
                  {log.receiptVerified && (
                    <CheckCircle className="w-3.5 h-3.5 text-local-500 shrink-0" />
                  )}
                </div>
                {log.shopName && (
                  <p className="text-xs text-chain-400 truncate">{log.shopName}</p>
                )}
                {log.drinkType && (
                  <p className="text-xs text-chain-400">
                    {DRINK_LABELS[log.drinkType] ?? log.drinkType}
                  </p>
                )}
                {log.originCountry && (
                  <p className="text-xs text-roast-500">🌍 {log.originCountry}</p>
                )}
                <p className="text-xs text-chain-400 mt-1">{formatDate(log.createdAt)}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-sm text-roast-500">
                  +{log.pointsEarned + log.bonusPoints} pts
                </p>
                {log.bonusPoints > 0 && (
                  <p className="text-[10px] text-chain-400">{log.bonusReason}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
