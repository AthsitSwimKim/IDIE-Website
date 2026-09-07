import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui'
import { adminSiteReferences, ApiError, type SiteReferencePayload } from '@/admin/api'
import {
  Bilingual,
  Field,
  ImageField,
  Select,
  TextInput,
  type FormImage,
} from '@/pages/admin/components/fields'
import { SaveConfirmDialog } from '@/pages/admin/components/SaveConfirmDialog'
import type { PublishStatus } from '@/types/admin'
import type { LocalizedText } from '@/types/content'

interface FormState {
  name: LocalizedText
  customer: LocalizedText
  location: LocalizedText
  /** เก็บเป็นสตริงเพราะช่องตัวเลขที่ว่างอยู่ต้องพิมพ์ทับได้ ไม่ใช่เด้งเป็น 0 ทันที */
  position: string
  status: PublishStatus
  image: FormImage | null
}

const empty = (): FormState => ({
  name: { th: '', en: '' },
  customer: { th: '', en: '' },
  location: { th: '', en: '' },
  position: '0',
  status: 'draft',
  image: null,
})

/**
 * ฟอร์มเพิ่ม/แก้ไขรายการอ้างอิงหน้างาน — `/admin/site-references/:id`
 *
 * ไม่มี slug เพราะกล่องนี้ไม่มีหน้ารายละเอียดของตัวเอง ทั้งหมดแสดงอยู่บนหน้า
 * /reference หน้าเดียว จึงไม่ต้องมี URL ประจำตัวและไม่ต้องกันชื่อซ้ำ
 */
export default function AdminSiteReferenceEdit() {
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

    adminSiteReferences
      .get(Number(routeId))
      .then((item) => {
        if (cancelled) return
        setForm({
          name: item.name,
          customer: item.customer,
          location: item.location,
          position: String(item.position),
          status: item.status,
          image: item.image,
        })
      })
      .catch((cause: unknown) => {
        if (!cancelled) setMessage(cause instanceof Error ? cause.message : 'โหลดข้อมูลไม่สำเร็จ')
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

    const payload: SiteReferencePayload = {
      name: form.name,
      customer: form.customer,
      location: form.location,
      position: Number(form.position.trim()) || 0,
      status: form.status,
      image: form.image,
    }

    try {
      if (id === undefined) {
        const created = await adminSiteReferences.create(payload)
        setCreatedId(created.id)
        setMessage('สร้างรายการเรียบร้อยแล้ว')
      } else {
        await adminSiteReferences.update(Number(id), payload)
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
      <Button variant="outline" onClick={() => navigate('/admin/site-references')}>
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
        <h1 className="text-h3 font-semibold">
          {isNew ? 'เพิ่มรายการอ้างอิงใหม่' : 'แก้ไขรายการอ้างอิง'}
        </h1>
        {actions}
      </div>

      {message && (
        // <output> มี role="status" ในตัว — screen reader อ่านข้อความที่เปลี่ยน
        <output className="border-line bg-surface rounded-card mt-6 block border px-4 py-3 text-sm">
          {message}
        </output>
      )}

      <div className="mt-8 space-y-8">
        <Bilingual
          name="name"
          label="ชื่อโครงการ"
          value={form.name}
          onChange={(value) => set('name', value)}
          errors={fieldErrors}
        />

        <Bilingual
          name="customer"
          label="ลูกค้า"
          hint='ใส่ "ไม่เปิดเผย / Confidential" ได้ ถ้าลูกค้าไม่อนุญาตให้เอ่ยชื่อ'
          value={form.customer}
          onChange={(value) => set('customer', value)}
          errors={fieldErrors}
        />

        <Bilingual
          name="location"
          label="สถานที่"
          value={form.location}
          onChange={(value) => set('location', value)}
          errors={fieldErrors}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label="ลำดับการแสดง"
            hint="เลขน้อยขึ้นก่อน ใส่ซ้ำกันได้ ระบบจะเรียงตามลำดับที่สร้างเป็นตัวตัดสิน"
            htmlFor="position"
            error={fieldErrors.position}
          >
            <TextInput
              id="position"
              type="number"
              min={0}
              max={9999}
              value={form.position}
              onChange={(value) => set('position', value)}
            />
          </Field>

          <Field label="สถานะ" hint="คุมว่าจะขึ้นหน้าเว็บหรือยัง" htmlFor="status">
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

        <ImageField
          name="image"
          label="ภาพประกอบ"
          hint="ไม่ใส่ก็ได้ — งานในพื้นที่หวงห้ามถ่ายรูปไม่ได้ กล่องจะแสดงเฉพาะข้อความ"
          value={form.image}
          onChange={(value) => set('image', value)}
          errors={fieldErrors}
        />
      </div>

      <div className="mt-10 flex justify-end">{actions}</div>
      <SaveConfirmDialog
        open={confirming}
        onConfirm={() => void handleSave()}
        onCancel={() => setConfirming(false)}
      />
    </form>
  )
}
