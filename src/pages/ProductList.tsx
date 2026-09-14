import { useLayoutEffect } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
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
 * จุดหมายของลิงก์ที่มาจากหน้าอื่น — แถวตัวกรอง ไม่ใช่บล็อกผลลัพธ์
 *
 * ต่างจาก RESULTS_ID โดยตั้งใจ: คนที่กดตัวกรองอยู่บนหน้านี้แล้วรู้ว่าเพิ่งกดอะไรไป
 * จึงพาลงไปดูผลลัพธ์ได้เลย ส่วนคนที่เพิ่งมาจากหน้าอื่นต้องเห็นว่าตอนนี้กรองอะไรอยู่
 * และเปลี่ยนได้ตรงไหน ถ้าโยนไปที่รายการเลยจะเหมือนหน้าสินค้ามีของแค่ยี่ห้อเดียว
 */
const FILTERS_ID = 'product-filters'

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
  const { hash } = useLocation()

  const category = params.get('category') ?? undefined
  const brand = params.get('brand') ?? undefined
  const query = params.get('q') ?? ''
  const requestedPage = Number(params.get('page')) || 1

  // ส่งแบรนด์ที่เลือกไปด้วย เพื่อให้ชิปหมวดเหลือเฉพาะหมวดที่แบรนด์นั้นมีของจริง
  const { data: categories } = useAsyncData(() => getProductCategories(brand), [brand])
  const { data: brands } = useAsyncData(getBrands)
  const { data: products, loading, error, reload } = useAsyncData(
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

  /**
   * เข้ามาพร้อม hash (เช่นกดโลโก้แบรนด์จากหน้าแรก) ให้ไปโผล่ที่จุดนั้นเลย
   *
   * เบราว์เซอร์กระโดดไป anchor เองไม่ได้ในกรณีนี้ — ตอนเปลี่ยนเส้นทาง ชิปหมวดกับรายการ
   * สินค้ายังโหลดไม่เสร็จ ความสูงของหน้าจึงยังไม่นิ่ง ถ้าเลื่อนตอนนั้นจะไปหยุดผิดที่
   * ต้องรอ `products` มาถึงก่อนแล้วค่อยเลื่อน (ScrollToTop ปล่อยผ่านให้แล้วเมื่อมี hash)
   */
  useLayoutEffect(() => {
    if (!hash || !products) return

    /*
      `behavior: 'instant'` และ `useLayoutEffect` — สองอย่างนี้ทำให้ผู้ใช้ไม่เห็นการเลื่อน

      ค่าเริ่มต้นของเว็บคือ `scroll-behavior: smooth` ซึ่งดีตอนกดตัวกรองในหน้าเดียวกัน
      (เห็นว่าอะไรขยับไปไหน) แต่ตอนเพิ่งข้ามมาจากหน้าอื่นมันกลายเป็นการไถหน้าจอให้ดู
      ทั้งที่ผู้ใช้ยังไม่ทันอ่านอะไรเลย ที่นี่จึงกระโดดทันที

      และทำใน layout effect ไม่ใช่ effect ธรรมดา — จะได้เลื่อนเสร็จก่อนเบราว์เซอร์วาด
      เฟรมแรก ผู้ใช้เห็นหน้าที่อยู่ตำแหน่งถูกต้องตั้งแต่แรก ไม่ใช่เห็นหัวหน้าแวบหนึ่ง
      แล้วค่อยกระตุกลงมา
    */
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'instant' })
  }, [hash, products])

  /** เปลี่ยนตัวกรองแล้วต้องกลับไปหน้าแรกเสมอ ไม่งั้นผลลัพธ์ชุดใหม่จะเปิดค้างกลางเล่ม */
  function setParam(key: string, value?: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    if (key === 'brand') next.delete('category')
    setParams(next, { replace: true })
  }

  function goToPage(value: number) {
    setParam('page', value > 1 ? String(value) : undefined)
    document.getElementById(RESULTS_ID)?.scrollIntoView()
  }

  /** Keep the controls in place while selecting; only pagination scrolls to results. */
  function selectBrand(value?: string) {
    if (brand === value) return
    setParam('brand', value)
  }

  return (
    <>
      <Seo title={ui.products.title} description={ui.products.lead} />

      <Section tone="alt" spacing="sm" className="page-intro">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-12">
          <Heading level={1} eyebrow="PRODUCTS" className="shrink-0">
            {t(ui.products.title)}
          </Heading>
          <p className="text-ink-muted max-w-2xl">{t(ui.products.lead)}</p>
        </div>
      </Section>

      <Section tone="dark" spacing="none" className="py-5">
        <fieldset id={FILTERS_ID} className="min-w-0 border-0 p-0">
          <legend className="mb-3 text-sm font-medium text-white/80">
            {t(ui.products.distributedBrands)}
          </legend>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <button
              type="button"
              aria-pressed={!brand}
              onClick={() => selectBrand()}
              className={cn(
                'min-h-20 cursor-pointer rounded-card border px-4 py-3 text-left transition-colors',
                !brand
                  ? 'border-accent-glow bg-white text-navy-900 ring-2 ring-accent-glow'
                  : 'border-white/30 text-white hover:bg-white/10',
              )}
            >
              <span className="block text-sm font-semibold">{t(ui.products.allBrands)}</span>
            </button>
            {brands?.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-label={item.name}
                aria-pressed={brand === item.id}
                onClick={() => selectBrand(item.id)}
                className={cn(
                  'flex min-h-20 cursor-pointer items-center justify-center gap-3 rounded-card border bg-white px-3 py-3 transition-colors sm:justify-start sm:px-4',
                  brand === item.id
                    ? 'border-accent-glow ring-2 ring-accent-glow'
                    : 'border-white/30 hover:border-accent-glow',
                )}
              >
                <img
                  src={item.logo.src}
                  srcSet={item.logo.srcSet}
                  alt=""
                  width={item.logo.width}
                  height={item.logo.height}
                  decoding="async"
                  className="h-12 w-24 shrink-0 object-contain"
                />
                <span className="hidden min-w-0 text-left sm:block">
                  <span className="block text-sm font-semibold text-navy-900">
                    {item.id === 'fhf' ? 'FHF' : item.name}
                  </span>
                  <span className="block text-xs text-ink-muted">{item.country}</span>
                </span>
              </button>
            ))}
          </div>
        </fieldset>
      </Section>

      <Section spacing="sm">
        <div className="grid gap-4 rounded-card border border-line bg-surface-alt p-4 sm:grid-cols-2 sm:p-5">
          <label className="block min-w-0">
            <span className="text-sm font-medium">{t(ui.labels.search)}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setParam('q', event.target.value)}
              placeholder={t(ui.products.searchPlaceholder)}
              className="border-line bg-surface focus:border-primary-600 focus:ring-primary-100 mt-2 block h-12 w-full rounded border px-4 text-sm outline-none focus:ring-3"
            />
          </label>
          <label className="block min-w-0">
            <span className="text-sm font-medium">{t(ui.labels.category)}</span>
            <select
              value={category ?? ''}
              onChange={(event) => setParam('category', event.target.value || undefined)}
              className="border-line bg-surface focus:border-primary-600 focus:ring-primary-100 mt-2 block h-12 w-full min-w-0 rounded border px-3 text-sm outline-none focus:ring-3"
            >
              <option value="">{t(ui.products.allCategories)}</option>
              {categories?.map((group) => {
                const brandNames = group.brandIds.map((id) => {
                  const item = brands?.find((entry) => entry.id === id)
                  return id === 'fhf' ? 'FHF' : (item?.name ?? id)
                }).join(', ')
                return (
                  <option key={group.category} value={group.category}>
                    {t(group.name)}{!brand && brandNames ? ` — ${brandNames}` : ''} ({group.count})
                  </option>
                )
              })}
            </select>
          </label>
        </div>

        <div id={RESULTS_ID} aria-busy={loading}>
          <div className="mt-6 flex min-h-11 flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <output className="text-sm font-medium">
              {loading
                ? t(ui.states.loading)
                : t(ui.products.resultCount).replace('{count}', String(total))}
            </output>
            {hasFilter && (
              <Button variant="ghost" size="sm" onClick={() => setParams({}, { replace: true })}>
                {t(ui.actions.clearFilters)}
              </Button>
            )}
          </div>

          {error ? (
            <div className="mt-8">
              <p>{t(ui.states.loadFailedBody)}</p>
              <Button className="mt-4" onClick={reload}>{t(ui.actions.retry)}</Button>
            </div>
          ) : loading && !products ? (
            // สูงเท่าจอระหว่างรอ chunk ข้อมูลสินค้า (โหลดแยกเพราะใหญ่) — ไม่งั้นบล็อก
            // "ขั้นตอนถัดไป" กับ footer ขึ้นมาอยู่ในจอก่อน แล้วถูกตารางสินค้าดันลงเมื่อข้อมูลมา
            <div className="min-h-dvh">
              <p className="text-ink-muted mt-8">{t(ui.states.loading)}</p>
            </div>
          ) : total === 0 ? (
            <p className="text-ink-muted mt-10">{t(ui.states.empty)}</p>
          ) : (
            <>
              <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
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
