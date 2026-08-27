import { Link } from 'react-router-dom'
import { Button, Heading, Reveal, Section } from '@/components/ui'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getFeaturedProducts, productAreas, ui } from '@/data'
import { ProductCard } from '@/components/sections/ProductCard'

/**
 * Products — Home section 6
 *
 * แสดงสินค้าเด่นจริง 8 รุ่น พร้อมแถบ area filter ด้านบน
 * เพราะ "ใช้ในพื้นที่ไหน" คือคำถามแรกที่ฝ่ายวิศวกรรมโรงงานปิโตรเคมีถาม —
 * การโชว์แกนนี้ตั้งแต่หน้าแรกบอกทันทีว่าเว็บนี้เข้าใจงานของเขา
 */
export function HomeProducts() {
  const { t } = useLocale()
  const { data: products } = useAsyncData(() => getFeaturedProducts(8))

  if (!products?.length) return null

  return (
    <Section>
      {/* items-start กัน flex-col ยืดปุ่มให้เต็มความกว้างบนจอแคบ */}
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <Heading level={2} eyebrow="PRODUCTS">
            {t(ui.home.productsTitle)}
          </Heading>
          <p className="text-ink-muted mt-4">{t(ui.home.productsLead)}</p>
        </div>
        <Button to="/products" variant="outline" withArrow className="shrink-0">
          {t(ui.nav.products)}
        </Button>
      </div>

      <ul className="mt-8 flex flex-wrap gap-2">
        {productAreas.map((area) => (
          <li key={area.slug}>
            <Link
              to={`/products?area=${area.slug}`}
              className="border-line text-ink-muted hover:border-primary-200 hover:text-ink rounded-pill inline-flex min-h-11 items-center border px-4 text-sm font-medium transition-colors duration-(--duration-ui)"
            >
              {t(area.name)}
            </Link>
          </li>
        ))}
      </ul>

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product, index) => (
          <li key={product.slug}>
            <Reveal delay={index * 45}>
              <ProductCard product={product} />
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}
