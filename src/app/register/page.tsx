// 2026 모집이 마감되어 네비게이션·푸터·홈 CTA에서 링크를 제거하고 noindex 처리했다.
// 페이지 자체는 다음 회차 모집에 재활용하기 위해 그대로 남겨둔다. (URL 직접 접근은 동작)
import type { Metadata } from "next"
import Footer2026 from "@/components/2026/Footer2026"
import Nav2026 from "@/components/2026/Nav2026"
import RegisterContent from "@/components/2026/RegisterContent"

export const metadata: Metadata = {
  title: "참가 업체 모집",
  description:
    "캐스크 카니발 2026 참가 업체 모집 — 부스 신청 절차, 부스 패키지, 참가 카테고리 안내.",
  openGraph: {
    title: "참가 업체 모집 | CASK CARNIVAL 2026",
    description: "부스 신청 절차·패키지·참가 카테고리 안내.",
  },
  robots: { index: false, follow: false },
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white pt-[88px] flex flex-col">
      <Nav2026 />
      <main className="flex-1">
        <RegisterContent />
      </main>
      <Footer2026 />
    </div>
  )
}
