import { Heading, Section } from '@/components/ui'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getStats, ui } from '@/data'
import { yearsOfExperience } from '@/config'

/**
 * Engineering Statistics — Home section 11
 *
 * **แสดงเฉพาะตัวเลขที่ตรวจสอบได้จริง** — ปีประสบการณ์คำนวณจากปีก่อตั้ง 2006
 * และจำนวนองค์กรนับจากโลโก้จริงบนเว็บบริษัท ส่วนตัวเลขที่ยังไม่มีข้อมูล
 * (จำนวนโครงการ) ถูกกรองออกด้วย _placeholder ไม่ใช่เดาใส่
 *
 * เหตุผล: ตัวเลขที่แต่งขึ้นแล้วดูน่าเชื่อคือความเสี่ยงที่แพงที่สุดในหน้าแบบนี้ —
 * ลูกค้าที่ตรวจเจอครั้งเดียวจะไม่เชื่อตัวเลขอื่นบนเว็บอีกเลย
 *
 * ตัวเลขใช้ tabular-nums ผ่าน .stat-figure เตรียมไว้ให้ XP ใส่ count-up ใน Phase 5
 * โดยไม่ต้องกังวลว่าตัวเลขจะเต้นตอนนับ
 */
export function EngineeringStats() {
  const { t } = useLocale()
  const { data: stats } = useAsyncData(getStats)

  const years = yearsOfExperience()
  const shown = (stats ?? [])
    .filter((stat) => !stat._placeholder)
    .map((stat) => (stat.id === 'years' ? { ...stat, value: years } : stat))

  if (shown.length === 0) return null

  return (
    <Section tone="dark" className="blueprint-grid">
      <Heading level={2} eyebrow="BY THE NUMBERS" align="center">
        {t(ui.home.statsTitle)}
      </Heading>

      <dl className="mt-12 grid gap-10 sm:grid-cols-2">
        {shown.map((stat) => (
          <div key={stat.id} className="text-center">
            <dt className="order-2 mt-3 text-sm text-white/60">{t(stat.label)}</dt>
            <dd className="stat-figure text-display font-bold text-white">
              {stat.value}
              {stat.suffix && <span className="text-accent-glow">{stat.suffix}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}
