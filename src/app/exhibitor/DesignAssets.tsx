// /exhibitor 디자인 에셋 다운로드 섹션 (로그인 후 화면에만 노출)

import Image from "next/image"
import { ASSET_BASE, ASSET_GROUPS, ASSET_ZIP, type DesignAsset } from "./designAssetList"
import { cardCls } from "./exhibitorParts"

const url = (file: string) => `${ASSET_BASE}/${file}`

function Thumb({ a, tall }: { a: DesignAsset; tall: boolean }) {
  return (
    <a
      href={url(a.file)}
      download
      className="group block rounded-lg border border-black/10 overflow-hidden hover:border-black/40"
    >
      <div
        className={`relative ${tall ? "aspect-[4/5]" : "aspect-[3/2]"} ${a.dark ? "bg-[#1a1a1a]" : "bg-[#f4f2ef]"}`}
      >
        <Image
          src={url(a.file)}
          alt={a.label}
          fill
          sizes="(max-width: 640px) 50vw, 240px"
          className={tall ? "object-cover" : "object-contain p-3"}
        />
      </div>
      <div className="px-3 py-2 flex items-center justify-between gap-2 text-[13px]">
        <span className="font-bold truncate">{a.label}</span>
        <span className="shrink-0 text-[#888] group-hover:text-black">↓ {a.size}</span>
      </div>
    </a>
  )
}

export default function DesignAssets() {
  return (
    <section className={cardCls}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-extrabold">디자인 에셋</h2>
          <p className="text-[13px] text-[#666] mt-1">
            부스 제작·홍보물에 사용하실 수 있는 캐스크 카니발 2026 로고와 포스터입니다.
          </p>
        </div>
        <a
          href={url(ASSET_ZIP.file)}
          download
          className="shrink-0 bg-[#1a1a1a] text-white rounded px-5 py-2.5 text-[14px] font-bold text-center hover:bg-black"
        >
          전체 다운로드 (ZIP · {ASSET_ZIP.size})
        </a>
      </div>

      <div className="mt-5 space-y-6">
        {ASSET_GROUPS.map((g) => (
          <div key={g.title}>
            <h3 className="text-[14px] font-bold text-[#444] mb-2.5">{g.title}</h3>
            {g.kind === "source" ? (
              <ul className="divide-y divide-black/10 border border-black/10 rounded-lg">
                {g.items.map((a) => (
                  <li key={a.file}>
                    <a
                      href={url(a.file)}
                      download
                      className="flex items-center justify-between gap-3 px-4 py-3 text-[14px] hover:bg-black/[0.03]"
                    >
                      <span>
                        <b>{a.label}</b> <span className="text-[#888] text-[13px]">{a.file}</span>
                      </span>
                      <span className="shrink-0 text-[13px] text-[#888]">↓ {a.size}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {g.items.map((a) => (
                  <Thumb key={a.file} a={a} tall={g.kind === "poster"} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
