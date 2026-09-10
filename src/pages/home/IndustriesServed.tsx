import { Heading, KeepPhrases, Reveal, Section } from '@/components/ui'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getIndustries, ui } from '@/data'

/**
 * Industries We Serve — Home section 9
 *
 * พื้น navy + blueprint grid ทำให้ต่างจาก section รอบข้างชัดเจน และเป็นจังหวะ dark
 * ตัวที่สองของหน้า (ตัวแรกคือ hero) ก่อนจะกลับมาสว่างที่ Why IDIE
 *
 * spec เสนอ node network / 3D visualization แต่ Phase 3 ทำเป็น grid ที่มีเส้น
 * engineering เชื่อมก่อน — โครงพร้อมให้ XP มาสวม interaction ใน Phase 5
 * โดยไม่ต้องรื้อ layout
 */
export function IndustriesServed() {
  const { t } = useLocale()
  const { data: industries } = useAsyncData(getIndustries)

  if (!industries?.length) return null

  return (
    <Section tone="dark" className="blueprint-grid">
      <div className="max-w-2xl">
        <Heading level={2} eyebrow="INDUSTRIES WE SERVE">
          {t(ui.home.industriesTitle)}
        </Heading>
        {/*
          ครอบด้วย KeepPhrases เพื่อบังคับให้ "เสียงรบกวนสูง" ยกไปทั้งก้อนที่บรรทัดสอง
          ตามที่เจ้าของงานกำหนด — ก่อนแก้บรรทัดแรกจบด้วย "เสียงรบกวน" แล้วทิ้ง "สูง"
          ไว้คำเดียวต้นบรรทัดถัดไป (จอ 768 ขึ้นไป) ส่วนจอมือถือหนักกว่าคือขาดกลาง
          เป็น "เสียง / รบกวนสูง"
        */}
        <p className="mt-4 text-white/70">
          <KeepPhrases>{t(ui.home.industriesLead)}</KeepPhrases>
        </p>
      </div>

      {/*
        สามคอลัมน์ ไม่ใช่สี่ — รายการมีเก้าอุตสาหกรรมหลังเพิ่มโรงงานเหล็กเข้ามา
        ซึ่งลงตัวพอดีสามแถวที่ 3 คอลัมน์ แต่จะเหลือเศษหนึ่งใบโดด ๆ ที่ 4 คอลัมน์
        คอลัมน์ที่กว้างขึ้นยังทำให้คำอธิบายไทยไม่ต้องตัดคำถี่เท่าเดิมด้วย
      */}
      <ul className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {industries.map((industry, index) => (
          <li key={industry.slug}>
            <Reveal delay={index * 50}>
              <span
                aria-hidden="true"
                className="bg-accent-glow/70 mb-4 block h-px w-full max-w-16"
              />
              <h3 className="text-h3 font-semibold text-white">{t(industry.name)}</h3>
              <p className="mt-2 text-white/60">{t(industry.description)}</p>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}
