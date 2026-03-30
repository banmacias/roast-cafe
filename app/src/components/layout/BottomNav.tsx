"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Plus, Clock, Trophy, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/history", icon: Clock, label: "History" },
  { href: "/log", icon: Plus, label: "Log", center: true },
  { href: "/achievements", icon: Trophy, label: "Achievements" },
  { href: "/learn", icon: BookOpen, label: "Learn" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-roast-100 px-2 pb-safe z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          if (item.center) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="-mt-6 flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-full bg-roast-500 flex items-center justify-center shadow-lg shadow-roast-300/50 active:scale-95 transition-transform">
                  <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
              </Link>
            )
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors",
                active ? "text-roast-500" : "text-chain-400"
              )}
            >
              <item.icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
