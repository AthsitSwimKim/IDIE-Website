import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui'

interface SaveConfirmDialogProps {
  open: boolean
  /** ผู้ใช้ยืนยันแล้ว — เรียกฟังก์ชันบันทึกจริง */
  onConfirm: () => void
  /** กดปุ่มกลับไปแก้ไข หรือกด Esc — ปิดเฉย ๆ ข้อมูลในฟอร์มอยู่ครบ */
  onCancel: () => void
}

/**
 * กล่องยืนยันก่อนบันทึกของหน้าหลังบ้าน
 *
 * **ทำไมต้องถาม** — สิ่งที่บันทึกจากหน้านี้เขียนทับข้อมูลที่ขึ้นเว็บจริงทันทีและไม่มีประวัติ
 * ให้ย้อนกลับ ถ้าเผลอบันทึกทั้งที่ยังกรอกภาษาอังกฤษไม่ครบหรือสถานะเป็น "เผยแพร่" อยู่
 * ลูกค้าจะเห็นของที่ยังไม่เสร็จก่อนที่แอดมินจะรู้ตัว
 *
 * **ทำไมเป็น `<dialog>` ไม่ใช่ `window.confirm`** — กล่องของเบราว์เซอร์ตัดข้อความยาว
 * ทิ้งกลางประโยค (Chrome ตัดที่ประมาณสามบรรทัด) รายการที่ให้ตรวจจึงอ่านไม่จบ และหน้าตา
 * เป็นของเบราว์เซอร์ไม่ใช่ของเว็บ ส่วน `<dialog>` + `showModal()` ได้ focus trap, ปิดด้วย
 * Esc และฉากหลังทึบมาให้ในตัว ไม่ต้องเขียนเอง
 *
 * ไม่ผูกคลิกฉากหลังให้ปิด — กล่องนี้ถามเพื่อให้หยุดอ่าน การเผลอคลิกพลาดนอกกล่องแล้วมัน
 * หายไปเฉย ๆ ทำให้ไม่แน่ใจว่าบันทึกไปหรือยัง ต้องกดปุ่มหรือ Esc เท่านั้น
 */
export function SaveConfirmDialog({ open, onConfirm, onCancel }: SaveConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // เช็ค el.open ก่อนเสมอ — เรียก showModal() ซ้ำตอนที่เปิดอยู่แล้วจะ throw
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      // Esc ของ <dialog> ปิดตัวเองโดยไม่ผ่าน React — กันไว้แล้วสั่งปิดผ่าน state ทางเดียว
      // ไม่งั้น state จะค้างว่า "เปิดอยู่" ทั้งที่กล่องปิดไปแล้ว กดบันทึกครั้งต่อไปจะเงียบ
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      className={
        'border-line rounded-card bg-surface text-ink m-auto w-[min(32rem,calc(100vw-2rem))] ' +
        'border p-0 shadow-xl backdrop:bg-navy-950/60'
      }
      aria-labelledby="save-confirm-title"
    >
      <div className="p-6 sm:p-8">
        <h2 id="save-confirm-title" className="text-h3 font-semibold">
          ตรวจสอบข้อมูลก่อนบันทึก
        </h2>

        <ul className="text-ink-muted marker:text-steel mt-4 list-disc space-y-2 ps-5 text-sm">
          <li>ข้อความครบทั้งภาษาไทยและภาษาอังกฤษ</li>
          <li>รูปภาพและคำอธิบายภาพถูกต้อง</li>
          <li>
            สถานะ — ถ้าเลือก <span className="text-ink font-medium">“เผยแพร่”</span>{' '}
            ข้อมูลจะขึ้นหน้าเว็บจริงทันทีที่บันทึก
          </li>
        </ul>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            กลับไปแก้ไข
          </Button>
          <Button type="button" autoFocus onClick={onConfirm}>
            บันทึก
          </Button>
        </div>
      </div>
    </dialog>
  )
}
