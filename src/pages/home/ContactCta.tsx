import { Button, Section } from '@/components/ui'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getCompany, ui } from '@/data'

/**
 * Contact CTA — Home section 14
 *
 * Centered statement เป็น pattern ที่ใช้ได้ครั้งเดียวต่อหน้า ถ้าใช้ซ้ำจะหมดพลัง —
 * จึงเก็บไว้ให้ section ปิดท้ายซึ่งเป็นจุดที่ต้องการให้ผู้ใช้ลงมือทำมากที่สุด
 *
 * ใส่เบอร์โทรเป็นลิงก์ควบคู่กับปุ่มไปหน้า Contact เพราะลูกค้า B2B จำนวนไม่น้อย
 * โทรตรงมากกว่ากรอกฟอร์ม โดยเฉพาะเมื่อเป็นงานด่วนหน้าไซต์
 */
export function ContactCta() {
  const { t } = useLocale()
  const { data: company } = useAsyncData(getCompany)
  const phone = company?.phone[0]

  return (
    <Section tone="dark" spacing="lg" className="blueprint-grid">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-eyebrow text-accent-glow flex items-center justify-center gap-2.5 uppercase">
          <span aria-hidden="true" className="bg-accent-glow inline-block h-px w-6" />
          Contact
        </p>

        <h2 className="text-h1 mt-5 font-bold text-balance text-white uppercase">
          {t(ui.home.contactCtaTitle)}
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-white/70">{t(ui.home.contactCtaLead)}</p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button to="/contact" variant="onDark" size="lg" withArrow>
            {t(ui.actions.contactInquiry)}
          </Button>
          {phone && (
            <Button
              href={`tel:${phone.replace(/\s/g, '')}`}
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 active:bg-white/15"
            >
              {phone}
            </Button>
          )}
        </div>
      </div>
    </Section>
  )
}
