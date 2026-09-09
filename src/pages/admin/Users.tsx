import { useCallback, useState } from 'react'
import { Badge, Button } from '@/components/ui'
import { adminUsers, auth } from '@/admin/api'
import { useAsyncData } from '@/hooks/useAsyncData'
import { ConfirmDialog } from '@/pages/admin/components/ConfirmDialog'
import { useDeleteConfirm } from '@/pages/admin/components/useDeleteConfirm'
import { Field, TextInput } from '@/pages/admin/components/fields'
import { formatDate } from '@/pages/admin/formatDate'
import type { AdminAccount, AdminUser } from '@/types/admin'

/**
 * ความยาวรหัสผ่านขั้นต่ำ — ต้องตรงกับ `MIN_PASSWORD_LENGTH` ฝั่งเซิร์ฟเวอร์
 *
 * ตรวจซ้ำที่นี่เพื่อบอกผู้ใช้ก่อนกดส่ง ไม่ใช่เพื่อกันข้อมูลเสีย (เซิร์ฟเวอร์เป็นด่านจริง)
 */
const MIN_PASSWORD_LENGTH = 12

/**
 * จัดการบัญชีผู้ใช้หลังบ้าน — `/admin/users`
 *
 * รวมสามงานไว้หน้าเดียวเพราะเป็นเรื่องเดียวกันในหัวของคนใช้: "ใครเข้าระบบได้บ้าง"
 * แยกเป็นสามหน้าจะทำให้ต้องจำว่าเรื่องไหนอยู่ตรงไหน ทั้งที่ทั้งหน้ายาวไม่ถึงสองจอ
 *
 * **ทุกบัญชีสิทธิ์เท่ากัน** ตามที่ระบบออกแบบไว้ — ใครก็เพิ่ม ลบ และตั้งรหัสใหม่ให้กันได้
 * นี่เป็นข้อแลกเปลี่ยนที่ยอมรับได้กับทีมไม่กี่คนที่รู้จักกัน และเป็นสิ่งที่ทำให้
 * "ลืมรหัสผ่าน" แก้ได้เองโดยไม่ต้องเข้าเครื่องเซิร์ฟเวอร์
 */
