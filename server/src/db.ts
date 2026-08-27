import mysql from 'mysql2/promise'
import { env } from './env.ts'

/**
 * Connection pool เดียวของทั้งเซิร์ฟเวอร์
 *
 * `dateStrings: true` สำคัญกว่าที่เห็น — ถ้าปล่อยให้ mysql2 แปลง DATETIME เป็น
 * `Date` ของ JS มันจะตีความค่าในฐานข้อมูลว่าเป็นเวลาโซนของ **เครื่องที่รัน Node**
 * แล้วตอนส่งออกเป็น ISO จะเลื่อนไป 7 ชั่วโมง ข่าวที่ลงวันที่ 1 ก.ย. จะกลายเป็น
 * 31 ส.ค. บนหน้าเว็บ การรับมาเป็นสตริงแล้วประกอบเองที่ mappers.ts ทำให้ควบคุมได้
 *
 * `namedPlaceholders` ปิดไว้ — ทุก query ในโปรเจกต์นี้ใช้ `?` และการเปิดทั้งสองแบบ
 * พร้อมกันเป็นทางที่ทำให้คนเผลอเขียนสลับรูปแบบแล้วดีบักยาก
 */
export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4_unicode_ci',
  dateStrings: true,
  // ค่าเริ่มต้นของ mysql2 คือรอไม่จำกัด ซึ่งทำให้ request ค้างเงียบ ๆ เมื่อ MySQL ล่ม
  connectTimeout: 10_000,
})

/**
 * ตรวจว่าต่อฐานข้อมูลได้จริงก่อนเปิดรับ request
 *
 * เรียกตอนบูตเท่านั้น — ถ้าล้มให้เซิร์ฟเวอร์ตายไปเลยพร้อมข้อความที่บอกได้ว่า
 * ต้องไปแก้อะไร ดีกว่าขึ้นมาแล้วให้ทุก request ตอบ 500 เหมือนกันหมด
 */
export async function assertDatabaseReachable() {
  try {
    const conn = await pool.getConnection()
    try {
      await conn.query('SELECT 1')
    } finally {
      conn.release()
    }
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : String(cause)
    throw new Error(
      `ต่อ MySQL ไม่ได้ที่ ${env.db.user}@${env.db.host}:${env.db.port}/${env.db.database} — ${reason}\n` +
        'ตรวจว่า MySQL รันอยู่ · ค่าใน server/.env ถูกต้อง · และรัน server/schema.sql แล้ว',
    )
  }
}

/** ปิด pool ตอนปิดเซิร์ฟเวอร์ ให้ connection ที่ค้างถูกคืนอย่างเรียบร้อย */
export async function closePool() {
  await pool.end()
}

/**
 * รันหลายคำสั่งในทรานแซกชันเดียว
 *
 * ผลงานหนึ่งชิ้นเขียนลงสามตาราง (projects + scope items + images) ถ้าเขียนตาราง
 * แรกสำเร็จแล้วตารางที่สองล้ม จะเหลือผลงานที่ไม่มีขอบเขตงานค้างในฐานข้อมูล
 * โดยที่แอดมินเห็นแค่ข้อความ error แล้วไม่รู้ว่าต้องไปตามลบเอง
 */
export async function withTransaction<T>(
  run: (conn: mysql.PoolConnection) => Promise<T>,
): Promise<T> {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const result = await run(conn)
    await conn.commit()
    return result
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    conn.release()
  }
}
