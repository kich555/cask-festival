"use client"

import { useContent2026 } from "@/i18n/useContent2026"
import { Suspense } from "react"
import PageHeader2026 from "./PageHeader2026"

function Inner() {
  const { c } = useContent2026()
  const p = c.programP

  return (
    <div className="bg-white text-[#1a1a1a]">
      <PageHeader2026 title={p.title} subtitle={p.subtitle} watermark="PROGRAM" />
      <section className="max-w-[1100px] mx-auto px-5 md:px-10 py-16 md:py-24 text-center">
        <div className="border border-[#7d0b1c]/30 rounded-xl py-16 md:py-24 px-6 bg-[#faf8f6]">
          <p className="text-[#7d0b1c] tracking-[2px] text-[13px] font-semibold">{p.comingEyebrow}</p>
          <h2 className="text-[clamp(22px,4vw,28px)] font-extrabold mt-4">{p.comingTitle}</h2>
          <p className="text-[#888] mt-3">{p.comingBody}</p>
        </div>
      </section>
    </div>
  )
}

export default function ProgramContent() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  )
}
