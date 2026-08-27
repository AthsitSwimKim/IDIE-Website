import { Button, Heading, PendingContent, Section } from '@/components/ui'
import { NewsCard } from '@/components/sections/NewsCard'
import { Seo } from '@/components/layout/Seo'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getNews, ui } from '@/data'

/**
 * News — Phase 4b
 *
 * ข่าวมาจาก API (`/api/news`) ซึ่งดึงจาก MySQL ที่ทีมงานลงเองผ่านหน้า /admin
 * ตอนที่ยังไม่มีข่าวสักชิ้น หน้านี้จะแสดงบล็อก "รอข้อมูลจากบริษัท" เหมือนเดิม —
 * บอกตรง ๆ ว่ายังไม่มีข่าว ดีกว่าปล่อยข้อความ "Comming Soon...." ค้างไว้หลายปี
 * แบบเว็บเดิม และดีกว่าหน้าว่างเปล่าที่ผู้อ่านแยกไม่ออกว่าพังหรือไม่มีข้อมูล
 */
export default function NewsList() {
  const { t } = useLocale()
  const { data: news, loading } = useAsyncData(getNews)

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

        {news?.length === 0 && (
          <PendingContent need={t(ui.news.pendingNeed)}>
            <p className="text-ink-muted text-sm">{t(ui.news.pendingHeading)}</p>
            <div className="mt-4">
              <Button to="/contact" variant="outline" size="sm" withArrow>
                {t(ui.actions.contactInquiry)}
              </Button>
            </div>
          </PendingContent>
        )}
      </Section>
    </>
  )
}
