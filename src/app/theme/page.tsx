import Footer2026 from "@/components/2026/Footer2026"
import Nav2026 from "@/components/2026/Nav2026"
import ThemeContent from "@/components/2026/ThemeContent"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "테마 소개",
  description:
    "캐스크 카니발 2026 테마 — 2026 올해의 테마 'Oloroso Sherry Cask'와 연도별 테마 아카이브.",
  openGraph: {
    title: "테마 소개 | CASK CARNIVAL 2026",
    description: "2026 테마 Oloroso Sherry Cask와 테마 아카이브.",
  },
}

export default function ThemePage() {
  return (
    <div className="min-h-screen bg-white pt-[70px] flex flex-col">
      <Nav2026 />
      <main className="flex-1">
        <ThemeContent />
      </main>
      <Footer2026 />
    </div>
  )
}
