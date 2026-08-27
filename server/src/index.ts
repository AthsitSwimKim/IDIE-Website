import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import express from 'express'
import session from 'express-session'
import MySQLStoreFactory from 'express-mysql-session'
import { requireAuth } from './auth.ts'
import { assertDatabaseReachable, closePool, pool } from './db.ts'
import { env } from './env.ts'
import { errorHandler, notFound } from './http.ts'
import { authRouter, uploadRouter } from './routes/auth.ts'
import { adminNewsRouter, publicNewsRouter } from './routes/news.ts'
import { adminProjectsRouter, publicProjectsRouter } from './routes/projects.ts'

const app = express()

/**
 * `trust proxy` จำเป็นเมื่ออยู่หลัง nginx/Caddy
 *
 * ถ้าไม่ตั้ง Express จะเห็นทุก request มาจาก 127.0.0.1 และเป็น http ทำให้คุกกี้
 * ที่ตั้ง `secure: true` ไม่ถูกส่งออกไปเลย อาการคือล็อกอินผ่านแต่เด้งกลับทันที
 */
app.set('trust proxy', 1)
app.disable('x-powered-by')

app.use(express.json({ limit: '1mb' }))

/**
 * **ไม่มี CORS ในเซิร์ฟเวอร์นี้โดยตั้งใจ**
 *
 * ตอน production เซิร์ฟเวอร์ตัวนี้เสิร์ฟทั้งหน้าเว็บ API และรูปจาก origin เดียวกัน
 * ส่วนตอน dev ให้ Vite proxy `/api` กับ `/uploads` มาที่นี่ (ดู vite.config.ts)
 * เบราว์เซอร์จึงเห็นเป็น origin เดียวกันทั้งสองสภาพแวดล้อม
 *
 * ผลคือคุกกี้เซสชันทำงานโดยไม่ต้องพึ่ง `SameSite=None` และไม่มีรายการ origin
 * ที่อนุญาตให้ใครเผลอเปิดกว้างเกินในภายหลัง — ถ้าวันหนึ่งต้องให้โดเมนอื่นเรียก API
 * จริง ๆ ให้เพิ่ม CORS อย่างตั้งใจพร้อมรายการ origin ที่จำกัด ไม่ใช่เปิด `*`
 */

const MySQLStore = MySQLStoreFactory(session as never)

app.use(
  session({
    name: 'idie.sid',
    secret: env.session.secret,
    // ไม่ต้องเขียนกลับทุก request ถ้าไม่มีอะไรเปลี่ยน — ลดภาระ MySQL
    resave: false,
    // ไม่สร้างแถวเซสชันให้ผู้เข้าชมที่ยังไม่ได้ล็อกอิน ไม่งั้นตารางจะบวมด้วย
    // เซสชันเปล่าของบอตที่เข้ามาหน้าแรก
    saveUninitialized: false,
    /**
     * ส่ง `pool.pool` ไม่ใช่ `pool`
     *
     * `pool` ของเราเป็นตัวห่อแบบ promise จาก `mysql2/promise` แต่ express-mysql-session
     * เขียนด้วย callback จึงต้องการ pool แกนกลางที่อยู่ข้างใน การใช้ pool เดียวกัน
     * (ไม่เปิดใหม่) แปลว่าเซสชันกับข้อมูลใช้ connection ชุดเดียวและปิดพร้อมกันตอน shutdown
     *
     * `createDatabaseTable: false` เพราะตาราง sessions ประกาศไว้ใน schema.sql แล้ว —
     * ผู้ใช้ฐานข้อมูลของแอปจึงไม่ต้องมีสิทธิ์ CREATE TABLE ตอนรันจริง
     */
    store: new MySQLStore(
      { createDatabaseTable: false, schema: { tableName: 'sessions' } },
      pool.pool,
    ),
    cookie: {
      httpOnly: true, // JS อ่านไม่ได้ = XSS ขโมยเซสชันไปตรง ๆ ไม่ได้
      sameSite: 'lax', // กัน CSRF ระดับพื้นฐานโดยไม่พังลิงก์ที่มาจากเว็บอื่น
      secure: env.session.cookieSecure,
      maxAge: 12 * 60 * 60 * 1000, // 12 ชั่วโมง — ครอบหนึ่งวันทำงานพอดี
    },
  }),
)

/* -------------------------------------------------------------------------- */
/* ไฟล์ที่อัปโหลด                                                                */
/* -------------------------------------------------------------------------- */

/**
 * เสิร์ฟรูปจากโฟลเดอร์บนดิสก์ (local path ตามที่ตกลงไว้)
 *
 * `express.static` กัน path traversal ให้อยู่แล้ว และ `immutable` ใช้ได้เพราะ
 * ชื่อไฟล์เป็นค่าสุ่มที่ไม่มีวันถูกเขียนทับ — แก้รูปคือได้ชื่อใหม่เสมอ
 */
app.use(
  '/uploads',
  express.static(env.uploads.dir, {
    maxAge: '365d',
    immutable: true,
    index: false,
    // ไม่ต้องเดานามสกุลให้ — ทุกไฟล์ในนี้เป็น .webp ที่เราเขียนเองทั้งหมด
    extensions: false,
    dotfiles: 'deny',
  }),
)

