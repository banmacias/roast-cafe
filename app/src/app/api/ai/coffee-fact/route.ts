import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { anthropic, HAIKU_MODEL, FALLBACK_FACTS } from "@/lib/anthropic"
import { buildCoffeeFactPrompt } from "@/lib/prompts"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { logId } = await req.json()
  if (!logId) {
    return NextResponse.json({ error: "No logId provided" }, { status: 400 })
  }

  const log = await prisma.brewLog.findUnique({ where: { id: logId } })
  if (!log || log.userId !== session.user.id) {
    return NextResponse.json({ error: "Log not found" }, { status: 404 })
  }

  // Return cached fact if already generated
  if (log.aiFact) {
    return NextResponse.json({ fact: log.aiFact })
  }

  try {
    const { system, user } = buildCoffeeFactPrompt(
      log.logType,
      log.drinkType,
      log.originCountry,
      log.shopName,
      log.notes
    )

    const response = await Promise.race([
      anthropic.messages.create({
        model: HAIKU_MODEL,
        max_tokens: 200,
        system,
        messages: [{ role: "user", content: user }],
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 8000)
      ),
    ])

    const fact =
      "content" in response && response.content[0].type === "text"
        ? response.content[0].text
        : FALLBACK_FACTS[Math.floor(Math.random() * FALLBACK_FACTS.length)]

    // Cache the fact
    await prisma.brewLog.update({ where: { id: logId }, data: { aiFact: fact } })

    return NextResponse.json({ fact })
  } catch {
    const fallback = FALLBACK_FACTS[Math.floor(Math.random() * FALLBACK_FACTS.length)]
    return NextResponse.json({ fact: fallback })
  }
}
