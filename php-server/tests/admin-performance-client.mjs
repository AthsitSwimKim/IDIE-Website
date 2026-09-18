
import { build } from 'vite'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { writeFileSync } from 'node:fs'
import assert from 'node:assert/strict'
const out = resolve('tmp/admin-performance-client-test')
await build({ configFile: false, publicDir: false, define: { 'import.meta.env.VITE_API_DRIVER': '"php"' }, build: { lib: { entry: resolve('src/admin/api.ts'), formats: ['es'], fileName: () => 'client.mjs' }, outDir: out, emptyOutDir: true, minify: false } })
const { adminDashboard, publicContent, UnauthorizedError } = await import(pathToFileURL(resolve(out, 'client.mjs')))
const data = { stats: { news: { published: 2, draft: 1 }, projects: { published: 0, draft: 0 }, 'site-references': { published: 1, draft: 0 } }, drafts: [{ key: 'news-3', kind: 'ข่าวสาร', title: 'Local draft', to: '/admin/news/3' }], recentNews: [], visitors: 8 }
const calls = []
let dashboardStatus = 200
globalThis.fetch = async (url, options) => {
  calls.push({ url, options })
  if (url.endsWith('admin%2Fdashboard')) return new Response(JSON.stringify(dashboardStatus === 200 ? data : { error: 'Denied' }), { status: dashboardStatus, headers: { 'X-CSRF-Token': 'local-test-read-token' } })
  if (url.endsWith('admin%2Fpublic-content')) return new Response(JSON.stringify({ ok: true, counts: {} }), { status: 200 })
  throw new Error('Unexpected request: ' + url)
}
const passed = []
const check = (label, condition) => { assert(condition, label); passed.push(label) }
check('PHP dashboard returns complete typed summary', JSON.stringify(await adminDashboard.get()) === JSON.stringify(data))
check('Dashboard data requires one HTTP request', calls.length === 1 && calls[0].url === '/api/index.php?route=admin%2Fdashboard')
check('Dashboard keeps session credentials', calls[0].options.credentials === 'same-origin')
await publicContent.refresh()
check('Released GET CSRF header avoids extra auth bootstrap', calls.length === 2 && calls[1].url.endsWith('admin%2Fpublic-content') && calls[1].options.headers.get('X-CSRF-Token') === 'local-test-read-token')
dashboardStatus = 401
await assert.rejects(adminDashboard.get(), UnauthorizedError)
check('Unauthorized dashboard never returns fake summary', true)
for (const label of passed) console.log('PASS', label)
writeFileSync(resolve('tmp/php-test/admin-performance-client-results.json'), JSON.stringify(passed, null, 2))
console.log(passed.length + ' dashboard client checks passed')
