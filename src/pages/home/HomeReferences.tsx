import { Button, Heading, Reveal, Section } from '@/components/ui'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getFeaturedReferenceCompanies, ui } from '@/data'
import { cn } from '@/utils/cn'

/**
 * Our References — Home section 7
 *
 * โลโก้ลูกค้า 12 รายที่ถูกทำเครื่องหมาย featured ไว้ — spec กำหนดให้แสดง 8–12 ราย
 * บนหน้าแรก แล้วให้กด View all ไปดูครบ 35 ราย
 *
 * ใช้ block เดียวกับหน้า Reference ทุกอย่าง รวมถึงแสดงสีเต็มตั้งแต่แรก
 * เพื่อให้ผนังโลโก้ทั้งสามที่บนเว็บ (Home references, Brand partners, หน้า Reference)
 * เป็นระบบเดียวกัน
 */
export function HomeReferences() {
  const { t } = useLocale()
  const { data: companies } = useAsyncData(() => getFeaturedReferenceCompanies(12))

  if (!companies?.length) return null

  return (
    <Section tone="alt">
      {/* items-start กัน flex-col ยืดปุ่มให้เต็มความกว้างบนจอแคบ */}
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <Heading level={2} eyebrow="OUR REFERENCES">
            {t(ui.home.referencesTitle)}
          </Heading>
          <p className="text-ink-muted mt-4">{t(ui.home.referencesLead)}</p>
        </div>
        <Button to="/reference" variant="outline" withArrow className="shrink-0">
          {t(ui.actions.viewAllReferences)}
        </Button>
      </div>

      <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {companies.map((item, index) => (
          <li key={item.id}>
            <Reveal delay={index * 40}>
              <div
                className={cn(
                  'group border-line bg-surface rounded-card flex aspect-3/2 items-center justify-center border p-4',
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
                  className="h-full w-full object-contain transition-transform duration-(--duration-ui) ease-(--ease-out-expo) group-hover:scale-105 motion-reduce:transform-none"
                />
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}
