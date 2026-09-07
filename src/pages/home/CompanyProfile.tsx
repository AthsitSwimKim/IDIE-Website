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
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12">
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
            แผนผังภาพรวมระบบ INTRON-X แทนแผงตราสัญลักษณ์เดิม (ก.ย. 2026)

            `object-contain` กับสัดส่วนตามไฟล์จริง ไม่ใช่ `object-cover` ใน 4:3 แบบเดิม —
            ภาพนี้เป็นแผนผังที่มีข้อมูลอยู่ทุกมุม ถ้าครอบตัดให้พอดีกรอบจะตัดอุปกรณ์
            ที่ขอบซ้ายกับขวาหายไป กลายเป็นแผนผังที่อ่านแล้วไม่ครบ

            มี `alt` เต็ม ๆ ไม่ใช่ `alt=""` เพราะเป็นเนื้อหา ไม่ใช่ของตกแต่ง — คนที่ใช้
            โปรแกรมอ่านหน้าจอควรรู้ว่าภาพนี้บอกอะไร ไม่ใช่ข้ามไปเฉย ๆ

            พื้นหลังของไฟล์โปร่งใส จึงกลืนกับพื้นขาวของ section เอง ไม่ต้องมีกรอบขาว
            ซ้อนอีกชั้น แต่ยังใส่เส้นขอบบาง ๆ ไว้ให้ขอบเขตของภาพชัด
          */}
          <img
            src="/images/home/intron-x-system.webp"
            srcSet="/images/home/intron-x-system-800.webp 1x, /images/home/intron-x-system.webp 2x"
            alt={t(ui.home.companyImageAlt)}
            width={1600}
            height={990}
            loading="lazy"
            decoding="async"
            className="rounded-card border-line w-full border p-3"
          />
        </Reveal>
      </div>
    </Section>
  )
}
