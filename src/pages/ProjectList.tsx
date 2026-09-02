import { useSearchParams } from 'react-router-dom'
import { Button, EmptyState, Heading, Section } from '@/components/ui'
import { AlertCircleIcon, LayersIcon, RefreshIcon } from '@/components/ui/icons'
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
 * สถานะที่ไม่มีรายการให้แสดงแยกเป็นสองแบบ คือโหลดไม่สำเร็จกับยังไม่มีผลงาน
 * ใช้ `EmptyState` ที่เขียนถึงผู้เข้าชมโดยตรง ไม่ใช่ `PendingContent` ที่ประกาศ
 * สถานะภายในของโครงการ — เหตุผลเต็มอยู่ในคอมเมนต์ของ `EmptyState`
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

  const { data: projects, loading, error, reload } = useAsyncData(getProjects)
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

        {/*
          โหลดไม่สำเร็จกับยังไม่มีผลงาน เป็นคนละเรื่องและต้องพูดคนละอย่าง —
          การบอกว่า "กำลังรวบรวมผลงาน" ตอน API ล่มคือการบอกข้อมูลที่ผิดกับผู้เข้าชม
        */}
        {error && (
          <EmptyState
            icon={<AlertCircleIcon aria-hidden="true" className="size-12" strokeWidth={1.5} />}
            title={t(ui.states.loadFailedTitle)}
            body={t(ui.states.loadFailedBody)}
          >
            <Button onClick={reload}>
              <RefreshIcon aria-hidden="true" className="size-4 shrink-0" />
              {t(ui.actions.retry)}
            </Button>
          </EmptyState>
        )}

        {/*
          หน้านี้ใช้ปุ่ม "ดูลูกค้าที่เคยร่วมงาน" แทน "กลับสู่หน้าแรก" ของหน้าข่าว —
          หน้าลูกค้าอ้างอิงคือเนื้อหาที่ใกล้เคียงกับสิ่งที่ผู้อ่านตั้งใจมาดูที่สุด
          ส่วนหน้าแรกคือการพากลับไปเริ่มใหม่
        */}
        {!error && projects?.length === 0 && (
          <EmptyState
            icon={<LayersIcon aria-hidden="true" className="size-12" strokeWidth={1.5} />}
            title={t(ui.projects.emptyTitle)}
            body={t(ui.projects.emptyBody)}
          >
            <Button to="/reference" variant="outline" withArrow>
              {t(ui.projects.seeReference)}
            </Button>
          </EmptyState>
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
