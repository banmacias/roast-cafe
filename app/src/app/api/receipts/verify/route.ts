import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { anthropic, HAIKU_MODEL } from "@/lib/anthropic"
import { buildReceiptVerifyPrompt } from "@/lib/prompts"
import type { ReceiptVerifyResult } from "@/types"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { receiptUrl } = await req.json()
  if (!receiptUrl) {
    return NextResponse.json({ error: "No receipt URL provided" }, { status: 400 })
  }

  try {
    const { system, user } = buildReceiptVerifyPrompt()

    const response = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 300,
      system,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "url", url: receiptUrl },
            },
            {
              type: "text",
              text: user,
            },
          ],
        },
      ],
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json<ReceiptVerifyResult>({
        verified: false,
        merchantName: null,
        date: null,
        coffeeItems: [],
      })
    }

    const parsed = JSON.parse(jsonMatch[0]) as ReceiptVerifyResult
    return NextResponse.json(parsed)
  } catch (err) {
    console.error("Receipt verification error:", err)
    // Never surface errors — just return unverified
    return NextResponse.json<ReceiptVerifyResult>({
      verified: false,
      merchantName: null,
      date: null,
      coffeeItems: [],
    })
  }
}
