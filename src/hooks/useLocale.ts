import { createContext, useContext } from 'react'
import type { Locale, LocalizedText } from '@/types/content'
import { config } from '@/config'

export interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  /**
   * เลือกภาษาปัจจุบันจาก LocalizedText
   * ถ้าภาษาที่เลือกว่าง ให้ fallback ไปอีกภาษาแทนการปล่อยหน้าว่าง —
   * เนื้อหาผิดภาษายังดีกว่าช่องว่างในเว็บองค์กร
   */
  t: (text: LocalizedText | undefined) => string
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error('useLocale ต้องถูกเรียกภายใน <LocaleProvider>')
  }
  return ctx
}

export function pickLocale(text: LocalizedText | undefined, locale: Locale): string {
  if (!text) return ''
  const primary = text[locale]?.trim()
  if (primary) return primary
  const other: Locale = locale === 'th' ? 'en' : 'th'
  return text[other]?.trim() ?? ''
}

export function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return config.defaultLocale
  const stored = window.localStorage.getItem(config.localeStorageKey)
  return stored === 'th' || stored === 'en' ? stored : config.defaultLocale
}
