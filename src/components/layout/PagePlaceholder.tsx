import { Badge, Heading, Section } from '@/components/ui'
import { Seo } from '@/components/layout/Seo'
import { useLocale } from '@/hooks/useLocale'
import { ui } from '@/data'
import type { LocalizedText } from '@/types/content'

export interface PagePlaceholderProps {
  eyebrow: string
  title: LocalizedText
  intro: LocalizedText
  /** section ที่หน้านี้ต้องมีตาม page spec — ใช้เป็น checklist ตอนสร้างจริง */
  plannedSections: string[]
  phase: string
}

/**
 * หน้า placeholder สำหรับ Phase 1
 *
 * ไม่ได้แค่เขียนว่า "Coming soon" แต่แสดง section ที่หน้านี้ต้องมีตาม page spec
 * เพื่อให้ผู้ใช้ตรวจ scope ได้ตั้งแต่ตอนที่ยังไม่มีเนื้อหา และให้คนที่มาสร้างหน้าจริง
 * ใน Phase 3–4 เห็น checklist อยู่ตรงหน้าโดยไม่ต้องเปิดเอกสาร
 */
export function PagePlaceholder({
  eyebrow,
  title,
  intro,
  plannedSections,
  phase,
}: PagePlaceholderProps) {
  const { t } = useLocale()

  return (
    <>
      <Seo title={title} description={intro} />
      <Section tone="alt" spacing="lg">
        <Heading level={1} eyebrow={eyebrow}>
          {t(title)}
        </Heading>
        <p className="text-ink-muted mt-4 max-w-prose">{t(intro)}</p>
      </Section>

      <Section>
        <div className="flex items-center gap-3">
          <Heading level={2}>{t(ui.pages.outlineHeading)}</Heading>
          <Badge tone="brand">{phase}</Badge>
        </div>
        <ol className="border-line mt-6 max-w-2xl divide-y border-t border-b">
          {plannedSections.map((section, index) => (
            <li key={section} className="flex items-baseline gap-4 py-3">
              <span className="stat-figure text-ink-muted w-6 text-sm">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>{section}</span>
            </li>
          ))}
        </ol>
      </Section>
    </>
  )
}
