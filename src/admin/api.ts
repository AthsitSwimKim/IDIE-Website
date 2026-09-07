import type {
  AdminNews,
  AdminProject,
  AdminSiteReference,
  AdminUser,
  UploadedImage,
} from '@/types/admin'

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
  'ติดต่อเซิร์ฟเวอร์ไม่ได้ — ตรวจว่าเซิร์ฟเวอร์ใน server/ รันอยู่ (cd server && npm run dev)'

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
    response = await fetch(path, {
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
  if (response.status === 502 || response.status === 503 || response.status === 504) {
    throw new Error(SERVER_DOWN)
  }

  if (response.status === 401) throw new UnauthorizedError()

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
 * อัปโหลดรูปหนึ่งไฟล์ — เซิร์ฟเวอร์ย่อและแปลงเป็น WebP สองความละเอียดให้เอง
 *
 * ไม่ตั้ง Content-Type เองเมื่อส่ง FormData — เบราว์เซอร์ต้องเป็นคนใส่พร้อม
 * `boundary` ที่สุ่มขึ้นมา ถ้าเราตั้งทับ multipart จะแยกส่วนไม่ออกและเซิร์ฟเวอร์
 * จะมองไม่เห็นไฟล์เลย
 */
export function uploadImage(file: File) {
  const body = new FormData()
  body.append('file', file)
  return request<UploadedImage>('/api/admin/uploads', { method: 'POST', body })
}
