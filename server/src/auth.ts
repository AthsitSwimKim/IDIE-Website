import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import type { NextFunction, Request, Response } from 'express'
import { unauthorized } from './http.ts'

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>

/**
 * พารามิเตอร์ของ scrypt
 *
 * N=16384 · r=8 · p=1 คือค่าที่เอกสารของ Node ใช้เป็นตัวอย่างและอยู่ในระดับที่
 * OWASP แนะนำ ใช้หน่วยความจำราว 16 MB ต่อการคำนวณหนึ่งครั้ง ซึ่งเป็นสิ่งที่ทำให้
 * การไล่เดารหัสด้วย GPU แพง — ไม่ใช่ความช้าของ CPU อย่างเดียว
 *
 * `maxmem` ต้องตั้งเองเพราะค่าเริ่มต้นของ Node (32 MB) เฉียดเกินไปเมื่อ N สูงขึ้น
 * และอาการที่ได้คือ error ตอนสมัครผู้ใช้ ไม่ใช่ตอนรีวิวโค้ด
 */
const PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 } as const
const KEY_LENGTH = 64

/**
 * ใช้ scrypt ที่มากับ Node แทน bcrypt/argon2
 *
 * สองตัวนั้นต้อง compile native module ซึ่งบนเครื่อง Windows ที่ไม่มี build tools
 * จะติดตั้งไม่ผ่าน และเป็นปัญหาที่โผล่ตอน deploy ไม่ใช่ตอนเขียน — scrypt เป็น
 * memory-hard KDF ที่เหมาะกับรหัสผ่านเหมือนกัน และมาพร้อม Node อยู่แล้ว
 *
 * รูปแบบที่เก็บ: `scrypt$N$r$p$salt$hash` — พารามิเตอร์ฝังอยู่ในสตริง ทำให้วันหน้า
 * ขยับค่าให้แรงขึ้นได้โดยที่รหัสผ่านเดิมยังตรวจผ่าน
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const hash = await scrypt(password.normalize('NFKC'), salt, KEY_LENGTH, PARAMS)
  return [
    'scrypt',
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString('hex'),
    hash.toString('hex'),
  ].join('$')
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false

  const [, nRaw, rRaw, pRaw, saltHex, hashHex] = parts
  const N = Number(nRaw)
  const r = Number(rRaw)
  const p = Number(pRaw)
  if (!N || !r || !p || !saltHex || !hashHex) return false

  const expected = Buffer.from(hashHex, 'hex')
  const actual = await scrypt(password.normalize('NFKC'), Buffer.from(saltHex, 'hex'), expected.length, {
    N,
    r,
    p,
    maxmem: PARAMS.maxmem,
  })

  // เทียบแบบ timing-safe — การเทียบด้วย === รั่วข้อมูลว่ารหัสถูกไปกี่ตัวอักษร
  // ผ่านเวลาที่ใช้ ซึ่งเป็นช่องทางที่วัดได้จริงเมื่อผู้โจมตียิงซ้ำหลายพันครั้ง
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

/** ข้อมูลผู้ใช้ที่เก็บใน session — เก็บให้น้อยที่สุดเท่าที่ UI ต้องใช้ */
export interface SessionUser {
  id: number
  username: string
  displayName: string
}

declare module 'express-session' {
  interface SessionData {
    user?: SessionUser
  }
}

/**
 * ประตูเดียวของทุก endpoint ที่แก้ข้อมูลได้
 *
 * ทุก route ใต้ /api/admin ต้องผ่านตัวนี้ — ประกาศไว้ที่ระดับ router ตัวเดียว
 * ไม่ใช่แปะทีละ endpoint เพราะการลืมแปะหนึ่งจุดคือช่องให้แก้ข้อมูลได้โดยไม่ต้องล็อกอิน
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.session.user) {
    next(unauthorized())
    return
  }
  next()
}

/** อ่านผู้ใช้จาก session แบบที่ TypeScript รู้ว่าไม่ใช่ undefined (ใช้หลัง requireAuth) */
export function currentUser(req: Request): SessionUser {
  const user = req.session.user
  if (!user) throw unauthorized()
  return user
}
