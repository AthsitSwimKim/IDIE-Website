/**
 * Data Accessor — กำแพงเดียวระหว่าง component กับข้อมูล
 *
 * Component ห้าม import จากไฟล์ใน src/data/ โดยตรง ให้เรียกผ่านฟังก์ชันในไฟล์นี้เท่านั้น
 * วันที่เปลี่ยนไปใช้ API หรือ CMS จริง จะแก้แค่ไฟล์นี้ไฟล์เดียว
 *
 * ทุกฟังก์ชันเป็น async ตั้งแต่วันนี้ทั้งที่ข้อมูลอยู่ในหน่วยความจำ เพราะถ้าเปลี่ยน
 * signature จาก sync เป็น async ทีหลัง ทุก component ที่เรียกต้องแก้หมด —
 * ต้นทุนของการทำวันนี้เท่ากับศูนย์
 */

import type {
  Brand,
  Datasheet,
  Industry,
  Product,
  IndustrySlug,
  JobOpening,
  NewsArticle,
  Project,
  ReferenceCompany,
  Service,
  LocalizedText,
} from '@/types/content'

import {
  certificates,
  company,
  companyFax,
  contactPerson,
  milestones,
  stats,
  valueProps,
} from '@/data/company'
import { capabilities, services } from '@/data/services'
import { serviceDepth } from '@/data/service-content'
import { industries } from '@/data/industries'
import {
  brandBlurbs,
  brandSupplies,
  brandDocuments,
  brandDownloadCentre,
  brands,
  sourcingStatement,
} from '@/data/brands'
import { datasheetCategories, datasheetCategoryOrder, loadDatasheets } from '@/data/datasheets'
import { loadProducts, PRODUCT_ATTRIBUTES } from '@/data/products'
import { referenceCompanies } from '@/data/references'
import { careersEmail, jobOpenings } from '@/data/careers'

export { ui } from '@/data/i18n'
export { capabilities, companyFax, contactPerson, careersEmail }
export { serviceDepth }
export type { ServiceDepth } from '@/data/service-content'
export { brandBlurbs, brandSupplies, brandDocuments, brandDownloadCentre, sourcingStatement }
/* ชื่อหมวดสองภาษา — หน้าสินค้าและหน้าคลังเอกสารใช้ชุดเดียวกัน ห้ามทำสองชุด */
export { datasheetCategories }
export { PRODUCT_ATTRIBUTES }

/* -------------------------------------------------------------------------- */
/* Company                                                                     */
/* -------------------------------------------------------------------------- */

export async function getCompany() {
  return company
}

export async function getMilestones() {
  return milestones
}

/**
 * หนังสือรับรองจากผู้ผลิตที่ยังมีผล เรียงจากใหม่ไปเก่า
 *
 * กรอง `status: 'expired'` ออกที่ชั้นนี้ ไม่ใช่ที่ component — IDIE แจ้ง (ส.ค. 2026)
 * ว่าไม่ต้องเผยแพร่หนังสือที่หมดอายุแล้ว การบังคับกฎไว้ที่ accessor ทำให้หน้าไหน
 * ก็ตามที่เรียกใช้ได้พฤติกรรมเดียวกัน โดยคนเขียน component ไม่ต้องรู้กติกาข้อนี้เอง
 *
 * ตอนนี้ไม่มีฉบับที่ expired เหลืออยู่แล้ว ตัวกรองจึงยังไม่ได้ทำงานจริง
 * แต่ต้องคงไว้เพื่อกันการเผลอเพิ่มหนังสือหมดอายุกลับเข้ามาแล้วขึ้นหน้าเว็บเงียบ ๆ
 */
export async function getCertificates() {
  return certificates
    .filter((cert) => cert.status === 'active')
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
}

export async function getStats() {
  return stats
}

export async function getValueProps() {
  return valueProps
}

/* -------------------------------------------------------------------------- */
/* Services                                                                    */
/* -------------------------------------------------------------------------- */

export async function getServices(): Promise<Service[]> {
  return [...services].sort((a, b) => a.order - b.order)
}

