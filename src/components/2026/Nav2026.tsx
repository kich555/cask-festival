"use client"

import { useContent2026 } from "@/i18n/useContent2026"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useEffect, useState } from "react"

const LANG_COOKIE_NAME = "preferred-lang"

function setLangCookie(value: string, days = 365) {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${LANG_COOKIE_NAME}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

const NAV_LINKS = [
  { href: "/about", key: "about" },
  { href: "/theme", key: "theme" },
  { href: "/program", key: "program" },
  { href: "/register", key: "register" },
] as const

function Nav2026Content() {
  const { c, lang } = useContent2026()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)

  const qs = searchParams.get("lang") ? `?lang=${searchParams.get("lang")}` : ""
  const withLang = (href: string) => `${href}${qs}`

  const toggleLang = useCallback(() => {
    const newLang = lang === "ko" ? "en" : "ko"
    setLangCookie(newLang)
    const params = new URLSearchParams(searchParams.toString())
    params.set("lang", newLang)
    router.push(`${pathname}?${params.toString()}`)
  }, [lang, pathname, searchParams, router])

  // 라우트 이동 시 모바일 메뉴 닫기
  // biome-ignore lint/correctness/useExhaustiveDependencies: close on path change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const isActive = (href: string) => pathname === href

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-black/5">
      <div className="max-w-[1440px] mx-auto h-[70px] px-5 md:px-10 flex items-center justify-between">
        <Link href={withLang("/")} aria-label="Cask Carnival" className="flex items-center">
          <Image
            src="/2026/logo-nav-dark.svg"
            alt="Cask Carnival"
            width={200}
            height={40}
            className="h-[34px] md:h-[40px] w-auto"
            priority
          />
        </Link>

        {/* 데스크톱 메뉴 */}
        <nav className="hidden md:flex items-center gap-[52px] text-[17px] font-medium">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.key}
              href={withLang(item.href)}
              className={
                isActive(item.href)
                  ? "text-[#7d0b1c] font-semibold"
                  : "text-[#1a1a1a] hover:text-[#7d0b1c] transition-colors"
              }
            >
              {c.nav[item.key]}
            </Link>
          ))}
        </nav>

        {/* 우측 아이콘 */}
        <div className="flex items-center gap-4">
          <a
            href="https://www.instagram.com/caskcarnival/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-[#555] hover:text-[#7d0b1c] transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <button
            type="button"
            onClick={toggleLang}
            className="flex items-center gap-1 px-2.5 py-1 text-[13px] font-semibold rounded-md border border-black/15 hover:border-[#7d0b1c] hover:text-[#7d0b1c] transition-colors"
            aria-label={lang === "ko" ? "Switch to English" : "한국어로 전환"}
          >
            <span className={lang === "ko" ? "text-[#7d0b1c]" : "text-black/50"}>한</span>
            <span className="text-black/30">/</span>
            <span className={lang === "en" ? "text-[#7d0b1c]" : "text-black/50"}>EN</span>
          </button>
          {/* 모바일 햄버거 */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? c.nav.closeMenu : c.nav.openMenu}
            aria-expanded={open}
            className="md:hidden text-[#1a1a1a] p-1"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-7 h-7">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 패널 */}
      {open && (
        <nav className="md:hidden bg-white border-t border-black/5 shadow-lg">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.key}
              href={withLang(item.href)}
              className={`block px-6 py-4 text-[16px] ${
                isActive(item.href) ? "text-[#7d0b1c] font-semibold" : "text-[#1a1a1a]"
              }`}
            >
              {c.nav[item.key]}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}

export default function Nav2026() {
  return (
    <Suspense fallback={null}>
      <Nav2026Content />
    </Suspense>
  )
}
