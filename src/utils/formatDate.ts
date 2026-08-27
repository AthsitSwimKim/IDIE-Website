import type { Locale } from '@/types/content'

/**
 * วันที่ตามภาษาที่ผู้ใช้เลือก
 *
 * ค่าที่ API ส่งมาเป็น ISO ลงท้ายด้วย `Z` (UTC) เสมอ เบราว์เซอร์จึงแปลงเป็นเวลา
 * ท้องถิ่นของผู้อ่านให้เอง — ไม่ต้องคำนวณ offset ในโค้ด และข่าวที่ลงตอนเย็น
 * จะไม่กลายเป็นวันถัดไปสำหรับคนอ่านคนละโซนเวลา
 *
 * `th-TH` ให้ปฏิทินพุทธศักราชโดยอัตโนมัติ ซึ่งเป็นสิ่งที่ผู้อ่านชาวไทยคาดหวัง
 * จากเว็บบริษัทไทย ส่วน `en-GB` ให้รูปแบบวัน-เดือน-ปีที่คนนอกสหรัฐฯ อ่านคุ้นกว่า
 *
 * อยู่แยกไฟล์จาก NewsCard เพราะไฟล์ที่ export ทั้ง component และฟังก์ชันธรรมดา
 * ทำให้ hot reload ของ Vite ทำงานไม่เต็มที่ (ต้องรีเฟรชทั้งหน้าแทนการอัปเดตเฉพาะจุด)
 */
export function formatDate(iso: string, locale: Locale) {
  return new Date(iso).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
