import { DrinkType, LogType } from "@prisma/client"

const LOG_TYPE_LABELS: Record<LogType, string> = {
  DRINK_LOCAL: "a drink from a local independent coffee shop",
  DRINK_CHAIN: "a drink from a coffee chain",
  BAG_LOCAL: "a bag of beans from a local independent roaster",
  BAG_CHAIN: "a bag of beans from a chain",
}

const DRINK_LABELS: Record<DrinkType, string> = {
  ESPRESSO: "espresso",
  AMERICANO: "americano",
  LATTE: "latte",
  CAPPUCCINO: "cappuccino",
  FLAT_WHITE: "flat white",
  COLD_BREW: "cold brew",
  POUR_OVER: "pour over",
  CORTADO: "cortado",
  MACCHIATO: "macchiato",
  MOCHA: "mocha",
  OTHER: "coffee",
}

export function buildCoffeeFactPrompt(
  logType: LogType,
  drinkType: DrinkType | null,
  originCountry: string | null,
  shopName: string | null,
  notes: string | null
): { system: string; user: string } {
  const what = drinkType ? DRINK_LABELS[drinkType] : LOG_TYPE_LABELS[logType]
  const origin = originCountry ? ` from ${originCountry}` : ""
  const shop = shopName ? ` at ${shopName}` : ""
  const notesStr = notes ? ` They noted it tasted: "${notes}".` : ""

  return {
    system: `You are a friendly coffee educator. Generate a single surprising, specific coffee fact (2–3 sentences max). Be conversational and enthusiastic. Never start with "Did you know", "Fun fact:", or similar openers. Go straight to the interesting information. Tie the fact to the specific drink, origin, or brewing context provided.`,
    user: `The person just logged: ${what}${shop}${origin}.${notesStr} Generate a coffee fact specifically relevant to what they just experienced.`,
  }
}

export function buildReceiptVerifyPrompt(): { system: string; user: string } {
  return {
    system: `You are a receipt parser. Extract information from receipt images accurately. Always respond with valid JSON only, no explanation.`,
    user: `Analyze this receipt image and extract:
1. The merchant/shop name
2. The date of purchase (YYYY-MM-DD format)
3. Any coffee-related line items (drinks, beans, bags, etc.)

Respond with this exact JSON structure:
{
  "merchantName": "string or null",
  "date": "YYYY-MM-DD or null",
  "coffeeItems": ["array of coffee item names"],
  "verified": true/false
}

Set verified: true only if there is at least one coffee-related item AND this appears to be a real receipt. If the image is not a receipt or has no coffee items, return { "verified": false, "merchantName": null, "date": null, "coffeeItems": [] }`,
  }
}

export function buildTriviaPrompt(difficulty: string): { system: string; user: string } {
  return {
    system: `You are a coffee knowledge quiz master. Generate engaging, accurate trivia questions about coffee. Always respond with valid JSON only.`,
    user: `Generate one coffee trivia question for difficulty level: ${difficulty}.

Respond with this exact JSON structure:
{
  "text": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctIdx": 0,
  "explanation": "A 2-3 sentence explanation of why the answer is correct, with an interesting related fact."
}

Difficulty guidelines:
- COFFEE_LOVER: Basic facts (colors, popular drinks, common knowledge)
- ENTHUSIAST: Origin countries, basic brewing methods, roast levels
- SPECIALTY_DRINKER: Processing methods, flavor profiles, specific regions
- CONNOISSEUR: Chemical processes, terroir, advanced extraction
- BARISTA: Precise temperatures, ratios, professional techniques`,
  }
}
