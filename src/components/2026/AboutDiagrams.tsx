"use client"

// 행사 소개용 SVG 다이어그램 (도형/벤다이어그램/도식)
// 라벨은 lang에 따라 한/영 표시.

const BURGUNDY = "#7d0b1c"

type Lang = "ko" | "en"

// 숙성 원리: 시간 + 오크 → 풍미
export function MaturationDiagram({ lang }: { lang: Lang }) {
  const t =
    lang === "ko"
      ? { time: "시간", oak: "오크통", flavor: "풍미", caption: "시간과 나무가 만나 풍미가 된다" }
      : { time: "Time", oak: "Oak Cask", flavor: "Flavor", caption: "Time and wood become flavor" }

  return (
    <figure className="w-full">
      <svg viewBox="0 0 460 150" className="w-full h-auto" role="img" aria-label={t.caption}>
        {/* node 1 */}
        <circle cx="70" cy="62" r="46" fill={BURGUNDY} fillOpacity="0.07" stroke={BURGUNDY} strokeOpacity="0.4" />
        <text x="70" y="68" textAnchor="middle" fontSize="17" fontWeight="700" fill={BURGUNDY}>
          {t.time}
        </text>
        {/* plus */}
        <text x="168" y="69" textAnchor="middle" fontSize="26" fill="#bbb">
          +
        </text>
        {/* node 2 */}
        <circle cx="230" cy="62" r="46" fill={BURGUNDY} fillOpacity="0.07" stroke={BURGUNDY} strokeOpacity="0.4" />
        <text x="230" y="68" textAnchor="middle" fontSize="17" fontWeight="700" fill={BURGUNDY}>
          {t.oak}
        </text>
        {/* arrow */}
        <line x1="300" y1="62" x2="346" y2="62" stroke="#bbb" strokeWidth="2" />
        <path d="M346 56 L358 62 L346 68 Z" fill="#bbb" />
        {/* node 3 (result) */}
        <circle cx="404" cy="62" r="48" fill={BURGUNDY} />
        <text x="404" y="69" textAnchor="middle" fontSize="18" fontWeight="800" fill="#fff">
          {t.flavor}
        </text>
      </svg>
      <figcaption className="text-center text-[13px] text-[#888] mt-3 break-keep">{t.caption}</figcaption>
    </figure>
  )
}

// 벤다이어그램: 증류주 / 숙성 소주 / 스페셜티 커피 → CASK 에서 만남
export function CaskVenn({ lang }: { lang: Lang }) {
  const t =
    lang === "ko"
      ? {
          a: "위스키·럼·브랜디",
          b: "숙성 소주",
          c: "스페셜티 커피",
          caption: "서로 다른 장르가 '캐스크'에서 만납니다",
        }
      : {
          a: "Whisky·Rum·Brandy",
          b: "Aged Soju",
          c: "Specialty Coffee",
          caption: "Different genres meet at the cask",
        }

  return (
    <figure className="w-full">
      <svg viewBox="0 0 360 330" className="w-full h-auto max-w-[420px] mx-auto" role="img" aria-label={t.caption}>
        <g fill={BURGUNDY} fillOpacity="0.12" stroke={BURGUNDY} strokeOpacity="0.45">
          <circle cx="140" cy="135" r="95" />
          <circle cx="220" cy="135" r="95" />
          <circle cx="180" cy="205" r="95" />
        </g>
        {/* center */}
        <text x="180" y="166" textAnchor="middle" fontSize="22" fontWeight="800" fill={BURGUNDY}>
          CASK
        </text>
        {/* labels */}
        <text x="104" y="70" textAnchor="middle" fontSize="13" fontWeight="700" fill="#3f3f3f">
          {t.a}
        </text>
        <text x="256" y="70" textAnchor="middle" fontSize="13" fontWeight="700" fill="#3f3f3f">
          {t.b}
        </text>
        <text x="180" y="300" textAnchor="middle" fontSize="13" fontWeight="700" fill="#3f3f3f">
          {t.c}
        </text>
      </svg>
      <figcaption className="text-center text-[13px] text-[#888] mt-3 break-keep">{t.caption}</figcaption>
    </figure>
  )
}
