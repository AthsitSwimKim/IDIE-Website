import { useEffect, useRef, type ReactNode } from 'react'
import { CloseIcon } from '@/components/ui/icons'
import { useLocale } from '@/hooks/useLocale'
import { ui } from '@/data'

export interface LightboxProps {
  open: boolean
  onClose: () => void
  /** ชื่อของหน้าต่างสำหรับ screen reader — ต้องบอกได้ว่าข้างในคืออะไร */
  label: string
  children: ReactNode
}

/**
 * เปลือกป๊อปอัปที่ใช้ซ้ำได้ — เอกสารใบรับรอง แผนที่ หรืออะไรก็ตามที่ต้องเปิดทับหน้าเดิม
 *
 * **ใช้ `<dialog>` จริงไม่ใช่ div + role="dialog"** — ต่างจาก MobileMenu ที่จงใจไม่ใช้
 * เพราะที่นั่นการทำให้พื้นหลัง inert ทั้งหมดเกินความจำเป็นสำหรับเมนู แต่ที่นี่
 * "พื้นหลังกดไม่ได้" คือสิ่งที่ต้องการพอดี `showModal()` จึงให้ของที่ต้องเขียนเองมาครบ:
 * top layer, trap focus, พื้นหลัง inert และคืน focus ให้ปุ่มเดิมตอนปิด
 *
 * สี่พฤติกรรมที่ `<dialog>` **ไม่ได้ให้มาฟรี** และต้องเขียนเองในนี้ — ดูเหตุผลรายข้อด้านล่าง
 */
export function Lightbox({ open, onClose, label, children }: LightboxProps) {
  const { t } = useLocale()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    /**
     * (1) ผู้ใช้กด Esc → เบราว์เซอร์ปิด `<dialog>` เอง แต่ state ฝั่ง React ยังคิดว่าเปิดอยู่
     * ต้องฟัง event `close` ให้สองฝั่งตรงกัน ไม่งั้นกดเปิดอันเดิมซ้ำแล้วจะไม่เปิดอีก
     */
    const syncClosed = () => onClose()
    dialog.addEventListener('close', syncClosed)
    return () => dialog.removeEventListener('close', syncClosed)
  }, [onClose])

  /**
   * (2) ปิดด้วย Esc
   *
   * ปกติ `<dialog>` แบบ modal ปิดเองเมื่อกด Esc ผ่านกลไก close request ของเบราว์เซอร์
   * แต่กลไกนั้นเป็นระดับ UI ไม่ใช่ DOM event — ในบางสภาพแวดล้อม (เช่นตอนถูกสั่งงาน
   * ด้วยเครื่องมืออัตโนมัติ) keydown มาถึงหน้าเว็บแต่ `cancel` ไม่ยิง แล้วป๊อปอัปค้าง
   *
   * ตัวจัดการนี้เป็นตาข่ายรองรับ ไม่ใช่การเขียนทับพฤติกรรมเดิม — ถ้าเบราว์เซอร์ปิดให้เอง
   * อยู่แล้ว `onClose()` จะถูกเรียกซ้ำซึ่งไม่มีผลอะไร
   */
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  /**
   * (3) ล็อก scroll ของหน้าเบื้องหลัง
   *
   * `<dialog>` แบบ modal กันการ "กด" พื้นหลังให้ แต่**ไม่กันการเลื่อน** — วัดจริงแล้ว
   * หมุนล้อขณะป๊อปอัปเปิดอยู่ หน้าหลังเลื่อนไป 400px ผู้ใช้จึงปิดป๊อปอัปมาเจอว่า
   * ตัวเองอยู่คนละที่กับตอนกดเข้าไป
   */
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  /**
   * (4) คลิกพื้นหลังเพื่อปิด
   *
   * เช็คว่า target เป็นตัว `<dialog>` เอง เพราะพื้นที่ว่างรอบเนื้อหานับเป็นตัว dialog
   * ส่วนเนื้อหากับปุ่มเป็นลูกของมัน
   *
   * ผูกด้วย `addEventListener` ที่นี่ ไม่ใช่ prop `onClick` บน `<dialog>` ใน JSX —
   * `<dialog>` เป็น non-interactive element ในสายตา jsx-a11y การแปะ onClick ไว้บนนั้น
   * จึงโดนกฎ `click-events-have-key-events` ฟ้องว่าไม่มีทางใช้คีย์บอร์ด ทั้งที่ทางคีย์บอร์ด
   * ของ "กดพื้นหลังเพื่อปิด" คือ Esc ซึ่งข้อ (2) ทำไว้แล้ว — กฎมองเห็นแค่ prop ใน JSX
   * ไม่เห็น listener ที่อยู่ใน effect
   *
   * ย้ายมาไว้ตรงนี้แล้วยังเข้าชุดกับพฤติกรรมอีกสามข้อที่ผูกด้วย addEventListener เหมือนกัน
   */
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !open) return

    const onBackdropClick = (event: MouseEvent) => {
      if (event.target === dialog) onClose()
    }
    dialog.addEventListener('click', onBackdropClick)
    return () => dialog.removeEventListener('click', onBackdropClick)
  }, [open, onClose])

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      className="bg-navy-950/95 backdrop:bg-navy-950/80 m-auto max-h-dvh max-w-dvw overflow-auto p-4 sm:p-8"
    >
      {open && (
        <div className="flex flex-col items-center gap-3">
          {/*
            ปุ่มปิดอยู่เป็นแถวเหนือเนื้อหา ไม่ใช่ลอยทับมุมขวาบนของเนื้อหา

            เดิมวางแบบ absolute ที่มุมขวาบน ซึ่งชนกับปุ่มขยายเต็มจอที่ Google วางไว้
            มุมเดียวกันในแผนที่ — ผู้ใช้เล็งจะกดขยาย กลายเป็นปิดป๊อปอัปแทน
            เนื้อหาที่เอามาใส่ในนี้เป็นของภายนอก (iframe คนละ origin) เราจึงคาดเดา
            ไม่ได้ว่ามุมไหนว่าง การกันพื้นที่ให้ปุ่มต่างหากจึงเป็นทางเดียวที่ปลอดภัย
          */}
          <div className="flex w-full justify-end">
            <button
              type="button"
              onClick={onClose}
              className="text-ink hover:bg-surface-alt bg-surface shadow-lift rounded-pill inline-flex min-h-11 items-center gap-2 px-4 text-sm font-medium"
            >
              <CloseIcon className="size-5" aria-hidden="true" />
              {t(ui.actions.close)}
            </button>
          </div>

          {children}
        </div>
      )}
    </dialog>
  )
}
