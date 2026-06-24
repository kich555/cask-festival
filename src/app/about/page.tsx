import AboutContent from "@/components/2026/AboutContent"
import Footer2026 from "@/components/2026/Footer2026"
import Nav2026 from "@/components/2026/Nav2026"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "행사 소개",
  description:
    "캐스크 카니발 2026 행사 소개 — 2025 리캡과 2026 개요(일시·장소·테마)를 확인하세요.",
  openGraph: {
    title: "행사 소개 | CASK CARNIVAL 2026",
    description: "캐스크 카니발 2026 행사 소개 — 2025 리캡과 2026 개요.",
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white pt-[88px] flex flex-col">
      <Nav2026 />
      <main className="flex-1">
        <AboutContent />
      </main>
      <Footer2026 />
    </div>
  )
}