/* -------------------------------------------------------------------------- */
/* API                                                                         */
/* -------------------------------------------------------------------------- */

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', authRouter)
app.use('/api/news', publicNewsRouter)
app.use('/api/projects', publicProjectsRouter)

/**
 * ทุกอย่างใต้ /api/admin ต้องล็อกอิน — บังคับที่จุดเดียวตรงนี้
 *
 * ถ้าไปแปะ requireAuth ทีละ endpoint วันที่มีคนเพิ่ม endpoint ใหม่แล้วลืมแปะ
 * จะได้ช่องแก้ข้อมูลโดยไม่ต้องล็อกอิน โดยไม่มีอะไรฟ้อง
 */
const adminRouter = express.Router()
adminRouter.use(requireAuth)
adminRouter.use('/news', adminNewsRouter)
adminRouter.use('/projects', adminProjectsRouter)
adminRouter.use('/uploads', uploadRouter)
app.use('/api/admin', adminRouter)

// เส้นทางใต้ /api ที่ไม่ตรงอันไหนเลย ต้องตอบ JSON 404 ไม่ใช่ตกไปที่ SPA fallback
// ด้านล่างแล้วได้ HTML กลับมา ซึ่งทำให้ฝั่งหน้าเว็บ error ว่า "Unexpected token <"
app.use('/api', (_req, _res, next) => next(notFound('ไม่พบ endpoint นี้')))

/* -------------------------------------------------------------------------- */
/* หน้าเว็บ (เฉพาะ production)                                                   */
/* -------------------------------------------------------------------------- */

/**
 * ตอน production เสิร์ฟ `dist/` จากเซิร์ฟเวอร์ตัวเดียวกัน
 *
 * ได้ origin เดียวกันทั้งหน้าเว็บ API และรูป — ไม่มี CORS ไม่ต้องตั้งค่า base URL
 * ในหน้าเว็บ และคุกกี้เซสชันทำงานโดยไม่ต้องพึ่ง SameSite=None
 *
 * ตอน dev ข้ามส่วนนี้ไป เพราะ Vite เป็นคนเสิร์ฟหน้าเว็บพร้อม hot reload
 */
if (env.isProduction && existsSync(env.webDist)) {
  /**
   * ไฟล์ใน `assets/` มี hash ของเนื้อหาอยู่ในชื่อ (`index-CvGL5Kts.js`)
   * เนื้อหาเปลี่ยน = ชื่อเปลี่ยน จึงแคชถาวรได้อย่างปลอดภัยและ**ควรทำ** —
   * ค่าเริ่มต้นของ express.static คือ `max-age=0` ซึ่งบังคับให้เบราว์เซอร์
   * ยิงถามเซิร์ฟเวอร์ทุกไฟล์ทุกครั้งที่เข้าเว็บ ทั้งที่ไฟล์ไม่มีวันเปลี่ยน
   */
  app.use(
    '/assets',
    express.static(join(env.webDist, 'assets'), {
      maxAge: '365d',
      immutable: true,
      index: false,
    }),
  )

  // ที่เหลือ (favicon, webmanifest, รูปใน public/) ไม่มี hash ในชื่อ
  // จึงแคชสั้น ๆ พอให้ไม่ยิงซ้ำถี่ แต่ยังเปลี่ยนตามได้ภายในวันเดียว
  app.use(express.static(env.webDist, { index: false, maxAge: '1d' }))

  /**
   * SPA fallback — ทุก path ที่ไม่ใช่ไฟล์จริงต้องได้ index.html เพื่อให้ React Router
   * จัดการเส้นทางเอง ไม่งั้นการรีเฟรชหน้า /admin/news จะได้ 404 จาก Express
   *
   * `no-store` สำคัญ: index.html คือไฟล์เดียวที่ชี้ว่า asset ชุดไหนคือชุดล่าสุด
   * ถ้าเบราว์เซอร์แคชไว้ ผู้ใช้จะยังโหลดเว็บเวอร์ชันเก่าต่อไปหลัง deploy
   * โดยที่ไฟล์ asset เก่าก็ยังอยู่ (เพราะ hash คนละตัว) จึงไม่มีอะไรพังให้เห็น
   */
  app.get(/.*/, (_req, res) => {
    res.setHeader('Cache-Control', 'no-store')
    res.sendFile(join(env.webDist, 'index.html'))
  })
}

app.use(errorHandler)

/* -------------------------------------------------------------------------- */
/* บูต                                                                         */
/* -------------------------------------------------------------------------- */

async function main() {
  await assertDatabaseReachable()
  await mkdir(env.uploads.dir, { recursive: true })

  const server = app.listen(env.port, () => {
    console.log(`IDIE API พร้อมใช้งานที่ http://localhost:${env.port}`)
    console.log(`  ฐานข้อมูล : ${env.db.user}@${env.db.host}:${env.db.port}/${env.db.database}`)
    console.log(`  โฟลเดอร์รูป: ${env.uploads.dir}`)
  })

  // ปิดให้เรียบร้อยเมื่อถูกสั่งหยุด — ไม่ตัด request ที่กำลังทำงานอยู่กลางคัน
  // และคืน connection ให้ MySQL แทนที่จะปล่อยให้หมดเวลาเอง
  const shutdown = async () => {
    server.close()
    await closePool()
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
