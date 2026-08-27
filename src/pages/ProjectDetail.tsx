import { useParams } from 'react-router-dom'
import { Badge, Button, Heading, Section } from '@/components/ui'
import { ProjectCard } from '@/components/sections/ProjectCard'
import { Seo } from '@/components/layout/Seo'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getIndustries, getProjectBySlug, getProjects, ui } from '@/data'
import NotFound from '@/pages/NotFound'

/**
 * Project Detail — Phase 4b
 *
 * โครงหน้าตอบสามคำถามตามลำดับที่ฝ่ายวิศวกรรมถามจริง:
 * งานนี้คือใครที่ไหนเมื่อไร → โจทย์คืออะไร → IDIE แก้ด้วยอะไร
 *
 * ถ้าไม่มีภาพหน้างานสักรูป จะไม่แสดงหัวข้อภาพเปล่า ๆ — ผลงานที่ยังไม่มีภาพ
 * ยังมีค่าในตัวเองจากขอบเขตงานและวิธีแก้ปัญหา
 */
export default function ProjectDetail() {
  const { slug } = useParams()
  const { t } = useLocale()
  const { data: project, loading } = useAsyncData(() => getProjectBySlug(slug ?? ''), [slug])
  const { data: industries } = useAsyncData(getIndustries)
  const { data: all } = useAsyncData(getProjects)

  if (loading) return null
  if (!project) return <NotFound />

  const industry = industries?.find((item) => item.slug === project.industry)

  // ผลงานในอุตสาหกรรมเดียวกันก่อน แล้วค่อยเติมด้วยชิ้นอื่น — คนที่ดูงานปิโตรเคมี
  // มักอยากเห็นงานปิโตรเคมีอีก ไม่ใช่งานเหมืองแร่
  const others = (all ?? []).filter((item) => item.slug !== project.slug)
  const related = [
    ...others.filter((item) => item.industry === project.industry),
    ...others.filter((item) => item.industry !== project.industry),
  ].slice(0, 3)

  const meta = [
    { label: t(ui.projects.clientLabel), value: t(project.client) },
    { label: t(ui.projects.industryLabel), value: industry ? t(industry.name) : project.industry },
    { label: t(ui.projects.locationLabel), value: t(project.location) },
    {
      label: t(ui.projects.yearLabel),
      value: project.year ? String(project.year) : t(ui.projects.yearUnknown),
    },
  ]

  return (
    <>
      <Seo title={project.name} description={project.overview} />

      <Section tone="alt" spacing="lg">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            {industry && <Badge tone="brand">{t(industry.name)}</Badge>}
            <Heading level={1} className="mt-4">
              {t(project.name)}
            </Heading>

            <dl className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {meta.map((item) => (
                <div key={item.label}>
                  <dt className="text-eyebrow text-ink-muted uppercase">{item.label}</dt>
                  <dd className="mt-1 font-medium">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <img
            src={project.cover.src}
            srcSet={project.cover.srcSet}
            alt={t(project.cover.alt)}
            width={project.cover.width}
            height={project.cover.height}
            // ภาพนี้คือ LCP element ของหน้า — ไม่ lazy เพราะอยู่เหนือ fold
            decoding="async"
            className="border-line rounded-card bg-surface aspect-[3/2] w-full border object-cover"
          />
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
          <div>
            <Heading level={2}>{t(ui.projects.overviewHeading)}</Heading>
            <p className="text-ink-muted mt-4 max-w-prose leading-relaxed">
              {t(project.overview)}
            </p>
          </div>
          <div>
            <Heading level={2}>{t(ui.projects.solutionHeading)}</Heading>
            <p className="text-ink-muted mt-4 max-w-prose leading-relaxed">
              {t(project.engineeringSolution)}
            </p>
          </div>
        </div>

        {project.scopeOfWork.length > 0 && (
          <div className="mt-12">
            <h3 className="text-eyebrow text-ink-muted uppercase">
              {t(ui.projects.scopeHeading)}
            </h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {project.scopeOfWork.map((item, index) => (
                <li
                  key={index}
                  className="border-line rounded-card flex gap-3 border p-4 text-sm"
                >
                  <span aria-hidden="true" className="text-primary-600 font-bold">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>{t(item)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      {project.gallery.length > 0 && (
        <Section tone="alt">
          <Heading level={2}>{t(ui.projects.galleryHeading)}</Heading>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {project.gallery.map((image) => (
              <li key={image.src}>
                <img
                  src={image.src}
                  srcSet={image.srcSet}
                  alt={t(image.alt)}
                  width={image.width}
                  height={image.height}
                  loading="lazy"
                  decoding="async"
                  className="border-line rounded-card bg-surface aspect-[3/2] w-full border object-cover"
                />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section spacing="sm">
        <Button to="/projects" variant="outline" size="sm">
          {t(ui.projects.backToList)}
        </Button>
      </Section>

      {related.length > 0 && (
        <Section tone="alt">
          <Heading level={2}>{t(ui.projects.relatedHeading)}</Heading>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug}>
                <ProjectCard project={item} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  )
}
