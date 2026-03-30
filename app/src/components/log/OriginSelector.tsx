"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const POPULAR_ORIGINS = [
  { country: "Ethiopia", flag: "🇪🇹" },
  { country: "Colombia", flag: "🇨🇴" },
  { country: "Guatemala", flag: "🇬🇹" },
  { country: "Kenya", flag: "🇰🇪" },
  { country: "Brazil", flag: "🇧🇷" },
  { country: "Peru", flag: "🇵🇪" },
  { country: "Rwanda", flag: "🇷🇼" },
  { country: "Yemen", flag: "🇾🇪" },
  { country: "Costa Rica", flag: "🇨🇷" },
  { country: "Honduras", flag: "🇭🇳" },
  { country: "Panama", flag: "🇵🇦" },
  { country: "Indonesia", flag: "🇮🇩" },
]

interface OriginSelectorProps {
  selected: string | null
  onSelect: (country: string | null) => void
}

export function OriginSelector({ selected, onSelect }: OriginSelectorProps) {
  const [custom, setCustom] = useState("")

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display font-800 text-2xl text-roast-900">
          🌍 Where&apos;s it from?
        </h2>
        <p className="text-sm text-chain-400 mt-1">
          New origin = +15 bonus points!
          <br />
          <span className="text-chain-400">Skip if you don&apos;t know</span>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {POPULAR_ORIGINS.map((o) => (
          <button
            key={o.country}
            onClick={() => onSelect(selected === o.country ? null : o.country)}
            className={cn(
              "flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-center cursor-pointer",
              selected === o.country
                ? "border-roast-500 bg-roast-50"
                : "border-roast-100 bg-white hover:border-roast-300"
            )}
          >
            <span className="text-xl">{o.flag}</span>
            <span className="text-[11px] font-semibold text-roast-900 leading-tight">
              {o.country}
            </span>
          </button>
        ))}
      </div>

      <div>
        <input
          type="text"
          placeholder="Other country..."
          value={custom}
          onChange={(e) => {
            setCustom(e.target.value)
            if (e.target.value) onSelect(e.target.value)
          }}
          className="w-full px-4 py-3 rounded-xl border-2 border-roast-200 bg-white text-sm placeholder:text-chain-400 focus:outline-none focus:border-roast-500"
        />
      </div>

      <button onClick={() => onSelect(null)} className="btn-ghost w-full">
        Skip this step
      </button>
    </div>
  )
}
