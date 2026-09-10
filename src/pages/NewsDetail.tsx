import { useParams } from 'react-router-dom'
import { Badge, Button, Heading, Section } from '@/components/ui'
import { NewsCard } from '@/components/sections/NewsCard'
import { Seo } from '@/components/layout/Seo'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getLatestNews, getNewsBySlug, ui } from '@/data'
import { formatDate } from '@/utils/formatDate'
import { Markdown } from '@/utils/markdown'
import NotFound from '@/pages/NotFound'

/**
 * News Detail — Phase 4b
 *
 * เนื้อข่าวเก็บเป็น Markdown ในฐานข้อมูล และวาดด้วย `<Markdown>` ที่ประกอบเป็น
 * React element โดยตรง **ไม่ผ่าน HTML** — เนื้อหาที่คนกรอกผ่านหน้าแอดมิน
 * จึงไม่มีทางกลายเป็นสคริปต์ที่รันบนหน้าเว็บของบริษัท
 */
export default function NewsDetail() {
  const { slug } = useParams()
  const { t, locale } = useLocale()
  const { data: article, loading } = useAsyncData(() => getNewsBySlug(slug ?? ''), [slug])
  const { data: latest } = useAsyncData(() => getLatestNews(4), [])

  if (loading) return null
  if (!article) return <NotFound />

  // ไม่เอาข่าวที่กำลังอ่านอยู่มาแสดงซ้ำในหัวข้อ "ข่าวอื่นที่น่าสนใจ"
  const others = (latest ?? []).filter((item) => item.slug !== article.slug).slice(0, 3)

  return (
    <>
      <Seo title={article.title} description={article.excerpt} />

      {/*
        หัวข้อ · คำโปรย · ภาพปก · เนื้อข่าว เป็นสิ่งเดียวกันที่ผู้อ่านไล่สายตาลงมารวดเดียว
        จึงบีบระยะระหว่างสามส่วนนี้ให้แคบกว่าระยะมาตรฐานระหว่าง section ของเว็บ
        (ระยะมาตรฐานมีไว้คั่น "คนละเรื่อง" ไม่ใช่คั่นย่อหน้าของเรื่องเดียวกัน)

        เดิมภาพปกถูกดันขึ้นด้วย `-translate-y-8` ซึ่ง**ไม่ลดพื้นที่จริง** — transform
        ไม่กระทบ layout ภาพจึงขยับขึ้นแต่ทิ้งรูโหว่ขนาดเท่าเดิมไว้ข้างล่าง
        กลายเป็นช่องว่าง 96px ทั้งเหนือและใต้ภาพ
      */}
      <Section tone="alt" spacing="lg" spacingBottom="sm">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="brand">{t(ui.newsCategory[article.category])}</Badge>
            <time dateTime={article.publishedAt} className="text-ink-muted text-sm">
              {formatDate(article.publishedAt, locale)}
            </time>
          </div>
          <Heading level={1} className="mt-4">
            {t(article.title)}
          </Heading>
          <p className="text-ink-muted mt-4 text-lg">{t(article.excerpt)}</p>
        </div>
      </Section>

      <Section spacing="none">
        {/*
          จัดกึ่งกลางเฉพาะภาพปก ตามที่เจ้าของงานกำหนด — ข้อความรอบ ๆ ยังชิดซ้ายเหมือนเดิม

          ผลที่ตามมาโดยตั้งใจ: ขอบซ้ายของภาพเยื้องจากขอบซ้ายของหัวข้อและเนื้อข่าว 208px
          ที่จอ 1440 (ภาพเริ่มที่ 328 ส่วนข้อความเริ่มที่ 120) ถ้าวันหลังมีคนเห็นแล้ว
          คิดว่าเป็นบั๊ก — ไม่ใช่ ตรงนี้ตั้งใจไว้แบบนี้
        */}
        <div className="mx-auto max-w-3xl">
          <img
            src={article.cover.src}
            srcSet={article.cover.srcSet}
            alt={t(article.cover.alt)}
            width={article.cover.width}
            height={article.cover.height}
            // ปกข่าวคือภาพที่ใหญ่ที่สุดบนหน้านี้และอยู่บนสุด — โหลดทันทีไม่ lazy
            // เพราะมันคือ LCP element การเลื่อนโหลดจะทำให้ค่านี้แย่ลงตรง ๆ
            decoding="async"
            className="border-line rounded-card bg-surface-alt aspect-[3/2] w-full border object-cover"
          />
        </div>
      </Section>

      <Section spacing="md" spacingTop="sm">
        <div className="max-w-3xl">
          <Markdown source={t(article.body)} />

          <div className="mt-10">
            <Button to="/news" variant="outline" size="sm">
              {t(ui.news.backToList)}
            </Button>
          </div>
        </div>
      </Section>

      {others.length > 0 && (
        <Section tone="alt">
          <Heading level={2}>{t(ui.news.latestHeading)}</Heading>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((item) => (
              <li key={item.slug}>
                <NewsCard article={item} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  )
}
