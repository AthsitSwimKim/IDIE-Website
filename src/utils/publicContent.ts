import { apiFetch, usesPhpApi } from './apiFetch'

type Kind = 'news' | 'projects' | 'site-references' | 'jobs'
type Item = { slug?: string; id?: number }
const pending = new Map<Kind, Promise<Item[]>>()

async function loadCollection(kind: Kind): Promise<Item[]> {
  // Static IIS files serve published content without starting PHP or MariaDB.
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  try {
    const response = await fetch(`/uploads/content-cache/${kind}.json`, {
      cache: 'no-cache', credentials: 'omit', signal: controller.signal,
    })
    if (response.ok) {
      const snapshot = await response.json()
      const serverTime = Date.parse(response.headers.get('Date') ?? '')
      const now = Number.isFinite(serverTime) ? serverTime : Date.now()
      const expiry = snapshot.expiresAt === null ? Infinity : Date.parse(snapshot.expiresAt)
      if (snapshot.version === 1 && snapshot.kind === kind && Array.isArray(snapshot.items) && expiry > now) {
        return snapshot.items as Item[]
      }
    }
  } catch {
    // A missing/expired snapshot falls back to the API, which rebuilds the file.
  } finally {
    clearTimeout(timeout)
  }
  const response = await apiFetch(`/api/${kind}`)
  if (!response.ok) throw new Error(`/api/${kind} ตอบกลับ ${response.status}`)
  const items = await response.json()
  if (!Array.isArray(items)) throw new Error('ข้อมูลหน้าเว็บไซต์ไม่ถูกต้อง')
  return items as Item[]
}

export async function fetchPublishedContent<T>(path: string): Promise<T> {
  const match = path.match(/^\/api\/(news|projects|site-references|jobs)(?:\/([^/]+))?$/)
  if (!usesPhpApi || !match) {
    const response = await apiFetch(path)
    if (!response.ok) throw new Error(`${path} ตอบกลับ ${response.status}`)
    return await response.json() as T
  }
  const kind = match[1] as Kind
  let request = pending.get(kind)
  if (!request) {
    request = loadCollection(kind).finally(() => pending.delete(kind))
    pending.set(kind, request)
  }
  const items = await request
  if (!match[2]) return items as T
  const id = decodeURIComponent(match[2])
  return (items.find((item) => kind === 'site-references' ? String(item.id) === id : item.slug === id) ?? null) as T
}
