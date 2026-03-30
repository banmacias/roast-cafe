"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { motion } from "framer-motion"
import { Mail, Loader } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus("loading")
    setError("")
    try {
      const res = await signIn("resend", {
        email,
        redirect: false,
        callbackUrl: "/dashboard",
      })
      if (res?.error) {
        setError("Something went wrong. Try again.")
        setStatus("idle")
      } else {
        setStatus("sent")
      }
    } catch {
      setError("Something went wrong. Try again.")
      setStatus("idle")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="text-6xl mb-3">☕</div>
          <h1 className="font-display font-800 text-3xl text-roast-900">Roast Cafe</h1>
          <p className="text-chain-400 mt-2">
            Your coffee journey starts here.
          </p>
        </div>

        {status === "sent" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3"
          >
            <div className="text-5xl">📬</div>
            <h2 className="font-display font-700 text-xl text-roast-900">Check your email</h2>
            <p className="text-sm text-chain-400">
              We sent a magic link to <strong>{email}</strong>. Click it to log in.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-chain-400" />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-roast-200 bg-white text-roast-900 font-medium placeholder:text-chain-400 focus:outline-none focus:border-roast-500 transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={status === "loading" || !email.trim()}
              className="btn-primary disabled:opacity-50"
            >
              {status === "loading" ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                "Continue with Email"
              )}
            </button>

            <p className="text-xs text-center text-chain-400">
              We&apos;ll send you a magic link — no password needed.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
