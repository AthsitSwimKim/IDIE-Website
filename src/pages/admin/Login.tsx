import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui'
import { auth } from '@/admin/api'
import { Field, TextInput } from '@/pages/admin/components/fields'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  /**
   * ปลายทางหลังล็อกอิน — มาจาก `?next=` ที่ AdminShell แนบไว้ตอนเด้งออก
   *
   * **ยอมรับเฉพาะ path ที่ขึ้นต้นด้วย `/admin/`** ถ้ารับค่าอะไรก็ได้ จะกลายเป็น
   * open redirect: ส่งลิงก์ `?next=https://evil.example` ให้พนักงาน แล้วหลังล็อกอิน
   * เขาจะถูกพาไปหน้าปลอมที่หน้าตาเหมือนระบบจริงโดยที่ URL ต้นทางดูน่าเชื่อถือ
   */
  const requested = params.get('next')
  const next = requested?.startsWith('/admin/') ? requested : '/admin/news'

  // ถ้าเปิดหน้านี้ทั้งที่ล็อกอินค้างอยู่แล้ว ให้ผ่านไปเลย ไม่ต้องกรอกซ้ำ
  useEffect(() => {
    let cancelled = false
    auth
      .me()
      .then((user) => {
        if (!cancelled && user) navigate(next, { replace: true })
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [navigate, next])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await auth.login(username, password)
      navigate(next, { replace: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'เข้าสู่ระบบไม่สำเร็จ')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-surface-alt grid min-h-dvh place-items-center p-6">
      <div className="border-line bg-surface rounded-card w-full max-w-md border p-8">
        <p className="text-eyebrow text-primary-600 uppercase">IDIE Administrator</p>
        <h1 className="text-h3 mt-2 font-semibold">เข้าสู่ระบบ</h1>
        <p className="text-ink-muted mt-2 text-sm">
          สำหรับทีมงานที่ดูแลข่าวสารและผลงานบนเว็บไซต์
        </p>

        <form onSubmit={(event) => void handleSubmit(event)} className="mt-6 space-y-4">
          <Field label="ชื่อผู้ใช้" htmlFor="username">
            <TextInput
              id="username"
              value={username}
              onChange={setUsername}
              autoComplete="username"
              required
            />
          </Field>

          <Field label="รหัสผ่าน" htmlFor="password">
            <TextInput
              id="password"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              required
            />
          </Field>

          {error && (
            <p role="alert" className="text-danger text-sm">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth disabled={busy}>
            {busy ? 'กำลังตรวจสอบ…' : 'เข้าสู่ระบบ'}
          </Button>
        </form>

        <p className="text-ink-muted mt-6 text-xs">
          ลืมรหัสผ่าน หรือต้องการบัญชีใหม่ — ติดต่อผู้ดูแลเซิร์ฟเวอร์
          บัญชีสร้างจากเครื่องเซิร์ฟเวอร์เท่านั้น ไม่มีหน้าสมัครบนเว็บ
        </p>
      </div>
    </div>
  )
}
