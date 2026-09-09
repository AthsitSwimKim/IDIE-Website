import { Link } from 'react-router-dom'
import { ArrowRight, Button, Heading, KeepPhrases, Reveal, Section } from '@/components/ui'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getServices, ui } from '@/data'

/**
 * Our Services — Home section 4
 *
 * ใช้แถวใหญ่มีเลขกำกับแทน card grid โดยตั้งใจ — หน้านี้มี grid อยู่หลายที่แล้ว
 * (Brand Partners, Products, References) ถ้าบริการเป็น grid อีกจะกลายเป็นสี่ block
 * หน้าตาเดียวกันเรียงกันลงมา ซึ่งเป็นอาการหลักของเว็บที่ดูเหมือน template
 *
 * แถวใหญ่ยังได้เปรียบเชิงเนื้อหา: ชื่อบริการของ IDIE ยาว (เช่น "โทรศัพท์อุตสาหกรรม
 * และอุปกรณ์ส่งสัญญาณชนิดกันระเบิด") ซึ่งอ่านลำบากในการ์ดแคบ ๆ
 */
export function HomeServices() {
  const { t } = useLocale()
  const { data: services } = useAsyncData(getServices)

  if (!services?.length) return null

  return (
    <Section>
      {/* items-start กัน flex-col ยืดปุ่มให้เต็มความกว้างบนจอแคบ */}
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <Heading level={2} eyebrow="OUR SERVICES">
            {t(ui.home.servicesTitle).replace('{count}', String(services.length))}
          </Heading>
          <p className="text-ink-muted mt-4">{t(ui.home.servicesLead)}</p>
        </div>
        <Button to="/services" variant="outline" withArrow className="shrink-0">
          {t(ui.nav.services)}
        </Button>
      </div>

      <ol className="border-line mt-10 border-t">
        {services.map((service, index) => (
          <li key={service.slug} className="border-line border-b">
            <Reveal delay={index * 60}>
              <Link
                to={`/services/${service.slug}`}
                className="group hover:bg-surface-alt -mx-4 flex flex-col gap-3 px-4 py-7 transition-colors duration-(--duration-ui) md:flex-row md:items-center md:gap-8"
              >
                <span className="stat-figure text-primary-600 w-10 shrink-0 text-sm font-bold">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <span className="md:w-2/5">
                  <span className="text-h3 block font-semibold">
                    <KeepPhrases>{t(service.name)}</KeepPhrases>
                  </span>
                </span>

                <span className="text-ink-muted flex-1">
                  <KeepPhrases>{t(service.shortDescription)}</KeepPhrases>
                </span>

                <ArrowRight
                  aria-hidden="true"
                  className="text-primary-600 hidden size-5 shrink-0 transition-transform duration-(--duration-ui) group-hover:translate-x-1 md:block"
                />
              </Link>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  )
}
