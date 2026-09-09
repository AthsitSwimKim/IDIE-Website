import { useEffect, useState } from 'react'
import { useLocale } from '@/hooks/useLocale'
import { recordVisit, ui } from '@/data'

/**
 * จำนวนหลักอย่างน้อยที่แสดง — เติมศูนย์ข้างหน้าให้ครบ
 *
 * หกหลักรองรับได้ถึงเกือบล้านครั้ง ซึ่งเกินอายุการใช้งานของเว็บรุ่นนี้ไปมาก
 * และเป็นความกว้างคงที่ที่ทำให้ท้ายเว็บไม่ขยับตอนตัวเลขเพิ่มหลัก
 * ถ้าวันหนึ่งเกินหกหลักจริง ๆ ก็แสดงเจ็ดหลักตามจริง —
 * ตัวเลขที่ถูกต้องสำคัญกว่าความกว้างที่คงที่
 */
const MIN_DIGITS = 6

type State = { status: 'loading' } | { status: 'ready'; total: number } | { status: 'failed' }

/**
 * ตัวนับผู้เข้าชมท้ายเว็บ
 *
 * **นับหนึ่งคนต่อหนึ่งวัน ไม่ใช่นับทุกหน้าที่เปิด** — เซิร์ฟเวอร์เป็นคนตัดสินด้วยคุกกี้
 * อายุ 24 ชั่วโมงและความถี่ต่อ IP หน้าเว็บแค่บอกว่า "มีคนเปิดเว็บ" แล้วรับยอดรวมมาแสดง
 * ถ้าตัดสินฝั่งเบราว์เซอร์ ใครก็ปั่นได้ด้วยการรีเฟรชรัว ๆ
 *
 * เรียกครั้งเดียวต่อการเปิดเว็บหนึ่งครั้ง เพราะคอมโพเนนต์นี้อยู่ในท้ายเว็บซึ่ง mount
 * ค้างไว้ตลอด การเปลี่ยนหน้าใน SPA ไม่ได้ mount ใหม่ จึงไม่ยิงซ้ำทุกหน้าที่กด
 *
 * **ล้มแล้วหายไปเงียบ ๆ** — ตัวเลขประชาสัมพันธ์ไม่คุ้มที่จะทำให้ท้ายเว็บมีข้อความ
 * ผิดพลาดสีแดงให้ลูกค้าเห็น ถ้า API ล่ม ส่วนนี้แค่ไม่แสดง ที่อยู่กับเบอร์โทรยังอยู่ครบ
 */
export function VisitorCounter() {
  const { t } = useLocale()
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    void recordVisit().then((total) => {
      if (cancelled) return
      setState(total === null ? { status: 'failed' } : { status: 'ready', total })
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (state.status === 'failed') return null

  const digits =
    state.status === 'ready' ? String(state.total).padStart(MIN_DIGITS, '0').split('') : null

  return (
    <div className="mt-8">
      <p className="text-eyebrow text-white/45 uppercase">{t(ui.footer.visitorsHeading)}</p>

      {/*
        ช่องตัวเลขเป็น aria-hidden แล้วบอกค่าจริงด้วยข้อความสำหรับโปรแกรมอ่านหน้าจอ
        แทน — ถ้าปล่อยไว้ โปรแกรมอ่านหน้าจอจะอ่านทีละหลักเป็น "ศูนย์ ศูนย์ ศูนย์
        สี่ สอง" ซึ่งฟังไม่ออกว่าเป็นจำนวนเท่าไร
      */}
      <p aria-hidden="true" className="mt-3 flex gap-1.5">
        {(digits ?? Array.from({ length: MIN_DIGITS })).map((digit, index) => (
          <span
            key={index}
            className={
              'stat-figure grid h-9 w-7 place-items-center rounded border border-white/15 ' +
              'bg-white/5 text-base font-semibold text-white tabular-nums'
            }
          >
            {/* ระหว่างรอคำตอบ ใส่ช่องว่างไว้ก่อน ช่องจึงกว้างเท่าเดิมและท้ายเว็บไม่ขยับ */}
            {digit ?? ' '}
          </span>
        ))}
      </p>

      {state.status === 'ready' && (
        <span className="sr-only">
          {t(ui.footer.visitorsHeading)} {state.total.toLocaleString('th-TH')}
        </span>
      )}
    </div>
  )
}
