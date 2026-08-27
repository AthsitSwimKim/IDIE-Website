/**
 * Config รวมศูนย์
 *
 * ทุกอย่างที่จะเปลี่ยนตอนต่อ backend หรือเปิด/ปิดฟีเจอร์ต้องอยู่ที่นี่ไฟล์เดียว
 * เพื่อให้ตอบคำถาม "ถ้าจะต่อ API ต้องแก้ตรงไหน" ได้ด้วยไฟล์เดียว
 */

export const config = {
  /** ว่างไว้จนกว่าจะมี backend จริง — data layer อ่านค่านี้เพื่อสลับ source */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',

  /**
   * 3D ยังไม่ถึงเวลา (Phase 5) — flag นี้มีไว้ตั้งแต่ตอนนี้เพื่อให้
   * QA ปิดแล้วพิสูจน์ได้ว่าเว็บใช้งานได้ครบโดยไม่มี WebGL
   */
  enable3d: false,

  /** ปีก่อตั้ง — ข้อมูลจริงจากเว็บบริษัท ใช้คำนวณปีประสบการณ์แทนการ hardcode ตัวเลข */
  foundedYear: 1996,

  defaultLocale: 'th' as const,
  localeStorageKey: 'idie.locale',
} as const

/** ปีประสบการณ์ที่คำนวณจากปีก่อตั้งจริง — ไม่ใช่ตัวเลขที่แต่งขึ้น */
export function yearsOfExperience(now: Date = new Date()): number {
  return now.getFullYear() - config.foundedYear
}
