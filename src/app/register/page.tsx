import Footer2026 from "@/components/2026/Footer2026"
import Nav2026 from "@/components/2026/Nav2026"
import RegisterContent from "@/components/2026/RegisterContent"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "참가 업체 모집",
  description:
    "캐스크 카니발 2026 참가 업체 모집 — 부스 신청 절차, 부스 패키지, 참가 카테고리 안내.",
  openGraph: {
    title: "참가 업체 모집 | CASK CARNIVAL 2026",
    description: "부스 신청 절차·패키지·참가 카테고리 안내.",
  },
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav2026 />
      <main>
        <RegisterContent />
      </main>
      <Footer2026 />
    </div>
  )
}
