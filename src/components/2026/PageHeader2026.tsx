"use client"

import { Suspense } from "react"
import { useLanguage } from "@/i18n"

interface PageHeader2026Props {
  title: string
  subtitle?: string
  watermark: string
  /** 본문을 한 화면에 담아야 하는 페이지용 낮은 헤더 */
  compact?: boolean
}

function HeaderInner({ title, subtitle, watermark, compact = false }: PageHeader2026Props) {
  const lang = useLanguage()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#322329] to-[#241c20] text-white">
      <div
        className={`max-w-[1440px] mx-auto px-5 md:px-10 ${compact ? "h-[100px] md:h-[116px]" : "h-[150px] md:h-[200px]"} flex flex-col justify-center`}
      >
        <h1
          className={`${compact ? "text-[24px] md:text-[32px]" : "text-[28px] md:text-[40px]"} font-extrabold tracking-tight`}
        >
          {title}
        </h1>
        {subtitle && (
          <p className={`${compact ? "mt-1.5" : "mt-3"} text-white/70 text-[14px] md:text-[16px]`}>
            {subtitle}
          </p>
        )}
      </div>
      {/* 배경 워터마크: 한국어 + 데스크톱에서만 노출 */}
      {lang === "ko" && (
        <span
          aria-hidden
          className={`hidden md:block absolute top-1/2 -translate-y-1/2 right-10 text-white/[0.05] font-bold leading-none whitespace-nowrap pointer-events-none select-none ${compact ? "text-[100px]" : "text-[150px]"}`}
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
