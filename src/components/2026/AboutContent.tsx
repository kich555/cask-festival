"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { useContent2026 } from "@/i18n/useContent2026"
import PageHeader2026 from "./PageHeader2026"

// 마커 규칙:
//   ||      → 데스크톱에서만 줄바꿈(모바일은 공백으로 이어짐). 지정한 지점에서만 끊음.
//   [[..]]  → 해당 구간 줄바꿈 방지(핵심 단어/문구 보호)
function renderNowrap(seg: string, keyPrefix: string) {
  return seg.split(/\[\[|\]\]/).map((part, i) =>
    i % 2 === 1 ? (
      <span key={`${keyPrefix}-${i}`} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    ),
  )
}

function renderText(text: string) {
  return text.split("||").map((seg, si) => (
    <span key={`seg${si}`}>
      {si > 0 && (
        <>
          <span className="md:hidden"> </span>
          <br className="hidden md:inline" />
        </>
      )}
      {renderNowrap(seg, `seg${si}`)}
    </span>
  ))
}

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  )
}

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

      {/* INTRO — 캐스크가 빚어내는 풍미의 세계 */}
      <section>
        <div className="max-w-[1080px] mx-auto px-5 md:px-10 pt-20 md:pt-28 pb-16 md:pb-20">
          <Reveal>
            <h2 className="text-[clamp(24px,3.6vw,40px)] font-extrabold leading-[1.35] break-keep mb-14 md:mb-20">
              {a.introTitle}
            </h2>
          </Reveal>

          <div className="space-y-10 md:space-y-14 max-w-[820px]">
            {a.introItems.map((it, i) => (
              <Reveal key={it.heading} delay={i * 0.08}>
                <div>
                  <h3 className="text-[20px] md:text-[24px] font-bold mb-3 break-keep">{it.heading}</h3>
                  <p className="text-[#555] text-[15px] md:text-[17px] leading-[1.9] break-keep text-pretty">
                    {renderText(it.body)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* VALUE — 캐스크 카니발만의 고유한 가치 */}
      <section className="bg-[#faf8f6]">
        <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-16 md:py-24">
          <Reveal>
            <h2 className="text-[clamp(24px,3.4vw,38px)] font-extrabold leading-[1.35] break-keep mb-12 md:mb-16">
              {a.valueTitle}
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 md:gap-x-16 gap-y-10 md:gap-y-14">
            {a.valueItems.map((it, i) => (
              <Reveal key={it.heading} delay={i * 0.08}>
                <div>
                  <h3 className="flex items-start gap-2.5 text-[19px] md:text-[23px] font-bold mb-3 break-keep">
                    <span className="mt-[10px] w-2 h-2 rounded-full bg-[#7d0b1c] shrink-0" />
                    <span>{it.heading}</span>
                  </h3>
                  <p className="text-[#555] text-[15px] md:text-[17px] leading-[1.9] break-keep text-pretty pl-[18px]">
                    {renderText(it.body)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 2025 RECAP */}
      <section className="bg-[#ea5514] text-white">
        <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-16 md:py-24">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-10">
              <div className="md:flex-1">
                <h2 className="text-[clamp(26px,3vw,36px)] font-extrabold mb-4">{a.recapTitle}</h2>
                <p className="text-white/90 text-[16px] md:text-[17px] break-keep">{a.recapBody1}</p>
                <p className="text-white/90 text-[16px] md:text-[17px] break-keep">{a.recapBody2}</p>
              </div>
              <Link
                href={`/2025${qs}`}
                className="shrink-0 text-white text-[18px] md:text-[22px] font-bold underline decoration-2 underline-offset-[6px] hover:decoration-[3px] transition-all"
              >
                {a.recapBtn}
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 mt-12 pt-10 border-t border-white/25">
            {a.recapStats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <div className="text-center">
                  <div className="text-[clamp(34px,5vw,52px)] font-extrabold leading-none">{s.value}</div>
                  <div className="text-white/85 text-[13px] md:text-[15px] mt-2.5 break-keep">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 2026 FORECAST */}
      <section>
        <div className="max-w-[1000px] mx-auto px-5 md:px-10 py-16 md:py-24">
          <Reveal>
            <h2 className="text-[clamp(24px,3.4vw,38px)] font-extrabold text-center mb-12 md:mb-16">{a.forecastTitle}</h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12 max-w-[920px] mx-auto">
            {a.forecastStats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <div className="text-center">
                  <div className="text-[clamp(34px,5vw,54px)] font-extrabold text-[#7d0b1c] leading-none">{s.value}</div>
                  <div className="text-[#666] text-[14px] md:text-[16px] mt-3 break-keep">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* OVERVIEW — 개요(맨 아래) */}
      <section className="bg-[#faf8f6]">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 py-16 md:py-24">
          <Reveal>
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
          </Reveal>
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
