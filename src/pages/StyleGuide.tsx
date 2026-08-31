import { Badge, Button, Card, Heading, IconFrame, Section } from '@/components/ui'
import { Seo } from '@/components/layout/Seo'

/**
 * หน้าตรวจ design system — dev เท่านั้น (route ถูกกันด้วย import.meta.env.DEV ใน router)
 *
 * มีไว้เพื่อสองอย่าง: ตรวจ contrast ทุกคู่สีในที่เดียวก่อนส่งให้ QA
 * และให้คนที่กำลังประกอบ section เห็นว่ามี primitive อะไรให้ใช้บ้าง
 * โดยไม่ต้องไล่อ่านโค้ด — ลดโอกาสที่จะไปสร้างปุ่มหรือการ์ดซ้ำขึ้นมาเอง
 */

const colorGroups = [
  {
    name: 'Primary (IDIE Blue)',
    swatches: [
      ['50', 'bg-primary-50'],
      ['100', 'bg-primary-100'],
      ['200', 'bg-primary-200'],
      ['300', 'bg-primary-300'],
      ['400', 'bg-primary-400'],
      ['500', 'bg-primary-500'],
      ['600', 'bg-primary-600'],
      ['700', 'bg-primary-700'],
      ['800', 'bg-primary-800'],
      ['900', 'bg-primary-900'],
    ],
  },
  {
    name: 'Navy (dark sections)',
    swatches: [
      ['700', 'bg-navy-700'],
      ['800', 'bg-navy-800'],
      ['900', 'bg-navy-900'],
      ['950', 'bg-navy-950'],
    ],
  },
  {
    name: 'Neutral',
    swatches: [
      ['surface', 'bg-surface border border-line'],
      ['surface-alt', 'bg-surface-alt'],
      ['line', 'bg-line'],
      ['steel', 'bg-steel'],
      ['ink-muted', 'bg-ink-muted'],
      ['ink', 'bg-ink'],
    ],
  },
  {
    name: 'Accent (จำกัด ~2% ของหน้า · เฉพาะบนพื้น dark)',
    swatches: [
      ['cyan', 'bg-accent-cyan'],
      ['glow', 'bg-accent-glow'],
    ],
  },
]

export default function StyleGuide() {
  return (
    <>
      <Seo title="Style Guide" />

      <Section tone="alt" spacing="sm">
        <Heading level={1} eyebrow="DESIGN SYSTEM">
          IDIE Style Guide
        </Heading>
        <p className="text-ink-muted mt-3 max-w-prose text-sm">
          หน้านี้แสดงเฉพาะตอน dev — ค่าสีสกัดจากโลโก้และ mockup ที่ลูกค้าให้มา
          ยังต้องขอ brand guideline ทางการจาก IDIE เพื่อยืนยัน
        </p>
      </Section>

      <Section spacing="sm">
        <Heading level={2}>Color</Heading>
        <div className="mt-6 space-y-8">
          {colorGroups.map((group) => (
            <div key={group.name}>
              <p className="text-ink-muted mb-3 text-sm font-medium">{group.name}</p>
              <div className="flex flex-wrap gap-3">
                {group.swatches.map(([label, cls]) => (
                  <div key={label} className="w-24">
                    <div className={`h-16 rounded ${cls}`} />
                    <p className="text-ink-muted mt-1.5 text-xs">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="alt" spacing="sm">
        <Heading level={2}>Typography</Heading>
        <div className="mt-6 space-y-4">
          <p className="text-display font-bold uppercase">Display · ENGINEERING</p>
          <p className="text-h1 font-bold">H1 · ระบบสื่อสารอุตสาหกรรม</p>
          <p className="text-h2 font-bold">H2 · Public Address &amp; Warning Alarm</p>
          <p className="text-h3 font-semibold">H3 · อุปกรณ์สัญญาณเสียงและแสง</p>
          <p className="text-base">
            Body · ข้อความภาษาไทยผสมภาษาอังกฤษเพื่อตรวจว่า line-height
            ของสระบน-ล่างไม่ชนกัน และตัวอักษร Latin ยังอ่านสบายในย่อหน้าเดียวกัน
          </p>
          <p className="text-eyebrow text-primary-600 uppercase">Eyebrow · COMPANY PROFILE</p>
          <p className="stat-figure text-4xl font-bold">2006 · 35 · 1,024</p>
        </div>
      </Section>

      <Section spacing="sm">
        <Heading level={2}>Button</Heading>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="primary" withArrow>
            With arrow
          </Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="primary" size="lg">
            Large
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
        <div
          className="bg-navy-900 mt-6 flex flex-wrap items-center gap-3 rounded p-6"
          data-tone="dark"
        >
          <Button variant="onDark">On dark</Button>
          <Button
            variant="outline"
            className="border-white/40 text-white hover:bg-white/10 active:bg-white/15"
          >
            Outline on dark
          </Button>
        </div>
      </Section>

      <Section tone="alt" spacing="sm">
        <Heading level={2}>Card · Badge · IconFrame</Heading>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <Card className="p-6">
            <IconFrame size="sm">
              <span aria-hidden="true" className="bg-primary-600 size-2 rounded-full" />
            </IconFrame>
            <h3 className="mt-4 font-semibold">Static card</h3>
            <p className="text-ink-muted mt-2 text-sm">ไม่มีลิงก์ — ไม่มี hover lift</p>
          </Card>
          <Card to="/services" className="p-6">
            <h3 className="font-semibold">Interactive card</h3>
            <p className="text-ink-muted mt-2 text-sm">มีลิงก์ — hover แล้วยกขึ้น</p>
          </Card>
          <Card className="space-y-2 p-6">
            <Badge>Neutral</Badge> <Badge tone="brand">Brand</Badge>{' '}
            <Badge tone="warning">Warning</Badge>
          </Card>
        </div>
      </Section>

      <Section spacing="sm">
        <Heading level={2}>Visual motif</Heading>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <div className="bg-navy-900 blueprint-grid rounded-card h-32" data-tone="dark" />
          <div className="flex items-center">
            <div className="engineering-line w-full" />
          </div>
          <div className="corner-bracket bg-surface-alt rounded-card h-32" />
        </div>
      </Section>

      <Section tone="dark" spacing="sm">
        <Heading level={2} eyebrow="ON DARK">
          Eyebrow และ focus ring บนพื้น navy
        </Heading>
        <p className="mt-4 max-w-prose text-white/70">
          กด Tab เพื่อตรวจว่า focus ring เปลี่ยนเป็นสี accent และมองเห็นได้ชัดบนพื้นนี้
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="onDark">Focusable</Button>
          <Button variant="onDark">Focusable</Button>
        </div>
      </Section>
    </>
  )
}
