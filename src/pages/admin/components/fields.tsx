import { useId, useRef, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui'
import { CloseIcon } from '@/components/ui/icons'
import { uploadImage } from '@/admin/api'
import type { LocalizedText } from '@/types/content'
import type { UploadedImage } from '@/types/admin'
import { cn } from '@/utils/cn'

/**
 * ชุดช่องกรอกของหน้าแอดมิน
 *
 * แยกจาก `src/components/ui/` โดยตั้งใจ — ของในนั้นคือภาษาภาพของเว็บที่ลูกค้าเห็น
 * ส่วนนี่คือเครื่องมือทำงานภายใน คนละกลุ่มผู้ใช้และคนละข้อจำกัด (ตรงนี้ความหนาแน่น
 * ของข้อมูลสำคัญกว่าความสวย) การปนกันจะทำให้เวลาแก้หน้าตาเว็บต้องระวังว่าจะพัง
 * หน้าแอดมินไปด้วย
 *
 * **ทุกช่องข้อความเป็นคู่ th/en เสมอ** เพราะ IDIE เลือกไว้ว่าต้องกรอกครบทั้งสองภาษา
 * การมี component เดียวที่บังคับเรื่องนี้ ดีกว่าหวังว่าคนทำฟอร์มจะไม่ลืมช่อง en
 */

const inputClass =
  'border-line focus:border-primary-400 min-h-11 w-full rounded border px-3 py-2 text-sm outline-none disabled:opacity-60'

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string
  hint?: string
  error?: string
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-ink block text-sm font-medium">
        {label}
      </label>
      {hint && <p className="text-ink-muted mt-0.5 text-xs">{hint}</p>}
      <div className="mt-2">{children}</div>
      {error && (
        // role="alert" ให้ screen reader อ่านทันทีที่ข้อความผิดพลาดโผล่
        // ไม่ใช่ต้องให้ผู้ใช้ tab กลับมาเจอเอง
        <p role="alert" className="text-danger mt-1.5 text-xs">
          {error}
        </p>
      )}
    </div>
  )
}

export function TextInput({
  value,
  onChange,
  ...rest
}: {
  value: string
  onChange: (value: string) => void
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return (
    <input
      {...rest}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(inputClass, rest.className)}
    />
  )
}

/**
 * ช่องคู่ไทย/อังกฤษ
 *
 * วางเรียงกันในแนวนอนบนจอกว้าง เพื่อให้เห็นสองภาษาพร้อมกันขณะพิมพ์ — คนแปล
 * ต้องเทียบความยาวและน้ำเสียงของสองภาษาไปด้วย การให้เลื่อนหาอีกช่องทำให้พลาดง่าย
 */
export function Bilingual({
  label,
  hint,
  value,
  onChange,
  errors,
  multiline = false,
  rows = 4,
  name,
}: {
  label: string
  hint?: string
  value: LocalizedText
  onChange: (value: LocalizedText) => void
  errors?: Record<string, string>
  multiline?: boolean
  rows?: number
  /** ชื่อฟิลด์ตามที่ API ใช้ เช่น `title` — ใช้จับคู่กับ error ที่ API ส่งกลับ */
  name: string
}) {
  const id = useId()
  const shared = { rows, className: cn(inputClass, multiline && 'min-h-0 leading-relaxed') }

  const box = (lang: 'th' | 'en') => {
    const fieldId = `${id}-${lang}`
    const error = errors?.[`${name}.${lang}`]
    return (
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor={fieldId} className="text-ink-muted text-eyebrow uppercase">
            {lang === 'th' ? 'ไทย' : 'English'}
          </label>
          {error && (
            <span role="alert" className="text-danger text-xs">
              {error}
            </span>
          )}
        </div>
        {multiline ? (
          <textarea
            id={fieldId}
            lang={lang}
            value={value[lang]}
            onChange={(event) => onChange({ ...value, [lang]: event.target.value })}
            {...shared}
          />
        ) : (
          <input
            id={fieldId}
            lang={lang}
            type="text"
            value={value[lang]}
            onChange={(event) => onChange({ ...value, [lang]: event.target.value })}
            className={inputClass}
          />
        )}
      </div>
    )
  }

  return (
    <fieldset className="border-0 p-0">
      <legend className="text-ink text-sm font-medium">{label}</legend>
      {hint && <p className="text-ink-muted mt-0.5 text-xs">{hint}</p>}
      <div className="mt-2 grid gap-3 md:grid-cols-2">
        {box('th')}
        {box('en')}
      </div>
    </fieldset>
  )
}

