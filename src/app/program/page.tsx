import Footer2026 from "@/components/2026/Footer2026"
import Nav2026 from "@/components/2026/Nav2026"
import ProgramContent from "@/components/2026/ProgramContent"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "프로그램",
  description:
    "캐스크 카니발 2026 프로그램 — 마스터클래스 & 테이스팅 세션 일정(추후 공개 예정).",
  openGraph: {
    title: "프로그램 | CASK CARNIVAL 2026",
    description: "마스터클래스 & 테이스팅 세션 일정.",
  },
}

export default function ProgramPage() {
  return (
    <div className="min-h-screen bg-white pt-[70px]">
      <Nav2026 />
      <main>
        <ProgramContent />
      </main>
      <Footer2026 />
    </div>
  )
}
