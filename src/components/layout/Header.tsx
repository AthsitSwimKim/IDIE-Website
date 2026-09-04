import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronDown, Container, MenuIcon } from '@/components/ui'
import { Logo } from '@/components/layout/Logo'
import { LocaleSwitch } from '@/components/layout/LocaleSwitch'
import { MobileMenu } from '@/components/layout/MobileMenu'
import { navItems, type NavItem } from '@/components/layout/nav-items'
import { useLocale } from '@/hooks/useLocale'
import { ui } from '@/data'
import { cn } from '@/utils/cn'

/**
 * Header หลักของเว็บ
 *
 * **พื้นขาวทึบเสมอ ไม่โปร่งใสทับ hero** — ยึดตาม mockup ที่ลูกค้าอนุมัติ
 * (`assets/idie-mockup-reference.png`) ซึ่งเป็นแถบขาววางเหนือ hero ไม่ใช่ overlay
 *
 * มีเหตุผลเชิงเทคนิคสนับสนุนด้วย: header เป็น sticky ซึ่งยังกินที่ใน flow ปกติ
 * โหมดโปร่งใสจึงไม่ได้เห็น hero ทะลุขึ้นมา แต่เห็นพื้นขาวของ body แทน
 * แล้วตัวอักษรสีขาวที่คู่กับโหมดนั้นจะหายไปทั้งแถบ
 * ถ้าอนาคตต้องการ overlay จริง ต้องเปลี่ยนเป็น fixed แล้วชดเชย padding ให้ <main>
 *
 * ที่เหลือไว้จาก spec คือการยกเงาเมื่อ scroll — ใช้ IntersectionObserver บน sentinel
 * ไม่ใช่ scroll listener เพราะ scroll listener ยิงทุกเฟรมและทำให้ scroll หนืด
 */
