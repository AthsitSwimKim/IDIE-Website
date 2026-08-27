import type { ReactNode } from 'react'

/**
 * แปลง Markdown เป็น React element โดยตรง — **ไม่ผ่าน HTML**
 *
 * เนื้อข่าวมาจากฐานข้อมูลที่คนกรอกผ่านหน้าแอดมิน ถ้าใช้ไลบรารีแปลงเป็นสตริง HTML
 * แล้วยัดด้วย `dangerouslySetInnerHTML` เท่ากับเปิดทางให้เนื้อหาที่บันทึกไว้
 * รันสคริปต์บนหน้าเว็บของบริษัทได้ (stored XSS) — ซึ่งเกิดขึ้นจริงเมื่อบัญชีแอดมิน
 * หลุดหรือมีคนเผลอวางเนื้อหาที่ก๊อปมาจากที่อื่น
 *
 * การประกอบเป็น React element ทำให้ข้อความทุกตัวถูก escape โดยอัตโนมัติ
 * **ไม่มีทาง**กลายเป็นแท็กหรือสคริปต์ ไม่ว่าคนกรอกจะพิมพ์อะไรลงไป
 *
 * รองรับเท่าที่คำแนะนำใต้ช่องกรอกในหน้าแอดมินบอกไว้: หัวข้อ · รายการ · ตัวหนา ·
 * ตัวเอียง · ลิงก์ · ย่อหน้า ตั้งใจไม่รองรับตาราง โค้ดบล็อก หรือรูปในเนื้อหา
 * เพราะข่าวบริษัทไม่ต้องใช้ และของที่ไม่รองรับก็ไม่ต้องดูแล
 */

/** โปรโตคอลที่ยอมให้ลิงก์ชี้ไปได้ — กัน `javascript:` ที่รันโค้ดเมื่อผู้ใช้กด */
function safeHref(href: string): string | null {
  const value = href.trim()
  if (value.startsWith('/') || value.startsWith('#')) return value
  if (/^https?:\/\//i.test(value) || /^mailto:/i.test(value)) return value
  return null
}

/** จับ `**หนา**` `*เอียง*` และ `[ข้อความ](ลิงก์)` ในบรรทัดเดียว */
const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(INLINE).map((part, index) => {
    const key = `${keyPrefix}-${index}`

    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={key}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>
    }

    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part)
    if (link) {
      const [, label = '', rawHref = ''] = link
      const href = safeHref(rawHref)
      // ลิงก์ที่ไม่ผ่านการตรวจ แสดงเป็นข้อความธรรมดา ไม่ใช่ซ่อนทิ้ง —
      // คนเขียนจะได้เห็นว่าลิงก์ตัวเองไม่ทำงานแล้วไปแก้
      if (!href) return <span key={key}>{label}</span>

      const external = /^https?:\/\//i.test(href)
      return (
        <a
          key={key}
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="text-primary-600 underline underline-offset-2"
        >
          {label}
        </a>
      )
    }

    return part
  })
}

export function Markdown({ source }: { source: string }) {
  const blocks: ReactNode[] = []
  const lines = source.replace(/\r\n/g, '\n').split('\n')

  let paragraph: string[] = []
  let list: { ordered: boolean; items: string[] } | null = null

  const flushParagraph = () => {
    if (paragraph.length === 0) return
    const key = `p-${blocks.length}`
    blocks.push(
      <p key={key} className="mt-4 first:mt-0">
        {renderInline(paragraph.join(' '), key)}
      </p>,
    )
    paragraph = []
  }

  const flushList = () => {
    if (!list) return
    const key = `l-${blocks.length}`
    const items = list.items.map((item, index) => (
      <li key={`${key}-${index}`}>{renderInline(item, `${key}-${index}`)}</li>
    ))
    blocks.push(
      list.ordered ? (
        <ol key={key} className="mt-4 list-decimal space-y-1 pl-6">
          {items}
        </ol>
      ) : (
        <ul key={key} className="mt-4 list-disc space-y-1 pl-6">
          {items}
        </ul>
      ),
    )
    list = null
  }

  const flushAll = () => {
    flushParagraph()
    flushList()
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (line === '') {
      flushAll()
      continue
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(line)
    if (heading) {
      flushAll()
      const level = heading[1]?.length ?? 1
      const content = heading[2] ?? ''
      const key = `h-${blocks.length}`
      /**
       * เริ่มที่ h2 เสมอ เพราะ h1 ของหน้าคือหัวข้อข่าว — เนื้อหาข้างในต้องเป็น
       * ระดับรองลงมา ไม่งั้นหน้าจะมี h1 สองอันและ screen reader จะสรุปโครงหน้าผิด
       *
       * **`#` กับ `##` ให้ h2 เท่ากันโดยตั้งใจ** — คนเขียนข่าวบางคนพิมพ์ `#`
       * บางคนพิมพ์ `##` สำหรับหัวข้อระดับบนสุดเหมือนกัน ถ้าแมปตรงตัวจะได้ h3
       * ที่ตามหลัง h1 โดยไม่มี h2 คั่น ซึ่งเป็นการข้ามลำดับหัวข้อที่เครื่องมือ
       * ตรวจ accessibility ฟ้อง และทำให้คนที่ไล่อ่านด้วยหัวข้อสับสน
       */
      const Tag = (['h2', 'h2', 'h3', 'h4'][level - 1] ?? 'h4') as 'h2' | 'h3' | 'h4'
      const size = level <= 2 ? 'text-lg' : 'text-base'
      blocks.push(
        <Tag key={key} className={`mt-8 font-semibold first:mt-0 ${size}`}>
          {renderInline(content, key)}
        </Tag>,
      )
      continue
    }

    const bullet = /^[-*]\s+(.*)$/.exec(line)
    if (bullet) {
      flushParagraph()
      if (list && list.ordered) flushList()
      list ??= { ordered: false, items: [] }
      list.items.push(bullet[1] ?? '')
      continue
    }

    const numbered = /^\d+[.)]\s+(.*)$/.exec(line)
    if (numbered) {
      flushParagraph()
      if (list && !list.ordered) flushList()
      list ??= { ordered: true, items: [] }
      list.items.push(numbered[1] ?? '')
      continue
    }

    flushList()
    paragraph.push(line)
  }

  flushAll()

  return <div className="text-ink-muted max-w-prose leading-relaxed">{blocks}</div>
}
