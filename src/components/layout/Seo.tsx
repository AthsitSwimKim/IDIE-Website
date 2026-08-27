import { useLocale } from '@/hooks/useLocale'
import { COMPANY_NAME } from '@/components/layout/Logo'
import type { LocalizedText } from '@/types/content'

export interface SeoProps {
  title: LocalizedText | string
  description?: LocalizedText | string
  /** path ของภาพ og — ใส่เมื่อมีภาพจริงจาก IDIE */
  image?: string
}

const SITE_NAME = COMPANY_NAME

/**
 * meta per route
 *
 * React 19 ยก <title> และ <meta> ที่ render ที่ไหนก็ได้ขึ้นไปไว้ใน <head> ให้เอง
 * จึงไม่ต้องใช้ react-helmet — dependency น้อยลงหนึ่งตัวและไม่มี provider ให้ลืมครอบ
 *
 * โครงนี้เตรียมไว้ต่อ structured data (JSON-LD) ใน phase ถัดไป
 */
export function Seo({ title, description, image }: SeoProps) {
  const { t } = useLocale()

  const resolvedTitle = typeof title === 'string' ? title : t(title)
  const resolvedDescription =
    typeof description === 'string' ? description : description ? t(description) : undefined

  const fullTitle = resolvedTitle ? `${resolvedTitle} | ${SITE_NAME}` : SITE_NAME

  return (
    <>
      <title>{fullTitle}</title>
      {resolvedDescription && <meta name="description" content={resolvedDescription} />}
      <meta property="og:title" content={fullTitle} />
      {resolvedDescription && <meta property="og:description" content={resolvedDescription} />}
      <meta property="og:type" content="website" />
      {image && <meta property="og:image" content={image} />}
    </>
  )
}
