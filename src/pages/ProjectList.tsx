import { useSearchParams } from 'react-router-dom'
import { Button, EmptyState, Heading, Pagination, Section } from '@/components/ui'
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

/** จุดที่พาสายตากลับมาหลังเปลี่ยนหน้า — บล็อกผลลัพธ์ ไม่ใช่หัวหน้าหรือแถวตัวกรอง */
const RESULTS_ID = 'project-results'

/**
 * จำนวนผลงานต่อหน้า
 *
 * 12 ลงตัวกับตะแกรงทั้งสามขนาด (1 / 2 / 3 คอลัมน์) แถวสุดท้ายจึงไม่มีช่องโหว่
 * น้อยกว่าหน้าสินค้าที่ใช้ 24 เพราะการ์ดผลงานสูงกว่าการ์ดสินค้าเกือบเท่าตัว
 */
const PAGE_SIZE = 12

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

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  /*
    บีบเลขหน้าให้อยู่ในช่วงที่มีจริง — คนที่อยู่หน้า 3 แล้วกดกรองจนเหลือของหน้าเดียว
    ต้องเห็นของ ไม่ใช่เห็นตะแกรงว่างโดยไม่รู้ว่าเกิดอะไรขึ้น
  */
  const page = Math.min(Math.max(Number(params.get('page')) || 1, 1), totalPages)
  const from = (page - 1) * PAGE_SIZE
  const visible = filtered.slice(from, from + PAGE_SIZE)

  function setParam(key: string, value?: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    // เปลี่ยนตัวกรองแล้วต้องกลับไปหน้าแรก ไม่งั้นผลลัพธ์ชุดใหม่จะเปิดค้างกลางเล่ม
    if (key !== 'page') next.delete('page')
    setParams(next, { replace: true })
  }

  function setIndustry(slug?: string) {
    setParam('industry', slug)
  }

  /**
   * เปลี่ยนหน้าแล้วพากลับขึ้นไปที่หัวรายการ ไม่ปล่อยให้ค้างอยู่ท้ายหน้าเดิม
   *
   * ไม่ระบุ behavior โดยตั้งใจ ให้ตกไปใช้ `scroll-behavior` ของ CSS ซึ่งสลับเป็น auto
   * ให้เองเมื่อผู้ใช้เปิด prefers-reduced-motion — เหตุผลเดียวกับหน้าสินค้า
   */
  function goToPage(value: number) {
    setParam('page', value > 1 ? String(value) : undefined)
    document.getElementById(RESULTS_ID)?.scrollIntoView()
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
          <div id={RESULTS_ID} className={cn(available.length > 1 && 'mt-8')}>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((project) => (
                <li key={project.slug}>
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>

            {/*
              ข้อความบอกตำแหน่งอยู่ซ้าย ปุ่มเปลี่ยนหน้าอยู่ขวา — วางแบบเดียวกับหน้าสินค้า
              ทั้งเว็บจึงมีจังหวะเดียวกัน ไม่ต้องเรียนรู้ใหม่ทีละหน้า
            */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
                <p className="text-ink-muted text-sm">
                  {t(ui.projects.showingRange)
                    .replace('{from}', String(from + 1))
                    .replace('{to}', String(from + visible.length))
                    .replace('{total}', String(total))}
                </p>
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onChange={goToPage}
                  label={t(ui.pagination.label)}
                  previousLabel={t(ui.pagination.previous)}
                  nextLabel={t(ui.pagination.next)}
                  pageLabel={t(ui.pagination.page)}
                  className="ml-auto"
                />
              </div>
            )}
          </div>
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
