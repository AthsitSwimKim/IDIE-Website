
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button } from '@/components/ui'
import { adminJobs } from '@/admin/api'
import { useAsyncData } from '@/hooks/useAsyncData'
import { ConfirmDialog } from './components/ConfirmDialog'
import { useDeleteConfirm } from './components/useDeleteConfirm'
import type { AdminJob } from '@/types/admin'

export default function AdminJobList() {
  const [key, setKey] = useState(0)
  const { data, loading, error, reload } = useAsyncData(adminJobs.list, [key])
  const remove = useDeleteConfirm<AdminJob>((item) => adminJobs.remove(item.id), () => setKey((v) => v + 1))
  return <>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-h3 font-semibold">ตำแหน่งที่เปิดรับ</h1>
        <p className="text-ink-muted mt-1 text-sm">หน้าร่วมงานแสดงเฉพาะตำแหน่งที่เผยแพร่และเปิดรับสมัคร</p></div>
      <Button to="/admin/jobs/new" withArrow>เพิ่มตำแหน่งใหม่</Button>
    </div>
    {error && <div role="alert" className="mt-6"><p className="text-danger text-sm">{error}</p><Button variant="outline" size="sm" className="mt-3" onClick={reload}>ลองใหม่</Button></div>}
    {loading && !data && <p className="text-ink-muted mt-6 text-sm">กำลังโหลด…</p>}
    {data?.length === 0 && <p className="border-line rounded-card text-ink-muted mt-6 border border-dashed p-8">ยังไม่มีตำแหน่งในระบบ เพิ่มตำแหน่งใหม่ได้จากปุ่มด้านบน</p>}
    {data && data.length > 0 && <div className="border-line bg-surface rounded-card mt-6 overflow-x-auto border">
      <table className="w-full text-sm"><thead className="border-line text-ink-muted border-b"><tr>
        {['ลำดับ', 'ตำแหน่ง / สถานที่', 'สถานะเผยแพร่', 'รับสมัคร', 'จัดการ'].map((label) => <th key={label} aria-label={label} scope="col" className="px-4 py-3 text-left font-medium">{label}</th>)}
      </tr></thead><tbody className="divide-line divide-y">{data.map((item) => <tr key={item.id}>
        <td className="stat-figure text-ink-muted px-4 py-3">{item.position}</td>
        <td className="px-4 py-3"><Link to={'/admin/jobs/' + item.id} className="text-primary-600 font-medium hover:underline">{item.title.th}</Link><span className="text-ink-muted mt-1 block text-xs">{item.department.th} · {item.location.th}</span></td>
        <td className="px-4 py-3"><Badge tone={item.status === 'published' ? 'brand' : undefined}>{item.status === 'published' ? 'เผยแพร่แล้ว' : 'ร่าง'}</Badge></td>
        <td className="px-4 py-3"><Badge tone={item.isOpen ? 'brand' : undefined}>{item.isOpen ? 'เปิดรับ' : 'ปิดรับ'}</Badge></td>
        <td aria-label={"จัดการตำแหน่ง " + item.title.th} className="px-4 py-3"><div className="flex gap-1"><Button variant="ghost" size="sm" to={'/admin/jobs/' + item.id}>แก้ไข</Button><Button variant="ghost" size="sm" onClick={() => remove.ask(item)}>ลบ</Button></div></td>
      </tr>)}</tbody></table>
    </div>}
    <ConfirmDialog open={remove.target !== null} title="ลบตำแหน่งนี้ถาวร?" confirmLabel="ลบถาวร" busyLabel="กำลังลบ…" tone="danger" busy={remove.busy} error={remove.error} onConfirm={() => void remove.confirm()} onCancel={remove.cancel}>
      <p>“{remove.target?.title.th}” จะถูกลบถาวรและหายจากหน้าร่วมงาน หากต้องการเก็บไว้ ให้แก้ไขเป็นปิดรับสมัครแทน</p>
    </ConfirmDialog>
  </>
}
