import type { ElementType, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface RevealProps {
  /** หน่วงเป็นมิลลิวินาที — ใช้ทำ stagger ภายในกลุ่มเดียวกัน ไม่ใช่ทั้งหน้า */
  delay?: number
  direction?: 'up' | 'none'
  as?: ElementType
  className?: string
  children: ReactNode
}

/**
 * โครงของ scroll reveal — สร้างไว้ตั้งแต่ Phase 1 แต่ยังไม่มี motion จริง
 *
 * เหตุผลที่ทำโครงก่อน: section ทั้งหมดจะถูกเขียนใน Phase 3–4 ถ้าตอนนั้นยังไม่มี
 * wrapper กลาง แต่ละ section จะนิยาม animation ของตัวเอง แล้ว Phase 5 จะต้อง
 * ไล่แก้ทุกไฟล์ การมี wrapper ว่าง ๆ ไว้ก่อนทำให้ XP เติม Framer Motion
 * ที่จุดเดียวแล้วทั้งเว็บได้ motion พร้อมกัน
 *
 * ที่สำคัญกว่า: ตอนนี้มันไม่ซ่อนอะไรเลย เนื้อหาจึงอ่านได้แม้ JS ไม่ทำงาน —
 * ซึ่งเป็นพฤติกรรมที่ต้องคงไว้แม้หลังใส่ motion แล้ว (opacity: 0 ค้างคือบั๊กคลาสสิก
 * ของ scroll reveal ที่ทำให้หน้าว่างเปล่า)
 */
export function Reveal({
  delay = 0,
  direction = 'up',
  as: Tag = 'div',
  className,
  children,
}: RevealProps) {
  return (
    <Tag
      data-reveal={direction}
      data-reveal-delay={delay || undefined}
      className={cn(className)}
    >
      {children}
    </Tag>
  )
}
