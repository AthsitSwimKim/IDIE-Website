import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui'
import { adminNews, ApiError, type NewsPayload } from '@/admin/api'
import {
  Bilingual,
  Checkbox,
  Field,
  ImageField,
  Select,
  TextInput,
  type FormImage,
} from '@/pages/admin/components/fields'
import type { LocalizedText, NewsCategory } from '@/types/content'
import type { PublishStatus } from '@/types/admin'

interface FormState {
  slug: string
  title: LocalizedText
  excerpt: LocalizedText
  body: LocalizedText
  category: NewsCategory
  publishedAt: string // ค่าของ <input type="datetime-local"> = เวลาท้องถิ่นของผู้กรอก
  status: PublishStatus
  featured: boolean
  cover: FormImage | null
}

const empty = (): FormState => ({
  slug: '',
  title: { th: '', en: '' },
  excerpt: { th: '', en: '' },
  body: { th: '', en: '' },
  category: 'company',
  publishedAt: toLocalInput(new Date().toISOString()),
  status: 'draft',
  featured: false,
  cover: null,
})

/**
 * ISO (UTC) → ค่าที่ `<input type="datetime-local">` ต้องการ
 *
 * input ตัวนี้รับเฉพาะรูปแบบ `YYYY-MM-DDTHH:mm` ที่**ไม่มีโซนเวลา** และตีความว่า
 * เป็นเวลาท้องถิ่นเสมอ จึงต้องลบ offset ออกก่อน ไม่งั้นเวลาที่แสดงจะเพี้ยนไป 7 ชั่วโมง
 */
