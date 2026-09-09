import { useCallback, useState } from 'react'

/**
 * สถานะของการลบที่ต้องยืนยันก่อน
 *
 * แยกออกมาเป็น hook เพราะทั้งสี่หน้ารายการของหลังบ้าน (ข่าวสาร ผลงาน อ้างอิงหน้างาน
 * บัญชีผู้ใช้) ทำเรื่องเดียวกันทุกขั้นตอน — เปิดกล่องถาม กันกดซ้ำระหว่างรอ
 * แสดงข้อความผิดพลาดในกล่องแทนที่จะเด้ง alert และปิดกล่องเฉพาะตอนลบสำเร็จ
 *
 * **ที่สำคัญคือกรณีลบไม่สำเร็จ** — กล่องต้องอยู่ต่อพร้อมเหตุผล ไม่ใช่ปิดไปเงียบ ๆ
 * แล้วให้ผู้ใช้เดาเอาเองว่ารายการยังอยู่เพราะอะไร (เซิร์ฟเวอร์ปฏิเสธ เซสชันหมดอายุ
 * หรือเน็ตหลุด) ตอนที่ยังใช้ `window.confirm` เรื่องนี้ทำไม่ได้เลย
 */
export function useDeleteConfirm<T>(remove: (item: T) => Promise<unknown>, onDeleted: () => void) {
  /** รายการที่กำลังถามว่าจะลบไหม — `null` คือไม่มีกล่องเปิดอยู่ */
  const [target, setTarget] = useState<T | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ask = useCallback((item: T) => {
    setTarget(item)
    setError(null)
  }, [])

  const cancel = useCallback(() => {
    // ระหว่างที่คำขอลบยังค้างอยู่ ห้ามปิด — ปิดแล้วผลลัพธ์จะไม่มีที่แสดง
    // และผู้ใช้จะไม่รู้ว่าตกลงลบสำเร็จหรือไม่
    if (busy) return
    setTarget(null)
    setError(null)
  }, [busy])

  const confirm = useCallback(async () => {
    if (!target || busy) return
    setBusy(true)
    setError(null)
    try {
      await remove(target)
      setTarget(null)
      onDeleted()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'ลบไม่สำเร็จ')
    } finally {
      setBusy(false)
    }
  }, [busy, onDeleted, remove, target])

  return { target, busy, error, ask, cancel, confirm }
}
