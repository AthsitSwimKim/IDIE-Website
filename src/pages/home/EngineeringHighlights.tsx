import { Container, Heading, IconFrame, KeepPhrases, Reveal, Section } from '@/components/ui'
import type { LocalizedText } from '@/types/content'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { capabilities, getServices, ui } from '@/data'

/**
 * Engineering Highlights — Home section 3
 *
 * ความสามารถ 3 อย่างที่คร่อมทุกบริการ (Design & Engineering / Procurement / Service)
 * มาจากข้อความบนเว็บบริษัทโดยตรง: "engineering, distributor and service company"
 *
 * ใช้ layout แบบ strip ที่คร่อมรอยต่อระหว่าง section ตาม mockup ที่ลูกค้าอนุมัติ —
 * ต่างจาก grid ธรรมดาและช่วยเชื่อม Company Profile เข้ากับ Services
 */

/**
 * คำอธิบายของแต่ละขั้น เรียงตามลำดับที่แสดง
 *
 * ย้ายออกมาจากใน JSX ที่เดิมเขียนเป็น `index === 0 && …` สามชุดซ้อนกัน เพื่อให้ครอบ
 * ด้วย `KeepPhrases` ได้ — คอมโพเนนต์นั้นรับ**สตริงเดียว** ไม่รับ element ซ้อน
 */
const STEP_NOTES: LocalizedText[] = [
  {
    th: 'สำรวจหน้างาน คำนวณการครอบคลุมเสียงและแสงสัญญาณ แล้วออกแบบระบบให้ตรงกับการจำแนกพื้นที่จริง',
    en: 'Site survey, acoustic and visual coverage calculation, then a design matched to the actual area classification.',
  },
  {
    th: 'จัดหาอุปกรณ์จากผู้ผลิตยุโรปและสหรัฐฯ พร้อมตรวจสอบมาตรฐานและใบรับรองที่โครงการกำหนด',
    en: 'Procurement from European and US manufacturers, with certification and compliance checked against project specifications.',
  },
  {
    th: 'ติดตั้ง ทดสอบการใช้งาน และดูแลหลังส่งมอบ พร้อมอะไหล่และงานเปลี่ยนทดแทน',
    en: 'Installation, commissioning and long-term support, including spare parts and replacement.',
  },
]
export function EngineeringHighlights() {
  const { t } = useLocale()
  const { data: services } = useAsyncData(getServices)

  return (
    <Section tone="alt" spacing="sm" bleed>
      <Container>
        <div className="max-w-2xl">
          <Heading level={2} eyebrow="ENGINEERING HIGHLIGHTS">
            {t(ui.home.highlightsTitle)}
          </Heading>
          <p className="text-ink-muted mt-4">{t(ui.home.highlightsLead)}</p>
        </div>

        <ol className="border-line bg-surface rounded-card shadow-card mt-10 grid divide-y border md:grid-cols-3 md:divide-x md:divide-y-0">
          {capabilities.map((capability, index) => (
            <li key={capability.id}>
              <Reveal delay={index * 70} className="flex h-full flex-col gap-4 p-7">
                <div className="flex items-center gap-4">
                  <IconFrame size="sm">
                    <span className="stat-figure text-primary-600 text-sm font-bold">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </IconFrame>
                  <h3 className="font-semibold">{t(capability.name)}</h3>
                </div>
                {STEP_NOTES[index] && (
                  <p className="text-ink-muted text-sm">
                    <KeepPhrases>{t(STEP_NOTES[index])}</KeepPhrases>
                  </p>
                )}
              </Reveal>
            </li>
          ))}
        </ol>

        {services && (
          <p className="text-ink-muted mt-6 text-sm">
            {t({ th: 'ครอบคลุม', en: 'Across' })}{' '}
            <strong className="text-ink font-semibold">{services.length}</strong>{' '}
            {t({ th: 'กลุ่มบริการหลัก', en: 'core service groups' })}
          </p>
        )}
      </Container>
    </Section>
  )
}
