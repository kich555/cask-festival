"use client"

import { motion } from "framer-motion"
import { Award, Globe2, GraduationCap, Target } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { useContent2026 } from "@/i18n/useContent2026"
import PageHeader2026 from "./PageHeader2026"

// **bold** 마커를 <strong>으로 렌더링
function renderBold(text: string) {
  return text.split("**").map((part, i) =>
    i % 2 === 1 ? (
      <strong key={`b${i}`} className="font-bold text-[#1a1a1a]">
        {part}
      </strong>
    ) : (
      part
    ),
  )
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

      {/* INTRO — 취지 (좌측 정렬 + 디자인 요소) */}
      <section className="relative overflow-hidden">
        {/* 배경 워터마크 로고 (은은한 그라데이션) */}
        <div
          className="hidden md:block absolute right-[-60px] top-1/2 -translate-y-1/2 w-[clamp(280px,40vw,560px)] opacity-[0.05] pointer-events-none select-none"
          style={{
            WebkitMaskImage: "linear-gradient(105deg, transparent 0%, #000 65%)",
            maskImage: "linear-gradient(105deg, transparent 0%, #000 65%)",
          }}
        >
          <Image src="/2026/logo_background.png" alt="" width={601} height={706} className="w-full h-auto" />
        </div>

        <div className="relative max-w-[940px] mx-auto px-5 md:px-10 pt-20 md:pt-28 pb-16 md:pb-24">
          <Reveal>
            <div className="flex items-start gap-4 md:gap-5">
              <span className="mt-1.5 md:mt-2 w-[5px] h-[clamp(42px,5vw,64px)] bg-[#7d0b1c] rounded-full shrink-0" />
              <h2 className="text-[clamp(20px,2.7vw,34px)] font-extrabold leading-[1.4] break-keep">
                {a.introTagline}
              </h2>
            </div>
            <div className="mt-9 md:mt-12 md:pl-9 max-w-[660px] space-y-5">
              <p className="text-[#3f3f3f] text-[clamp(15px,1.3vw,18px)] leading-[1.95] break-keep text-balance">
                {renderBold(a.introBody1)}
              </p>
              <p className="text-[#3f3f3f] text-[clamp(15px,1.3vw,18px)] leading-[1.95] break-keep text-balance">
                {renderBold(a.introBody2)}
              </p>
              <p className="text-[#3f3f3f] text-[clamp(15px,1.3vw,18px)] leading-[1.95] break-keep text-balance">
                {renderBold(a.introBody3)}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* WHY — 특장점 (에디토리얼 리스트) */}
      <section className="border-t border-black/10">
        <div className="max-w-[960px] mx-auto px-5 md:px-10 py-16 md:py-24">
          <Reveal>
            <h2 className="text-[clamp(24px,3.4vw,38px)] font-extrabold mb-10 md:mb-14">{a.whyTitle}</h2>
          </Reveal>
          <div className="divide-y divide-black/10">
            {a.why.map((w, i) => {
              const Icon = [Target, Globe2, GraduationCap, Award][i] ?? Target
              return (
                <Reveal key={w.title} delay={i * 0.08}>
                  <div className="grid grid-cols-[auto_1fr] gap-5 md:gap-10 py-8 md:py-11">
                    <Icon className="w-9 h-9 md:w-12 md:h-12 text-[#7d0b1c] shrink-0 mt-1" strokeWidth={1.5} />
                    <div>
                      <h3 className="text-[20px] md:text-[26px] font-bold mb-2.5 break-keep">{w.title}</h3>
                      <p className="text-[#555] text-[16px] md:text-[18px] leading-[1.85] break-keep">{w.desc}</p>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* 2025 RECAP */}
      <section className="bg-[#ea5514] text-white">
        <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-16 md:py-24">
          <Reveal>
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
      <section className="border-t border-black/10">
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
      <section className="bg-[#faf8f6] border-t border-black/10">
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
