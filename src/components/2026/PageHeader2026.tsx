"use client"

import { Suspense } from "react"
import { useLanguage } from "@/i18n"

interface PageHeader2026Props {
  title: string
  subtitle?: string
  watermark: string
}

function HeaderInner({ title, watermark }: PageHeader2026Props) {
  const lang = useLanguage()

  // 색 띠 없이 페이지 바탕 위에 제목만 가운데 정렬로 둔다 (라이트·다크 모드에 자연스럽게 섞이게).
  // 한국어 화면은 제목 위에 작은 영문 라벨을 단다. 부제목은 쓰지 않는다 (subtitle 은 호환용).
  return (
    <section className="bg-[var(--c-bg)] text-[var(--c-text)]">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 pt-5 pb-0 md:pt-9 md:pb-1 text-center">
        {lang === "ko" && (
          <p
            className="text-[12px] md:text-[15px] tracking-[0.28em] text-[var(--c-accent)] mb-1 md:mb-2"
            style={{ fontFamily: "'D-DIN Condensed', sans-serif" }}
          >
            {watermark}
          </p>
        )}
        <h1 className="text-[24px] md:text-[40px] font-extrabold tracking-tight">{title}</h1>
      </div>
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
