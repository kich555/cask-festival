"use client"

import { content2026, type Content2026 } from "./content2026"
import { useLanguage } from "./useTranslation"

export function useContent2026(): { c: Content2026; lang: "ko" | "en" } {
  const lang = useLanguage()
  return { c: content2026[lang], lang }
}
