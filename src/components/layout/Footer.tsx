import { Link } from 'react-router-dom'
import { Container } from '@/components/ui'
import { Logo, COMPANY_NAME } from '@/components/layout/Logo'
import { footerColumns } from '@/components/layout/nav-items'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { companyFax, getCompany, ui } from '@/data'

/**
 * Footer
 *
 * เนื้อหาทั้งหมดมาจาก data layer — ไม่ hardcode ที่อยู่หรือเบอร์โทรลงใน component
 * เพราะข้อมูลติดต่อเป็นสิ่งที่เปลี่ยนแล้วต้องเปลี่ยนทุกที่พร้อมกัน
 *
 * เบอร์โทรและอีเมลทำเป็นลิงก์ tel:/mailto: — บนมือถือคือทางลัดที่ผู้ใช้ B2B
 * ใช้จริงมากกว่าการคัดลอกเบอร์
 */
export function Footer() {
  const { t } = useLocale()
  const { data: company } = useAsyncData(getCompany)

  return (
    <footer className="bg-navy-900 text-white/70" data-tone="dark">
      <Container>
        <div className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo tone="dark" />
            <p className="mt-5 max-w-xs text-sm">{t(ui.footer.tagline)}</p>
          </div>

          {footerColumns.map((column) => (
            <nav key={column.heading.en} aria-label={t(column.heading)}>
              <h2 className="text-eyebrow text-accent-glow uppercase">{t(column.heading)}</h2>
              <ul className="mt-3">
                {column.items.map((item) => (
                  <li key={item.to}>
                    {/*
                      min-w-11 คู่กับ min-h-11 — เดิมมีแต่ความสูง พื้นที่กดจึงกว้างเท่าตัวอักษร
                      ลิงก์ชื่อสั้นอย่าง "สินค้า" เหลือกว้างแค่ 33px ต่ำกว่าเกณฑ์ 44×44
                      ข้อความไทยสั้นกว่าอังกฤษมาก ปัญหานี้จึงโผล่เฉพาะภาษาไทย
                    */}
                    <Link
                      to={item.to}
                      className="inline-flex min-h-11 min-w-11 items-center text-sm transition-colors duration-(--duration-ui) hover:text-white"
                    >
                      {t(item.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="text-eyebrow text-accent-glow uppercase">
              {t(ui.footer.contactHeading)}
            </h2>
            {company && (
              <address className="mt-4 text-sm not-italic">
                <p className="mb-2">{t(company.address)}</p>
                {company.phone.map((number) => (
                  <p key={number}>
                    <a
                      href={`tel:${number.replace(/\s/g, '')}`}
                      className="inline-flex min-h-11 items-center transition-colors duration-(--duration-ui) hover:text-white"
                    >
                      {number}
                    </a>
                  </p>
                ))}
                <p className="py-2 text-white/50">
                  {t(ui.footer.fax)} {companyFax}
                </p>
                {company.email.map((address) => (
                  <p key={address}>
                    <a
                      href={`mailto:${address}`}
                      className="inline-flex min-h-11 items-center break-all transition-colors duration-(--duration-ui) hover:text-white"
                    >
                      {address}
                    </a>
                  </p>
                ))}
              </address>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 py-6 text-xs text-white/50">
          <p>
            © {new Date().getFullYear()} {COMPANY_NAME} · {t(ui.footer.rights)}
          </p>
          <p className="mt-1">{t(ui.footer.prototypeNote)}</p>
        </div>
      </Container>
    </footer>
  )
}
