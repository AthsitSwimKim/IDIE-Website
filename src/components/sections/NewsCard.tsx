import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui'
import { useLocale } from '@/hooks/useLocale'
import { formatDate } from '@/utils/formatDate'
import { ui } from '@/data'
import type { NewsArticle } from '@/types/content'

/**
 * การ์ดข่าว — ใช้ทั้งหน้า /news และหัวข้อข่าวล่าสุดบนหน้าแรก
 * จึงอยู่ใน components/sections ไม่ใช่ใต้ pages ตามกติกาเดียวกับ ProjectCard
 */
export function NewsCard({ article }: { article: NewsArticle }) {
  const { t, locale } = useLocale()

  return (
    <Link
      to={`/news/${article.slug}`}
      className="group border-line bg-surface rounded-card hover:shadow-lift hover:border-primary-200 flex h-full flex-col overflow-hidden border transition-[box-shadow,border-color] duration-(--duration-ui)"
    >
      <span className="bg-surface-alt block aspect-[3/2] overflow-hidden">
        <img
          src={article.cover.src}
          srcSet={article.cover.srcSet}
          alt={t(article.cover.alt)}
          width={article.cover.width}
          height={article.cover.height}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-(--duration-ui) ease-(--ease-out-expo) group-hover:scale-105 motion-reduce:transform-none"
        />
      </span>

      <span className="flex flex-1 flex-col p-5">
        <span className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">{t(ui.newsCategory[article.category])}</Badge>
          <time dateTime={article.publishedAt} className="text-ink-muted text-xs">
            {formatDate(article.publishedAt, locale)}
          </time>
        </span>

        {/*
          18px ไม่ใช่ 20px — ค่าที่เจ้าของงานกำหนดเฉพาะการ์ดข่าวกับการ์ดผลงาน
          เขียนเป็น text-base ตรง ๆ ไม่ผูกกับ token --text-h3 เพราะนี่ไม่ใช่หัวข้อจริง
          เป็น <span> ในลิงก์ ถ้าผูกกับ token หัวข้อ วันที่แก้สเกลหัวข้อทั้งเว็บ
          ขนาดในตารางข่าว/ผลงานจะขยับตามไปด้วยโดยไม่ตั้งใจ

          ไม่บังคับ leading-snug แบบการ์ดสินค้า — หัวข้อที่นี่เป็นภาษาไทยซึ่งมีสระบน
          กับวรรณยุกต์ซ้อนได้สองชั้น กฎ :lang(th) ใน theme.css ที่ให้ระยะบรรทัด 1.75
          จึงเป็นค่าที่ถูกต้องแล้วสำหรับที่นี่
        */}
        <span className="group-hover:text-primary-600 mt-3 text-base font-semibold">
          {t(article.title)}
        </span>
        {/* 16px ตามที่กำหนด — เดิมไม่ได้ระบุขนาดจึงตกไปใช้ 18px ของเนื้อความทั้งเว็บ */}
        <span className="text-ink-muted mt-2 line-clamp-3 flex-1 text-sm">
          {t(article.excerpt)}
        </span>
      </span>
    </Link>
  )
}
