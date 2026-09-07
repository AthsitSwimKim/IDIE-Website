import { Router } from 'express'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { pool } from '../db.ts'
import { badRequest, notFound, route } from '../http.ts'
import { toAdminSiteReference, toSiteReference, type SiteReferenceRow } from '../mappers.ts'
import { fieldErrors, siteReferenceInput, type SiteReferenceInput } from '../schemas.ts'

/**
 * คอลัมน์ที่ดึงเสมอ — ประกาศครั้งเดียวเพื่อไม่ให้ query สองอันดึงคนละชุด
 * แล้วเจอ `undefined` โผล่มาเฉพาะบางเส้นทาง
 */
const COLUMNS = `
  id, name_th, name_en, customer_th, customer_en, location_th, location_en,
  position, status,
  image_src, image_src_set, image_alt_th, image_alt_en, image_width, image_height
`

/**
 * เรียงตาม `position` ก่อน แล้วค่อย id
 *
 * ถ้าแอดมินใส่ลำดับซ้ำกัน (ซึ่งเกิดง่ายเพราะไม่ได้บังคับ unique) ต้องมีตัวตัดสิน
 * ที่แน่นอน ไม่งั้นลำดับจะสลับไปมาระหว่างการโหลดแต่ละครั้งโดยไม่มีใครแก้อะไรเลย
 */
const ORDER = 'ORDER BY position, id'

/* -------------------------------------------------------------------------- */
/* สาธารณะ — เห็นเฉพาะที่เผยแพร่แล้ว                                              */
/* -------------------------------------------------------------------------- */

export const publicSiteReferencesRouter = Router()

publicSiteReferencesRouter.get(
  '/',
  route(async (_req, res) => {
    // กรองที่ชั้น SQL ไม่ใช่ใน JS ด้วยเหตุผลเดียวกับข่าวและผลงาน —
    // แถวที่เป็นร่างต้องไม่ถูกอ่านออกจากฐานข้อมูลตั้งแต่แรก
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM site_references WHERE status = 'published' ${ORDER}`,
    )
    res.json((rows as SiteReferenceRow[]).map(toSiteReference))
  }),
)

/* -------------------------------------------------------------------------- */
/* แอดมิน — เห็นร่างด้วย และแก้ไขได้                                              */
/* -------------------------------------------------------------------------- */

export const adminSiteReferencesRouter = Router()

adminSiteReferencesRouter.get(
  '/',
  route(async (_req, res) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM site_references ${ORDER}`,
    )
    res.json((rows as SiteReferenceRow[]).map(toAdminSiteReference))
  }),
)

adminSiteReferencesRouter.get(
  '/:id',
  route(async (req, res) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM site_references WHERE id = ? LIMIT 1`,
      [req.params.id],
    )
    const row = (rows as SiteReferenceRow[])[0]
    if (!row) throw notFound('ไม่พบรายการอ้างอิงนี้')
    res.json(toAdminSiteReference(row))
  }),
)

/** ลำดับค่าต้องตรงกับลำดับคอลัมน์ใน INSERT และ UPDATE ด้านล่าง */
function valuesOf(input: SiteReferenceInput) {
  return [
    input.name.th,
    input.name.en,
    input.customer.th,
    input.customer.en,
    input.location.th,
    input.location.en,
    input.position,
    input.status,
    input.image?.src ?? null,
    input.image?.srcSet ?? null,
    input.image?.alt.th ?? null,
    input.image?.alt.en ?? null,
    input.image?.width ?? null,
    input.image?.height ?? null,
  ]
}

adminSiteReferencesRouter.post(
  '/',
  route(async (req, res) => {
    const parsed = siteReferenceInput.safeParse(req.body)
    if (!parsed.success) throw badRequest('ข้อมูลไม่ครบหรือไม่ถูกต้อง', fieldErrors(parsed.error))

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO site_references (
         name_th, name_en, customer_th, customer_en, location_th, location_en,
         position, status,
         image_src, image_src_set, image_alt_th, image_alt_en, image_width, image_height
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      valuesOf(parsed.data),
    )
    res.status(201).json({ id: result.insertId })
  }),
)

adminSiteReferencesRouter.put(
  '/:id',
  route(async (req, res) => {
    const parsed = siteReferenceInput.safeParse(req.body)
    if (!parsed.success) throw badRequest('ข้อมูลไม่ครบหรือไม่ถูกต้อง', fieldErrors(parsed.error))

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE site_references SET
         name_th = ?, name_en = ?, customer_th = ?, customer_en = ?,
         location_th = ?, location_en = ?, position = ?, status = ?,
         image_src = ?, image_src_set = ?, image_alt_th = ?, image_alt_en = ?,
         image_width = ?, image_height = ?
       WHERE id = ?`,
      [...valuesOf(parsed.data), req.params.id],
    )
    if (result.affectedRows === 0) throw notFound('ไม่พบรายการอ้างอิงนี้')
    res.json({ ok: true })
  }),
)

adminSiteReferencesRouter.delete(
  '/:id',
  route(async (req, res) => {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM site_references WHERE id = ?',
      [req.params.id],
    )
    if (result.affectedRows === 0) throw notFound('ไม่พบรายการอ้างอิงนี้')
    res.json({ ok: true })
  }),
)
