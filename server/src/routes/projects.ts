import { Router } from 'express'
import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { pool, withTransaction } from '../db.ts'
import { badRequest, conflict, notFound, route } from '../http.ts'
import {
  toAdminProject,
  toProject,
  type ProjectImageRow,
  type ProjectRow,
  type ScopeRow,
} from '../mappers.ts'
import { fieldErrors, projectInput, type ProjectInput } from '../schemas.ts'

const COLUMNS = `
  id, slug, name_th, name_en, client_th, client_en, industry,
  location_th, location_en, year, overview_th, overview_en,
  engineering_solution_th, engineering_solution_en, status, featured,
  cover_src, cover_src_set, cover_alt_th, cover_alt_en, cover_width, cover_height
`

function isDuplicate(error: unknown): boolean {
  return (
    typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_DUP_ENTRY'
  )
}

/**
 * ดึงขอบเขตงานและภาพประกอบของผลงานหลายชิ้นในสอง query
 *
 * **ไม่ใช้ query ต่อผลงานหนึ่งชิ้น** เพราะหน้ารายการที่มี 20 ผลงานจะกลายเป็น
 * 41 query (คลาสสิก N+1) ดึงทีเดียวด้วย `IN (...)` แล้วจับกลุ่มในหน่วยความจำ
 * เร็วกว่ามากและโหลดฐานข้อมูลคงที่ไม่ว่าจะมีผลงานกี่ชิ้น
 */
async function loadChildren(ids: number[]) {
  const scope = new Map<number, ScopeRow[]>()
  const images = new Map<number, ProjectImageRow[]>()
  if (ids.length === 0) return { scope, images }

  const [scopeRows] = await pool.query<RowDataPacket[]>(
    `SELECT project_id, text_th, text_en FROM project_scope_items
     WHERE project_id IN (?) ORDER BY project_id, position`,
    [ids],
  )
  for (const row of scopeRows as ScopeRow[]) {
    const list = scope.get(row.project_id) ?? []
    list.push(row)
    scope.set(row.project_id, list)
  }

  const [imageRows] = await pool.query<RowDataPacket[]>(
    `SELECT project_id, src, src_set, alt_th, alt_en, width, height FROM project_images
     WHERE project_id IN (?) ORDER BY project_id, position`,
    [ids],
  )
  for (const row of imageRows as ProjectImageRow[]) {
    const list = images.get(row.project_id) ?? []
    list.push(row)
    images.set(row.project_id, list)
  }

  return { scope, images }
}

/* -------------------------------------------------------------------------- */
/* สาธารณะ                                                                     */
/* -------------------------------------------------------------------------- */

export const publicProjectsRouter = Router()

publicProjectsRouter.get(
  '/',
  route(async (_req, res) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM projects WHERE status = 'published'
       ORDER BY year DESC, id DESC`,
    )
    const list = rows as ProjectRow[]
    const { scope, images } = await loadChildren(list.map((row) => row.id))
    res.json(list.map((row) => toProject(row, scope.get(row.id) ?? [], images.get(row.id) ?? [])))
  }),
)

publicProjectsRouter.get(
  '/:slug',
  route(async (req, res) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM projects WHERE slug = ? AND status = 'published' LIMIT 1`,
      [req.params.slug],
    )
    const row = (rows as ProjectRow[])[0]
    if (!row) throw notFound('ไม่พบผลงานนี้')

    const { scope, images } = await loadChildren([row.id])
    res.json(toProject(row, scope.get(row.id) ?? [], images.get(row.id) ?? []))
  }),
)

/* -------------------------------------------------------------------------- */
/* แอดมิน                                                                      */
/* -------------------------------------------------------------------------- */

export const adminProjectsRouter = Router()

adminProjectsRouter.get(
  '/',
  route(async (_req, res) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM projects ORDER BY year DESC, id DESC`,
    )
    const list = rows as ProjectRow[]
    const { scope, images } = await loadChildren(list.map((row) => row.id))
    res.json(
      list.map((row) => toAdminProject(row, scope.get(row.id) ?? [], images.get(row.id) ?? [])),
    )
  }),
)

adminProjectsRouter.get(
  '/:id',
  route(async (req, res) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM projects WHERE id = ? LIMIT 1`,
      [req.params.id],
    )
    const row = (rows as ProjectRow[])[0]
    if (!row) throw notFound('ไม่พบผลงานนี้')

    const { scope, images } = await loadChildren([row.id])
    res.json(toAdminProject(row, scope.get(row.id) ?? [], images.get(row.id) ?? []))
  }),
)

