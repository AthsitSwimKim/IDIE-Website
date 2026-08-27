import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Section } from '@/components/ui'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { RouteFallback } from '@/components/layout/RouteFallback'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { useLocale } from '@/hooks/useLocale'
import { ui } from '@/data'

/**
 * โครงหน้าเว็บ — Header จริง + Footer จริง (Phase 2)
 *
 * Header เป็น sticky และโปร่งใสทับ hero ของหน้าแรก จึงต้องไม่มี padding-top
 * บน <main> — ถ้าใส่ hero จะถูกดันลงและช่องว่างใต้ header จะโผล่เป็นแถบสีขาว
 */
export function Layout() {
  const { t } = useLocale()
  const { pathname } = useLocation()

  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScrollToTop />

      {/*
        ต้องระบุ focus:px-4 focus:py-2 ซ้ำอีกครั้ง — `not-sr-only` รีเซ็ต padding เป็น 0
        และชนะ px-4/py-2 ที่ประกาศไว้แบบไม่มี variant ทำให้ตอนโฟกัสข้อความชนขอบกล่องพอดี
      */}
      <a
        href="#main"
        className="bg-primary-600 sr-only rounded px-4 py-2 text-white focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2"
      >
        {t(ui.actions.skipToContent)}
      </a>

      <Header />

      <main id="main" className="flex-1">
        {/* key=pathname — ไม่งั้น error ครั้งเดียวจะค้างทุกหน้าถัดไป */}
        <ErrorBoundary key={pathname} fallback={<GlobalErrorFallback />}>
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>

      <Footer />
    </div>
  )
}

function GlobalErrorFallback() {
  const { t } = useLocale()
  return (
    <Section tone="alt" spacing="lg">
      <h1 className="text-h2 font-bold">{t(ui.states.errorTitle)}</h1>
      <p className="text-ink-muted mt-3 max-w-prose">{t(ui.states.errorBody)}</p>
    </Section>
  )
}