function toLocalInput(iso: string): string {
  const date = new Date(iso)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

/** ขากลับ — เบราว์เซอร์แปลงเวลาท้องถิ่นเป็น UTC ให้เองผ่าน `new Date()` */
function toIso(localValue: string): string {
  return new Date(localValue).toISOString()
}

const CATEGORIES: { value: NewsCategory; label: string }[] = [
  { value: 'company', label: 'ข่าวบริษัท' },
  { value: 'project', label: 'ข่าวโครงการ' },
  { value: 'product', label: 'ข่าวสินค้า' },
  { value: 'article', label: 'บทความ' },
  { value: 'event', label: 'กิจกรรม' },
]

export default function AdminNewsEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isNew = !id

  /**
   * ข้อความ "สร้างเรียบร้อย" ส่งผ่าน navigation state ไม่ใช่ useState
   *
   * `/…/new` กับ `/…/:id` เป็นคนละ route ของ React Router ตอนบันทึกสำเร็จแล้ว
   * ย้ายไปหน้าแก้ไข component ตัวเดิมจึงถูก **unmount** แล้ว mount ใหม่ —
   * state ทุกตัวรวมถึงข้อความยืนยันหายไปด้วย ผู้ใช้เลยไม่เห็นอะไรเลยหลังกดบันทึก
   * และไม่แน่ใจว่าบันทึกติดหรือไม่ จนกดซ้ำแล้วได้ slug ซ้ำ
   */
  const flash = (location.state as { message?: string } | null)?.message ?? null

  const [form, setForm] = useState<FormState>(empty)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(flash)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isNew) return
    let cancelled = false

    adminNews
      .get(Number(id))
      .then((item) => {
        if (cancelled) return
        setForm({
          slug: item.slug,
          title: item.title,
          excerpt: item.excerpt,
          body: item.body,
          category: item.category,
          publishedAt: toLocalInput(item.publishedAt),
          status: item.status,
          featured: item.featured ?? false,
          cover: item.cover,
        })
      })
      .catch((cause: unknown) => {
        if (!cancelled) setMessage(cause instanceof Error ? cause.message : 'โหลดข่าวไม่สำเร็จ')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, isNew])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage(null)
    setFieldErrors({})

    const payload: NewsPayload = {
      slug: form.slug,
      title: form.title,
      excerpt: form.excerpt,
      body: form.body,
      category: form.category,
      publishedAt: toIso(form.publishedAt),
      status: form.status,
      featured: form.featured,
      cover: form.cover,
    }

    try {
      if (isNew) {
        const created = await adminNews.create(payload)
        // แทนที่ประวัติแทนการ push — กดย้อนกลับแล้วต้องไม่กลับไปหน้า "เพิ่มใหม่"
        // ที่ยังมีข้อมูลค้างอยู่ ซึ่งจะทำให้กดบันทึกซ้ำแล้วได้ข่าวซ้ำสองอัน
        navigate(`/admin/news/${created.id}`, {
          replace: true,
          state: { message: 'สร้างข่าวเรียบร้อยแล้ว' },
        })
      } else {
        await adminNews.update(Number(id), payload)
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

  return (
    <form onSubmit={(event) => void handleSave(event)}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-h3 font-semibold">{isNew ? 'เพิ่มข่าวใหม่' : 'แก้ไขข่าว'}</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/admin/news')}>
            กลับไปรายการ
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'กำลังบันทึก…' : 'บันทึก'}
          </Button>
        </div>
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
          hint="ใช้ได้เฉพาะ a-z, 0-9 และขีดกลาง — จะกลายเป็น /news/<slug> และไม่ควรเปลี่ยนหลังเผยแพร่แล้ว"
          error={fieldErrors.slug}
          htmlFor="slug"
        >
          <TextInput
            id="slug"
            value={form.slug}
            onChange={(value) => set('slug', value)}
            placeholder="new-office-rayong"
            required
          />
        </Field>

        <Bilingual
          name="title"
          label="หัวข้อข่าว"
          value={form.title}
          onChange={(value) => set('title', value)}
          errors={fieldErrors}
        />

        <Bilingual
          name="excerpt"
          label="สรุปย่อ"
          hint="ข้อความที่แสดงบนการ์ดในหน้ารายการข่าวและหน้าแรก"
          value={form.excerpt}
          onChange={(value) => set('excerpt', value)}
          errors={fieldErrors}
          multiline
          rows={3}
        />

        <Bilingual
          name="body"
          label="เนื้อข่าว (Markdown)"
          hint="ใช้ # สำหรับหัวข้อ, - สำหรับรายการ, **ตัวหนา** — เว้นบรรทัดว่างเพื่อขึ้นย่อหน้าใหม่"
          value={form.body}
          onChange={(value) => set('body', value)}
          errors={fieldErrors}
          multiline
          rows={14}
        />

        <div className="grid gap-6 md:grid-cols-3">
          <Field label="หมวดข่าว" htmlFor="category" error={fieldErrors.category}>
            <Select
              id="category"
              value={form.category}
              onChange={(value) => set('category', value)}
              options={CATEGORIES}
            />
          </Field>

          <Field
            label="วันที่และเวลาเผยแพร่"
            hint="ตั้งเป็นอนาคตได้ ข่าวจะโผล่เองเมื่อถึงเวลา"
            htmlFor="publishedAt"
            error={fieldErrors.publishedAt}
          >
            <TextInput
              id="publishedAt"
              type="datetime-local"
              value={form.publishedAt}
              onChange={(value) => set('publishedAt', value)}
              required
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

        <Checkbox
          checked={form.featured}
          onChange={(value) => set('featured', value)}
          label="ปักหมุดเป็นข่าวเด่น"
          hint="ข่าวเด่นจะถูกหยิบขึ้นหัวข้อ “ข่าวสารล่าสุด” บนหน้าแรกก่อนข่าวอื่น"
        />

        <ImageField
          name="cover"
          label="ภาพปก"
          hint="แนะนำภาพแนวนอน กว้างอย่างน้อย 1600px"
          value={form.cover}
          onChange={(value) => set('cover', value)}
          errors={fieldErrors}
        />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate('/admin/news')}>
          กลับไปรายการ
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'กำลังบันทึก…' : 'บันทึก'}
        </Button>
      </div>
    </form>
  )
}
