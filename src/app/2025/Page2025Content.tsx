"use client"

import ImageList from "@/components/ImageList"
import { useTranslation } from "@/i18n"
import { Suspense } from "react"

function Content() {
  const { t } = useTranslation()

  return (
    <section id="gallery" className="px-4 md:px-40 py-4 bg-[#121212]/50 mt-[88px]">
      <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#ea5514]">
        {t.page2025.title}
      </h1>
      <ImageList />
    </section>
  )
}

export default function Page2025Content() {
  return (
    <Suspense fallback={null}>
      <Content />
    </Suspense>
  )
}

