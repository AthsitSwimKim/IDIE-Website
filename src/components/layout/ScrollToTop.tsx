import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * รีเซ็ต scroll เมื่อเปลี่ยนหน้า
 *
 * React Router ไม่ทำให้อัตโนมัติ และอาการ "กดเมนูแล้วโผล่กลางหน้า" คือสิ่งแรก
 * ที่ลูกค้าสังเกตเห็นตอนรีวิว — แก้ครั้งเดียวที่นี่ดีกว่าไปแก้ทีละหน้า
 *
 * ข้ามการรีเซ็ตเมื่อ URL มี hash เพราะผู้ใช้ตั้งใจกระโดดไปยัง anchor นั้น
 * และข้ามเมื่อเปลี่ยนแค่ query หรือ hash ในหน้าเดิม — ดูเหตุผลใน effect ด้านล่าง
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()
  const previous = useRef(pathname)

  useEffect(() => {
    /*
      รีเซ็ตเฉพาะตอน**เปลี่ยนหน้า**จริง ๆ ไม่ใช่ทุกครั้งที่ URL ขยับ

      หน้าที่เก็บตัวกรองไว้ใน query string จะเขียน URL ใหม่ทุกครั้งที่กดกรอง
      และการเขียนใหม่นั้นทำให้ hash หลุดไปด้วย ถ้าดูแค่ว่า "hash เปลี่ยน" แล้วรีเซ็ต
      ผู้ใช้ที่กำลังเลือกตัวกรองอยู่กลางหน้าจะถูกดีดขึ้นบนสุดทุกครั้งที่กด
      (เจอจริงบนหน้าสินค้า: เข้ามาจากหน้าแรกพร้อม #product-filters แล้วกดเปลี่ยนแบรนด์
      แล้วกระเด็นขึ้นไปที่ scrollY 3)
    */
    if (pathname === previous.current) return
    previous.current = pathname

    // ข้ามการรีเซ็ตเมื่อ URL มี hash เพราะผู้ใช้ตั้งใจกระโดดไปยัง anchor นั้น
    if (hash) return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}
