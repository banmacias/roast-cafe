import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { BottomNav } from "@/components/layout/BottomNav"

export const dynamic = "force-dynamic"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen pb-20">
      {children}
      <BottomNav />
    </div>
  )
}
