import { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { ProductImage } from '@/types/content'
import { Badge, Button, Heading, ImageLightbox, Section } from '@/components/ui'
import { DocumentIcon } from '@/components/ui/icons'
import { ProductCard } from '@/components/sections/ProductCard'
import { Seo } from '@/components/layout/Seo'
import NotFound from '@/pages/NotFound'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import {
  datasheetCategories,
  getBrandById,
  getProductBySlug,
  getRelatedProducts,
  PRODUCT_ATTRIBUTES,
  ui,
} from '@/data'
import { cn } from '@/utils/cn'

/**
 * หน้ารายละเอียดสินค้า
 *
 * **หน้านี้ไม่มีสเปกเป็นตาราง โดยตั้งใจ** — ค่าทางเทคนิคทั้งหมดอยู่ในเอกสารของผู้ผลิต
 * ซึ่งเปิดอ่านได้จากปุ่มบนหน้านี้ การพิมพ์ค่าซ้ำลงเว็บแปลว่าต้องรับผิดชอบว่ามันตรงกับ
 * เอกสารตลอดไป ทั้งที่ผู้ผลิตออกฉบับใหม่โดยไม่บอกเรา — สำหรับอุปกรณ์พื้นที่อันตราย
 * ค่าที่ผิดแม้ตัวเดียว (IP, temperature class, gas group) มีผลกับการตัดสินใจซื้อจริง
 *
 * สิ่งที่หน้านี้ให้แทนคือ **ภาพทุกภาพจากเอกสาร** ทั้งภาพถ่ายและภาพแบบบอกขนาด
 * ซึ่งเป็นสิ่งที่คนเปิดดูก่อนตัดสินใจว่าจะโหลดไฟล์เต็มหรือไม่
 */
export default function ProductDetail() {
  const { slug } = useParams()
  const { t } = useLocale()
  const [zoomed, setZoomed] = useState<ProductImage | null>(null)
  const [active, setActive] = useState(0)

  const { data: product, loading } = useAsyncData(() => getProductBySlug(slug ?? ''), [slug])
  const { data: brand } = useAsyncData(
    () => (product ? getBrandById(product.brandId) : Promise.resolve(null)),
    [product?.brandId],
  )
  const { data: related } = useAsyncData(
    () => (product ? getRelatedProducts(product) : Promise.resolve([])),
    [product?.slug],
  )

  if (loading) return null
  if (!product) return <NotFound />

  const category = datasheetCategories[product.category]
  const hero = product.gallery[Math.min(active, product.gallery.length - 1)]

  return (
    <>
      <Seo
        title={{ th: product.name, en: product.name }}
        description={{
          th: `${product.name}${product.model ? ` (${product.model})` : ''} — ${brand?.name ?? ''} จัดจำหน่ายโดย IDIE`,
          en: `${product.name}${product.model ? ` (${product.model})` : ''} — ${brand?.name ?? ''}, supplied by IDIE.`,
        }}
      />

      <Section tone="alt" spacing="lg">
        <Heading level={1} eyebrow={brand?.name}>
          {product.name}
        </Heading>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {product.model && (
            <span className="stat-figure text-ink-muted text-sm">{product.model}</span>
          )}
          {category && <Badge tone="brand">{t(category)}</Badge>}
          {/*
            ป้ายคุณสมบัติจากเว็บผู้ผลิต — ค่าที่ยังไม่มีคำแปลจะถูกข้าม ไม่แสดงรหัสดิบ
            (ดูเหตุผลที่ PRODUCT_ATTRIBUTES ใน src/data/products.ts)
          */}
          {product.attributes?.map((key) =>
            PRODUCT_ATTRIBUTES[key] ? (
              <Badge key={key}>{t(PRODUCT_ATTRIBUTES[key])}</Badge>
            ) : null,
          )}
        </div>
        <div className="mt-8">
          <Button to="/products" variant="ghost">
            {t(ui.productDetail.backToProducts)}
          </Button>
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[3fr_2fr] lg:gap-16">
          <div>
            {hero ? (
              <>
                {/*
                  กดที่ภาพเพื่อดูขนาดเต็ม — ภาพแบบบอกขนาดอ่านตัวเลขไม่ออกที่ขนาดบนหน้า
                  ใช้ป๊อปอัปตัวเดียวกับหนังสือแต่งตั้งในหน้าเกี่ยวกับเราและผังระบบหน้าบริการ
                */}
                <button
                  type="button"
                  onClick={() => setZoomed(hero)}
                  aria-label={t(ui.productDetail.viewFull).replace('{name}', product.name)}
                  className="border-line rounded-card block w-full cursor-pointer overflow-hidden border bg-white p-6"
                >
                  <img
                    src={hero.src}
                    alt=""
                    width={hero.width}
                    height={hero.height}
                    decoding="async"
                    className="mx-auto block max-h-[420px] w-auto max-w-full object-contain"
                  />
                </button>

                {product.gallery.length > 1 && (
                  <ul className="mt-4 flex flex-wrap gap-3">
                    {product.gallery.map((image, index) => (
                      <li key={image.src}>
                        <button
                          type="button"
                          onClick={() => setActive(index)}
                          aria-current={index === active}
                          /* ปุ่มมีแต่ภาพ จึงต้องตั้งชื่อเอง — บอกลำดับเพื่อให้แยกออกจากกันได้
                             และบอกชนิดเพราะภาพถ่ายกับภาพแบบให้ข้อมูลคนละอย่าง */
                          aria-label={`${t(
                            image.kind === 'drawing'
                              ? ui.productDetail.thumbDrawing
                              : ui.productDetail.thumbPhoto,
                          ).replace('{n}', String(index + 1))}`}
                          className={cn(
                            'border-line rounded-md border bg-white p-1.5 transition-colors duration-(--duration-ui)',
                            index === active ? 'border-primary-600' : 'hover:border-primary-300',
                          )}
                        >
                          <img
                            src={image.src}
                            alt=""
                            width={image.width}
                            height={image.height}
                            loading="lazy"
                            decoding="async"
                            className="block size-16 object-contain"
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <p className="text-ink-muted mt-4 text-sm">
                  {t(
                    hero.kind === 'drawing'
                      ? ui.productDetail.drawingNote
                      : ui.productDetail.photoNote,
                  )}
                </p>
              </>
            ) : (
              <p className="text-ink-muted">{t(ui.products.noImage)}</p>
            )}
          </div>

          <div>
            {/*
              คุณสมบัติเป็นถ้อยคำของผู้ผลิตแบบไม่แก้ไข — สินค้าที่ดึงจากเอกสาร PDF
              (FHF/MEDC) ยังไม่มีส่วนนี้ หัวข้อจึงหายไปทั้งก้อนแทนที่จะขึ้นหัวข้อเปล่า
            */}
            {product.features && product.features.length > 0 && (
              <div className="mb-10">
                <Heading level={2}>{t(ui.productDetail.featuresHeading)}</Heading>
                <ul className="mt-5 space-y-2.5">
                  {product.features.map((feature) => (
                    <li key={feature} className="text-ink-muted flex gap-3 text-sm leading-relaxed">
                      <span
                        aria-hidden="true"
                        className="bg-primary-600 mt-2 size-1.5 shrink-0 rounded-full"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Heading level={2}>{t(ui.productDetail.documentHeading)}</Heading>
            <p className="text-ink-muted mt-4">{t(ui.productDetail.documentLead)}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href={product.datasheetUrl} target="_blank">
                <DocumentIcon aria-hidden="true" className="size-4 shrink-0" />
                {t(ui.datasheets.title)}
              </Button>
              <Button to={`/contact?product=${product.slug}`} variant="outline">
                {t(ui.actions.contactInquiry)}
              </Button>
            </div>

            <dl className="border-line mt-9 divide-y border-t border-b">
              <Row label={t(ui.labels.brand)} value={brand?.name} />
              {product.model && <Row label={t(ui.productDetail.modelLabel)} value={product.model} />}
              {category && <Row label={t(ui.labels.category)} value={t(category)} />}
            </dl>
          </div>
        </div>
      </Section>

      {related && related.length > 0 && (
        <Section tone="alt">
          <Heading level={2}>{t(ui.productDetail.relatedHeading)}</Heading>
          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((item) => (
              <li key={item.slug}>
                <ProductCard product={item} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <ImageLightbox
        image={
          zoomed
            ? {
                src: zoomed.src,
                width: zoomed.width,
                height: zoomed.height,
                alt: { th: product.name, en: product.name },
              }
            : null
        }
        onClose={() => setZoomed(null)}
      />
    </>
  )
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="flex items-baseline gap-6 py-4">
      <dt className="text-ink-muted w-32 shrink-0 text-sm">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
