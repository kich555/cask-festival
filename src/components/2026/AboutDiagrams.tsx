"use client"

import { motion } from "framer-motion"

// 행사 정체성 벤다이어그램: 글로벌 박람회 + 캐스크 숙성주 + 비즈니스 플랫폼 → 캐스크 카니발
const BURGUNDY = "#7d0b1c"

type Lang = "ko" | "en"

export function CaskVenn({ lang }: { lang: Lang }) {
  const t =
    lang === "ko"
      ? {
          a: "글로벌 주류 박람회",
          b: "캐스크 숙성주",
          c: "비즈니스 플랫폼",
          caption: "세 가지가 만나는 단 하나의 무대, 캐스크 카니발",
        }
      : {
          a: "Global Drinks Expo",
          b: "Cask-Aged Drinks",
          c: "Business Platform",
          caption: "Where the three meet — Cask Carnival",
        }

  const circle = {
    initial: { scale: 0.85, opacity: 0 },
    whileInView: { scale: 1, opacity: 1 },
  }

  return (
    <figure className="w-full">
      <svg viewBox="0 0 460 420" className="w-full h-auto max-w-[520px] mx-auto" role="img" aria-label={t.caption}>
        <title>{t.caption}</title>
        <motion.g
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.12 }}
          fill={BURGUNDY}
          stroke={BURGUNDY}
          strokeOpacity="0.4"
          style={{ mixBlendMode: "multiply" }}
        >
          <motion.circle variants={circle} transition={{ duration: 0.5, ease: "easeOut" }} cx="180" cy="185" r="125" fillOpacity="0.08" />
          <motion.circle variants={circle} transition={{ duration: 0.5, ease: "easeOut" }} cx="280" cy="185" r="125" fillOpacity="0.08" />
          <motion.circle variants={circle} transition={{ duration: 0.5, ease: "easeOut" }} cx="230" cy="275" r="125" fillOpacity="0.08" />
        </motion.g>

        {/* 라벨 */}
        <text x="120" y="95" textAnchor="middle" fontSize="14" fontWeight="700" fill="#2a2a2a">
          {t.a}
        </text>
        <text x="340" y="95" textAnchor="middle" fontSize="14" fontWeight="700" fill="#2a2a2a">
          {t.b}
        </text>
        <text x="230" y="392" textAnchor="middle" fontSize="14" fontWeight="700" fill="#2a2a2a">
          {t.c}
        </text>

        {/* 가운데 캐스크 카니발 로고 */}
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <rect x="148" y="208" width="164" height="52" rx="26" fill="#fff" stroke={BURGUNDY} strokeOpacity="0.2" />
          <image href="/2026/logo-nav-dark.svg" x="166" y="222" width="128" height="24" preserveAspectRatio="xMidYMid meet" />
        </motion.g>
      </svg>
      <figcaption className="text-center text-[13px] text-[#888] mt-4 break-keep">{t.caption}</figcaption>
    </figure>
  )
}
