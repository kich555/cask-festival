// 자료실 브랜드 가이드: 전용 색상 · 전용 서체 · 로고 색상 조합

import { ASSET_BASE } from "./designAssetList"
import { cardCls } from "./exhibitorParts"

const COLORS = [
  { name: "Cask Red", hex: "#7D0B1C", rgb: "125, 11, 28", cmyk: "0, 91, 78, 51", light: false },
  { name: "Ink Black", hex: "#231E20", rgb: "35, 30, 32", cmyk: "0, 14, 9, 86", light: false },
  { name: "Sand", hex: "#F0C79C", rgb: "240, 199, 156", cmyk: "0, 17, 35, 6", light: true },
  { name: "Paper", hex: "#F2F2F2", rgb: "242, 242, 242", cmyk: "0, 0, 0, 5", light: true },
]

/** 로고 조합: [배경, 로고색, 이름] */
const USAGE = [
  ["#FFFFFF", "#7D0B1C", "Red on White"],
  ["#FFFFFF", "#231E20", "Black on White"],
  ["#F2F2F2", "#7D0B1C", "Red on Paper"],
  ["#231E20", "#FFFFFF", "White on Black"],
  ["#7D0B1C", "#FFFFFF", "White on Red"],
  ["#F0C79C", "#7D0B1C", "Red on Sand"],
] as const

const FONT_URL = "https://corp.gmarket.com/fonts/"
const gm = { fontFamily: '"Gmarket Sans", sans-serif' }

/** 투명 PNG 로고를 마스크로 써서 원하는 색으로 칠한다 */
function TintedLogo({ color, className }: { color: string; className: string }) {
  const mask = `url(${ASSET_BASE}/logo-circle-black.png) center / contain no-repeat`
  return (
    <span
      role="img"
      aria-label="캐스크 카니발 로고"
      className={`block aspect-[3104/2001] ${className}`}
      style={{ backgroundColor: color, mask, WebkitMask: mask }}
    />
  )
}

function Title({ title, sub }: { title: string; sub: string }) {
  return (
    <h3 className="text-[16px] font-extrabold mb-4">
      {title} <span className="text-[13px] font-medium text-[#888] ml-1">{sub}</span>
    </h3>
  )
}

export default function BrandGuide() {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className={cardCls}>
          <Title title="전용 색상" sub="Color System" />
          <div className="grid grid-cols-2 gap-3">
            {COLORS.map((c) => (
              <div key={c.hex} className="rounded-lg overflow-hidden border border-black/10">
                <div
                  className={`h-[84px] px-4 py-3 font-extrabold text-[15px] ${c.light ? "text-[#231E20]" : "text-white"}`}
                  style={{ backgroundColor: c.hex }}
                >
                  {c.name}
                </div>
                <dl className="px-4 py-3 text-[13px] grid grid-cols-[48px_1fr] gap-y-0.5 bg-white">
                  <dt className="text-[#888]">HEX</dt>
                  <dd className="font-bold select-all">{c.hex}</dd>
                  <dt className="text-[#888]">RGB</dt>
                  <dd>{c.rgb}</dd>
                  <dt className="text-[#888]">CMYK</dt>
                  <dd>{c.cmyk}</dd>
                </dl>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-[#888] mt-3">
            CMYK는 RGB 기준 환산값입니다. 인쇄 시 교정 출력으로 색상을 확인해 주십시오.
          </p>
        </section>

        <section className={`${cardCls} flex flex-col`}>
          <Title title="전용 서체" sub="Typography" />
          <div className="grid grid-cols-2 gap-3 flex-1">
            {[
              { w: 700, name: "Gmarket Sans Bold", use: "제목 · 부스명 · 강조" },
              { w: 500, name: "Gmarket Sans Medium", use: "본문 · 안내 문구 · 가격표" },
            ].map((f) => (
              <div key={f.w} className="rounded-lg border border-black/10 px-4 py-4 flex flex-col">
                <p
                  className="text-[44px] leading-none text-[#7D0B1C]"
                  style={{ ...gm, fontWeight: f.w }}
                >
                  가 Aa
                </p>
                <p className="text-[14px] mt-3" style={{ ...gm, fontWeight: f.w }}>
                  {f.name}
                </p>
                <p
                  className="text-[13px] mt-2 leading-relaxed text-[#444]"
                  style={{ ...gm, fontWeight: f.w }}
                >
                  캐스크 카니발 2026
                  <br />
                  CASK CARNIVAL SEOUL
                </p>
                <p className="text-[12px] text-[#888] mt-auto pt-3">{f.use}</p>
              </div>
            ))}
          </div>
          <a
            href={FONT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 border border-black/25 rounded px-5 py-3 text-[14px] font-bold hover:border-black"
          >
            G마켓 산스 무료 다운로드 ↗
          </a>
        </section>
      </div>

      <section className={cardCls}>
        <Title title="로고 색상 조합" sub="Color Usage" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-black/10 border border-black/10 rounded-lg overflow-hidden">
          {USAGE.map(([bg, fg, name]) => (
            <div
              key={name}
              className="relative h-[120px] flex items-center justify-center"
              style={{ backgroundColor: bg }}
            >
              <TintedLogo color={fg} className="w-[110px]" />
              <span
                className="absolute left-2.5 bottom-2 text-[11px] opacity-70"
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
