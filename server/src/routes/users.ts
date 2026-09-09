import { Router, type Request } from 'express'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { currentUser, hashPassword, verifyPassword } from '../auth.ts'
import { pool } from '../db.ts'
import { badRequest, conflict, notFound, route, unauthorized } from '../http.ts'
import {
  changeOwnPasswordInput,
  createUserInput,
  fieldErrors,
  setPasswordInput,
} from '../schemas.ts'

/**
 * จัดการบัญชีผู้ใช้หลังบ้าน — `/api/admin/users`
 *
 * **ต่างจากหน้าสมัครสมาชิกตรงที่ทั้ง router อยู่ใต้ `requireAuth`** — คนที่ยังไม่มี
 * บัญชีเปิดหน้านี้ไม่ได้เลย จึงไม่ใช่ช่องให้ใครก็ได้สร้างบัญชีที่แก้เนื้อหาเว็บบริษัทได้
 * ซึ่งเป็นเหตุผลเดิมที่ระบบนี้ให้สร้างบัญชีจากบรรทัดคำสั่งเท่านั้น
 *
 * ทุกบัญชีสิทธิ์เท่ากันตามที่ออกแบบไว้ตั้งแต่ต้น (ตาราง users ไม่มีคอลัมน์ role)
 * แอดมินทุกคนจึงเพิ่ม ลบ และตั้งรหัสใหม่ให้กันได้ — เหมาะกับทีมไม่กี่คนที่รู้จักกัน
 * ถ้าวันหนึ่งมีผู้ใช้หลายสิบคนค่อยเพิ่มสิทธิ์เป็นระดับ ๆ
 */
export const adminUsersRouter = Router()

interface AccountRow extends RowDataPacket {
  id: number
  username: string
  display_name: string
  created_at: Date
}

interface PasswordRow extends RowDataPacket {
  password_hash: string
}

function isDuplicate(error: unknown): boolean {
  return (
    typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_DUP_ENTRY'
  )
}

/**
 * ลบเซสชันที่ค้างอยู่ของบัญชีหนึ่ง
 *
 * **จำเป็นเพราะรหัสผ่านที่เปลี่ยนแล้วไม่ได้ทำให้เซสชันเดิมหมดอายุเอง** — คนที่ยัง
 * ล็อกอินค้างในเบราว์เซอร์อีกเครื่องจะแก้เนื้อหาต่อได้อีก 12 ชั่วโมงจนกว่าคุกกี้จะหมดอายุ
 * ซึ่งผิดความคาดหมายของคนที่เพิ่งตั้งรหัสใหม่เพราะสงสัยว่ารหัสเดิมรั่ว
 *
 * ค้นด้วย LIKE เพราะ express-mysql-session เก็บทั้งเซสชันเป็น JSON ก้อนเดียวใน
 * คอลัมน์ `data` ไม่มีคอลัมน์ user_id ให้ join — รูปแบบที่ค้นคือ `"user":{"id":N,`
 * ซึ่งตรงกับลำดับคีย์ที่ตอนล็อกอินเขียนลงไป (`{ id, username, displayName }`)
 * ถ้าวันหนึ่งลำดับนั้นเปลี่ยน การล้างจะเงียบ ๆ ไม่เจอแถว ไม่ได้ทำให้ระบบพัง
 * แต่เซสชันเก่าจะอยู่ต่อจนหมดอายุ — จึงต้องแก้ที่นี่ด้วยถ้าแก้รูปร่าง SessionUser
 */
async function revokeSessions(userId: number) {
  await pool.query(`DELETE FROM sessions WHERE data LIKE CONCAT('%"user":{"id":', ?, ',%')`, [
    userId,
  ])
}

/** ออกเซสชันใหม่ให้เครื่องที่กำลังใช้งานอยู่ หลังจากเซสชันเดิมถูกล้างไปพร้อมของคนอื่น */
async function reissueSession(req: Request) {
  const user = currentUser(req)
  await new Promise<void>((resolve, reject) => {
    req.session.regenerate((error) => (error ? reject(error) : resolve()))
  })
  req.session.user = user
  await new Promise<void>((resolve, reject) => {
    req.session.save((error) => (error ? reject(error) : resolve()))
  })
}

