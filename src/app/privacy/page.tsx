import type { Metadata } from "next"
import Footer2026 from "@/components/2026/Footer2026"
import Nav2026 from "@/components/2026/Nav2026"
import PrivacyContent from "@/components/2026/PrivacyContent"

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "캐스크 카니발 개인정보처리방침 — 수집 항목, 이용 목적, 보유 기간, 처리 위탁 안내.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white pt-[88px] flex flex-col">
      <Nav2026 />
      <main className="flex-1">
        <PrivacyContent />
      </main>
      <Footer2026 />
    </div>
  )
}
