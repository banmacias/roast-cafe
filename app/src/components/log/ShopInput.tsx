"use client"

import { useState, useEffect } from "react"
import { MapPin } from "lucide-react"

interface ShopInputProps {
  value: string
  onChange: (value: string) => void
  onNext: () => void
}

export function ShopInput({ value, onChange, onNext }: ShopInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    if (value.length < 2) {
      setSuggestions([])
      return
    }
    // Fetch existing shop names from DB that match
    fetch(`/api/shops/search?q=${encodeURIComponent(value)}`)
      .then((r) => r.json())
      .then((data) => setSuggestions(data.shops ?? []))
      .catch(() => setSuggestions([]))
  }, [value])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display font-800 text-2xl text-roast-900">Which local shop?</h2>
        <p className="text-sm text-chain-400 mt-1">Name the shop you visited</p>
      </div>

      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-chain-400" />
        <input
          type="text"
          placeholder="e.g. Stumptown Coffee"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-roast-200 bg-white text-roast-900 font-medium placeholder:text-chain-400 focus:outline-none focus:border-roast-500 transition-colors"
          autoFocus
        />
      </div>

      {suggestions.length > 0 && (
        <div className="rounded-2xl border border-roast-100 bg-white overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                onChange(s)
                setSuggestions([])
              }}
              className="w-full text-left px-4 py-3 text-sm font-medium text-roast-900 hover:bg-roast-50 border-b border-roast-100 last:border-0 flex items-center gap-2"
            >
              <span className="text-local-500">✓</span> {s}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!value.trim()}
        className="btn-primary disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  )
}
