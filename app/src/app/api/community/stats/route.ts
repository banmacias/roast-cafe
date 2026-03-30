import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMonthKey } from "@/lib/utils"

export async function GET() {
  const count = await prisma.communityLog.count({
    where: { month: getMonthKey() },
  })

  return NextResponse.json({
    monthlyLocal: count,
    goal: 10000,
    percentage: Math.min(100, Math.round((count / 10000) * 100)),
  })
}
