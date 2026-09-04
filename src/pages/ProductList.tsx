import { useSearchParams } from 'react-router-dom'
import { Button, Heading, Pagination, Section } from '@/components/ui'
import { ProductCard } from '@/components/sections/ProductCard'
import { Seo } from '@/components/layout/Seo'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getBrands, getProductCategories, getProducts, ui } from '@/data'
import { cn } from '@/utils/cn'

/**
 * จุดหมายของการเลื่อนหลังเลือกตัวกรอง
 *
 * ผูกไว้กับ**บล็อกผลลัพธ์** ไม่ใช่หัว `<Section>` เพราะหัว section คือแถวตัวกรอง —
 * เลื่อนไปหยุดตรงนั้นแล้วผู้ใช้ยังต้องเลื่อนต่อเองอีก ทั้งที่เพิ่งกดเลือกไป
 */
const RESULTS_ID = 'product-results'

/**
 * จำนวนสินค้าต่อหน้า
 *
 * ตะแกรงกว้างสุดคือ 4 คอลัมน์ เลข 24 จึงลงตัวพอดีทุกขนาดจอ (12/8/6 แถว)
 * ไม่มีแถวสุดท้ายที่เหลือใบเดียวโดด ๆ
 */
const PAGE_SIZE = 24

/**
 * หน้าสินค้า — รายการสินค้าทั้งหมดพร้อมตัวกรองหมวดและแบรนด์
 *
 * **ข้อมูลทุกอย่างมาจากเอกสารข้อมูลสินค้าของผู้ผลิต** (ดู `scripts/build-products.py`)
 * สินค้าหนึ่งรายการคือเอกสารหนึ่งฉบับ จึงไม่มีรุ่นไหนที่ขึ้นเว็บโดยไม่มีเอกสารรองรับ
 *
 * ตัวกรองทั้งหมด sync กับ URL query param เพราะผู้ใช้ B2B ส่งลิงก์หากันในองค์กร —
 * "ดูตัวนี้สิ" ต้องเปิดแล้วเห็นผลลัพธ์เดียวกัน ไม่ใช่เห็นหน้าเปล่า
 *
 * **ลำดับหน้า: หัวเรื่อง → แบรนด์ → หมวด → รายการ** — แบรนด์เป็นทางเข้าหลัก
 * เพราะลูกค้าอุตสาหกรรมส่วนใหญ่มาด้วยชื่อผู้ผลิตที่สเปกไว้แล้ว ไม่ได้มาด้วยชื่อหมวด
 */