export function Header() {
  const { t } = useLocale()
  const [atTop, setAtTop] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    // sentinel วางไว้ที่ระยะ 80px จากยอดเอกสาร: ตราบใดที่ยังเห็นมันอยู่ในจอ
    // แปลว่ายังไม่ได้เลื่อนพ้น hero — พอเลื่อนเกิน 80px มันจะหลุดจอแล้ว header เปลี่ยนเป็นทึบ
    const observer = new IntersectionObserver(([entry]) => setAtTop(entry.isIntersecting))
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="absolute top-20 left-0 h-px w-px" />

      <header
        className={cn(
          'border-line bg-surface/95 sticky top-0 z-40 border-b backdrop-blur',
          'transition-shadow duration-(--duration-ui)',
          atTop ? 'shadow-none' : 'shadow-card',
        )}
      >
        <Container>
          <div className="flex items-center justify-between gap-6 py-3">
            <Logo to="/" />

            {/*
              เมนูเดสก์ท็อปเริ่มที่ xl (1280) ไม่ใช่ lg (1024)
              เมนู 8 รายการเป็นภาษาไทยกินความกว้าง 634px พอรวมกับโลโก้ (224px
              หลังปรับระยะตัวอักษรของชื่อบริษัทให้เป็นบวก เดิม 205px)
              ปุ่มสลับภาษา (90px) และ gap อีก 48px = ต้องการ 996px
              แต่ที่ lg มีให้จริงแค่ 913px โลโก้จึงถูกบีบจนคำว่า ID INDUSTRIAL ENGINEERING
              เรียงลงมาทีละตัวอักษร — ช่วง 1024–1279 ใช้เมนูแบบมือถือแทนซึ่งทำงานครบอยู่แล้ว

              (บีบ px ของลิงก์จาก 3 เหลือ 2 แล้วเมนูแคบลงจาก 698 เหลือ 634px
              แต่ยังไม่พอจะย้ายมา lg — ขาดอีก 65px ถ้าจะย้ายจริงต้องลดจำนวนเมนู
              หรือย่อข้อความ ไม่ใช่บีบ padding ต่อ)
            */}
            <nav aria-label={t(ui.labels.menu)} className="hidden xl:block">
              <ul className="flex items-center gap-1">
                {navItems.map((item) => (
                  <DesktopNavItem key={item.to} item={item} />
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-1">
              <div className="hidden xl:block">
                <LocaleSwitch />
              </div>

              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-expanded={menuOpen}
                aria-haspopup="dialog"
                className="text-ink inline-flex size-11 items-center justify-center xl:hidden"
              >
                <MenuIcon className="size-6" aria-hidden="true" />
                <span className="sr-only">{t(ui.labels.menu)}</span>
              </button>
            </div>
          </div>
        </Container>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        triggerRef={menuButtonRef}
      />
    </>
  )
}

/**
 * เมนูเดี่ยวหรือเมนูที่มี dropdown
 *
 * dropdown เปิดด้วย hover สำหรับเมาส์ และด้วย focus สำหรับคีย์บอร์ด —
 * ไม่ใช้ปุ่มกดเปิด เพราะหัวข้อหลักเองก็เป็นลิงก์ที่ต้องกดไปได้
 * (Reference ต้องพาไป /reference ได้ ไม่ใช่เป็นแค่ตัวเปิดเมนูย่อย)
 */
function DesktopNavItem({ item }: { item: NavItem }) {
  const { t } = useLocale()
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<number | undefined>(undefined)

  function show() {
    window.clearTimeout(closeTimer.current)
    setOpen(true)
  }

  /** หน่วงสั้น ๆ ก่อนปิด เพื่อให้เมาส์เคลื่อนจากหัวข้อลงไปยังเมนูย่อยได้ทัน */
  function hide() {
    closeTimer.current = window.setTimeout(() => setOpen(false), 120)
  }

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  /**
   * `px-2` ไม่ใช่ `px-3` — ช่องไฟระหว่างคำในเมนูมาจาก padding ของลิงก์เป็นหลัก
   * ไม่ใช่ `gap` ของ `<ul>` (ซึ่งมีแค่ 4px) เดิม px-3 ให้ระยะระหว่างคำ 28px
   * ซึ่งอ่านเป็นเมนูที่กระจายตัวเกินไปสำหรับ 8 รายการภาษาไทย ตอนนี้เหลือ 20px
   *
   * **ต่ำกว่านี้ไม่ควรลด** — padding ตัวนี้คือพื้นที่กดของลิงก์ในแนวนอน
   * (แนวตั้งคุมด้วย min-h-11 อยู่แล้ว) และเป็นขอบของแถบ hover/active ด้วย
   * ถ้าบีบจนชิดตัวอักษร แถบ active จะดูเหมือนขีดเส้นใต้คำแทนที่จะเป็นปุ่ม
   */
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'inline-flex min-h-11 items-center gap-1 px-2 text-sm font-medium whitespace-nowrap',
      'border-b-2 transition-colors duration-(--duration-ui)',
      isActive
        ? 'border-primary-600 text-primary-600'
        : 'border-transparent text-ink-muted hover:text-ink',
    )

  if (!item.children) {
    return (
      <li>
        <NavLink to={item.to} end={item.end} className={linkClass}>
          {t(item.label)}
        </NavLink>
      </li>
    )
  }

  return (
    <li>
      {/*
        ตัว handler อยู่บน <div> ไม่ใช่ <li> เพราะ li มี role เป็น listitem
        การผูก mouse/focus handler กับ element ที่ไม่ใช่ตัวโต้ตอบทำให้ screen reader
        สื่อความหมายผิด — div ไม่มี role จึงเป็นที่วางที่ถูกต้อง
      */}
      <div
        className="relative"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        <NavLink to={item.to} end={item.end} className={linkClass}>
          {t(item.label)}
          <ChevronDown
            className={cn('size-3.5 transition-transform', open && 'rotate-180')}
            aria-hidden="true"
          />
        </NavLink>

        <ul
          className={cn(
            'border-line bg-surface shadow-lift absolute top-full left-0 min-w-52 rounded border py-2',
            'transition-[opacity,transform] duration-(--duration-ui) ease-(--ease-out-expo)',
            open ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0',
          )}
        >
          {item.children.map((child) => (
            <li key={child.to}>
              <NavLink
                to={child.to}
                end={child.end}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-11 items-center px-4 text-sm',
                    isActive
                      ? 'text-primary-700 bg-primary-50 font-medium'
                      : 'text-ink-muted hover:bg-surface-alt hover:text-ink',
                  )
                }
              >
                {t(child.label)}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </li>
  )
}
