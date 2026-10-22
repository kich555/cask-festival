"use client"

import { Suspense } from "react"
import { useLanguage } from "@/i18n"

interface PageHeader2026Props {
  title: string
  subtitle?: string
  watermark: string
}

function HeaderInner({ title, subtitle, watermark }: PageHeader2026Props) {
  const lang = useLanguage()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#322329] to-[#241c20] text-white">
      {/* 모바일은 제목만 낮게, 부제목은 md 이상에서만 */}
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 h-[72px] md:h-[200px] flex flex-col justify-center">
        <h1 className="text-[22px] md:text-[40px] font-extrabold tracking-tight">{title}</h1>
        {subtitle && <p className="hidden md:block mt-3 text-white/70 text-[16px]">{subtitle}</p>}
      </div>
      {/* 배경 워터마크: 한국어 + 데스크톱에서만 노출 */}
      {lang === "ko" && (
        <span
          aria-hidden
          className="hidden md:block absolute top-1/2 -translate-y-1/2 right-10 text-white/[0.05] font-bold leading-none whitespace-nowrap pointer-events-none select-none text-[150px]"
          style={{ fontFamily: "'D-DIN Condensed', sans-serif" }}
        >
          {watermark}
        </span>
      )}
    </section>
  )
}

export default function PageHeader2026(props: PageHeader2026Props) {
  return (
    <Suspense fallback={null}>
      <HeaderInner {...props} />
    </Suspense>
  )
}
