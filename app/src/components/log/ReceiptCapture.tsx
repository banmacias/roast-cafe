"use client"

import { useRef, useState } from "react"
import { Camera, CheckCircle, Loader } from "lucide-react"
import type { ReceiptVerifyResult } from "@/types"

interface ReceiptCaptureProps {
  onVerified: (result: ReceiptVerifyResult & { url: string }) => void
  onSkip: () => void
  bonusPoints: number
}

export function ReceiptCapture({ onVerified, onSkip, bonusPoints }: ReceiptCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<"idle" | "uploading" | "verifying" | "done">("idle")
  const [result, setResult] = useState<ReceiptVerifyResult | null>(null)

  async function handleFile(file: File) {
    setStatus("uploading")

    // Upload to Cloudinary
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    if (!cloudName) {
      onSkip()
      return
    }

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", "roast_cafe_receipts")
      formData.append("folder", "receipts")

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      )
      const { secure_url } = await uploadRes.json()

      setStatus("verifying")

      const verifyRes = await fetch("/api/receipts/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiptUrl: secure_url }),
      })
      const verifyData: ReceiptVerifyResult = await verifyRes.json()

      setResult(verifyData)
      setStatus("done")

      if (verifyData.verified) {
        setTimeout(() => onVerified({ ...verifyData, url: secure_url }), 800)
      }
    } catch {
      onSkip()
    }
  }

  if (status === "done" && result) {
    return (
      <div className="space-y-4 text-center">
        <div className="flex flex-col items-center gap-3 py-6">
          <CheckCircle className="w-16 h-16 text-local-500" />
          <h2 className="font-display font-800 text-xl text-roast-900">
            {result.verified ? "Receipt Verified!" : "Got it!"}
          </h2>
          {result.verified ? (
            <p className="text-sm text-chain-400">
              +{bonusPoints} bonus points added 🎉
            </p>
          ) : (
            <p className="text-sm text-chain-400">
              We still counted your log — couldn&apos;t read the receipt clearly.
            </p>
          )}
        </div>
        {!result.verified && (
          <button onClick={onSkip} className="btn-primary">
            Continue →
          </button>
        )}
      </div>
    )
  }

  if (status === "uploading" || status === "verifying") {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <Loader className="w-10 h-10 text-roast-500 animate-spin" />
        <p className="font-display font-700 text-roast-900">
          {status === "uploading" ? "Uploading..." : "Reading receipt..."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display font-800 text-2xl text-roast-900">
          📸 Snap your receipt
        </h2>
        <p className="text-sm text-chain-400 mt-1">
          Verify your purchase for +{bonusPoints} bonus points
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      <button
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-2xl border-2 border-dashed border-roast-300 bg-roast-50 p-10 flex flex-col items-center gap-3 cursor-pointer hover:bg-roast-100 transition-colors active:scale-98"
      >
        <Camera className="w-12 h-12 text-roast-400" />
        <span className="font-display font-700 text-roast-700">Tap to take photo</span>
        <span className="text-xs text-chain-400">or upload from gallery</span>
      </button>

      <button onClick={onSkip} className="btn-ghost w-full">
        Skip → just log it
      </button>
    </div>
  )
}
