"use client"

import { BOOTH_FORM_2026 } from "@/i18n/content2026"
import { useContent2026 } from "@/i18n/useContent2026"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

const TASTING_NOTES = [
  { icon: "🍇", en: "Dried Fruits", ko: "건과일" },
  { icon: "🌰", en: "Walnut", ko: "호두" },
  { icon: "🍫", en: "Dark Chocolate", ko: "다크 초콜릿" },
  { icon: "🍃", en: "Leather & Tobacco", ko: "가죽 & 담뱃잎" },
  { icon: "🍊", en: "Orange Peel", ko: "오렌지 필" },
]

const CATEGORIES: Record<"ko" | "en", string[]> = {
  ko: ["주류", "독립병입", "주류 용품", "푸드", "비즈니스", "미디어"],
  en: ["Spirits", "Bottlers", "Barware & Goods", "Food", "Business", "Media"],
}

function HomeContent() {
  const { c, lang } = useContent2026()
  const searchParams = useSearchParams()
  const qs = searchParams.get("lang") ? `?lang=${searchParams.get("lang")}` : ""

  return (
    <div className="bg-white text-[#1a1a1a]">
      {/* HERO */}
      <section className="relative h-screen min-h-[600px] overflow-hidden bg-[#07050a] flex items-end justify-center text-center text-white">
        <iframe
          src="/2026/hero-scene.html"
          title="Cask Carnival"
          loading="eager"
          scrolling="no"
          className="absolute inset-0 w-full h-full border-0 pointer-events-none"
        />
        <div className="relative z-10 px-6 pb-28 flex flex-col items-center">
          <div className="w-[540px] max-w-[80vw] h-px bg-white/40 mb-10" />
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 font-semibold text-[22px] md:text-[30px]">
            <span>{c.hero.date}</span>
            <span className="hidden md:inline text-white/45 font-light">|</span>
            <span>{c.hero.place}</span>
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-5 mt-9 w-full md:w-auto">
            <a
              href="https://www.caskcarnival.com/2025"
              className="border border-white/70 rounded px-7 py-3.5 text-[15px] font-semibold hover:bg-white hover:text-[#1a1a1a] transition-colors"
            >
              {c.hero.recap}
            </a>
            <a
              href={BOOTH_FORM_2026[lang]}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#7d0b1c] hover:bg-[#5e0816] rounded px-7 py-3.5 text-[15px] font-semibold transition-colors"
            >
              {c.hero.booth}
            </a>
          </div>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-6 z-20 flex flex-col items-center gap-1.5 text-white/75 text-[11px] tracking-[2.5px] font-semibold pointer-events-none">
          <span>{c.hero.scroll}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 animate-bounce">
            <path d="M12 5v14M6 13l6 6 6-6" />
          </svg>
        </div>
      </section>

      {/* ABOUT TEASER */}
      <section className="relative overflow-hidden flex items-center md:min-h-screen py-16 md:py-24">
        <div
          className="hidden md:block absolute right-[-40px] top-1/2 -translate-y-1/2 w-[clamp(260px,42vw,640px)] opacity-[0.08] pointer-events-none select-none"
          style={{
            WebkitMaskImage: "linear-gradient(105deg, transparent 0%, #000 62%)",
            maskImage: "linear-gradient(105deg, transparent 0%, #000 62%)",
          }}
        >
          <Image src="/2026/logo_background.png" alt="" width={601} height={706} className="w-full h-auto" />
        </div>
        <div className="relative max-w-[1440px] mx-auto px-5 md:px-10 w-full">
          <Image src="/2026/logo-nav-dark.svg" alt="Cask Carnival" width={480} height={96} className="w-[clamp(260px,34vw,480px)] h-auto mb-[clamp(24px,2.8vw,44px)]" />
          <p className="uppercase text-[#7d0b1c] font-extrabold tracking-tight leading-[1.15] text-[clamp(20px,2.4vw,30px)] mb-[clamp(28px,4.5vw,60px)]">{c.teaser.catch}</p>
          <h2 className="text-[clamp(24px,3vw,36px)] font-extrabold leading-[1.45] mb-[clamp(22px,3.6vw,44px)]">
            {c.teaser.lead1}
            <br />
            {c.teaser.lead2}
          </h2>
          <p className="text-[#555] text-[clamp(16px,1.2vw,18px)] leading-[1.9] max-w-[760px] break-keep text-pretty">{c.teaser.body1}</p>
          <p className="text-[#555] text-[clamp(16px,1.2vw,18px)] leading-[1.9] max-w-[760px] mt-3 break-keep text-pretty">{c.teaser.body2}</p>
          <Link href={`/about${qs}`} className="inline-block mt-9 text-[#7d0b1c] font-bold border-b-2 border-[#7d0b1c] pb-1.5">
            {c.teaser.more}
          </Link>
        </div>
      </section>

      {/* OLOROSO THEME BAND — 편지지 느낌(흰 배경 + 사각 테두리) */}
      <section className="bg-white">
        <div className="max-w-[1180px] mx-auto px-5 md:px-10 py-20 md:py-32">
          <div className="border border-[#7d0b1c]/35 rounded-lg px-6 md:px-20 py-16 md:py-24 text-center text-[#1a1a1a]">
            <p className="tracking-[3px] text-[14px] text-[#7d0b1c] mb-4">{c.themeBand.eyebrow}</p>
            <h2 className="text-[clamp(34px,7vw,64px)] font-extrabold leading-tight">{c.themeBand.title}</h2>
            <div className="w-[clamp(180px,40vw,760px)] h-px bg-[#7d0b1c]/30 mx-auto my-9" />
            <p className="text-[#444] max-w-[860px] mx-auto leading-[1.85] text-[clamp(16px,1.4vw,18px)] break-keep text-pretty">{c.themeBand.desc1}</p>
            <p className="text-[#444] max-w-[860px] mx-auto leading-[1.85] text-[clamp(16px,1.4vw,18px)] mt-3 break-keep text-pretty">{c.themeBand.desc2}</p>
            <p className="text-[#444] max-w-[860px] mx-auto leading-[1.85] text-[clamp(16px,1.4vw,18px)] mt-3 break-keep text-pretty">{c.themeBand.desc3}</p>
            <p className="tracking-[6px] text-[#7d0b1c] font-semibold mt-14 mb-10 text-[16px]">{c.themeBand.notesTitle}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 max-w-[920px] mx-auto">
              {TASTING_NOTES.map((n) => (
                <div key={n.en} className="flex flex-col items-center gap-1.5">
                  <div className="text-[34px]">{n.icon}</div>
                  <div className="text-[15px] font-semibold">{n.en}</div>
                  <div className="text-[14px] text-[#888]">{n.ko}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MASTER CLASS TEASER — Coming Soon 박스(프로그램 페이지와 동일 디자인) */}
      <section className="py-20 md:py-24 text-center border-t border-black/10">
        <div className="max-w-[1100px] mx-auto px-5 md:px-10">
          <h2 className="text-[clamp(24px,4vw,32px)] font-extrabold mb-9">{c.masterclass.title}</h2>
          <div className="border border-[#7d0b1c]/30 rounded-xl py-16 md:py-24 px-6 bg-[#faf8f6]">
            <p className="text-[#7d0b1c] tracking-[2px] text-[13px] font-semibold">{c.programP.comingEyebrow}</p>
            <h3 className="text-[clamp(22px,4vw,28px)] font-extrabold mt-4">{c.programP.comingTitle}</h3>
            <p className="text-[#888] mt-3">{c.programP.comingBody}</p>
          </div>
        </div>
      </section>

      {/* EXHIBITOR TEASER */}
      <section className="bg-white py-20 md:py-28 border-t border-black/10">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10">
          <h2 className="text-[clamp(26px,4vw,40px)] font-extrabold mb-8">{c.exhibitor.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 border-t border-black/10">
            {[
              [c.exhibitor.infoEvent, c.exhibitor.infoEventV],
              [c.exhibitor.infoDate, c.exhibitor.infoDateV],
              [c.exhibitor.infoVenue, c.exhibitor.infoVenueV],
              [c.exhibitor.infoHost, c.exhibitor.infoHostV],
            ].map(([k, v]) => (
              <div key={k} className="py-5 border-b border-black/10">
                <dt className="text-[13px] text-[#999]">{k}</dt>
                <dd className="text-[16px] font-semibold mt-1">{v}</dd>
              </div>
            ))}
          </div>

          <h3 className="text-[20px] font-bold mt-12 mb-5">{c.exhibitor.catsTitle}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATEGORIES[lang].map((name) => (
              <div key={name} className="border border-black/10 rounded-lg px-5 py-4 bg-white font-semibold">
                {name}
              </div>
            ))}
          </div>

          {/* 얼리버드 할인 배너 */}
          <div className="mt-10 rounded-lg bg-gradient-to-br from-[#8a0f20] to-[#5e0816] text-white px-6 md:px-10 py-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <span className="inline-block text-[12px] font-semibold tracking-wide bg-white/15 rounded px-2.5 py-1">{c.exhibitor.ebTag}</span>
              <h3 className="text-[20px] md:text-[24px] font-extrabold mt-3">{c.exhibitor.ebTitle}</h3>
              <p className="text-white/80 text-[14px] mt-1.5">{c.exhibitor.ebBody}</p>
            </div>
            <div className="text-center md:text-right shrink-0">
              <small className="block text-white/70 text-[12px] tracking-wide">{c.exhibitor.ebUpto}</small>
              <strong className="text-[34px] md:text-[40px] font-extrabold text-white">{c.exhibitor.ebOff}</strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-10">
            <Link href={`/register${qs}`} className="border border-[#7d0b1c] text-[#7d0b1c] rounded px-7 py-3.5 font-semibold text-center hover:bg-[#7d0b1c] hover:text-white transition-colors">
              {c.exhibitor.moreBtn}
            </Link>
            <a href={BOOTH_FORM_2026[lang]} target="_blank" rel="noopener noreferrer" className="bg-[#7d0b1c] hover:bg-[#5e0816] text-white rounded px-7 py-3.5 font-semibold text-center transition-colors">
              {c.exhibitor.applyBtn}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function Home2026() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  )
}
