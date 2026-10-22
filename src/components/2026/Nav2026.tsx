"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useContent2026 } from "@/i18n/useContent2026"

const LANG_COOKIE_NAME = "preferred-lang"

function setLangCookie(value: string, days = 365) {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${LANG_COOKIE_NAME}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

const NAV_LINKS = [
  { href: "/about", key: "about" },
  { href: "/theme", key: "theme" },
  { href: "/floorplan", key: "floorplan" },
  { href: "/program", key: "program" },
  { href: "/brands", key: "brands" },
  { href: "/buyer", key: "buyer" },
] as const

function Nav2026Content() {
  const { c, lang } = useContent2026()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  // 부스 배치도는 관리자가 공개하기 전까지 탭을 눌러도 안내창만 띄운다
  const [floorPublic, setFloorPublic] = useState(false)
  const [soon, setSoon] = useState(false)
  useEffect(() => {
    fetch("/api/floorplan/visibility")
      .then((r) => r.json())
      .then((d) => setFloorPublic(d?.public === true))
      .catch(() => null)
  }, [])
  useEffect(() => {
    if (!soon) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSoon(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [soon])
  const guard = (key: string) => (e: React.MouseEvent) => {
    if (key !== "floorplan" || floorPublic) return
    e.preventDefault()
    setOpen(false)
    setSoon(true)
  }

  // 메인(/)과 2025 아카이브(/2025)는 상단이 어두워서 최상단에선 투명/흰 텍스트
  const transparentEligible = pathname === "/" || pathname === "/2025"
  const transparent = transparentEligible && !scrolled && !open

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

  const textColor = transparent ? "text-white" : "text-[var(--c-text)]"
  const headerBg = transparent
    ? "bg-transparent"
    : "bg-[var(--c-bg)]/95 backdrop-blur-sm border-b border-[var(--c-line-soft)]"

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${headerBg}`}
    >
      <div className="max-w-[1440px] mx-auto h-[88px] px-5 md:px-10 flex items-center justify-between">
        <Link href={withLang("/")} aria-label="Cask Carnival" className="flex items-center">
          {/* 투명 헤더이거나 다크 모드면 흰 로고 */}
          <Image
            src="/2026/logo-nav-white.svg"
            alt="Cask Carnival"
            width={240}
            height={48}
            className={`h-[40px] md:h-[48px] w-auto ${transparent ? "" : "hidden dark:block"}`}
            priority
          />
          {!transparent && (
            <Image
              src="/2026/logo-nav-dark.svg"
              alt=""
              width={240}
              height={48}
              className="h-[40px] md:h-[48px] w-auto dark:hidden"
              priority
            />
          )}
        </Link>

        {/* 폭에 맞춰 글자·간격이 함께 줄어든다. 한 줄에 다 안 들어가는 폭(1024px 미만)은 ☰ 메뉴 */}
        <nav className="hidden lg:flex items-center gap-[clamp(20px,3.4vw,52px)] text-[clamp(15px,1.28vw,19px)] font-medium whitespace-nowrap">
          {NAV_LINKS.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.key}
                href={withLang(item.href)}
                onClick={guard(item.key)}
                className={
                  active
                    ? "text-[var(--c-accent)] font-semibold"
                    : transparent
                      ? "text-white/90 hover:text-white transition-colors"
                      : "text-[var(--c-text)] hover:text-[var(--c-accent)] transition-colors"
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
            className={
              transparent
                ? "hover:opacity-80"
                : "text-[var(--c-text2)] hover:text-[var(--c-accent)] transition-colors"
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="w-7 h-7"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <button
            type="button"
            onClick={toggleLang}
            className={`flex items-center gap-1 px-3 py-1.5 text-[15px] font-semibold rounded-md border transition-colors ${
              transparent
                ? "border-white/40 hover:border-white"
                : "border-[var(--c-line-strong)] hover:border-[var(--c-accent)] hover:text-[var(--c-accent)]"
            }`}
            aria-label={lang === "ko" ? "Switch to English" : "한국어로 전환"}
          >
            <span
              className={
                lang === "ko"
                  ? "text-[var(--c-accent)]"
                  : transparent
                    ? "text-white/70"
                    : "text-[var(--c-muted)]"
              }
            >
              한
            </span>
            <span className={transparent ? "text-white/40" : "text-[var(--c-faint)]"}>/</span>
            <span
              className={
                lang === "en"
                  ? "text-[var(--c-accent)]"
                  : transparent
                    ? "text-white/70"
                    : "text-[var(--c-muted)]"
              }
            >
              EN
            </span>
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? c.nav.closeMenu : c.nav.openMenu}
            aria-expanded={open}
            className="lg:hidden p-1"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="w-7 h-7"
            >
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden bg-[var(--c-surface)] border-t border-[var(--c-line-soft)] shadow-lg">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.key}
              href={withLang(item.href)}
              onClick={guard(item.key)}
              className={`block px-6 py-4 text-[16px] ${
                isActive(item.href)
                  ? "text-[var(--c-accent)] font-semibold"
                  : "text-[var(--c-text)]"
              }`}
            >
              {c.nav[item.key]}
            </Link>
          ))}
        </nav>
      )}

      {/* 헤더의 backdrop-blur 가 fixed 기준이 되므로 body 에 띄운다 */}
      {soon &&
        createPortal(
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
            {/* 바깥(어두운 배경)을 눌러도 닫힌다 */}
            <button
              type="button"
              aria-label={c.floorP.ok}
              className="absolute inset-0 bg-black/45 cursor-default"
              onClick={() => setSoon(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              className="relative w-full max-w-[320px] bg-[var(--c-surface)] text-[var(--c-text)] px-6 pt-7 pb-5 text-center shadow-xl"
            >
              <p className="text-[16px] font-bold">{c.floorP.soon}</p>
              <button
                type="button"
                onClick={() => setSoon(false)}
                className="mt-5 w-full h-11 bg-[#7d0b1c] text-white text-[14px] font-bold"
              >
                {c.floorP.ok}
              </button>
            </div>
          </div>,
          document.body,
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
