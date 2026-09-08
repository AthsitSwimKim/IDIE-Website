import { Card, Heading, IconFrame, Reveal, Section } from '@/components/ui'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getValueProps, ui } from '@/data'

/**
 * Why IDIE — Home section 10
 *
 * ทั้งสี่ข้อผูกกับข้อเท็จจริงที่ตรวจสอบได้จากเว็บบริษัท (ปีก่อตั้ง, นโยบายสินค้ายุโรป/สหรัฐฯ,
 * งาน hazardous area, ที่ตั้งระยอง) ไม่ใช่คำโฆษณา — ในธุรกิจ B2B ที่ผู้อ่านเป็นวิศวกร
 * คำโฆษณาลอย ๆ ทำให้เสียความน่าเชื่อถือมากกว่าไม่เขียนอะไรเลย
 */
export function WhyIdie() {
  const { t } = useLocale()
  const { data: valueProps } = useAsyncData(getValueProps)

  if (!valueProps?.length) return null

  return (
    <Section>
      <div className="max-w-2xl">
        <Heading level={2} eyebrow="WHY IDIE">
          {t(ui.home.whyTitle)}
        </Heading>
        <p className="text-ink-muted mt-4">{t(ui.home.whyLead)}</p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {valueProps.map((prop, index) => (
          <Reveal key={prop.id} delay={index * 60}>
            <Card className="h-full p-6">
              <IconFrame size="sm">
                <span aria-hidden="true" className="bg-primary-600 size-2 rounded-full" />
              </IconFrame>
              <h3 className="mt-5 font-semibold">{t(prop.title)}</h3>
              {/* จัดชิดขอบแบบ inter-character เหมือนหน้าบริการ — เหตุผลเต็มอยู่ใน ServiceDetail */}
              <p className="text-ink-muted mt-2 text-justify text-sm [text-justify:inter-character]">
                {t(prop.description)}
              </p>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
