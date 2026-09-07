import { Suspense, useCallback, useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Button, Container } from '@/components/ui'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { RouteFallback } from '@/components/layout/RouteFallback'
import { auth } from '@/admin/api'
import type { AdminUser } from '@/types/admin'
import { cn } from '@/utils/cn'

/**
 * โครงของหลังบ้าน — ยามเฝ้าประตูและเมนู
 *
 * **ไม่ใช้ Header/Footer ของหน้าเว็บสาธารณะโดยตั้งใจ** — หลังบ้านเป็นเครื่องมือทำงาน
 * ไม่ใช่หน้าขายของ เมนูสินค้า ปุ่มสลับภาษา และท้ายหน้าที่มีที่อยู่บริษัท
 * ไม่ได้ช่วยคนที่กำลังลงข่าว มีแต่กินพื้นที่และทำให้กดผิด
 *
 * **ข้อความในหลังบ้านเป็นภาษาไทยอย่างเดียว** ต่างจากกติกาของหน้าเว็บสาธารณะ
 * ที่ต้องมี th/en ครบทุกคำ เพราะผู้ใช้หลังบ้านคือทีมงาน IDIE ที่ใช้ภาษาไทย
 * การทำสองภาษาให้เครื่องมือภายในคือการเพิ่มงานแปลเท่าตัวโดยไม่มีใครได้ใช้
 * (เนื้อหาที่**กรอก**ยังต้องครบสองภาษาเหมือนเดิม — นั่นคือของที่ขึ้นหน้าเว็บจริง)
 */

const NAV = [
  { to: '/admin/news', label: 'ข่าวสาร' },
  { to: '/admin/projects', label: 'ผลงาน' },
  { to: '/admin/site-references', label: 'อ้างอิงหน้างาน' },
]

export default function AdminShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [checking, setChecking] = useState(true)

  /**
   * ถามเซิร์ฟเวอร์ว่ายังล็อกอินอยู่ไหมทุกครั้งที่เปลี่ยนหน้า
   *
   * ไม่เชื่อค่าที่เก็บไว้ฝั่งเบราว์เซอร์ เพราะเซสชันหมดอายุได้ระหว่างที่แท็บเปิดค้างไว้
   * และสิ่งที่แย่กว่าการถูกเด้งออก คือกรอกข่าวยาว ๆ เสร็จแล้วกดบันทึกไม่ได้
   */
  useEffect(() => {
    let cancelled = false
    auth
      .me()
      .then((found) => {
        if (cancelled) return
        setUser(found)
        if (!found) {
          // ส่ง path ปัจจุบันไปด้วย เพื่อพากลับมาที่เดิมหลังล็อกอินสำเร็จ
          navigate(`/admin/login?next=${encodeURIComponent(location.pathname)}`, { replace: true })
        }
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setChecking(false)
      })
    return () => {
      cancelled = true
    }
  }, [location.pathname, navigate])

  const handleLogout = useCallback(async () => {
    await auth.logout().catch(() => undefined)
    navigate('/admin/login', { replace: true })
  }, [navigate])

  if (checking) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <p className="text-ink-muted text-sm">กำลังตรวจสิทธิ์…</p>
      </div>
    )
  }

  // ระหว่างรอ navigate ไปหน้า login ทำงาน — อย่าวาดเนื้อหาหลังบ้านออกมาแม้แวบเดียว
  if (!user) return null

  return (
    <div className="bg-surface-alt flex min-h-dvh flex-col">
      <header className="border-line bg-surface sticky top-0 z-40 border-b">
        <Container>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 py-3">
            <p className="text-eyebrow text-primary-600 uppercase">IDIE Administrator</p>

            <nav aria-label="เมนูหลังบ้าน" className="flex gap-1">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-pill inline-flex min-h-11 items-center px-4 text-sm font-medium',
                      'transition-colors duration-(--duration-ui)',
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-ink-muted hover:bg-surface-alt hover:text-ink',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-3">
              <span className="text-ink-muted text-sm">{user.displayName}</span>
              <Button variant="ghost" size="sm" onClick={() => void handleLogout()}>
                ออกจากระบบ
              </Button>
            </div>
          </div>
        </Container>
      </header>

      <main className="flex-1 py-8">
        <Container>
          {/* key=pathname — error ในหน้าหนึ่งต้องไม่ค้างไปทุกหน้าถัดไป */}
          <ErrorBoundary key={location.pathname} fallback={<AdminErrorFallback />}>
            <Suspense fallback={<RouteFallback />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </Container>
      </main>
    </div>
  )
}

function AdminErrorFallback() {
  return (
    <div className="border-line bg-surface rounded-card border p-8">
      <h1 className="text-h3 font-semibold">หน้านี้มีปัญหา</h1>
      <p className="text-ink-muted mt-2 text-sm">
        ลองโหลดหน้าใหม่อีกครั้ง ถ้ายังไม่หายให้ดูข้อความใน console ของเบราว์เซอร์
        และ log ของเซิร์ฟเวอร์ประกอบกัน
      </p>
    </div>
  )
}
