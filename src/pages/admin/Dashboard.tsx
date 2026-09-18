import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button } from '@/components/ui'
import { adminDashboard, publicContent } from '@/admin/api'
import { useAsyncData } from '@/hooks/useAsyncData'
import { formatDate } from '@/pages/admin/formatDate'
import type { AdminContentCount, AdminDashboardData } from '@/types/admin'

/** PHP returns only the counts, draft labels and five recent headlines used here. */
export default function AdminDashboard() {
  const [publishing, setPublishing] = useState(false)
  const [publishMessage, setPublishMessage] = useState<string | null>(null)
  async function refreshPublicContent() {
    setPublishing(true); setPublishMessage(null)
    try {
      await publicContent.refresh()
      setPublishMessage('อัปเดตข้อมูลหน้าเว็บไซต์แล้ว')
    } catch (cause) {
      setPublishMessage(cause instanceof Error ? cause.message : 'อัปเดตข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง')
    } finally { setPublishing(false) }
  }
  const { data, loading, error, reload } = useAsyncData(adminDashboard.get)

  return (
    <>
      <div>
        <h1 className="text-h3 font-semibold">ภาพรวม</h1>
        <p className="text-ink-muted mt-1 text-sm">
          สรุปสิ่งที่อยู่บนเว็บตอนนี้ และสิ่งที่ยังค้างอยู่ในระบบ
        </p>
      </div>

      <div className="border-line bg-surface rounded-card mt-6 border p-6">
        <h2 className="text-lg font-semibold">ข้อมูลหน้าเว็บไซต์</h2>
        <p className="text-ink-muted mt-1 text-sm">การบันทึกรายการจะอัปเดตหน้าเว็บไซต์ให้อัตโนมัติ กดปุ่มนี้หลังอัปโหลดเว็บไซต์เวอร์ชันใหม่</p>
        <Button variant="outline" size="sm" className="mt-4" disabled={publishing} onClick={() => void refreshPublicContent()}>
          {publishing ? 'กำลังอัปเดต…' : 'อัปเดตข้อมูลหน้าเว็บไซต์'}
        </Button>
        <div className="mt-4 flex flex-wrap gap-2"><Button variant="outline" size="sm" to="/admin/jobs">จัดการตำแหน่งที่เปิดรับ</Button><Button variant="ghost" size="sm" to="/admin/jobs/new">เพิ่มตำแหน่งใหม่</Button></div>
        {publishMessage && <output className="mt-3 block text-sm">{publishMessage}</output>}
      </div>

      {error && (
        <div role="alert" className="border-line bg-surface rounded-card mt-6 border p-6">
          <p className="text-danger text-sm">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={reload}>
            ลองใหม่อีกครั้ง
          </Button>
        </div>
      )}

      {loading && !data && <p className="text-ink-muted mt-6 text-sm">กำลังโหลด…</p>}

      {data && <DashboardBody data={data} />}
    </>
  )
}

