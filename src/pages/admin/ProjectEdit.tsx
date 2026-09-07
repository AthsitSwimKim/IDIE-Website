import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui'
import { adminProjects, ApiError, type ProjectPayload } from '@/admin/api'
import {
  Bilingual,
  BilingualList,
  Checkbox,
  Field,
  GalleryField,
  ImageField,
  Select,
  TextInput,
  type FormImage,
} from '@/pages/admin/components/fields'
import { SaveConfirmDialog } from '@/pages/admin/components/SaveConfirmDialog'
import { INDUSTRY_OPTIONS } from '@/pages/admin/industryLabels'
import type { IndustrySlug, LocalizedText } from '@/types/content'
import type { PublishStatus } from '@/types/admin'

interface FormState {
  slug: string
  name: LocalizedText
  client: LocalizedText
  industry: IndustrySlug
  location: LocalizedText
  /** เก็บเป็นสตริงเพราะช่องว่างต้องหมายถึง "ยังไม่ระบุปี" ไม่ใช่ปี 0 */
  year: string
  scopeOfWork: LocalizedText[]
  overview: LocalizedText
  engineeringSolution: LocalizedText
  status: PublishStatus
  featured: boolean
  cover: FormImage | null
  gallery: FormImage[]
}

const empty = (): FormState => ({
  slug: '',
  name: { th: '', en: '' },
  client: { th: '', en: '' },
  industry: 'petrochemical',
  location: { th: '', en: '' },
  year: String(new Date().getFullYear()),
  scopeOfWork: [],
  overview: { th: '', en: '' },
  engineeringSolution: { th: '', en: '' },
  status: 'draft',
  featured: false,
  cover: null,
  gallery: [],
})

