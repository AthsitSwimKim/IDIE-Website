import { useEffect, useId, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, Heading, Lightbox, Section } from '@/components/ui'
import { Seo } from '@/components/layout/Seo'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import {
  companyFax,
  contactPerson,
  getCompany,
  getProductCategories,
  getServices,
  submitInquiry,
  ui,
} from '@/data'
import { cn } from '@/utils/cn'

type Field = 'name' | 'company' | 'email' | 'phone' | 'subject' | 'message'
type Values = Record<Field, string>

const EMPTY: Values = { name: '', company: '', email: '', phone: '', subject: '', message: '' }
const REQUIRED: Field[] = ['name', 'email', 'subject', 'message']

/**
 * Contact — Phase 4
 *
 * ฟอร์มส่งอีเมลถึงบริษัทจริงแล้ว (ส.ค. 2026) ผ่าน `POST /api/contact`
 *
 * ตรวจข้อมูลสองชั้นโดยตั้งใจ — ที่นี่เพื่อบอกผู้ใช้ทันทีโดยไม่ต้องรอเครือข่าย
 * และที่เซิร์ฟเวอร์อีกครั้งเพราะใครก็ยิง POST ตรงมาได้โดยไม่ผ่านฟอร์มนี้
 *
 * **ถ้าส่งไม่สำเร็จต้องบอกให้ชัด** ไม่แสดงหน้าขอบคุณ — ผู้ใช้ที่เดินจากไปโดยคิดว่า
 * บริษัทได้รับคำถามแล้วทั้งที่ไม่ได้รับ คือความเสียหายที่แก้ทีหลังไม่ได้
 * UI ที่ทำให้ผู้ใช้เข้าใจว่าส่งข้อความไปแล้วทั้งที่ไม่ได้ส่ง เป็นความเสียหายที่แก้ทีหลังไม่ได้
 *
 * รองรับ ?product= และ ?service= เพื่อเติมหัวข้อให้อัตโนมัติ — ผู้ใช้ที่กดมาจาก
 * หน้าสินค้าหรือหน้าบริการไม่ต้องพิมพ์ซ้ำว่ากำลังถามเรื่องอะไร
 */
