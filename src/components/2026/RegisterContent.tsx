"use client"

import { Suspense } from "react"
import { useContent2026 } from "@/i18n/useContent2026"
import PageHeader2026 from "./PageHeader2026"

function Inner() {
  const { c } = useContent2026()
  const r = c.registerP

  return (
    <div className="bg-white text-[#1a1a1a]">
      <PageHeader2026 title={r.title} subtitle={r.subtitle} watermark="REGISTER" />

      <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-14 md:py-20">
        {/* CLOSED NOTICE */}
        <div className="text-center py-16 md:py-24">
          <h2 className="text-[clamp(22px,3.5vw,30px)] font-extrabold">{r.closed}</h2>
          <p className="text-[#888] text-[15px] md:text-[16px] mt-5 leading-relaxed">
            {r.closedDesc}
          </p>
        </div>

        {/* CONTACT */}
        <div className="text-center border-t border-black/10 mt-16 pt-12">
          <p className="text-[#888]">{r.contactNote}</p>
          <h3 className="text-[26px] md:text-[30px] font-extrabold mt-6 mb-5">{r.contactOffice}</h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-10 text-[16px] md:text-[18px]">
            <span>✉ caskcarnival@whiskynavi.com</span>
            <span>☎ 010-3351-6231</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterContent() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  )
}
