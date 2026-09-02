import { Button, EmptyState, Heading, Section } from '@/components/ui'
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
 * เดิมสองอย่างหลังใช้บล็อกเดียวกันคือ `PendingContent` ซึ่งขึ้นป้าย
 * "รอข้อมูลจากบริษัท" พร้อมรายการข้อมูลที่ยังต้องขอจาก IDIE — ข้อความนั้นเขียนไว้
 * ให้ทีมงานอ่านตอนรีวิว ไม่ใช่ให้ลูกค้าอ่าน และจะโผล่ทันทีที่หลังบ้านล่ม
 * ตอนนี้ใช้ `EmptyState` ที่เขียนถึงผู้เข้าชมโดยตรงแทน
 */
export default function NewsList() {
  const { t } = useLocale()
  const { data: news, loading, error, reload } = useAsyncData(getNews)

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
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((article) => (
              <li key={article.slug}>
                <NewsCard article={article} />
              </li>
            ))}
          </ul>
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
