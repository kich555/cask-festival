"use client"

import { Suspense } from "react"
import type { ProgramDay } from "@/content/program2026"
import { useContent2026 } from "@/i18n/useContent2026"
import PageHeader2026 from "./PageHeader2026"
import ProgramTimetable from "./ProgramTimetable"
import Reveal from "./Reveal"

function Inner({ days }: { days: ProgramDay[] }) {
  const { c } = useContent2026()
  const p = c.programP

  return (
    <div className="bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col flex-1">
      <PageHeader2026 title={p.title} subtitle={p.subtitle} watermark="PROGRAM" />
      <section className="w-full max-w-[1100px] mx-auto px-4 md:px-8 py-5 md:py-6">
        <Reveal immediate>
          <ProgramTimetable days={days} />
        </Reveal>
      </section>
    </div>
  )
}

export default function ProgramContent({ days }: { days: ProgramDay[] }) {
  return (
    <Suspense fallback={null}>
      <Inner days={days} />
    </Suspense>
  )
}
