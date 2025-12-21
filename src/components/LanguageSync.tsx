"use client"

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

const VALID_LANGS = ["ko", "en"] as const
const LANG_COOKIE_NAME = "preferred-lang"

function setCookie(name: string, value: string, days = 365) {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

export default function LanguageSync() {
  const searchParams = useSearchParams()
  const langParam = searchParams.get("lang")

  useEffect(() => {
    // If valid lang param exists, save it to cookie
    if (langParam && VALID_LANGS.includes(langParam as "ko" | "en")) {
      setCookie(LANG_COOKIE_NAME, langParam)
    }
  }, [langParam])

  // This component doesn't render anything
  return null
}

