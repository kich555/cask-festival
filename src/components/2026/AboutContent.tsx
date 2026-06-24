"use client"

import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { useContent2026 } from "@/i18n/useContent2026"
import PageHeader2026 from "./PageHeader2026"

function Inner() {
  const { c, lang } = useContent2026()
  const a = c.aboutP
  const qs = `?lang=${lang}`

  const rows: [string, string][] = [
    [a.rowName, a.rowNameV],
    [a.rowTheme, "Oloroso Sherry Cask"],
    [a.rowDate, a.rowDateV],
    [a.rowVenue, a.rowVenueV],
    [a.rowHost, "WHISKYNAVI"],
    [a.rowSns, "@caskcarnival"],
  ]

  return (
    <div className="bg-white text-[#1a1a1a]">
      <PageHeader2026 title={a.title} subtitle={a.subtitle} watermark="ABOUT" />

      {/* INTRO — 취지 */}
      <section className="max-w-[920px] mx-auto px-5 md:px-10 pt-20 md:pt-28 pb-16 md:pb-20 text-center">
        <h2 className="text-[clamp(26px,4.4vw,46px)] font-extrabold leading-[1.35] whitespace-pre-line break-keep">
          {a.introTagline}
        </h2>
        <div className="w-14 h-[3px] bg-[#7d0b1c] mx-auto my-9 md:my-12" />
        <p className="text-[#3f3f3f] text-[clamp(16px,1.5vw,19px)] leading-[1.95] break-keep text-balance">
          {a.introBody1}
        </p>
        <p className="text-[#3f3f3f] text-[clamp(16px,1.5vw,19px)] leading-[1.95] mt-5 break-keep text-balance">
          {a.introBody2}
        </p>
        <p className="text-[#3f3f3f] text-[clamp(16px,1.5vw,19px)] leading-[1.95] mt-5 break-keep text-balance">
          {a.introBody3}
        </p>
      </section>

      {/* WHY — 특장점 (에디토리얼 리스트) */}
      <section className="border-t border-black/10">
        <div className="max-w-[960px] mx-auto px-5 md:px-10 py-16 md:py-24">
          <h2 className="text-[clamp(24px,3.4vw,38px)] font-extrabold mb-10 md:mb-14">{a.whyTitle}</h2>
          <div className="divide-y divide-black/10">
            {a.why.map((w, i) => (
              <div key={w.title} className="grid grid-cols-[auto_1fr] gap-5 md:gap-12 py-8 md:py-11">
                <div className="text-[#7d0b1c]/25 font-extrabold text-[40px] md:text-[64px] leading-none tracking-tight">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="pt-1">
                  <h3 className="text-[20px] md:text-[26px] font-bold mb-2.5 break-keep">{w.title}</h3>
                  <p className="text-[#555] text-[16px] md:text-[18px] leading-[1.85] break-keep">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2025 RECAP */}
      <section className="bg-[#ea5514] text-white">
        <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-16 md:py-24">
          <div className="flex flex-col md:flex-row md:items-center gap-7 md:gap-10">
            <div className="md:flex-1">
              <h2 className="text-[clamp(26px,3vw,36px)] font-extrabold mb-4">{a.recapTitle}</h2>
              <p className="text-white/90 text-[16px] md:text-[17px] break-keep">{a.recapBody1}</p>
              <p className="text-white/90 text-[16px] md:text-[17px] break-keep">{a.recapBody2}</p>
            </div>
            <Link
              href={`/2025${qs}`}
              className="shrink-0 text-white text-[26px] md:text-[34px] font-extrabold underline decoration-[3px] underline-offset-[8px] hover:decoration-[4px] transition-all"
            >
              {a.recapBtn}
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 mt-12 pt-10 border-t border-white/25">
            {a.recapStats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-[clamp(34px,5vw,52px)] font-extrabold leading-none">{s.value}</div>
                <div className="text-white/85 text-[13px] md:text-[15px] mt-2.5 break-keep">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2026 FORECAST */}
      <section className="border-t border-black/10">
        <div className="max-w-[1000px] mx-auto px-5 md:px-10 py-16 md:py-24">
          <h2 className="text-[clamp(24px,3.4vw,38px)] font-extrabold text-center mb-12 md:mb-16">{a.forecastTitle}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12 max-w-[920px] mx-auto">
            {a.forecastStats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-[clamp(34px,5vw,54px)] font-extrabold text-[#7d0b1c] leading-none">{s.value}</div>
                <div className="text-[#666] text-[14px] md:text-[16px] mt-3 break-keep">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OVERVIEW — 개요(맨 아래) */}
      <section className="bg-[#faf8f6] border-t border-black/10">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 py-16 md:py-24">
          <h2 className="text-[clamp(24px,3vw,32px)] font-extrabold">{a.overviewTitle}</h2>
          <div className="h-px bg-black/15 my-7" />
          <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] gap-8 md:gap-16 items-stretch">
            <Image
              src="/2026/about-keyvisual.png"
              alt={a.rowNameV}
              width={1080}
              height={1350}
              className="w-full max-w-[380px] mx-auto md:max-w-none h-auto md:h-full object-cover rounded-md"
            />
            <table className="w-full border-collapse">
              <tbody>
                {rows.map(([k, v]) => (
                  <tr key={k}>
                    <th className="text-left align-top py-4 md:py-[26px] border-b border-black/10 text-[#777] font-semibold w-[34%] md:w-[280px] text-[15px] md:text-[17px]">
                      {k}
                    </th>
                    <td className="text-left align-top py-4 md:py-[26px] border-b border-black/10 font-semibold text-[15px] md:text-[17px] break-keep">
                      {v}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function AboutContent() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  )
}
