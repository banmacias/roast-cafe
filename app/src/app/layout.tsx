import type { Metadata, Viewport } from "next"
import { Nunito, Inter } from "next/font/google"
import "./globals.css"

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Roast Cafe",
  description: "Your coffee journey starts here. Support local roasters and become a barista.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Roast",
  },
}

export const viewport: Viewport = {
  themeColor: "#d97706",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${nunito.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
