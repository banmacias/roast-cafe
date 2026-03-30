import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ shops: [] })
  }

  // Get distinct shop names matching the query
  const logs = await prisma.brewLog.findMany({
    where: {
      shopName: { contains: q, mode: "insensitive" },
      logType: { in: ["DRINK_LOCAL", "BAG_LOCAL"] },
    },
    select: { shopName: true },
    distinct: ["shopName"],
    take: 5,
  })

  const shops = logs.map((l) => l.shopName).filter(Boolean) as string[]
  return NextResponse.json({ shops })
}
