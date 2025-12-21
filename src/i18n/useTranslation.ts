"use client"

import { useSearchParams } from "next/navigation"
import { type Language, type Translations, translations } from "./translations"

export function useTranslation() {
  const searchParams = useSearchParams()
  const langParam = searchParams.get("lang")

  // Default to 'en' if invalid or missing (middleware should handle redirect)
  const lang: Language = langParam === "ko" || langParam === "en" ? langParam : "en"

  const t: Translations = translations[lang]

  return { t, lang }
}

export function useLanguage() {
  const searchParams = useSearchParams()
  const langParam = searchParams.get("lang")

  const lang: Language = langParam === "ko" || langParam === "en" ? langParam : "en"

  return lang
}

