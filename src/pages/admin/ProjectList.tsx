import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button } from '@/components/ui'
import { adminProjects } from '@/admin/api'
import { useAsyncData } from '@/hooks/useAsyncData'
import { ConfirmDialog } from '@/pages/admin/components/ConfirmDialog'
import { useDeleteConfirm } from '@/pages/admin/components/useDeleteConfirm'
import type { AdminProject } from '@/types/admin'
import { INDUSTRY_LABEL } from '@/pages/admin/industryLabels'

export default function AdminProjectList() {
  const [reloadKey, setReloadKey] = useState(0)
  const { data, loading, error } = useAsyncData(adminProjects.list, [reloadKey])
  const remove = useDeleteConfirm<AdminProject>(
    (item) => adminProjects.remove(item.id),
    () => setReloadKey((key) => key + 1),
  )

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-h3 font-semibold">ผลงาน</h1>
          <p className="text-ink-muted mt-1 text-sm">
            ผลงานคือ “เราทำอะไรให้” — ต่างจากหน้าลูกค้าอ้างอิงที่บอกแค่ว่า “ลูกค้าคือใคร”
          </p>
        </div>
        <Button to="/admin/projects/new" withArrow>
          เพิ่มผลงานใหม่
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-danger mt-6 text-sm">
          {error}
        </p>
      )}

      {loading && !data && <p className="text-ink-muted mt-6 text-sm">กำลังโหลด…</p>}

      {data && data.length === 0 && (
        <div className="border-line bg-surface rounded-card mt-6 border border-dashed p-10 text-center">
          <p className="font-medium">ยังไม่มีผลงานในระบบ</p>
          <p className="text-ink-muted mx-auto mt-2 max-w-prose text-sm">
            ผลงานชิ้นแรกที่เผยแพร่จะขึ้นบนหน้า /projects ทันที
            ตอนนี้หน้านั้นแจ้งผู้เข้าชมว่ายังไม่มีผลงานให้แสดง
          </p>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="border-line bg-surface rounded-card mt-6 overflow-x-auto border">
          <table className="w-full text-sm">
            <thead className="border-line text-ink-muted border-b">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium">ชื่อผลงาน</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">ลูกค้า</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">อุตสาหกรรม</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">ปี</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">สถานะ</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {data.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/projects/${item.id}`}
                      className="text-primary-600 font-medium hover:underline"
                    >
                      {item.name.th}
                    </Link>
                    <span className="text-ink-muted mt-0.5 block text-xs">
                      /projects/{item.slug}
                    </span>
                  </td>
                  <td className="text-ink-muted px-4 py-3">{item.client.th}</td>
                  <td className="text-ink-muted px-4 py-3">{INDUSTRY_LABEL[item.industry]}</td>
                  <td className="text-ink-muted px-4 py-3">{item.year ?? '—'}</td>
                  <td className="px-4 py-3">
                    {item.status === 'published' ? (
                      <Badge tone="brand">เผยแพร่แล้ว</Badge>
                    ) : (
                      <Badge>ร่าง</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {/*
                      ปุ่มแก้ไขซ้ำกับลิงก์ที่ชื่อรายการ แต่จงใจให้มี — คนที่ไม่คุ้นตารางแบบนี้
                      จะมองหาปุ่มในคอลัมน์ "จัดการ" ไม่ได้เดาว่าต้องกดที่ชื่อ และการมีปุ่ม
                      แก้ไขคู่กับปุ่มลบทำให้ปุ่มลบไม่ใช่ปุ่มเดียวที่กดได้ในแถว
                    */}
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" to={`/admin/projects/${item.id}`}>
                        แก้ไข
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => remove.ask(item)}
                      >
                        ลบ
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={remove.target !== null}
        title="ลบผลงานนี้ถาวร?"
        confirmLabel="ลบถาวร"
        busyLabel="กำลังลบ…"
        tone="danger"
        busy={remove.busy}
        error={remove.error}
        onConfirm={() => void remove.confirm()}
        onCancel={remove.cancel}
      >
        <p>
          “{remove.target?.name.th}” จะถูกลบออกจากระบบถาวร พร้อมขอบเขตงานและภาพประกอบทั้งหมด
        </p>
        <p>การลบย้อนกลับไม่ได้ ถ้าไม่แน่ใจให้เปลี่ยนสถานะเป็น “ร่าง” แทนการลบ</p>
      </ConfirmDialog>
    </>
  )
}
