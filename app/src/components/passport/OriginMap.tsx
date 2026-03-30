"use client"

// Simplified world map using SVG country codes
// Countries are highlighted when stamped

const COUNTRY_POSITIONS: Record<string, { cx: number; cy: number }> = {
  Ethiopia: { cx: 540, cy: 230 },
  Colombia: { cx: 190, cy: 250 },
  Guatemala: { cx: 155, cy: 225 },
  Kenya: { cx: 545, cy: 255 },
  Brazil: { cx: 235, cy: 305 },
  Peru: { cx: 195, cy: 285 },
  Rwanda: { cx: 530, cy: 265 },
  Yemen: { cx: 565, cy: 205 },
  "Costa Rica": { cx: 165, cy: 235 },
  Honduras: { cx: 158, cy: 220 },
  Panama: { cx: 175, cy: 240 },
  Indonesia: { cx: 720, cy: 270 },
  Vietnam: { cx: 700, cy: 225 },
  India: { cx: 645, cy: 220 },
  Mexico: { cx: 145, cy: 205 },
  Ecuador: { cx: 185, cy: 265 },
  Bolivia: { cx: 210, cy: 295 },
  "Papua New Guinea": { cx: 760, cy: 275 },
}

interface OriginMapProps {
  stampedCountries: string[]
}

export function OriginMap({ stampedCountries }: OriginMapProps) {
  const stamped = new Set(stampedCountries)

  return (
    <div className="relative w-full">
      {/* Simple flat world map background */}
      <div className="bg-roast-100 rounded-2xl p-4 relative overflow-hidden" style={{ aspectRatio: "2/1" }}>
        {/* World map SVG outline (simplified) */}
        <svg
          viewBox="0 0 900 450"
          className="w-full h-full opacity-20 absolute inset-0"
          aria-hidden
        >
          {/* Simplified continent outlines */}
          <path d="M120,120 L280,100 L320,200 L280,280 L240,300 L180,280 L120,250 Z" fill="#92400e" />
          <path d="M320,80 L520,70 L580,160 L560,280 L480,320 L380,310 L320,200 Z" fill="#92400e" />
          <path d="M560,80 L720,90 L780,200 L740,280 L640,290 L580,220 Z" fill="#92400e" />
          <path d="M155,200 L200,180 L260,240 L240,310 L190,320 L155,280 Z" fill="#92400e" />
          <path d="M700,240 L800,220 L840,280 L800,310 L720,300 Z" fill="#92400e" />
        </svg>

        {/* Country dots */}
        {Object.entries(COUNTRY_POSITIONS).map(([country, pos]) => {
          const isStamped = stamped.has(country)
          // Scale position from 900x450 viewBox to percentage
          const left = `${(pos.cx / 900) * 100}%`
          const top = `${(pos.cy / 450) * 100}%`

          return (
            <div
              key={country}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left, top }}
              title={country}
            >
              {isStamped ? (
                <div className="w-6 h-6 rounded-full bg-roast-500 border-2 border-white shadow-md flex items-center justify-center text-[10px] animate-badge-pop">
                  ✓
                </div>
              ) : (
                <div className="w-3 h-3 rounded-full bg-chain-400/50 border border-white" />
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-roast-500" />
          <span className="text-xs text-chain-400">Stamped</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-chain-400/50" />
          <span className="text-xs text-chain-400">Undiscovered</span>
        </div>
      </div>
    </div>
  )
}
