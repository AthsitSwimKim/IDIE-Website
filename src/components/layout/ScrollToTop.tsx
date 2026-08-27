import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * รีเซ็ต scroll เมื่อเปลี่ยนหน้า
 *
 * React Router ไม่ทำให้อัตโนมัติ และอาการ "กดเมนูแล้วโผล่กลางหน้า" คือสิ่งแรก
 * ที่ลูกค้าสังเกตเห็นตอนรีวิว — แก้ครั้งเดียวที่นี่ดีกว่าไปแก้ทีละหน้า
 *
 * ข้ามการรีเซ็ตเมื่อ URL มี hash เพราะผู้ใช้ตั้งใจกระโดดไปยัง anchor นั้น
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}
