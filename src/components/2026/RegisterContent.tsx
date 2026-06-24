"use client"

import { BOOTH_FORM_2026, BROCHURE_2026 } from "@/i18n/content2026"
import { useContent2026 } from "@/i18n/useContent2026"
import Image from "next/image"
import { Suspense } from "react"
import PageHeader2026 from "./PageHeader2026"

function Inner() {
  const { c, lang } = useContent2026()
  const r = c.registerP

  return (
    <div className="bg-white text-[#1a1a1a]">
      <PageHeader2026 title={r.title} subtitle={r.subtitle} watermark="REGISTER" />

      <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-14 md:py-20">
        {/* TITLE ROW */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-center md:text-left border-b border-black/10 pb-6">
          <h2 className="text-[22px] md:text-[26px] font-extrabold">Cask Carnival 2026</h2>
          <a
            href={BROCHURE_2026[lang]}
            download
            className="self-center border border-black/15 rounded px-6 py-3 font-semibold text-[15px] hover:border-[#7d0b1c] hover:text-[#7d0b1c] transition-colors"
          >
            {r.brochureBtn}
          </a>
        </div>

        {/* CTA */}
        <div className="text-center pt-12 md:pt-16 pb-7 md:pb-9">
          <h2 className="text-[clamp(20px,3vw,26px)] font-semibold">
            {r.ctaTitle}
            <span className="block text-[#7d0b1c] mt-1.5">{r.ctaHl}</span>
          </h2>
          <a
            href={BOOTH_FORM_2026[lang]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-8 bg-[#7d0b1c] hover:bg-[#5e0816] text-white rounded px-8 py-3.5 font-semibold transition-colors"
          >
            {r.applyBtn}
          </a>
        </div>

        {/* PROCESS */}
        <Block title={r.processTitle}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {r.process.map((s, i) => (
              <div
                key={s.n}
                className={`rounded-md border p-5 md:p-6 ${
                  i === r.process.length - 1 ? "bg-[#7d0b1c] text-white border-[#7d0b1c]" : "border-black/10"
                }`}
              >
                <div className={`text-[22px] font-extrabold ${i === r.process.length - 1 ? "text-white" : "text-[#7d0b1c]"}`}>{s.n}</div>
                <h4 className="font-bold mt-2">{s.title}</h4>
                <small className={i === r.process.length - 1 ? "text-white/80" : "text-[#888]"}>{s.desc}</small>
              </div>
            ))}
          </div>
        </Block>

        {/* FORECAST */}
        <Block title={r.forecastTitle}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {r.forecast.map((f) => (
              <div key={f.title} className="rounded-md border border-black/10 border-t-[3px] border-t-[#7d0b1c] p-6">
                <div className="text-[34px] font-extrabold">{f.big}</div>
                <h4 className="font-bold mt-1">{f.title}</h4>
                <small className="text-[#888]">{f.desc}</small>
              </div>
            ))}
          </div>
        </Block>

        {/* BOOTH PACKAGE */}
        <Block title={r.boothTitle}>
          <div className="grid grid-cols-1 md:grid-cols-3 bg-[#7d0b1c] text-white rounded-md overflow-hidden">
            <div className="p-7 md:p-8">
              <div className="text-[32px] font-extrabold">{r.boothSize}</div>
              <div className="text-white/60 line-through mt-3 text-[14px]">{r.boothWas}</div>
              <div className="text-[32px] font-extrabold">{r.boothNow}</div>
              <div className="text-white/70 text-[13px]">{r.boothVat}</div>
              <span className="inline-block mt-3 text-[12px] bg-white/15 rounded px-2 py-1">{r.boothTag}</span>
            </div>
            <div className="p-7 md:p-8 border-t md:border-t-0 md:border-l border-white/15 text-center">
              <Image src="/2026/booth-render.png" alt="booth" width={408} height={220} className="w-full h-auto rounded" />
              <p className="text-white/70 text-[13px] mt-4">{r.boothImgNote}</p>
            </div>
            <div className="p-7 md:p-8 border-t md:border-t-0 md:border-l border-white/15">
              <ul className="space-y-3">
                {r.boothIncludes.map((b) => (
                  <li key={b.label} className="flex justify-between gap-3 text-[14px]">
                    <strong className="font-semibold">{b.label}</strong>
                    <span className="text-white/75">{b.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Block>

        {/* CATEGORIES */}
        <Block title={r.catsTitle}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {r.cats.map((cat) => (
              <div key={cat.name} className="border border-black/10 rounded-lg px-5 py-4 bg-white">
                <strong className="block">{cat.name}</strong>
                <p className="text-[#888] text-[13px] mt-1 hidden md:block">{cat.desc}</p>
              </div>
            ))}
          </div>
        </Block>

        {/* CONTACT */}
        <div className="text-center border-t border-black/10 mt-16 pt-12">
          <p className="text-[#888]">{r.contactNote}</p>
          <h3 className="text-[26px] md:text-[30px] font-extrabold mt-6 mb-5">{r.contactOffice}</h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-10 text-[16px] md:text-[18px]">
            <span>✉ caskcarnival@whiskynavi.com</span>
            <span>☎ 010-3351-6231</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-14 md:mt-16">
      <h2 className="text-[clamp(20px,3vw,28px)] font-extrabold mb-6">{title}</h2>
      {children}
    </div>
  )
}

export default function RegisterContent() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  )
}
