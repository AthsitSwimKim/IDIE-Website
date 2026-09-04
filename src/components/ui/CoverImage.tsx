import { useState } from 'react'
import type { ImageAsset } from '@/types/content'
import { ImageLightbox } from '@/components/ui/ImageLightbox'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import { useLocale } from '@/hooks/useLocale'
import { ui } from '@/data'
import { cn } from '@/utils/cn'

export interface CoverImageProps {
  /** ไม่มี = ยังไม่ได้รับภาพจาก IDIE จะแสดง ImagePlaceholder แทน */
  image?: ImageAsset
  /** ชื่อสิ่งที่ภาพนี้เป็นภาพของ — ใช้ทั้งใน placeholder และในชื่อปุ่มเปิดผังขนาดเต็ม */
  label: string
  /** ขนาดที่ขอจากลูกค้า แสดงใน placeholder */
  fallbackSize?: string
  className?: string
}

/**
 * ภาพปกของบริการ — ใช้ร่วมกันทั้งหน้ารวมบริการและหน้ารายละเอียดบริการ
 *
 * แยกเป็น component เดียวเพราะสองหน้านั้นเคยเขียนบล็อก `cover ? <img> : <placeholder>`
 * ซ้ำกันคนละชุด พอกติกาการแสดงผลแยกเป็นสองแบบแล้ว การมีสองชุดแปลว่าจะเพี้ยนจากกันแน่นอน
 *
 * **ภาพถ่าย** ครอบเป็น 4:3 ด้วย `object-cover` เพื่อให้บล็อกของทุกบริการสูงเท่ากัน
 * ภาพต้นฉบับที่ IDIE ส่งมามีสัดส่วนต่างกัน (จตุรัส · 16:10) ถ้าปล่อยตามสัดส่วนจริง
 * ความสูงจะไม่เท่ากัน แล้วเว็บจะดูเหมือนแต่ละหน้าถูกทำคนละครั้งโดยคนละคน
 *
 * **ผังระบบ (`kind: 'diagram'`)** ใช้กติกาคนละชุดโดยตั้งใจ เพราะครอบตัดไม่ได้เลย —
 * ป้ายกำกับอยู่ข้างในภาพ ("Media Gateway", "10 Gigabit link", "DVR5100")
 * `object-cover` จะตัดขอบซ้ายขวาทิ้งราวหนึ่งในสามพร้อมป้ายเหล่านั้น และการยัดผังแบน 2:1
 * ลงกรอบ 4:3 ก็ทำให้ผังเล็กจนอ่านไม่ออกอยู่ดี จึงปล่อยตามสัดส่วนจริงบนพื้นขาว
 * (ผังต้นฉบับพื้นขาวอยู่แล้ว ขอบจึงกลืนกับกรอบ) แล้ว**กดเปิดขนาดเต็มได้** —
 * ผังที่อ่านป้ายไม่ออกมีค่าเท่ากับภาพประกอบ ไม่ใช่ข้อมูล
 */
export function CoverImage({ image, label, fallbackSize = '1600 × 1200', className }: CoverImageProps) {
  const { t } = useLocale()
  const [zoomed, setZoomed] = useState(false)

  if (!image) {
    return <ImagePlaceholder label={label} size={fallbackSize} className={className} />
  }

  if (image.kind === 'diagram') {
    return (
      <div className={className}>
        {/*
          เป็น <button> ไม่ใช่ <a> เพราะไม่ได้พาไปที่อื่น แค่เปิดของบนหน้าเดิม
          ตั้งชื่อปุ่มด้วย aria-label แทนการปล่อยให้หยิบ alt มาเป็นชื่อ — alt ของผัง
          เป็นคำบรรยายยาวหลายสิบคำ ถ้าใช้เป็นชื่อปุ่ม ผู้ใช้ screen reader ต้องฟัง
          ทั้งย่อหน้าก่อนจะรู้ว่ากดแล้วเกิดอะไร คำบรรยายเต็มไปเป็นชื่อของหน้าต่างที่เปิดแทน
        */}
        <button
          type="button"
          onClick={() => setZoomed(true)}
          aria-label={t(ui.media.diagramOpen).replace('{name}', label)}
          className="group block w-full cursor-pointer"
        >
          <img
            src={image.src}
            srcSet={image.srcSet}
            alt=""
            width={image.width}
            height={image.height}
            loading="lazy"
            decoding="async"
            /* เส้นขอบจำเป็นจริง — ผังพื้นขาวบนพื้นขาวมองไม่ออกว่าขอบภาพอยู่ไหน */
            className="border-line rounded-card h-auto w-full border bg-white object-contain p-4 transition-shadow duration-(--duration-ui) group-hover:shadow-lift sm:p-6"
          />
        </button>
        <p className="text-ink-muted mt-3 text-sm">{t(ui.media.diagramHint)}</p>

        <ImageLightbox image={zoomed ? image : null} onClose={() => setZoomed(false)} />
      </div>
    )
  }

  return (
    <img
      src={image.src}
      srcSet={image.srcSet}
      alt={t(image.alt)}
      width={image.width}
      height={image.height}
      loading="lazy"
      decoding="async"
      className={cn(
        'border-line rounded-card bg-surface-alt aspect-[4/3] w-full border object-cover',
        className,
      )}
    />
  )
}
