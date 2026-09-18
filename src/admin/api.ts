import type {
  AdminAccount,
  AdminJob,
  AdminNews,
  AdminProject,
  AdminSiteReference,
  AdminUser,
  UploadedImage,
} from '@/types/admin'
import { apiFetch } from '@/utils/apiFetch'

/**
 * ตัวกลางเดียวที่คุยกับ API — ไม่มี component ไหนเรียก `fetch` เอง
 *
 * เหตุผลเดียวกับที่ `src/data/index.ts` เป็นกำแพงของข้อมูลฝั่งสาธารณะ:
 * เรื่องที่ต้องทำเหมือนกันทุกครั้ง (แนบคุกกี้ · แปลง error เป็นข้อความไทย ·
 * แยก 401 ออกจาก error อื่น) ต้องอยู่ที่เดียว ไม่ใช่กระจายไปทุกหน้า
 *
 * ไม่ตั้ง base URL เพราะ Vite proxy `/api` ให้ตอน dev และ production เสิร์ฟ
 * จาก origin เดียวกัน — path สัมพัทธ์จึงถูกต้องทั้งสองสภาพแวดล้อม
 */

const SERVER_DOWN =
  'ระบบหลังบ้านยังไม่พร้อมใช้งาน กรุณาตรวจการตั้งค่า API และฐานข้อมูล หรือติดต่อผู้ดูแลเว็บไซต์'

/** โยนเมื่อเซสชันหมดอายุหรือยังไม่ได้ล็อกอิน — หน้าแอดมินใช้แยกว่าควรเด้งไป login ไหม */
export class UnauthorizedError extends Error {
  constructor() {
    super('เซสชันหมดอายุ — กรุณาเข้าสู่ระบบใหม่')
    this.name = 'UnauthorizedError'
  }
}

/**
 * ข้อผิดพลาดจาก API ที่มีรายละเอียดรายฟิลด์แนบมาด้วย
 *
 * ประกาศ field แยกจาก constructor แทนการใช้ parameter property เพราะ
 * `erasableSyntaxOnly` ใน tsconfig.app.json ห้ามไวยากรณ์ที่ต้องคอมไพล์เป็นโค้ดจริง
 * (Vite ลบ type ทิ้งอย่างเดียว ไม่ได้ compile) — parameter property เป็นหนึ่งในนั้น
 */
export class ApiError extends Error {
  readonly status: number
  readonly fields?: Record<string, string>

  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await apiFetch(path, {
      ...init,
      // ต้องมี ไม่งั้นคุกกี้เซสชันไม่ถูกแนบไปกับ request และทุกอย่างตอบ 401
      credentials: 'same-origin',
      headers: {
        ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...init?.headers,
      },
    })
  } catch {
    // fetch โยนเฉพาะตอนต่อไม่ติดจริง ๆ (เซิร์ฟเวอร์ไม่ได้รัน / เน็ตหลุด)
    // ข้อความมาตรฐานของเบราว์เซอร์คือ "Failed to fetch" ซึ่งไม่ช่วยใครเลย
    throw new Error(SERVER_DOWN)
  }

  /**
   * ตอน dev คำขอผ่าน proxy ของ Vite — ถ้าเซิร์ฟเวอร์ API ไม่ได้รัน proxy จะตอบ
   * 502 กลับมาเป็น "คำตอบจริง" ไม่ใช่ทำให้ fetch ล้ม ตัว catch ข้างบนจึงไม่ทำงาน
   * และผู้ใช้จะเห็นแค่ "คำขอล้มเหลว (502)" ซึ่งไม่บอกว่าต้องไปทำอะไรต่อ
   *
   * สาเหตุเดียวกันนี้เกิดตอน production ได้ด้วยเมื่อ nginx อยู่หน้าเซิร์ฟเวอร์ที่ล่ม
   */
  if (response.status === 503) {
    const body = await response.json().catch(() => null) as { error?: unknown } | null
    throw new ApiError(typeof body?.error === 'string' ? body.error : SERVER_DOWN, 503)
  }
  if (response.status === 502 || response.status === 504) {
    throw new Error(SERVER_DOWN)
  }

  if (response.status === 401 && path !== '/api/auth/login') throw new UnauthorizedError()

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string
      details?: Record<string, string>
    } | null
    throw new ApiError(body?.error ?? `คำขอล้มเหลว (${response.status})`, response.status, body?.details)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

