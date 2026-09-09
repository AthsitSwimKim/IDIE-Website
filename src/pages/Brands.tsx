import { Badge, Button, Heading, Section } from '@/components/ui'
import { DocumentIcon, ExternalLinkIcon } from '@/components/ui/icons'
import { Seo } from '@/components/layout/Seo'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import {
  brandBlurbs,
  brandDocuments,
  brandSupplies,
  countDatasheets,
  getBrands,
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
 * ปุ่มไปหน้าคลังดาต้าชีตของแบรนด์ พร้อมจำนวนเอกสาร
 *
 * แยกเป็น component เล็ก ๆ เพราะต้องเรียกข้อมูลของตัวเอง — การดึงจำนวนของทั้งสาม
 * แบรนด์ไว้ที่หน้าแม่แล้วส่งลงมาแปลว่าต้องจับคู่ผลลัพธ์กลับไปหาแบรนด์เอง
 * ซึ่งยาวกว่าและพังเงียบกว่าถ้าลำดับเปลี่ยน
 */
function DatasheetsButton({ brandId }: { brandId: string }) {
  const { t } = useLocale()
  const { data: count } = useAsyncData(() => countDatasheets(brandId), [brandId])

  if (!count) return null

  return (
    <Button to={`/brands/${brandId}/datasheets`} variant="outline">
      {t(ui.datasheets.title)}
      {/* วงเล็บอยู่ในข้อความ ไม่ใช่คั่นด้วยระยะห่างเฉย ๆ — จำนวนที่ลอยอยู่ข้างชื่อปุ่ม
          อ่านเหมือนเป็นคนละอย่างกัน ทั้งที่มันขยายความชื่อปุ่มอยู่ */}
      <span className="stat-figure text-ink-muted -ml-1 text-sm">({count})</span>
      <ExternalLinkIcon aria-hidden="true" className="size-4 shrink-0" />
    </Button>
  )
}

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
        const covered: LocalizedText[] = brandSupplies[brand.id] ?? []

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
                    {/*
                      ขนาดเท่าเนื้อความ (18px) ไม่ใช่ป้าย 14px — ป้ายนี้กำกับรายการที่อยู่
                      ใต้มันโดยตรง ถ้าเล็กกว่ารายการจะดูเหมือนหมายเหตุที่หลุดมา
                      ไม่ใช่หัวข้อของรายการ แยกตัวเองจากเนื้อหาด้วยน้ำหนักและสีเข้มแทน
                    */}
                    <h3 className="text-ink text-base font-semibold">
                      {t(ui.brandsPage.suppliesHeading)}
                    </h3>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {covered.map((item) => (
                        <li key={item.en}>
                          <Badge tone="brand">{t(item)}</Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-8 flex flex-wrap gap-3">
                  {/*
                    ต่อ #product-filters เหมือนการ์ดแบรนด์บนหน้าแรก — หน้าสินค้าจะกระโดดไป
                    หยุดที่แถวตัวกรองตั้งแต่เฟรมแรก (ดู FILTERS_ID ใน ProductList.tsx)
                    คนที่กดมาจากหน้านี้จึงเห็นทันทีว่ากำลังกรองแบรนด์ไหนอยู่ ไม่ใช่ตกลงมา
                    กลางรายการโดยไม่รู้ว่าตัวกรองถูกตั้งไว้แล้ว
                  */}
                  <Button to={`/products?brand=${brand.id}#product-filters`} withArrow>
                    {t(ui.brandsPage.viewProducts)}
                  </Button>
                  {/*
                    ปุ่มดาต้าชีตบอกจำนวนไฟล์มาด้วย — คนที่กดเข้าไปเจอเอกสารเป็นร้อยฉบับ
                    โดยไม่รู้ล่วงหน้าจะตกใจ ส่วนคนที่เห็นเลขก่อนจะรู้ว่ามีช่องค้นหาให้ใช้
                  */}
                  <DatasheetsButton brandId={brand.id} />
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
                      {/*
                        ตราย่อของผู้ผลิตท้ายปุ่ม — `alt=""` เพราะชื่อแบรนด์อยู่ในหัวข้อ
                        ของ section เดียวกันอยู่แล้ว ถ้าใส่ alt ซ้ำ ผู้ใช้ screen reader
                        จะได้ยินชื่อแบรนด์สองรอบติดกันในปุ่มเดียว
                      */}
                      {brand.siteIcon && (
                        <img
                          src={brand.siteIcon.src}
                          srcSet={brand.siteIcon.srcSet}
                          alt=""
                          width={brand.siteIcon.width}
                          height={brand.siteIcon.height}
                          loading="lazy"
                          decoding="async"
                          className="size-4 shrink-0 object-contain"
                        />
                      )}
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
            <Button to="/contact" variant="onDark" withArrow>
              {t(ui.actions.contactInquiry)}
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}
