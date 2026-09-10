import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

export interface CardProps {
  /** ถ้ามี to จะกลายเป็นลิงก์ทั้งใบ พร้อม hover lift */
  to?: string
  /**
   * เปิด hover lift โดยที่การ์ดไม่ได้เป็นลิงก์
   *
   * ปกติแล้วการ์ดที่ขยับตอนชี้เมาส์ควรกดได้ ไม่งั้นเท่ากับสัญญาว่ากดได้แล้วไม่มีอะไรเกิดขึ้น
   * ตัวเลือกนี้จึงต้องระบุเองทีละจุด ไม่ได้เปิดให้อัตโนมัติ — ใช้เมื่อเจ้าของงานต้องการ
   * การตอบสนองเชิงสัมผัสเพื่อบอกว่าการ์ดเป็นก้อนเนื้อหาแยกใบ ไม่ใช่เพื่อบอกว่าคลิกได้
   */
  hoverLift?: boolean
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
export function Card({ to, hoverLift, className, children }: CardProps) {
  const lift = Boolean(to) || hoverLift

  const classes = cn(
    'border-line bg-surface rounded-card block border',
    /*
      ต้องระบุ `translate` แยกจาก `transform`

      Tailwind v4 แปล `-translate-y-1` เป็น CSS property ชื่อ `translate` ไม่ใช่
      `transform` แบบ v3 รายการเดิมที่มีแต่ `transform` จึงไม่ครอบมัน วัดจากหน้าจริง:
      การ์ดยกขึ้น 4px ทันทีทันใดในเฟรมเดียว ขณะที่เงากับสีขอบค่อย ๆ ไล่ตาม duration
      ปกติ กลายเป็นการเคลื่อนไหวสองจังหวะที่ไม่ตรงกัน

      border-color ก็ต้องมีด้วยเหตุผลเดียวกัน — ไม่งั้นสีขอบเปลี่ยนทันทีทันใด
    */
    'transition-[translate,transform,box-shadow,border-color] duration-(--duration-ui) ease-(--ease-out-expo)',
    lift && 'hover:shadow-lift hover:border-primary-200 hover:-translate-y-1',
    /* `transform-none` ไม่พอด้วยเหตุผลข้างบน — ต้องปิด `translate` ตรง ๆ ไม่งั้น
       คนที่ตั้งค่าระบบว่าลดการเคลื่อนไหวยังเห็นการ์ดกระโดดอยู่ดี */
    lift && 'motion-reduce:transform-none motion-reduce:translate-none',
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