export default function AdminProjectEdit() {
  const { id: routeId } = useParams()
  const navigate = useNavigate()

  /**
   * id ของรายการที่เพิ่งสร้างในหน้านี้ — เก็บไว้เองแทนการย้ายไปหน้าแก้ไข
   *
   * เดิมพอบันทึกสำเร็จจะ navigate ไป `/…/:id` ซึ่งเป็นคนละ route กับ `/…/new`
   * component จึงถูก unmount แล้ว mount ใหม่ทั้งหน้า ผู้ใช้เห็นหน้ากระพริบเหมือนโหลด
   * ใหม่ทุกครั้งที่กดบันทึก เก็บ id ไว้ใน state แล้วอยู่หน้าเดิมแทน การกดบันทึกครั้งถัดไป
   * จะกลายเป็นการแก้ไขรายการเดิม ไม่ใช่สร้างซ้ำ
   *
   * ผลข้างเคียงที่ยอมรับ: URL ยังเป็น `/…/new` จนกว่าจะออกจากหน้า ถ้ารีเฟรชตรงนี้
   * จะได้ฟอร์มเปล่า (ของที่บันทึกไปแล้วอยู่ในฐานข้อมูลครบ เปิดจากหน้ารายการได้)
   */
  const [createdId, setCreatedId] = useState<number | null>(null)
  const id = routeId ?? (createdId === null ? undefined : String(createdId))
  const isNew = id === undefined

  const [form, setForm] = useState<FormState>(empty)
  const [loading, setLoading] = useState(routeId !== undefined)
  const [saving, setSaving] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (routeId === undefined) return
    let cancelled = false

    adminProjects
      .get(Number(routeId))
      .then((item) => {
        if (cancelled) return
        setForm({
          slug: item.slug,
          name: item.name,
          client: item.client,
          industry: item.industry,
          location: item.location,
          year: item.year === null ? '' : String(item.year),
          scopeOfWork: item.scopeOfWork,
          overview: item.overview,
          engineeringSolution: item.engineeringSolution,
          status: item.status,
          featured: item.featured ?? false,
          cover: item.cover,
          gallery: item.gallery,
        })
      })
      .catch((cause: unknown) => {
        if (!cancelled) setMessage(cause instanceof Error ? cause.message : 'โหลดผลงานไม่สำเร็จ')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [routeId])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  /**
   * กดปุ่มบันทึกแล้วยังไม่บันทึกทันที — เปิดกล่องยืนยันก่อน
   *
   * แยกออกจาก `handleSave` เพราะการยืนยันเป็นกล่องของเว็บเอง ไม่ใช่ `window.confirm`
   * ที่หยุดรอค่าตอบกลับได้ในบรรทัดเดียว ต้องรอผู้ใช้กดปุ่มในกล่องแล้วค่อยเรียกบันทึก
   */
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setConfirming(true)
  }

  async function handleSave() {
    setConfirming(false)
    setSaving(true)
    setMessage(null)
    setFieldErrors({})

    const trimmedYear = form.year.trim()
    const payload: ProjectPayload = {
      slug: form.slug,
      name: form.name,
      client: form.client,
      industry: form.industry,
      location: form.location,
      year: trimmedYear === '' ? null : Number(trimmedYear),
      scopeOfWork: form.scopeOfWork,
      overview: form.overview,
      engineeringSolution: form.engineeringSolution,
      status: form.status,
      featured: form.featured,
      cover: form.cover,
      gallery: form.gallery,
    }

    try {
      if (id === undefined) {
        const created = await adminProjects.create(payload)
        setCreatedId(created.id)
        setMessage('สร้างผลงานเรียบร้อยแล้ว')
      } else {
        await adminProjects.update(Number(id), payload)
        setMessage('บันทึกแล้ว')
      }
    } catch (cause) {
      if (cause instanceof ApiError && cause.fields) setFieldErrors(cause.fields)
      setMessage(cause instanceof Error ? cause.message : 'บันทึกไม่สำเร็จ')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-ink-muted text-sm">กำลังโหลด…</p>

  const actions = (
    <div className="flex gap-3">
      <Button variant="outline" onClick={() => navigate('/admin/projects')}>
        กลับไปรายการ
      </Button>
      <Button type="submit" disabled={saving}>
        {saving ? 'กำลังบันทึก…' : 'บันทึก'}
      </Button>
    </div>
  )

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-h3 font-semibold">{isNew ? 'เพิ่มผลงานใหม่' : 'แก้ไขผลงาน'}</h1>
        {actions}
      </div>

      {message && (
        // <output> มี role="status" ในตัว — screen reader อ่านข้อความที่เปลี่ยน
        // ให้เองโดยไม่ต้องแย่งโฟกัสจากช่องที่ผู้ใช้กำลังกรอกอยู่
        <output className="border-line bg-surface mt-4 block rounded border px-4 py-3 text-sm">
          {message}
        </output>
      )}

      <div className="border-line bg-surface rounded-card mt-6 space-y-6 border p-6">
        <Field
          label="slug (ส่วนท้ายของลิงก์)"
          hint="ใช้ได้เฉพาะ a-z, 0-9 และขีดกลาง — จะกลายเป็น /projects/<slug>"
          error={fieldErrors.slug}
          htmlFor="slug"
        >
          <TextInput
            id="slug"
            value={form.slug}
            onChange={(value) => set('slug', value)}
            placeholder="paging-system-map-ta-phut"
            required
          />
        </Field>

        <Bilingual
          name="name"
          label="ชื่อผลงาน"
          value={form.name}
          onChange={(value) => set('name', value)}
          errors={fieldErrors}
        />

        <Bilingual
          name="client"
          label="ลูกค้า"
          hint='ถ้าลูกค้าไม่อนุญาตให้เปิดเผยชื่อ ให้ใส่ "ไม่เปิดเผย" / "Confidential" — ห้ามเว้นว่าง'
          value={form.client}
          onChange={(value) => set('client', value)}
          errors={fieldErrors}
        />

        <div className="grid gap-6 md:grid-cols-3">
          <Field label="อุตสาหกรรม" htmlFor="industry" error={fieldErrors.industry}>
            <Select
              id="industry"
              value={form.industry}
              onChange={(value) => set('industry', value)}
              options={INDUSTRY_OPTIONS}
            />
          </Field>

          <Field
            label="ปีที่ส่งมอบ"
            hint="เว้นว่างได้ถ้ายังไม่ระบุ"
            htmlFor="year"
            error={fieldErrors.year}
          >
            <TextInput
              id="year"
              type="number"
              min={1900}
              max={2200}
              value={form.year}
              onChange={(value) => set('year', value)}
            />
          </Field>

          <Field label="สถานะ" htmlFor="status">
            <Select
              id="status"
              value={form.status}
              onChange={(value) => set('status', value)}
              options={[
                { value: 'draft', label: 'ร่าง (ไม่ขึ้นหน้าเว็บ)' },
                { value: 'published', label: 'เผยแพร่' },
              ]}
            />
          </Field>
        </div>

        <Bilingual
          name="location"
          label="สถานที่"
          value={form.location}
          onChange={(value) => set('location', value)}
          errors={fieldErrors}
        />

        <Bilingual
          name="overview"
          label="ภาพรวมโครงการ"
          hint="โจทย์ของหน้างานคืออะไร"
          value={form.overview}
          onChange={(value) => set('overview', value)}
          errors={fieldErrors}
          multiline
          rows={5}
        />

        <Bilingual
          name="engineeringSolution"
          label="สิ่งที่ IDIE ทำ"
          hint="แก้โจทย์นั้นด้วยอะไร ระบบไหน ยี่ห้อใด — ส่วนนี้คือสิ่งที่ทำให้ผลงานต่างจากโลโก้ลูกค้า"
          value={form.engineeringSolution}
          onChange={(value) => set('engineeringSolution', value)}
          errors={fieldErrors}
          multiline
          rows={5}
        />

        <BilingualList
          label="ขอบเขตงาน"
          hint="แยกเป็นข้อ ๆ เช่น ออกแบบระบบ · ติดตั้ง · ทดสอบและส่งมอบ"
          value={form.scopeOfWork}
          onChange={(value) => set('scopeOfWork', value)}
          addLabel="เพิ่มขอบเขตงาน"
        />

        <Checkbox
          checked={form.featured}
          onChange={(value) => set('featured', value)}
          label="ปักหมุดเป็นผลงานเด่น"
          hint="ผลงานเด่นจะถูกหยิบขึ้นหัวข้อ “ผลงานที่ผ่านมา” บนหน้าแรกก่อนชิ้นอื่น"
        />

        <ImageField
          name="cover"
          label="ภาพปก"
          hint="แนะนำภาพแนวนอน กว้างอย่างน้อย 1600px"
          value={form.cover}
          onChange={(value) => set('cover', value)}
          errors={fieldErrors}
        />

        <GalleryField value={form.gallery} onChange={(value) => set('gallery', value)} />
      </div>

      <div className="mt-6 flex justify-end">{actions}</div>
      <SaveConfirmDialog
        open={confirming}
        onConfirm={() => void handleSave()}
        onCancel={() => setConfirming(false)}
      />
    </form>
  )
}
