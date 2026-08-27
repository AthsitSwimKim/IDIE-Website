import { Container } from '@/components/ui'
import { useLocale } from '@/hooks/useLocale'
import { ui } from '@/data'

/**
 * Skeleton ระหว่างโหลด route chunk
 *
 * ขนาดของบล็อกตั้งใจให้ใกล้เคียงเนื้อหาจริง (hero + ย่อหน้า) เพื่อไม่ให้เกิด
 * layout shift ตอนของจริงมาแทน — CLS เป็นหนึ่งใน performance budget ของโครงการ
 */
export function RouteFallback() {
  const { t } = useLocale()

  return (
    <output className="block py-24" aria-live="polite">
      <span className="sr-only">{t(ui.states.loading)}</span>
      <Container>
        <div className="animate-pulse space-y-6">
          <div className="bg-surface-alt h-4 w-28 rounded" />
          <div className="bg-surface-alt h-12 w-3/4 rounded" />
          <div className="bg-surface-alt h-4 w-full rounded" />
          <div className="bg-surface-alt h-4 w-5/6 rounded" />
          <div className="bg-surface-alt h-64 w-full rounded" />
        </div>
      </Container>
    </output>
  )
}
