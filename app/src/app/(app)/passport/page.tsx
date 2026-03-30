import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { OriginMap } from "@/components/passport/OriginMap"

export default async function PassportPage() {
  const session = await auth()
  const userId = session!.user!.id!

  const stamps = await prisma.originStamp.findMany({
    where: { userId },
    orderBy: { earnedAt: "asc" },
  })

  const countries = stamps.map((s) => s.country)

  return (
    <div className="p-4 space-y-4">
      <div className="pt-2">
        <h1 className="font-display font-800 text-2xl text-roast-900">Origins Passport</h1>
        <p className="text-sm text-chain-400">
          {countries.length} origin{countries.length !== 1 ? "s" : ""} discovered
        </p>
      </div>

      <OriginMap stampedCountries={countries} />

      {/* Stamps list */}
      {stamps.length > 0 ? (
        <div className="space-y-2">
          <h2 className="font-display font-700 text-sm text-roast-900">Your Stamps</h2>
          {stamps.map((stamp) => (
            <div key={stamp.id} className="card flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">☕</span>
                <p className="font-semibold text-sm text-roast-900">{stamp.country}</p>
              </div>
              <p className="text-xs text-chain-400">
                {new Date(stamp.earnedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-8">
          <p className="text-4xl mb-3">🗺️</p>
          <p className="font-display font-700 text-roast-900">No stamps yet</p>
          <p className="text-sm text-chain-400 mt-1">
            Buy a bag from a local roaster and tag the origin country to start your passport!
          </p>
        </div>
      )}
    </div>
  )
}
