import { Container, Heading, IconFrame, KeepPhrases, Reveal, Section } from '@/components/ui'
import type { LocalizedText } from '@/types/content'
import { useLocale } from '@/hooks/useLocale'
import { capabilities, ui } from '@/data'

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
    th: 'สำรวจหน้างาน คำนวณระดับความดังเสียง เพื่อออกแบบระบบเตือนภัยให้ครอบคลุมพื้นที่จริง',
    en: 'Site survey and sound pressure level calculation, so the warning system covers the actual area.',
  },
  {
    th: 'คัดสรรอุปกรณ์จากผู้ผลิตชั้นนำในยุโรปและสหรัฐฯ พร้อมเอกสารรับรองมาตรฐานความปลอดภัยครบครัน',
    en: 'Equipment selected from leading European and US manufacturers, with full safety certification documents.',
  },
  {
    th: 'ติดตั้ง ทดสอบระบบ และดูแลหลังส่งมอบ พร้อมบริการอะไหล่และงานเปลี่ยนทดแทน',
    en: 'Installation, system testing and post‑handover care, with spare parts and replacement service.',
  },
]
export function EngineeringHighlights() {
  const { t } = useLocale()

  return (
    <Section tone="alt" spacing="sm" bleed>
      <Container>
        <div className="max-w-2xl">
          <Heading level={2} eyebrow="ENGINEERING HIGHLIGHTS">
            {t(ui.home.highlightsTitle)}
          </Heading>
          <p className="text-ink-muted mt-4">
            <KeepPhrases>{t(ui.home.highlightsLead)}</KeepPhrases>
          </p>
        </div>

        {/*
          `divide-line` ต้องระบุเอง — ถ้าไม่ใส่ เส้นคั่นจะตกไปใช้ `currentColor`
          ซึ่งคือสีตัวอักษร (ink เกือบดำ) เส้นจึงเข้มกว่าเส้นอื่นทั้งเว็บที่ใช้ #e2e8f2

          จอแคบคั่นแนวนอน (`divide-y`) จอกว้างสลับเป็นแนวตั้ง (`md:divide-x md:divide-y-0`)
          การ์ดสามใบเรียงซ้อนกันบนมือถือจึงยังแยกจากกันได้โดยไม่ต้องมีเส้นตั้งมาบีบ
        */}
        <ol className="border-line divide-line/55 bg-surface rounded-card shadow-card mt-10 grid divide-y border md:grid-cols-3 md:divide-x md:divide-y-0">
          {capabilities.map((capability, index) => (
            <li key={capability.id}>
              {/*
                  p-5 ไม่ใช่ p-7 — คำอธิบายการ์ดที่ 2 ยาว 342px ที่ขนาดตัวอักษร 16px
                  ส่วนคอลัมน์เดิม (p-7) เหลือ 337px ที่จอ 1440 และ 316px ที่จอ 1280
                  จึงตกไปบรรทัดที่สาม การลดขอบเหลือ 20px ทำให้ได้ 353px และ 340px
                  ตามลำดับ ทั้งสามการ์ดจึงจบใน 2 บรรทัดเท่ากันตั้งแต่จอ 1280 ขึ้นไป
                */}
                <Reveal delay={index * 70} className="flex h-full flex-col gap-4 p-5">
                <div className="flex items-center gap-4">
                  {/*
                    ดันลง 2px — วัดแล้วกึ่งกลางกรอบตรงกับกึ่งกลางหมึกของหัวข้อพอดี
                    (ต่างกัน 0px) แต่ตาคนอ่านมองว่ากรอบลอยสูงกว่า เพราะวรรณยุกต์ไทย
                    ดันขอบหมึกด้านบนขึ้นไปโดยที่ตัวอักษรจริงยังอยู่ต่ำกว่านั้น
                    ศูนย์กลางเชิงสายตาของข้อความไทยจึงต่ำกว่าศูนย์กลางเชิงเรขาคณิต
                  */}
                  <IconFrame size="xs" className="translate-y-[2px]">
                    {/*
                      ตัวเลขใช้ text-lg ไม่ใช่ text-sm — กรอบมุมฉากกว้าง 40px เท่ากับ
                      ความยาวแขนสองข้างพอดี ย่อกรอบลงไม่ได้เพราะแขนจะซ้อนกันจนกลาย
                      เป็นกล่องทึบ จึงขยายตัวเลขให้เต็มกรอบแทน ช่องว่างบน-ล่างในกรอบ
                      ลดจาก 8px เหลือราว 4px ตัวเลขจึงไม่ลอย
                    */}
                    <span className="stat-figure text-primary-600 text-lg font-bold">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </IconFrame>
                  <h3 className="text-h3 font-semibold">{t(capability.name)}</h3>
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

      </Container>
    </Section>
  )
}
