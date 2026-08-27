import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { ArrowRight } from '@/components/ui/icons'

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'onDark'
type ButtonSize = 'sm' | 'md' | 'lg'

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
  outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100',
  ghost: 'text-primary-600 hover:bg-primary-50 active:bg-primary-100',
  onDark: 'bg-white text-navy-900 hover:bg-primary-50 active:bg-primary-100',
}

const sizeClass: Record<ButtonSize, string> = {
  // min-h-11 = 44px — touch target ขั้นต่ำตาม acceptance criteria เรื่อง mobile
  sm: 'min-h-11 px-4 text-sm gap-2',
  md: 'min-h-12 px-6 text-base gap-2.5',
  lg: 'min-h-14 px-8 text-base gap-3',
}

interface ButtonOwnProps {
  variant?: ButtonVariant
  size?: ButtonSize
  /** แสดงลูกศรท้ายปุ่มตาม mockup ที่ลูกค้าอนุมัติ */
  withArrow?: boolean
  fullWidth?: boolean
  className?: string
  children: ReactNode
  /** ลิงก์ภายในเว็บ — render เป็น <Link> ของ React Router */
  to?: string
  /** ลิงก์ภายนอก — render เป็น <a> */
  href?: string
}

export type ButtonProps = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonOwnProps | 'type'>

/**
 * ปุ่มเดียวของทั้งเว็บ
 *
 * รองรับสามรูปแบบผ่าน props แทนการทำ asChild/Slot เพราะโครงการนี้มีแค่สามกรณีจริง
 * และการใช้ element ให้ถูกความหมาย — <button> สำหรับสิ่งที่ทำงาน,
 * <a> สำหรับสิ่งที่พาไปที่อื่น — เป็นข้อกำหนดของ acceptance criteria ข้อ accessibility
 */
export function Button({
  variant = 'primary',
  size = 'md',
  withArrow = false,
  fullWidth = false,
  className,
  children,
  to,
  href,
  ...rest
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center font-semibold tracking-wide uppercase',
    'transition-colors duration-(--duration-ui) ease-(--ease-out-expo)',
    'disabled:pointer-events-none disabled:opacity-50',
    variantClass[variant],
    sizeClass[size],
    fullWidth && 'w-full',
    className,
  )

  const content = (
    <>
      {children}
      {withArrow && <ArrowRight className="size-4 shrink-0" aria-hidden="true" />}
    </>
  )

  if (to) {
    return (
      <Link {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} to={to} className={classes}>
        {content}
      </Link>
    )
  }

  if (href) {
    return (
      <a
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        href={href}
        rel="noopener noreferrer"
        className={classes}
      >
        {content}
      </a>
    )
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>

  return (
    <button {...buttonProps} type={buttonProps.type ?? 'button'} className={classes}>
      {content}
    </button>
  )
}
