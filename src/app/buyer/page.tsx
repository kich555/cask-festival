import type { Metadata } from "next"
import BuyerContent from "@/components/2026/BuyerContent"
import Footer2026 from "@/components/2026/Footer2026"
import Nav2026 from "@/components/2026/Nav2026"

export const metadata: Metadata = {
  title: "바이어 등록",
  description:
    "캐스크 카니발 2026 바이어 등록 — 도매·소매·바·수입사·프레스 대상, 명함 확인 후 승인.",
  openGraph: {
    title: "바이어 등록 | CASK CARNIVAL 2026",
    description: "주류 업계 관계자를 위한 바이어 등록.",
  },
}

export default function BuyerPage() {
  return (
    <div className="min-h-screen bg-white pt-[88px] flex flex-col">
      <Nav2026 />
      <main className="flex-1">
        <BuyerContent />
      </main>
      <Footer2026 />
    </div>
  )
}