function DashboardBody({ data }: { data: AdminDashboardData }) {
  const { stats, drafts, recentNews, visitors } = data

  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="ข่าวสาร" counts={stats.news} listTo="/admin/news" newTo="/admin/news/new" />
        <StatCard
          label="ผลงาน"
          counts={stats.projects}
          listTo="/admin/projects"
          newTo="/admin/projects/new"
        />
        <StatCard
          label="อ้างอิงหน้างาน"
          counts={stats['site-references']}
          listTo="/admin/site-references"
          newTo="/admin/site-references/new"
        />
      </div>

      {visitors !== null && <VisitorPanel total={visitors} />}

      <section className="mt-10">
        <h2 className="text-lg font-semibold">ร่างที่ยังไม่ได้เผยแพร่</h2>
        <p className="text-ink-muted mt-1 text-sm">
          รายการเหล่านี้ยังไม่ขึ้นหน้าเว็บ ผู้เข้าชมมองไม่เห็น
        </p>

        {drafts.length === 0 ? (
          <p className="border-line bg-surface rounded-card text-ink-muted mt-4 border border-dashed p-6 text-sm">
            ไม่มีร่างค้างอยู่ — ทุกอย่างในระบบเผยแพร่แล้ว
          </p>
        ) : (
          <ul className="border-line bg-surface rounded-card divide-line mt-4 divide-y border">
            {drafts.map((item) => (
              <li key={item.key} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                <Badge>{item.kind}</Badge>
                <Link to={item.to} className="text-primary-600 text-sm font-medium hover:underline">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">ข่าวล่าสุด</h2>

        {recentNews.length === 0 ? (
          <p className="border-line bg-surface rounded-card text-ink-muted mt-4 border border-dashed p-6 text-sm">
            ยังไม่มีข่าวในระบบ
          </p>
        ) : (
          <ul className="border-line bg-surface rounded-card divide-line mt-4 divide-y border">
            {recentNews.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3"
              >
                <Link
                  to={`/admin/news/${item.id}`}
                  className="text-primary-600 min-w-0 text-sm font-medium hover:underline"
                >
                  {item.title}
                </Link>
                <span className="text-ink-muted text-xs whitespace-nowrap">
                  {formatDate(item.publishedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

/**
 * ยอดผู้เข้าชมเว็บไซต์สาธารณะ
 *
 * แยกออกมาเป็นแถวของตัวเอง ไม่ปนกับการ์ดสามใบข้างบน เพราะเป็นตัวเลขคนละชนิด —
 * สามใบนั้นคือ "ของที่เราลงไว้" ซึ่งกดเข้าไปแก้ได้ ส่วนอันนี้คือ "คนที่เข้ามาดู"
 * ซึ่งแก้อะไรไม่ได้ การวางปนกันจะชวนให้เข้าใจว่ามันเป็นของชุดเดียวกัน
 *
 * มีคำอธิบายวิธีนับกำกับไว้ด้วย เพราะตัวเลขที่ไม่บอกว่านับอย่างไรจะถูกตีความ
 * ผิดเสมอ — คนอ่านมักคิดว่าเป็นจำนวนหน้าที่ถูกเปิด แล้วสงสัยว่าทำไมน้อยจัง
 */
function VisitorPanel({ total }: { total: number }) {
  return (
    <section className="border-line bg-surface rounded-card mt-4 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border p-6">
      <div>
        <h2 className="text-ink-muted text-sm font-medium">ผู้เข้าชมเว็บไซต์</h2>
        <p className="mt-3 flex items-baseline gap-2">
          <span className="stat-figure text-h2 font-semibold">{total.toLocaleString('th-TH')}</span>
          <span className="text-ink-muted text-sm">ครั้ง</span>
        </p>
      </div>

      <p className="text-ink-muted max-w-prose text-xs">
        นับหนึ่งครั้งต่อหนึ่งเบราว์เซอร์ต่อวัน ไม่ได้นับทุกหน้าที่เปิด — คนเดิมที่กดดูสิบหน้า
        ในการเข้าครั้งเดียวจึงนับเป็นหนึ่ง ตัวเลขนี้แสดงอยู่ท้ายหน้าเว็บสาธารณะด้วย
      </p>
    </section>
  )
}

/**
 * การ์ดสรุปหนึ่งประเภทเนื้อหา
 *
 * แสดง "ที่ขึ้นเว็บแล้ว" เป็นตัวเลขหลัก ไม่ใช่ยอดรวม เพราะยอดรวมนับร่างเข้าไปด้วย
 * ซึ่งผู้เข้าชมมองไม่เห็น การเห็นเลข 12 แล้วเข้าใจว่าเว็บมีข่าว 12 ข่าวทั้งที่จริง
 * มี 9 คือความเข้าใจผิดที่ราคาแพงกว่าการแสดงเลขเพิ่มอีกตัว
 */
function StatCard({
  label,
  counts,
  listTo,
  newTo,
}: {
  label: string
  counts: AdminContentCount
  listTo: string
  newTo: string
}) {
  const { published, draft } = counts

  return (
    <div className="border-line bg-surface rounded-card flex flex-col border p-6">
      <h2 className="text-ink-muted text-sm font-medium">{label}</h2>

      <p className="mt-3 flex items-baseline gap-2">
        <span className="stat-figure text-h2 font-semibold">{published}</span>
        <span className="text-ink-muted text-sm">เผยแพร่แล้ว</span>
      </p>

      <p className="text-ink-muted mt-1 text-sm">
        {draft > 0 ? `อีก ${draft} รายการยังเป็นร่าง` : 'ไม่มีร่างค้าง'}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" to={listTo}>
          ดูรายการ
        </Button>
        <Button variant="ghost" size="sm" to={newTo}>
          เพิ่มใหม่
        </Button>
      </div>
    </div>
  )
}
