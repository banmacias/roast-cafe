import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { anthropic, HAIKU_MODEL } from "@/lib/anthropic"
import { buildTriviaPrompt } from "@/lib/prompts"
import { KnowledgeRank } from "@prisma/client"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Check if already answered today
  const answered = await prisma.userProgress.findFirst({
    where: {
      userId: session.user.id,
      answeredAt: { gte: today, lt: tomorrow },
      question: { isTrivia: true },
    },
  })

  if (answered) {
    return NextResponse.json({ alreadyAnswered: true })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { knowledgeRank: true },
  })

  const rank: KnowledgeRank = user?.knowledgeRank ?? "COFFEE_LOVER"

  // Check for a pre-generated trivia question for today
  const existing = await prisma.question.findFirst({
    where: {
      isTrivia: true,
      triviaDate: { gte: today, lt: tomorrow },
      difficulty: rank,
    },
  })

  if (existing) {
    return NextResponse.json({
      question: {
        id: existing.id,
        text: existing.text,
        options: existing.options,
      },
    })
  }

  // Generate a new question with Claude
  try {
    const { system, user: userPrompt } = buildTriviaPrompt(rank)

    const response = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 400,
      system,
      messages: [{ role: "user", content: userPrompt }],
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("No JSON in response")

    const parsed = JSON.parse(jsonMatch[0])

    const question = await prisma.question.create({
      data: {
        text: parsed.text,
        options: parsed.options,
        correctIdx: parsed.correctIdx,
        explanation: parsed.explanation,
        difficulty: rank,
        isTrivia: true,
        triviaDate: today,
      },
    })

    return NextResponse.json({
      question: { id: question.id, text: question.text, options: question.options },
    })
  } catch (err) {
    console.error("Trivia generation error:", err)
    return NextResponse.json({ error: "Could not generate trivia" }, { status: 500 })
  }
}