/* -------------------------------------------------------------------------- */
/* เข้าสู่ระบบ                                                                  */
/* -------------------------------------------------------------------------- */

export const auth = {
  /** คืน `null` เมื่อยังไม่ได้ล็อกอิน — ไม่โยน error เพราะนี่คือคำถามไม่ใช่การถูกปฏิเสธ */
  me: () => request<{ user: AdminUser | null }>('/api/auth/me').then((r) => r.user),

  login: (username: string, password: string) =>
    request<{ user: AdminUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }).then((r) => r.user),

  logout: () => request<{ ok: true }>('/api/auth/logout', { method: 'POST' }),
}

export const publicContent = {
  refresh: () => request<{ ok: true; counts: Record<string, number> }>('/api/admin/public-content', { method: 'POST' }),
}

/* -------------------------------------------------------------------------- */
/* บัญชีผู้ใช้หลังบ้าน                                                            */
/* -------------------------------------------------------------------------- */

/**
 * ทุก endpoint อยู่ใต้ /api/admin จึงต้องล็อกอินก่อนเสมอ
 *
 * `changeOwnPassword` แยกจาก `setPassword` โดยตั้งใจ ไม่ใช่ตัวเดียวกันที่ส่ง id
 * ของตัวเอง — อันแรกต้องกรอกรหัสเดิม อันหลังไม่ต้อง ถ้ารวมเป็นตัวเดียวแล้ววันหนึ่ง
 * มีคนเผลอทำให้เงื่อนไขหลุด จะกลายเป็นว่าใครก็ตั้งรหัสของตัวเองใหม่ได้โดยไม่ต้องรู้รหัสเดิม
 */
