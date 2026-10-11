// 자료실 브랜드 가이드: 전용 색상 · 전용 서체 · 로고 색상 조합

import { ASSET_BASE } from "./designAssetList"
import { cardCls } from "./exhibitorParts"

const COLORS = [
  { name: "Cask Red", hex: "#7D0B1C", rgb: "125, 11, 28", cmyk: "0, 91, 78, 51", light: false },
  { name: "Ink Black", hex: "#231E20", rgb: "35, 30, 32", cmyk: "0, 14, 9, 86", light: false },
  { name: "Sand", hex: "#F0C79C", rgb: "240, 199, 156", cmyk: "0, 17, 35, 6", light: true },
  { name: "Paper", hex: "#F2F2F2", rgb: "242, 242, 242", cmyk: "0, 0, 0, 5", light: true },
]

/** 로고 조합: [배경, 로고색, 이름]. Paper가 흰색 역할 */
const USAGE = [
  ["#F2F2F2", "#7D0B1C", "Red on Paper"],
  ["#F2F2F2", "#231E20", "Black on Paper"],
  ["#231E20", "#F2F2F2", "Paper on Black"],
  ["#7D0B1C", "#F2F2F2", "Paper on Red"],
] as const

const [MAIN, ...SUBS] = COLORS
type Color = (typeof COLORS)[number]

function ColorInfo({ c, big = false }: { c: Color; big?: boolean }) {
  return (
    <div>
      <p className={`font-extrabold ${big ? "text-[18px] mb-1.5" : "text-[14px] mb-0.5"}`}>
        {c.name}
      </p>
      <p>
        HEX <b className="select-all">{c.hex}</b>
      </p>
      <p>RGB {c.rgb}</p>
      <p>CMYK {c.cmyk}</p>
    </div>
  )
}

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
          <div className="grid grid-cols-[1.3fr_1fr] min-h-[300px] text-[12px] leading-relaxed">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-black/10 border border-black/10 rounded-lg overflow-hidden">
          {USAGE.map(([bg, fg, name]) => (
            <div
              key={name}
              className="relative h-[120px] flex items-center justify-center"
              style={{ backgroundColor: bg }}
            >
              <TintedLogo color={fg} className="w-[130px]" />
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
