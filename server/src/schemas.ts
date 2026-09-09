import { z } from 'zod'

/**
 * รูปร่างของข้อมูลที่ API ยอมรับ — ด่านเดียวที่กันข้อมูลเสียเข้าฐานข้อมูล
 *
 * ตรวจที่นี่ที่เดียว ไม่ตรวจซ้ำใน route เพราะการมีกฎสองที่แปลว่าวันหนึ่งจะแก้ที่เดียว
 * ฝั่งหน้าเว็บมี validation ของตัวเองเพื่อบอกผู้ใช้เร็ว ๆ แต่**ห้ามถือว่าเชื่อถือได้** —
 * ใครก็ยิง POST ตรงมาที่ API ได้โดยไม่ผ่านฟอร์ม
 */

/**
 * ข้อความสองภาษา — บังคับครบทั้งคู่ตามที่ IDIE เลือกไว้
 *
 * `.trim()` มาก่อน `.min(1)` เพื่อให้ช่องที่มีแต่เว้นวรรคถูกปฏิเสธ ไม่ใช่ผ่านเข้าไป
 * เป็นข้อความว่างที่ดูเหมือนมีเนื้อหาในฐานข้อมูล
 */
const localizedText = (max: number) =>
  z.object({
    th: z.string().trim().min(1, 'กรอกภาษาไทยด้วย').max(max),
    en: z.string().trim().min(1, 'กรอกภาษาอังกฤษด้วย').max(max),
  })

/**
 * slug ที่ปลอดภัยกับ URL — a-z, 0-9 และขีดกลางเท่านั้น
 *
 * ไม่ยอมให้มีอักษรไทยแม้ URL สมัยนี้จะรองรับ เพราะ slug ไทยกลายเป็น percent-encoding
 * ยาวเหยียดเวลาแชร์ลิงก์ และทำให้ลิงก์ที่ก๊อปไปวางในอีเมลอ่านไม่ออก
 */
const slug = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug ใช้ได้เฉพาะ a-z, 0-9 และขีดกลาง เช่น new-office-rayong')

/**
 * ที่อยู่ของรูปที่อัปโหลดแล้ว
 *
 * **บังคับให้ขึ้นต้นด้วย /uploads/ เท่านั้น** — ถ้ายอมรับ URL อะไรก็ได้ คนที่ยิง API
 * ตรงจะฝัง URL ภายนอกลงหน้าเว็บของบริษัทได้ (ภาพหาย ภาพถูกสลับ หรือใช้ติดตามผู้เข้าชม)
 * และการห้าม `..` กันไม่ให้ path ชี้ออกนอกโฟลเดอร์อัปโหลด
 */
const uploadPath = z
  .string()
  .trim()
  .max(300)
  .regex(/^\/uploads\/[A-Za-z0-9._/-]+$/, 'ที่อยู่รูปต้องเป็นไฟล์ที่อัปโหลดผ่านระบบเท่านั้น')
  .refine((value) => !value.includes('..'), 'ที่อยู่รูปไม่ถูกต้อง')

const imageAsset = z.object({
  src: uploadPath,
  srcSet: z.string().trim().max(600).optional(),
  alt: localizedText(300),
  width: z.number().int().positive().max(20000).optional(),
  height: z.number().int().positive().max(20000).optional(),
})

/**
 * วันที่เผยแพร่ — รับได้ทั้ง ISO เต็มและค่าที่ `<input type="datetime-local">` ส่งมา
 * (เช่น `2026-09-01T10:30` ที่ไม่มีโซนเวลาต่อท้าย) แล้วแปลงเป็น Date ตัวเดียวกัน
 */
const dateTime = z
  .string()
  .trim()
  .min(1, 'ระบุวันที่เผยแพร่')
  .refine((value) => !Number.isNaN(Date.parse(value)), 'รูปแบบวันที่ไม่ถูกต้อง')
  .transform((value) => new Date(value))

const publishState = z.enum(['draft', 'published'])

export const newsCategory = z.enum(['company', 'project', 'product', 'article', 'event'])

export const industrySlug = z.enum([
  'petrochemical',
  'oil-gas',
  'chemical',
  'power-plant',
  'fertilizer',
  'mining',
  'epc',
  'manufacturing',
])

export const newsInput = z.object({
  slug,
  title: localizedText(300),
  excerpt: localizedText(1000),
  /** markdown — ยาวได้ถึงระดับบทความเต็ม จึงตั้งเพดานสูงกว่าช่องอื่นมาก */
  body: localizedText(60000),
  category: newsCategory,
  publishedAt: dateTime,
  status: publishState,
  featured: z.boolean(),
  cover: imageAsset.nullable(),
})

