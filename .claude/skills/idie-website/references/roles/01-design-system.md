# บทบาท `DS` — Design System Architect

> **ที่มาของบทบาท:** acceptance criteria ข้อ Visual บอกว่าเว็บต้อง "ไม่เป็น template ทั่วไป"
> สิ่งที่ทำให้เว็บดูเหมือน template คือการที่แต่ละหน้าถูกสร้างด้วยค่าที่คนละคนคิดขึ้นเอง
> หน้าที่ของบทบาทนี้คือทำให้ทุกคนหยิบค่าเดียวกันไปใช้ ไม่ใช่การ "ทำให้สวย"

## ขอบเขต

**รับผิดชอบ:** design token (สี typography spacing radius shadow motion), UI primitive,
section/container pattern, dark-section pattern, icon system, focus style

**ไม่รับผิดชอบ:** การประกอบหน้า (`UI`), routing (`FE`), 3D material/lighting (`XP`)

---

## 1. Token — ทำก่อนสิ่งอื่นทั้งหมด

คัดลอก `assets/design-tokens.css` ไป `src/styles/theme.css` แล้ว import ใน `src/main.tsx`

ค่าสีในไฟล์นั้นสกัดมาจากโลโก้และ mockup ที่ลูกค้าให้มา (`assets/idie-logo-reference.png`,
`assets/idie-mockup-reference.png`) — **ยังไม่ใช่ brand guideline ทางการ**
ให้ทำเครื่องหมายไว้ในไฟล์และแจ้งผู้ใช้ว่าต้องขอ brand guideline จริงจาก IDIE เพื่อยืนยัน

### กฎการใช้สี

โครงการนี้ล้มง่ายที่สุดตรงเรื่องสี เพราะ "น้ำเงินเยอะ" กับ "น้ำเงินทั้งจอ" ห่างกันแค่นิดเดียว

| บทบาทของสี | ใช้ตรงไหน | สัดส่วนคร่าว ๆ ของหน้า |
|---|---|---|
| Neutral (white / `surface-alt` / border) | พื้นหลัง section ส่วนใหญ่, card | ~70% |
| Deep Navy | Hero, Statistics, Footer, section ที่ต้องการ contrast | ~20% |
| IDIE Blue | CTA, link, active state, eyebrow label, icon accent | ~8% |
| Cyan / Electric Blue | เส้น technical, glow บน 3D, hover highlight | **~2% — ห้ามเกินนี้** |

- **สลับ dark/light section ให้เป็นจังหวะ** — dark ติดกันเกิน 2 section ทำให้เว็บดูอึดอัดและเหมือนเว็บเกม
- Cyan ห้ามใช้เป็นสีข้อความบนพื้นขาว (contrast ไม่ผ่าน) ใช้เป็นเส้น/glow/hover บนพื้น dark เท่านั้น
- ทุก text/background pair ต้องผ่าน WCAG AA (4.5:1 สำหรับ body, 3:1 สำหรับ text ≥24px)

### Typography

ต้องอ่านง่ายทั้งไทยและอังกฤษ และมีบุคลิก corporate + engineering
เลือกใช้ **IBM Plex Sans Thai** (มีทั้ง TH/EN, ออกแบบมาสำหรับสายเทคนิค) เป็นค่าเริ่มต้น
ทางเลือกที่ยอมรับได้: `Anuphan`, `LINE Seed Sans TH`, หรือ `Noto Sans Thai` + `Inter`

- โหลดผ่าน `@fontsource` (self-host) ไม่ใช่ Google Fonts CDN — ลด render-blocking และเรื่อง PDPA
- โหลดเฉพาะ weight ที่ใช้จริง: 400 / 500 / 600 / 700
- Headline ภาษาอังกฤษใช้ uppercase + `tracking-tight` ได้ (`TOTAL SOLUTION FOR INDUSTRIAL ENGINEERING`)
  แต่ **ห้าม uppercase ข้อความไทย** — สระและวรรณยุกต์จะพัง
- ตั้ง `line-height` ของภาษาไทยสูงกว่าอังกฤษ ~0.1 เพราะสระบน-ล่างต้องการที่หายใจ

---

## 2. UI Primitive ที่ต้องมี (Phase 1)

สร้างใน `src/components/ui/` — เล็ก ไม่มี business logic ไม่รู้จัก data layer

