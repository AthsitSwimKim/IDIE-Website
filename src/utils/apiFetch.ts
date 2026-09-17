/** The PHP transport works without IIS API rewrite rules or WebDAV verbs. */
export const usesPhpApi = import.meta.env.VITE_API_DRIVER === 'php'
let csrfToken: string | undefined
let csrfRequest: Promise<void> | undefined

function apiUrl(path: string): string {
  return usesPhpApi
    ? `/api/index.php?route=${encodeURIComponent(path.replace(/^\/api\/?/, ''))}`
    : path
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const method = (init.method ?? 'GET').toUpperCase()
  const changesData = method !== 'GET' && method !== 'HEAD'
  if (usesPhpApi && changesData && !csrfToken) {
    csrfRequest ??= fetch(apiUrl('/api/auth/me'), { credentials: 'same-origin', cache: 'no-store' })
      .then(async (response) => {
        const body = await response.json()
        if (!response.ok || typeof body.csrfToken !== 'string') {
          throw new Error(body.error ?? 'ระบบหลังบ้านยังไม่พร้อมใช้งาน')
        }
        csrfToken = body.csrfToken
      })
      .finally(() => { csrfRequest = undefined })
    await csrfRequest
  }
  const headers = new Headers(init.headers)
  if (usesPhpApi && changesData) {
    headers.set('X-CSRF-Token', csrfToken!)
    if (method === 'PUT' || method === 'DELETE') headers.set('X-HTTP-Method-Override', method)
  }
  const response = await fetch(apiUrl(path), {
    ...init,
    method: usesPhpApi && (method === 'PUT' || method === 'DELETE') ? 'POST' : method,
    headers,
    credentials: 'same-origin',
  })
  const freshToken = response.headers.get('X-CSRF-Token')
  if (freshToken) csrfToken = freshToken
  if (response.status === 403) csrfToken = undefined
  return response
}
