import { useParams } from 'react-router-dom'
import { Badge, Button, Heading, ImagePlaceholder, Section } from '@/components/ui'
import { ProductCard } from '@/components/sections/ProductCard'
import { Seo } from '@/components/layout/Seo'
import NotFound from '@/pages/NotFound'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import {
  getBrandById,
  getProductBySlug,
  getProductCategories,
  getRelatedProducts,
  productAreas,
  ui,
} from '@/data'

/**
 * Product Detail — Phase 4
 *
 * โครงหน้าเรียงตามลำดับที่ฝ่ายวิศวกรรม/จัดซื้อตัดสินใจจริง:
 * เห็นของ → รหัสรุ่นและแบรนด์ → **ผ่านมาตรฐานอะไรและใช้ในพื้นที่ไหนได้** → ค่าทางเทคนิค → ขอราคา
 *
 * certification กับ area ถูกยกขึ้นมาไว้เหนือ spec table เพราะถ้าสองอย่างนี้ไม่ผ่าน
 * ค่าอื่นก็ไม่ต้องอ่านต่อ — เป็นตัวคัดออกก่อนอย่างอื่นในงานพื้นที่อันตราย
 *
 * 3D viewer จะมาสวมทับกล่องภาพใน Phase 5 โดย gallery ปัจจุบันยังอยู่เป็น fallback
 */
export default function ProductDetail() {
  const { slug } = useParams()
  const { t } = useLocale()

  const { data: product, loading } = useAsyncData(() => getProductBySlug(slug ?? ''), [slug])
  const { data: categories } = useAsyncData(getProductCategories)
  const { data: brand } = useAsyncData(
    () => (product ? getBrandById(product.brandId) : Promise.resolve(null)),
    [product?.brandId],
  )
  const { data: related } = useAsyncData(
    () => (product ? getRelatedProducts(product, 4) : Promise.resolve([])),
    [product?.slug],
  )

  if (loading) return null
  if (!product) return <NotFound />

  const category = categories?.find((c) => c.slug === product.categorySlug)
  const image = product.gallery[0]
  const areas = productAreas.filter((a) => product.area.includes(a.slug))

  return (
    <>
      <Seo title={product.name} description={product.shortDescription} />

      <Section tone="alt" spacing="lg">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="bg-surface border-line rounded-card flex aspect-square items-center justify-center border p-10">
            {image ? (
              <img
                src={image.src}
                srcSet={image.srcSet}
                alt={t(image.alt)}
                width={image.width}
                height={image.height}
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-contain"
              />
            ) : (
              <ImagePlaceholder
                aspect="aspect-square"
                className="w-full"
                label={`${t(product.name)} (${product.model})`}
                size="1200 × 1200"
              />
            )}
          </div>

          <div>
            <p className="text-eyebrow text-primary-600 flex flex-wrap items-center gap-2 uppercase">
              {brand?.name}
              {category && <span className="text-ink-muted">· {t(category.name)}</span>}
            </p>

            <h1 className="text-h1 mt-4 font-bold text-balance">{t(product.name)}</h1>
            <p className="stat-figure text-ink-muted mt-2 text-lg font-semibold">{product.model}</p>
            <p className="text-ink-muted mt-5 max-w-prose">{t(product.shortDescription)}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button to={`/contact?product=${product.slug}`} withArrow>
                {t(ui.actions.contactInquiry)}
              </Button>
              <Button to="/products" variant="ghost">
                {t(ui.productDetail.backToProducts)}
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
          <div>
            <Heading level={2}>{t(ui.productDetail.certsHeading)}</Heading>
            {product.certifications?.length ? (
              <ul className="mt-5 flex flex-wrap gap-2">
                {product.certifications.map((cert) => (
                  <li key={cert}>
                    <Badge tone="brand">{cert}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-muted mt-5 text-sm">{t(ui.productDetail.noDatasheet)}</p>
            )}

            <h3 className="text-eyebrow text-ink-muted mt-8 uppercase">
              {t(ui.productDetail.areaHeading)}
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {areas.map((area) => (
                <li key={area.slug}>
                  <Badge>{t(area.name)}</Badge>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Heading level={2}>{t(ui.productDetail.specsHeading)}</Heading>
            {product.specs.length > 0 ? (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody className="border-line divide-y border-t border-b">
                    {product.specs.map((row) => (
                      <tr key={row.label.en}>
                        <th scope="row" className="text-ink-muted w-2/5 py-3 pr-4 text-left font-normal">
                          {t(row.label)}
                        </th>
                        <td className="py-3 font-medium">{t(row.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-ink-muted mt-5 text-sm">{t(ui.productDetail.noDatasheet)}</p>
            )}
          </div>
        </div>
      </Section>

      {related && related.length > 0 && (
        <Section tone="alt">
          <Heading level={2}>{t(ui.productDetail.relatedHeading)}</Heading>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <li key={item.slug}>
                <ProductCard product={item} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section tone="dark" spacing="lg" className="blueprint-grid">
        <div className="max-w-2xl">
          <Heading level={2} eyebrow="INQUIRY">
            {t(ui.productDetail.inquiryTitle)}
          </Heading>
          <p className="mt-4 text-white/70">{t(ui.productDetail.inquiryLead)}</p>
          <div className="mt-8">
            <Button to={`/contact?product=${product.slug}`} variant="onDark" withArrow>
              {t(ui.actions.requestInformation)}
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}
