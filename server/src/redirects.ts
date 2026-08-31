import type { RequestHandler } from 'express'

/**
 * URL เก่าที่เลิกใช้แล้ว → URL ใหม่
 *
 * ตอบ 301 จากเซิร์ฟเวอร์ ไม่ปล่อยให้ตกไปที่ SPA fallback แล้วให้ React Router
 * เปลี่ยน URL ทีหลัง เพราะวิธีนั้นตอบ 200 พร้อม index.html — เบราว์เซอร์จะจำ
 * ลิงก์เก่าไว้ในประวัติต่อไป และตัวเก็บข้อมูลของเสิร์ชเอนจินจะเห็นเป็นสองหน้า
 * ที่มีเนื้อหาเดียวกันแทนที่จะเห็นว่าย้ายไปแล้ว
 *
 * ⚠️ รายการเดียวกันนี้ต้องมีอยู่ใน `src/router.tsx` ฝั่งหน้าเว็บด้วย — ตอน dev
 *    Vite เป็นคนเสิร์ฟหน้าเว็บ ไม่ได้ผ่านไฟล์นี้ และการกดลิงก์ภายในเว็บก็ไม่ได้
 *    วิ่งผ่านเซิร์ฟเวอร์เลย **แก้ที่นี่แล้วต้องไปแก้อีกที่ด้วย**
 */
const permanentRedirects: Record<string, string> = {
  // บริการเดิม "Network & CCTV System" แยกเป็น network-system กับ cctv-system
  // ชี้ไปหน้ากล้องเพราะเนื้อหาส่วนใหญ่ของหน้าเดิมย้ายไปอยู่ที่นั่น
  '/services/network-cctv-system': '/services/cctv-system',
}

/**
 * ตัดเครื่องหมาย `/` ท้าย URL ออกก่อนเทียบ เพื่อให้ `/a/` กับ `/a` เจอรายการเดียวกัน
 * (ยกเว้นหน้าแรกที่เป็น `/` เฉย ๆ)
 */
function normalise(path: string): string {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
}

export const legacyRedirects: RequestHandler = (req, res, next) => {
  const target = permanentRedirects[normalise(req.path)]
  if (!target) return next()

  // คง query string เดิมไว้ เผื่อลิงก์ที่แจกไปมีพารามิเตอร์ติดตามแคมเปญอยู่
  const queryIndex = req.originalUrl.indexOf('?')
  const query = queryIndex === -1 ? '' : req.originalUrl.slice(queryIndex)
  res.redirect(301, target + query)
}
