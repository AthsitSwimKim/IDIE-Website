import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type HeadingLevel = 1 | 2 | 3 | 4
type HeadingAlign = 'start' | 'center'

const levelClass: Record<HeadingLevel, string> = {
  1: 'text-h1 font-bold',
  2: 'text-h2 font-semibold',
  3: 'text-h3 font-semibold',
  4: 'text-lg font-semibold',
}

export interface HeadingProps {
  level?: HeadingLevel
  /**
   * ป้ายตัวเล็กสีน้ำเงินเหนือหัวข้อ (เห็นใน mockup: "COMPANY PROFILE", "OUR SERVICES")
   *
   * เป็นรายละเอียดที่ทำให้เว็บดูเป็นระบบมากกว่าหัวข้อลอย ๆ และช่วยให้ผู้ใช้
   * สแกนหน้าได้เร็ว — ไม่ใช่ heading จริง จึง render เป็น <p> ไม่ใช่ <h*>
   * เพื่อไม่ให้ heading structure ของหน้าเพี้ยน
   */
  eyebrow?: string
  align?: HeadingAlign
  className?: string
  id?: string
  children: ReactNode
}

export function Heading({
  level = 2,
  eyebrow,
  align = 'start',
  className,
  id,
  children,
}: HeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4'

  return (
    <div className={cn(align === 'center' && 'text-center', className)}>
      {eyebrow && (
        <p
          className={cn(
            'text-eyebrow mb-3 flex items-center gap-2.5 uppercase',
            // บนพื้น navy สีน้ำเงินแบรนด์ contrast ไม่ผ่าน จึงสลับเป็น accent อัตโนมัติ
            // โดยอ่าน data-tone ที่ <Section> ตั้งไว้ — section ไม่ต้องส่ง prop เพิ่ม
            'text-primary-600 [[data-tone="dark"]_&]:text-accent-glow',
            align === 'center' && 'justify-center',
          )}
        >
          <span
            aria-hidden="true"
            className='bg-primary-600 [[data-tone="dark"]_&]:bg-accent-glow inline-block h-px w-6'
          />
          {eyebrow}
        </p>
      )}
      <Tag id={id} className={cn(levelClass[level], 'text-balance')}>
        {children}
      </Tag>
    </div>
  )
}