export async function getFeaturedServices(): Promise<Service[]> {
  return (await getServices()).filter((s) => s.featured)
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  return services.find((s) => s.slug === slug) ?? null
}

/* -------------------------------------------------------------------------- */
/* Industries / Brands                                                         */
/* -------------------------------------------------------------------------- */

export async function getIndustries(): Promise<Industry[]> {
  return [...industries].sort((a, b) => a.order - b.order)
}

export async function getBrands(): Promise<Brand[]> {
  return brands
}

export async function getBrandById(id: string): Promise<Brand | null> {
  return brands.find((b) => b.id === id) ?? null
}

/** ดาต้าชีตหนึ่งหมวด พร้อมชื่อหมวดที่แปลแล้ว — component ไม่ต้องรู้จัก map ของ slug */
export interface DatasheetGroup {
  category: string
  name: LocalizedText
  items: Datasheet[]
  /** จำนวนรายการในหมวด — หน้าสินค้าใช้ค่านี้โดยไม่ต้องส่งรายการทั้งก้อนมาด้วย */
  count?: number
}

/**
 * ดาต้าชีตของแบรนด์หนึ่ง จัดกลุ่มตามหมวดและเรียงตามลำดับที่กำหนดไว้ใน datasheets.ts
 *
 * จัดกลุ่มที่ชั้นนี้ ไม่ใช่ในหน้าเว็บ เพราะเป็นตรรกะของ**ข้อมูล** ไม่ใช่ของการแสดงผล —
 * วันที่ย้ายไปดึงจาก API ฝั่งเซิร์ฟเวอร์ควรส่งมาแบบจัดกลุ่มมาแล้วเช่นกัน
 */
export async function getDatasheetsByBrand(brandId: string): Promise<DatasheetGroup[]> {
  const order = datasheetCategoryOrder[brandId] ?? []
  const groups = new Map<string, Datasheet[]>()

  for (const sheet of await loadDatasheets()) {
    if (sheet.brandId !== brandId) continue
    const bucket = groups.get(sheet.category)
    if (bucket) bucket.push(sheet)
    else groups.set(sheet.category, [sheet])
  }

  // หมวดที่ไม่ได้อยู่ในลำดับที่กำหนดไว้ไปต่อท้ายโดยเรียงตามตัวอักษร แทนที่จะหายไปเฉย ๆ
  // — ผู้ผลิตเพิ่มโฟลเดอร์ใหม่ได้ตลอด และเอกสารที่หายไปเงียบ ๆ เป็นบั๊กที่ไม่มีใครเห็น
  const rank = (category: string) => {
    const index = order.indexOf(category)
    return index === -1 ? order.length : index
  }

  return [...groups.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([category, items]) => ({
      category,
      name: datasheetCategories[category] ?? { th: category, en: category },
      items,
    }))
}

/** จำนวนดาต้าชีตของแบรนด์ — ใช้บอกจำนวนบนปุ่มก่อนที่ผู้ใช้จะกดเข้าไป */
export async function countDatasheets(brandId: string): Promise<number> {
  return (await loadDatasheets()).filter((sheet) => sheet.brandId === brandId).length
}

/* -------------------------------------------------------------------------- */
/* สินค้า — ดึงจากเอกสารข้อมูลสินค้าของผู้ผลิต ดู scripts/build-products.py         */
/* -------------------------------------------------------------------------- */

export interface ProductFilter {
  category?: string
  brandId?: string
  query?: string
}

/**
 * กรองสินค้าตามหมวด แบรนด์ และคำค้น
 *
 * คำค้นดูทั้งชื่อและรหัสรุ่น และเทียบแบบตัดขีดกลางออกด้วย เพื่อให้พิมพ์ `xb15`
 * เจอ `XB-15` และกลับกัน — วิศวกรพิมพ์รหัสรุ่นตามที่จำได้ ไม่ได้พิมพ์ตามที่ผู้ผลิตสะกด
 */
