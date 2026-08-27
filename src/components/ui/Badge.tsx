import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type BadgeTone = 'neutral' | 'brand' | 'warning'

const toneClass: Record<BadgeTone, string> = {
  neutral: 'bg-surface-alt text-ink-muted border-line',
  brand: 'bg-primary-50 text-primary-700 border-primary-200',
  warning: 'bg-warning/10 text-warning border-warning/30',
}

export interface BadgeProps {
  tone?: BadgeTone
  className?: string
  children: ReactNode
}

/** ป้ายกำกับสำหรับ category, industry, brand และสถานะ */
export function Badge({ tone = 'neutral', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'rounded-pill inline-flex items-center border px-3 py-1 text-xs font-medium',
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

/**
 * ป้ายบอกว่าเนื้อหานี้ยังเป็น placeholder รอข้อมูลจริงจาก IDIE
 *
 * แสดงเฉพาะตอน dev — ทำให้ทีมเห็นทันทีว่าส่วนไหนยังไม่จริง
 * โดยไม่ต้องเปิดไฟล์ data และกันไม่ให้ mock หลุดขึ้น production โดยไม่มีใครสังเกต
 */
export function PlaceholderBadge({ children }: { children?: ReactNode }) {
  if (!import.meta.env.DEV) return null
  return <Badge tone="warning">{children ?? 'รอข้อมูลจริงจาก IDIE'}</Badge>
}
