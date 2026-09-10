import type { ReactElement, SVGProps } from 'react'
import { Card, Heading, IconFrame, KeepPhrases, Reveal, Section } from '@/components/ui'
import { AwardIcon, MapPinIcon, ShieldAlertIcon, TargetIcon } from '@/components/ui/icons'
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

/**
 * ไอคอนประจำข้อ — คีย์ตรงกับ `icon` ใน `valueProps`
 *
 * เดิมทั้งสี่ใบใช้จุดกลมเหมือนกันหมด ทั้งที่ข้อมูลระบุชื่อไอคอนประจำข้อไว้ตั้งแต่แรก
 * ไอคอนซ้ำกันแปลว่ากวาดสายตาแล้วแยกไม่ออกว่าการ์ดไหนพูดเรื่องอะไร ต้องอ่านหัวข้อ
 * ทีละใบ ซึ่งเสียประโยชน์ของการวางเป็นการ์ดไปทั้งหมด
 *
 * ชนิดของ `icon` ในข้อมูลเป็น `string` ไม่ใช่ union จึงต้องเผื่อกรณีชื่อที่ยังไม่มีไอคอน —
 * ถ้าวันหนึ่งมีคนเพิ่มข้อใหม่ การ์ดต้องขึ้นด้วยจุดกลมเหมือนเดิม ไม่ใช่กรอบเปล่า
 */
const ICONS: Record<string, (props: SVGProps<SVGSVGElement>) => ReactElement> = {
  target: TargetIcon,
  shield: ShieldAlertIcon,
  award: AwardIcon,
  'map-pin': MapPinIcon,
}

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

      {/*
        mt-12 ไม่ใช่ mt-10 — ประโยคนำใต้หัวข้อกับแถวการ์ดเป็นคนละระดับของเนื้อหา
        ระยะ 40px เท่าเดิมใกล้เคียงกับช่องไฟระหว่างการ์ด (24px) มากเกินไป
        ตาจึงอ่านหัวเรื่องกับการ์ดต่อกันเป็นก้อนเดียว 48px แยกสองกลุ่มออกจากกันชัดขึ้น
      */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {valueProps.map((prop, index) => {
          const Icon = ICONS[prop.icon]

          return (
            <Reveal key={prop.id} delay={index * 60}>
              {/*
                มีเงานุ่มชุดเดียวกับแถบ Engineering Highlights — การ์ดขาวขอบเทาจาง
                บนพื้นขาวของ section แทบไม่มีขอบเขตให้เห็น เงาทำหน้าที่ยกการ์ดขึ้นมาจากพื้น

                `hoverLift` เปิดตามที่เจ้าของงานสั่ง ทั้งที่การ์ดไม่ได้เป็นลิงก์ —
                ข้อควรระวังคือการขยับตอนชี้เมาส์เป็นสัญญาณที่ผู้ใช้ตีความว่ากดได้
                ถ้าวันหลังมีคนรายงานว่า "กดแล้วไม่ไปไหน" ต้นเหตุอยู่ตรงนี้

                pb-8 ทับ p-6 เฉพาะขอบล่าง — การ์ดใบที่ยาวที่สุดตัดสินความสูงของทั้งแถว
                ขอบล่าง 24px เท่าขอบบนจึงดูแน่นกว่าที่ควร ทั้งที่ใบอื่นเหลือที่ว่างเยอะ
              */}
              <Card hoverLift className="shadow-card h-full p-6 pb-8">
                <IconFrame size="sm">
                  {/*
                    ไอคอน 24px ในกรอบ 40px — 20px เดิมเหลือที่ว่างรอบตัวมากจนไอคอนดูลอย
                    กลางกรอบแทนที่จะเป็นเนื้อเดียวกับมัน เส้นหนา 1.75 ให้น้ำหนักใกล้เคียง
                    เส้นขอบกรอบที่หนา 2px โดยไม่ทึบเท่า
                  */}
                  {Icon ? (
                    <Icon aria-hidden="true" className="size-6" strokeWidth={1.75} />
                  ) : (
                    <span aria-hidden="true" className="bg-primary-600 size-2 rounded-full" />
                  )}
                </IconFrame>
                <h3 className="text-h3 mt-5 font-semibold">{t(prop.title)}</h3>
                {/*
                  ชิดซ้าย ไม่ใช่ชิดขอบสองข้างแบบหน้าบริการ — คอลัมน์นี้กว้าง 228px
                  ได้แค่ 20–29 ตัวอักษรต่อบรรทัด ส่วนต่างที่ต้องเฉลี่ยจึงตกที่ช่องไฟเยอะมาก
                  วัดจากหน้าจริงก่อนแก้: การ์ดที่ 3 บรรทัด "จากผู้ผลิตในยุโรปหรือ"
                  กว้างจริง 158px ถูกยืดเป็น 228px คิดเป็นช่องไฟที่แทรกเข้ามา 3.5px
                  ต่อช่อง (ราว 0.2em) และค่านี้**ไม่เท่ากันในแต่ละบรรทัด** —
                  0.13 → 3.53 → 0.44px ในการ์ดใบเดียวกัน เนื้อข้อความจึงดูแน่นสลับโปร่ง
                  ทีละบรรทัด หน้าบริการที่คอลัมน์กว้างกว่า 500px ไม่มีอาการนี้
                  เพราะส่วนต่างถูกเฉลี่ยลงบนตัวอักษรมากกว่าสองเท่า

                  คุมจุดตัดด้วย KeepPhrases แทน <br> ตามช่วงจอ — <br> ที่ถูกที่จอหนึ่ง
                  จะผิดทันทีที่กว้างกว่าหรือแคบกว่านั้น ส่วน KeepPhrases คุมเฉพาะวลี
                  ที่ห้ามแยก ไม่ได้กำหนดจุดตัดตายตัว
                */}
                <p className="text-ink-muted mt-3">
                  <KeepPhrases>{t(prop.description)}</KeepPhrases>
                </p>
              </Card>
            </Reveal>
          )
        })}
      </div>
    </Section>
  )
}
