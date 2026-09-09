import type { ImageAsset } from '@/types/content'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import { useLocale } from '@/hooks/useLocale'
import { cn } from '@/utils/cn'

export interface CoverImageProps {
  /** ไม่มี = ยังไม่ได้รับภาพจาก IDIE จะแสดง ImagePlaceholder แทน */
  image?: ImageAsset
  /** ชื่อสิ่งที่ภาพนี้เป็นภาพของ — ใช้ใน placeholder ตอนที่ยังไม่ได้รับภาพจริง */
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
 * (ผังต้นฉบับพื้นขาวอยู่แล้ว ขอบจึงกลืนกับกรอบ)
 *
 * เคยกดเปิดขนาดเต็มได้ ถอดออกตามที่เจ้าของเว็บสั่ง (ก.ย. 2026) — ผังเป็นภาพประกอบ
 * ที่ดูแล้วผ่านไป ไม่ใช่ของที่ต้องเปิดอ่านทีละป้าย ถ้าวันหนึ่งอยากได้กลับมา
 * ใช้ `ImageLightbox` ตัวเดียวกับหน้าสินค้าและหนังสือแต่งตั้งในหน้าเกี่ยวกับเรา
 */
export function CoverImage({ image, label, fallbackSize = '1600 × 1200', className }: CoverImageProps) {
  const { t } = useLocale()

  if (!image) {
    return <ImagePlaceholder label={label} size={fallbackSize} className={className} />
  }

  if (image.kind === 'diagram') {
    return (
      <img
        src={image.src}
        srcSet={image.srcSet}
        alt={t(image.alt)}
        width={image.width}
        height={image.height}
        loading="lazy"
        decoding="async"
        /* เส้นขอบจำเป็นจริง — ผังพื้นขาวบนพื้นขาวมองไม่ออกว่าขอบภาพอยู่ไหน */
        className={cn(
          'border-line rounded-card h-auto w-full border bg-white object-contain p-4 sm:p-6',
          className,
        )}
      />
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