export default function AdminUsersPage() {
  const [reloadKey, setReloadKey] = useState(0)
  const { data, loading, error } = useAsyncData(adminUsers.list, [reloadKey])
  const { data: me } = useAsyncData(auth.me)

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return (
    <>
      <div>
        <h1 className="text-h3 font-semibold">บัญชีผู้ใช้</h1>
        <p className="text-ink-muted mt-1 text-sm">
          คนที่เข้าหลังบ้านนี้ได้ · ทุกบัญชีมีสิทธิ์เท่ากันทั้งหมด
        </p>
      </div>

      {error && (
        <p role="alert" className="text-danger mt-6 text-sm">
          {error}
        </p>
      )}

      {loading && !data && <p className="text-ink-muted mt-6 text-sm">กำลังโหลด…</p>}

      {data && <AccountTable accounts={data} me={me ?? null} onChanged={reload} />}

      <CreateAccountCard onCreated={reload} />

      <ChangeOwnPasswordCard />
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* ตารางบัญชี                                                                  */
/* -------------------------------------------------------------------------- */

function AccountTable({
  accounts,
  me,
  onChanged,
}: {
  accounts: AdminAccount[]
  me: AdminUser | null
  onChanged: () => void
}) {
  // บัญชีที่กำลังตั้งรหัสใหม่ให้ — เก็บทั้งแถวไว้เพื่อเอาชื่อไปเตือนในฟอร์มว่ากำลังตั้งของใคร
  const [resetting, setResetting] = useState<AdminAccount | null>(null)
  const remove = useDeleteConfirm<AdminAccount>(
    (account) => adminUsers.remove(account.id),
    onChanged,
  )

  return (
    <>
      <div className="border-line bg-surface rounded-card mt-6 overflow-x-auto border">
        <table className="w-full text-sm">
          <thead className="border-line text-ink-muted border-b">
            <tr>
              <th scope="col" className="px-4 py-3 text-left font-medium">
                ชื่อผู้ใช้
              </th>
              <th scope="col" className="px-4 py-3 text-left font-medium">
                ชื่อที่แสดง
              </th>
              <th scope="col" className="px-4 py-3 text-left font-medium">
                สร้างเมื่อ
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody className="divide-line divide-y">
            {accounts.map((account) => {
              const isMe = account.id === me?.id
              return (
                <tr key={account.id}>
                  <td className="px-4 py-3 font-medium">
                    {account.username}
                    {/* ป้ายนี้กันการเผลอกดลบหรือตั้งรหัสของตัวเองโดยไม่ทันดู */}
                    {isMe && (
                      <span className="ms-2 align-middle">
                        <Badge tone="brand">คุณ</Badge>
                      </span>
                    )}
                  </td>
                  <td className="text-ink-muted px-4 py-3">{account.displayName}</td>
                  <td className="text-ink-muted px-4 py-3">{formatDate(account.createdAt)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setResetting(account)}>
                        ตั้งรหัสใหม่
                      </Button>
                      {/*
                        ปุ่มลบของตัวเองถูกปิดไว้ ไม่ใช่ซ่อน — คนที่หาปุ่มไม่เจอจะคิดว่า
                        ระบบพัง ส่วนปุ่มที่กดไม่ได้พร้อมคำอธิบายบอกว่ามันตั้งใจเป็นแบบนี้
                        (เซิร์ฟเวอร์ก็ปฏิเสธซ้ำอีกชั้นถ้ามีคนยิงตรงมา)
                      */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => remove.ask(account)}
                        disabled={isMe}
                        title={isMe ? 'ลบบัญชีของตัวเองไม่ได้' : undefined}
                      >
                        ลบ
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {resetting && (
        <ResetPasswordCard
          account={resetting}
          isMe={resetting.id === me?.id}
          onClose={() => setResetting(null)}
        />
      )}

      <ConfirmDialog
        open={remove.target !== null}
        title="ลบบัญชีนี้ถาวร?"
        confirmLabel="ลบถาวร"
        busyLabel="กำลังลบ…"
        tone="danger"
        busy={remove.busy}
        error={remove.error}
        onConfirm={() => void remove.confirm()}
        onCancel={remove.cancel}
      >
        <p>
          “{remove.target?.username}” ({remove.target?.displayName}) จะเข้าหลังบ้านไม่ได้อีก
          และเครื่องที่ล็อกอินค้างไว้จะหลุดออกทันที
        </p>
        <p>การลบย้อนกลับไม่ได้ ถ้าอยากให้กลับมาใช้ได้อีกต้องสร้างบัญชีใหม่</p>
      </ConfirmDialog>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* ตั้งรหัสใหม่ให้คนที่ลืม                                                        */
/* -------------------------------------------------------------------------- */

function ResetPasswordCard({
  account,
  isMe,
  onClose,
}: {
  account: AdminAccount
  isMe: boolean
  onClose: () => void
}) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [state, setState] = useState<FormState>(idle)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (password !== confirm) {
      setState({ busy: false, error: 'รหัสผ่านสองช่องไม่ตรงกัน', done: null })
      return
    }

    setState({ busy: true, error: null, done: null })
    try {
      await adminUsers.setPassword(account.id, password)
      setPassword('')
      setConfirm('')
      setState({
        busy: false,
        error: null,
        done: `ตั้งรหัสใหม่ให้ "${account.username}" แล้ว — บอกรหัสนี้กับเจ้าของบัญชีแล้วให้เขาเปลี่ยนเองทันทีที่เข้าระบบได้`,
      })
    } catch (cause) {
      setState({
        busy: false,
        error: cause instanceof Error ? cause.message : 'ตั้งรหัสใหม่ไม่สำเร็จ',
        done: null,
      })
    }
  }

  return (
    <section className="border-primary-400 bg-surface rounded-card mt-4 border p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">ตั้งรหัสใหม่ให้ {account.username}</h2>
          <p className="text-ink-muted mt-1 text-sm">
            ใช้ตอนเจ้าของบัญชีลืมรหัสผ่าน · ไม่ต้องรู้รหัสเดิม
            {isMe && ' · นี่คือบัญชีของคุณเอง'}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ปิด
        </Button>
      </div>

      <form onSubmit={(event) => void handleSubmit(event)} className="mt-5 max-w-md space-y-4">
        <Field
          label="รหัสผ่านใหม่"
          htmlFor="reset-password"
          hint={`อย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร`}
        >
          <TextInput
            id="reset-password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
          />
        </Field>

        <Field label="พิมพ์รหัสผ่านใหม่อีกครั้ง" htmlFor="reset-confirm">
          <TextInput
            id="reset-confirm"
            type="password"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
            required
          />
        </Field>

        <FormMessage state={state} />

        <Button type="submit" disabled={state.busy}>
          {state.busy ? 'กำลังบันทึก…' : 'ตั้งรหัสใหม่'}
        </Button>
      </form>

      <p className="text-ink-muted mt-4 text-xs">
        เมื่อตั้งรหัสใหม่ เครื่องทุกเครื่องที่บัญชีนี้ล็อกอินค้างไว้จะหลุดออกจากระบบทันที
      </p>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* เพิ่มบัญชีใหม่                                                                */
/* -------------------------------------------------------------------------- */

function CreateAccountCard({ onCreated }: { onCreated: () => void }) {
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [state, setState] = useState<FormState>(idle)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (password !== confirm) {
      setState({ busy: false, error: 'รหัสผ่านสองช่องไม่ตรงกัน', done: null })
      return
    }

    setState({ busy: true, error: null, done: null })
    try {
      await adminUsers.create({ username, displayName, password })
      setState({
        busy: false,
        error: null,
        done: `สร้างบัญชี "${username}" แล้ว — บอกรหัสผ่านกับเจ้าของบัญชีแล้วให้เขาเปลี่ยนเองหลังเข้าระบบครั้งแรก`,
      })
      setUsername('')
      setDisplayName('')
      setPassword('')
      setConfirm('')
      onCreated()
    } catch (cause) {
      setState({
        busy: false,
        error: cause instanceof Error ? cause.message : 'สร้างบัญชีไม่สำเร็จ',
        done: null,
      })
    }
  }

  return (
    <section className="border-line bg-surface rounded-card mt-10 border p-6">
      <h2 className="text-lg font-semibold">เพิ่มบัญชีใหม่</h2>
      <p className="text-ink-muted mt-1 text-sm">
        บัญชีที่สร้างจากหน้านี้เข้าหลังบ้านได้ทันที และแก้ข้อมูลได้เท่ากับบัญชีของคุณ
      </p>

      <form onSubmit={(event) => void handleSubmit(event)} className="mt-5 max-w-md space-y-4">
        <Field
          label="ชื่อผู้ใช้"
          htmlFor="new-username"
          hint="ตัวพิมพ์เล็ก a-z 0-9 จุด ขีดล่าง ขีดกลาง · ใช้ล็อกอิน เปลี่ยนทีหลังไม่ได้"
        >
          <TextInput
            id="new-username"
            value={username}
            /*
              บังคับพิมพ์เล็กตั้งแต่ตอนพิมพ์ ไม่ใช่ปล่อยให้เซิร์ฟเวอร์ตีกลับ — คนกรอกชื่อ
              ตัวเองด้วยตัวใหญ่เป็นเรื่องปกติ และการโดนปฏิเสธหลังกรอกครบทั้งฟอร์มน่ารำคาญ
              กว่าการเห็นตัวอักษรกลายเป็นพิมพ์เล็กเองตอนพิมพ์
            */
            onChange={(value) => setUsername(value.toLowerCase())}
            autoComplete="off"
            required
          />
        </Field>

        <Field label="ชื่อที่แสดงในระบบ" htmlFor="new-display-name" hint="เช่น สมชาย ใจดี">
          <TextInput
            id="new-display-name"
            value={displayName}
            onChange={setDisplayName}
            autoComplete="off"
            required
          />
        </Field>

        <Field
          label="รหัสผ่าน"
          htmlFor="new-password"
          hint={`อย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร`}
        >
          <TextInput
            id="new-password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
          />
        </Field>

        <Field label="พิมพ์รหัสผ่านอีกครั้ง" htmlFor="new-password-confirm">
          <TextInput
            id="new-password-confirm"
            type="password"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
            required
          />
        </Field>

        <FormMessage state={state} />

        <Button type="submit" disabled={state.busy}>
          {state.busy ? 'กำลังสร้าง…' : 'สร้างบัญชี'}
        </Button>
      </form>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* เปลี่ยนรหัสผ่านของตัวเอง                                                       */
/* -------------------------------------------------------------------------- */

function ChangeOwnPasswordCard() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [state, setState] = useState<FormState>(idle)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (next !== confirm) {
      setState({ busy: false, error: 'รหัสผ่านใหม่สองช่องไม่ตรงกัน', done: null })
      return
    }

    setState({ busy: true, error: null, done: null })
    try {
      await adminUsers.changeOwnPassword(current, next)
      setCurrent('')
      setNext('')
      setConfirm('')
      setState({ busy: false, error: null, done: 'เปลี่ยนรหัสผ่านเรียบร้อย' })
    } catch (cause) {
      setState({
        busy: false,
        error: cause instanceof Error ? cause.message : 'เปลี่ยนรหัสผ่านไม่สำเร็จ',
        done: null,
      })
    }
  }

  return (
    <section className="border-line bg-surface rounded-card mt-6 border p-6">
      <h2 className="text-lg font-semibold">เปลี่ยนรหัสผ่านของฉัน</h2>
      <p className="text-ink-muted mt-1 text-sm">
        ต้องกรอกรหัสเดิมด้วย · เปลี่ยนแล้วเครื่องอื่นที่ล็อกอินค้างไว้จะหลุดออกจากระบบ
      </p>

      <form onSubmit={(event) => void handleSubmit(event)} className="mt-5 max-w-md space-y-4">
        <Field label="รหัสผ่านปัจจุบัน" htmlFor="current-password">
          <TextInput
            id="current-password"
            type="password"
            value={current}
            onChange={setCurrent}
            autoComplete="current-password"
            required
          />
        </Field>

        <Field
          label="รหัสผ่านใหม่"
          htmlFor="next-password"
          hint={`อย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร`}
        >
          <TextInput
            id="next-password"
            type="password"
            value={next}
            onChange={setNext}
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
          />
        </Field>

        <Field label="พิมพ์รหัสผ่านใหม่อีกครั้ง" htmlFor="next-password-confirm">
          <TextInput
            id="next-password-confirm"
            type="password"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
            required
          />
        </Field>

        <FormMessage state={state} />

        <Button type="submit" disabled={state.busy}>
          {state.busy ? 'กำลังบันทึก…' : 'เปลี่ยนรหัสผ่าน'}
        </Button>
      </form>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* สถานะฟอร์ม — สามฟอร์มในหน้านี้ใช้ชุดเดียวกัน                                    */
/* -------------------------------------------------------------------------- */

interface FormState {
  busy: boolean
  error: string | null
  done: string | null
}

const idle: FormState = { busy: false, error: null, done: null }

function FormMessage({ state }: { state: FormState }) {
  if (state.error) {
    return (
      <p role="alert" className="text-danger text-sm">
        {state.error}
      </p>
    )
  }
  if (state.done) {
    // ไม่ใช่ role="alert" เพราะข้อความสำเร็จไม่ใช่เรื่องด่วนที่ต้องขัดจังหวะการอ่าน
    // แต่ต้อง aria-live เพื่อให้ screen reader รู้ว่ามีอะไรเปลี่ยนหลังกดปุ่ม
    return (
      <p aria-live="polite" className="text-primary-600 text-sm">
        {state.done}
      </p>
    )
  }
  return null
}
