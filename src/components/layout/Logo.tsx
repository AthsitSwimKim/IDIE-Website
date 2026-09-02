import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

/** ชื่อบริษัทตามที่จดทะเบียน — ใช้รูปแบบนี้ทุกที่ อย่าแก้ให้เป็นแบบอื่น */
export const COMPANY_NAME = 'ID Industrial Engineering Co.,Ltd.'

/** แยกเป็นสองบรรทัดตาม mockup ที่ลูกค้าอนุมัติ */
const WORDMARK_LINE_1 = 'ID INDUSTRIAL'
const WORDMARK_LINE_2 = 'ENGINEERING CO.,LTD.'

type LogoTone = 'light' | 'dark'
type LogoSize = 'sm' | 'md' | 'lg'

const markSize: Record<LogoSize, string> = {
  sm: 'h-8',
  md: 'h-10 sm:h-11',
  lg: 'h-12 sm:h-14',
}

/**
 * ระยะบรรทัด 1.45 ไม่ใช่ 1.25 — ชื่อบริษัทสองบรรทัดที่ชิดกันเกินไปอ่านเป็นก้อนทึบ
 * ตัวพิมพ์ใหญ่ล้วนไม่มีส่วนหางบน-ล่างมาช่วยแยกบรรทัดให้เหมือนตัวพิมพ์เล็ก
 */
const wordmarkSize: Record<LogoSize, string> = {
  sm: 'text-[0.65rem] leading-[1.45]',
  md: 'text-[0.7rem] leading-[1.45] sm:text-xs',
  lg: 'text-sm leading-[1.45]',
}

export interface LogoProps {
  /** dark = วางบนพื้น navy (footer) */
  tone?: LogoTone
  size?: LogoSize
  /** ซ่อน wordmark เหลือแต่ตราสัญลักษณ์ — ใช้บนจอแคบ */
  markOnly?: boolean
  /** ห่อด้วยลิงก์ไปหน้าแรก */
  to?: string
  className?: string
}

/**
 * ตราสัญลักษณ์ + ชื่อบริษัท
 *
 * ไฟล์โลโก้เป็น raster ที่ตัดเงา drop shadow ที่ฝังมาในต้นฉบับออกแล้ว
 * เพราะเงาแบบ raster จะเห็นเป็นขอบเทาเมื่อวางบนพื้น navy ของ footer
 *
 * TODO: ขอไฟล์ vector (SVG/AI) จาก IDIE — ตอนนี้ใช้ PNG/WebP ที่ย่อจากต้นฉบับ 1024px
 * ซึ่งคมพอสำหรับขนาดที่ใช้จริง แต่ vector จะดีกว่าสำหรับงานพิมพ์และจอความละเอียดสูงมาก
 *
 * alt ของภาพเป็นค่าว่างเมื่อมี wordmark เป็นข้อความอยู่ข้าง ๆ เพราะไม่งั้น
 * screen reader จะอ่านชื่อบริษัทซ้ำสองครั้ง
 */
export function Logo({ tone = 'light', size = 'md', markOnly = false, to, className }: LogoProps) {
  const mark = (
    <img
      src="/images/brand/idie-logo-180.webp"
      srcSet="/images/brand/idie-logo-180.webp 1x, /images/brand/idie-logo-360.webp 2x"
      width={180}
      height={121}
      alt={markOnly ? COMPANY_NAME : ''}
      className={cn('w-auto shrink-0', markSize[size])}
      // โลโก้อยู่ต้นหน้าเสมอ จึงไม่ควร lazy — จะทำให้เห็นช่องว่างตอนโหลด
      fetchPriority="high"
      decoding="async"
    />
  )

  const inner = (
    <span className={cn('inline-flex items-center gap-3', className)}>
      {mark}
      {!markOnly && (
        <span
          aria-hidden="true"
          className={cn(
            // whitespace-nowrap กันคำในโลโก้แตกเป็นตัวอักษรต่อบรรทัดถ้าที่ว่างไม่พอ
            // ให้มันล้นออกมาให้เห็นแทน จะได้รู้ตัวว่า layout ผิด ไม่ใช่พังเงียบ ๆ
            'whitespace-nowrap uppercase',
            /*
              สองค่านี้คือสิ่งที่ทำให้ชื่อบริษัทดู "แข็ง" ตอนแรก:

              · `font-semibold` แทน `font-bold` — น้ำหนัก 700 ที่ขนาด 12px ทำให้ช่องว่าง
                ในตัวอักษรตันจนอ่านเป็นแถบดำ 600 ยังหนักแน่นพอสำหรับโลโก้
              · `tracking-[0.06em]` แทน `tracking-tight` — ตัวพิมพ์ใหญ่ล้วนต้องการระยะ
                ห่างตัวอักษร**เป็นบวก**เสมอ ของเดิมเป็นลบ (-0.3px) จึงบีบตัวอักษรเข้าหากัน

              ไม่ต้องระบุฟอนต์เองแล้ว — `--font-sans` วาง Inter ไว้หน้าสุด ชื่อบริษัท
              ซึ่งเป็นละตินล้วนจึงได้ Inter อยู่แล้วเหมือนข้อความอังกฤษที่อื่นทั้งเว็บ
            */
            'font-semibold tracking-[0.06em]',
            wordmarkSize[size],
            // navy-900 เป็นสีเดียวกับตราสัญลักษณ์ ส่วน ink เดิมเกือบดำจนตัดกับโลโก้
            tone === 'dark' ? 'text-white' : 'text-navy-900',
          )}
        >
          <span className="block">{WORDMARK_LINE_1}</span>
          <span className="block">{WORDMARK_LINE_2}</span>
        </span>
      )}
      {!markOnly && <span className="sr-only">{COMPANY_NAME}</span>}
    </span>
  )

  if (to) {
    return (
      // shrink-0 — โลโก้ต้องไม่ถูกบีบเมื่อของอื่นใน header ต้องการที่มากขึ้น
      <Link to={to} className="inline-flex min-h-11 shrink-0 items-center">
        {inner}
      </Link>
    )
  }

  return inner
}
