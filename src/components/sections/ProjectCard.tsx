import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getIndustries } from '@/data'
import type { Project } from '@/types/content'

/**
 * การ์ดผลงาน — ใช้ทั้งหน้า /projects และหัวข้อผลงานบนหน้าแรก
 *
 * แสดง **ลูกค้า + อุตสาหกรรม** เด่นกว่าชื่อโครงการ เพราะสิ่งที่ผู้อ่านมองหาคือ
 * "เคยทำให้โรงงานแบบเดียวกับของฉันไหม" ไม่ใช่ชื่อเรียกภายในของงาน
 */
export function ProjectCard({ project }: { project: Project }) {
  const { t } = useLocale()
  const { data: industries } = useAsyncData(getIndustries)
  const industry = industries?.find((item) => item.slug === project.industry)

  return (
    <Link
      to={`/projects/${project.slug}`}
      className="group border-line bg-surface rounded-card hover:shadow-lift hover:border-primary-200 flex h-full flex-col overflow-hidden border transition-[box-shadow,border-color] duration-(--duration-ui)"
    >
      <span className="bg-surface-alt block aspect-[3/2] overflow-hidden">
        <img
          src={project.cover.src}
          srcSet={project.cover.srcSet}
          alt={t(project.cover.alt)}
          width={project.cover.width}
          height={project.cover.height}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-(--duration-ui) ease-(--ease-out-expo) group-hover:scale-105 motion-reduce:transform-none"
        />
      </span>

      <span className="flex flex-1 flex-col p-5">
        <span className="flex flex-wrap items-center gap-2">
          {industry && <Badge tone="brand">{t(industry.name)}</Badge>}
          {project.year && <span className="text-ink-muted text-xs">{project.year}</span>}
        </span>

        {/*
          18px ไม่ใช่ 20px — ค่าที่เจ้าของงานกำหนดเฉพาะการ์ดข่าวกับการ์ดผลงาน
          เขียนเป็น text-base ตรง ๆ ไม่ผูกกับ token --text-h3 เพราะนี่ไม่ใช่หัวข้อจริง
          เป็น <span> ในลิงก์ ถ้าผูกกับ token หัวข้อ วันที่แก้สเกลหัวข้อทั้งเว็บ
          ขนาดในตารางข่าว/ผลงานจะขยับตามไปด้วยโดยไม่ตั้งใจ

          ไม่บังคับ leading-snug แบบการ์ดสินค้า — หัวข้อที่นี่เป็นภาษาไทยซึ่งมีสระบน
          กับวรรณยุกต์ซ้อนได้สองชั้น กฎ :lang(th) ใน theme.css ที่ให้ระยะบรรทัด 1.75
          จึงเป็นค่าที่ถูกต้องแล้วสำหรับที่นี่
        */}
        <span className="group-hover:text-primary-600 mt-3 text-base font-semibold">
          {t(project.name)}
        </span>
        {/* ชื่อลูกค้าเป็น 16px อยู่แล้วก่อนแก้ ส่วนบรรทัดสถานที่ไม่ได้ระบุขนาดจึงตกไปใช้ 18px */}
        <span className="text-ink-muted mt-1 text-sm">{t(project.client)}</span>
        <span className="text-ink-muted mt-2 line-clamp-2 flex-1 text-sm">
          {t(project.location)}
        </span>
      </span>
    </Link>
  )
}
