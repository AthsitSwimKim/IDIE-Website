import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button } from '@/components/ui'
import { adminSiteReferences } from '@/admin/api'
import { useAsyncData } from '@/hooks/useAsyncData'
import type { AdminSiteReference } from '@/types/admin'

/**
 * รายการอ้างอิงหน้างาน — `/admin/site-references`
 *
 * คนละชุดกับ "ผลงาน" โดยตั้งใจ ตารางในฐานข้อมูลก็แยกกัน อันนี้คือกล่องสรุปสั้น ๆ
 * บนหน้า /reference ส่วนผลงานคือหน้ารายละเอียดเต็มที่มีภาพรวมและแกลเลอรี
 */
export default function AdminSiteReferenceList() {
  // นับเป็น key ให้ useAsyncData โหลดใหม่หลังลบ — ถูกกว่าการเก็บ list ไว้ใน state
  // แล้วตัดออกเอง ซึ่งจะทำให้สิ่งที่เห็นบนจอกับในฐานข้อมูลไม่ตรงกันเมื่อการลบล้ม
  const [reloadKey, setReloadKey] = useState(0)
  const { data, loading, error } = useAsyncData(adminSiteReferences.list, [reloadKey])
  const [busyId, setBusyId] = useState<number | null>(null)

  const handleDelete = useCallback(async (item: AdminSiteReference) => {
    if (!window.confirm(`ลบรายการ "${item.name.th}" ถาวรหรือไม่? การลบย้อนกลับไม่ได้`)) return
    setBusyId(item.id)
    try {
      await adminSiteReferences.remove(item.id)
      setReloadKey((key) => key + 1)
    } catch (cause) {
      window.alert(cause instanceof Error ? cause.message : 'ลบไม่สำเร็จ')
    } finally {
      setBusyId(null)
    }
  }, [])

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-h3 font-semibold">อ้างอิงหน้างาน</h1>
          <p className="text-ink-muted mt-1 text-sm">
            กล่องข้อมูลที่แสดงบนหน้า /reference · รายการที่เป็น “ร่าง” จะไม่ขึ้นบนหน้าเว็บ
          </p>
        </div>
        <Button to="/admin/site-references/new" withArrow>
          เพิ่มรายการใหม่
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
          <p className="font-medium">ยังไม่มีรายการอ้างอิงในระบบ</p>
          <p className="text-ink-muted mx-auto mt-2 max-w-prose text-sm">
            รายการที่เผยแพร่จะไปแสดงเป็นกล่องข้อมูลบนหน้าลูกค้าอ้างอิงทันที
          </p>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="border-line bg-surface rounded-card mt-6 overflow-x-auto border">
          <table className="w-full text-sm">
            <thead className="border-line text-ink-muted border-b">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium">
                  ลำดับ
                </th>
                <th scope="col" className="px-4 py-3 text-left font-medium">
                  ชื่อโครงการ
                </th>
                <th scope="col" className="px-4 py-3 text-left font-medium">
                  ลูกค้า
                </th>
                <th scope="col" className="px-4 py-3 text-left font-medium">
                  สถานะ
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {data.map((item) => (
                <tr key={item.id}>
                  <td className="stat-figure text-ink-muted px-4 py-3">{item.position}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/site-references/${item.id}`}
                      className="text-primary-600 font-medium hover:underline"
                    >
                      {item.name.th}
                    </Link>
                    <span className="text-ink-muted mt-0.5 block text-xs">{item.location.th}</span>
                  </td>
                  <td className="text-ink-muted px-4 py-3">{item.customer.th}</td>
                  <td className="px-4 py-3">
                    {item.status === 'published' ? (
                      <Badge tone="brand">เผยแพร่แล้ว</Badge>
                    ) : (
                      <Badge>ร่าง</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busyId === item.id}
                      onClick={() => void handleDelete(item)}
                    >
                      {busyId === item.id ? 'กำลังลบ…' : 'ลบ'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
