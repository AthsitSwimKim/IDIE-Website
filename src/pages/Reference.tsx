import { useState } from 'react'
import { Heading, Section } from '@/components/ui'
import { Seo } from '@/components/layout/Seo'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getReferenceCompanies, getReferenceIndustries, ui } from '@/data'
import type { IndustrySlug } from '@/types/content'
import { cn } from '@/utils/cn'

/**
 * Phase 1: logo grid จริง 35 ราย + filter ตามอุตสาหกรรม
 *
 * หน้านี้แสดงว่า "ลูกค้าคือใคร" เท่านั้น ไม่มีรายละเอียดงาน —
 * รายละเอียดงานอยู่ที่ /projects การแยกสองอย่างนี้คือสิ่งที่ลูกค้าระบุว่าอยากแก้จากเว็บเดิม
 *
 * ปุ่มกรองแสดงเฉพาะอุตสาหกรรมที่มีลูกค้าจริง (ดู getReferenceIndustries)
 */
export default function Reference() {
  const { t } = useLocale()
  const [industry, setIndustry] = useState<IndustrySlug | 'all'>('all')

  const { data: companies } = useAsyncData(
    () => getReferenceCompanies(industry === 'all' ? undefined : industry),
    [industry],
  )
  /**
   * ใช้ getReferenceIndustries() ไม่ใช่ getIndustries() — แสดงเฉพาะกลุ่มที่มีลูกค้าจริง
   * ปุ่มกรองที่กดแล้วไม่มีอะไรเลยแย่กว่าการไม่มีปุ่มนั้นตั้งแต่แรก
   */
  const { data: industries } = useAsyncData(getReferenceIndustries)

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
        <fieldset className="flex flex-wrap gap-2 border-0 p-0">
          <legend className="sr-only">{t(ui.labels.category)}</legend>
          <FilterChip active={industry === 'all'} onClick={() => setIndustry('all')}>
            {t(ui.labels.all)}
          </FilterChip>
          {industries?.map((item) => (
            <FilterChip
              key={item.slug}
              active={industry === item.slug}
              onClick={() => setIndustry(item.slug)}
            >
              {t(item.name)}
            </FilterChip>
          ))}
        </fieldset>

        {companies && companies.length === 0 ? (
          <p className="text-ink-muted mt-10">{t(ui.states.empty)}</p>
        ) : (
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-pill min-h-11 border px-4 text-sm font-medium',
        'transition-colors duration-(--duration-ui)',
        active
          ? 'border-primary-600 bg-primary-600 text-white'
          : 'border-line text-ink-muted hover:border-primary-200 hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}
