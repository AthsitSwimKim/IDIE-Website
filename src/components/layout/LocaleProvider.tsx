import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Locale, LocalizedText } from '@/types/content'
import { config } from '@/config'
import { LocaleContext, pickLocale } from '@/hooks/useLocale'

const LOCALE_SESSION_KEY = 'idie.locale.session'

function initialLocale(): Locale {
  try {
    const stored = window.sessionStorage.getItem(LOCALE_SESSION_KEY)
    if (stored === 'th' || stored === 'en') return stored
  } catch {
    // Storage may be unavailable; the English default still works.
  }
  return config.defaultLocale
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  /**
   * <html lang> ต้องเปลี่ยนตามภาษาจริง ๆ ไม่ใช่แค่ข้อความบนหน้า —
   * screen reader ใช้ค่านี้เลือกเสียงอ่าน และ :lang(th) ใน theme.css
   * ใช้ค่านี้ตั้ง line-height ของภาษาไทย
   */
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try {
      window.sessionStorage.setItem(LOCALE_SESSION_KEY, next)
    } catch {
      // Switching language must keep working even if storage is blocked.
    }
  }, [])

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (text: LocalizedText | undefined) => pickLocale(text, locale),
    }),
    [locale, setLocale],
  )

  return <LocaleContext value={value}>{children}</LocaleContext>
}
