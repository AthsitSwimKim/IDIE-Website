import { Button, Heading, ImagePlaceholder, KeepPhrases, Section } from '@/components/ui'
import { ArrowRight } from '@/components/ui/icons'
import { Seo } from '@/components/layout/Seo'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getServices, serviceDepth, ui } from '@/data'

/**
 * Services — หน้ารวมบริการทุกกลุ่ม
 *
 * เดิมเป็นการ์ดข้อความล้วน ซึ่งอ่านแล้วยังไม่ต่างจากสารบัญ
 * ตอนนี้แต่ละใบมีภาพหน้างานจริงที่ IDIE ส่งมา ขอบเขตงาน และจำนวนประเด็นทางเทคนิค
 * ที่มีให้อ่านต่อ — ผู้อ่านจึงตัดสินใจได้ว่าจะกดเข้าไปหน้าไหนโดยไม่ต้องกดลองทีละหน้า
 *
 * ใช้ layout แบบสลับข้าง ไม่ใช่ grid สี่ช่องเท่ากัน เพราะบริการแต่ละกลุ่มเป็นสายงาน
 * คนละแบบ ไม่ใช่ตัวเลือกสี่อันที่เทียบกันตรง ๆ เหมือนแพ็กเกจราคา
 */
export default function ServiceList() {
  const { t } = useLocale()
  const { data: services } = useAsyncData(getServices)

  return (
    <>
      <Seo
        title={{ th: 'บริการ', en: 'Services' }}
        description={{
          th: 'ระบบอินเตอร์คอม ระบบประกาศและสัญญาณเตือนภัย ระบบเครือข่ายและกล้องวงจรปิด และอุปกรณ์กันระเบิด',
          en: 'Intercom, PA/GA, network and CCTV systems, and explosion-proof equipment.',
        }}
      />

      <Section tone="alt" spacing="lg">
        <Heading level={1} eyebrow="OUR SERVICES">
          {t(ui.pages.servicesTitle)}
        </Heading>
        <p className="text-ink-muted mt-4 max-w-prose">{t(ui.pages.servicesLead)}</p>
      </Section>

      {services?.map((service, index) => {
        const depth = serviceDepth[service.slug]

        return (
          <Section
            key={service.slug}
            tone={index % 2 === 1 ? 'alt' : 'light'}
            spacing="md"
            id={service.slug}
          >
            <div
              className={
                'grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ' +
                // สลับข้างเพื่อไม่ให้สี่บล็อกติดกันอ่านเป็นแถวเดียวซ้ำ ๆ
                (index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : '')
              }
            >
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

              <div>
                <Heading level={2}>
                  <KeepPhrases>{t(service.name)}</KeepPhrases>
                </Heading>
                <p className="text-ink-muted mt-4 max-w-prose">{t(service.shortDescription)}</p>

                <h3 className="text-eyebrow text-ink-muted mt-7 uppercase">
                  {t(ui.serviceDetail.scopeHeading)}
                </h3>
                <ul className="mt-3 space-y-2">
                  {service.scope.map((item) => (
                    <li key={item.en} className="text-ink-muted flex gap-2.5 text-sm">
                      <span
                        aria-hidden="true"
                        className="bg-primary-600 mt-2 size-1 shrink-0 rounded-full"
                      />
                      {t(item)}
                    </li>
                  ))}
                </ul>

                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <Button to={`/services/${service.slug}`} withArrow>
                    {t(ui.actions.readMore)}
                  </Button>
                  {depth && (
                    // บอกล่วงหน้าว่าข้างในมีอะไรให้อ่านต่อ — ลิงก์ที่บอกแค่ "อ่านเพิ่มเติม"
                    // ไม่ได้ช่วยให้ตัดสินใจว่าคุ้มกับการกดหรือไม่
                    <span className="text-ink-muted text-sm">
                      {t(ui.pages.servicesDepthHint)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Section>
        )
      })}

      <Section tone="dark" spacing="lg" className="blueprint-grid">
        <div className="max-w-2xl">
          <Heading level={2} eyebrow="NEXT STEP">
            {t(ui.pages.servicesCtaTitle)}
          </Heading>
          <p className="mt-4 text-white/70">{t(ui.pages.servicesCtaLead)}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/contact" variant="onDark">
              {t(ui.actions.contactInquiry)}
              <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
            </Button>
            <Button
              to="/products"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 active:bg-white/15"
            >
              {t(ui.nav.products)}
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}
