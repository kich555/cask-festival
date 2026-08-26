"use client"

import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { useContent2026 } from "@/i18n/useContent2026"

const TASTING_NOTES = [
  { icon: "🍇", en: "Dried Fruits", ko: "건과일" },
  { icon: "🌰", en: "Walnut", ko: "호두" },
  { icon: "🍫", en: "Dark Chocolate", ko: "다크 초콜릿" },
  { icon: "🍃", en: "Leather & Tobacco", ko: "가죽 & 담뱃잎" },
  { icon: "🍊", en: "Orange Peel", ko: "오렌지 필" },
]

function HomeContent() {
  const { c, lang } = useContent2026()
  const searchParams = useSearchParams()
  const qs = searchParams.get("lang") ? `?lang=${searchParams.get("lang")}` : ""

  return (
    <div className="bg-white text-[#1a1a1a]">
      {/* HERO */}
      <section className="relative h-screen min-h-[600px] overflow-hidden bg-[#07050a] flex items-end justify-center text-center text-white">
        <iframe
          src="/2026/hero-scene.html?v=7"
          title="Cask Carnival"
          loading="eager"
          scrolling="no"
          className="absolute inset-0 w-full h-full border-0 pointer-events-none"
        />
        <div className="relative z-10 px-6 pb-28 flex flex-col items-center">
          <div className="hidden md:block w-[540px] max-w-[80vw] h-px bg-white/40 mb-4" />
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 font-semibold text-[22px] md:text-[30px]">
            <span>{c.hero.date}</span>
            <span className="hidden md:inline text-white/45 font-light">|</span>
            <span>{c.hero.place}</span>
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-5 mt-9 w-full md:w-auto">
            <a
              href="https://nol.yanolja.com/ticket/products/26012544"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-[#1a1a1a] rounded px-7 py-3.5 text-[18px] font-bold hover:bg-white/85 transition-colors"
            >
              {c.hero.buyTicket}
            </a>
            <a
              href="https://world.nol.com/en/ticket/places/26001036/products/26012544"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#7d0b1c] hover:bg-[#5e0816] rounded px-7 py-3.5 text-[18px] font-bold transition-colors"
            >
              {c.hero.globalTicket}
            </a>
          </div>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-6 z-20 flex flex-col items-center gap-1.5 text-white/75 text-[11px] tracking-[2.5px] font-semibold pointer-events-none">
          <span>{c.hero.scroll}</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 animate-bounce"
          >
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
          <Image
            src="/2026/logo_background.png"
            alt=""
            width={601}
            height={706}
            className="w-full h-auto"
          />
        </div>
        <div className="relative max-w-[1440px] mx-auto px-5 md:px-10 w-full">
          <Image
            src="/2026/logo-nav-dark.svg"
            alt="Cask Carnival"
            width={480}
            height={96}
            className="w-[clamp(260px,34vw,480px)] h-auto mb-[clamp(24px,2.8vw,44px)]"
          />
          <p className="uppercase text-[#7d0b1c] font-extrabold tracking-tight leading-[1.15] text-[clamp(20px,2.4vw,30px)] mb-[clamp(28px,4.5vw,60px)]">
            {c.teaser.catch}
          </p>
          <h2 className="text-[clamp(17px,3vw,36px)] font-extrabold leading-[1.5] mb-[clamp(22px,3.6vw,44px)] break-keep">
            {c.teaser.lead1}
            <br />
            {c.teaser.lead2}
          </h2>
          <p className="text-[#555] text-[clamp(16px,1.2vw,18px)] leading-[1.9] max-w-[760px] break-keep text-balance">
            {c.teaser.body1}
          </p>
          <p className="text-[#555] text-[clamp(16px,1.2vw,18px)] leading-[1.9] max-w-[760px] mt-3 break-keep text-balance">
            {c.teaser.body2}
          </p>
          <Link
            href={`/about${qs}`}
            className="inline-block mt-9 text-[#7d0b1c] font-bold border-b-2 border-[#7d0b1c] pb-1.5"
          >
            {c.teaser.more}
          </Link>
        </div>
      </section>

      {/* OLOROSO THEME BAND — 편지지 느낌(흰 배경 + 사각 테두리) */}
      <section className="bg-white">
        <div className="max-w-[1180px] mx-auto px-5 md:px-10 py-20 md:py-32">
          <div className="border border-[#7d0b1c]/35 rounded-lg px-6 md:px-20 py-16 md:py-24 text-center text-[#1a1a1a]">
            <p className="tracking-[3px] text-[14px] text-[#7d0b1c] mb-4">{c.themeBand.eyebrow}</p>
            <h2 className="text-[clamp(30px,5vw,46px)] font-extrabold leading-tight">
              {c.themeBand.title}
            </h2>
            <div className="w-[clamp(180px,40vw,760px)] h-px bg-[#7d0b1c]/30 mx-auto my-9" />
            <div className="max-w-[760px] mx-auto space-y-4">
              <p className="text-[#444] leading-[1.9] text-[clamp(15px,1.3vw,17px)] break-keep text-balance">
                {c.themeBand.desc1}
              </p>
              <p className="text-[#444] leading-[1.9] text-[clamp(15px,1.3vw,17px)] break-keep text-balance">
                {c.themeBand.desc2}
              </p>
              <p className="text-[#444] leading-[1.9] text-[clamp(15px,1.3vw,17px)] break-keep text-balance">
                {c.themeBand.desc3}
              </p>
            </div>
            <p className="tracking-[6px] text-[#7d0b1c] font-semibold mt-14 mb-10 text-[16px]">
              {c.themeBand.notesTitle}
            </p>
            <div className="grid grid-cols-5 gap-2 md:gap-6 max-w-[920px] mx-auto">
              {TASTING_NOTES.map((n) => (
                <div key={n.en} className="flex flex-col items-center gap-1 md:gap-1.5">
                  <div className="text-[22px] md:text-[34px]">{n.icon}</div>
                  <div className="text-[10px] md:text-[15px] font-semibold leading-tight break-keep">
                    {lang === "ko" ? n.ko : n.en}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MASTER CLASS TEASER — Coming Soon 박스(프로그램 페이지와 동일 디자인) */}
      <section className="py-20 md:py-24 text-center">
        <div className="max-w-[1100px] mx-auto px-5 md:px-10">
          <h2 className="text-[clamp(24px,4vw,32px)] font-extrabold mb-9">{c.masterclass.title}</h2>
          <div className="border border-[#7d0b1c]/30 rounded-xl py-16 md:py-24 px-6 bg-[#faf8f6]">
            <p className="text-[#7d0b1c] tracking-[2px] text-[13px] font-semibold">
              {c.programP.comingEyebrow}
            </p>
            <h3 className="text-[clamp(22px,4vw,28px)] font-extrabold mt-4">
              {c.programP.comingTitle}
            </h3>
            <p className="text-[#888] mt-3">{c.programP.comingBody}</p>
          </div>
        </div>
      </section>

      {/* EXHIBITOR TEASER */}
      <section className="bg-white py-20 md:py-28">
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

          <p className="text-center text-[16px] md:text-[18px] font-semibold mt-12 leading-relaxed">
            {c.exhibitor.closed}
          </p>

          <div className="flex justify-center mt-8">
            <Link
              href={`/register${qs}`}
              className="border border-[#7d0b1c] text-[#7d0b1c] rounded px-7 py-3.5 font-semibold text-center hover:bg-[#7d0b1c] hover:text-white transition-colors"
            >
              {c.exhibitor.moreBtn}
            </Link>
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
