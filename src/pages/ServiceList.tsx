import { Button, CoverImage, Heading, KeepPhrases, Section } from '@/components/ui'
import { ArrowRight } from '@/components/ui/icons'
import { Seo } from '@/components/layout/Seo'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getServices, serviceDepth, ui } from '@/data'
import type { LocalizedText } from '@/types/content'

const intercomScopeCards: Array<{ title: LocalizedText; detail: LocalizedText }> = [
  {
    title: { th: 'สำรวจและออกแบบ', en: 'Survey and design' },
    detail: { th: 'ออกแบบตามพื้นที่', en: 'Designed for each area' },
  },
  {
    title: { th: 'จัดหาอุปกรณ์', en: 'Equipment supply' },
    detail: { th: 'ยุโรปและสหรัฐฯ', en: 'Europe and the United States' },
  },
  {
    title: { th: 'ติดตั้งและทดสอบ', en: 'Install and test' },
    detail: { th: 'ทดสอบก่อนส่งมอบ', en: 'Tested before handover' },
  },
  {
    title: { th: 'บริการหลังการขาย', en: 'After-sales service' },
    detail: { th: 'ดูแลและจัดหาอะไหล่', en: 'Support and spare parts' },
  },
]

const telephoneScopeCards: Array<{ title: LocalizedText; detail: LocalizedText }> = [
  {
    title: { th: 'ออกแบบระบบ', en: 'System design' },
    detail: { th: 'ออกแบบและเลือกตู้สาขา PABX', en: 'System design and PABX selection' },
  },
  {
    title: { th: 'เลือกเครื่องปลายทาง', en: 'Handset selection' },
    detail: {
      th: 'ในอาคาร กลางแจ้ง กันสภาพอากาศ และกันระเบิด',
      en: 'Indoor, outdoor, weatherproof and explosion-proof sets',
    },
  },
  {
    title: { th: 'เดินสายและเชื่อมต่อ', en: 'Cabling and integration' },
    detail: {
      th: 'ตู้ MDF / IDF เชื่อมชุมสายภายนอกและระบบเดิม',
      en: 'MDF / IDF cabling, external lines and existing systems',
    },
  },
  {
    title: { th: 'ติดตั้งและดูแล', en: 'Installation and support' },
    detail: { th: 'ติดตั้ง ทดสอบ และบริการหลังการขาย', en: 'Installation, testing and after-sales service' },
  },
]

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
          th: 'ระบบอินเตอร์คอม ระบบประกาศและสัญญาณเตือนภัย ระบบโทรศัพท์ ระบบเครือข่าย WAN/LAN กล้องวงจรปิด และระบบควบคุมการเข้าออก',
          en: 'Intercom, PA/GA, telephone, WAN/LAN, CCTV and access control systems.',
        }}
      />

      <Section tone="alt" spacing="sm" className="page-intro">
        <Heading level={1} eyebrow="OUR SERVICES">
          {t(ui.pages.servicesTitle)}
        </Heading>
        <p className="text-ink-muted mt-4 max-w-prose">
          <KeepPhrases>{t(ui.pages.servicesLead)}</KeepPhrases>
        </p>
      </Section>

      {services?.map((service, index) => {
        const depth = serviceDepth[service.slug]
        const scopeCards =
          service.slug === 'intercommunication-system'
            ? intercomScopeCards
            : service.slug === 'telephone-system'
              ? telephoneScopeCards
              : service.scope.map((title) => ({ title, detail: undefined }))

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
              <CoverImage image={service.cover} label={t(service.name)} />

              <div>
                <Heading level={2}>
                  <KeepPhrases>{t(service.name)}</KeepPhrases>
                </Heading>
                <p className="text-ink-muted mt-4 max-w-prose">
                  <KeepPhrases>{t(service.shortDescription)}</KeepPhrases>
                </p>

                <h3 className="text-ink mt-7 text-base font-semibold">
                  {t(ui.serviceDetail.scopeHeading)}
                </h3>
                <ul className="mt-4 grid auto-rows-fr gap-3 sm:grid-cols-2">
                  {scopeCards.map((card) => {
                    return (
                      <li
                        key={card.title.en}
                        className="service-scope-card corner-bracket border-line bg-surface relative min-h-32 border p-5"
                      >
                        <div className="flex items-start gap-3.5">
                          <span className="border-primary-200 text-primary-600 mt-0.5 flex size-9 shrink-0 items-center justify-center border bg-primary-50">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              aria-hidden="true"
                              className="size-4"
                            >
                              <path d="m12 3 9 9-9 9-9-9 9-9Z" />
                              <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
                            </svg>
                          </span>
                          <div className="min-w-0">
                            <p className="text-ink font-semibold leading-snug">
                              {t(card.title)}
                            </p>
                            {card.detail && (
                              <p className="text-ink-muted mt-1 text-sm leading-relaxed">
                                {t(card.detail)}
                              </p>
                            )}
                          </div>
                        </div>
                      </li>
                    )
                  })}
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
          <p className="mt-4 text-white/70">
            <KeepPhrases>{t(ui.pages.servicesCtaLead)}</KeepPhrases>
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/contact" variant="onDark">
              {t(ui.actions.contactInquiry)}
              <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
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
