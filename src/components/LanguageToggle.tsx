"use client"

import { useLanguage } from "@/i18n"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

const LANG_COOKIE_NAME = "preferred-lang"

function setCookie(name: string, value: string, days = 365) {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

export default function LanguageToggle() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentLang = useLanguage()

  const toggleLanguage = useCallback(() => {
    const newLang = currentLang === "ko" ? "en" : "ko"

    // Save to cookie
    setCookie(LANG_COOKIE_NAME, newLang)

    // Update URL with new lang param
    const params = new URLSearchParams(searchParams.toString())
    params.set("lang", newLang)

    router.push(`${pathname}?${params.toString()}`)
  }, [currentLang, pathname, searchParams, router])

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="flex items-center gap-1 px-3 py-1.5 text-[14px] font-semibold rounded-md border border-white/30 hover:border-[#ea5514] hover:text-[#ea5514] transition-colors"
      aria-label={currentLang === "ko" ? "Switch to English" : "한국어로 전환"}
    >
      <span className={currentLang === "ko" ? "text-[#ea5514]" : "text-white/60"}>한</span>
      <span className="text-white/40">/</span>
      <span className={currentLang === "en" ? "text-[#ea5514]" : "text-white/60"}>EN</span>
    </button>
  )
}

