import { Link } from 'react-router-dom'
import { Container } from '@/components/ui'
import { Logo, COMPANY_NAME } from '@/components/layout/Logo'
import { footerColumns } from '@/components/layout/nav-items'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { companyFax, getCompany, ui } from '@/data'

/**
 * ลิงก์ในท้ายหน้า — พื้นที่กด 44×44 **เฉพาะอุปกรณ์สัมผัส**
 *
 * เกณฑ์ 44×44 มีไว้สำหรับนิ้วมือ ไม่ใช่เมาส์ ตอนที่บังคับใช้กับทุกอุปกรณ์
 * ลิงก์แต่ละอันสูง 44px โดยที่ตัวอักษรสูงแค่ ~20px ท้ายหน้าจึงดูโหรงเหรง
 * เหมือนเว้นบรรทัดคู่ทั้งที่เป็นรายการต่อเนื่อง
 *
 * `pointer-coarse:` ผูกกับ media query `(pointer: coarse)` ซึ่งเป็นตัวบอกว่า
 * อุปกรณ์ชี้ตำแหน่งหลักหยาบ (นิ้ว) หรือละเอียด (เมาส์) — ตรงกับเจตนาของเกณฑ์
 * มากกว่าการเดาจากความกว้างจอ เพราะแท็บเล็ตจอใหญ่ก็ยังใช้นิ้วกด
 *
 * บนเมาส์เหลือ 32px ซึ่งยังสูงกว่าเกณฑ์ขั้นต่ำของ pointer ที่ละเอียด (24×24)
 */
const FOOTER_LINK =
  'inline-flex min-h-8 items-center text-sm transition-colors duration-(--duration-ui) hover:text-white pointer-coarse:min-h-11 pointer-coarse:min-w-11'

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
        {/*
          คอลัมน์ที่สี่กว้างขั้นต่ำ 24rem ไม่ใช่ 1 ใน 4 เท่ากันทุกคอลัมน์ — ที่อยู่ท้ายเว็บ
          กำหนดจุดขึ้นบรรทัดมาเองในข้อมูล บรรทัดที่ยาวที่สุดกว้าง 381px ถ้าคอลัมน์แคบกว่านั้น
          เบราว์เซอร์จะตัดซ้อนเข้าไปอีกชั้นจนบรรทัดที่ตั้งใจไว้แตกกลางคำ ส่วนสามคอลัมน์แรก
          เป็นรายการลิงก์สั้น ๆ ที่กว้างราว 110px อยู่แล้ว การหั่นที่เหลือเท่ากันจึงยังเหลือเฟือ

          คอลัมน์แรกมีขั้นต่ำ 15rem ด้วย เพราะตราบริษัทกับชื่อเต็มเรียงกันในแนวนอนและไม่ตัดคำ
          ต้องการ 240px เสมอ ถ้าปล่อยให้ยืดหดตามส่วนที่เหลือ มันจะล้นไปทับคอลัมน์ถัดไปที่จอ 1024px
        */}
        <div className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[minmax(15rem,1fr)_1fr_1fr_minmax(24rem,1.5fr)]">
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
                    <Link to={item.to} className={FOOTER_LINK}>
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
                <p className="mb-2 whitespace-pre-line">{t(company.addressFooter)}</p>
                {company.phone.map((number) => (
                  <p key={number}>
                    <a
                      href={`tel:${number.replace(/\s/g, '')}`}
                      className={FOOTER_LINK}
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
                      className={`${FOOTER_LINK} break-all`}
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
        </div>
      </Container>
    </footer>
  )
}
