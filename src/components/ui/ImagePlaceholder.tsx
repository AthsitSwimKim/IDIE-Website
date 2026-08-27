import { useLocale } from '@/hooks/useLocale'
import { ui } from '@/data'
import { cn } from '@/utils/cn'

export interface ImagePlaceholderProps {
  /** อัตราส่วนที่ภาพจริงต้องใช้ เช่น 'aspect-[4/3]' */
  aspect?: string
  /** บอกว่าต้องการภาพอะไร — ใช้เป็นรายการขอจากลูกค้าได้ตรง ๆ */
  label: string
  /** ขนาดที่แนะนำเป็นพิกเซล เช่น '1600×900' */
  size?: string
  className?: string
}

/**
 * กล่องแทนภาพที่ยังไม่ได้รับจาก IDIE
 *
 * ตั้งใจให้ดู "เป็นแบบร่างทางเทคนิค" ไม่ใช่ภาพเสีย — ใช้ blueprint grid กับ corner bracket
 * ที่เป็น motif ของเว็บอยู่แล้ว ทำให้หน้ายังดูตั้งใจแม้ยังไม่มีภาพ
 *
 * ที่สำคัญกว่าความสวย: มันบอกชัดว่าต้องขอภาพอะไรและขนาดเท่าไร ทำให้ทีมและลูกค้า
 * เห็นรายการที่ค้างอยู่บนหน้าเว็บจริง ไม่ต้องเปิดเอกสารตาม
 */
export function ImagePlaceholder({
  aspect = 'aspect-[4/3]',
  label,
  size,
  className,
}: ImagePlaceholderProps) {
  const { t } = useLocale()

  return (
    // ไม่ใส่ role="img" เพราะข้อความข้างในเป็นข้อความจริงที่ทุกคนอ่านได้อยู่แล้ว
    // การครอบด้วย role="img" จะกลบข้อความนั้นแล้วบังคับให้ต้องเขียน aria-label ซ้ำ
    <div
      className={cn(
        'bg-navy-900 blueprint-grid corner-bracket rounded-card relative overflow-hidden',
        aspect,
        className,
      )}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
        <span className="text-eyebrow text-accent-glow uppercase">
          {t(ui.media.awaitingPhoto)}
        </span>
        <span className="text-sm font-medium text-white/80">{label}</span>
        {/* white/40 บนพื้น navy ได้ contrast 3.65 ซึ่งตกเกณฑ์ AA — /60 ได้ 6.7 */}
        {size && <span className="stat-figure text-xs text-white/60">{size}</span>}
      </div>
    </div>
  )
}
