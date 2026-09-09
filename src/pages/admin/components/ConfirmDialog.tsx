import { useEffect, useRef, type ReactNode } from 'react'
import { Button } from '@/components/ui'
import { cn } from '@/utils/cn'

interface ConfirmDialogProps {
  open: boolean
  title: string
  /** เนื้อความในกล่อง — ข้อความธรรมดาหรือรายการที่ให้ตรวจก่อนกดยืนยัน */
  children: ReactNode
  confirmLabel: string
  cancelLabel?: string
  /** `danger` ใช้กับสิ่งที่ย้อนกลับไม่ได้ — ปุ่มยืนยันเป็นสีแดงและโฟกัสไปที่ปุ่มยกเลิกแทน */
  tone?: 'default' | 'danger'
  /** กำลังทำงานอยู่ — ปิดปุ่มทั้งคู่กันกดซ้ำ และเปลี่ยนข้อความบนปุ่มยืนยัน */
  busy?: boolean
  busyLabel?: string
  /** ข้อความผิดพลาดจากการยืนยันครั้งก่อน — แสดงในกล่อง ไม่ใช่ใน alert ของเบราว์เซอร์ */
  error?: string | null
  onConfirm: () => void
  onCancel: () => void
}

/**
 * กล่องยืนยันของหน้าหลังบ้าน
 *
 * **ทำไมไม่ใช้ `window.confirm`** — กล่องของเบราว์เซอร์เป็นหน้าตาของเบราว์เซอร์
 * ไม่ใช่ของเว็บ ตัดข้อความยาวทิ้งกลางประโยค จัดปุ่มตามระบบปฏิบัติการจนปุ่ม "ตกลง"
 * ของการลบดูเหมือนปุ่มปลอดภัย และบอกความผิดพลาดที่เกิดหลังกดไม่ได้เลย —
 * ต้องตามด้วย `window.alert` อีกกล่องซึ่งดูเหมือนของแปลกปลอมเข้าไปอีก
 *
 * `<dialog>` + `showModal()` ให้ focus trap ปิดด้วย Esc และฉากหลังทึบมาในตัว
 * ไม่ต้องเขียนเอง — ที่ต้องเขียนเองมีแค่การประสาน state ของ React กับสถานะเปิด/ปิด
 * ของ element
 *
 * ไม่ผูกคลิกฉากหลังให้ปิด — กล่องนี้ถามเพื่อให้หยุดอ่าน การเผลอคลิกพลาดนอกกล่อง
 * แล้วมันหายไปเฉย ๆ ทำให้ไม่แน่ใจว่าสิ่งที่ตั้งใจทำเกิดขึ้นหรือยัง
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = 'ยกเลิก',
  tone = 'default',
  busy = false,
  busyLabel,
  error = null,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // เช็ค el.open ก่อนเสมอ — เรียก showModal() ซ้ำตอนที่เปิดอยู่แล้วจะ throw
    if (open && !el.open) {
      el.showModal()
      /*
        สั่งโฟกัสเองหลังเปิด ไม่ใช้ prop `autoFocus`

        React ตีความ `autoFocus` เป็น "สั่ง .focus() ตอน mount" ไม่ได้ใส่แอตทริบิวต์
        จริงลง DOM — แต่กล่องนี้ mount ไว้ตั้งแต่ต้นในสถานะปิด (ซ่อนอยู่) การโฟกัส
        ตอนนั้นจึงไม่เกิดผล พอเปิดทีหลังเบราว์เซอร์หา [autofocus] ไม่เจอ เลยตกไป
        โฟกัสปุ่มแรกในกล่องแทน ซึ่งบังเอิญถูกสำหรับกล่องลบ แต่ผิดสำหรับกล่องยืนยันบันทึก
      */
      el.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    }
    if (!open && el.open) el.close()
  }, [open])

  const danger = tone === 'danger'

  return (
    <dialog
      ref={ref}
      // Esc ของ <dialog> ปิดตัวเองโดยไม่ผ่าน React — กันไว้แล้วสั่งปิดผ่าน state ทางเดียว
      // ไม่งั้น state จะค้างว่า "เปิดอยู่" ทั้งที่กล่องปิดไปแล้ว กดครั้งต่อไปจะเงียบ
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onCancel()
      }}
      className={
        'border-line rounded-card bg-surface text-ink m-auto w-[min(32rem,calc(100vw-2rem))] ' +
        'border p-0 shadow-xl backdrop:bg-navy-950/60'
      }
      aria-labelledby="confirm-dialog-title"
    >
      <div className="p-6 sm:p-8">
        <h2 id="confirm-dialog-title" className="text-h3 font-semibold">
          {title}
        </h2>

        <div className="text-ink-muted mt-4 space-y-2 text-sm">{children}</div>

        {error && (
          <p role="alert" className="text-danger mt-4 text-sm">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {/*
            ปุ่มยกเลิกรับโฟกัสตอนเปิดเมื่อเป็นการลบ — กด Enter ทันทีด้วยความเคยชิน
            จึงกลายเป็น "ไม่ทำ" ไม่ใช่ "ลบถาวร" ส่วนกล่องที่ไม่อันตราย (เช่น ยืนยัน
            ก่อนบันทึก) โฟกัสที่ปุ่มยืนยันเพราะนั่นคือสิ่งที่ผู้ใช้ตั้งใจมาทำอยู่แล้ว
          */}
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={busy}
            data-autofocus={danger ? '' : undefined}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            data-autofocus={danger ? undefined : ''}
            // `!` จำเป็นเพราะ cn เป็น clsx เปล่า ๆ ไม่ได้รวมคลาสที่ชนกันให้
            className={cn(danger && '!bg-danger hover:!bg-danger/90 active:!bg-danger/80')}
          >
            {busy ? (busyLabel ?? 'กำลังดำเนินการ…') : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
