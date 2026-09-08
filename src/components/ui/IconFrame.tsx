import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type IconFrameSize = 'xs' | 'sm' | 'md' | 'lg'

const sizeClass: Record<IconFrameSize, string> = {
  /* กรอบเตี้ยลงให้ใกล้ความสูงตัวหนังสือหัวข้อ พร้อมย่อแขนมุมตามส่วน */
  xs: 'size-8 [--bracket-arm:0.75rem]',
  sm: 'size-10',
  md: 'size-14',
  lg: 'size-16',
}

export interface IconFrameProps {
  size?: IconFrameSize
  className?: string
  children: ReactNode
}

/**
 * กรอบไอคอนสำหรับ Engineering Highlights และ value proposition
 *
 * มุมตัดแบบ technical drawing (corner-bracket) เป็นหนึ่งใน motif ที่ทำให้เว็บนี้
 * ดูเป็น IDIE ไม่ใช่ template ทั่วไป — รายละเอียดแบบนี้ต้นทุนต่ำแต่ได้ผลมาก
 * กว่าการเพิ่ม animation
 */
export function IconFrame({ size = 'md', className, children }: IconFrameProps) {
  return (
    <span
      className={cn(
        'corner-bracket text-primary-600 [[data-tone="dark"]_&]:text-accent-glow',
        'inline-flex items-center justify-center',
        sizeClass[size],
        className,
      )}
    >
      {children}
    </span>
  )
}
