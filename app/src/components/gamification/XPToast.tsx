"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ToastItem {
  id: string
  text: string
}

interface XPToastProps {
  items: ToastItem[]
  onDismiss: (id: string) => void
}

export function XPToast({ items, onDismiss }: XPToastProps) {
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {items.map((item) => (
          <AutoDismiss key={item.id} id={item.id} onDismiss={onDismiss}>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="bg-roast-900 text-white font-display font-700 text-sm px-5 py-2.5 rounded-full shadow-lg whitespace-nowrap"
            >
              {item.text}
            </motion.div>
          </AutoDismiss>
        ))}
      </AnimatePresence>
    </div>
  )
}

function AutoDismiss({
  id,
  onDismiss,
  children,
}: {
  id: string
  onDismiss: (id: string) => void
  children: React.ReactNode
}) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(id), 2500)
    return () => clearTimeout(t)
  }, [id, onDismiss])
  return <>{children}</>
}
