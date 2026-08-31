import { useParams } from 'react-router-dom'
import { Badge, Button, Heading, ImagePlaceholder, Section } from '@/components/ui'
import { CheckIcon } from '@/components/ui/icons'
import { Seo } from '@/components/layout/Seo'
import NotFound from '@/pages/NotFound'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getProductCategories, getServiceBySlug, serviceDepth, ui } from '@/data'

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

  // เนื้อหาเชิงลึกเป็น optional — บริการที่ยังไม่ได้เขียนส่วนนี้จะข้ามสาม section ไปเลย
  // ดีกว่าแสดงหัวข้อที่ไม่มีเนื้อหาอยู่ข้างใน
  const depth = serviceDepth[service.slug]

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

            {/*
              ย่อหน้าแรกเป็นบทสรุปหนึ่งประโยคจาก `service.overview` ซึ่งใช้เป็น
              meta description ของหน้าด้วย จึงเน้นให้ต่างจากย่อหน้าที่เหลือ
              ส่วนที่ตามมาคือเนื้อหาเต็มจาก `serviceDepth.overviewDetail`
            */}
            <p className="text-ink mt-5 text-lg leading-relaxed">{t(service.overview)}</p>

            {depth?.overviewDetail.map((paragraph) => (
              <p key={paragraph.en} className="text-ink-muted mt-4 leading-relaxed">
                {t(paragraph)}
              </p>
            ))}
          </div>
          {/*
            ครอบเป็น 4:3 ด้วย object-cover เพื่อให้ทั้งสี่หน้าบริการมีสัดส่วนเท่ากัน
            ภาพต้นฉบับที่ IDIE ส่งมามีสัดส่วนต่างกัน (จตุรัส · 16:10 · 3:2)
            ถ้าปล่อยตามสัดส่วนจริง ความสูงของบล็อกจะไม่เท่ากันในแต่ละหน้า
            แล้วเว็บจะดูเหมือนแต่ละหน้าถูกทำคนละครั้งโดยคนละคน
          */}
          {service.cover ? (
            <img
              src={service.cover.src}
              srcSet={service.cover.srcSet}
              alt={t(service.cover.alt)}
              width={service.cover.width}
              height={service.cover.height}
              loading="lazy"
              decoding="async"
              className="border-line rounded-card bg-surface-alt aspect-[4/3] w-full border object-cover"
            />
          ) : (
            <ImagePlaceholder label={t(service.name)} size="1600 × 1200" />
          )}
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

      {depth && (
        <>
          <Section>
            <div className="grid gap-10 lg:grid-cols-[2fr_3fr] lg:gap-16">
              <div>
                <Heading level={2}>{t(ui.serviceDetail.processHeading)}</Heading>
                <p className="text-ink-muted mt-4 max-w-prose">
                  {t(ui.serviceDetail.processLead)}
                </p>
              </div>

              {/*
                `<ol>` ไม่ใช่ `<ul>` — ลำดับมีความหมายจริงตรงนี้ (สำรวจก่อนออกแบบ
                ออกแบบก่อนสั่งของ) โปรแกรมอ่านหน้าจอจะบอกผู้ฟังว่า "ข้อ 3 จาก 6"
                ซึ่งเป็นข้อมูลที่หายไปถ้าใช้รายการแบบไม่เรียงลำดับ
              */}
              <ol className="border-line divide-line divide-y border-t border-b">
                {depth.process.map((step, index) => (
                  <li key={step.en} className="flex gap-4 py-4">
                    <span
                      aria-hidden="true"
                      className="stat-figure text-primary-600 w-6 shrink-0 text-sm font-bold"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm">{t(step)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Section>

          <Section tone="alt">
            <div className="grid gap-10 lg:grid-cols-[2fr_3fr] lg:gap-16">
              <div>
                <Heading level={2}>{t(ui.serviceDetail.checklistHeading)}</Heading>
                <p className="text-ink-muted mt-4 max-w-prose">
                  {t(ui.serviceDetail.checklistLead)}
                </p>
                <div className="mt-6">
                  <Button to={`/contact?service=${service.slug}`} variant="outline" size="sm" withArrow>
                    {t(ui.actions.contactInquiry)}
                  </Button>
                </div>
              </div>

              <ul className="grid gap-3 sm:grid-cols-2">
                {depth.quoteChecklist.map((item) => (
                  <li
                    key={item.en}
                    className="border-line bg-surface rounded-card flex gap-3 border p-4 text-sm"
                  >
                    <CheckIcon
                      aria-hidden="true"
                      className="text-primary-600 mt-0.5 size-4 shrink-0"
                    />
                    <span>{t(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          <Section>
            <Heading level={2}>{t(ui.serviceDetail.notesHeading)}</Heading>
            <p className="text-ink-muted mt-4 max-w-prose">{t(ui.serviceDetail.notesLead)}</p>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {depth.technicalNotes.map((note) => (
                <article key={note.title.en} className="border-line rounded-card border p-6">
                  <h3 className="font-semibold">{t(note.title)}</h3>
                  <p className="text-ink-muted mt-3 text-sm leading-relaxed">{t(note.body)}</p>
                </article>
              ))}
            </div>
          </Section>
        </>
      )}

      {related.length > 0 && (
        <Section tone="alt">
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
