import { useLocale } from '@/hooks/useLocale'
import { ui } from '@/data'
import { cn } from '@/utils/cn'
import type { Locale } from '@/types/content'

const options: Locale[] = ['th', 'en']

/**
 * สลับภาษา TH / EN
 *
 * ใช้ fieldset + legend แทน role="group" เพราะเป็นการจัดกลุ่มแบบ native
 * ที่ screen reader เข้าใจโดยไม่ต้องพึ่ง ARIA
 *
 * ปุ่มที่เลือกอยู่ใช้ aria-pressed ไม่ใช่แค่เปลี่ยนสี — ผู้ใช้ screen reader
 * ต้องรู้ได้ว่าตอนนี้อยู่ภาษาไหนโดยไม่ต้องเห็นสี
 */
export function LocaleSwitch({ onDark = false }: { onDark?: boolean }) {
  const { locale, setLocale, t } = useLocale()

  return (
    <fieldset className="flex items-center gap-0.5 border-0 p-0">
      <legend className="sr-only">{t(ui.labels.locale)}</legend>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLocale(option)}
          aria-pressed={locale === option}
          className={cn(
            'inline-flex min-h-11 min-w-11 items-center justify-center rounded text-sm font-semibold uppercase',
            'transition-colors duration-(--duration-ui)',
            locale === option
              ? onDark
                ? 'text-white'
                : 'text-primary-600'
              : onDark
                ? 'text-white/55 hover:text-white'
                : 'text-ink-muted hover:text-ink',
          )}
        >
          {option}
        </button>
      ))}
    </fieldset>
  )
}
