import { existsSync, readFileSync } from 'node:fs'
import { dirname, isAbsolute, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * ค่าตั้งต้นทั้งหมดของเซิร์ฟเวอร์ — อ่านครั้งเดียวตอนบูตแล้วตรึงไว้
 *
 * **ล้มตั้งแต่บูตถ้าค่าจำเป็นหาย** ไม่ใช่ปล่อยให้รันไปแล้วพังตอนมีคนเรียก API จริง
 * เซิร์ฟเวอร์ที่ start ขึ้นแต่ต่อฐานข้อมูลไม่ได้คือเซิร์ฟเวอร์ที่หลอกคนดูแลระบบ
 * ว่าทุกอย่างปกติ ทั้งที่หน้าเว็บโหลดข่าวไม่ได้สักข่าว
 *
 * อ่าน .env เองด้วยโค้ดสิบบรรทัดแทนการติดตั้ง dotenv — ไฟล์นี้ต้องรองรับแค่
 * `KEY=value` กับบรรทัดคอมเมนต์ ไม่ต้องการ multiline หรือ variable expansion
 */

const here = dirname(fileURLToPath(import.meta.url))
/** โฟลเดอร์ server/ — ใช้เป็นฐานของ path สัมพัทธ์ทุกอันในไฟล์นี้ */
export const SERVER_ROOT = resolve(here, '..')

function loadDotEnv(path: string) {
  if (!existsSync(path)) return

  for (const rawLine of readFileSync(path, 'utf8').split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const eq = line.indexOf('=')
    if (eq === -1) continue

    const key = line.slice(0, eq).trim()
    // ตัดเครื่องหมายคำพูดที่คนมักใส่มาโดยไม่ตั้งใจ — ค่าที่ได้ต้องไม่มี " ติดหัวท้าย
    const value = line
      .slice(eq + 1)
      .trim()
      .replace(/^(['"])(.*)\1$/, '$2')

    // ตัวแปรที่ตั้งมาจาก shell ชนะไฟล์ .env เสมอ — จำเป็นตอน deploy ด้วย systemd
    // หรือ container ที่ส่งค่าเข้ามาทาง environment ไม่ใช่ทางไฟล์
    if (process.env[key] === undefined) process.env[key] = value
  }
}

loadDotEnv(resolve(SERVER_ROOT, '.env'))

function required(key: string): string {
  const value = process.env[key]?.trim()
  if (!value) {
    throw new Error(
      `ขาดค่า ${key} — คัดลอก server/.env.example เป็น server/.env แล้วกรอกให้ครบก่อนรัน`,
    )
  }
  return value
}

function optional(key: string, fallback: string): string {
  return process.env[key]?.trim() || fallback
}

function number(key: string, fallback: number): number {
  const raw = process.env[key]?.trim()
  if (!raw) return fallback

  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) throw new Error(`ค่า ${key} ต้องเป็นตัวเลข แต่ได้ "${raw}"`)
  return parsed
}

function boolean(key: string, fallback: boolean): boolean {
  const raw = process.env[key]?.trim().toLowerCase()
  if (!raw) return fallback
  return raw === 'true' || raw === '1' || raw === 'yes'
}

const sessionSecret = required('SESSION_SECRET')
if (sessionSecret.length < 32) {
  throw new Error(
    'SESSION_SECRET สั้นเกินไป — ต้องยาวอย่างน้อย 32 ตัวอักษร ' +
      'สร้างด้วย: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"',
  )
}

const uploadDirSetting = optional('UPLOAD_DIR', 'uploads')

export const env = {
  port: number('PORT', 3001),
  isProduction: process.env.NODE_ENV === 'production',

  db: {
    host: optional('DB_HOST', '127.0.0.1'),
    port: number('DB_PORT', 3306),
    user: required('DB_USER'),
    password: process.env.DB_PASSWORD ?? '',
    database: optional('DB_NAME', 'idie_website'),
  },

  session: {
    secret: sessionSecret,
    cookieSecure: boolean('SESSION_COOKIE_SECURE', false),
  },

  uploads: {
    /** absolute path เสมอ — โค้ดที่เขียนไฟล์ไม่ควรต้องเดาว่า cwd อยู่ตรงไหน */
    dir: isAbsolute(uploadDirSetting)
      ? uploadDirSetting
      : resolve(SERVER_ROOT, uploadDirSetting),
    maxBytes: number('UPLOAD_MAX_MB', 12) * 1024 * 1024,
  },

  /**
   * SMTP สำหรับแบบฟอร์มติดต่อ
   *
   * **ไม่บังคับ** ต่างจากค่าฐานข้อมูล — ถ้าไม่ตั้ง เซิร์ฟเวอร์ยังรันได้ปกติ
   * เพียงแต่ฟอร์มติดต่อจะตอบกลับว่าใช้ไม่ได้ชั่วคราวและบอกให้ติดต่อทางอื่นแทน
   * เพราะการบังคับให้มีบัญชีอีเมลก่อนถึงจะเปิดเว็บดูในเครื่องตัวเองได้นั้นเกินจำเป็น
   */
  mail: {
    host: optional('SMTP_HOST', ''),
    port: number('SMTP_PORT', 587),
    user: optional('SMTP_USER', ''),
    password: process.env.SMTP_PASSWORD ?? '',
    /** ผู้ส่งที่แสดงในจดหมาย — ต้องเป็นบัญชีของเราเอง ไม่ใช่อีเมลของผู้กรอกฟอร์ม */
    from: optional('MAIL_FROM', optional('SMTP_USER', '')),
    /** ปลายทางที่รับคำถามจากเว็บ */
    to: optional('MAIL_TO', ''),
  },

  /** โฟลเดอร์ผลลัพธ์ของ `npm run build` ฝั่งหน้าเว็บ — เสิร์ฟตอน production */
  webDist: resolve(SERVER_ROOT, '..', 'dist'),
} as const
