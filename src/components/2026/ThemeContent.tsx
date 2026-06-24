"use client"

import { getThemeByYear, getThemesDesc } from "@/content/themes2026"
import { useContent2026 } from "@/i18n/useContent2026"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import PageHeader2026 from "./PageHeader2026"

function Inner() {
  const { c, lang } = useContent2026()
  const t = c.themeP
  const searchParams = useSearchParams()
  const yearParam = Number.parseInt(searchParams.get("year") ?? "", 10)
  const cur = getThemeByYear(Number.isNaN(yearParam) ? null : yearParam)
  const all = getThemesDesc()
  const desc = lang === "ko" ? cur.descKo : cur.descEn
  const qs = searchParams.get("lang") ? `&lang=${searchParams.get("lang")}` : ""

  return (
    <div className="bg-white text-[#1a1a1a]">
      <PageHeader2026 title={t.title} subtitle={t.subtitle} watermark="THEMES" />

      {/* CURRENT LABEL */}
      <section className="max-w-[1440px] mx-auto px-5 md:px-10 py-7 md:py-10">
        <p className="text-[#7d0b1c] tracking-wide text-[13px]">{t.archiveEyebrow}</p>
        <div className="flex items-center gap-3 md:gap-6 mt-3">
          <span className="bg-[#7d0b1c] text-white font-semibold px-3 py-1.5 rounded text-[14px] md:text-[16px]">{cur.year}</span>
          <span className="text-[clamp(17px,5vw,32px)] font-extrabold">{cur.name}</span>
        </div>
      </section>

      {/* THEME BAND — 편지지 느낌(흰 배경 + 사각 테두리) */}
      <section className="bg-white">
        <div className="max-w-[1000px] mx-auto px-5 md:px-10 pb-16 md:pb-24">
          <div className="border border-[#7d0b1c]/35 rounded-md px-6 md:px-14 py-12 md:py-16 text-center text-[#1a1a1a]">
            <p className="tracking-[3px] text-[13px] text-[#7d0b1c] mb-3">{cur.year} THEME</p>
            <h2 className="text-[clamp(28px,6vw,52px)] font-extrabold">{cur.name}</h2>
            <div className="w-[clamp(160px,40vw,720px)] h-px bg-[#7d0b1c]/30 mx-auto my-7" />
            {desc.map((d) => (
              <p key={d} className="text-[#444] max-w-[760px] mx-auto leading-relaxed text-[16px] mt-2 first:mt-0">
                {d}
              </p>
            ))}
            <p className="tracking-[6px] text-[#7d0b1c] font-semibold mt-12 mb-8 text-[15px]">{t.notesTitle}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5 max-w-[860px] mx-auto">
              {cur.notes.map((n) => (
                <div key={n.en} className="flex flex-col items-center gap-1">
                  <div className="text-[28px]">{n.icon}</div>
                  <div className="text-[14px] font-semibold">{n.en}</div>
                  <div className="text-[13px] text-[#888]">{n.ko}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ARCHIVE */}
      <section className="max-w-[1440px] mx-auto px-5 md:px-10 py-12 md:py-16">
        <h2 className="text-[24px] md:text-[28px] font-extrabold">{t.archiveTitle}</h2>
        <div className="h-px bg-black/15 my-6" />
        <div className="flex flex-wrap gap-4 md:gap-6">
          {all.map((th) => {
            const active = th.year === cur.year
            return (
              <Link
                key={th.year}
                href={`/theme?year=${th.year}${qs}`}
                className={`w-full sm:w-[405px] max-w-full h-auto min-h-[180px] md:h-[280px] rounded p-6 md:p-8 flex flex-col bg-[#7d0b1c] text-white transition-transform hover:-translate-y-1 ${
                  active ? "outline outline-2 outline-white/70 outline-offset-[3px]" : ""
                }`}
              >
                <span className="text-white/80 font-semibold tracking-[4px] text-[22px]">{th.year}</span>
                <strong className="text-[30px] mt-3 leading-tight">{th.name}</strong>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default function ThemeContent() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  )
}
