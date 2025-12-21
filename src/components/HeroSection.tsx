"use client"

import { useTranslation } from "@/i18n"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

const BOOTH_FORM_URLS = {
  ko: "https://docs.google.com/forms/d/18ud2j4nMUUmQyQIO93FdjSkRJqf3IQzO_o8q-GkDo3c/viewform",
  en: "https://docs.google.com/forms/d/1TQGlA3wSyL6dwzHIIs8bsgsJ11P_kWwrQFkauLfojWk/viewform",
}

function HeroContent() {
  const { t, lang } = useTranslation()
  const searchParams = useSearchParams()
  const langParam = searchParams.get("lang")
  const link2025 = langParam ? `/2025?lang=${langParam}` : "/2025"
  const boothFormUrl = BOOTH_FORM_URLS[lang]

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center mt-[40px]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero.png')" }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
        radial-gradient(circle at top left, rgba(18,18,18,0.6) 0px, transparent 42px),
        radial-gradient(circle at top right, rgba(18,18,18,0.6) 0px, transparent 42px),
        radial-gradient(circle at bottom left, rgba(18,18,18,0.6) 0px, transparent 42px),
        radial-gradient(circle at bottom right, rgba(18,18,18,0.6) 0px, transparent 42px),
        linear-gradient(to right, rgba(18,18,18,0.6) 0px, transparent 42px, transparent calc(100% - 42px), rgba(18,18,18,0.6) 100%),
        linear-gradient(to bottom, rgba(18,18,18,0.6) 0px, transparent 42px, transparent calc(100% - 42px), rgba(18,18,18,0.6) 100%)
      `,
        }}
      />

      <div className="relative z-10 text-center px-4">
        <div>
          <Image
            src="/hero-icon.png"
            alt="logo"
            width={236}
            height={278}
            className="mx-auto mb-6 md:mb-8 w-[153px] h-[180px] md:w-[236px] md:h-[278px]"
          />
        </div>

        <h2 className="text-[28px] md:text-[48px] mt-[42px] font-extrabold text-[#ea5514] leading-tight">
          {t.hero.coming}
        </h2>

        <div className="text-[24px] md:text-[40px] font-semibold text-white mt-[36px]">
          <p>{t.hero.date}</p>
          <p>{t.hero.venue}</p>
          <p className="text-[16px] md:text-[25px] text-gray-400">{t.hero.address}</p>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-4 md:space-x-8 text-[24px] md:text-[35px] font-semibold mt-[42px]">
          <div className="flex justify-center gap-7">
            <div className="flex items-center justify-center gap-4">
              <Link href={link2025} className="text-[#ea5514]">
                {t.hero.check2025}
              </Link>
              |
              <a
                href={boothFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ea5514]"
              >
                {t.hero.applyBooth}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HeroSection() {
  return (
    <Suspense fallback={null}>
      <HeroContent />
    </Suspense>
  )
}
