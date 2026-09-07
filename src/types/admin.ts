import type { ImageAsset, NewsArticle, Project, SiteReference } from '@/types/content'

/**
 * รูปร่างข้อมูลฝั่งแอดมิน — ต่างจากฝั่งสาธารณะสองจุด
 *
 * 1. มี `id` และ `status` ซึ่งหน้าเว็บสาธารณะไม่ควรรู้ (และ API สาธารณะไม่ส่งมาให้)
 * 2. `cover` เป็น `null` ได้ตรง ๆ — ฟอร์มต้องแยกออกว่า "ยังไม่ได้ใส่ปก" กับ
 *    "ใส่ปกเป็นภาพตัวยึดพื้นที่" ต่างกัน ส่วนฝั่งสาธารณะรับเป็น ImageAsset เสมอ
 *    เพราะ component ที่วาดการ์ดไม่ควรต้องเขียนเงื่อนไข null ทุกที่
 */

export type PublishStatus = 'draft' | 'published'

export interface AdminNews extends Omit<NewsArticle, 'cover'> {
  id: number
  status: PublishStatus
  cover: ImageAsset | null
}

export interface AdminProject extends Omit<Project, 'cover'> {
  id: number
  status: PublishStatus
  cover: ImageAsset | null
}

export interface AdminUser {
  id: number
  username: string
  displayName: string
}

/** ผลลัพธ์ของการอัปโหลดรูป — ตรงกับ `StoredImage` ที่เซิร์ฟเวอร์ส่งกลับ */
export interface UploadedImage {
  src: string
  srcSet?: string
  width: number
  height: number
}

/**
 * ฝั่งแอดมินมี `position` กับ `status` เพิ่มจากฝั่งสาธารณะ
 *
 * `image` เป็น null ได้อยู่แล้วทั้งสองฝั่ง ต่างจากข่าวและผลงาน เพราะงานในพื้นที่
 * หวงห้ามถ่ายรูปไม่ได้ — ดูเหตุผลเต็มใน server/src/mappers.ts
 */
export interface AdminSiteReference extends SiteReference {
  position: number
  status: PublishStatus
}
