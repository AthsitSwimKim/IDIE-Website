/*
 * oxlint-disable jsx-a11y/prefer-tag-over-role
 *
 * ปิดกฎนี้เฉพาะไฟล์นี้: ใช้ div + role="dialog" แทน <dialog> native โดยตั้งใจ
 * <dialog showModal> ทำให้เนื้อหาเบื้องหลัง inert ทั้งหมดซึ่งเกินความจำเป็นสำหรับเมนู
 * และคุม transition เข้า-ออกได้ยากกว่า ส่วนพฤติกรรมที่ spec ต้องการ
 * (trap focus, Esc, คืน focus, ล็อค scroll) ถูก implement ครบด้วยมือในไฟล์นี้แล้ว
 */
import { useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { CloseIcon } from '@/components/ui'
import { LocaleSwitch } from '@/components/layout/LocaleSwitch'
import { navItems } from '@/components/layout/nav-items'
import { useLocale } from '@/hooks/useLocale'
import { ui } from '@/data'
import { cn } from '@/utils/cn'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  /** ปุ่มที่เปิดเมนู — ต้องคืน focus กลับไปตอนปิด */
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

/**
 * เมนูมือถือแบบ slide-in
 *
 * จุดที่ acceptance criteria ข้อ keyboard มักตกในโครงการแบบนี้อยู่ตรงนี้ทั้งหมด
 * จึงทำครบ 5 อย่าง: trap focus ภายใน panel, ปิดด้วย Esc, คืน focus ให้ปุ่มเดิม,
 * ล็อค body scroll ไม่ให้หน้าหลังเลื่อน และปิดอัตโนมัติเมื่อเปลี่ยน route
 *
 * ใช้ div + role="dialog" แทน <dialog> native โดยตั้งใจ: <dialog showModal> ทำให้เนื้อหา
 * เบื้องหลัง inert ทั้งหมดซึ่งเกินความจำเป็นสำหรับเมนู และคุม transition เข้า-ออกได้ยากกว่า
 * กฎ jsx-a11y/prefer-tag-over-role จึงถูกปิดเฉพาะไฟล์นี้ใน .oxlintrc.json
 */
export function MobileMenu({ open, onClose, triggerRef }: MobileMenuProps) {
  const { t } = useLocale()
  const panelRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  // ปิดเมื่อเปลี่ยนหน้า — ไม่งั้นกดเมนูแล้วเมนูค้างทับหน้าใหม่
  useEffect(() => {
    if (open) onClose()
    // ตั้งใจ depend เฉพาะ pathname: ต้องการให้ทำงานตอนเปลี่ยน route เท่านั้น
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // ล็อค scroll ของหน้าเบื้องหลัง
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  // Esc ปิด + trap focus ภายใน panel
  useEffect(() => {
    if (!open) return

    const panel = panelRef.current
    panel?.querySelector<HTMLElement>('[data-autofocus]')?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panel) return

      const focusables = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  // คืน focus ให้ปุ่มที่เปิดเมนู หลังปิดแล้วเท่านั้น
  const wasOpen = useRef(false)
  useEffect(() => {
    if (wasOpen.current && !open) triggerRef.current?.focus()
    wasOpen.current = open
  }, [open, triggerRef])

  return (
    <div
      className={cn('fixed inset-0 z-50 xl:hidden', !open && 'pointer-events-none')}
      /**
       * `inert` คือสิ่งที่ทำให้เมนูที่ปิดอยู่ "ไม่มีตัวตน" จริง ๆ
       *
       * เดิมใช้แค่ aria-hidden + pointer-events-none ซึ่งกันได้แค่เมาส์กับ screen reader
       * แต่ panel ยังถูก render อยู่นอกจอ (translate-x-full ไม่ใช่ display:none)
       * ผู้ใช้คีย์บอร์ดจึงกด Tab หลุดเข้าไปในเมนูที่มองไม่เห็นได้ 13 จุด — focus หายไปจากจอ
       * และการมี element ที่โฟกัสได้อยู่ใต้ aria-hidden ยังผิดกติกา ARIA ตรง ๆ
       * (screen reader ถูกสั่งให้ข้าม แต่ focus ไปหยุดตรงนั้นได้ = ประกาศว่าง)
       *
       * ต้องเป็น `inert` ไม่ใช่ display:none เพราะยังต้องการ transition ตอนเลื่อนเข้า-ออก
       */
      inert={!open}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={t(ui.labels.closeMenu)}
        onClick={onClose}
        className={cn(
          'bg-navy-950/50 absolute inset-0 w-full transition-opacity duration-(--duration-ui)',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t(ui.labels.menu)}
        className={cn(
          'bg-surface absolute inset-y-0 right-0 flex w-[min(20rem,88vw)] flex-col shadow-float',
          'transition-transform duration-(--duration-ui) ease-(--ease-out-expo)',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="border-line flex items-center justify-between border-b px-5 py-3">
          <LocaleSwitch />
          <button
            type="button"
            data-autofocus
            onClick={onClose}
            className="text-ink-muted hover:text-ink inline-flex size-11 items-center justify-center"
          >
            <CloseIcon className="size-5" aria-hidden="true" />
            <span className="sr-only">{t(ui.labels.closeMenu)}</span>
          </button>
        </div>

        <nav aria-label={t(ui.labels.menu)} className="flex-1 overflow-y-auto px-5 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-12 items-center rounded px-3 font-medium',
                      isActive ? 'bg-primary-50 text-primary-700' : 'text-ink hover:bg-surface-alt',
                    )
                  }
                >
                  {t(item.label)}
                </NavLink>

                {item.children && (
                  <ul className="border-line mt-1 ml-3 space-y-1 border-l pl-3">
                    {item.children
                      .filter((child) => child.to !== item.to)
                      .map((child) => (
                        <li key={child.to}>
                          <NavLink
                            to={child.to}
                            className={({ isActive }) =>
                              cn(
                                'flex min-h-11 items-center rounded px-3 text-sm',
                                isActive
                                  ? 'text-primary-700 font-medium'
                                  : 'text-ink-muted hover:text-ink',
                              )
                            }
                          >
                            {t(child.label)}
                          </NavLink>
                        </li>
                      ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
