import { Card, Heading, Section } from '@/components/ui'
import { Seo } from '@/components/layout/Seo'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getServices, ui } from '@/data'

/**
 * Phase 1: แสดงบริการจริง 4 กลุ่มจาก data layer
 *
 * หน้านี้เป็นตัวพิสูจน์ว่า accessor → hook → component ทำงานครบวงจร
 * layout จริงจะทำใน Phase 4 (ตาม page spec ต้องไม่ซ้ำ layout ตลอดทั้งหน้า)
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

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {services?.map((service) => (
            <Card key={service.slug} to={`/services/${service.slug}`} className="h-full p-7">
              <h2 className="text-h3 font-semibold">{t(service.name)}</h2>
              <p className="text-ink-muted mt-3">{t(service.shortDescription)}</p>
              <ul className="text-ink-muted mt-5 space-y-1.5 text-sm">
                {service.scope.slice(0, 3).map((item) => (
                  <li key={item.en} className="flex gap-2.5">
                    <span aria-hidden="true" className="bg-primary-600 mt-2 size-1 shrink-0 rounded-full" />
                    {t(item)}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>
    </>
  )
}
