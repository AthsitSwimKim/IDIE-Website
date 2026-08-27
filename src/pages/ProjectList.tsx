import { useSearchParams } from 'react-router-dom'
import { Button, Heading, PendingContent, Section } from '@/components/ui'
import { ProjectCard } from '@/components/sections/ProjectCard'
import { Seo } from '@/components/layout/Seo'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getIndustries, getProjects, ui } from '@/data'
import { cn } from '@/utils/cn'

/**
 * Projects — Phase 4b
 *
 * ผลงานมาจาก API (`/api/projects`) ที่ทีมงานลงเองผ่านหน้า /admin
 *
 * ตัวกรองอุตสาหกรรม sync กับ URL เหมือนหน้า Products ด้วยเหตุผลเดียวกัน —
 * ฝ่ายวิศวกรรมส่งลิงก์หากันในองค์กร "ดูงานปิโตรเคมีที่เคยทำสิ" ต้องเปิดแล้ว
 * เห็นผลลัพธ์เดียวกัน ไม่ใช่เห็นรายการทั้งหมด
 *
 * **แสดงเฉพาะอุตสาหกรรมที่มีผลงานจริง** ไม่ใช่ทั้ง 8 กลุ่ม — ปุ่มกรองที่กดแล้ว
 * ได้หน้าว่างทุกครั้งทำให้ผู้อ่านคิดว่าเว็บพัง
 */
export default function ProjectList() {
  const { t } = useLocale()
  const [params, setParams] = useSearchParams()
  const industry = params.get('industry') ?? undefined

  const { data: projects, loading } = useAsyncData(getProjects)
  const { data: industries } = useAsyncData(getIndustries)

  const available = (industries ?? []).filter((item) =>
    (projects ?? []).some((project) => project.industry === item.slug),
  )
  const filtered = industry
    ? (projects ?? []).filter((project) => project.industry === industry)
    : (projects ?? [])

  function setIndustry(slug?: string) {
    const next = new URLSearchParams(params)
    if (slug) next.set('industry', slug)
    else next.delete('industry')
    setParams(next, { replace: true })
  }

  return (
    <>
      <Seo title={ui.projects.title} description={ui.projects.lead} />

      <Section tone="alt" spacing="lg">
        <Heading level={1} eyebrow="PROJECTS">
          {t(ui.projects.title)}
        </Heading>
        <p className="text-ink-muted mt-4 max-w-prose">{t(ui.projects.lead)}</p>
      </Section>

      <Section>
        {loading && !projects && <p className="text-ink-muted text-sm">{t(ui.states.loading)}</p>}

        {available.length > 1 && (
          <fieldset className="border-0 p-0">
            <legend className="text-eyebrow text-ink-muted mb-2 uppercase">
              {t(ui.labels.industry)}
            </legend>
            <div className="flex flex-wrap gap-2">
              <Chip active={!industry} onClick={() => setIndustry()}>
                {t(ui.labels.all)}
              </Chip>
              {available.map((item) => (
                <Chip
                  key={item.slug}
                  active={industry === item.slug}
                  onClick={() => setIndustry(item.slug)}
                >
                  {t(item.name)}
                </Chip>
              ))}
            </div>
          </fieldset>
        )}

        {projects && projects.length > 0 && (
          <ul
            className={cn(
              'grid gap-5 sm:grid-cols-2 lg:grid-cols-3',
              available.length > 1 && 'mt-8',
            )}
          >
            {filtered.map((project) => (
              <li key={project.slug}>
                <ProjectCard project={project} />
              </li>
            ))}
          </ul>
        )}

        {projects?.length === 0 && (
          <PendingContent need={t(ui.projects.pendingNeed)}>
            <p className="text-ink-muted text-sm">{t(ui.projects.pendingHeading)}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button to="/reference" variant="outline" size="sm" withArrow>
                {t(ui.projects.seeReference)}
              </Button>
              <Button to="/contact" variant="ghost" size="sm">
                {t(ui.actions.contactInquiry)}
              </Button>
            </div>
          </PendingContent>
        )}
      </Section>
    </>
  )
}

function Chip({
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
