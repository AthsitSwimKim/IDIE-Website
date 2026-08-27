import { useParams } from 'react-router-dom'
import { Badge, Button, Heading, ImagePlaceholder, Section } from '@/components/ui'
import { Seo } from '@/components/layout/Seo'
import NotFound from '@/pages/NotFound'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getProductCategories, getServiceBySlug, ui } from '@/data'

/**
 * Service Detail — Phase 4
 *
 * slug ที่ไม่พบใน data layer จะ render NotFound ไม่ใช่ crash หรือหน้าว่าง
 * ตามที่ระบุไว้ใน references/roles/02-frontend-architect.md
 */
export default function ServiceDetail() {
  const { slug } = useParams()
  const { t } = useLocale()
  const { data: service, loading } = useAsyncData(() => getServiceBySlug(slug ?? ''), [slug])
  const { data: categories } = useAsyncData(getProductCategories)

  if (loading) return null
  if (!service) return <NotFound />

  const related = (service.relatedProductCategorySlugs ?? [])
    .map((s) => categories?.find((c) => c.slug === s))
    .filter((c) => c !== undefined)

  return (
    <>
      <Seo title={service.name} description={service.shortDescription} />

      <Section tone="alt" spacing="lg">
        <Heading level={1} eyebrow="SERVICE">
          {t(service.name)}
        </Heading>
        <p className="text-ink-muted mt-4 max-w-prose text-lg">{t(service.shortDescription)}</p>
        <div className="mt-8">
          <Button to="/services" variant="ghost">
            {t(ui.serviceDetail.backToServices)}
          </Button>
        </div>
      </Section>

      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <Heading level={2}>{t(ui.serviceDetail.overviewHeading)}</Heading>
            <p className="text-ink-muted mt-5">{t(service.overview)}</p>
          </div>
          <ImagePlaceholder aspect="aspect-[4/3]" label={t(service.cover.alt)} size="1600 × 1200" />
        </div>
      </Section>

      <Section tone="alt">
        <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
          <div>
            <Heading level={2}>{t(ui.serviceDetail.scopeHeading)}</Heading>
            <ul className="border-line mt-5 divide-y border-t border-b">
              {service.scope.map((item) => (
                <li key={item.en} className="flex gap-3 py-3">
                  <span
                    aria-hidden="true"
                    className="bg-primary-600 mt-2.5 size-1.5 shrink-0 rounded-full"
                  />
                  <span>{t(item)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Heading level={2}>{t(ui.serviceDetail.applicationsHeading)}</Heading>
            <ul className="border-line mt-5 divide-y border-t border-b">
              {service.applications.map((item) => (
                <li key={item.en} className="flex gap-3 py-3">
                  <span
                    aria-hidden="true"
                    className="bg-accent-cyan mt-2.5 size-1.5 shrink-0 rounded-full"
                  />
                  <span>{t(item)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {related.length > 0 && (
        <Section>
          <Heading level={2} eyebrow="PRODUCTS">
            {t(ui.serviceDetail.relatedProductsHeading)}
          </Heading>
          <ul className="mt-6 flex flex-wrap gap-2">
            {related.map((category) => (
              <li key={category.slug}>
                <Button to={`/products?category=${category.slug}`} variant="outline" size="sm">
                  {t(category.name)}
                </Button>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section tone="dark" spacing="lg" className="blueprint-grid">
        <div className="max-w-2xl">
          <Heading level={2} eyebrow="NEXT STEP">
            {t(ui.serviceDetail.ctaTitle)}
          </Heading>
          <p className="mt-4 text-white/70">{t(ui.home.contactCtaLead)}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to={`/contact?service=${service.slug}`} variant="onDark" withArrow>
              {t(ui.actions.contactInquiry)}
            </Button>
            <Badge tone="neutral" className="self-center">
              {t(service.name)}
            </Badge>
          </div>
        </div>
      </Section>
    </>
  )
}