export function Select<T extends string>({
  value,
  onChange,
  options,
  id,
}: {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
  id?: string
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
      className={inputClass}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export function Checkbox({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  hint?: string
}) {
  const id = useId()
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        // ขนาด 20px + พื้นที่กดของ label ทำให้แตะบนมือถือได้จริง
        className="accent-primary-600 mt-0.5 size-5 shrink-0"
      />
      <label htmlFor={id} className="text-sm">
        <span className="font-medium">{label}</span>
        {hint && <span className="text-ink-muted mt-0.5 block text-xs">{hint}</span>}
      </label>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* รูปภาพ                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * `ImageAsset` ที่ฟอร์มถืออยู่ — เหมือน type หลักแต่ alt เป็นคู่ th/en ที่แก้ได้
 *
 * ต้องกรอก alt ทั้งสองภาษาเหมือนข้อความอื่น เพราะ alt คือสิ่งที่คนใช้ screen reader
 * ได้ยินแทนภาพ ปล่อยว่างเท่ากับภาพนั้นไม่มีอยู่จริงสำหรับเขา
 */
export interface FormImage {
  src: string
  srcSet?: string
  alt: LocalizedText
  width?: number
  height?: number
}

function toFormImage(uploaded: UploadedImage, alt: LocalizedText): FormImage {
  const image: FormImage = { src: uploaded.src, alt, width: uploaded.width, height: uploaded.height }
  if (uploaded.srcSet) image.srcSet = uploaded.srcSet
  return image
}

export function ImageField({
  label,
  hint,
  value,
  onChange,
  name,
  errors,
}: {
  label: string
  hint?: string
  value: FormImage | null
  onChange: (value: FormImage | null) => void
  name: string
  errors?: Record<string, string>
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const uploaded = await uploadImage(file)
      onChange(toFormImage(uploaded, value?.alt ?? { th: '', en: '' }))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'อัปโหลดไม่สำเร็จ')
    } finally {
      setBusy(false)
      // ล้างค่า input ไว้เสมอ ไม่งั้นเลือกไฟล์เดิมซ้ำจะไม่เกิด change event
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <p className="text-ink text-sm font-medium">{label}</p>
      {hint && <p className="text-ink-muted mt-0.5 text-xs">{hint}</p>}

      <div className="border-line mt-2 rounded border p-4">
        {value ? (
          <div className="flex flex-wrap items-start gap-4">
            <img
              src={value.src}
              srcSet={value.srcSet}
              alt=""
              className="border-line bg-surface-alt h-24 w-36 rounded border object-contain"
            />
            <div className="min-w-56 flex-1">
              <p className="text-ink-muted text-xs">
                {value.width && value.height ? `${value.width}×${value.height} · ` : ''}
                {value.src.replace('/uploads/', '')}
              </p>
              <div className="mt-3">
                <Bilingual
                  name={`${name}.alt`}
                  label="คำบรรยายภาพ (alt)"
                  hint="สิ่งที่คนใช้โปรแกรมอ่านหน้าจอจะได้ยินแทนภาพนี้"
                  value={value.alt}
                  onChange={(alt) => onChange({ ...value, alt })}
                  errors={errors}
                />
              </div>
              <div className="mt-3">
                <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
                  <CloseIcon className="size-4" aria-hidden="true" />
                  เอาภาพออก
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-ink-muted text-sm">ยังไม่ได้เลือกภาพ</p>
        )}

        <div className="mt-4">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(event) => void handleFile(event.target.files?.[0])}
            disabled={busy}
            className="text-ink-muted file:border-line file:bg-surface-alt file:text-ink hover:file:bg-surface block w-full text-sm file:mr-3 file:min-h-11 file:cursor-pointer file:rounded file:border file:px-4 file:text-sm file:font-medium"
          />
          <p className="text-ink-muted mt-1.5 text-xs">
            {busy ? 'กำลังอัปโหลดและย่อภาพ…' : 'ระบบย่อและแปลงเป็น WebP สองความละเอียดให้อัตโนมัติ'}
          </p>
          {error && (
            <p role="alert" className="text-danger mt-1 text-xs">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * รายการภาพหลายรูปสำหรับผลงาน — เรียงลำดับได้ด้วยปุ่มขึ้น/ลง
 *
 * ใช้ปุ่มแทนการลากวาง เพราะลากวางใช้กับคีย์บอร์ดไม่ได้ถ้าไม่เขียนเพิ่มอีกมาก
 * และแอดมินมีภาพไม่กี่รูปต่อผลงาน ปุ่มจึงเร็วพอและใช้ได้กับทุกคน
 */
export function GalleryField({
  value,
  onChange,
}: {
  value: FormImage[]
  onChange: (value: FormImage[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setBusy(true)
    setError(null)
    try {
      const added: FormImage[] = []
      // อัปโหลดทีละไฟล์ ไม่ยิงพร้อมกัน — เซิร์ฟเวอร์ย่อภาพด้วย CPU
      // การยิงสิบไฟล์พร้อมกันทำให้เครื่องหน่วงจนคำขออื่นรอนาน
      for (const file of Array.from(files)) {
        added.push(toFormImage(await uploadImage(file), { th: '', en: '' }))
      }
      onChange([...value, ...added])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'อัปโหลดไม่สำเร็จ')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...value]
    const target = index + direction
    const a = next[index]
    const b = next[target]
    if (!a || !b) return
    next[index] = b
    next[target] = a
    onChange(next)
  }

  return (
    <div>
      <p className="text-ink text-sm font-medium">ภาพประกอบผลงาน</p>
      <p className="text-ink-muted mt-0.5 text-xs">
        ลำดับที่เรียงไว้ที่นี่คือลำดับที่แสดงบนหน้าเว็บ
      </p>

      <ul className="mt-3 space-y-3">
        {value.map((image, index) => (
          <li key={image.src} className="border-line rounded border p-4">
            <div className="flex flex-wrap items-start gap-4">
              <img
                src={image.src}
                srcSet={image.srcSet}
                alt=""
                className="border-line bg-surface-alt h-20 w-28 rounded border object-contain"
              />
              <div className="min-w-56 flex-1">
                <Bilingual
                  name={`gallery.${index}.alt`}
                  label={`คำบรรยายภาพที่ ${index + 1}`}
                  value={image.alt}
                  onChange={(alt) => {
                    const next = [...value]
                    next[index] = { ...image, alt }
                    onChange(next)
                  }}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    ↑ ขึ้น
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={index === value.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    ↓ ลง
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onChange(value.filter((_, i) => i !== index))}
                  >
                    เอาออก
                  </Button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => void addFiles(event.target.files)}
          disabled={busy}
          className="text-ink-muted file:border-line file:bg-surface-alt file:text-ink hover:file:bg-surface block w-full text-sm file:mr-3 file:min-h-11 file:cursor-pointer file:rounded file:border file:px-4 file:text-sm file:font-medium"
        />
        {busy && <p className="text-ink-muted mt-1.5 text-xs">กำลังอัปโหลด…</p>}
        {error && (
          <p role="alert" className="text-danger mt-1 text-xs">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * รายการข้อความสองภาษาที่เพิ่ม/ลบได้ — ใช้กับ "ขอบเขตงาน" ของผลงาน
 */
export function BilingualList({
  label,
  hint,
  value,
  onChange,
  addLabel,
}: {
  label: string
  hint?: string
  value: LocalizedText[]
  onChange: (value: LocalizedText[]) => void
  addLabel: string
}) {
  return (
    <div>
      <p className="text-ink text-sm font-medium">{label}</p>
      {hint && <p className="text-ink-muted mt-0.5 text-xs">{hint}</p>}

      <ul className="mt-3 space-y-3">
        {value.map((item, index) => (
          <li key={index} className="border-line rounded border p-3">
            <Bilingual
              name={`scopeOfWork.${index}`}
              label={`ข้อที่ ${index + 1}`}
              value={item}
              onChange={(next) => {
                const list = [...value]
                list[index] = next
                onChange(list)
              }}
            />
            <div className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
              >
                เอาออก
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange([...value, { th: '', en: '' }])}
        >
          {addLabel}
        </Button>
      </div>
    </div>
  )
}