/**
 * อ่านรหัสบัญชีจาก path
 *
 * รับเป็น `unknown` เพราะชนิดของ `req.params` ใน Express 5 เป็น `string | string[]`
 * (รองรับ wildcard ที่ซ้ำได้) — กันไว้ตรงนี้ทีเดียวว่าต้องเป็นสตริงที่เป็นจำนวนเต็มบวก
 * ดีกว่าปล่อยค่าแปลก ๆ ไหลลงไปถึง SQL แล้วหวังว่าจะไม่ตรงกับแถวไหน
 */
function accountId(raw: unknown): number {
  const id = typeof raw === 'string' ? Number(raw) : Number.NaN
  if (!Number.isInteger(id) || id <= 0) throw badRequest('รหัสบัญชีไม่ถูกต้อง')
  return id
}

adminUsersRouter.get(
  '/',
  route(async (_req, res) => {
    // ไม่ส่ง password_hash ออกไปแม้จะอยู่หลังการล็อกอิน — ข้อมูลที่ไม่ได้ส่ง
    // คือข้อมูลที่รั่วไม่ได้ ไม่ว่าหน้าเว็บจะเผลอเก็บมันไว้ที่ไหน
    const [rows] = await pool.query<AccountRow[]>(
      'SELECT id, username, display_name, created_at FROM users ORDER BY username',
    )

    res.json(
      rows.map((row) => ({
        id: row.id,
        username: row.username,
        displayName: row.display_name,
        createdAt: new Date(row.created_at).toISOString(),
      })),
    )
  }),
)

adminUsersRouter.post(
  '/',
  route(async (req, res) => {
    const parsed = createUserInput.safeParse(req.body)
    if (!parsed.success) throw badRequest('ข้อมูลไม่ครบหรือไม่ถูกต้อง', fieldErrors(parsed.error))

    const passwordHash = await hashPassword(parsed.data.password)

    try {
      const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO users (username, display_name, password_hash) VALUES (?, ?, ?)',
        [parsed.data.username, parsed.data.displayName, passwordHash],
      )
      res.status(201).json({ id: result.insertId })
    } catch (error) {
      if (isDuplicate(error)) throw conflict('มีชื่อผู้ใช้นี้ในระบบแล้ว')
      throw error
    }
  }),
)

/**
 * เปลี่ยนรหัสผ่านของตัวเอง
 *
 * ประกาศก่อน `/:id/password` เพราะ Express จับคู่ตามลำดับที่ประกาศ — ถ้าอยู่ทีหลัง
 * คำว่า "me" จะถูกอ่านเป็นรหัสบัญชีแล้วตกไปที่ตัวตรวจว่าเป็นตัวเลขจนตอบ 400
 *
 * ต้องกรอกรหัสเดิมด้วย ไม่ใช่เพราะเซิร์ฟเวอร์ไม่รู้ว่าใครเป็นใคร (เซสชันบอกอยู่แล้ว)
 * แต่เพราะคอมพิวเตอร์ที่เปิดหลังบ้านค้างไว้แล้วลุกไปเข้าห้องน้ำ ไม่ควรกลายเป็น
 * ช่องให้คนที่เดินผ่านยึดบัญชีไปเลยด้วยการตั้งรหัสใหม่
 */
