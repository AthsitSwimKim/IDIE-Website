import type { ElementType, ReactNode } from 'react'
import { cn } from '@/utils/cn'

type ContainerSize = 'narrow' | 'default' | 'wide' | 'full'

const sizeClass: Record<ContainerSize, string> = {
  narrow: 'max-w-[var(--container-narrow)]',
  default: 'max-w-[var(--container-default)]',
  wide: 'max-w-[var(--container-wide)]',
  full: 'max-w-none',
}

export interface ContainerProps {
  size?: ContainerSize
  as?: ElementType
  className?: string
  children: ReactNode
}

/**
 * คุม max-width และระยะขอบด้านข้างที่เดียวทั้งเว็บ
 *
 * ถ้าแต่ละหน้ากำหนด padding ข้างเอง ขอบซ้าย-ขวาจะไม่ตรงกันระหว่าง section
 * ซึ่งเป็นอาการที่ทำให้เว็บดู "ประกอบจากหลายที่" แม้จะใช้สีและฟอนต์เดียวกัน
 */
export function Container({
  size = 'default',
  as: Tag = 'div',
  className,
  children,
}: ContainerProps) {
  return (
    <Tag className={cn('mx-auto w-full px-5 sm:px-8 lg:px-12', sizeClass[size], className)}>
      {children}
    </Tag>
  )
}
