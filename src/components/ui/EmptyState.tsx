import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface EmptyStateProps {
  /** ไอคอนประกอบ — ผู้เรียกส่งมาพร้อม `aria-hidden` และขนาดที่ต้องการ */
  icon?: ReactNode
  /** ประโยคเดียวที่บอกผู้อ่านว่าตอนนี้เห็นอะไรอยู่ */
  title: string
  /** ขยายความและชี้ทางต่อ — ไม่ใส่ก็ได้ถ้าหัวข้อพอแล้ว */
  body?: string
  /** ปุ่มทางออก เช่น กลับหน้าแรก ลองใหม่ หรือไปหน้าที่เกี่ยวข้อง */
  children?: ReactNode
  className?: string
}

/**
 * บล็อกสำหรับหน้าที่ยังไม่มีรายการให้แสดง — **ฉบับที่ผู้เข้าชมเห็น**
 *
 * **เขียนถึงผู้เข้าชมทั่วไป ไม่ใช่ทีมงาน** จึงไม่บอกสถานะภายในของโครงการเลย
 *
 * เคยมีบล็อกอีกตัวที่ประกาศว่า "รอข้อมูลจากบริษัท" พร้อมรายการสิ่งที่ต้องขอ ซึ่งถูก
 * ถอดออกไปแล้ว (ก.ย. 2026) — เหตุผลยังใช้ได้กับบล็อกนี้ต่อไป คือหน้าข่าวและหน้าผลงาน
 * ดึงข้อมูลจาก API ถ้าหลังบ้านล่ม หน้าจะตกมาที่บล็อกนี้เหมือนตอนที่ยังไม่มีเนื้อหา
 * ข้อความตรงนี้จึงต้องเป็นข้อความที่ลูกค้าอ่านแล้วไม่รู้สึกว่าเห็นของหลังบ้านของเรา
 *
 * **ความกว้างถูกจำกัดที่ 42rem (672px) ไม่ใช่เต็ม container** — กล่องที่กว้าง
 * 1,184px เพื่อใส่ข้อความสามบรรทัดทำให้หน้าดูเหมือนมีอะไรหายไป การบีบให้แคบ
 * แล้วจัดกึ่งกลางทำให้ที่ว่างรอบ ๆ อ่านเป็น "ตั้งใจเว้น" แทน "ยังโหลดไม่เสร็จ"
 * และคุมความยาวบรรทัดให้อยู่ในช่วงที่อ่านสบายไปพร้อมกัน
 *
 * ขอบใช้เส้นจางกับเงานุ่ม (`shadow-card`) แทนเส้นประหนา — สถานะว่างไม่ใช่
 * ความผิดพลาดที่ต้องเรียกร้องความสนใจ กล่องจึงควรนิ่งกว่าการ์ดเนื้อหาจริง
 */
export function EmptyState({ icon, title, body, children, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border-line/60 bg-surface rounded-card shadow-card mx-auto max-w-2xl border',
        'px-6 py-16 text-center sm:px-10',
        className,
      )}
    >
      {icon && <div className="text-steel/70 mb-7 flex justify-center">{icon}</div>}

      <h2 className="text-navy-900 text-h3 font-semibold text-balance">{title}</h2>

      {body && (
        <p className="text-ink-muted mx-auto mt-4 max-w-[44ch] leading-relaxed text-pretty">
          {body}
        </p>
      )}

      {children && <div className="mt-9 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  )
}
