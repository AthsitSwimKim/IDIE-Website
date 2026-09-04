import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Datasheet } from '@/types/content'
import { Badge, Button, Heading, Section } from '@/components/ui'
import { Seo } from '@/components/layout/Seo'
import NotFound from '@/pages/NotFound'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { brandDownloadCentre, getBrandById, getDatasheetsByBrand, ui } from '@/data'

/**
 * คลังดาต้าชีตรายรุ่นของแบรนด์เดียว — `/brands/:brandId/datasheets`
 *
 * **ทำไมต้องมีภาพหน้าปก** ไม่ใช่รายการชื่อไฟล์เรียงกัน — วิศวกรที่มาหาดาต้าชีต
 * มักจำ "หน้าตาของเอกสาร" ได้ก่อนจำชื่อรุ่น (เคยเห็นหน้าที่มีรูปกล่องสีแดงอยู่มุมขวา)
 * ภาพหน้าแรกจึงเป็นตัวช่วยค้นหาที่แท้จริง ไม่ใช่ของประดับ และยังบอกล่วงหน้าว่า
 * ไฟล์ที่กำลังจะโหลดคือเอกสารแบบไหน ก่อนจะเสียเวลาโหลดไฟล์หลายร้อย KB
 *
 * **ทำไมต้องมีช่องค้นหา** — ของ Industronic มี 169 ฉบับ การไล่อ่านทีละหมวดจนเจอ
 * ใช้เวลานานกว่าพิมพ์ชื่อรุ่นที่รู้อยู่แล้วมาก คนที่เปิดหน้านี้ส่วนใหญ่รู้ชื่อรุ่นมาก่อน
 */
