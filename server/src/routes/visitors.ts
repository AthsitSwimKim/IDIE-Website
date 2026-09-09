import { Router } from 'express'
import type { RowDataPacket } from 'mysql2'
import { env } from '../env.ts'
import { pool } from '../db.ts'
import { route } from '../http.ts'

/**
 * ตัวนับผู้เข้าชมเว็บไซต์ — `/api/visitors`
 *
 * **นับ "ผู้เข้าชม" ไม่ใช่ "จำนวนหน้าที่เปิด"** — คนเดิมที่กดดูสิบหน้าในการเข้าครั้งเดียว
 * ต้องนับเป็นหนึ่ง ไม่งั้นตัวเลขบนหน้าเว็บจะโตเร็วกว่าความจริงหลายเท่าและกลายเป็น
 * ตัวเลขที่ไม่มีความหมาย ลูกค้าที่สังเกตเห็นจะไม่เชื่อตัวเลขอื่นบนเว็บไปด้วย
 *
 * กันนับซ้ำสองชั้น:
 * 1. คุกกี้อายุ 24 ชั่วโมงบนเบราว์เซอร์ของผู้เข้าชม — ชั้นหลักที่ทำให้นับหนึ่งคนต่อวัน
 * 2. ตารางความถี่ต่อ IP ในหน่วยความจำ — กันคนที่ยิงตรงมาที่ endpoint โดยไม่รับคุกกี้
 *    ซึ่งเป็นวิธีเดียวที่จะปั่นตัวเลขได้ถ้ามีแค่ชั้นแรก
 *
 * ชั้นที่สองอยู่ในหน่วยความจำของโปรเซส หายเมื่อรีสตาร์ท — ยอมรับได้เพราะชั้นแรก
 * ยังทำงานอยู่ และของที่เสียไปคือ "ความแม่นของตัวเลขประชาสัมพันธ์" ไม่ใช่ข้อมูลธุรกิจ
 * ถ้าวันหนึ่งต้องการสถิติจริงจัง ให้ใช้ analytics ที่ออกแบบมาเพื่อการนั้นแทน
 */
export const visitorsRouter = Router()

/** ชื่อคุกกี้ที่บอกว่าเบราว์เซอร์นี้ถูกนับไปแล้ววันนี้ */
const COOKIE = 'idie.visit'
const ONE_DAY_MS = 24 * 60 * 60 * 1000

/**
 * เพดานการนับต่อหนึ่ง IP ต่อชั่วโมง
 *
 * **เป็นเพดาน ไม่ใช่ "หนึ่ง IP ต่อหนึ่งครั้ง"** — ผู้เข้าชมจำนวนมากใช้ IP ร่วมกันอยู่แล้ว
 * ทั้งพนักงานทั้งออฟฟิศที่ออกเน็ตทาง IP เดียว และตอนที่เซิร์ฟเวอร์อยู่หลัง nginx/Caddy
 * ซึ่ง `req.ip` จะกลายเป็น IP ของตัว proxy เองจนทุกคนดูเหมือนคนเดียวกัน ถ้าตั้งเป็น
 * หนึ่งครั้งต่อ IP ตัวนับจะหยุดนิ่งทั้งที่มีคนเข้าจริง
 *
 * 30 ครั้งต่อชั่วโมงจึงกว้างพอสำหรับออฟฟิศหรือ proxy แต่ยังปิดเพดานให้สคริปต์ที่
 * ยิงรัวโดยไม่รับคุกกี้ (ซึ่งไม่งั้นจะปั่นตัวเลขได้ไม่จำกัด)
 */
const IP_WINDOW_MS = 60 * 60 * 1000
const MAX_PER_IP_PER_WINDOW = 30

const hitsByIp = new Map<string, number[]>()

interface TotalRow extends RowDataPacket {
  total: number
}

/**
 * IP นี้ยิงเกินเพดานของชั่วโมงนี้แล้วหรือยัง — พร้อมเก็บกวาดของเก่าไปในตัว
 *
 * รูปแบบเดียวกับตัวจำกัดของแบบฟอร์มติดต่อใน `routes/contact.ts` โดยตั้งใจ
 * ทั้งเซิร์ฟเวอร์จึงมีวิธีจำกัดความถี่แบบเดียว ไม่ใช่สองแบบที่ต้องอ่านแยกกัน
 */
