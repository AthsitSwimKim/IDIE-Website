import { Link } from 'react-router-dom'
import { Container } from '@/components/ui'
import { Logo, COMPANY_NAME } from '@/components/layout/Logo'
import { VisitorCounter } from '@/components/layout/VisitorCounter'
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
          ท้ายเว็บเรียงสี่คอลัมน์ตั้งแต่ `xl` (1280px) ขึ้นไปเท่านั้น ต่ำกว่านั้นเป็นสองคอลัมน์

          เดิมเริ่มสี่คอลัมน์ที่ `lg` (1024px) แต่ของที่ต้องใส่โตขึ้นจนไม่พอแล้ว —
          วัดความกว้างที่แต่ละก้อนต้องการจริง: ตราบริษัทพร้อมชื่อเต็ม 278px ·
          ที่อยู่บรรทัดยาวสุด 407px · สองคอลัมน์ลิงก์รวม 198px = 883px
          บวกช่องไฟสามช่อง 120px เป็น 1,003px แต่ที่จอ 1024 มีพื้นที่จริงแค่ 913px
          บีบยังไงก็ไม่พอ ผลคือชื่อบริษัทล้นออกนอกคอลัมน์ 38px ไปเบียดหมวด EXPLORE

          ที่ 1280 พื้นที่มี 1,152px ใส่ทุกอย่างแล้วยังเหลือ 130px จึงพอดี
          ส่วนช่วง 1024–1279 ตกไปเป็นสองคอลัมน์ ได้ก้อนละ 436px ซึ่งกว้างเหลือเฟือ
          ท้ายเว็บสูงขึ้นแต่ไม่มีอะไรทับกัน

          ทุกคอลัมน์ใช้ `auto` คือกว้างเท่าเนื้อหาของตัวเอง แล้วโยนที่ว่างที่เหลือไป
          เกลี่ยเป็นช่องไฟด้วย `justify-between` — วิธีนี้ช่องไฟระหว่างคอลัมน์เท่ากันเสมอ
          ไม่ว่าเนื้อหาแต่ละภาษาจะยาวไม่เท่ากันแค่ไหน

          ถ้าแบ่งความกว้างเป็นสัดส่วน (1fr) แทน คอลัมน์ลิงก์จะได้ที่เกินความจำเป็น
          แล้วเหลือช่องว่างท้ายคอลัมน์ ขณะที่คอลัมน์แรกซึ่งมีทั้งตราบริษัทและย่อหน้า
          กลับไม่เหลือที่เลย วัดช่องว่างหลังตัวอักษรจริง (ไม่ใช่ช่องไฟของกริด):
          ก่อนแก้ทั้งหมด -14 / 138 / 167px · หลังแก้ 97 / 87 / 87px (อังกฤษ)
          และ 154 / 144 / 143px (ไทย) — ส่วนต่างที่เหลือคือขอบขวาที่ไม่เท่ากันของ
          ย่อหน้าแนะนำบริษัทเท่านั้น

          ผลพลอยได้: คอลัมน์ที่อยู่กว้างเท่าบรรทัดที่ยาวที่สุดพอดี (อังกฤษ 407px)
          ไม่ต้องกำหนดขั้นต่ำเป็นตัวเลขตายตัวอีก บรรทัดที่ตั้งใจไว้จึงไม่ถูกตัดกลางคำ
          (เคยได้ "Sub-" / "district,") และตราบริษัทกับชื่อเต็มก็ได้ 278px ที่ต้องการเสมอ
        */}
        <div className="grid gap-10 py-14 md:grid-cols-2 xl:grid-cols-[auto_auto_auto_auto] xl:justify-between">
          <div>
            <Logo tone="dark" />
            <p className="mt-5 max-w-xs text-sm">{t(ui.footer.tagline)}</p>
            <VisitorCounter />
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
                {/* ไม่ระบุสีเอง — รับสีเดียวกับที่อยู่ เบอร์โทร และอีเมลจาก footer (white/70)
                    เดิมจางกว่าเพื่อนที่ white/50 ทั้งที่เป็นข้อมูลติดต่อชุดเดียวกัน */}
                <p className="py-2">
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