export default function ProductList() {
  const { t } = useLocale()
  const [params, setParams] = useSearchParams()

  const category = params.get('category') ?? undefined
  const brand = params.get('brand') ?? undefined
  const query = params.get('q') ?? ''
  const requestedPage = Number(params.get('page')) || 1

  // ส่งแบรนด์ที่เลือกไปด้วย เพื่อให้ชิปหมวดเหลือเฉพาะหมวดที่แบรนด์นั้นมีของจริง
  const { data: categories } = useAsyncData(() => getProductCategories(brand), [brand])
  const { data: brands } = useAsyncData(getBrands)
  const { data: products } = useAsyncData(
    () => getProducts({ category, brandId: brand, query }),
    [category, brand, query],
  )

  const hasFilter = Boolean(category || brand || query)

  const total = products?.length ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  // **บีบเลขหน้าให้อยู่ในช่วงที่มีจริง** — ผู้ใช้ที่อยู่หน้า 6 แล้วกดกรองแบรนด์
  // จนเหลือของสองหน้า ต้องเห็นของ ไม่ใช่เห็นตะแกรงว่างเปล่าโดยไม่รู้ว่าเกิดอะไรขึ้น
  const page = Math.min(Math.max(requestedPage, 1), totalPages)
  const from = (page - 1) * PAGE_SIZE
  const visible = products?.slice(from, from + PAGE_SIZE)

  /** เปลี่ยนตัวกรองแล้วต้องกลับไปหน้าแรกเสมอ ไม่งั้นผลลัพธ์ชุดใหม่จะเปิดค้างกลางเล่ม */
  function setParam(key: string, value?: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next, { replace: true })
  }

  function goToPage(value: number) {
    setParam('page', value > 1 ? String(value) : undefined)
    document.getElementById(RESULTS_ID)?.scrollIntoView()
  }

  /**
   * กดตัวกรองแล้วพาลงไปที่รายการให้เลย — ไม่ปล่อยให้ผู้ใช้เลื่อนหาเองว่าสิ่งที่เพิ่งกด
   * เปลี่ยนอะไรตรงไหน กดซ้ำที่ตัวเดิมคือยกเลิกตัวกรองนั้น
   *
   * เรียก `scrollIntoView()` **โดยไม่ระบุ behavior โดยตั้งใจ** เพื่อให้ตกไปใช้ค่า
   * `scroll-behavior` ของ CSS ซึ่งสลับเป็น auto ให้เองเมื่อผู้ใช้เปิด
   * prefers-reduced-motion — ถ้าฮาร์ดโค้ด 'smooth' ตรงนี้ JS จะทับค่านั้น
   */
  function toggle(key: string, current: string | undefined, value: string) {
    setParam(key, current === value ? undefined : value)
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

      {/*
        แถบสีน้ำเงินกรมของแบรนด์ผู้ผลิต — แยกเป็น section ของตัวเองเพื่อให้สีกินเต็ม
        ความกว้างจอ ไม่ใช่แค่ในกรอบคอนเทนต์ แถบสีเข้มคั่นตรงนี้ทำให้ "เราเป็นตัวแทนใคร"
        แยกออกจาก "กดเพื่อกรอง" ที่อยู่ถัดลงไปโดยไม่ต้องมีเส้นคั่นหรือหัวข้อซ้ำ

        ลูกค้าอุตสาหกรรมจำผู้ผลิตจากโลโก้ก่อนจำชื่อ การเห็นโลโก้ตั้งแต่ต้นหน้า
        จึงตอบคำถามแรกที่เขามีว่า "ที่นี่ขายของยี่ห้ออะไร" ได้ทันที
      */}
      {/*
        สว่างกว่า tone="dark" ปกติหนึ่งขั้น (navy-800) ตามสีที่ลูกค้าเลือก
        ใส่ ! ทับเพราะ cn ในโปรเจกต์นี้เป็น clsx เปล่า ไม่ได้ merge Tailwind ให้
        ถ้าไม่บังคับ ผลลัพธ์จะขึ้นกับลำดับ class ใน stylesheet ซึ่งเดายาก
      */}
      <Section tone="dark" spacing="md" className="bg-navy-800!">
        <Heading level={3} align="center">
          {t(ui.products.distributedBrands)}
        </Heading>
        <ul className="mx-auto mt-6 grid max-w-4xl grid-cols-3 gap-3 sm:gap-5">
          {brands?.map((item) => (
            <li key={item.id}>
              {/*
                การ์ดพื้นขาวบนแถบน้ำเงิน — โลโก้ทั้งสามรายออกแบบมาสำหรับพื้นสว่าง
                วางลงบนพื้นเข้มตรง ๆ แล้วตัวหนังสือในโลโก้จะจมหายไป

                ช่องไฟบางลงบนจอแคบ ไม่งั้นเหลือที่ให้โลโก้แค่ 43px จนอ่านไม่ออก
              */}
              <div className="bg-surface rounded-card shadow-lift flex aspect-3/2 items-center justify-center p-3 sm:p-4">
                <img
                  src={item.logo.src}
                  srcSet={item.logo.srcSet}
                  alt={t(item.logo.alt)}
                  width={item.logo.width}
                  height={item.logo.height}
                  loading="lazy"
                  decoding="async"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section spacing="md">
        {/* แบรนด์เป็นตัวกรองแรก — ลูกค้าส่วนใหญ่มาด้วยชื่อผู้ผลิตที่สเปกไว้แล้ว */}
        <fieldset className="flex flex-wrap items-center gap-2 border-0 p-0">
          <legend className="text-eyebrow text-ink-muted mb-3 uppercase">
            {t(ui.labels.brand)}
          </legend>
          <Chip active={!brand} onClick={() => toggle('brand', brand, '')}>
            {t(ui.labels.all)}
          </Chip>
          {brands?.map((item) => (
            <Chip key={item.id} active={brand === item.id} onClick={() => toggle('brand', brand, item.id)}>
              {item.name}
            </Chip>
          ))}
        </fieldset>

        <fieldset className="mt-8 flex flex-wrap items-center gap-2 border-0 p-0">
          <legend className="text-eyebrow text-ink-muted mb-3 uppercase">
            {t(ui.labels.category)}
          </legend>
          <Chip active={!category} onClick={() => toggle('category', category, '')}>
            {t(ui.labels.all)}
          </Chip>
          {categories?.map((group) => (
            <Chip
              key={group.category}
              active={category === group.category}
              onClick={() => toggle('category', category, group.category)}
            >
              {t(group.name)}
              <span className="stat-figure text-ink-muted ml-1.5 text-xs">{group.count}</span>
            </Chip>
          ))}
        </fieldset>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <label className="block w-full max-w-sm">
            <span className="text-eyebrow text-ink-muted uppercase">{t(ui.labels.search)}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setParam('q', event.target.value)}
              placeholder={t(ui.products.searchPlaceholder)}
              className="border-line bg-surface rounded-card focus:border-primary-600 mt-2 block h-11 w-full border px-4 text-base outline-none"
            />
          </label>
          {hasFilter && (
            <Button variant="ghost" onClick={() => setParams({}, { replace: true })}>
              {t(ui.actions.clearFilters)}
            </Button>
          )}
        </div>

        <div id={RESULTS_ID} className="scroll-mt-24">
          <p className="text-ink-muted mt-10 text-sm">
            {t(ui.products.resultCount).replace('{count}', String(total))}
          </p>

          {total === 0 ? (
            <p className="text-ink-muted mt-10">{t(ui.states.empty)}</p>
          ) : (
            <>
              <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
                {visible?.map((product) => (
                  <li key={product.slug}>
                    <ProductCard product={product} />
                  </li>
                ))}
              </ul>

              {/*
                ข้อความบอกตำแหน่งอยู่ซ้าย ปุ่มเปลี่ยนหน้าอยู่ขวา — วางแบบเดียวกับ
                หน้ารายการสินค้าของร้านค้าออนไลน์ทั่วไป สายตาจึงรู้ทันทีว่าอะไรคือ
                "ตอนนี้อยู่ตรงไหน" และอะไรคือ "ปุ่มที่กดได้"

                จอแคบจะตกลงมาเรียงบนล่างเอง โดยข้อความอยู่บนปุ่ม เพราะต้องอ่านก่อน
                จะได้รู้ว่าควรกดต่อหรือพอแล้ว
              */}
              {totalPages > 1 && (
                <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-ink-muted text-sm">
                    {t(ui.products.showingRange)
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
            </>
          )}
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
              {t(ui.nav.brands)}
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}

/** ชิปกรอง — ปุ่มจริง ไม่ใช่ลิงก์ เพราะไม่ได้พาไปหน้าอื่น แค่เปลี่ยนสิ่งที่แสดงบนหน้านี้ */
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
        'inline-flex min-h-9 cursor-pointer items-center rounded-full border px-4 text-sm transition-colors duration-(--duration-ui)',
        active
          ? 'border-primary-600 bg-primary-600 text-white'
          : 'border-line bg-surface text-ink-muted hover:border-primary-300 hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}