export async function getProducts(filter: ProductFilter = {}): Promise<Product[]> {
  const needle = filter.query?.trim().toLowerCase() ?? ''
  const bare = needle.replace(/-/g, '')

  return (await loadProducts()).filter((product) => {
    if (filter.category && product.category !== filter.category) return false
    if (filter.brandId && product.brandId !== filter.brandId) return false
    if (!needle) return true
    const haystack = `${product.name} ${product.model ?? ''}`.toLowerCase()
    return haystack.includes(needle) || haystack.replace(/-/g, '').includes(bare)
  })
}

/**
 * สินค้าตัวอย่างสำหรับหน้าแรก — คัดคนละหมวดกัน ไม่ใช่เอาหัวรายการมาเรียง
 *
 * ถ้าหยิบตามลำดับปกติจะได้ไฟสัญญาณแปดรุ่นติดกันซึ่งดูเหมือนเว็บขายของอย่างเดียว
 * การกระจายหมวดทำให้ผู้อ่านเห็นความกว้างของสิ่งที่ IDIE จัดจำหน่ายในแถวเดียว
 * เอาเฉพาะรุ่นที่มีภาพถ่ายจริง — การ์ดว่างบนหน้าแรกเสียมากกว่าได้
 */
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const all = await loadProducts()
  const picked: Product[] = []
  const usedCategories = new Set<string>()

  for (const product of all) {
    if (picked.length >= limit) break
    if (usedCategories.has(product.category) || !product.card) continue
    if (product.gallery[0]?.kind !== 'photo') continue
    usedCategories.add(product.category)
    picked.push(product)
  }
  return picked
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return (await loadProducts()).find((product) => product.slug === slug) ?? null
}

/** สินค้ารุ่นอื่นในหมวดเดียวกัน — ใช้ท้ายหน้ารายละเอียด */
export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const all = await loadProducts()
  const sameCategory = all.filter(
    (item) => item.slug !== product.slug && item.category === product.category,
  )
  // เติมด้วยรุ่นอื่นของแบรนด์เดียวกันเมื่อหมวดนั้นมีของไม่พอ ดีกว่าโชว์แถวที่ไม่เต็ม
  const sameBrand = all.filter(
    (item) =>
      item.slug !== product.slug &&
      item.category !== product.category &&
      item.brandId === product.brandId,
  )
  return [...sameCategory, ...sameBrand].slice(0, limit)
}

/**
 * หมวดสินค้าที่มีของจริงอยู่ พร้อมจำนวน — เรียงตามลำดับที่กำหนดไว้ใน datasheets.ts
 *
 * คำนวณจากสินค้าที่มีอยู่ ไม่ได้ประกาศรายการหมวดไว้ตายตัว — หมวดที่ไม่มีสินค้าสักชิ้น
 * จะไม่โผล่เป็นชิปที่กดแล้วเจอหน้าว่าง ซึ่งเป็นบั๊กที่ผู้ใช้เจอก่อนเราเสมอ
 *
 * ส่ง `brandId` มาด้วยเมื่อผู้ใช้เลือกแบรนด์อยู่ — ไม่งั้นจะเห็นหมวดของอีกสองแบรนด์
 * ปนมาในรายการ ทั้งที่กดแล้วผลลัพธ์เป็นศูนย์เพราะตัวกรองแบรนด์ยังค้างอยู่
 */
export async function getProductCategories(brandId?: string): Promise<DatasheetGroup[]> {
  const counts = new Map<string, Product[]>()
  for (const product of await loadProducts()) {
    if (brandId && product.brandId !== brandId) continue
    const bucket = counts.get(product.category)
    if (bucket) bucket.push(product)
    else counts.set(product.category, [product])
  }

  // ลำดับหมวดของแต่ละแบรนด์ถูกกำหนดไว้แยกกัน — หน้ารวมสินค้าใช้ลำดับแรกที่เจอหมวดนั้น
  const order: string[] = []
  for (const list of Object.values(datasheetCategoryOrder)) {
    for (const category of list) if (!order.includes(category)) order.push(category)
  }
  const rank = (category: string) => {
    const index = order.indexOf(category)
    return index === -1 ? order.length : index
  }

  return [...counts.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([category, items]) => ({
      category,
      name: datasheetCategories[category] ?? { th: category, en: category },
      items: [],
      count: items.length,
    }))
}