function overIpLimit(ip: string, now: number): boolean {
  const recent = (hitsByIp.get(ip) ?? []).filter((at) => now - at < IP_WINDOW_MS)

  if (recent.length >= MAX_PER_IP_PER_WINDOW) {
    hitsByIp.set(ip, recent)
    return true
  }

  recent.push(now)
  hitsByIp.set(ip, recent)

  // เก็บกวาด IP ที่เงียบไปแล้ว ไม่ให้ Map โตไม่หยุดตลอดอายุโปรเซส
  if (hitsByIp.size > 5000) {
    for (const [key, times] of hitsByIp) {
      if (times.every((at) => now - at >= IP_WINDOW_MS)) hitsByIp.delete(key)
    }
  }
  return false
}

/**
 * อ่านคุกกี้จาก header ตรง ๆ แทนการติดตั้ง cookie-parser
 *
 * ทั้งเซิร์ฟเวอร์ต้องการอ่านคุกกี้แค่ตัวเดียวนี้ (ของเซสชันแอดมิน express-session
 * จัดการเอง) การเพิ่ม dependency เพื่อบรรทัดเดียวคือของที่ต้องตามอัปเดตไปตลอด
 */
function hasVisitCookie(header: string | undefined): boolean {
  if (!header) return false
  return header.split(';').some((part) => part.trim().startsWith(`${COOKIE}=`))
}

async function readTotal(): Promise<number> {
  const [rows] = await pool.query<TotalRow[]>(
    'SELECT total FROM visitor_counter WHERE id = 1 LIMIT 1',
  )
  return Number(rows[0]?.total ?? 0)
}

/**
 * อ่านยอดอย่างเดียว ไม่นับเพิ่ม — สำหรับแดชบอร์ดหลังบ้าน
 *
 * **ต้องแยกจาก POST** ไม่ใช่ให้แอดมินเรียกตัวเดิม เพราะทีมงานที่เปิดแดชบอร์ด
 * วันละหลายรอบจะกลายเป็นผู้เข้าชมที่ตัวเองปั่นให้ตัวเอง ตัวเลขที่เอาไว้ดูว่า
 * ลูกค้าเข้าเว็บแค่ไหนจะเพี้ยนจากคนในบริษัทเอง
 *
 * เปิดสาธารณะเหมือน POST เพราะยอดนี้แสดงอยู่ท้ายเว็บให้ทุกคนเห็นอยู่แล้ว
 * การบังคับล็อกอินเพื่ออ่านตัวเลขที่พิมพ์อยู่บนหน้าเว็บไม่ได้ปิดอะไรเพิ่ม
 */
visitorsRouter.get(
  '/',
  route(async (_req, res) => {
    res.json({ total: await readTotal() })
  }),
)

/**
 * บันทึกการเข้าชมหนึ่งครั้งแล้วคืนยอดรวมล่าสุด
 *
 * เป็น POST ไม่ใช่ GET เพราะมันเปลี่ยนข้อมูลบนเซิร์ฟเวอร์ — GET ที่เขียนข้อมูล
 * จะถูกนับซ้ำโดยตัวโหลดล่วงหน้าของเบราว์เซอร์ ตัวเก็บแคช และบอตที่ไล่เก็บลิงก์
 */
visitorsRouter.post(
  '/',
  route(async (req, res) => {
    const now = Date.now()
    const ip = req.ip ?? 'unknown'
    const isNewVisit = !hasVisitCookie(req.headers.cookie) && !overIpLimit(ip, now)

    if (isNewVisit) {
      /*
        INSERT … ON DUPLICATE KEY UPDATE แทน UPDATE เปล่า ๆ — ถ้าแถวตั้งต้นหายไป
        (เช่น ฐานข้อมูลถูกสร้างใหม่โดยข้ามบรรทัด INSERT ใน schema.sql) UPDATE
        จะไม่ทำอะไรเลยและตัวนับจะค้างที่ศูนย์ตลอดกาลโดยไม่มีอะไรฟ้อง
      */
      await pool.query(
        'INSERT INTO visitor_counter (id, total) VALUES (1, 1) ON DUPLICATE KEY UPDATE total = total + 1',
      )

      res.cookie(COOKIE, '1', {
        maxAge: ONE_DAY_MS,
        httpOnly: true,
        sameSite: 'lax',
        secure: env.session.cookieSecure,
        path: '/',
      })
    }

    res.json({ total: await readTotal() })
  }),
)
