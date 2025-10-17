import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.caskcarnival.com"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CASK CARNIVAL 2025",
    template: "%s | CASK CARNIVAL 2025",
  },
  description:
    "2025년 11월 1일 개최되는 CASK CARNIVAL. 세계 각국의 Cask 숙성 증류주들을 만나보세요.",
  keywords: [
    "위스키",
    "숙성 증류주",
    "위스키 페스티벌",
    "whisky",
    "whiskynavi",
    "cask",
    "distillery",
    "IB",
    "위스키내비",
    "위스키 축제",
    "2025",
  ],
  authors: [{ name: "Whiskynavi" }],
  creator: "Whiskynavi",
  publisher: "Whiskynavi",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    alternateLocale: ["en_US", "ja_JP"],
    url: siteUrl,
    title: "CASK CARNIVAL 2025",
    description:
      "2025년 11월 1일 개최되는 CASK CARNIVAL. 세계 각국의 Cask 숙성 증류주들을 만나보세요.",
    siteName: "CASK CARNIVAL 2025",
    countryName: "South Korea",
    ttl: 86400, // 24 hours
    images: [
      {
        url: "/og-image.png",
        secureUrl: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CASK CARNIVAL 2025",
        type: "image/png",
      },
      {
        url: "/apple-touch-icon.png",
        width: 180,
        height: 180,
        alt: "CASK CARNIVAL App Icon",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CASK CARNIVAL 2025",
    description:
      "2025년 11월 1일 개최되는 CASK CARNIVAL. 세계 각국의 Cask 숙성 증류주들을 만나보세요.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icon-16x16.png?v=2", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png?v=2", sizes: "32x32", type: "image/png" },
      { url: "/icon.ico?v=2" },
    ],
    apple: [{ url: "/apple-touch-icon.png?v=2", sizes: "180x180", type: "image/png" }],
    other: [
      { rel: "android-chrome-192x192", url: "/android-chrome-192x192.png?v=2" },
      { rel: "android-chrome-512x512", url: "/android-chrome-512x512.png?v=2" },
    ],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  )
}
