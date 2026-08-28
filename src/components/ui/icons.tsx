import type { SVGProps } from 'react'

/**
 * ไอคอนเขียนเป็น inline SVG แทนการติดตั้ง icon library
 *
 * เว็บนี้ใช้ไอคอนไม่กี่ตัวและ icon library ทั้งก้อนมีต้นทุน bundle ที่ไม่คุ้ม
 * ถ้าถึงจุดที่ต้องใช้เกิน ~20 ตัวค่อยพิจารณา lucide-react แบบ tree-shaken
 *
 * ทุกตัวรับ props ของ <svg> ได้ และไม่ตั้ง aria-hidden ให้อัตโนมัติ —
 * ผู้เรียกต้องตัดสินเองว่าไอคอนนั้นสื่อความหมายหรือเป็นแค่การตกแต่ง
 */

const base: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function ArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  )
}

export function ChevronDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

/** เครื่องหมายถูก — ใช้กับรายการสิ่งที่ต้องเตรียม ไม่ใช่สถานะว่าทำเสร็จแล้ว */
export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="m5 12 5 5L20 7" />
    </svg>
  )
}

/** เอกสารที่ดาวน์โหลดได้ — แผ่นกระดาษพับมุมพร้อมลูกศรลง */
export function DocumentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M12 12v5M9.5 14.5 12 17l2.5-2.5" />
    </svg>
  )
}
