// /exhibitor 디자인 에셋 다운로드 섹션 (로그인 후 화면에만 노출)

import Image from "next/image"
import BrandGuide from "./BrandGuide"
import { ASSET_BASE, ASSET_GROUPS, ASSET_ZIP, type DesignAsset } from "./designAssetList"
import { cardCls } from "./exhibitorParts"

const url = (file: string) => `${ASSET_BASE}/${file}`

function DownloadIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M10 3v10M5.5 8.5 10 13l4.5-4.5M4 16.5h12" />
    </svg>
  )
}

/** 항목별 다운로드 버튼 모양. 칸 전체가 링크라 실제 요소는 span. */
function ItemBtn({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] font-bold transition-colors ${
        dark
          ? "border-white/40 text-white group-hover:bg-white group-hover:text-[#1a1a1a]"
          : "border-black/25 text-[#1a1a1a] group-hover:bg-[#1a1a1a] group-hover:border-[#1a1a1a] group-hover:text-white"
      }`}
    >
      <DownloadIcon className="w-3.5 h-3.5" />
      다운로드
    </span>
  )
}

function ZipBtn({
  file,
  label,
  size,
  red = false,
}: {
  file: string
  label: string
  size: string
  red?: boolean
}) {
  return (
    <a
      href={url(file)}
      download
      className={`flex items-center justify-center gap-2 text-white rounded px-5 py-3 text-[14px] font-bold ${red ? "bg-[#7d0b1c] hover:bg-[#650916]" : "bg-[#1a1a1a] hover:bg-black"}`}
    >
      <DownloadIcon />
      {label}
      <span className="font-normal text-white/60">ZIP · {size}</span>
    </a>
  )
}

/** 로고: 칸막이 선만 있는 한 장짜리 그리드. 흰색 로고만 어두운 칸에 둔다. */
function LogoGrid({ items }: { items: DesignAsset[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-black/10 border border-black/10 rounded-lg overflow-hidden">
      {items.map((a) => (
        <a
          key={a.file}
          href={url(a.file)}
          download
          className={`group flex flex-col ${a.dark ? "bg-[#1a1a1a] text-white" : "bg-white"}`}
        >
          <div className="relative aspect-[3/2]">
            <Image
              src={url(a.file)}
              alt={a.label}
              fill
              sizes="(max-width: 640px) 50vw, 200px"
              className="object-contain p-4"
            />
          </div>
          <div className="px-3 pb-3 flex flex-col items-start gap-1.5 text-[13px]">
            <span className="font-bold">{a.label}</span>
            <ItemBtn dark={a.dark} />
          </div>
        </a>
      ))}
    </div>
  )
}

function PosterThumb({ a }: { a: DesignAsset }) {
  return (
    <a href={url(a.file)} download className="group block">
      <div className="relative aspect-[4/5] bg-white border border-black/10 rounded-lg overflow-hidden group-hover:border-black/40">
        <Image
          src={url(a.file)}
          alt={a.label}
          fill
          sizes="(max-width: 640px) 50vw, 200px"
          className="object-cover"
        />
      </div>
      <div className="pt-2 flex flex-col items-start gap-1.5 text-[13px]">
        <span className="font-bold">
          {a.label} <span className="font-normal text-[#888]">{a.size}</span>
        </span>
        <ItemBtn />
      </div>
    </a>
  )
}

export default function DesignAssets() {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-extrabold">디자인 에셋</h2>
          <p className="text-[13px] text-[#666] mt-1">
            부스 제작·홍보물에 사용하실 수 있는 캐스크 카니발 2026 로고·포스터와 색상·서체
            가이드입니다.
          </p>
        </div>
        <ZipBtn file={ASSET_ZIP.file} label="전체 다운로드" size={ASSET_ZIP.size} red />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {ASSET_GROUPS.map((g) => (
          <section key={g.title} className={`${cardCls} flex flex-col`}>
            <h3 className="text-[16px] font-extrabold mb-4">{g.title}</h3>
            {g.kind === "logo" ? (
              <LogoGrid items={g.items} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {g.items.map((a) => (
                  <PosterThumb key={a.file} a={a} />
                ))}
              </div>
            )}
            {/* AI 행과 ZIP 버튼을 박스 바닥에 붙여 양쪽 높이를 맞춘다 */}
            <div className="flex-1 min-h-4" />
            <a
              href={url(g.source.file)}
              download
              className="group flex items-center justify-between gap-3 border border-black/10 rounded-lg px-4 py-3 text-[14px]"
            >
              <span className="min-w-0">
                <b className="block">{g.source.label}</b>
                <span className="block text-[#888] text-[12px] truncate">
                  Adobe Illustrator 원본 · {g.source.size}
                </span>
              </span>
              <ItemBtn />
            </a>
            <div className="pt-5">
              <ZipBtn file={g.zip.file} label={g.zipLabel} size={g.zip.size} />
            </div>
          </section>
        ))}
      </div>

      <BrandGuide />
    </>
  )
}
