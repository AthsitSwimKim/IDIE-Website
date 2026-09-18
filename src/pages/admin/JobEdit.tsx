
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui'
import { adminJobs, ApiError, type JobPayload } from '@/admin/api'
import { Bilingual, Field, Select, TextInput } from './components/fields'
import { ConfirmDialog } from './components/ConfirmDialog'
import type { JobOpening, LocalizedText } from '@/types/content'

const pair = (): LocalizedText => ({ th: '', en: '' })
type Form = Omit<JobPayload, 'position' | 'positions'> & { position: string; positions: string }
const empty = (): Form => ({
  slug: '', title: pair(), department: pair(), location: pair(), employmentType: 'full-time',
  position: '0', positions: '0', status: 'draft', isOpen: true,
  postedAt: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }),
  responsibilities: [pair()], qualifications: [pair()],
})

export default function AdminJobEdit() {
  const { id: routeId } = useParams()
  const navigate = useNavigate()
  const [createdId, setCreatedId] = useState<number | null>(null)
  const id = routeId === undefined ? createdId : Number(routeId)
  const [form, setForm] = useState<Form>(empty)
  const [loading, setLoading] = useState(routeId !== undefined)
  const [loadFailed, setLoadFailed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  useEffect(() => {
    let cancelled = false
    if (routeId === undefined) { setForm(empty()); setCreatedId(null); setLoadFailed(false); setMessage(null); setLoading(false); return }
    setLoading(true); setLoadFailed(false); setMessage(null)
    adminJobs.get(Number(routeId)).then((item) => {
      if (!cancelled) setForm({ ...item, positions: String(item.positions), position: String(item.position) })
    }).catch((cause: unknown) => {
      if (!cancelled) { setLoadFailed(true); setMessage(cause instanceof Error ? cause.message : 'โหลดข้อมูลไม่สำเร็จ') }
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [routeId])
  function move(key: 'responsibilities' | 'qualifications', index: number, offset: number) {
    const items = [...form[key]]
    const target = index + offset
    if (target < 0 || target >= items.length) return
    ;[items[index], items[target]] = [items[target], items[index]]
    set(key, items)
  }
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((prev) => ({ ...prev, [key]: value }))
  async function save() {
    setConfirming(false); setSaving(true); setMessage(null); setErrors({})
    const payload: JobPayload = { ...form, position: Number(form.position), positions: Number(form.positions) }
    try {
      if (id === null) { const result = await adminJobs.create(payload); setCreatedId(result.id); setMessage('สร้างตำแหน่งเรียบร้อยแล้ว') }
      else { await adminJobs.update(id, payload); setMessage('บันทึกแล้ว') }
    } catch (cause) {
      if (cause instanceof ApiError && cause.fields) setErrors(cause.fields)
      setMessage(cause instanceof Error ? cause.message : 'บันทึกไม่สำเร็จ')
    } finally { setSaving(false) }
  }
  if (loading) return <p className="text-ink-muted text-sm">กำลังโหลด…</p>
  if (loadFailed) return <div role="alert"><p className="text-danger">{message}</p><Button variant="outline" className="mt-4" to="/admin/jobs">กลับไปรายการ</Button></div>
  const actions = <div className="flex gap-3"><Button variant="outline" onClick={() => navigate('/admin/jobs')}>กลับไปรายการ</Button><Button type="submit" disabled={saving}>{saving ? 'กำลังบันทึก…' : 'บันทึก'}</Button></div>
  return <form onSubmit={(e) => { e.preventDefault(); setConfirming(true) }}>
    <div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-h3 font-semibold">{id === null ? 'เพิ่มตำแหน่งใหม่' : 'แก้ไขตำแหน่ง'}</h1>{actions}</div>
    {message && <output className="border-line bg-surface rounded-card mt-6 block border px-4 py-3 text-sm">{message}</output>}
    <div className="mt-8 space-y-8">
      <Bilingual name="title" label="ชื่อตำแหน่ง" value={form.title} onChange={(v) => set('title', v)} errors={errors} />
      <Bilingual name="department" label="ฝ่าย / แผนก" value={form.department} onChange={(v) => set('department', v)} errors={errors} />
      <Bilingual name="location" label="สถานที่ทำงาน" value={form.location} onChange={(v) => set('location', v)} errors={errors} />
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="รหัสตำแหน่ง (slug)" htmlFor="slug" hint="ใช้ a-z ตัวเลข และขีดกลาง เช่น sales-engineer ห้ามซ้ำกับตำแหน่งอื่น" error={errors.slug}><TextInput id="slug" required maxLength={160} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={form.slug} onChange={(v) => set('slug', v)} /></Field>
        <Field label="ประเภทการจ้าง" htmlFor="employmentType" error={errors.employmentType}><Select<JobOpening['employmentType']> id="employmentType" value={form.employmentType} onChange={(v) => set('employmentType', v)} options={[{ value: 'full-time', label: 'งานประจำ' }, { value: 'part-time', label: 'งานพาร์ตไทม์' }, { value: 'contract', label: 'งานสัญญาจ้าง' }, { value: 'internship', label: 'ฝึกงาน' }]} /></Field>
        <Field label="วันที่ประกาศ" htmlFor="postedAt" error={errors.postedAt}><TextInput id="postedAt" required type="date" min="1900-01-01" max="2200-12-31" value={form.postedAt} onChange={(v) => set('postedAt', v)} /></Field>
        <Field label="ลำดับการแสดง" htmlFor="position" hint="เลขน้อยขึ้นก่อน" error={errors.position}><TextInput id="position" required type="number" min={0} max={9999} step={1} value={form.position} onChange={(v) => set('position', v)} /></Field>
        <Field label="จำนวนอัตรา" htmlFor="positions" hint="0 = ไม่ระบุ เก็บในระบบโดยคงรูปแบบการ์ดหน้าบ้านเดิม" error={errors.positions}><TextInput id="positions" required type="number" min={0} max={9999} step={1} value={form.positions} onChange={(v) => set('positions', v)} /></Field>
        <Field label="สถานะเผยแพร่" htmlFor="status"><Select id="status" value={form.status} onChange={(v) => set('status', v)} options={[{ value: 'draft', label: 'ร่าง (ไม่ขึ้นหน้าเว็บ)' }, { value: 'published', label: 'เผยแพร่' }]} /></Field>
        <Field label="การรับสมัคร" htmlFor="isOpen" hint="ปิดรับจะซ่อนจากหน้าบ้าน แต่ยังเก็บข้อมูลไว้ในแอดมิน"><Select id="isOpen" value={form.isOpen ? 'open' : 'closed'} onChange={(v) => set('isOpen', v === 'open')} options={[{ value: 'open', label: 'เปิดรับสมัคร' }, { value: 'closed', label: 'ปิดรับสมัคร' }]} /></Field>
      </div>
      {(['responsibilities', 'qualifications'] as const).map((key) => <section key={key} className="border-line rounded-card border p-5">
        <h2 className="text-lg font-semibold">{key === 'responsibilities' ? 'หน้าที่ความรับผิดชอบ' : 'คุณสมบัติ'}</h2>
        <p className="text-ink-muted mt-1 text-sm">กรอกข้อความไทยและอังกฤษเป็นคู่ อย่างละ 1–30 ข้อ เรียงตามลำดับด้านล่าง</p>
        {errors[key] && <p role="alert" className="text-danger mt-2 text-sm">{errors[key]}</p>}
        <div className="mt-5 space-y-6">{form[key].map((item, index) => <div key={index}>
          <Bilingual name={key + '.' + index} label={'ข้อ ' + (index + 1)} multiline rows={2} value={item} errors={errors} onChange={(v) => set(key, form[key].map((old, i) => i === index ? v : old))} />
          <div className="mt-2 flex flex-wrap gap-2"><Button variant="ghost" size="sm" disabled={index === 0} onClick={() => move(key, index, -1)}>เลื่อนข้อ {index + 1} ขึ้น</Button><Button variant="ghost" size="sm" disabled={index === form[key].length - 1} onClick={() => move(key, index, 1)}>เลื่อนข้อ {index + 1} ลง</Button><Button variant="ghost" size="sm" disabled={form[key].length <= 1} onClick={() => set(key, form[key].filter((_, i) => i !== index))}>ลบข้อ {index + 1}</Button></div>
        </div>)}</div>
        <Button variant="outline" size="sm" className="mt-5" disabled={form[key].length >= 30} onClick={() => set(key, [...form[key], pair()])}>เพิ่มข้อ</Button>
      </section>)}
    </div>
    <div className="mt-10 flex justify-end">{actions}</div>
    <ConfirmDialog open={confirming} title="ตรวจสอบข้อมูลก่อนบันทึก" confirmLabel="บันทึก" cancelLabel="กลับไปแก้ไข" onConfirm={() => void save()} onCancel={() => setConfirming(false)}><p>ตรวจสอบข้อความไทยและอังกฤษ หน้าที่ และคุณสมบัติให้ครบ</p><p>ตำแหน่งจะขึ้นหน้าร่วมงานเมื่อเลือกทั้ง “เผยแพร่” และ “เปิดรับสมัคร”</p></ConfirmDialog>
  </form>
}
