import type {
  ImageAsset,
  IndustrySlug,
  LocalizedText,
  NewsArticle,
  NewsCategory,
  Project,
} from '../../src/types/content.ts'

/**
 * แปลงแถวในฐานข้อมูลเป็นรูปร่างที่ฝั่งหน้าเว็บใช้อยู่แล้ว
 *
 * **ชั้นนี้คือเหตุผลที่ component ไม่ต้องรู้จักฐานข้อมูลเลย** — API ตอบกลับเป็น
 * `NewsArticle` และ `Project` ตัวเดียวกับที่ `src/types/content.ts` ประกาศไว้
 * accessor ใน `src/data/index.ts` จึงเปลี่ยนจาก `return []` เป็น `fetch()` ได้
 * โดยไม่ต้องแก้หน้าไหนเลย
 */

/* -------------------------------------------------------------------------- */
/* เวลา                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * MySQL DATETIME ไม่เก็บโซนเวลา — โปรเจกต์นี้จึง **เก็บเป็น UTC เสมอ**
 *
 * ฝั่งแอดมินส่ง ISO ที่มีโซนมาแล้ว (เบราว์เซอร์แปลงเวลาที่พิมพ์เป็น UTC ให้)
 * ที่นี่แค่จัดรูปแบบให้ MySQL อ่านได้ ถ้าใช้ `toISOString().slice(0,19)` ตรง ๆ
 * จะได้ `T` คั่นกลางซึ่ง MySQL รับได้บ้างไม่ได้บ้างแล้วแต่ sql_mode จึงเปลี่ยนเป็นเว้นวรรค
 */
export function toMysqlDateTime(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ')
}

/**
 * ขากลับ — ต่อ `Z` ให้ชัดว่าเป็น UTC ก่อนส่งออกเป็น ISO
 *
 * ถ้าไม่ต่อ เบราว์เซอร์จะตีความสตริงที่ไม่มีโซนว่าเป็นเวลาท้องถิ่นของ **เครื่องผู้ชม**
 * ข่าวเดียวกันจะแสดงคนละวันสำหรับคนที่อยู่คนละประเทศ
 */
export function fromMysqlDateTime(value: string): string {
  return new Date(`${value.replace(' ', 'T')}Z`).toISOString()
}

/* -------------------------------------------------------------------------- */
/* ชิ้นส่วนที่ใช้ร่วมกัน                                                          */
/* -------------------------------------------------------------------------- */

const text = (th: string, en: string): LocalizedText => ({ th, en })

/**
 * ประกอบ ImageAsset จากคอลัมน์ที่แยกกัน — คืน `null` เมื่อยังไม่ได้ใส่รูป
 *
 * ปล่อยให้เป็น null แล้วให้ฝั่งเรียกตัดสินใจ ดีกว่าคืนออบเจ็กต์ที่ `src` เป็นสตริงว่าง
 * ซึ่งจะกลายเป็น `<img src="">` ที่เบราว์เซอร์ตีความว่า "โหลดหน้านี้ซ้ำ" แล้วยิง
 * request เกินมาหนึ่งครั้งต่อรูป
 */
function toImage(row: {
  src: string | null
  src_set: string | null
  alt_th: string | null
  alt_en: string | null
  width: number | null
  height: number | null
}): ImageAsset | null {
  if (!row.src) return null

  const image: ImageAsset = {
    src: row.src,
    alt: text(row.alt_th ?? '', row.alt_en ?? ''),
  }
  if (row.src_set) image.srcSet = row.src_set
  if (row.width) image.width = row.width
  if (row.height) image.height = row.height
  return image
}

/**
 * รูปสำรองเมื่อยังไม่ได้อัปโหลดปก
 *
 * `Project.cover` และ `NewsArticle.cover` เป็น `ImageAsset` ที่ไม่ยอมรับ null
 * ตามที่ type เดิมประกาศไว้ — คืนออบเจ็กต์ที่ `src` ว่างไม่ได้ (ดูเหตุผลด้านบน)
 * จึงชี้ไปที่ตัวยึดพื้นที่ซึ่งฝั่งหน้าเว็บรู้จักและแสดงเป็นกรอบเปล่าอย่างตั้งใจ
 */
const NO_COVER: ImageAsset = {
  src: '/images/placeholder.svg',
  alt: text('ยังไม่มีภาพปก', 'No cover image yet'),
}

/* -------------------------------------------------------------------------- */
/* ข่าวสาร                                                                     */
/* -------------------------------------------------------------------------- */

