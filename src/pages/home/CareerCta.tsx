import { Badge, Button, Heading, Section } from '@/components/ui'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getJobOpenings, ui } from '@/data'

/**
 * Career CTA — Home section 13
 *
 * แสดงเฉพาะเมื่อมีตำแหน่งเปิดรับจริง — ตอนนี้มี 2 ตำแหน่งจากหน้า Job ของเว็บบริษัท
 * ถ้าวันหนึ่งไม่มีตำแหน่งว่าง section นี้จะหายไปเองแทนที่จะโชว์ banner ที่กดแล้วเจอหน้าว่าง
 */
export function CareerCta() {
  const { t } = useLocale()
  const { data: jobs } = useAsyncData(getJobOpenings)

  if (!jobs?.length) return null

  return (
    <Section tone="alt">
      {/* items-start กัน flex-col ยืดปุ่มให้เต็มความกว้างบนจอแคบ */}
      <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <Heading level={2} eyebrow="CAREERS">
            {t(ui.home.careerTitle)}
          </Heading>
          <p className="text-ink-muted mt-4">{t(ui.home.careerLead)}</p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {jobs.map((job) => (
              <li key={job.slug}>
                <Badge tone="brand">{t(job.title)}</Badge>
              </li>
            ))}
          </ul>
        </div>

        <Button to="/careers" size="lg" withArrow className="shrink-0">
          {t(ui.home.careerCta)}
        </Button>
      </div>
    </Section>
  )
}
