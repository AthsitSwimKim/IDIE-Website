import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Datasheet } from '@/types/content'
import { ArrowRight, Badge, Button, Heading, Section } from '@/components/ui'
import { ExternalLinkIcon } from '@/components/ui/icons'
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
 *
 * **หมวดพับเก็บไว้ทั้งหมดตอนเปิดหน้า** — กางทุกหมวดพร้อมกันแปลว่าหน้าเดียวมีการ์ด
 * 169 ใบ ผู้ใช้ต้องเลื่อนผ่านหมวดที่ไม่เกี่ยวข้องกว่าจะถึงหมวดที่ต้องการ
 * พอพับไว้ รายชื่อหมวดทั้งหมดอยู่ในหน้าจอเดียว เลือกได้ทันทีว่าจะเปิดอันไหน
 */
export default function BrandDatasheets() {
  const { brandId = '' } = useParams()
  const { t } = useLocale()
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

        {/*
          สองปุ่มนี้เคยเป็น ghost ทั้งคู่ คือตัวหนังสือสีน้ำเงินไม่มีขอบไม่มีพื้น
          วางเรียงกันบนพื้นเทาอ่อน จึงอ่านเหมือนข้อความสองก้อนลอย ๆ มากกว่าปุ่ม
          และแยกไม่ออกว่าอันไหนสำคัญกว่ากัน

          แยกน้ำหนักให้ต่างกัน: ปุ่มย้อนกลับยังเป็น ghost เพราะเป็นทางหนีออกจากหน้า
          ไม่ใช่สิ่งที่อยากให้กด ส่วนศูนย์ดาวน์โหลดของผู้ผลิตใส่ขอบ (outline)
          เพราะเป็นปลายทางที่มีประโยชน์จริงเมื่อหาเอกสารในหน้านี้ไม่เจอ
        */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {/*
            ลูกศรอยู่หน้าข้อความและหมุน 180° ให้ชี้กลับ — ใช้ไอคอนตัวเดียวกับทั้งเว็บ
            ไม่เพิ่มไอคอนใหม่ เพราะ ArrowRight เป็นเส้นตรงสมมาตร หมุนแล้วได้ลูกศรซ้าย
            ที่มีน้ำหนักเส้นเท่าเดิมเป๊ะ
          */}
          <Button to="/brands" variant="ghost">
            <ArrowRight aria-hidden="true" className="size-4 shrink-0 rotate-180" />
            {t(ui.datasheets.backToBrands)}
          </Button>
          {downloadCentre && (
            <Button href={downloadCentre} target="_blank" variant="outline">
              {t(ui.datasheets.downloadCentre)}
              {/*
                ลูกศรเฉียงบอกว่าลิงก์พาออกนอกเว็บและเปิดแท็บใหม่ — ผู้ใช้ควรรู้ก่อนกด
                ไม่ใช่รู้ตอนที่แท็บใหม่เด้งขึ้นมาแล้ว ส่วนคนที่ใช้โปรแกรมอ่านหน้าจอ
                มองไม่เห็นไอคอน จึงต่อท้ายด้วยข้อความ sr-only แทน
              */}
              <ExternalLinkIcon aria-hidden="true" className="size-4 shrink-0" />
              <span className="sr-only">{t(ui.datasheets.opensExternal)}</span>
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

        {/*
          รูปแบบเดียวกับหน้าดาวน์โหลดของ Industronic เอง — แต่ละหมวดเป็นกล่องมีเส้นขอบ
          เรียงต่อกัน เส้นขอบของกล่องที่ติดกันซ้อนเป็นเส้นเดียว หัวข้อสีน้ำเงินเข้ม
          และสว่างขึ้นตอนกาง ลูกศรชี้เฉียงลงเมื่อปิด หมุนเป็นชี้ขวาเมื่อเปิด
        */}
        <div className="mt-10 space-y-[-1px]">
          {visible.map((group) => (
            /*
              ใช้ <details> ของเบราว์เซอร์ ไม่ได้เขียน accordion เอง — ได้การกดด้วย
              คีย์บอร์ด การประกาศสถานะเปิด/ปิดให้โปรแกรมอ่านหน้าจอ และการค้นหาด้วย
              Ctrl+F ที่กางหมวดให้อัตโนมัติ มาครบโดยไม่ต้องดูแล state เอง

              **key เปลี่ยนเมื่อสลับระหว่างมีคำค้นกับไม่มี** เพื่อบังคับให้ details
              สร้างใหม่พร้อมสถานะกางตอนเริ่มค้นหา ไม่งั้นผู้ใช้จะเห็นแถวหมวดที่ปิดอยู่
              แล้วเข้าใจว่าไม่เจออะไรเลย ส่วนระหว่างพิมพ์ต่อ key ไม่เปลี่ยน
              หมวดที่ผู้ใช้ปิดเองจึงยังปิดอยู่
            */
            <details
              key={`${group.category}-${needle ? 'search' : 'browse'}`}
              open={Boolean(needle)}
              /*
                ตั้งชื่อกลุ่มเป็น `group/category` ไม่ใช่ `group` เปล่า

                `group-hover:` ของ Tailwind คอมไพล์เป็น `.group:hover .group-hover\:x`
                ซึ่งจับ**บรรพบุรุษตัวไหนก็ได้**ที่มีคลาส `group` ไม่ใช่ตัวที่ใกล้ที่สุด
                <details> ตัวนี้ครอบตะแกรงการ์ดเอกสารทั้งหมวดอยู่ พอมันมี `group` เปล่า
                การเอาเมาส์ไปแตะการ์ดใบเดียวจึงทำให้การ์ด**ทุกใบในหมวด**ขึ้นเงาและ
                ขีดเส้นใต้พร้อมกัน แถมหัวข้อหมวดด้านบนก็เปลี่ยนสีตามไปด้วย

                พอตั้งชื่อกลุ่ม ทั้งสองชั้นแยกขาดจากกัน — แถวหมวดตอบเฉพาะ /category
                การ์ดตอบเฉพาะ /card
              */
              className="border-line group/category relative border"
            >
              {/*
                **ลูกศรกวาดจากเฉียงเป็นแนวนอนตอนเอาเมาส์ไปแตะ** — ลอกพฤติกรรมจาก
                หน้าดาวน์โหลดของ Industronic ตรง ๆ (ของเขาหมุน -38.5° พร้อมเปลี่ยนสี
                ทั้งลูกศรและตัวหนังสือ ใช้เวลา 0.35 วินาทีด้วยเส้นโค้งชะลอท้าย)

                ทำหน้าที่จริง ไม่ใช่แค่ลูกเล่น — บอกว่าแถวนี้กดได้ ตั้งแต่ก่อนกด
                และปลายลูกศรชี้ไปทางที่เนื้อหาจะกางออกมา

                **transition ต้องระบุ `rotate` ไม่ใช่ `transform`** — Tailwind v4
                คอมไพล์ `rotate-45` เป็นคุณสมบัติ `rotate` ของ CSS ไม่ได้เขียนลง
                `transform` เหมือนเวอร์ชันก่อน ถ้าใส่ transform ลูกศรจะกระโดดทันที
                โดยไม่มีการไล่ ซึ่งดูเหมือนโค้ดพัง มากกว่าดูเป็นของที่ตั้งใจ
              */}
              <summary className="focus-visible:outline-primary-600 flex cursor-pointer list-none items-center gap-3.5 px-4 py-4 focus-visible:outline-2 focus-visible:-outline-offset-2 [&::-webkit-details-marker]:hidden">
                <ArrowRight
                  aria-hidden="true"
                  className="text-primary-800 group-hover/category:text-primary-600 group-open/category:text-primary-600 size-4 shrink-0 rotate-45 transition-[rotate,color] duration-350 ease-(--ease-out-expo) group-hover/category:rotate-0 group-open/category:rotate-0 motion-reduce:transition-none"
                />
                <span className="text-primary-800 group-open/category:text-primary-600 group-hover/category:text-primary-600 text-lg font-semibold transition-colors duration-350 ease-(--ease-out-expo)">
                  {t(group.name)}
                </span>
                <span className="stat-figure text-ink-muted ml-auto text-sm">
                  {group.items.length}
                </span>
              </summary>

              <ul className="grid grid-cols-2 gap-6 px-4 pb-8 sm:grid-cols-3 lg:grid-cols-4">
                {group.items.map((sheet) => (
                  <li key={sheet.id}>
                    <DatasheetCard sheet={sheet} />
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
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

function DatasheetCard({ sheet }: { sheet: Datasheet }) {
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
      className="group/card focus-visible:outline-primary-600 block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      {/*
        กรอบสีเทาอ่อนรอบหน้ากระดาษ ทำให้เอกสารพื้นขาวมีขอบเขตชัดบนพื้นเว็บที่ก็ขาว
        และให้ผลเหมือนดูเอกสารวางบนโต๊ะ ซึ่งเป็นภาษาภาพเดียวกับหน้าดาวน์โหลดของผู้ผลิตเอง
      */}
      <span className="bg-surface-alt border-line group-hover/card:shadow-lift block overflow-hidden rounded-md border p-4 transition-shadow duration-(--duration-ui) sm:p-5">
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

      {/*
        เข้มขึ้นตอนชี้เมาส์ แทนการขีดเส้นใต้ — ชื่อเอกสารเป็นสีน้ำเงินอยู่แล้วตั้งแต่แรก
        จึงบอกอยู่แล้วว่ากดได้ เส้นใต้ที่โผล่มาเพิ่มจึงเป็นสัญญาณซ้ำ ไม่ได้บอกอะไรใหม่
        และในตะแกรงที่มีเอกสารหลายสิบใบ เส้นใต้ทำให้ตัวหนังสือดูเปลี่ยนรูปร่าง
        มากกว่าจะดูเป็นการตอบสนอง (ใช้แนวเดียวกับการ์ดสินค้า)
      */}
      <span className="text-primary-600 group-hover/card:text-primary-800 mt-3 block text-sm leading-snug font-semibold transition-colors duration-(--duration-ui)">
        {sheet.title}
      </span>

      <span className="text-ink-muted mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {sheet.model && <span className="stat-figure">{sheet.model}</span>}
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