export const projectInput = z.object({
  slug,
  name: localizedText(300),
  /** ใส่ "ไม่เปิดเผย / Confidential" ได้ เมื่อลูกค้าไม่อนุญาตให้เอ่ยชื่อ */
  client: localizedText(300),
  industry: industrySlug,
  location: localizedText(300),
  /** null = ยังไม่ระบุปี ตรงกับ `year: number | null` ใน src/types/content.ts */
  year: z.number().int().min(1900).max(2200).nullable(),
  scopeOfWork: z.array(localizedText(500)).max(30),
  overview: localizedText(5000),
  engineeringSolution: localizedText(5000),
  status: publishState,
  featured: z.boolean(),
  cover: imageAsset.nullable(),
  gallery: z.array(imageAsset).max(20),
})

export const siteReferenceInput = z.object({
  name: localizedText(300),
  /** ใส่ "ไม่เปิดเผย / Confidential" ได้ เมื่อลูกค้าไม่อนุญาตให้เอ่ยชื่อ */
  customer: localizedText(300),
  location: localizedText(300),
  /** ลำดับที่แอดมินจัดเอง เลขน้อยขึ้นก่อน */
  position: z.number().int().min(0).max(9999),
  status: publishState,
  /** งานในพื้นที่หวงห้ามถ่ายรูปไม่ได้ จึงยอมให้ไม่มีภาพ */
  image: imageAsset.nullable(),
})

export const loginInput = z.object({
  username: z.string().trim().min(1, 'กรอกชื่อผู้ใช้').max(64),
  password: z.string().min(1, 'กรอกรหัสผ่าน').max(200),
})

/* -------------------------------------------------------------------------- */
/* บัญชีผู้ใช้หลังบ้าน                                                            */
/* -------------------------------------------------------------------------- */

/**
 * ความยาวรหัสผ่านขั้นต่ำ — ตัวเลขเดียวกับ `scripts/create-user.ts`
 *
 * บัญชีที่สร้างจากหน้าเว็บกับจากบรรทัดคำสั่งเข้าระบบเดียวกัน ถ้าสองทางบังคับ
 * ไม่เท่ากัน กฎที่หลวมกว่าจะกลายเป็นกฎจริงของทั้งระบบโดยไม่มีใครตั้งใจ
 */
export const MIN_PASSWORD_LENGTH = 12

const password = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `รหัสผ่านต้องยาวอย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร`)
  .max(200, 'รหัสผ่านยาวเกินไป')

/**
 * ชื่อผู้ใช้ — ตัวพิมพ์เล็กเท่านั้น เหมือนที่ `create-user` บังคับ
 *
 * ถ้ายอมให้มีตัวพิมพ์ใหญ่ จะได้ "Somchai" กับ "somchai" เป็นคนละบัญชีที่มองด้วยตา
 * แยกไม่ออกบนตาราง แล้ววันหนึ่งจะมีคนล็อกอินไม่ได้เพราะพิมพ์ชื่อตัวเองผิดปลอก
 */
const username = z
  .string()
  .trim()
  .regex(/^[a-z0-9._-]{3,64}$/, 'ใช้ได้เฉพาะ a-z 0-9 จุด ขีดล่าง ขีดกลาง ยาว 3–64 ตัว')

export const createUserInput = z.object({
  username,
  displayName: z.string().trim().min(1, 'กรอกชื่อที่แสดง').max(120),
  password,
})

export const changeOwnPasswordInput = z.object({
  currentPassword: z.string().min(1, 'กรอกรหัสผ่านปัจจุบัน').max(200),
  newPassword: password,
})

export const setPasswordInput = z.object({ newPassword: password })

export type NewsInput = z.infer<typeof newsInput>
export type ProjectInput = z.infer<typeof projectInput>
export type SiteReferenceInput = z.infer<typeof siteReferenceInput>

/**
 * แปลงผลของ zod เป็นข้อความที่แอดมินอ่านรู้เรื่อง
 *
 * ส่งกลับเป็น map ของ `ชื่อฟิลด์ → ข้อความ` เพื่อให้ฟอร์มฝั่งหน้าเว็บเอาไปแปะ
 * ใต้ช่องที่ผิดได้ตรงช่อง ไม่ใช่กองรวมเป็นก้อนเดียวบนหัวฟอร์ม
 */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {}
  for (const issue of error.issues) {
    const path = issue.path.join('.')
    if (!(path in result)) result[path] = issue.message
  }
  return result
}
