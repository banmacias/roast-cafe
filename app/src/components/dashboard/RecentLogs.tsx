import { BrewLog } from "@prisma/client"
import { formatDate } from "@/lib/utils"

const LOG_TYPE_LABELS = {
  DRINK_LOCAL: "☕ Local Drink",
  DRINK_CHAIN: "☕ Chain Drink",
  BAG_LOCAL: "🛍️ Local Bag",
  BAG_CHAIN: "🛍️ Chain Bag",
}

interface RecentLogsProps {
  logs: BrewLog[]
}

export function RecentLogs({ logs }: RecentLogsProps) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-chain-400 text-center py-4">
        No logs yet — tap + to start!
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex items-center justify-between py-2.5 px-3 bg-white rounded-xl border border-roast-100"
        >
          <div>
            <p className="font-semibold text-sm text-roast-900">
              {LOG_TYPE_LABELS[log.logType]}
            </p>
            <p className="text-xs text-chain-400">
              {log.shopName ?? ""}
              {log.shopName ? " · " : ""}
              {formatDate(log.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-roast-500">
              +{log.pointsEarned + log.bonusPoints} pts
            </p>
            {log.receiptVerified && (
              <span className="text-xs text-local-500">✓ verified</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
