import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useLocale } from '@/hooks/useLocale'
import { COMPANY_NAME } from '@/components/layout/Logo'
import { siteUrl } from '@/data/company'
import type { LocalizedText } from '@/types/content'

export interface SeoProps {
  title: LocalizedText | string
  description?: LocalizedText | string
  /** path ของภาพ og (เริ่มด้วย /) — ไม่ใส่จะใช้ภาพแบรนด์กลาง */
  image?: string
  /**
   * บอก search engine ไม่ให้เก็บหน้านี้ — ใช้กับหน้า 404 เพราะเว็บเป็น SPA
   * เซิร์ฟเวอร์ตอบ 200 พร้อม index.html ให้ทุก URL Google จึงแยกไม่ออกว่าหน้าไหนไม่มีจริง
   */
  noindex?: boolean
}

const SITE_NAME = COMPANY_NAME

/** ภาพแชร์กลาง 1200×630 — สร้างจากตราบริษัทด้วย scripts/build-og-image.py */
const DEFAULT_IMAGE = '/images/brand/og-default.png'

/**
 * คำบรรยายเมื่อหน้าไม่ได้ส่งมา (เช่น 404) — ข้อความไทยต้องตรงกับที่ฝังใน index.html
 * เพราะ index.html คือสิ่งที่ crawler ที่ไม่รัน JavaScript เห็น
 */
const DEFAULT_DESCRIPTION: LocalizedText = {
  th: 'ID Industrial Engineering Co.,Ltd. — ระบบอินเตอร์คอม ระบบประกาศและสัญญาณเตือนภัย ระบบเครือข่ายและกล้องวงจรปิด สำหรับโรงงานอุตสาหกรรมและพื้นที่อันตราย',
  en: 'ID Industrial Engineering Co.,Ltd. — Intercom, public address and alarm, network and CCTV systems for industrial plants and hazardous areas.',
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.append(el)
  }
  el.content = content
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.append(el)
  }
  el.href = href
}

/**
 * meta per route
 *
 * **แก้แท็กที่มีอยู่แล้วใน index.html แทนการสร้างใหม่** — เดิมใช้วิธี render <meta> ใน
 * component แล้วให้ React 19 ยกขึ้น <head> ซึ่งได้ description สองแท็กต่อหน้า (ของ
 * index.html + ของหน้านั้น) Google อ่านแท็กแรก ทุกหน้าจึงโชว์คำบรรยายหน้าแรกในผลค้นหา
 *
 * ลบแท็กออกจาก index.html ไม่ได้ — Facebook, LINE และ crawler ส่วนใหญ่ไม่รัน
 * JavaScript สิ่งที่พวกมันเห็นคือ index.html ล้วน ๆ จึงต้องมีชุดค่าเริ่มต้นฝังไว้
 * แล้วให้หน้าแต่ละหน้ามาเขียนทับตอน JavaScript ทำงาน
 *
 * canonical ใช้เฉพาะ pathname — หน้าสินค้ามี query กรองแบรนด์/หมวดหมู่ ซึ่งเป็นมุมมอง
 * ของหน้าเดียวกัน ไม่ใช่คนละหน้า
 */
export function Seo({ title, description, image, noindex = false }: SeoProps) {
  const { t, locale } = useLocale()
  const { pathname } = useLocation()

  const resolvedTitle = typeof title === 'string' ? title : t(title)
  const resolvedDescription =
    typeof description === 'string' ? description : t(description ?? DEFAULT_DESCRIPTION)

  const fullTitle = resolvedTitle ? `${resolvedTitle} | ${SITE_NAME}` : SITE_NAME
  const canonical = siteUrl + (pathname === '/' ? '/' : pathname.replace(/\/+$/, ''))
  // og:image ต้องเป็น URL เต็ม — Facebook ไม่รับ path สัมพัทธ์
  const ogImage = siteUrl + (image ?? DEFAULT_IMAGE)

  useEffect(() => {
    document.title = fullTitle
    upsertMeta('name', 'description', resolvedDescription)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', resolvedDescription)
    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:url', canonical)
    upsertMeta('property', 'og:image', ogImage)
    upsertMeta('property', 'og:locale', locale === 'th' ? 'th_TH' : 'en_US')
    upsertLink('canonical', canonical)
    upsertMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow')
  }, [fullTitle, resolvedDescription, canonical, ogImage, locale, noindex])

  return null
}
