import type { NextFunction, Request, Response } from 'express'

/**
 * ข้อผิดพลาดที่ "ตั้งใจตอบกลับ" — ต่างจาก error ที่หลุดมาโดยไม่ได้ตั้งใจ
 *
 * ตัวจัดการท้ายสุดใช้ชนิดนี้แยกว่าอะไรควรบอกผู้ใช้ตรง ๆ (เช่น "ไม่พบข่าวนี้")
 * กับอะไรที่ต้องกลืนไว้แล้วตอบ 500 กลาง ๆ (เช่น ข้อความ error ของ MySQL ที่อาจ
 * มีชื่อตาราง ชื่อคอลัมน์ หรือค่าที่ผู้ใช้ไม่ควรเห็น)
 */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new HttpError(400, message, details)
export const unauthorized = (message = 'ต้องเข้าสู่ระบบก่อน') => new HttpError(401, message)
export const notFound = (message = 'ไม่พบข้อมูลที่ต้องการ') => new HttpError(404, message)
export const conflict = (message: string) => new HttpError(409, message)

/**
 * ห่อ handler แบบ async ให้ error ที่ throw ออกมาไหลเข้าตัวจัดการของ Express
 *
 * Express 5 รับ promise ที่ reject ได้เองแล้ว แต่การห่อไว้ทำให้ชนิดของ handler
 * ชัดเจนขึ้นและยังทำงานเหมือนเดิมถ้าวันหนึ่งต้องถอยกลับไป Express 4
 */
export function route<T>(handler: (req: Request, res: Response) => Promise<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res).catch(next)
  }
}

/**
 * ตัวจัดการ error ตัวสุดท้าย — ต้องเป็น middleware ตัวท้ายสุดของ app
 *
 * รับ 4 argument ครบเสมอแม้ไม่ได้ใช้ `_next` เพราะ Express ดูจำนวน argument
 * เพื่อแยกว่านี่คือ error handler ไม่ใช่ middleware ธรรมดา
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message, details: error.details })
    return
  }

  // อะไรที่ไม่ได้ตั้งใจให้เกิด ต้องขึ้น log ฝั่งเซิร์ฟเวอร์ให้ครบ แต่ตอบกลับแบบกลาง ๆ
  console.error('[unhandled]', error)
  res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในระบบ' })
}