adminUsersRouter.post(
  '/me/password',
  route(async (req, res) => {
    const actor = currentUser(req)
    const parsed = changeOwnPasswordInput.safeParse(req.body)
    if (!parsed.success) throw badRequest('ข้อมูลไม่ถูกต้อง', fieldErrors(parsed.error))

    const [rows] = await pool.query<PasswordRow[]>(
      'SELECT password_hash FROM users WHERE id = ? LIMIT 1',
      [actor.id],
    )
    const row = rows[0]
    // บัญชีถูกลบไประหว่างที่แท็บนี้เปิดค้าง — เซสชันยังอยู่แต่เจ้าของไม่อยู่แล้ว
    if (!row) throw unauthorized('บัญชีนี้ไม่อยู่ในระบบแล้ว')

    if (!(await verifyPassword(parsed.data.currentPassword, row.password_hash))) {
      throw badRequest('รหัสผ่านปัจจุบันไม่ถูกต้อง', {
        currentPassword: 'รหัสผ่านปัจจุบันไม่ถูกต้อง',
      })
    }

    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [
      await hashPassword(parsed.data.newPassword),
      actor.id,
    ])

    // ล้างทุกเซสชันของบัญชีนี้ (รวมเครื่องนี้) แล้วออกใบใหม่ให้เฉพาะเครื่องที่เพิ่งเปลี่ยน
    // — เครื่องอื่นที่ยังล็อกอินค้างจึงหลุดทันที ตรงกับที่คนเปลี่ยนรหัสคาดหวัง
    await revokeSessions(actor.id)
    await reissueSession(req)

    res.json({ ok: true })
  }),
)

/**
 * ตั้งรหัสใหม่ให้บัญชีอื่น — ทางกู้คืนเมื่อมีคนลืมรหัสผ่าน
 *
 * ไม่ต้องกรอกรหัสเดิมของบัญชีนั้น เพราะคนที่ลืมคือเจ้าของบัญชีเอง คนที่กดคือแอดมิน
 * อีกคนซึ่งพิสูจน์ตัวตนด้วยเซสชันของตัวเองมาแล้ว จากนั้นบอกรหัสชั่วคราวให้เจ้าของ
 * ไปเปลี่ยนเองที่หน้า "เปลี่ยนรหัสผ่านของฉัน"
 */
adminUsersRouter.post(
  '/:id/password',
  route(async (req, res) => {
    const actor = currentUser(req)
    const id = accountId(req.params.id)

    const parsed = setPasswordInput.safeParse(req.body)
    if (!parsed.success) throw badRequest('ข้อมูลไม่ถูกต้อง', fieldErrors(parsed.error))

    const [rows] = await pool.query<AccountRow[]>('SELECT id FROM users WHERE id = ? LIMIT 1', [id])
    if (!rows[0]) throw notFound('ไม่พบบัญชีนี้')

    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [
      await hashPassword(parsed.data.newPassword),
      id,
    ])
    await revokeSessions(id)

    // ถ้าเผลอตั้งรหัสของตัวเองจากตาราง เซสชันปัจจุบันเพิ่งถูกล้างไปด้วย
    // ต้องออกใบใหม่ ไม่งั้นคำขอถัดไปตอบ 401 แล้วเด้งกลับหน้าล็อกอินทันที
    if (id === actor.id) await reissueSession(req)

    res.json({ ok: true })
  }),
)

adminUsersRouter.delete(
  '/:id',
  route(async (req, res) => {
    const actor = currentUser(req)
    const id = accountId(req.params.id)

    /*
      ห้ามลบบัญชีตัวเอง — ข้อห้ามข้อเดียวนี้รับประกันว่าจะเหลืออย่างน้อยหนึ่งบัญชีเสมอ
      เพราะคนที่กดลบต้องล็อกอินอยู่ ระบบจึงไม่มีทางว่างเปล่าจนไม่มีใครเข้าหลังบ้านได้
      (ถ้าจะเลิกใช้บัญชีตัวเอง ให้แอดมินอีกคนเป็นคนลบให้)
    */
    if (id === actor.id) {
      throw badRequest('ลบบัญชีของตัวเองไม่ได้ — ให้แอดมินอีกคนเป็นคนลบให้')
    }

    const [result] = await pool.query<ResultSetHeader>('DELETE FROM users WHERE id = ?', [id])
    if (result.affectedRows === 0) throw notFound('ไม่พบบัญชีนี้')

    // เซสชันที่ค้างอยู่ต้องหายไปพร้อมบัญชี ไม่งั้นคนที่ถูกลบยังแก้เนื้อหาต่อได้
    // จนกว่าคุกกี้จะหมดอายุ ซึ่งเป็นเหตุผลหลักที่กดลบตั้งแต่แรก
    await revokeSessions(id)

    res.json({ ok: true })
  }),
)
