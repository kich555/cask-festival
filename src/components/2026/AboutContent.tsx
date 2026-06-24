"use client"

import { useContent2026 } from "@/i18n/useContent2026"
import Image from "next/image"
import { Suspense } from "react"
import PageHeader2026 from "./PageHeader2026"

function Inner() {
  const { c } = useContent2026()
  const a = c.aboutP

  const rows: [string, string][] = [
    [a.rowName, a.rowNameV],
    [a.rowTheme, "Oloroso Sherry Cask"],
    [a.rowDate, a.rowDateV],
    [a.rowVenue, a.rowVenueV],
    [a.rowHost, "WHISKYNAVI"],
    [a.rowSns, "@caskcarnival"],
  ]

  return (
    <div className="bg-white text-[#1a1a1a]">
      <PageHeader2026 title={a.title} subtitle={a.subtitle} watermark="ABOUT" />

      {/* RECAP */}
      <section className="bg-[#ea5514] text-white">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 py-16 md:py-20 flex flex-col md:flex-row md:items-center gap-7 md:gap-10">
          <div className="md:flex-1">
            <h2 className="text-[30px] font-extrabold mb-4">{a.recapTitle}</h2>
            <p className="text-white/90 text-[16px] break-keep">{a.recapBody1}</p>
            <p className="text-white/90 text-[16px] break-keep">{a.recapBody2}</p>
          </div>
          <a
            href="https://www.caskcarnival.com/2025"
            className="self-start text-white text-[18px] md:text-[20px] font-bold underline decoration-2 underline-offset-[6px] hover:decoration-[3px] transition-all"
          >
            {a.recapBtn}
          </a>
        </div>
      </section>

      {/* OVERVIEW */}
      <section className="max-w-[1440px] mx-auto px-5 md:px-10 py-16 md:py-24">
        <h2 className="text-[clamp(24px,3vw,32px)] font-extrabold">{a.overviewTitle}</h2>
        <div className="h-px bg-black/15 my-7" />
        <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] gap-8 md:gap-16 items-stretch">
          <Image
            src="/2026/about-keyvisual.png"
            alt={a.rowNameV}
            width={1080}
            height={1350}
            className="hidden md:block w-full h-full object-cover rounded-md"
          />
          <table className="w-full border-collapse">
            <tbody>
              {rows.map(([k, v], i) => (
                <tr key={k} className={i === 0 ? "border-t-2 border-[#1a1a1a]" : ""}>
                  <th className="text-left align-top py-4 md:py-[26px] border-b border-black/10 text-[#777] font-semibold w-[34%] md:w-[280px] text-[15px] md:text-[17px]">
                    {k}
                  </th>
                  <td className="text-left align-top py-4 md:py-[26px] border-b border-black/10 font-semibold text-[15px] md:text-[17px]">
                    {v}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default function AboutContent() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  )
}
