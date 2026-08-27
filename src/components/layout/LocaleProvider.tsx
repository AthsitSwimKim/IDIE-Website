import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Locale, LocalizedText } from '@/types/content'
import { config } from '@/config'
import { LocaleContext, pickLocale, readStoredLocale } from '@/hooks/useLocale'

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readStoredLocale)

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
    window.localStorage.setItem(config.localeStorageKey, next)
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
