import { ConfirmDialog } from '@/pages/admin/components/ConfirmDialog'

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
 * รายการที่ให้ตรวจอยู่ที่นี่ ส่วนกลไกของกล่อง (เปิด/ปิด, Esc, ฉากหลัง, โฟกัส)
 * อยู่ใน `ConfirmDialog` ซึ่งใช้ร่วมกับกล่องยืนยันการลบทุกหน้า — มีกล่องแบบเดียว
 * ทั้งหลังบ้าน ผู้ใช้จึงไม่ต้องเรียนรู้หน้าตาใหม่ทุกครั้งที่ระบบถามอะไรสักอย่าง
 */
export function SaveConfirmDialog({ open, onConfirm, onCancel }: SaveConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="ตรวจสอบข้อมูลก่อนบันทึก"
      confirmLabel="บันทึก"
      cancelLabel="กลับไปแก้ไข"
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <ul className="marker:text-steel list-disc space-y-2 ps-5">
        <li>ข้อความครบทั้งภาษาไทยและภาษาอังกฤษ</li>
        <li>รูปภาพและคำอธิบายภาพถูกต้อง</li>
        <li>
          สถานะ — ถ้าเลือก <span className="text-ink font-medium">“เผยแพร่”</span>{' '}
          ข้อมูลจะขึ้นหน้าเว็บจริงทันทีที่บันทึก
        </li>
      </ul>
    </ConfirmDialog>
  )
}
