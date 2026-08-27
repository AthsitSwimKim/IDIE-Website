import { useSearchParams } from 'react-router-dom'
import { Button, Heading, Section } from '@/components/ui'
import { ProductCard } from '@/components/sections/ProductCard'
import { Seo } from '@/components/layout/Seo'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getBrands, getProductCategories, getProducts, productAreas, ui } from '@/data'
import type { ProductArea } from '@/types/content'
import { cn } from '@/utils/cn'

/**
 * จุดหมายของการเลื่อนหลังเลือกแบรนด์
 *
 * ผูกไว้กับ**บล็อกผลลัพธ์** (บรรทัด "พบ N รายการ" + ตะแกรงการ์ด) ไม่ใช่หัว `<Section>`
 * เพราะหัว section คือแถวตัวกรอง — เลื่อนไปหยุดตรงนั้นแล้วผู้ใช้ยังต้องเลื่อนต่อเองอีก
 * ทั้งที่เพิ่งกดเลือกแบรนด์ไป ซึ่งเสียจุดประสงค์ของการเลื่อนให้ทั้งหมด
 */
const RESULTS_ID = 'product-results'

/**
 * Products — Phase 4
 *
 * ตัวกรองทั้งหมด sync กับ URL query param เพราะผู้ใช้ B2B ส่งลิงก์หากันในองค์กร —
 * "ดูตัวนี้สิ" ต้องเปิดแล้วเห็นผลลัพธ์เดียวกัน ไม่ใช่เห็นหน้าเปล่า
 *
 * สินค้า 103 รุ่นเป็นข้อมูลจริงแล้ว filter ทำงานครบทุกแกน (หมวด · แบรนด์ · พื้นที่ใช้งาน · ค้นหา)
 *
 * **ลำดับหน้า: หัวเรื่อง → เลือกแบรนด์ → รายการสินค้า** — แบรนด์เป็นทางเข้าหลัก
 * เพราะลูกค้าอุตสาหกรรมส่วนใหญ่มาด้วยชื่อผู้ผลิตที่สเปกไว้แล้ว ไม่ได้มาด้วยชื่อหมวด
 *
 * เดิมมีบล็อก "เลือกดูตามหมวดสินค้า" ท้ายหน้าด้วย ถอดออกแล้ว — เป็นแผงภาพ
 * placeholder หกช่องที่ยังไม่มีภาพจริงสักช่อง กินพื้นที่เกือบเต็มจอเพื่อทำสิ่งที่
 * ชิปกรองหมวดเหนือรายการสินค้าทำอยู่แล้ว การกรองตามหมวดยังอยู่ครบในชิปนั้น
 * (ลิงก์ `/products?category=` จากหน้า Service Detail จึงยังทำงานเหมือนเดิม)
 */
