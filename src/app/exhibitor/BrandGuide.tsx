// 자료실 브랜드 가이드: 전용 색상 · 전용 서체 · 로고 색상 조합

import { ASSET_BASE } from "./designAssetList"

const COLORS = [
  { hex: "#7D0B1C", rgb: "125, 11, 28", cmyk: "0, 91, 78, 51", light: false },
  { hex: "#231E20", rgb: "35, 30, 32", cmyk: "0, 14, 9, 86", light: false },
  { hex: "#F0C79C", rgb: "240, 199, 156", cmyk: "0, 17, 35, 6", light: true },
  { hex: "#F2F2F2", rgb: "242, 242, 242", cmyk: "0, 0, 0, 5", light: true },
]

/** 로고 조합: [배경, 로고색, 이름]. 흰색은 #F2F2F2 */
const USAGE = [
  ["#F2F2F2", "#7D0B1C", "Red on White"],
  ["#F2F2F2", "#231E20", "Black on White"],
  ["#231E20", "#F2F2F2", "White on Black"],
  ["#7D0B1C", "#F2F2F2", "White on Red"],
] as const

const [MAIN, ...SUBS] = COLORS
type Color = (typeof COLORS)[number]

function ColorInfo({ c, big = false }: { c: Color; big?: boolean }) {
  return (
    <div className={big ? "text-[15px] leading-relaxed" : "text-[13px] leading-snug"}>
      <p className={`font-extrabold select-all ${big ? "text-[26px] mb-2" : "text-[18px] mb-1"}`}>
        {c.hex}
      </p>
      <p>RGB {c.rgb}</p>
      <p>CMYK {c.cmyk}</p>
    </div>
  )
}

const FONT_URL = "https://corp.gmarket.com/fonts/"
const gm = { fontFamily: '"Gmarket Sans", sans-serif' }

/** 투명 PNG 로고를 마스크로 써서 원하는 색으로 칠한다 */
export function TintedLogo({
  color,
  className,
  variant = "circle",
}: {
  color: string
  className: string
  variant?: "circle" | "text"
}) {
  // 텍스트 로고는 2026-10 교체본(-v2). PNG는 1년 캐시라 교체 시 파일명을 바꾼다
  const file = variant === "text" ? "logo-text-black-v2.png" : "logo-circle-black.png"
  const mask = `url(${ASSET_BASE}/${file}) center / contain no-repeat`
  return (
    <span
      role="img"
      aria-label="캐스크 카니발 로고"
      className={`block aspect-[3104/2001] ${className}`}
      style={{ backgroundColor: color, mask, WebkitMask: mask }}
    />
  )
}

/** A4 가이드식 섹션 라벨: 영문 굵게 + 한글 작게, 아래 가는 선 */
export function SectionLabel({ en, ko }: { en: string; ko: string }) {
  return (
    <div className="mb-5">
      <h3 className="text-[20px] font-extrabold text-[#231E20]">
        {en} <span className="text-[13px] font-medium text-[#888] ml-1">{ko}</span>
      </h3>
      <hr className="mt-3 border-black/15" />
    </div>
  )
}

export default function BrandGuide() {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section>
          <SectionLabel en="Color System" ko="전용 색상" />
          <div className="grid grid-cols-[1.3fr_1fr] min-h-[330px]">
            <div className="flex flex-col justify-between p-5 bg-[#7D0B1C] text-white">
              <ColorInfo c={MAIN} big />
              <TintedLogo color="#F2F2F2" className="w-[110px] self-end" />
            </div>
            <div className="grid grid-rows-3">
              {SUBS.map((c) => (
                <div
                  key={c.hex}
                  className={`px-4 py-3 ${c.light ? "text-[#231E20]" : "text-white"}`}
                  style={{ backgroundColor: c.hex }}
                >
                  <ColorInfo c={c} />
                </div>
              ))}
            </div>
          </div>
          <p className="text-[12px] text-[#888] mt-3">
            CMYK는 RGB 기준 환산값입니다. 인쇄 시 교정 출력으로 색상을 확인해 주십시오.
          </p>
        </section>

        <section className="flex flex-col">
          <SectionLabel en="Typography" ko="전용 서체" />
          <div className="grid grid-cols-2 flex-1">
            {[
              { w: 700, name: "Gmarket Sans Bold", use: "제목 · 부스명 · 강조" },
              { w: 500, name: "Gmarket Sans Medium", use: "본문 · 안내 문구 · 가격표" },
            ].map((f, i) => (
              <div
                key={f.w}
                className={`flex flex-col ${i ? "border-l border-black/15 pl-6" : "pr-6"}`}
              >
                <p
                  className="text-[56px] leading-none text-[#7D0B1C]"
                  style={{ ...gm, fontWeight: f.w }}
                >
                  가 Aa
                </p>
                <p className="text-[15px] mt-4" style={{ ...gm, fontWeight: f.w }}>
                  {f.name}
                </p>
                <p
                  className="text-[14px] mt-2 leading-relaxed text-[#444]"
                  style={{ ...gm, fontWeight: f.w }}
                >
                  캐스크 카니발 2026
                  <br />
                  CASK CARNIVAL 2026
                </p>
                <p className="text-[12px] text-[#888] mt-auto pt-4">{f.use}</p>
              </div>
            ))}
          </div>
          <a
            href={FONT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-center justify-center gap-2 border border-black/25 rounded px-5 py-3 text-[14px] font-bold hover:border-black"
          >
            G마켓 산스 무료 다운로드 ↗
          </a>
        </section>
      </div>

      <section>
        <SectionLabel en="Color Usage" ko="로고 색상 조합" />
        <div className="grid grid-cols-2 lg:grid-cols-4 border border-black/10">
          {USAGE.map(([bg, fg, name]) => (
            <div
              key={name}
              className="relative h-[150px] flex items-center justify-center"
              style={{ backgroundColor: bg }}
            >
              <TintedLogo color={fg} className="w-[140px]" />
              <span
                className="absolute left-3 bottom-2.5 text-[11px] opacity-70"
                style={{ color: fg }}
              >
                {name}
              </span>
            </div>
          ))}
        </div>
        <ul className="mt-4 text-[13px] text-[#666] space-y-1 list-disc pl-5">
          <li>로고의 비율·형태를 변형하거나 회전하지 마십시오.</li>
          <li>로고는 위 조합의 전용 색상으로만 사용해 주십시오.</li>
        </ul>
      </section>
    </>
  )
}
