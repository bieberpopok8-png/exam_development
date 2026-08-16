"use client"

import { useAppStore } from "@/lib/store"
import { translations, type TranslationKey, type Language } from "@/lib/i18n"

export function useT() {
  const language = useAppStore((s) => s.language)
  const t = (key: TranslationKey): string => {
    const entry = translations[key]
    if (!entry) return key
    return entry[language] ?? entry.en ?? key
  }
  return { t, language }
}

export function translate(key: TranslationKey, lang: Language): string {
  const entry = translations[key]
  if (!entry) return key
  return entry[lang] ?? entry.en ?? key
}
