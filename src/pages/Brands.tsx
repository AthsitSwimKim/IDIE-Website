import { Badge, Button, Heading, Section } from '@/components/ui'
import { DocumentIcon } from '@/components/ui/icons'
import { Seo } from '@/components/layout/Seo'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import {
  brandBlurbs,
  brandCategories,
  brandDocuments,
  getBrands,
  getProductCategories,
  sourcingStatement,
  ui,
} from '@/data'
import type { DownloadItem, LocalizedText } from '@/types/content'
import { cn } from '@/utils/cn'

/**
 * ป้ายบนปุ่มเอกสารตามชนิด — ต้องครบทุกค่าของ `DownloadItem['type']`
 * ถ้าวันหน้าเพิ่มชนิดใหม่ใน type แล้วลืมเพิ่มที่นี่ `satisfies` จะฟ้องตอน build
 * ไม่ใช่ปล่อยให้ปุ่มขึ้นเป็นค่าว่างบนหน้าเว็บ
 */
const documentTypeLabel = {
  catalog: ui.brandsPage.documentCatalog,
  datasheet: ui.brandsPage.documentDatasheet,
  manual: ui.brandsPage.documentManual,
  certificate: ui.brandsPage.documentCertificate,
} satisfies Record<DownloadItem['type'], LocalizedText>

/**
 * หน้าแบรนด์คู่ค้า
 *
 * เว็บเดิมมีหน้าแยกต่อแบรนด์ (Industronic.html / FHF.html / MEDC.html) แต่ทั้งสามหน้า
 * เป็นแค่ iframe ไปเว็บผู้ผลิตหรือไฟล์ catalog PDF ซึ่งไม่ได้ให้ข้อมูลอะไรกับผู้ใช้เลย
 * หน้านี้จึงรวมทั้งสามไว้ที่เดียวและตอบคำถามที่ลูกค้าถามจริง ๆ แทน:
 * แบรนด์นี้คือใคร IDIE จัดจำหน่ายอะไรของแบรนด์นี้บ้าง และกดดูสินค้าต่อได้ที่ไหน
 *
 * ใช้ layout แบบ split สลับข้าง ไม่ใช่ card grid เพราะมีแค่ 3 รายการ —
 * grid 3 ช่องจะดูโล่งและไม่ได้ใช้ประโยชน์จากพื้นที่ที่มี
 */
export default function Brands() {
  const { t } = useLocale()
  const { data: brands } = useAsyncData(getBrands)
  const { data: categories } = useAsyncData(getProductCategories)

  return (
    <>
      <Seo title={ui.brandsPage.title} description={ui.brandsPage.seoDescription} />

      <Section tone="alt" spacing="lg">
        <Heading level={1} eyebrow="BRAND PARTNERS">
          {t(ui.brandsPage.title)}
        </Heading>
        <p className="text-ink-muted mt-4 max-w-2xl">{t(ui.brandsPage.lead)}</p>
        <p className="mt-6 flex items-center gap-2.5 text-sm font-medium">
          <span aria-hidden="true" className="engineering-line w-10" />
          {t(sourcingStatement)}
        </p>
      </Section>

      {brands?.map((brand, index) => {
        const covered = (brandCategories[brand.id] ?? [])
          .map((slug) => categories?.find((c) => c.slug === slug))
          .filter((c) => c !== undefined)

        // เอกสารที่ยังไม่ได้ไฟล์จริง (`url: null`) ไม่ต้องแสดง — ลิงก์ที่กดแล้วไม่มีอะไร
        // แย่กว่าการไม่มีลิงก์ ส่วนที่ยังขาดถูกไล่ไว้ใน docs/data-requests.md แล้ว
        const documents = (brandDocuments[brand.id] ?? []).filter((doc) => doc.url)

        return (
          <Section key={brand.id} tone={index % 2 === 1 ? 'alt' : 'light'} id={brand.id}>
            <div
              className={cn(
                'grid items-start gap-10 md:grid-cols-5',
                // สลับข้างเพื่อไม่ให้สาม section ติดกันดูเป็นแถวเดียวกันซ้ำ ๆ
                index % 2 === 1 && 'md:[&>*:first-child]:order-2',
              )}
            >
              <div className="md:col-span-2">
                <span className="border-line bg-surface rounded-card flex aspect-3/2 items-center justify-center border p-8">
                  <img
                    src={brand.logo.src}
                    srcSet={brand.logo.srcSet}
                    alt={t(brand.logo.alt)}
                    width={brand.logo.width}
                    height={brand.logo.height}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain"
                  />
                </span>
              </div>

              <div className="md:col-span-3">
                <Heading level={2} eyebrow={brand.country}>
                  {brand.name}
                </Heading>
                <p className="text-ink-muted mt-4 max-w-prose">{t(brandBlurbs[brand.id])}</p>

                {covered.length > 0 && (
                  <div className="mt-7">
                    <h3 className="text-eyebrow text-ink-muted uppercase">
                      {t(ui.brandsPage.suppliesHeading)}
                    </h3>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {covered.map((category) => (
                        <li key={category.slug}>
                          <Badge tone="brand">{t(category.name)}</Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button to={`/products?brand=${brand.id}`} withArrow>
                    {t(ui.brandsPage.viewProducts)}
                  </Button>
                  {/*
                    เอกสารผู้ผลิตอยู่ก่อนลิงก์ออกนอกเว็บ — ปุ่มที่พาออกจากเว็บควรเป็น
                    ตัวเลือกท้ายสุดของแถวเสมอ
                  */}
                  {documents.map((doc) => (
                    <Button
                      key={doc.url}
                      href={doc.url ?? undefined}
                      target="_blank"
                      variant="outline"
                    >
                      <DocumentIcon aria-hidden="true" className="size-4 shrink-0" />
                      {t(documentTypeLabel[doc.type])}
                    </Button>
                  ))}
                  {brand.website && (
                    <Button href={brand.website} target="_blank" variant="outline">
                      {t(ui.brandsPage.visitSite)}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Section>
        )
      })}

      <Section tone="dark" spacing="lg" className="blueprint-grid">
        <div className="max-w-2xl">
          <Heading level={2} eyebrow="NEXT STEP">
            {t(ui.brandsPage.ctaTitle)}
          </Heading>
          <p className="mt-4 text-white/70">{t(ui.brandsPage.ctaLead)}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/products" variant="onDark" withArrow>
              {t(ui.nav.products)}
            </Button>
            <Button
              to="/contact"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 active:bg-white/15"
            >
              {t(ui.actions.contactInquiry)}
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}