export default function ProductList() {
  const { t } = useLocale()
  const [params, setParams] = useSearchParams()

  const area = params.get('area') ?? undefined
  const category = params.get('category') ?? undefined
  const brand = params.get('brand') ?? undefined
  const query = params.get('q') ?? ''

  const { data: categories } = useAsyncData(getProductCategories)
  const { data: brands } = useAsyncData(getBrands)
  const { data: products } = useAsyncData(
    () => getProducts({ categorySlug: category, brandId: brand, area: area as ProductArea, query }),
    [area, category, brand, query],
  )

  const hasFilter = Boolean(area || category || brand || query)

  function setParam(key: string, value?: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  /**
   * กดโลโก้แบรนด์แล้วพาลงไปที่รายการสินค้าให้เลย — ไม่ปล่อยให้ผู้ใช้เลื่อนหาเองว่า
   * สิ่งที่เพิ่งกดไปเปลี่ยนอะไรตรงไหน กดซ้ำที่แบรนด์เดิมคือยกเลิกตัวกรอง
   *
   * เรียก `scrollIntoView()` **โดยไม่ระบุ behavior โดยตั้งใจ** เพื่อให้ตกไปใช้ค่า
   * `scroll-behavior` ของ CSS ซึ่ง `theme.css` ตั้ง smooth ไว้ และสลับเป็น auto
   * ให้เองเมื่อผู้ใช้เปิด prefers-reduced-motion — ถ้าฮาร์ดโค้ด `'smooth'` ตรงนี้
   * JS จะทับค่านั้น แล้วหน้าจะเลื่อนลื่นทั้งที่ผู้ใช้สั่งปิด animation ไว้
   *
   * ระยะเผื่อ header ที่ sticky ไม่ต้องคำนวณเอง — `scroll-padding-top: 6rem`
   * ใน `theme.css` ครอบให้แล้ว
   */
  function selectBrand(id: string) {
    setParam('brand', brand === id ? undefined : id)
    document.getElementById(RESULTS_ID)?.scrollIntoView()
  }

  return (
    <>
      <Seo title={ui.products.title} description={ui.products.lead} />

      <Section tone="alt" spacing="lg">
        <Heading level={1} eyebrow="PRODUCTS">
          {t(ui.products.title)}
        </Heading>
        <p className="text-ink-muted mt-4 max-w-prose">{t(ui.products.lead)}</p>
      </Section>

      <Section spacing="md">
        <Heading level={2}>{t(ui.products.browseByBrand)}</Heading>
        <ul className="mt-8 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
          {brands?.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => selectBrand(item.id)}
                aria-pressed={brand === item.id}
                className={cn(
                  'group rounded-card flex aspect-3/2 w-full items-center justify-center border p-5',
                  'transition-colors duration-(--duration-ui)',
                  brand === item.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-line bg-surface hover:border-primary-200',
                )}
              >
                <img
                  src={item.logo.src}
                  srcSet={item.logo.srcSet}
                  alt={t(item.logo.alt)}
                  width={item.logo.width}
                  height={item.logo.height}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain transition-transform duration-(--duration-ui) group-hover:scale-105 motion-reduce:transform-none"
                />
              </button>
            </li>
          ))}
        </ul>
      </Section>

      <Section className="border-line border-t">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="space-y-5">
            <FilterRow label={t(ui.labels.area)}>
              <Chip active={!area} onClick={() => setParam('area')}>
                {t(ui.labels.all)}
              </Chip>
              {productAreas.map((item) => (
                <Chip
                  key={item.slug}
                  active={area === item.slug}
                  onClick={() => setParam('area', item.slug)}
                >
                  {t(item.name)}
                </Chip>
              ))}
            </FilterRow>

            <FilterRow label={t(ui.labels.category)}>
              <Chip active={!category} onClick={() => setParam('category')}>
                {t(ui.labels.all)}
              </Chip>
              {categories?.map((item) => (
                <Chip
                  key={item.slug}
                  active={category === item.slug}
                  onClick={() => setParam('category', item.slug)}
                >
                  {t(item.name)}
                </Chip>
              ))}
            </FilterRow>

            <FilterRow label={t(ui.labels.brand)}>
              <Chip active={!brand} onClick={() => setParam('brand')}>
                {t(ui.labels.all)}
              </Chip>
              {brands?.map((item) => (
                <Chip
                  key={item.id}
                  active={brand === item.id}
                  onClick={() => setParam('brand', item.id)}
                >
                  {item.name}
                </Chip>
              ))}
            </FilterRow>
          </div>

          <div className="lg:w-72">
            <label htmlFor="product-search" className="text-eyebrow text-ink-muted uppercase">
              {t(ui.labels.search)}
            </label>
            <input
              id="product-search"
              type="search"
              value={query}
              onChange={(event) => setParam('q', event.target.value)}
              placeholder={t(ui.products.searchPlaceholder)}
              className="border-line focus:border-primary-400 mt-2 min-h-11 w-full rounded border px-3 text-sm outline-none"
            />
          </div>
        </div>

        <div id={RESULTS_ID}>
          {hasFilter && (
            <p className="text-ink-muted mt-6 flex flex-wrap items-center gap-3 text-sm">
              {t(ui.products.resultCount).replace('{count}', String(products?.length ?? 0))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setParams(new URLSearchParams(), { replace: true })}
              >
                {t(ui.actions.clearFilters)}
              </Button>
            </p>
          )}

          {products && products.length === 0 ? (
            <div className="border-line rounded-card mt-8 border border-dashed p-10 text-center">
              <p className="font-medium">{t(ui.states.empty)}</p>
              <div className="mt-5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setParams(new URLSearchParams(), { replace: true })}
                >
                  {t(ui.actions.clearFilters)}
                </Button>
              </div>
            </div>
          ) : (
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products?.map((product) => (
                <li key={product.slug}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>
    </>
  )
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="text-eyebrow text-ink-muted mb-2 uppercase">{label}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-pill min-h-11 border px-4 text-sm font-medium',
        'transition-colors duration-(--duration-ui)',
        active
          ? 'border-primary-600 bg-primary-600 text-white'
          : 'border-line text-ink-muted hover:border-primary-200 hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}
