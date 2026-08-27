import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

export interface CardProps {
  /** ถ้ามี to จะกลายเป็นลิงก์ทั้งใบ พร้อม hover lift */
  to?: string
  className?: string
  children: ReactNode
}

/**
 * กล่องเนื้อหาพื้นฐาน
 *
 * hover ยกขึ้นเล็กน้อยด้วย translate + shadow เท่านั้น (ไม่แตะ width/height/margin)
 * เพราะ property เหล่านั้นทำให้ browser คำนวณ layout ใหม่และเป็นสาเหตุอันดับหนึ่ง
 * ของอาการกระตุกตอน scroll
 */
export function Card({ to, className, children }: CardProps) {
  const classes = cn(
    'border-line bg-surface rounded-card block border',
    'transition-[transform,box-shadow] duration-(--duration-ui) ease-(--ease-out-expo)',
    to && 'hover:shadow-lift hover:border-primary-200 hover:-translate-y-1',
    // touch device ไม่มี hover — ให้ขอบชัดขึ้นแทนเพื่อบอกว่ากดได้
    to && 'motion-reduce:transform-none',
    className,
  )

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    )
  }

  return <div className={classes}>{children}</div>
}
