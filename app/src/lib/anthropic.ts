import Anthropic from "@anthropic-ai/sdk"

const globalForAnthropic = globalThis as unknown as {
  anthropic: Anthropic | undefined
}

export const anthropic =
  globalForAnthropic.anthropic ??
  new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

if (process.env.NODE_ENV !== "production") globalForAnthropic.anthropic = anthropic

export const HAIKU_MODEL = "claude-haiku-4-5-20251001"

// Fallback coffee facts if Claude is unavailable
export const FALLBACK_FACTS = [
  "Coffee is the second most traded commodity in the world after oil, with over 2.25 billion cups consumed daily.",
  "The word 'espresso' comes from the Italian word meaning 'pressed out' — describing how water is forced through coffee grounds under pressure.",
  "Ethiopia is considered the birthplace of coffee, where a goat herder named Kaldi reportedly discovered the plants after noticing his goats were energized after eating the berries.",
  "A coffee tree produces only about one pound of coffee beans per year, which is why high-quality single-origin coffee is so precious.",
  "Cold brew coffee takes 12–24 hours to make because the cold water extracts flavor compounds more slowly, producing a smoother, less acidic cup.",
  "The lighter the roast, the more caffeine it contains — dark roasts are actually lower in caffeine because the roasting process breaks down caffeine molecules.",
  "Arabica beans make up about 60% of global coffee production and generally taste smoother, while Robusta has nearly double the caffeine and a stronger, harsher flavor.",
  "Pour over coffee was invented in Germany in 1908 by Melitta Bentz, who punched holes in a tin and used paper from her son's notebook as a filter.",
  "The 'coffee belt' spans roughly 25 degrees north and south of the equator — coffee plants require consistent temperatures between 60–70°F to thrive.",
  "Fair trade certified coffee ensures farmers receive at least $1.40 per pound for their beans, helping sustain communities in coffee-growing regions.",
]
