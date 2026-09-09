import { SpinnerIcon } from '@/components/ui/icons'
import { useLocale } from '@/hooks/useLocale'
import { ui } from '@/data'

/**
 * ตัวบอกสถานะระหว่างโหลดโค้ดของหน้าใหม่
 *
 * **วางกลางพื้นที่เนื้อหา ไม่ใช่มุมบนซ้าย** — ระหว่างเปลี่ยนหน้า สายตาผู้ใช้ยังอยู่ตรง
 * จุดที่เพิ่งกด ซึ่งอยู่ตรงไหนก็ได้ของจอ ตัวหมุนที่อยู่กึ่งกลางจึงหาเจอเร็วที่สุด
 * โดยไม่ต้องกวาดหา และความสูงขั้นต่ำเท่าจอ (หักแถบหัวเว็บออก) ทำให้ท้ายหน้าไม่กระโดด
 * ขึ้นมาแทรกกลางจอระหว่างรอ
 *
 * ตัวบอกสถานะอยู่ตรงนี้ ไม่ได้อยู่ที่ปุ่มที่กด — ลองทำแบบให้ปุ่มหมุนเองแล้ววัดจำนวนเฟรมดู
 * ไอคอนไม่เคยถูกวาดสักเฟรม เพราะ React Router เปลี่ยนเส้นทางทันทีที่คลิก หน้าเดิมพร้อมปุ่ม
 * ถูกถอดออกก่อนเบราว์เซอร์วาดรอบถัดไป สิ่งที่ผู้ใช้เห็นจริงคือบล็อกนี้
 *
 * แถบเมนูด้านบนไม่ถูกแตะ — อยู่นอก Suspense boundary จึงค้างอยู่กับที่ระหว่างโหลด
 * ตรงตามที่เจ้าของระบบขอว่าอย่าให้มีตัวหมุนบนแถบเมนู
 */
export function RouteFallback() {
  const { t } = useLocale()

  return (
    // <output> มี role="status" ในตัว โปรแกรมอ่านหน้าจอจึงประกาศข้อความนี้เองเมื่อมันโผล่มา
    <output aria-live="polite" className="grid min-h-[calc(100dvh-4.5625rem)] lg:min-h-[calc(100dvh-5.625rem)] place-items-center px-6">
      <p className="text-ink-muted flex flex-col items-center gap-5 text-sm">
        <SpinnerIcon
          aria-hidden="true"
          strokeWidth={1.75}
          className="text-primary-600 size-16 animate-spin motion-reduce:animate-none"
        />
        {t(ui.states.loading)}
      </p>
    </output>
  )
}