export interface NewsRow {
  id: number
  slug: string
  title_th: string
  title_en: string
  excerpt_th: string
  excerpt_en: string
  body_th: string
  body_en: string
  category: NewsCategory
  published_at: string
  status: 'draft' | 'published'
  featured: number
  cover_src: string | null
  cover_src_set: string | null
  cover_alt_th: string | null
  cover_alt_en: string | null
  cover_width: number | null
  cover_height: number | null
}

/** รูปร่างที่หน้าเว็บสาธารณะได้รับ — ตรงกับ `NewsArticle` เป๊ะ */
export function toNewsArticle(row: NewsRow): NewsArticle {
  const cover = toImage({
    src: row.cover_src,
    src_set: row.cover_src_set,
    alt_th: row.cover_alt_th,
    alt_en: row.cover_alt_en,
    width: row.cover_width,
    height: row.cover_height,
  })

  return {
    slug: row.slug,
    title: text(row.title_th, row.title_en),
    excerpt: text(row.excerpt_th, row.excerpt_en),
    body: text(row.body_th, row.body_en),
    category: row.category,
    publishedAt: fromMysqlDateTime(row.published_at),
    cover: cover ?? NO_COVER,
    featured: row.featured === 1,
  }
}

/**
 * รูปร่างที่หน้าแอดมินได้รับ — มีของที่หน้าเว็บสาธารณะไม่ควรเห็น
 *
 * `id` ไว้ทำลิงก์แก้ไข · `status` ไว้แสดงว่าเป็นร่างหรือเผยแพร่แล้ว ·
 * `cover` เป็น null ได้ตรง ๆ เพื่อให้ฟอร์มรู้ว่ายังไม่มีปก ไม่ใช่มีปกเป็นตัวยึดพื้นที่
 */
export function toAdminNews(row: NewsRow) {
  return {
    ...toNewsArticle(row),
    id: row.id,
    status: row.status,
    cover: toImage({
      src: row.cover_src,
      src_set: row.cover_src_set,
      alt_th: row.cover_alt_th,
      alt_en: row.cover_alt_en,
      width: row.cover_width,
      height: row.cover_height,
    }),
  }
}

/* -------------------------------------------------------------------------- */
/* ผลงาน                                                                       */
/* -------------------------------------------------------------------------- */

export interface ProjectRow {
  id: number
  slug: string
  name_th: string
  name_en: string
  client_th: string
  client_en: string
  industry: IndustrySlug
  location_th: string
  location_en: string
  year: number | null
  overview_th: string
  overview_en: string
  engineering_solution_th: string
  engineering_solution_en: string
  status: 'draft' | 'published'
  featured: number
  cover_src: string | null
  cover_src_set: string | null
  cover_alt_th: string | null
  cover_alt_en: string | null
  cover_width: number | null
  cover_height: number | null
}

export interface ScopeRow {
  project_id: number
  text_th: string
  text_en: string
}

export interface ProjectImageRow {
  project_id: number
  src: string
  src_set: string | null
  alt_th: string
  alt_en: string
  width: number | null
  height: number | null
}

export function toProject(
  row: ProjectRow,
  scope: ScopeRow[],
  images: ProjectImageRow[],
): Project {
  const cover = toImage({
    src: row.cover_src,
    src_set: row.cover_src_set,
    alt_th: row.cover_alt_th,
    alt_en: row.cover_alt_en,
    width: row.cover_width,
    height: row.cover_height,
  })

  return {
    slug: row.slug,
    name: text(row.name_th, row.name_en),
    client: text(row.client_th, row.client_en),
    industry: row.industry,
    location: text(row.location_th, row.location_en),
    year: row.year,
    scopeOfWork: scope.map((item) => text(item.text_th, item.text_en)),
    overview: text(row.overview_th, row.overview_en),
    engineeringSolution: text(row.engineering_solution_th, row.engineering_solution_en),
    cover: cover ?? NO_COVER,
    gallery: images.map((image) => toImage({ ...image })).filter((image) => image !== null),
    featured: row.featured === 1,
  }
}

export function toAdminProject(
  row: ProjectRow,
  scope: ScopeRow[],
  images: ProjectImageRow[],
) {
  return {
    ...toProject(row, scope, images),
    id: row.id,
    status: row.status,
    cover: toImage({
      src: row.cover_src,
      src_set: row.cover_src_set,
      alt_th: row.cover_alt_th,
      alt_en: row.cover_alt_en,
      width: row.cover_width,
      height: row.cover_height,
    }),
  }
}
