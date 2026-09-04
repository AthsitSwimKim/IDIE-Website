import { Heading, Section } from '@/components/ui'
import { Seo } from '@/components/layout/Seo'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getReferenceCompanies, ui } from '@/data'
import { cn } from '@/utils/cn'

/**
 * logo grid ลูกค้าอ้างอิง
 *
 * หน้านี้แสดงว่า "ลูกค้าคือใคร" เท่านั้น ไม่มีรายละเอียดงาน —
 * รายละเอียดงานอยู่ที่ /projects การแยกสองอย่างนี้คือสิ่งที่ลูกค้าระบุว่าอยากแก้จากเว็บเดิม
 *
 * **ไม่มีตัวกรองอุตสาหกรรม** — หน้านี้เป็นตะแกรงโลโก้ที่กวาดตาทีเดียวก็เห็นครบทั้งหมด
 * การแยกหมวดเพิ่มขั้นตอนให้ผู้อ่านโดยไม่ได้ช่วยอะไร เพราะไม่มีใครมาหน้านี้เพื่อ
 * "ค้นหา" ลูกค้าสักราย แต่มาดูว่าเคยร่วมงานกับใครมาบ้าง
 */
export default function Reference() {
  const { t } = useLocale()
  const { data: companies } = useAsyncData(() => getReferenceCompanies())

  return (
    <>
      <Seo
        title={{ th: 'ลูกค้าอ้างอิง', en: 'Reference' }}
        description={{
          th: 'องค์กรและโรงงานอุตสาหกรรมชั้นนำที่เคยร่วมงานกับ IDIE',
          en: 'Leading companies and industrial partners that have worked with IDIE.',
        }}
      />

      <Section tone="alt" spacing="lg">
        <Heading level={1} eyebrow="REFERENCE">
          {t(ui.pages.referenceTitle)}
        </Heading>
        <p className="text-ink-muted mt-4 max-w-prose">{t(ui.pages.referenceLead)}</p>
      </Section>

      <Section>
        {companies && companies.length === 0 ? (
          <p className="text-ink-muted">{t(ui.states.empty)}</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {companies?.map((item) => (
              <li key={item.id}>
                <div
                  className={cn(
                    'group border-line bg-surface rounded-card flex aspect-3/2 items-center justify-center border p-5',
                    'transition-colors duration-(--duration-ui) hover:border-primary-200',
                  )}
                >
                  <img
                    src={item.logo.src}
                    srcSet={item.logo.srcSet}
                    alt={t(item.logo.alt)}
                    width={item.logo.width}
                    height={item.logo.height}
                    loading="lazy"
                    decoding="async"
                    className={cn(
                      'h-full w-full object-contain',
                      // แสดงสีเต็มตั้งแต่แรกตามที่ลูกค้าเลือก — โลโก้ลูกค้าคือหลักฐาน
                      // ความน่าเชื่อถือ ไม่ควรต้อง hover ก่อนถึงจะเห็นว่าเป็นใคร
                      'transition-transform duration-(--duration-ui) ease-(--ease-out-expo)',
                      'group-hover:scale-105 motion-reduce:transform-none',
                    )}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  )
}
