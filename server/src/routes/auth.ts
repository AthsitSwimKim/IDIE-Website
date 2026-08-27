import { Router } from 'express'
import type { RowDataPacket } from 'mysql2'
import { currentUser, verifyPassword } from '../auth.ts'
import { pool } from '../db.ts'
import { badRequest, HttpError, route, unauthorized } from '../http.ts'
import { fieldErrors, loginInput } from '../schemas.ts'
import { uploadMiddleware, storeImage } from '../uploads.ts'

export const authRouter = Router()

interface UserRow extends RowDataPacket {
  id: number
  username: string
  display_name: string
  password_hash: string
}

authRouter.post(
  '/login',
  route(async (req, res) => {
    const parsed = loginInput.safeParse(req.body)
    if (!parsed.success) throw badRequest('กรอกข้อมูลไม่ครบ', fieldErrors(parsed.error))

    const [rows] = await pool.query<UserRow[]>(
      'SELECT id, username, display_name, password_hash FROM users WHERE username = ? LIMIT 1',
      [parsed.data.username],
    )
    const user = rows[0]

    /**
     * ตอบข้อความเดียวกันทั้งกรณี "ไม่มีผู้ใช้นี้" และ "รหัสผ่านผิด"
     *
     * ถ้าแยกข้อความ ใครก็ตามที่ยิงลองชื่อผู้ใช้ไปเรื่อย ๆ จะได้รายชื่อบัญชีจริง
     * ทั้งหมดในระบบมาฟรี ๆ ซึ่งเป็นครึ่งแรกของการเจาะรหัสผ่าน
     */
    if (!user || !(await verifyPassword(parsed.data.password, user.password_hash))) {
      throw unauthorized('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
    }

    /**
     * ออก session id ใหม่หลังล็อกอินสำเร็จ (session fixation)
     *
     * ถ้าใช้ id เดิมต่อ ผู้โจมตีที่ทำให้เหยื่อใช้ session id ที่ตัวเองรู้ค่าอยู่แล้ว
     * จะได้สิทธิ์ตามไปด้วยทันทีที่เหยื่อล็อกอินสำเร็จ
     */
    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((error) => (error ? reject(error) : resolve()))
    })

    req.session.user = {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
    }

    await new Promise<void>((resolve, reject) => {
      req.session.save((error) => (error ? reject(error) : resolve()))
    })

    res.json({ user: req.session.user })
  }),
)

authRouter.post(
  '/logout',
  route(async (req, res) => {
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((error) => (error ? reject(error) : resolve()))
    })
    res.clearCookie('idie.sid')
    res.json({ ok: true })
  }),
)

/**
 * หน้าแอดมินเรียกตัวนี้ตอนโหลดเพื่อรู้ว่ายังล็อกอินอยู่ไหม
 *
 * ตอบ 200 พร้อม `user: null` แทนการตอบ 401 เมื่อยังไม่ได้ล็อกอิน เพราะนี่คือ
 * "คำถาม" ไม่ใช่ "การเข้าถึงที่ถูกปฏิเสธ" — ตอบ 401 จะทำให้ console เต็มไปด้วย
 * error สีแดงทุกครั้งที่เปิดหน้า login ซึ่งกลบ error จริงที่ควรสังเกตเห็น
 */
authRouter.get(
  '/me',
  route(async (req, res) => {
    res.json({ user: req.session.user ?? null })
  }),
)

/* -------------------------------------------------------------------------- */
/* อัปโหลดรูป — อยู่ใต้ /api/admin จึงผ่าน requireAuth มาแล้ว                      */
/* -------------------------------------------------------------------------- */

export const uploadRouter = Router()

uploadRouter.post(
  '/',
  uploadMiddleware.single('file'),
  route(async (req, res) => {
    // บันทึกว่าใครอัปโหลด เผื่อต้องไล่ย้อนว่าไฟล์ไหนมาจากไหน
    const user = currentUser(req)
    if (!req.file) throw badRequest('ไม่พบไฟล์ที่อัปโหลด')

    const stored = await storeImage(req.file.buffer)
    console.log(`[upload] ${user.username} → ${stored.src} (${stored.width}×${stored.height})`)
    res.status(201).json(stored)
  }),
)

/**
 * แปลง error ของ multer ให้เป็นข้อความที่แอดมินเข้าใจ
 *
 * multer โยน `MulterError` ที่มี `code` เป็นสตริงแบบ `LIMIT_FILE_SIZE` ซึ่งถ้าปล่อย
 * ไปถึงตัวจัดการกลางจะกลายเป็น 500 "เกิดข้อผิดพลาดภายในระบบ" ทั้งที่ความจริงคือ
 * ไฟล์ใหญ่เกิน — ผู้ใช้ควรได้รู้ว่าต้องย่อรูปก่อน ไม่ใช่คิดว่าระบบพัง
 */
uploadRouter.use(
  (error: unknown, _req: import('express').Request, _res: import('express').Response, next: import('express').NextFunction) => {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        next(new HttpError(413, 'ไฟล์ใหญ่เกินกำหนด — ย่อรูปก่อนแล้วลองใหม่'))
        return
      }
      if (error.code === 'LIMIT_FILE_COUNT' || error.code === 'LIMIT_UNEXPECTED_FILE') {
        next(badRequest('อัปโหลดได้ครั้งละหนึ่งไฟล์'))
        return
      }
    }
    next(error)
  },
)
