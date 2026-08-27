import type { IndustrySlug } from '@/types/content'

/**
 * ชื่ออุตสาหกรรมภาษาไทยสำหรับหลังบ้าน
 *
 * **ไม่ดึงจาก `src/data/industries.ts`** แม้จะมีชื่อไทยอยู่แล้ว เพราะที่นั่นเป็น
 * ข้อความการตลาดที่เขียนให้ลูกค้าอ่าน (ยาวและมีคำขยาย) ส่วนตรงนี้ต้องสั้นพอ
 * ที่จะอยู่ในช่องเลือกและคอลัมน์ตารางได้ — คนละงานของข้อความ
 *
 * `satisfies Record<IndustrySlug, string>` บังคับให้ครบทุกค่า ถ้าวันหน้าเพิ่ม
 * อุตสาหกรรมใหม่ใน type แล้วลืมเพิ่มที่นี่ จะฟ้องตอน build ไม่ใช่ปล่อยให้
 * ตารางขึ้นช่องว่าง
 */
export const INDUSTRY_LABEL = {
  petrochemical: 'ปิโตรเคมี',
  'oil-gas': 'น้ำมันและก๊าซ',
  chemical: 'เคมีภัณฑ์',
  'power-plant': 'โรงไฟฟ้า',
  fertilizer: 'ปุ๋ย',
  mining: 'เหมืองแร่',
  epc: 'ผู้รับเหมา EPC',
  manufacturing: 'โรงงานผลิต',
} satisfies Record<IndustrySlug, string>

export const INDUSTRY_OPTIONS = (
  Object.entries(INDUSTRY_LABEL) as [IndustrySlug, string][]
).map(([value, label]) => ({ value, label }))
