import { Badge, Button, Heading, KeepPhrases, Section } from '@/components/ui'
import { Seo } from '@/components/layout/Seo'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { careersEmail, getJobOpenings, ui } from '@/data'

/**
 * Careers — Phase 4
 *
 * ประกาศทั้งสองตำแหน่งเป็นของจริงจากหน้า Job ของเว็บบริษัท
 * ปุ่มสมัครเป็น mailto: ที่เติมหัวข้ออีเมลให้แล้ว เพราะเว็บนี้ไม่มี backend
 * การส่งใบสมัครจึงต้องผ่านอีเมลจริงตามที่บริษัทระบุไว้เอง
 *
 * ไม่แสดงจำนวนอัตราเพราะเว็บเดิมไม่ได้ระบุ — ข้อมูลที่ไม่มีดีกว่าตัวเลขที่เดา
 */
export default function Careers() {
  const { t } = useLocale()
  const { data: jobs } = useAsyncData(getJobOpenings)

  return (
    <>
      <Seo title={ui.careers.title} description={ui.careers.lead} />

      <Section tone="alt" spacing="lg">
        <Heading level={1} eyebrow="CAREERS">
          {t(ui.careers.title)}
        </Heading>
        <p className="text-ink-muted mt-4 max-w-prose text-lg">
          <KeepPhrases>{t(ui.careers.lead)}</KeepPhrases>
        </p>
      </Section>

      <Section>
        <Heading level={2}>{t(ui.careers.openPositions)}</Heading>

        <ul className="mt-8 space-y-6">
          {jobs?.map((job) => (
            <li key={job.slug}>
              <article className="border-line bg-surface rounded-card border p-7 md:p-9">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-h3 font-semibold">{t(job.title)}</h3>
                    <p className="text-ink-muted mt-1 text-sm">{t(job.department)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="brand">{t(ui.careers.fullTime)}</Badge>
                    <Badge>
                      {t(ui.careers.basedIn)} {t(job.location)}
                    </Badge>
                  </div>
                </div>

                <div className="mt-7 grid gap-8 md:grid-cols-2">
                  <div>
                    <h4 className="text-eyebrow text-ink-muted uppercase">
                      {t(ui.careers.responsibilities)}
                    </h4>
                    <ul className="mt-3 space-y-2.5 text-sm">
                      {job.responsibilities.map((item) => (
                        <li key={item.en} className="flex gap-3">
                          <span
                            aria-hidden="true"
                            className="bg-primary-600 mt-2 size-1.5 shrink-0 rounded-full"
                          />
                          <span>{t(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-eyebrow text-ink-muted uppercase">
                      {t(ui.careers.qualifications)}
                    </h4>
                    <ul className="mt-3 space-y-2.5 text-sm">
                      {job.qualifications.map((item) => (
                        <li key={item.en} className="flex gap-3">
                          <span
                            aria-hidden="true"
                            className="bg-accent-cyan mt-2 size-1.5 shrink-0 rounded-full"
                          />
                          <span>{t(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    href={`mailto:${careersEmail}?subject=${encodeURIComponent(`Application — ${job.title.en}`)}`}
                    withArrow
                  >
                    {t(ui.careers.applyCta)}
                  </Button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="dark" spacing="lg" className="blueprint-grid">
        <div className="max-w-2xl">
          <Heading level={2} eyebrow="HOW TO APPLY">
            {t(ui.careers.howToApply)}
          </Heading>
          <p className="mt-4 text-white/70">{t(ui.careers.applyLead)}</p>
          <p className="mt-6">
            <a
              href={`mailto:${careersEmail}`}
              className="text-accent-glow inline-flex min-h-11 items-center text-lg font-semibold underline-offset-4 hover:underline"
            >
              {careersEmail}
            </a>
          </p>
        </div>
      </Section>
    </>
  )
}
