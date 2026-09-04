import { Button, Heading, Reveal, Section } from '@/components/ui'
import { ProductCard } from '@/components/sections/ProductCard'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getFeaturedProducts, ui } from '@/data'

/**
 * อุปกรณ์ที่เราจัดจำหน่าย — Home section
 *
 * แสดงของจริงแปดรุ่นจากคนละหมวด ไม่ใช่แผงภาพหมวดสินค้า — ผู้อ่านที่ยังไม่รู้จัก
 * สายงานนี้ดูจากภาพอุปกรณ์จริงแล้วเข้าใจเร็วกว่าชื่อหมวดอย่าง "อุปกรณ์สัญญาณแสง"
 * (ตัวเลือกหมวดครบทุกหมวดอยู่บนหน้าสินค้าอยู่แล้ว ที่นี่ทำหน้าที่เป็นตัวอย่าง)
 */
export function HomeProducts() {
  const { t } = useLocale()
  const { data: products } = useAsyncData(() => getFeaturedProducts(8))

  if (!products?.length) return null

  return (
    <Section tone="alt">
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

      <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product, index) => (
          <li key={product.slug}>
            <Reveal delay={index * 40}>
              <ProductCard product={product} />
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}
