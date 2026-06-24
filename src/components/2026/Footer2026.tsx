"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { useContent2026 } from "@/i18n/useContent2026"

const LINKS = [
  { href: "/about", key: "about" },
  { href: "/theme", key: "theme" },
  { href: "/program", key: "program" },
  { href: "/register", key: "register" },
] as const

function Footer2026Content() {
  const { c } = useContent2026()
  const searchParams = useSearchParams()
  const qs = searchParams.get("lang") ? `?lang=${searchParams.get("lang")}` : ""

  return (
    <footer className="bg-[#1a1a1a] text-white/70">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 py-9 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
        <div className="md:flex-1">
          <strong className="block text-white font-semibold tracking-wide text-[16px]">
            CASK CARNIVAL
          </strong>
          <span className="text-[12px] text-white/50">{c.footer.brand}</span>
        </div>
        <nav className="flex flex-wrap justify-start md:justify-center gap-x-7 gap-y-2 text-[13px]">
          {LINKS.map((l) => (
            <Link
              key={l.key}
              href={`${l.href}${qs}`}
              className="hover:text-white transition-colors"
            >
              {c.nav[l.key]}
            </Link>
          ))}
        </nav>
        <div className="md:flex-1 text-[12px] text-white/45 md:text-right">{c.footer.copy}</div>
      </div>
    </footer>
  )
}

export default function Footer2026() {
  return (
    <Suspense fallback={null}>
      <Footer2026Content />
    </Suspense>
  )
}