export default function BrandDatasheets() {
  const { brandId = '' } = useParams()
  const { t, locale } = useLocale()
  const [query, setQuery] = useState('')

  const { data: brand, loading } = useAsyncData(() => getBrandById(brandId), [brandId])
  const { data: groups } = useAsyncData(() => getDatasheetsByBrand(brandId), [brandId])

  const needle = query.trim().toLowerCase()
  const visible = useMemo(() => {
    if (!groups) return []
    if (!needle) return groups
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((sheet) => matches(sheet, needle)),
      }))
      .filter((group) => group.items.length > 0)
  }, [groups, needle])

  if (loading) return null
  if (!brand) return <NotFound />

  const total = groups?.reduce((sum, group) => sum + group.items.length, 0) ?? 0
  const shown = visible.reduce((sum, group) => sum + group.items.length, 0)
  const downloadCentre = brandDownloadCentre[brand.id]

  return (
    <>
      <Seo
        title={{
          th: `เอกสารข้อมูลสินค้า ${brand.name}`,
          en: `${brand.name} datasheets`,
        }}
        description={{
          th: `เอกสารข้อมูลจำเพาะรายรุ่นของ ${brand.name} ที่ IDIE เป็นตัวแทนจำหน่าย`,
          en: `Model-by-model specification sheets for ${brand.name}, distributed by IDIE.`,
        }}
      />

      <Section tone="alt" spacing="lg">
        <Heading level={1} eyebrow={brand.name}>
          {t(ui.datasheets.title)}
        </Heading>
        <p className="text-ink-muted mt-4 max-w-prose">{t(ui.datasheets.lead)}</p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button to="/brands" variant="ghost">
            {t(ui.datasheets.backToBrands)}
          </Button>
          {downloadCentre && (
            <Button href={downloadCentre} target="_blank" variant="ghost">
              {t(ui.datasheets.downloadCentre)}
            </Button>
          )}
        </div>
      </Section>

      <Section spacing="md">
        {/*
          ช่องค้นหาไม่ได้อยู่ในฟอร์มที่ต้องกดส่ง — กรองทันทีขณะพิมพ์
          เพราะข้อมูลอยู่ในเครื่องแล้ว การบังคับให้กด "ค้นหา" ไม่ได้ทำให้เร็วขึ้น
        */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <label className="block w-full max-w-sm">
            <span className="text-eyebrow text-ink-muted uppercase">
              {t(ui.datasheets.searchLabel)}
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t(ui.datasheets.searchPlaceholder)}
              className="border-line bg-surface rounded-card focus:border-primary-600 mt-2 block h-11 w-full border px-4 text-base outline-none"
            />
          </label>
          <p className="text-ink-muted text-sm">
            {t(needle ? ui.datasheets.resultCount : ui.datasheets.totalCount)
              .replace('{shown}', String(shown))
              .replace('{total}', String(total))}
          </p>
        </div>

        {shown === 0 && <p className="text-ink-muted mt-12">{t(ui.datasheets.empty)}</p>}

        {visible.map((group) => (
          <section key={group.category} className="mt-14 first:mt-12">
            <h2 className="border-line flex flex-wrap items-baseline gap-3 border-b pb-3">
              <span className="text-h3 font-semibold">{t(group.name)}</span>
              <span className="stat-figure text-ink-muted text-sm">{group.items.length}</span>
            </h2>

            <ul className="mt-7 grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
              {group.items.map((sheet) => (
                <li key={sheet.id}>
                  <DatasheetCard sheet={sheet} locale={locale} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </Section>

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
            <Button
              to="/brands"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 active:bg-white/15"
            >
              {t(ui.datasheets.backToBrands)}
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}

/** ค้นจากทุกช่องที่ผู้ใช้น่าจะพิมพ์ — ชื่อเอกสาร ชื่อรุ่น และเลขเอกสารของผู้ผลิต */
function matches(sheet: Datasheet, needle: string): boolean {
  const haystack = [sheet.title, sheet.model, sheet.docNo].filter(Boolean).join(' ').toLowerCase()
  // ตัดขีดกลางออกด้วย เพื่อให้พิมพ์ "xb15" เจอ "XB-15" และกลับกัน
  return haystack.includes(needle) || haystack.replace(/-/g, '').includes(needle.replace(/-/g, ''))
}

function DatasheetCard({ sheet, locale }: { sheet: Datasheet; locale: string }) {
  const { t } = useLocale()

  return (
    /*
      เป็น <a href> ธรรมดาที่เปิดแท็บใหม่ ไม่ใช่ปุ่มดาวน์โหลด — เบราว์เซอร์ทุกตัว
      แสดง PDF ได้เองอยู่แล้ว การบังคับดาวน์โหลดทำให้คนที่แค่อยากดูสเปกหนึ่งบรรทัด
      ได้ไฟล์ค้างอยู่ในเครื่องโดยไม่ได้ตั้งใจ ส่วนคนที่อยากเก็บไฟล์กดบันทึกจากโปรแกรมอ่านได้
    */
    <a
      href={sheet.pdfUrl}
      target="_blank"
      rel="noopener"
      className="group focus-visible:outline-primary-600 block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      {/*
        กรอบสีเทาอ่อนรอบหน้ากระดาษ ทำให้เอกสารพื้นขาวมีขอบเขตชัดบนพื้นเว็บที่ก็ขาว
        และให้ผลเหมือนดูเอกสารวางบนโต๊ะ ซึ่งเป็นภาษาภาพเดียวกับหน้าดาวน์โหลดของผู้ผลิตเอง
      */}
      <span className="bg-surface-alt border-line block overflow-hidden rounded-md border p-3 transition-shadow duration-(--duration-ui) group-hover:shadow-lift sm:p-4">
        <img
          src={sheet.thumb.src}
          alt=""
          width={sheet.thumb.width}
          height={sheet.thumb.height}
          loading="lazy"
          decoding="async"
          className="shadow-card block h-auto w-full bg-white"
        />
      </span>

      <span className="text-primary-600 mt-3 block text-sm leading-snug font-semibold group-hover:underline">
        {sheet.title}
      </span>

      <span className="text-ink-muted mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {sheet.model && <span className="stat-figure">{sheet.model}</span>}
        <span>
          {t(ui.datasheets.pages).replace('{n}', String(sheet.pages))}
          {' · '}
          {formatSize(sheet.sizeKb, locale)}
        </span>
        {/* เอกสารบางฉบับผู้ผลิตออกมาเป็นภาษาเยอรมันเท่านั้น ต้องบอกก่อนกด ไม่ใช่ให้ไปเจอเอง */}
        {sheet.language === 'de' && <Badge tone="neutral">DE</Badge>}
      </span>

      {/*
        ชื่อของลิงก์ที่ผู้ใช้ screen reader ได้ยินคือข้อความที่มองเห็นอยู่แล้ว
        ต่อท้ายด้วยประโยคนี้เพื่อบอกสองอย่างที่ผู้ใช้สายตาปกติเห็นจากบริบท
        แต่คนที่ฟังไม่รู้ คือกดแล้วได้ไฟล์ PDF และมันเปิดแท็บใหม่
      */}
      <span className="sr-only">{t(ui.datasheets.openPdf)}</span>
    </a>
  )
}

function formatSize(sizeKb: number, locale: string): string {
  if (sizeKb < 1024) return `${sizeKb} KB`
  return `${(sizeKb / 1024).toLocaleString(locale === 'th' ? 'th-TH' : 'en-GB', {
    maximumFractionDigits: 1,
  })} MB`
}