/* -------------------------------------------------------------------------- */
/* Reference (ใคร) — แยกจาก Projects (ทำอะไร) โดยตั้งใจ                          */
/* -------------------------------------------------------------------------- */

export async function getReferenceCompanies(industry?: IndustrySlug): Promise<ReferenceCompany[]> {
  const list = [...referenceCompanies].sort((a, b) => a.order - b.order)
  return industry ? list.filter((c) => c.industry === industry) : list
}

export async function getFeaturedReferenceCompanies(limit = 12): Promise<ReferenceCompany[]> {
  return (await getReferenceCompanies()).filter((c) => c.featured).slice(0, limit)
}

/* -------------------------------------------------------------------------- */
/* Careers                                                                     */
/* -------------------------------------------------------------------------- */

export async function getJobOpenings(): Promise<JobOpening[]> {
  return jobOpenings.filter((j) => j.isOpen)
}

export async function getJobBySlug(slug: string): Promise<JobOpening | null> {
  return jobOpenings.find((j) => j.slug === slug) ?? null
}

/* -------------------------------------------------------------------------- */
/* ข่าวสารและผลงาน — มาจาก API ไม่ใช่ไฟล์ใน src/data/                            */
/*                                                                             */
/* สองอย่างนี้เป็นเนื้อหาที่ IDIE เพิ่มเองผ่านหน้าแอดมิน จึงอยู่ใน MySQL ไม่ใช่ในโค้ด   */
/* ที่เหลือทั้งหมด (บริษัท บริการ แบรนด์ เอกสาร ลูกค้า) ยังเป็นไฟล์ในโฟลเดอร์นี้        */
/* เพราะเปลี่ยนแทบไม่ได้และไม่ควรให้แก้ผ่านหน้าเว็บโดยไม่ผ่านการรีวิว                   */
/*                                                                             */
/* API ตอบกลับเป็น `NewsArticle` และ `Project` ตัวเดียวกับที่ types ประกาศไว้        */
/* component จึงไม่ต้องแก้อะไรเลยจากตอนที่ข้อมูลยังเป็น array ว่าง                    */
/* -------------------------------------------------------------------------- */

/**
 * ดึงจาก API แล้ว**ปล่อย error ให้ผู้เรียกจัดการ**
 *
 * เดิมฟังก์ชันนี้กลืน error เป็นค่าว่างทุกกรณี ด้วยเหตุผลว่าหน้าเว็บสาธารณะควรทน
 * ต่อ API ที่ล่ม — แต่ผลข้างเคียงคือหน้า News/Projects แยกไม่ออกระหว่าง
 * "ยังไม่มีเนื้อหา" กับ "โหลดไม่สำเร็จ" แล้วไปบอกผู้เข้าชมว่ายังไม่มีข่าว
 * ทั้งที่ข่าวมีอยู่ครบแต่ระบบหลังบ้านมีปัญหา ซึ่งเป็นข้อมูลที่ผิด
 *
 * ตอนนี้แยกเป็นสองทางชัดเจน: หน้าที่**มีหน้าที่แสดงรายการนั้นโดยตรง**เรียกตัวนี้
 * แล้วอ่าน `error` จาก `useAsyncData` ไปแสดงข้อความที่ถูกต้อง ส่วน section เสริม
 * ที่ล้มแล้วแค่ไม่ต้องแสดงให้ห่อด้วย `quiet()` ด้านล่าง
 */
async function fetchContent<T>(path: string): Promise<T> {
  const response = await fetch(path)
  if (!response.ok) throw new Error(`${path} ตอบกลับ ${response.status}`)
  return (await response.json()) as T
}