| Component | Props สำคัญ | หมายเหตุ |
|---|---|---|
| `Container` | `size: 'default' \| 'wide' \| 'narrow'` | คุม max-width และ padding ข้าง เดียวทั้งเว็บ |
| `Section` | `tone: 'light' \| 'alt' \| 'dark'`, `spacing` | คุมพื้นหลัง + padding แนวตั้ง — section ทุกอันบนเว็บต้องผ่านตัวนี้ |
| `Button` | `variant: 'primary' \| 'outline' \| 'ghost' \| 'onDark'`, `size`, `asChild` | มี arrow icon variant ตาม mockup, min touch target 44px |
| `Heading` | `level`, `eyebrow`, `align` | `eyebrow` คือ label ตัวเล็กสีน้ำเงินเหนือหัวข้อ (เห็นใน mockup: `COMPANY PROFILE`) |
| `Card` | `interactive` | hover lift + border ที่ subtle |
| `Badge` / `Tag` | `tone` | ใช้กับ category, industry, brand |
| `IconFrame` | `size` | กรอบไอคอนใน Engineering Highlights |
| `Reveal` | `delay`, `direction` | wrapper สำหรับ scroll reveal — สร้างโครงไว้ Phase 1 แต่ยังไม่ใส่ motion จริง (`XP` มาเติม Phase 5) |

**`Section` สำคัญที่สุด** — จังหวะแนวตั้งของทั้งเว็บขึ้นกับตัวนี้ ถ้าแต่ละหน้ากำหนด `py-` เอง
เว็บจะดู "ต่อกันไม่สนิท" ซึ่งเป็นอาการหลักของเว็บที่ดูเหมือน template

---

## 3. รายละเอียดที่สร้างเอกลักษณ์ IDIE

สิ่งที่ทำให้ไม่เป็น template ทั่วไป ไม่ใช่ animation แต่เป็นรายละเอียดพวกนี้:

- **Blueprint grid** — CSS background grid บาง ๆ (`1px`, opacity ต่ำมาก) บน dark section
  ทำเป็น utility class ไม่ใช่ภาพ
- **Engineering line** — เส้นบาง 1–2px คั่นระหว่างองค์ประกอบ พร้อมจุด node เล็ก ๆ ที่ปลาย
  ใช้เป็น motif เชื่อม section
- **Eyebrow label** — ตัวเล็ก uppercase สีน้ำเงิน + tracking กว้าง เหนือหัวข้อทุก section
- **Corner accent** — มุมตัดหรือ L-shape bracket ที่มุม card/image แบบ technical drawing
- **Number/spec styling** — ตัวเลขสถิติใช้ tabular-nums เพื่อไม่ให้เต้นตอน count-up

ทำเป็น utility class ใน `theme.css` (เช่น `.blueprint-grid`, `.engineering-line`, `.corner-bracket`)
เพื่อให้ `UI` หยิบไปใช้ได้โดยไม่ต้องเขียนใหม่

---

## 4. Focus & Interaction State

acceptance criteria บังคับเรื่อง keyboard และ focus — จัดการที่ระดับ design system ครั้งเดียว
จะได้ไม่ต้องไล่แก้ทีละ component ตอน QA

- ตั้ง `:focus-visible` ring สีน้ำเงินที่มองเห็นชัดบนทั้งพื้นขาวและพื้น navy (ใช้ `outline` + `outline-offset`)
- **ห้าม `outline: none` โดยไม่มีตัวแทน** ไม่ว่าจะที่ไหน
- Hover state ทุกอันต้องมี non-hover equivalent สำหรับ touch device
- Transition สั้น: `150–250ms` สำหรับ micro interaction, `400–700ms` สำหรับ section reveal
- Easing กลาง ๆ (`cubic-bezier(0.16, 1, 0.3, 1)`) — หลีกเลี่ยง bounce/elastic ที่ดูไม่เป็นมืออาชีพ

---

## Definition of Done (Phase 1 สำหรับ `DS`)

- [ ] `theme.css` มี token ครบและ import แล้ว
- [ ] UI primitive ทั้ง 8 ตัวสร้างแล้ว มี TypeScript props ครบ
- [ ] มีหน้า `/styleguide` (dev-only route) แสดง token + primitive ทุกตัวทุก variant
      — ใช้ตรวจ contrast และ hand-off ให้ `UI` ได้เร็ว ลบก่อนส่งมอบหรือกันด้วย `import.meta.env.DEV`
- [ ] ตรวจ contrast ทุกคู่สีผ่าน AA แล้ว
- [ ] แจ้งผู้ใช้ว่าต้องขอ brand guideline / font license จริงจาก IDIE
