import { cn } from '@/utils/cn'

/**
 * จำนวนปุ่มเลขหน้าที่แสดงพร้อมกัน — เกินกว่านี้ย่อด้วย "…"
 *
 * เจ็ดช่องคือ หน้าแรก · … · ก่อนหน้า · หน้าปัจจุบัน · ถัดไป · … · หน้าสุดท้าย
 * ซึ่งพอดีกับหน้าจอมือถือแคบสุดที่รองรับ (320px) โดยยังกดถูกปุ่ม
 */
const WINDOW_SLOTS = 7

export interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
  /** ป้ายกำกับของ nav สำหรับโปรแกรมอ่านหน้าจอ */
  label: string
  previousLabel: string
  nextLabel: string
  /** ป้ายของปุ่มเลขหน้า มี {page} เป็นตัวแทนเลขหน้า */
  pageLabel: string
  className?: string
}

/**
 * แถบแบ่งหน้า
 *
 * **เป็น component ที่ไม่รู้จัก URL** — รับเลขหน้าปัจจุบันเข้ามาแล้วคืนเลขหน้าใหม่
 * ผ่าน `onChange` ให้หน้าที่เรียกใช้จัดการเรื่อง query param เอง เพราะแต่ละหน้ามี
 * ตัวกรองไม่เหมือนกัน การให้ component นี้ไปยุ่งกับ URL จะทำให้มันผูกกับหน้าสินค้า
 * จนเอาไปใช้ที่หน้าข่าวหรือหน้าคลังเอกสารไม่ได้
 *
 * **ปุ่มเลขหน้าเป็น button ไม่ใช่ลิงก์** ให้เหมือนชิปตัวกรองบนหน้าเดียวกัน —
 * ทั้งคู่เปลี่ยนสิ่งที่แสดงบนหน้านี้ ไม่ได้พาไปหน้าอื่น
 *
 * **ไม่มีระยะขอบของตัวเอง** เพราะต้องวางคู่กับข้อความบอกจำนวนผลลัพธ์ในแถวเดียวกัน
 * ระยะห่างจึงเป็นเรื่องของแถวนั้น ไม่ใช่ของปุ่ม
 */
export function Pagination({
  page,
  totalPages,
  onChange,
  label,
  previousLabel,
  nextLabel,
  pageLabel,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label={label} className={cn('flex flex-wrap items-center gap-2', className)}>
      <Step onClick={() => onChange(page - 1)} disabled={page <= 1}>
        {previousLabel}
      </Step>

      {pageSlots(page, totalPages).map((slot, index) =>
        slot === null ? (
          // ช่องว่างไม่ใช่ปุ่ม จึงซ่อนจากโปรแกรมอ่านหน้าจอ ไม่งั้นจะได้ยิน "จุดจุดจุด"
          <span key={`gap-${index}`} aria-hidden="true" className="text-ink-muted px-1">
            …
          </span>
        ) : (
          <button
            key={slot}
            type="button"
            onClick={() => onChange(slot)}
            aria-current={slot === page ? 'page' : undefined}
            aria-label={pageLabel.replace('{page}', String(slot))}
            className={cn(
              'stat-figure inline-flex min-h-9 min-w-9 cursor-pointer items-center justify-center rounded-full border px-3 text-sm transition-colors duration-(--duration-ui)',
              slot === page
                ? 'border-primary-600 bg-primary-600 text-white'
                : 'border-line bg-surface text-ink-muted hover:border-primary-300 hover:text-ink',
            )}
          >
            {slot}
          </button>
        ),
      )}

      <Step onClick={() => onChange(page + 1)} disabled={page >= totalPages}>
        {nextLabel}
      </Step>
    </nav>
  )
}

/** ปุ่มก่อนหน้า/ถัดไป — ปิดการใช้งานแทนการซ่อน ตำแหน่งปุ่มจะได้ไม่ขยับ */
function Step({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void
  disabled: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'border-line bg-surface text-ink-muted inline-flex min-h-9 items-center rounded-full border px-4 text-sm transition-colors duration-(--duration-ui)',
        disabled
          ? 'cursor-not-allowed opacity-40'
          : 'hover:border-primary-300 hover:text-ink cursor-pointer',
      )}
    >
      {children}
    </button>
  )
}

/**
 * เลขหน้าที่จะแสดง โดย `null` คือช่องว่าง "…"
 *
 * คงหน้าแรกกับหน้าสุดท้ายไว้เสมอ เพราะเป็นสองจุดที่ผู้ใช้กระโดดไปบ่อยที่สุด
 * และคงหน้าข้างเคียงของหน้าปัจจุบันไว้ เพื่อให้เลื่อนทีละหน้าได้โดยไม่ต้องเล็ง
 */
function pageSlots(page: number, totalPages: number): (number | null)[] {
  if (totalPages <= WINDOW_SLOTS) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const slots: (number | null)[] = [1]
  const from = Math.max(2, Math.min(page - 1, totalPages - 3))
  const to = Math.min(totalPages - 1, Math.max(page + 1, 4))

  if (from > 2) slots.push(null)
  for (let value = from; value <= to; value += 1) slots.push(value)
  if (to < totalPages - 1) slots.push(null)

  slots.push(totalPages)
  return slots
}
