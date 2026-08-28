import { Router } from 'express'
import { z } from 'zod'
import { HttpError, badRequest, route } from '../http.ts'
import { mailEnabled, sendInquiry } from '../mailer.ts'
import { fieldErrors } from '../schemas.ts'

/**
 * แบบฟอร์มติดต่อ — รับแล้วส่งอีเมลต่อทันที **ไม่เก็บลงฐานข้อมูล**
 *
 * เป็น endpoint สาธารณะเพียงตัวเดียวที่ "ทำอะไรบางอย่าง" แทนที่จะแค่อ่านข้อมูล
 * จึงเป็นจุดที่ถูกยิงสแปมได้ง่ายที่สุดในระบบ มีสามด่านกันไว้:
 *
 * 1. ตรวจรูปแบบข้อมูลด้วย zod — กันคำขอที่ไม่ได้มาจากฟอร์มจริง
 * 2. ช่องล่อ (honeypot) — บอตกรอกทุกช่องที่เจอ คนไม่เห็นช่องนี้จึงไม่มีวันกรอก
 * 3. จำกัดจำนวนครั้งต่อ IP — กันการยิงซ้ำเป็นร้อยครั้งจนกล่องจดหมายเต็ม
 */

export const contactRouter = Router()

const inquiryInput = z.object({
  name: z.string().trim().min(1, 'กรุณากรอกชื่อ').max(200),
  company: z.string().trim().max(200).optional(),
  email: z.email('รูปแบบอีเมลไม่ถูกต้อง').max(320),
  phone: z.string().trim().max(60).optional(),
  subject: z.string().trim().min(1, 'กรุณาระบุเรื่องที่ต้องการสอบถาม').max(300),
  message: z.string().trim().min(1, 'กรุณากรอกรายละเอียด').max(5000),
  locale: z.enum(['th', 'en']).default('th'),
  /**
   * ช่องล่อบอต — ฟอร์มจริงซ่อนไว้จากสายตาและจากโปรแกรมอ่านหน้าจอ
   * ผู้ใช้จริงจึงส่งค่าว่างเสมอ ถ้ามีค่าเข้ามาแปลว่าไม่ใช่คน
   */
  website: z.string().max(200).optional(),
})

/* -------------------------------------------------------------------------- */
/* จำกัดจำนวนครั้งต่อ IP                                                        */
/* -------------------------------------------------------------------------- */

const WINDOW_MS = 60 * 60 * 1000 // 1 ชั่วโมง
const MAX_PER_WINDOW = 5

/**
 * เก็บในหน่วยความจำ ไม่ใช่ฐานข้อมูล
 *
 * เหมาะกับเซิร์ฟเวอร์โปรเซสเดียวอย่างที่ใช้อยู่ และการรีสตาร์ตแล้วลืมของเดิม
 * ไม่ใช่ปัญหา — จุดประสงค์คือกันการยิงรัวติด ๆ กัน ไม่ใช่การแบนถาวร
 *
 * ถ้าวันหน้าขยายเป็นหลายโปรเซส ต้องย้ายไปเก็บที่ส่วนกลาง (Redis หรือตารางใน MySQL)
 * ไม่งั้นแต่ละโปรเซสจะนับแยกกันแล้วเพดานจริงกลายเป็นจำนวนเท่าของโปรเซส
 */
const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((at) => now - at < WINDOW_MS)

  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent)
    return true
  }

  recent.push(now)
  hits.set(ip, recent)

  // เก็บกวาด IP ที่เงียบไปแล้ว ไม่ให้ Map โตไม่หยุดตลอดอายุโปรเซส
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((at) => now - at >= WINDOW_MS)) hits.delete(key)
    }
  }
  return false
}

/* -------------------------------------------------------------------------- */

contactRouter.post(
  '/',
  route(async (req, res) => {
    const parsed = inquiryInput.safeParse(req.body)
    if (!parsed.success) {
      throw badRequest('ข้อมูลไม่ครบหรือไม่ถูกต้อง', fieldErrors(parsed.error))
    }

    // ตอบว่าสำเร็จทั้งที่ทิ้งไป — ถ้าบอกบอตตรง ๆ ว่าโดนจับได้ คนเขียนบอต
    // จะรู้ทันทีว่าต้องเลี่ยงช่องไหนแล้วแก้กลับมาใหม่
    if (parsed.data.website) {
      console.warn('[contact] ทิ้งคำขอที่ติดกับดักบอต')
      res.json({ ok: true })
      return
    }

    const ip = req.ip ?? 'unknown'
    if (rateLimited(ip)) {
      throw new HttpError(429, 'ส่งคำถามบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่')
    }

    if (!mailEnabled) {
      // 503 ไม่ใช่ 500 — ระบบไม่ได้พัง แค่ยังไม่ได้ตั้งค่าช่องทางส่ง
      // และเป็นสถานะที่ฝั่งหน้าเว็บใช้ตัดสินใจว่าจะบอกผู้ใช้ให้โทรมาแทน
      throw new HttpError(
        503,
        'ระบบส่งอีเมลยังไม่พร้อมใช้งาน กรุณาติดต่อทางโทรศัพท์หรืออีเมลโดยตรง',
      )
    }

    const { name, company, email, phone, subject, message, locale } = parsed.data

    try {
      await sendInquiry({ name, company, email, phone, subject, message, locale })
    } catch (cause) {
      // log ให้ครบฝั่งเซิร์ฟเวอร์เพื่อไล่ปัญหา SMTP ได้ แต่ไม่ส่งรายละเอียด
      // กลับไปให้ผู้ใช้ เพราะข้อความจาก SMTP มักมีชื่อ host และบัญชีติดมาด้วย
      console.error('[contact] ส่งอีเมลไม่สำเร็จ:', cause)
      throw new HttpError(
        502,
        'ส่งคำถามไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หรือติดต่อทางโทรศัพท์โดยตรง',
      )
    }

    console.log(`[contact] ส่งคำถามจาก ${email} เรียบร้อย`)
    res.json({ ok: true })
  }),
)
