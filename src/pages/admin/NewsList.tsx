import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button } from '@/components/ui'
import { adminNews } from '@/admin/api'
import { useAsyncData } from '@/hooks/useAsyncData'
import { ConfirmDialog } from '@/pages/admin/components/ConfirmDialog'
import { useDeleteConfirm } from '@/pages/admin/components/useDeleteConfirm'
import { formatDate } from '@/pages/admin/formatDate'
import type { AdminNews } from '@/types/admin'

const CATEGORY_LABEL: Record<AdminNews['category'], string> = {
  company: 'ข่าวบริษัท',
  project: 'ข่าวโครงการ',
  product: 'ข่าวสินค้า',
  article: 'บทความ',
  event: 'กิจกรรม',
}

export default function AdminNewsList() {
  // นับเป็น key ให้ useAsyncData โหลดใหม่หลังลบ — ถูกกว่าการเก็บ list ไว้ใน state
  // แล้วตัดออกเอง ซึ่งจะทำให้สิ่งที่เห็นบนจอกับในฐานข้อมูลไม่ตรงกันเมื่อการลบล้ม
  const [reloadKey, setReloadKey] = useState(0)
  const { data, loading, error } = useAsyncData(adminNews.list, [reloadKey])
  const remove = useDeleteConfirm<AdminNews>(
    (item) => adminNews.remove(item.id),
    () => setReloadKey((key) => key + 1),
  )

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-h3 font-semibold">ข่าวสาร</h1>
          <p className="text-ink-muted mt-1 text-sm">
            ข่าวที่สถานะเป็น “ร่าง” จะไม่ขึ้นบนหน้าเว็บ
          </p>
        </div>
        <Button to="/admin/news/new" withArrow>
          เพิ่มข่าวใหม่
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
          <p className="font-medium">ยังไม่มีข่าวในระบบ</p>
          <p className="text-ink-muted mx-auto mt-2 max-w-prose text-sm">
            ข่าวแรกที่เผยแพร่จะไปแสดงที่หน้า /news และหัวข้อ “ข่าวสารล่าสุด” บนหน้าแรกทันที
          </p>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="border-line bg-surface rounded-card mt-6 overflow-x-auto border">
          <table className="w-full text-sm">
            <thead className="border-line text-ink-muted border-b">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium">หัวข้อ</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">หมวด</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">วันที่เผยแพร่</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">สถานะ</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {data.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/news/${item.id}`}
                      className="text-primary-600 font-medium hover:underline"
                    >
                      {item.title.th}
                    </Link>
                    <span className="text-ink-muted mt-0.5 block text-xs">/news/{item.slug}</span>
                  </td>
                  <td className="text-ink-muted px-4 py-3">{CATEGORY_LABEL[item.category]}</td>
                  <td className="text-ink-muted px-4 py-3 whitespace-nowrap">
                    {formatDate(item.publishedAt)}
                  </td>
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
                      <Button variant="ghost" size="sm" to={`/admin/news/${item.id}`}>
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
        title="ลบข่าวนี้ถาวร?"
        confirmLabel="ลบถาวร"
        busyLabel="กำลังลบ…"
        tone="danger"
        busy={remove.busy}
        error={remove.error}
        onConfirm={() => void remove.confirm()}
        onCancel={remove.cancel}
      >
        <p>
          “{remove.target?.title.th}” จะถูกลบออกจากระบบถาวร และหายจากหน้าข่าวสารทันที
        </p>
        <p>การลบย้อนกลับไม่ได้ ถ้าไม่แน่ใจให้เปลี่ยนสถานะเป็น “ร่าง” แทนการลบ</p>
      </ConfirmDialog>
    </>
  )
}
