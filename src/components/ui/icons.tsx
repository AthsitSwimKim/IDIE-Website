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

/**
 * ไอคอนประกอบสถานะว่าง — ตัวใหญ่ ไม่มีความหมายทางเนื้อหา
 *
 * ทั้งสี่ตัวนี้ใช้บน EmptyState เท่านั้น ผู้เรียกต้องใส่ `aria-hidden` เสมอ
 * เพราะข้อความข้าง ๆ บอกครบอยู่แล้ว การประกาศซ้ำทำให้โปรแกรมอ่านหน้าจอ
 * อ่านเรื่องเดียวกันสองครั้ง
 */

/** หนังสือพิมพ์ — หน้าข่าวที่ยังไม่มีรายการ */
export function NewspaperIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" />
    </svg>
  )
}

/** ชั้นซ้อน — หน้าผลงานที่ยังไม่มีรายการ สื่อถึงงานที่ทับถมกันเป็นแฟ้ม */
export function LayersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  )
}

/** วงกลมเครื่องหมายตกใจ — โหลดข้อมูลไม่สำเร็จ */
export function AlertCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4.5M12 16h.01" />
    </svg>
  )
}

/** ลูกศรหมุนซ้ำ — ปุ่มลองโหลดใหม่ */
export function RefreshIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M21 21v-5h-5" />
    </svg>
  )
}

/** ลิงก์ที่พาออกไปที่อื่น — กรอบเปิดมุมพร้อมลูกศรชี้ออกมุมขวาบน */
export function ExternalLinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6M10 14 21 3" />
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
