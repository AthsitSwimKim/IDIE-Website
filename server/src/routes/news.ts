import { Router } from 'express'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { pool } from '../db.ts'
import { badRequest, conflict, notFound, route } from '../http.ts'
import { toAdminNews, toMysqlDateTime, toNewsArticle, type NewsRow } from '../mappers.ts'
import { fieldErrors, newsInput } from '../schemas.ts'

/**
 * คอลัมน์ที่ดึงเสมอ — ประกาศครั้งเดียวเพื่อไม่ให้ query สองอันดึงคนละชุด
 * แล้วเจอ `undefined` โผล่มาเฉพาะบางเส้นทาง
 */
const COLUMNS = `
  id, slug, title_th, title_en, excerpt_th, excerpt_en, body_th, body_en,
  category, published_at, status, featured,
  cover_src, cover_src_set, cover_alt_th, cover_alt_en, cover_width, cover_height
`

/** MySQL แจ้ง unique key ชนด้วยรหัสนี้ — ใช้แยก "slug ซ้ำ" ออกจากข้อผิดพลาดอื่น */
const DUPLICATE_ENTRY = 'ER_DUP_ENTRY'

function isDuplicate(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === DUPLICATE_ENTRY
}

/* -------------------------------------------------------------------------- */
/* สาธารณะ — เห็นเฉพาะที่เผยแพร่แล้ว                                              */
/* -------------------------------------------------------------------------- */

export const publicNewsRouter = Router()

/**
 * เงื่อนไข `status = 'published'` อยู่ในทุก query ของเราเตอร์นี้
 *
 * บังคับที่ชั้น SQL ไม่ใช่กรองใน JS หลังดึงมาทั้งหมด เพราะการกรองทีหลังแปลว่า
 * เนื้อหาร่างถูกอ่านออกจากฐานข้อมูลจริงและมีโอกาสหลุดออกไปถ้าลืมกรองสักจุด
 *
 * `published_at <= NOW()` ทำให้ตั้งเวลาประกาศล่วงหน้าได้ — บันทึกเป็น published
 * พร้อมวันที่ในอนาคต แล้วข่าวจะโผล่เองเมื่อถึงเวลา
 */
publicNewsRouter.get(
  '/',
  route(async (_req, res) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM news
       WHERE status = 'published' AND published_at <= UTC_TIMESTAMP()
       ORDER BY published_at DESC`,
    )
    res.json((rows as NewsRow[]).map(toNewsArticle))
  }),
)

publicNewsRouter.get(
  '/:slug',
  route(async (req, res) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM news
       WHERE slug = ? AND status = 'published' AND published_at <= UTC_TIMESTAMP()
       LIMIT 1`,
      [req.params.slug],
    )
    const row = (rows as NewsRow[])[0]
    if (!row) throw notFound('ไม่พบข่าวนี้')
    res.json(toNewsArticle(row))
  }),
)

/* -------------------------------------------------------------------------- */
/* แอดมิน — เห็นร่างด้วย และแก้ไขได้                                              */
/* -------------------------------------------------------------------------- */

export const adminNewsRouter = Router()

adminNewsRouter.get(
  '/',
  route(async (_req, res) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM news ORDER BY published_at DESC`,
    )
    res.json((rows as NewsRow[]).map(toAdminNews))
  }),
)

adminNewsRouter.get(
  '/:id',
  route(async (req, res) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM news WHERE id = ? LIMIT 1`,
      [req.params.id],
    )
    const row = (rows as NewsRow[])[0]
    if (!row) throw notFound('ไม่พบข่าวนี้')
    res.json(toAdminNews(row))
  }),
)

/** ลำดับค่าต้องตรงกับลำดับคอลัมน์ใน INSERT และ UPDATE ด้านล่าง */
function valuesOf(input: ReturnType<typeof newsInput.parse>) {
  return [
    input.slug,
    input.title.th,
    input.title.en,
    input.excerpt.th,
    input.excerpt.en,
    input.body.th,
    input.body.en,
    input.category,
    toMysqlDateTime(input.publishedAt),
    input.status,
    input.featured ? 1 : 0,
    input.cover?.src ?? null,
    input.cover?.srcSet ?? null,
    input.cover?.alt.th ?? null,
    input.cover?.alt.en ?? null,
    input.cover?.width ?? null,
    input.cover?.height ?? null,
  ]
}

adminNewsRouter.post(
  '/',
  route(async (req, res) => {
    const parsed = newsInput.safeParse(req.body)
    if (!parsed.success) throw badRequest('ข้อมูลไม่ครบหรือไม่ถูกต้อง', fieldErrors(parsed.error))

    try {
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO news (
           slug, title_th, title_en, excerpt_th, excerpt_en, body_th, body_en,
           category, published_at, status, featured,
           cover_src, cover_src_set, cover_alt_th, cover_alt_en, cover_width, cover_height
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        valuesOf(parsed.data),
      )
      res.status(201).json({ id: result.insertId })
    } catch (error) {
      if (isDuplicate(error)) throw conflict(`มีข่าวที่ใช้ slug "${parsed.data.slug}" อยู่แล้ว`)
      throw error
    }
  }),
)

adminNewsRouter.put(
  '/:id',
  route(async (req, res) => {
    const parsed = newsInput.safeParse(req.body)
    if (!parsed.success) throw badRequest('ข้อมูลไม่ครบหรือไม่ถูกต้อง', fieldErrors(parsed.error))

    try {
      const [result] = await pool.query<ResultSetHeader>(
        `UPDATE news SET
           slug = ?, title_th = ?, title_en = ?, excerpt_th = ?, excerpt_en = ?,
           body_th = ?, body_en = ?, category = ?, published_at = ?, status = ?, featured = ?,
           cover_src = ?, cover_src_set = ?, cover_alt_th = ?, cover_alt_en = ?,
           cover_width = ?, cover_height = ?
         WHERE id = ?`,
        [...valuesOf(parsed.data), req.params.id],
      )
      // affectedRows = 0 แปลว่าไม่มีแถวนั้นจริง ๆ (ถ้ามีแถวแต่ค่าเหมือนเดิม
      // MySQL ยังนับเป็น affected อยู่ — ที่เป็น 0 คือ changedRows ซึ่งไม่ได้ใช้ตรงนี้)
      if (result.affectedRows === 0) throw notFound('ไม่พบข่าวนี้')
      res.json({ ok: true })
    } catch (error) {
      if (isDuplicate(error)) throw conflict(`มีข่าวที่ใช้ slug "${parsed.data.slug}" อยู่แล้ว`)
      throw error
    }
  }),
)

adminNewsRouter.delete(
  '/:id',
  route(async (req, res) => {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM news WHERE id = ?', [
      req.params.id,
    ])
    if (result.affectedRows === 0) throw notFound('ไม่พบข่าวนี้')
    res.json({ ok: true })
  }),
)
