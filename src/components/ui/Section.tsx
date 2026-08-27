import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { Container, type ContainerProps } from '@/components/ui/Container'

export type SectionTone = 'light' | 'alt' | 'dark'
type SectionSpacing = 'none' | 'sm' | 'md' | 'lg'

const toneClass: Record<SectionTone, string> = {
  light: 'bg-surface text-ink',
  alt: 'bg-surface-alt text-ink',
  dark: 'bg-navy-900 text-white',
}

/**
 * ระยะบนและล่างแยกกัน เพื่อให้ปรับข้างเดียวได้โดยไม่ต้องเขียน class ทับ
 *
 * `cn` ในโปรเจกต์นี้เป็น clsx เปล่า ๆ ไม่ได้ merge Tailwind ให้ การส่ง `pb-12`
 * เข้ามาทาง className จึงชนกับ `py-32` แล้วผลลัพธ์ขึ้นกับลำดับใน stylesheet
 * ซึ่งเดายาก — คุมจากในนี้แทน ตรงกับที่คอมเมนต์ใน `utils/cn.ts` แนะนำไว้ว่า
 * ถ้า class ชนบ่อยให้กลับมาแก้ที่ variant ไม่ใช่เพิ่ม tailwind-merge
 *
 * ค่ารวมเท่าเดิมทุกประการเมื่อไม่ระบุ spacingTop/spacingBottom (py-X = pt-X + pb-X)
 * หน้าเดิมทั้งหมดจึงไม่ขยับ
 */
/**
 * สเกลระยะแนวตั้งของทั้งเว็บ — บีบลงราว 25% จากชุดเดิม (ส.ค. 2026)
 *
 * ชุดเดิม (sm 48/64 · md 64/96 · lg 80/128) มาจากการอ้างอิงความรู้สึกโปร่งแบบ
 * เว็บ ARIT แต่พอใส่เนื้อหาจริงของ IDIE ที่ข้อความสั้นกว่า ช่องว่างเลยกินพื้นที่
 * มากกว่าตัวเนื้อหาในหลายหน้า ผู้ใช้ต้องเลื่อนผ่านที่ว่างเพื่อไปหาข้อมูลถัดไป
 *
 * ตัวเลขใหม่ยังห่างพอที่จะแยก section ออกจากกันชัด แต่ไม่ทิ้งช่องว่างที่ไม่ทำงาน
 * **แก้ที่นี่ที่เดียวแล้วขยับทั้งเว็บ** — ถ้ายังรู้สึกไม่พอดี ปรับตารางนี้ตารางเดียว
 */
const paddingTop: Record<SectionSpacing, string> = {
  none: '',
  sm: 'pt-10 md:pt-14',
  md: 'pt-14 md:pt-20',
  lg: 'pt-16 md:pt-24',
}

const paddingBottom: Record<SectionSpacing, string> = {
  none: '',
  sm: 'pb-10 md:pb-14',
  md: 'pb-14 md:pb-20',
  lg: 'pb-16 md:pb-24',
}

export interface SectionProps {
  tone?: SectionTone
  spacing?: SectionSpacing
  /** ทับระยะด้านบนเฉพาะจุด — ใช้เมื่อ section นี้ต้องอ่านต่อเนื่องกับอันก่อนหน้า */
  spacingTop?: SectionSpacing
  /** ทับระยะด้านล่างเฉพาะจุด */
  spacingBottom?: SectionSpacing
  containerSize?: ContainerProps['size']
  /** ปิด Container เมื่อต้องการ full-bleed แล้วจัดการขอบเองภายใน */
  bleed?: boolean
  id?: string
  className?: string
  children: ReactNode
}

/**
 * จังหวะแนวตั้งและพื้นหลังของทั้งเว็บมาจากตัวนี้ตัวเดียว
 *
 * section ทุกอันบนเว็บต้องผ่าน component นี้ ถ้าแต่ละหน้ากำหนด py- เอง
 * ระยะห่างระหว่าง section จะไม่เท่ากันและเว็บจะดู "ต่อกันไม่สนิท" —
 * ซึ่งเป็นอาการหลักของเว็บที่ดูเหมือน template สำเร็จรูป
 *
 * data-tone="dark" ถูกอ่านโดย theme.css เพื่อสลับสี focus ring
 * ให้มองเห็นได้บนพื้น navy
 */
export function Section({
  tone = 'light',
  spacing = 'md',
  spacingTop,
  spacingBottom,
  containerSize,
  bleed = false,
  id,
  className,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      data-tone={tone}
      className={cn(
        'relative',
        toneClass[tone],
        paddingTop[spacingTop ?? spacing],
        paddingBottom[spacingBottom ?? spacing],
        className,
      )}
    >
      {bleed ? children : <Container size={containerSize}>{children}</Container>}
    </section>
  )
}
