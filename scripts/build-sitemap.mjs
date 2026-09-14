// สร้าง public/sitemap.xml จากข้อมูลจริงใน src/data — รันอัตโนมัติก่อน `npm run build` (prebuild)
//
// เว็บเป็น SPA: Google ต้องรัน JavaScript ถึงจะเห็นลิงก์ในหน้า ซึ่งช้าและไม่แน่นอน
// sitemap บอกล่วงหน้าว่ามีหน้าสินค้า 191 หน้า + บริการ + แบรนด์ โดยไม่ต้องไล่คลิกเอง
//
// **ข่าวและผลงานไม่อยู่ในนี้** — สองอย่างนั้นอยู่ในฐานข้อมูลผ่าน API ถ้าต้องการให้ Google
// เก็บหน้าข่าวแต่ละหน้า ต้องให้ server สร้าง /sitemap-news.xml แยก แล้วมาเพิ่ม <sitemap> ใน
// sitemap index — ยังไม่ทำจนกว่าจะมีข่าวจริงบนเว็บ
//
// โหลดโมดูล TypeScript ผ่าน Vite เอง (ssrLoadModule) จึงไม่ต้องติดตั้ง tsx/ts-node เพิ่ม
// และ alias `@/` กับ `*.generated.ts` ทำงานเหมือนตอน build ทุกประการ

import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createServer } from 'vite'

const ROOT = resolve(import.meta.dirname, '..')
const OUT = resolve(ROOT, 'public/sitemap.xml')

// เส้นทางคงที่ตาม src/router.tsx — ไม่รวม /admin, /styleguide และ redirect ของ URL เก่า
const STATIC_PATHS = [
  '/',
  '/about',
  '/services',
  '/products',
  '/brands',
  '/reference',
  '/projects',
  '/news',
  '/careers',
  '/contact',
]

const vite = await createServer({
  root: ROOT,
  configFile: resolve(ROOT, 'vite.config.ts'),
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

try {
  const data = await vite.ssrLoadModule('/src/data/index.ts')
  const { siteUrl } = data

  const [services, products, brands] = await Promise.all([
    data.getServices(),
    data.getProducts(),
    data.getBrands(),
  ])

  const paths = [
    ...STATIC_PATHS,
    ...services.map((s) => `/services/${s.slug}`),
    ...brands.map((b) => `/brands/${b.id}/datasheets`),
    ...products.map((p) => `/products/${p.slug}`),
  ]

  const seen = new Set()
  const unique = paths.filter((p) => !seen.has(p) && seen.add(p))

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    unique.map((p) => `  <url><loc>${siteUrl}${p}</loc></url>`).join('\n') +
    '\n</urlset>\n'

  writeFileSync(OUT, xml)
  console.log(
    `sitemap.xml: ${unique.length} URLs (static ${STATIC_PATHS.length}, services ${services.length}, brands ${brands.length}, products ${products.length})`,
  )
} finally {
  await vite.close()
}