/**
 * กลืน error เป็นค่าสำรอง — สำหรับส่วนที่ล้มแล้วเงียบได้
 *
 * ใช้กับ section เสริมอย่าง "ข่าวล่าสุด" หรือ "ผลงานอื่น" ที่อยู่ท้ายหน้าอื่น
 * ผู้เข้าชมที่เปิดมาอ่านข่าวชิ้นหนึ่งไม่ควรเจอหน้าพังเพราะรายการข้างล่างโหลดไม่ขึ้น
 *
 * ยัง `console.error` ไว้เสมอ เพื่อให้คนที่เปิด devtools ตรวจอาการเห็นสาเหตุจริง
 * ไม่ใช่เดาว่าทำไมข่าวที่เพิ่งลงไม่ขึ้น
 */
async function quiet<T>(load: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await load()
  } catch (cause) {
    console.error('[data] โหลดเนื้อหาจาก API ไม่สำเร็จ:', cause)
    return fallback
  }
}

export async function getProjects(): Promise<Project[]> {
  return fetchContent<Project[]>('/api/projects')
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  const projects = await quiet(getProjects, [])
  // ผลงานที่แอดมินติดดาวไว้มาก่อน ถ้ายังไม่ครบจำนวนค่อยเติมด้วยชิ้นที่เหลือ
  // เพื่อไม่ให้ section บนหน้าแรกโล่งเพราะลืมติดดาว
  const featured = projects.filter((project) => project.featured)
  const rest = projects.filter((project) => !project.featured)
  return [...featured, ...rest].slice(0, limit)
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return quiet(
    () => fetchContent<Project | null>(`/api/projects/${encodeURIComponent(slug)}`),
    null,
  )
}

export async function getNews(): Promise<NewsArticle[]> {
  return fetchContent<NewsArticle[]>('/api/news')
}

export async function getLatestNews(limit = 3): Promise<NewsArticle[]> {
  // API เรียงมาให้แล้ว แต่เรียงซ้ำที่นี่เพื่อให้ฟังก์ชันนี้ถูกต้องด้วยตัวเอง
  // ไม่ต้องพึ่งว่า endpoint ฝั่งโน้นจะไม่เปลี่ยนลำดับในอนาคต
  return (await quiet(getNews, []))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit)
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  return quiet(() => fetchContent<NewsArticle | null>(`/api/news/${encodeURIComponent(slug)}`), null)
}

/* -------------------------------------------------------------------------- */
/* แบบฟอร์มติดต่อ                                                               */
/* -------------------------------------------------------------------------- */

export interface InquiryPayload {
  name: string
  company?: string
  email: string
  phone?: string
  subject: string
  message: string
  locale: 'th' | 'en'
  /** ช่องล่อบอต — ฟอร์มซ่อนไว้ ผู้ใช้จริงส่งค่าว่างเสมอ */
  website?: string
}

/**
 * ส่งคำถามจากแบบฟอร์มติดต่อ
 *
 * อยู่ในไฟล์นี้เหมือน accessor ตัวอื่นเพราะกติกาเดียวกัน — **component ไม่เรียก
 * `fetch` เอง** ต่างกันแค่ตัวนี้เป็นการ "ส่งออก" ไม่ใช่ "อ่านเข้า"
 *
 * ไม่กลืน error เหมือน `fetchContent` โดยตั้งใจ — ถ้าส่งไม่สำเร็จ ผู้ใช้**ต้องรู้**
 * ไม่งั้นเขาจะเดินจากไปโดยคิดว่าบริษัทได้รับคำถามแล้ว ซึ่งเป็นความเสียหาย
 * ที่แก้ทีหลังไม่ได้ (ต่างจากข่าวที่โหลดไม่ขึ้น ซึ่งแค่หน้าว่าง)
 */
export async function submitInquiry(payload: InquiryPayload): Promise<void> {
  let response: Response
  try {
    response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error('ติดต่อเซิร์ฟเวอร์ไม่ได้')
  }

  if (!response.ok) {
    // ข้อความจากเซิร์ฟเวอร์อธิบายสาเหตุได้ตรงกว่า (ส่งถี่เกินไป · ระบบเมลยังไม่พร้อม)
    // จึงใช้ของเซิร์ฟเวอร์ก่อน แล้วค่อยตกไปที่ข้อความกลาง ๆ ของหน้าเว็บ
    const body = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? '')
  }
}
