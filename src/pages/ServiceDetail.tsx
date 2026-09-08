import { useParams } from 'react-router-dom'
import { Badge, Button, CoverImage, Heading, KeepPhrases, Section } from '@/components/ui'
import { CheckIcon } from '@/components/ui/icons'
import { Seo } from '@/components/layout/Seo'
import NotFound from '@/pages/NotFound'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getServiceBySlug, serviceDepth, ui } from '@/data'

/**
 * Service Detail — Phase 4
 *
 * slug ที่ไม่พบใน data layer จะ render NotFound ไม่ใช่ crash หรือหน้าว่าง
 * ตามที่ระบุไว้ใน references/roles/02-frontend-architect.md
 */
export default function ServiceDetail() {
  const { slug } = useParams()
  const { t } = useLocale()
  const { data: service, loading } = useAsyncData(() => getServiceBySlug(slug ?? ''), [slug])

  if (loading) return null
  if (!service) return <NotFound />

  // เนื้อหาเชิงลึกเป็น optional — บริการที่ยังไม่ได้เขียนส่วนนี้จะข้ามสาม section ไปเลย
  // ดีกว่าแสดงหัวข้อที่ไม่มีเนื้อหาอยู่ข้างใน
  const depth = serviceDepth[service.slug]

  return (
    <>
      <Seo title={service.name} description={service.shortDescription} />

      <Section tone="alt" spacing="lg">
        <Heading level={1} eyebrow="SERVICE">
          {t(service.name)}
        </Heading>
        <p className="text-ink-muted mt-4 max-w-prose text-lg">
          <KeepPhrases>{t(service.shortDescription)}</KeepPhrases>
        </p>
        <div className="mt-8">
          <Button to="/services" variant="ghost">
            {t(ui.serviceDetail.backToServices)}
          </Button>
        </div>
      </Section>

      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <Heading level={2}>{t(ui.serviceDetail.overviewHeading)}</Heading>

            {/*
              ย่อหน้าแรกเป็นบทสรุปหนึ่งประโยคจาก `service.overview` ซึ่งใช้เป็น
              meta description ของหน้าด้วย จึงเน้นให้ต่างจากย่อหน้าที่เหลือ
              ส่วนที่ตามมาคือเนื้อหาเต็มจาก `serviceDepth.overviewDetail`
            */}
            {/*
              จัดชิดขอบทั้งสองข้างแบบ **inter-character** ไม่ใช่ค่าเริ่มต้น inter-word

              ภาษาไทยไม่มีช่องว่างระหว่างคำ เบราว์เซอร์จึงยืดได้เฉพาะช่องว่างที่มีอยู่จริง
              ในประโยค บรรทัดที่มีช่องว่างอยู่สองสามจุดต้องรับส่วนต่างทั้งบรรทัดไว้ที่จุด
              เหล่านั้น กลายเป็นหลุมกลางบรรทัด (วัดจากหน้าจริงก่อนแก้: ช่องว่างปกติ 9px
              แต่บางช่องถูกยืดเป็น 42–53px และเครื่องหมาย — ถูกดันไปลอยท้ายบรรทัด)

              `inter-character` กระจายส่วนต่างไปตามช่องระหว่างตัวอักษรทุกตัวแทน ซึ่งเป็น
              วิธีเดียวกับที่ใช้จัดข้อความจีน-ญี่ปุ่น วัดหลังแก้: ช่องว่างกว้างสุดเหลือ 6px

              เบราว์เซอร์ที่ไม่รองรับ (Safari) จะตกกลับไปเป็น inter-word คือได้ขอบขวาตรง
              เหมือนเดิมแต่มีหลุมแบบก่อนแก้ ไม่ได้พังลงไปกว่าที่เป็นอยู่
            */}
            <p className="text-ink mt-5 text-justify text-lg leading-relaxed [text-justify:inter-character]">
              {t(service.overview)}
            </p>

            {/*
              mt-6 (24px) ไม่ใช่ mt-4 — ระยะระหว่างย่อหน้าต้อง**มากกว่าระยะบรรทัด
              ภายในย่อหน้า** ไม่งั้นสายตาแยกไม่ออกว่าย่อหน้าใหม่เริ่มตรงไหน
              ที่นี่บรรทัดสูง 26px ส่วน mt-4 เดิมให้แค่ 16px คือน้อยกว่าระยะบรรทัด
              ทั้งสี่ย่อหน้าจึงอ่านต่อกันเป็นพืดทั้งที่เป็นคนละประเด็น
            */}
            {depth?.overviewDetail.map((paragraph) => (
              <p
                key={paragraph.en}
                className="text-ink-muted mt-6 text-justify leading-relaxed [text-justify:inter-character]"
              >
                {t(paragraph)}
              </p>
            ))}
          </div>
          {/* กติกาการครอบภาพและเหตุผลอยู่ใน CoverImage — ใช้ตัวเดียวกับหน้ารวมบริการ */}
          <CoverImage image={service.cover} label={t(service.name)} />
        </div>
      </Section>

      <Section tone="alt">
        <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
          <div>
            <Heading level={2}>{t(ui.serviceDetail.scopeHeading)}</Heading>
            <ul className="border-line mt-5 divide-y border-t border-b">
              {service.scope.map((item) => (
                <li key={item.en} className="flex gap-3 py-3">
                  <span
                    aria-hidden="true"
                    className="bg-primary-600 mt-2.5 size-1.5 shrink-0 rounded-full"
                  />
                  <span>{t(item)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Heading level={2}>{t(ui.serviceDetail.applicationsHeading)}</Heading>
            <ul className="border-line mt-5 divide-y border-t border-b">
              {service.applications.map((item) => (
                <li key={item.en} className="flex gap-3 py-3">
                  <span
                    aria-hidden="true"
                    className="bg-accent-cyan mt-2.5 size-1.5 shrink-0 rounded-full"
                  />
                  <span>{t(item)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {depth && (
        <>
          <Section>
            <div className="grid gap-10 lg:grid-cols-[2fr_3fr] lg:gap-16">
              <div>
                <Heading level={2}>{t(ui.serviceDetail.processHeading)}</Heading>
                <p className="text-ink-muted mt-4 max-w-prose">
                  {t(ui.serviceDetail.processLead)}
                </p>
              </div>

              {/*
                `<ol>` ไม่ใช่ `<ul>` — ลำดับมีความหมายจริงตรงนี้ (สำรวจก่อนออกแบบ
                ออกแบบก่อนสั่งของ) โปรแกรมอ่านหน้าจอจะบอกผู้ฟังว่า "ข้อ 3 จาก 6"
                ซึ่งเป็นข้อมูลที่หายไปถ้าใช้รายการแบบไม่เรียงลำดับ
              */}
              <ol className="border-line divide-line divide-y border-t border-b">
                {depth.process.map((step, index) => (
                  <li key={step.en} className="flex gap-4 py-4">
                    <span
                      aria-hidden="true"
                      className="stat-figure text-primary-600 w-6 shrink-0 text-sm font-bold"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm">{t(step)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Section>

          <Section tone="alt">
            <div className="grid gap-10 lg:grid-cols-[2fr_3fr] lg:gap-16">
              <div>
                <Heading level={2}>{t(ui.serviceDetail.checklistHeading)}</Heading>
                <p className="text-ink-muted mt-4 max-w-prose">
                  {t(ui.serviceDetail.checklistLead)}
                </p>
                <div className="mt-6">
                  <Button to={`/contact?service=${service.slug}`} variant="outline" size="sm" withArrow>
                    {t(ui.actions.contactInquiry)}
                  </Button>
                </div>
              </div>

              <ul className="grid gap-3 sm:grid-cols-2">
                {depth.quoteChecklist.map((item) => (
                  <li
                    key={item.en}
                    className="border-line bg-surface rounded-card flex gap-3 border p-4 text-sm"
                  >
                    <CheckIcon
                      aria-hidden="true"
                      className="text-primary-600 mt-0.5 size-4 shrink-0"
                    />
                    <span>{t(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          <Section>
            <Heading level={2}>{t(ui.serviceDetail.notesHeading)}</Heading>
            {/* จัดชิดขอบแบบ inter-character เหมือนหมวดภาพรวมงาน — เหตุผลเต็มอยู่ที่นั่น */}
            <p className="text-ink-muted mt-4 max-w-prose text-justify [text-justify:inter-character]">
              {t(ui.serviceDetail.notesLead)}
            </p>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {depth.technicalNotes.map((note) => (
                <article key={note.title.en} className="border-line rounded-card border p-6">
                  <h3 className="font-semibold">{t(note.title)}</h3>
                  <p className="text-ink-muted mt-3 text-justify text-sm leading-relaxed [text-justify:inter-character]">
                    {t(note.body)}
                  </p>
                </article>
              ))}
            </div>
          </Section>
        </>
      )}

      <Section tone="dark" spacing="lg" className="blueprint-grid">
        <div className="max-w-2xl">
          <Heading level={2} eyebrow="NEXT STEP">
            {t(ui.serviceDetail.ctaTitle)}
          </Heading>
          <p className="mt-4 text-white/70">{t(ui.home.contactCtaLead)}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to={`/contact?service=${service.slug}`} variant="onDark" withArrow>
              {t(ui.actions.contactInquiry)}
            </Button>
            <Badge tone="neutral" className="self-center">
              {t(service.name)}
            </Badge>
          </div>
        </div>
      </Section>
    </>
  )
}