export default function Contact() {
  const { t, locale } = useLocale()
  const [params] = useSearchParams()
  const formId = useId()

  const { data: company } = useAsyncData(getCompany)
  const { data: services } = useAsyncData(getServices)
  const { data: categories } = useAsyncData(getProductCategories)

  const [values, setValues] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  /**
   * ช่องล่อบอต — ซ่อนจากสายตาและจากโปรแกรมอ่านหน้าจอ ผู้ใช้จริงจึงไม่มีวันกรอก
   * ใช้ตำแหน่ง absolute ออกนอกจอแทน `display:none` เพราะบอตที่ฉลาดขึ้นจะข้าม
   * ช่องที่ถูกซ่อนด้วย CSS ตรง ๆ
   */
  const [honeypot, setHoneypot] = useState('')

  /** ป๊อปอัปแผนที่ขนาดใหญ่ — แยก state จากฟอร์มเพราะไม่เกี่ยวกัน */
  const [mapOpen, setMapOpen] = useState(false)

  const productSlug = params.get('product')
  const serviceSlug = params.get('service')

  // เติมหัวข้อจาก context ที่ผู้ใช้กดมา — ทำครั้งเดียวตอนเข้าหน้า ไม่ทับสิ่งที่ผู้ใช้พิมพ์เอง
  useEffect(() => {
    const service = services?.find((s) => s.slug === serviceSlug)
    const category = categories?.find((c) => c.slug === productSlug)
    const source = service?.name ?? category?.name
    if (!source) return
    setValues((prev) => (prev.subject ? prev : { ...prev, subject: t(source) }))
  }, [services, categories, serviceSlug, productSlug, t])

  function update(field: Field, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    const next: Partial<Record<Field, string>> = {}
    REQUIRED.forEach((field) => {
      if (!values[field].trim()) next[field] = t(ui.contact.required)
    })
    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next.email = t(ui.contact.invalidEmail)
    }
    setErrors(next)
    if (Object.keys(next).length > 0) {
      document.getElementById(`${formId}-${Object.keys(next)[0]}`)?.focus()
      return
    }

    setSending(true)
    setSendError(null)
    try {
      await submitInquiry({
        name: values.name.trim(),
        company: values.company.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
        locale,
        website: honeypot,
      })
      setSubmitted(true)
      setValues(EMPTY)
    } catch (cause) {
      // ข้อความจากเซิร์ฟเวอร์อธิบายตรงกว่าเมื่อมี (ส่งถี่เกินไป / ระบบเมลยังไม่พร้อม)
      const detail = cause instanceof Error ? cause.message : ''
      setSendError(detail || t(ui.contact.sendFailed))
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Seo title={ui.contact.title} description={ui.contact.lead} />

      <Section tone="alt" spacing="lg">
        <Heading level={1} eyebrow="CONTACT US">
          {t(ui.contact.title)}
        </Heading>
        <p className="text-ink-muted mt-4 max-w-prose text-lg">{t(ui.contact.lead)}</p>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Heading level={2}>{t(ui.contact.infoHeading)}</Heading>

            {company && (
              <dl className="border-line mt-6 divide-y border-t border-b">
                <div className="py-4">
                  <dt className="text-eyebrow text-ink-muted uppercase">
                    {t(ui.contact.address)}
                  </dt>
                  <dd className="mt-1.5">{t(company.address)}</dd>
                </div>
                <div className="py-4">
                  <dt className="text-eyebrow text-ink-muted uppercase">{t(ui.contact.phone)}</dt>
                  <dd className="mt-1.5 space-y-1">
                    {company.phone.map((number) => (
                      <p key={number}>
                        <a
                          href={`tel:${number.replace(/\s/g, '')}`}
                          className="text-primary-600 inline-flex min-h-11 items-center font-medium underline-offset-4 hover:underline"
                        >
                          {number}
                        </a>
                      </p>
                    ))}
                    <p className="text-ink-muted text-sm">
                      {t(ui.footer.fax)} {companyFax}
                    </p>
                  </dd>
                </div>
                <div className="py-4">
                  <dt className="text-eyebrow text-ink-muted uppercase">{t(ui.contact.email)}</dt>
                  <dd className="mt-1.5">
                    {company.email.map((address) => (
                      <p key={address}>
                        <a
                          href={`mailto:${address}`}
                          className="text-primary-600 inline-flex min-h-11 items-center font-medium break-all underline-offset-4 hover:underline"
                        >
                          {address}
                        </a>
                      </p>
                    ))}
                  </dd>
                </div>
                <div className="py-4">
                  <dt className="text-eyebrow text-ink-muted uppercase">
                    {t(ui.contact.contactPerson)}
                  </dt>
                  <dd className="mt-1.5">
                    {contactPerson.name}
                    <span className="text-ink-muted"> · {t(contactPerson.role)}</span>
                  </dd>
                </div>
              </dl>
            )}

            {company?.mapEmbedUrl && (
              <div className="mt-10">
                <Heading level={2}>{t(ui.contact.mapHeading)}</Heading>

                {/*
                  ครอบ iframe ด้วยกล่องอัตราส่วน 4:3 แทนการใส่ width/height ตายตัว 600×450
                  ตามที่ Google ให้มา — ค่าตายตัวจะล้นจอมือถือและไม่ยืดตามคอลัมน์บนเดสก์ท็อป

                  `title` จำเป็นจริง ไม่ใช่ของแถม: screen reader ประกาศ iframe ด้วยค่านี้
                  ถ้าไม่มีจะได้ยินแค่ "frame" ซึ่งไม่บอกอะไรเลย

                  `loading="lazy"` สำคัญกว่าปกติที่นี่ เพราะ embed ของ Google ดึงสคริปต์
                  และคุกกี้จาก third party — เลื่อนไปให้เกิดตอนผู้ใช้เลื่อนมาถึงจริงเท่านั้น
                */}
                <div className="rounded-card border-line mt-5 aspect-[4/3] overflow-hidden border">
                  <iframe
                    src={company.mapEmbedUrl}
                    title={t(ui.contact.mapTitle)}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="h-full w-full border-0"
                  />
                </div>

                {/*
                  ปุ่มขยายแผนที่ในป๊อปอัป — ผู้ใช้ได้แผนที่ใหญ่โดยไม่ต้องออกจากเว็บ

                  หมายเหตุ: ปุ่มนี้เป็นของเรา อยู่นอก iframe — ลิงก์ที่อยู่ **ข้างใน**
                  แผนที่ของ Google (ไอคอนลูกศรบนการ์ดชื่อร้าน, ปุ่มนำทาง) เราแตะไม่ได้
                  เพราะเป็น iframe คนละ origin เบราว์เซอร์ห้ามสคริปต์ข้ามไปยุ่งด้วย
                  กดปุ่มพวกนั้นก็ยังเด้งไป Google Maps ตามเดิม
                */}
                <div className="mt-3">
                  <Button variant="outline" size="sm" onClick={() => setMapOpen(true)}>
                    {t(ui.contact.mapExpand)}
                  </Button>
                </div>

                <Lightbox
                  open={mapOpen}
                  onClose={() => setMapOpen(false)}
                  label={t(ui.contact.mapTitle)}
                >
                  {/*
                    iframe ตัวที่สองสร้างเมื่อเปิดป๊อปอัปเท่านั้น (Lightbox render children
                    เฉพาะตอน open) จึงไม่มีการยิงคำขอไป Google เพิ่มถ้าผู้ใช้ไม่ได้กด
                  */}
                  <iframe
                    src={company.mapEmbedUrl}
                    title={t(ui.contact.mapTitle)}
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="h-[72dvh] w-[88dvw] border-0"
                  />
                </Lightbox>
              </div>
            )}
          </div>

          <div>
            <Heading level={2}>{t(ui.contact.formHeading)}</Heading>


            {submitted ? (
              <output className="border-success/40 bg-success/5 rounded-card mt-6 block border p-6">
                <h3 className="font-semibold">{t(ui.contact.submittedTitle)}</h3>
                <p className="text-ink-muted mt-2 text-sm">{t(ui.contact.submittedBody)}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {/*
                    ใช้ `contactPerson.email` ไม่ใช่ `company.email[0]` — ต้องเป็น
                    ที่อยู่**เดียวกับที่ฟอร์มส่งไปถึง** (`MAIL_TO` ใน server/.env)
                    ไม่งั้นผู้ใช้ที่กดปุ่มนี้เพราะฟอร์มมีปัญหา จะส่งไปคนละกล่อง
                    กับคำถามที่ส่งผ่านฟอร์มสำเร็จ แล้วสองทางนั้นไม่มีใครเห็นพร้อมกัน
                  */}
                  <Button href={`mailto:${contactPerson.email}`} size="sm">
                    {contactPerson.email}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSubmitted(false)}>
                    {t(ui.contact.sendAnother)}
                  </Button>
                </div>
              </output>
            ) : (
              <form
                onSubmit={(event) => void onSubmit(event)}
                noValidate
                className="mt-6 space-y-5"
              >
                {/* ช่องล่อบอต — อยู่นอกจอ ไม่อยู่ในลำดับ Tab และ screen reader ข้าม */}
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(event) => setHoneypot(event.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-[9999px] size-0 opacity-0"
                />

                {productSlug && (
                  <p className="text-ink-muted text-sm">
                    {t(ui.contact.productContext)}: <strong className="text-ink">{productSlug}</strong>
                  </p>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    id={`${formId}-name`}
                    label={t(ui.contact.fieldName)}
                    value={values.name}
                    error={errors.name}
                    required
                    onChange={(v) => update('name', v)}
                  />
                  <TextField
                    id={`${formId}-company`}
                    label={`${t(ui.contact.fieldCompany)} (${t(ui.contact.optional)})`}
                    value={values.company}
                    onChange={(v) => update('company', v)}
                  />
                  <TextField
                    id={`${formId}-email`}
                    label={t(ui.contact.fieldEmail)}
                    type="email"
                    value={values.email}
                    error={errors.email}
                    required
                    onChange={(v) => update('email', v)}
                  />
                  <TextField
                    id={`${formId}-phone`}
                    label={`${t(ui.contact.fieldPhone)} (${t(ui.contact.optional)})`}
                    type="tel"
                    value={values.phone}
                    onChange={(v) => update('phone', v)}
                  />
                </div>

                <TextField
                  id={`${formId}-subject`}
                  label={t(ui.contact.fieldSubject)}
                  value={values.subject}
                  error={errors.subject}
                  required
                  onChange={(v) => update('subject', v)}
                />

                <TextField
                  id={`${formId}-message`}
                  label={t(ui.contact.fieldMessage)}
                  value={values.message}
                  error={errors.message}
                  required
                  multiline
                  onChange={(v) => update('message', v)}
                />

                {sendError && (
                  <p role="alert" className="text-danger text-sm">
                    {sendError}
                  </p>
                )}

                <Button type="submit" size="lg" withArrow disabled={sending}>
                  {sending ? t(ui.contact.sending) : t(ui.contact.submit)}
                </Button>
              </form>
            )}
          </div>
        </div>
      </Section>
    </>
  )
}

/**
 * ช่องกรอกข้อมูลพร้อม label และข้อความ error ที่ผูกกันถูกต้อง
 *
 * error ผูกด้วย aria-describedby + aria-invalid ไม่ใช่แค่เปลี่ยนสีขอบ —
 * ผู้ใช้ screen reader ต้องรู้ว่าช่องไหนผิดและผิดเพราะอะไร
 */
function TextField({
  id,
  label,
  value,
  onChange,
  error,
  required,
  type = 'text',
  multiline,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  type?: string
  multiline?: boolean
}) {
  const errorId = `${id}-error`
  const shared = {
    id,
    value,
    required,
    'aria-invalid': error ? (true as const) : undefined,
    'aria-describedby': error ? errorId : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    className: cn(
      'mt-2 w-full rounded border px-3 py-2.5 text-sm outline-none',
      'focus:border-primary-400 transition-colors duration-(--duration-ui)',
      error ? 'border-danger' : 'border-line',
    ),
  }

  return (
    <div className={multiline ? 'sm:col-span-2' : undefined}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && (
          <span aria-hidden="true" className="text-danger ml-1">
            *
          </span>
        )}
      </label>

      {multiline ? (
        <textarea {...shared} rows={5} className={cn(shared.className, 'min-h-32')} />
      ) : (
        <input {...shared} type={type} className={cn(shared.className, 'min-h-11')} />
      )}

      {error && (
        <p id={errorId} className="text-danger mt-1.5 text-sm">
          {error}
        </p>
      )}
    </div>
  )
}
