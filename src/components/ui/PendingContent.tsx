import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/Badge'
import { useLocale } from '@/hooks/useLocale'
import { ui } from '@/data'
import { cn } from '@/utils/cn'

export interface PendingContentProps {
  /** สิ่งที่ต้องขอจากบริษัทเพื่อเติม section นี้ — เขียนให้เอาไปคุยกับลูกค้าได้ตรง ๆ */
  need: string
  children?: ReactNode
  className?: string
}

/**
 * บล็อกสำหรับ section ที่มีโครงแล้วแต่ยังไม่ได้รับข้อมูลจากบริษัท
 *
 * เลือกแสดงแทนการซ่อน section ทิ้งด้วยเหตุผลสองข้อ:
 * 1. ผู้ใช้ที่รีวิวเว็บต้องเห็นว่าหน้านี้ *จะ* มีอะไรบ้าง ไม่ใช่เห็นหน้าโล่งแล้วเข้าใจว่างานไม่เสร็จ
 * 2. มันทำหน้าที่เป็นรายการขอข้อมูลที่อยู่บนหน้าเว็บจริง ไม่ต้องเปิดเอกสารตาม
 *
 * ต่างจาก ImagePlaceholder ตรงที่อันนั้นแทน "ภาพ" ส่วนอันนี้แทน "เนื้อหาทั้ง section"
 */
export function PendingContent({ need, children, className }: PendingContentProps) {
  const { t } = useLocale()

  return (
    <div
      className={cn(
        'border-line bg-surface-alt rounded-card corner-bracket border border-dashed p-6 md:p-8',
        className,
      )}
    >
      <Badge tone="warning">{t(ui.pending.badge)}</Badge>

      <p className="text-eyebrow text-ink-muted mt-5 uppercase">{t(ui.pending.needHeading)}</p>
      <p className="text-ink mt-2 max-w-prose">{need}</p>

      {children && <div className="mt-6">{children}</div>}
    </div>
  )
}
