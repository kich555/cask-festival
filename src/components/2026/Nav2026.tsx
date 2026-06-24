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
  const [scrolled, setScrolled] = useState(false)

  const isHome = pathname === "/"
  // 메인 최상단(스크롤 전, 메뉴 닫힘) → 투명/흰 텍스트. 그 외 → 흰 배경/검정 텍스트.
  const transparent = isHome && !scrolled && !open

  const qs = searchParams.get("lang") ? `?lang=${searchParams.get("lang")}` : ""
  const withLang = (href: string) => `${href}${qs}`

  const toggleLang = useCallback(() => {
    const newLang = lang === "ko" ? "en" : "ko"
    setLangCookie(newLang)
    const params = new URLSearchParams(searchParams.toString())
    params.set("lang", newLang)
    router.push(`${pathname}?${params.toString()}`)
  }, [lang, pathname, searchParams, router])

  // biome-ignore lint/correctness/useExhaustiveDependencies: close on path change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const isActive = (href: string) => pathname === href

  const textColor = transparent ? "text-white" : "text-[#1a1a1a]"
  const headerBg = transparent
    ? "bg-transparent"
    : "bg-white/95 backdrop-blur-sm border-b border-black/5"

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${headerBg}`}>
      <div className="max-w-[1440px] mx-auto h-[88px] px-5 md:px-10 flex items-center justify-between">
        <Link href={withLang("/")} aria-label="Cask Carnival" className="flex items-center">
          <Image
            src={transparent ? "/2026/logo-nav-white.svg" : "/2026/logo-nav-dark.svg"}
            alt="Cask Carnival"
            width={240}
            height={48}
            className="h-[40px] md:h-[48px] w-auto"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-[52px] text-[17px] font-medium">
          {NAV_LINKS.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.key}
                href={withLang(item.href)}
                className={
                  active
                    ? "text-[#7d0b1c] font-semibold"
                    : transparent
                      ? "text-white/90 hover:text-white transition-colors"
                      : "text-[#1a1a1a] hover:text-[#7d0b1c] transition-colors"
                }
              >
                {c.nav[item.key]}
              </Link>
            )
          })}
        </nav>

        <div className={`flex items-center gap-4 ${textColor}`}>
          <a
            href="https://www.instagram.com/caskcarnival/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className={transparent ? "hover:opacity-80" : "text-[#555] hover:text-[#7d0b1c] transition-colors"}
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
            className={`flex items-center gap-1 px-2.5 py-1 text-[13px] font-semibold rounded-md border transition-colors ${
              transparent
                ? "border-white/40 hover:border-white"
                : "border-black/15 hover:border-[#7d0b1c] hover:text-[#7d0b1c]"
            }`}
            aria-label={lang === "ko" ? "Switch to English" : "한국어로 전환"}
          >
            <span className={lang === "ko" ? "text-[#7d0b1c]" : transparent ? "text-white/70" : "text-black/50"}>한</span>
            <span className={transparent ? "text-white/40" : "text-black/30"}>/</span>
            <span className={lang === "en" ? "text-[#7d0b1c]" : transparent ? "text-white/70" : "text-black/50"}>EN</span>
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? c.nav.closeMenu : c.nav.openMenu}
            aria-expanded={open}
            className="md:hidden p-1"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-7 h-7">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

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
