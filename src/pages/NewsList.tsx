import { useSearchParams } from 'react-router-dom'
import { Button, EmptyState, Heading, Pagination, Section } from '@/components/ui'
import { AlertCircleIcon, NewspaperIcon, RefreshIcon } from '@/components/ui/icons'
import { NewsCard } from '@/components/sections/NewsCard'
import { Seo } from '@/components/layout/Seo'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getNews, ui } from '@/data'

/**
 * News — Phase 4b
 *
 * ข่าวมาจาก API (`/api/news`) ซึ่งดึงจาก MySQL ที่ทีมงานลงเองผ่านหน้า /admin
 *
 * หน้านี้มีสามสถานะที่ไม่มีรายการให้แสดง และต้องแยกจากกันให้ชัด:
 * กำลังโหลด · โหลดไม่สำเร็จ · โหลดสำเร็จแต่ยังไม่มีข่าว
 *
 * เดิมสองอย่างหลังใช้บล็อกเดียวกันที่ขึ้นป้าย "รอข้อมูลจากบริษัท" พร้อมรายการข้อมูล
 * ที่ยังต้องขอจาก IDIE — ข้อความนั้นเขียนไว้ให้ทีมงานอ่านตอนรีวิว ไม่ใช่ให้ลูกค้าอ่าน
 * และจะโผล่ทันทีที่หลังบ้านล่ม ตอนนี้ใช้ `EmptyState` ที่เขียนถึงผู้เข้าชมโดยตรงแทน
 */
/** จุดที่พาสายตากลับมาหลังเปลี่ยนหน้า — บล็อกรายการ ไม่ใช่หัวหน้า */
const RESULTS_ID = 'news-results'

/**
 * จำนวนข่าวต่อหน้า
 *
 * 12 ลงตัวกับตะแกรงทั้งสามขนาด (1 / 2 / 3 คอลัมน์) แถวสุดท้ายจึงไม่มีช่องโหว่
 * ใช้เลขเดียวกับหน้าผลงานเพราะการ์ดสูงพอ ๆ กัน
 */
const PAGE_SIZE = 12

export default function NewsList() {
  const { t } = useLocale()
  const [params, setParams] = useSearchParams()
  const { data: news, loading, error, reload } = useAsyncData(getNews)

  const total = news?.length ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  // บีบเลขหน้าให้อยู่ในช่วงที่มีจริง — ลิงก์เก่าที่ชี้ไปหน้า 5 ตอนข่าวเหลือสองหน้า
  // ต้องเห็นข่าว ไม่ใช่เห็นหน้าว่าง
  const page = Math.min(Math.max(Number(params.get('page')) || 1, 1), totalPages)
  const from = (page - 1) * PAGE_SIZE
  const visible = news?.slice(from, from + PAGE_SIZE)

  /**
   * เปลี่ยนหน้าแล้วพากลับขึ้นไปที่หัวรายการ ไม่ปล่อยให้ค้างอยู่ท้ายหน้าเดิม
   *
   * ไม่ระบุ behavior โดยตั้งใจ ให้ตกไปใช้ `scroll-behavior` ของ CSS ซึ่งสลับเป็น auto
   * ให้เองเมื่อผู้ใช้เปิด prefers-reduced-motion — เหตุผลเดียวกับหน้าสินค้า
   */
  function goToPage(value: number) {
    const next = new URLSearchParams(params)
    if (value > 1) next.set('page', String(value))
    else next.delete('page')
    setParams(next, { replace: true })
    document.getElementById(RESULTS_ID)?.scrollIntoView()
  }

  return (
    <>
      <Seo title={ui.news.title} description={ui.news.lead} />

      <Section tone="alt" spacing="lg">
        <Heading level={1} eyebrow="NEWS">
          {t(ui.news.title)}
        </Heading>
        <p className="text-ink-muted mt-4 max-w-prose">{t(ui.news.lead)}</p>
      </Section>

      <Section>
        {loading && !news && <p className="text-ink-muted text-sm">{t(ui.states.loading)}</p>}

        {news && news.length > 0 && (
          <div id={RESULTS_ID}>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible?.map((article) => (
                <li key={article.slug}>
                  <NewsCard article={article} />
                </li>
              ))}
            </ul>

            {/*
              ข้อความบอกตำแหน่งอยู่ซ้าย ปุ่มเปลี่ยนหน้าอยู่ขวา — วางแบบเดียวกับหน้าสินค้า
              และหน้าผลงาน ทั้งเว็บจึงมีจังหวะเดียวกัน ไม่ต้องเรียนรู้ใหม่ทีละหน้า
            */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
                <p className="text-ink-muted text-sm">
                  {t(ui.news.showingRange)
                    .replace('{from}', String(from + 1))
                    .replace('{to}', String(from + (visible?.length ?? 0)))
                    .replace('{total}', String(total))}
                </p>
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onChange={goToPage}
                  label={t(ui.pagination.label)}
                  previousLabel={t(ui.pagination.previous)}
                  nextLabel={t(ui.pagination.next)}
                  pageLabel={t(ui.pagination.page)}
                  className="ml-auto"
                />
              </div>
            )}
          </div>
        )}

        {/*
          โหลดไม่สำเร็จกับยังไม่มีข่าว เป็นคนละเรื่องและต้องพูดคนละอย่าง —
          การบอกว่า "ยังไม่มีข่าว" ตอน API ล่มคือการบอกข้อมูลที่ผิดกับผู้เข้าชม
        */}
        {error && (
          <EmptyState
            icon={<AlertCircleIcon aria-hidden="true" className="size-12" strokeWidth={1.5} />}
            title={t(ui.states.loadFailedTitle)}
            body={t(ui.states.loadFailedBody)}
          >
            {/*
              เรียก loader ใหม่แทน location.reload() — สิ่งที่ล้มคือคำขอเดียว
              ไม่มีเหตุผลให้ผู้ใช้ต้องโหลดทั้งหน้าใหม่แล้วถูกพากลับไปบนสุด
            */}
            <Button onClick={reload}>
              <RefreshIcon aria-hidden="true" className="size-4 shrink-0" />
              {t(ui.actions.retry)}
            </Button>
          </EmptyState>
        )}

        {!error && news?.length === 0 && (
          <EmptyState
            icon={<NewspaperIcon aria-hidden="true" className="size-12" strokeWidth={1.5} />}
            title={t(ui.news.emptyTitle)}
            body={t(ui.news.emptyBody)}
          >
            <Button to="/" variant="outline">
              {t(ui.actions.backToHome)}
            </Button>
          </EmptyState>
        )}
      </Section>
    </>
  )
}
