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
      <section className="max-w-[1000px] mx-auto px-5 md:px-10 py-16 md:py-24 text-center">
        <h2 className="text-[clamp(24px,4vw,42px)] font-extrabold leading-[1.4] whitespace-pre-line break-keep">
          {a.introTagline}
        </h2>
        <div className="w-12 h-[3px] bg-[#7d0b1c] mx-auto my-8 md:my-10" />
        <p className="text-[#444] text-[clamp(16px,1.4vw,18px)] leading-[1.9] max-w-[760px] mx-auto break-keep text-balance">
          {a.introBody1}
        </p>
        <p className="text-[#444] text-[clamp(16px,1.4vw,18px)] leading-[1.9] max-w-[760px] mx-auto mt-4 break-keep text-balance">
          {a.introBody2}
        </p>
      </section>

      {/* WHY — 특장점 */}
      <section className="bg-[#faf8f6]">
        <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-16 md:py-24">
          <h2 className="text-[clamp(22px,3vw,32px)] font-extrabold text-center mb-10 md:mb-14">{a.whyTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {a.why.map((w, i) => (
              <div key={w.title} className="bg-white border border-black/10 rounded-lg p-7 md:p-8">
                <div className="text-[#7d0b1c] font-extrabold text-[20px] mb-3">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="text-[18px] md:text-[20px] font-bold mb-2 break-keep">{w.title}</h3>
                <p className="text-[#666] text-[15px] leading-[1.8] break-keep">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2025 RECAP */}
      <section className="bg-[#ea5514] text-white">
        <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-16 md:py-20">
          <div className="flex flex-col md:flex-row md:items-center gap-7 md:gap-10">
            <div className="md:flex-1">
              <h2 className="text-[30px] font-extrabold mb-4">{a.recapTitle}</h2>
              <p className="text-white/90 text-[16px] break-keep">{a.recapBody1}</p>
              <p className="text-white/90 text-[16px] break-keep">{a.recapBody2}</p>
            </div>
            <Link
              href={`/2025${qs}`}
              className="shrink-0 text-white text-[26px] md:text-[34px] font-extrabold underline decoration-[3px] underline-offset-[8px] hover:decoration-[4px] transition-all"
            >
              {a.recapBtn}
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-white/25">
            {a.recapStats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-[clamp(28px,5vw,44px)] font-extrabold leading-none">{s.value}</div>
                <div className="text-white/85 text-[13px] md:text-[15px] mt-2 break-keep">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2026 FORECAST */}
      <section className="max-w-[1100px] mx-auto px-5 md:px-10 py-16 md:py-24">
        <h2 className="text-[clamp(22px,3vw,32px)] font-extrabold text-center mb-10 md:mb-14">{a.forecastTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {a.forecastStats.map((s) => (
            <div key={s.label} className="border border-black/10 border-t-[3px] border-t-[#7d0b1c] rounded-md p-8 text-center">
              <div className="text-[clamp(30px,4vw,44px)] font-extrabold text-[#7d0b1c] leading-none">{s.value}</div>
              <div className="text-[#666] text-[15px] mt-3 break-keep">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* OVERVIEW — 개요(맨 아래) */}
      <section className="bg-[#faf8f6]">
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