function valuesOf(input: ProjectInput) {
  return [
    input.slug,
    input.name.th,
    input.name.en,
    input.client.th,
    input.client.en,
    input.industry,
    input.location.th,
    input.location.en,
    input.year,
    input.overview.th,
    input.overview.en,
    input.engineeringSolution.th,
    input.engineeringSolution.en,
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

/**
 * เขียนตารางลูกด้วยวิธี "ลบทิ้งแล้วใส่ใหม่ทั้งชุด"
 *
 * เลือกวิธีนี้แทนการไล่เทียบทีละแถวเพราะขอบเขตงานและภาพประกอบเป็น **ลำดับ**
 * ที่แอดมินจัดเรียงเอง การหาว่าแถวไหนถูกย้าย ถูกแทรก หรือถูกลบ ซับซ้อนกว่ามาก
 * และให้ผลเหมือนกัน ทั้งหมดอยู่ในทรานแซกชันเดียว ผู้ใช้จึงไม่มีทางเห็นสถานะที่ว่างกลางคัน
 */
async function replaceChildren(conn: PoolConnection, projectId: number, input: ProjectInput) {
  await conn.query('DELETE FROM project_scope_items WHERE project_id = ?', [projectId])
  if (input.scopeOfWork.length > 0) {
    await conn.query(
      'INSERT INTO project_scope_items (project_id, position, text_th, text_en) VALUES ?',
      [input.scopeOfWork.map((item, index) => [projectId, index, item.th, item.en])],
    )
  }

  await conn.query('DELETE FROM project_images WHERE project_id = ?', [projectId])
  if (input.gallery.length > 0) {
    await conn.query(
      `INSERT INTO project_images
         (project_id, position, src, src_set, alt_th, alt_en, width, height) VALUES ?`,
      [
        input.gallery.map((image, index) => [
          projectId,
          index,
          image.src,
          image.srcSet ?? null,
          image.alt.th,
          image.alt.en,
          image.width ?? null,
          image.height ?? null,
        ]),
      ],
    )
  }
}

adminProjectsRouter.post(
  '/',
  route(async (req, res) => {
    const parsed = projectInput.safeParse(req.body)
    if (!parsed.success) throw badRequest('ข้อมูลไม่ครบหรือไม่ถูกต้อง', fieldErrors(parsed.error))

    try {
      const id = await withTransaction(async (conn) => {
        const [result] = await conn.query<ResultSetHeader>(
          `INSERT INTO projects (
             slug, name_th, name_en, client_th, client_en, industry,
             location_th, location_en, year, overview_th, overview_en,
             engineering_solution_th, engineering_solution_en, status, featured,
             cover_src, cover_src_set, cover_alt_th, cover_alt_en, cover_width, cover_height
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          valuesOf(parsed.data),
        )
        await replaceChildren(conn, result.insertId, parsed.data)
        return result.insertId
      })
      res.status(201).json({ id })
    } catch (error) {
      if (isDuplicate(error)) throw conflict(`มีผลงานที่ใช้ slug "${parsed.data.slug}" อยู่แล้ว`)
      throw error
    }
  }),
)

adminProjectsRouter.put(
  '/:id',
  route(async (req, res) => {
    const parsed = projectInput.safeParse(req.body)
    if (!parsed.success) throw badRequest('ข้อมูลไม่ครบหรือไม่ถูกต้อง', fieldErrors(parsed.error))

    const id = Number(req.params.id)
    if (!Number.isInteger(id)) throw badRequest('รหัสผลงานไม่ถูกต้อง')

    try {
      await withTransaction(async (conn) => {
        const [result] = await conn.query<ResultSetHeader>(
          `UPDATE projects SET
             slug = ?, name_th = ?, name_en = ?, client_th = ?, client_en = ?, industry = ?,
             location_th = ?, location_en = ?, year = ?, overview_th = ?, overview_en = ?,
             engineering_solution_th = ?, engineering_solution_en = ?, status = ?, featured = ?,
             cover_src = ?, cover_src_set = ?, cover_alt_th = ?, cover_alt_en = ?,
             cover_width = ?, cover_height = ?
           WHERE id = ?`,
          [...valuesOf(parsed.data), id],
        )
        if (result.affectedRows === 0) throw notFound('ไม่พบผลงานนี้')
        await replaceChildren(conn, id, parsed.data)
      })
      res.json({ ok: true })
    } catch (error) {
      if (isDuplicate(error)) throw conflict(`มีผลงานที่ใช้ slug "${parsed.data.slug}" อยู่แล้ว`)
      throw error
    }
  }),
)

adminProjectsRouter.delete(
  '/:id',
  route(async (req, res) => {
    // ตารางลูกตั้ง ON DELETE CASCADE ไว้ จึงหายตามไปเองโดยไม่ต้องลบทีละตาราง
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM projects WHERE id = ?', [
      req.params.id,
    ])
    if (result.affectedRows === 0) throw notFound('ไม่พบผลงานนี้')
    res.json({ ok: true })
  }),
)