export const adminUsers = {
  list: () => request<AdminAccount[]>('/api/admin/users'),

  create: (payload: { username: string; displayName: string; password: string }) =>
    request<{ id: number }>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  remove: (id: number) => request<{ ok: true }>(`/api/admin/users/${id}`, { method: 'DELETE' }),

  /** ตั้งรหัสใหม่ให้บัญชีอื่นที่ลืมรหัสผ่าน */
  setPassword: (id: number, newPassword: string) =>
    request<{ ok: true }>(`/api/admin/users/${id}/password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    }),

  changeOwnPassword: (currentPassword: string, newPassword: string) =>
    request<{ ok: true }>('/api/admin/users/me/password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
}

/* -------------------------------------------------------------------------- */
/* ข่าวสาร                                                                     */
/* -------------------------------------------------------------------------- */

/** สิ่งที่ฟอร์มส่งขึ้นไป — ต่างจาก `AdminNews` ตรงที่ไม่มี `id` และวันที่เป็นสตริง ISO */
export type NewsPayload = Omit<AdminNews, 'id' | 'publishedAt'> & { publishedAt: string }
export type ProjectPayload = Omit<AdminProject, 'id'>

export const adminNews = {
  list: () => request<AdminNews[]>('/api/admin/news'),
  get: (id: number) => request<AdminNews>(`/api/admin/news/${id}`),
  create: (payload: NewsPayload) =>
    request<{ id: number }>('/api/admin/news', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: number, payload: NewsPayload) =>
    request<{ ok: true }>(`/api/admin/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  remove: (id: number) => request<{ ok: true }>(`/api/admin/news/${id}`, { method: 'DELETE' }),
}

export const adminProjects = {
  list: () => request<AdminProject[]>('/api/admin/projects'),
  get: (id: number) => request<AdminProject>(`/api/admin/projects/${id}`),
  create: (payload: ProjectPayload) =>
    request<{ id: number }>('/api/admin/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: number, payload: ProjectPayload) =>
    request<{ ok: true }>(`/api/admin/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  remove: (id: number) => request<{ ok: true }>(`/api/admin/projects/${id}`, { method: 'DELETE' }),
}

export type SiteReferencePayload = Omit<AdminSiteReference, 'id'>

export const adminSiteReferences = {
  list: () => request<AdminSiteReference[]>('/api/admin/site-references'),
  get: (id: number) => request<AdminSiteReference>(`/api/admin/site-references/${id}`),
  create: (payload: SiteReferencePayload) =>
    request<{ id: number }>('/api/admin/site-references', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: number, payload: SiteReferencePayload) =>
    request<{ ok: true }>(`/api/admin/site-references/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  remove: (id: number) =>
    request<{ ok: true }>(`/api/admin/site-references/${id}`, { method: 'DELETE' }),
}

/**
 * อัปโหลดรูปหนึ่งไฟล์ — PHP ใช้เบราว์เซอร์ย่อและแปลง PNG ก่อนส่ง
 *
 * ไม่ตั้ง Content-Type เองเมื่อส่ง FormData — เบราว์เซอร์ต้องเป็นคนใส่พร้อม
 * `boundary` ที่สุ่มขึ้นมา ถ้าเราตั้งทับ multipart จะแยกส่วนไม่ออกและเซิร์ฟเวอร์
 * จะมองไม่เห็นไฟล์เลย
 */
export async function uploadImage(file: File) {
  const imageFile = import.meta.env.VITE_API_DRIVER === 'php' ? await preparePhpImage(file) : file
  const body = new FormData()
  body.append('file', imageFile)
  return request<UploadedImage>('/api/admin/uploads', { method: 'POST', body })
}

async function preparePhpImage(file: File): Promise<File> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('รองรับรูป JPEG, PNG และ WebP เท่านั้น')
  if (file.size > 3_000_000) throw new Error('รูปต้องไม่เกิน 3 MB กรุณาย่อรูปก่อนอัปโหลด')
  let image: ImageBitmap
  try { image = await createImageBitmap(file) } catch { throw new Error('อ่านไฟล์รูปไม่ได้ กรุณาเลือกรูป JPEG, PNG หรือ WebP ที่สมบูรณ์') }
  try {
    if (image.width < 1 || image.height < 1 || image.width > 10000 || image.height > 10000 || image.width * image.height > 16_000_000) throw new Error('รูปมีความละเอียดสูงเกินไป กรุณาย่อรูปก่อนอัปโหลด')
    const canvas = document.createElement('canvas')
    let scale = Math.min(1, 1400 / Math.max(image.width, image.height))
    for (let attempt = 0; attempt < 8; attempt++) {
      canvas.width = Math.max(1, Math.round(image.width * scale))
      canvas.height = Math.max(1, Math.round(image.height * scale))
      const context = canvas.getContext('2d')
      if (!context) throw new Error('เบราว์เซอร์ไม่รองรับการจัดการรูป')
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('แปลงรูปไม่สำเร็จ กรุณาลองใหม่')
      if (blob.size <= 2_900_000) return new File([blob], 'image.png', { type: 'image/png' })
      scale *= 0.8
    }
    throw new Error('รูปมีขนาดใหญ่เกินไป กรุณาย่อรูปก่อนอัปโหลด')
  } finally { image.close() }
}

export type JobPayload = Omit<AdminJob, 'id'>
export const adminJobs = {
  list: () => request<AdminJob[]>('/api/admin/jobs'),
  get: (id: number) => request<AdminJob>('/api/admin/jobs/' + id),
  create: (payload: JobPayload) => request<{ id: number }>('/api/admin/jobs', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: number, payload: JobPayload) => request<{ ok: true }>('/api/admin/jobs/' + id, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: number) => request<{ ok: true }>('/api/admin/jobs/' + id, { method: 'DELETE' }),
}
