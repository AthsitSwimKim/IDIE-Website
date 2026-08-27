import { Button, Heading, Reveal, Section } from '@/components/ui'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getCompany, ui } from '@/data'
import { yearsOfExperience } from '@/config'

/**
 * Company Profile — Home section 2
 *
 * Split 2 คอลัมน์: ข้อความซ้าย ภาพขวา เป็น pattern แรกหลัง hero ที่ต่างจาก hero โดยสิ้นเชิง
 * ข้อความมาจาก company.about ซึ่งเป็นคำแปลของย่อหน้า business activities บนเว็บบริษัทจริง
 */
export function CompanyProfile() {
  const { t } = useLocale()
  const { data: company } = useAsyncData(getCompany)
  const years = yearsOfExperience()

  if (!company) return null

  return (
    <Section>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <Heading level={2} eyebrow="COMPANY PROFILE">
            {t(ui.home.companyTitle)}
          </Heading>
          <p className="text-ink-muted mt-6 max-w-prose">{t(company.about)}</p>

          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
            <div>
              <dt className="text-eyebrow text-ink-muted uppercase">
                {t({ th: 'ก่อตั้ง', en: 'Established' })}
              </dt>
              <dd className="stat-figure text-h3 mt-1 font-bold">{company.foundedYear}</dd>
            </div>
            <div>
              <dt className="text-eyebrow text-ink-muted uppercase">
                {t({ th: 'ประสบการณ์', en: 'Experience' })}
              </dt>
              <dd className="stat-figure text-h3 mt-1 font-bold">
                {years}
                <span className="text-ink-muted ml-1 text-base font-medium">
                  {t({ th: 'ปี', en: 'years' })}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-eyebrow text-ink-muted uppercase">
                {t({ th: 'ที่ตั้ง', en: 'Based in' })}
              </dt>
              <dd className="text-h3 mt-1 font-bold">{t({ th: 'ระยอง', en: 'Rayong' })}</dd>
            </div>
          </dl>

          <div className="mt-9">
            <Button to="/about" variant="outline" withArrow>
              {t(ui.home.companyCta)}
            </Button>
          </div>
        </Reveal>

        <Reveal delay={80}>
          {/*
            แผงตราสัญลักษณ์เดียวกับหน้า About — ไฟล์เดียวใช้สองที่โดยตั้งใจ
            ถ้าทำคนละภาพจะต้องมาไล่แก้สองจุดทุกครั้งที่ปรับตรา

            `alt=""` เพราะเป็นภาพตกแต่ง ชื่อบริษัทอยู่ในหัวข้อและใน header อยู่แล้ว

            TODO: ยังอยากได้ภาพอาคารสำนักงาน ทีมงาน หรือหน้างานติดตั้งจริงมาแทน
            (ดู docs/data-requests.md หัวข้อภาพองค์กร)
          */}
          <img
            src="/images/brand/company-panel.webp"
            srcSet="/images/brand/company-panel-800.webp 1x, /images/brand/company-panel.webp 2x"
            alt=""
            width={1600}
            height={1200}
            loading="lazy"
            decoding="async"
            className="rounded-card border-line aspect-[4/3] w-full border object-cover"
          />
        </Reveal>
      </div>
    </Section>
  )
}
