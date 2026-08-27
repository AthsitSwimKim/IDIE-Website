# IDIE Website

Frontend ของเว็บไซต์องค์กร **ID Industrial Engineering Co.,Ltd.**
บริษัทวิศวกรรม ตัวแทนจำหน่าย และงานบริการด้านระบบสื่อสารและสัญญาณเตือนภัยสำหรับ
พื้นที่อุตสาหกรรมและพื้นที่อันตราย — ก่อตั้ง 1996 ที่ระยอง

## เริ่มใช้งาน

```bash
npm install
```

```bash
npm run dev
```

| คำสั่ง | ทำอะไร |
|---|---|
| `npm run dev` | dev server (พอร์ต 5173 หรือค่า `PORT`) |
| `npm run build` | typecheck + production build ไปที่ `dist/` |
| `npm run preview` | เปิดดู build ที่ทำเสร็จแล้ว |
| `npm run lint` | oxlint (รวมกฎ jsx-a11y) |

หน้า `/styleguide` แสดง design token และ UI primitive ทั้งหมด — **เปิดได้เฉพาะตอน dev**

## Stack

**หน้าเว็บ** — React 19 · TypeScript · Vite · React Router 7 · Tailwind CSS v4
ฟอนต์ IBM Plex Sans Thai (self-host ผ่าน `@fontsource`)

**หลังบ้าน** — Node · TypeScript · Express 5 · MySQL (`mysql2`) · sharp · zod
รันด้วย `tsx` ไม่มีขั้นตอน build เพื่อให้ import type จาก `src/types/content.ts`
แหล่งเดียวกับหน้าเว็บได้โดยไม่ต้องจัดการ rootDir ข้ามโฟลเดอร์

Framer Motion, Three.js และ React Three Fiber **ยังไม่ติดตั้ง** — จะเพิ่มใน Phase 5
ตามหลัก progressive enhancement (ทำ core UI ให้เสร็จก่อน แล้วค่อยเติม 3D)

## โครงสร้าง

```
src/
├── components/
│   ├── ui/         UI primitive จาก design system (Section, Button, Card, ...)
│   └── layout/     Layout shell, ErrorBoundary, Seo, LocaleProvider
├── pages/          หนึ่งไฟล์ต่อหนึ่ง route
│   └── home/       section เฉพาะหน้า Home (ย้ายขึ้น components/sections เมื่อใช้ ≥2 หน้า)
├── data/           ⭐ เนื้อหาทั้งหมดอยู่ที่นี่ที่เดียว
├── types/          TypeScript content model
├── hooks/          useLocale, useAsyncData
├── styles/         theme.css — design token ทั้งหมด
└── utils/
```

### Data layer — จุดสำคัญที่สุดของโปรเจกต์นี้

**Component ห้าม import จากไฟล์ใน `src/data/` โดยตรง** ให้เรียกผ่าน accessor ใน `src/data/index.ts`
เท่านั้น:

```ts
import { getServices, getReferenceCompanies } from '@/data'
```

accessor ทุกตัวเป็น `async` ตั้งแต่วันแรกทั้งที่ข้อมูลยังอยู่ในหน่วยความจำ
เพื่อว่าวันที่ต่อ API หรือ CMS จริงจะ**แก้แค่ `src/data/index.ts` ไฟล์เดียว**
โดยที่ component ไม่ต้องแก้เลย

อ่านข้อมูลใน component ผ่าน `useAsyncData`:

```tsx
const { data: services } = useAsyncData(getServices)
```

### ข้อมูลจริง vs placeholder

ข้อมูลบริษัท บริการ อุตสาหกรรม แบรนด์ หมวดสินค้า ลูกค้า 35 ราย ตำแหน่งงาน
และ**สินค้า 103 รุ่น** (FHF 15 · MEDC 8 · Industronic 80) เป็น**ข้อมูลจริง**

- ข้อมูลบริษัทและลูกค้า — จากเว็บไซต์ปัจจุบันของบริษัท
- สินค้า FHF / MEDC — ชื่อรุ่น ค่าทางเทคนิค และภาพ จาก catalog ที่ IDIE เผยแพร่เอง
- สินค้า Industronic — จากเว็บไซต์ผู้ผลิต (ยังไม่มีภาพ)

คำบรรยายสินค้าทั้งหมดเขียนขึ้นใหม่จากค่าทางเทคนิค ไม่ได้คัดลอกข้อความโฆษณาจาก catalog

### เอกสารผู้ผลิตใน `public/documents/`

ไฟล์ที่ IDIE ส่งมาให้แจกต่อ เก็บเป็น**ต้นฉบับที่ไม่ผ่านการแก้ไข** — เอกสารพวกนี้เป็นสื่อของ
ผู้ผลิต การบีบอัดหรือจัดหน้าใหม่ทำให้สิ่งที่ลูกค้าได้ไม่ตรงกับที่ผู้ผลิตออกให้
ผลคือไฟล์ใหญ่ทั้งคู่ (FHF 13 MB · MEDC 13.5 MB) ถ้าอยากได้เล็กลงต้องขอเวอร์ชันสำหรับเว็บ
จากผู้ผลิต ไม่ใช่บีบเอง — ไฟล์เหล่านี้ไม่นับรวมในงบ JS/CSS เพราะโหลดเมื่อผู้ใช้กดเท่านั้น

| แบรนด์ | เอกสาร | ปี | หน้า |
|---|---|---|---|
| FHF | FHF Product Line Overview — Phones and Accessories | 2022 | 11 |
| MEDC | Signalling and alarms — Product overview | 2016 | 92 |
| Industronic | — ยังไม่ได้รับ | | |

ทั้งสองเล่มออกโดย Eaton (Crouse-Hinds series) · เล่มของ MEDC ครอบทั้ง MEDC และ FHF
แต่วางไว้ใต้ MEDC เพราะ FHF มีเล่มของตัวเองอยู่แล้ว

ขึ้นเป็นปุ่ม "รายละเอียดสินค้า (PDF)" ที่หน้า `/brands` — IDIE ตัดสินใจ (ส.ค. 2026)
ว่าไม่ต้องแสดงขนาดไฟล์และที่มาบนหน้าเว็บ `sizeKb` ใน `brandDocuments` จึงเป็นบันทึก
ของไฟล์เฉย ๆ ยังไม่มี UI ตัวไหนแสดง

ส่วนที่ยังไม่มีข้อมูลจริง (Projects, News, สถิติบางตัว, ภาพทั้งหมด) ถูกทำเครื่องหมาย
`_placeholder: true` พร้อมคอมเมนต์ `// TODO: confirm with IDIE`

```bash
grep -rn "_placeholder: true" src/data
```

รายการที่ต้องขอจากลูกค้าทั้งหมดอยู่ใน [`docs/data-requests.md`](docs/data-requests.md)

## ภาษา TH/EN

ข้อความที่ผู้ใช้เห็นทุกตัวเป็น `{ th, en }` — **ห้ามพิมพ์ string ลง JSX โดยตรง**
ภาษาปัจจุบันเก็บใน `localStorage` และ sync กับ `<html lang>`

## ขอบเขต

เดิมโครงการนี้เป็น **frontend เท่านั้น** — ส.ค. 2026 ลูกค้าขอเพิ่มระบบหลังบ้าน
สำหรับลงข่าวสารและผลงานเอง จึงมีเซิร์ฟเวอร์ Node + MySQL เพิ่มเข้ามาใน `server/`

**ยังไม่มี** e-commerce, ระบบสมาชิกสำหรับผู้เข้าชม หรือ CMS สำหรับเนื้อหาส่วนอื่น
แบบฟอร์มติดต่อยังเป็นแค่ UI และ validation ยังไม่ส่งอีเมลจริง

รายละเอียดขอบเขต บทบาทในทีม และ spec รายหน้าอยู่ใน Claude Skill ของโปรเจกต์:
`.claude/skills/idie-website/`

## ระบบหลังบ้าน (`server/`)

ทีมงาน IDIE ลงข่าวและผลงานเองได้ที่ `/admin` — เนื้อหาสองอย่างนี้เก็บใน **MySQL**
ส่วนรูปเก็บเป็นไฟล์บนดิสก์ (local path) แล้วฐานข้อมูลเก็บแค่ที่อยู่ของไฟล์

เนื้อหาที่เหลือทั้งหมด (บริษัท บริการ สินค้า แบรนด์ ลูกค้าอ้างอิง) **ยังอยู่ใน
`src/data/` เหมือนเดิม** เพราะเปลี่ยนแทบไม่ได้และไม่ควรแก้ผ่านหน้าเว็บโดยไม่ผ่านการรีวิว

accessor `getNews()` และ `getProjects()` เปลี่ยนจาก `return []` เป็นการเรียก API
โดย **ไม่ต้องแก้ component สักตัว** — ซึ่งเป็นเหตุผลที่ accessor ทุกตัวถูกทำเป็น
`async` ไว้ตั้งแต่วันแรก

วิธีติดตั้ง ตั้งค่า และขึ้น production อยู่ใน [`server/README.md`](server/README.md)

```bash
cd server && npm run dev
```

> ถ้า API ล่ม หน้าเว็บสาธารณะ**ไม่พัง** — `getNews`/`getProjects` กลืน error
> เป็นค่าว่าง หน้า News/Projects จึงแสดง empty state ที่ออกแบบไว้ตามเดิม
> และเขียนสาเหตุจริงลง console ให้คนที่มาไล่ปัญหาเห็น

## Performance & Accessibility

ตรวจครบทุก route ที่ 375 / 768 / 1024 / 1280 / 1536 ใน Phase 6 — ผลที่วัดได้จริงบน production build

| ตัวชี้วัด | งบ | วัดได้ | หมายเหตุ |
|---|---|---|---|
| Initial JS (gzip) | ≤ 200 KB | **145.5 KB** | index 92 + router 34 + runtime 0.4 + css 19.1 · วัดใหม่หลังเพิ่มระบบหลังบ้าน |
| Initial CSS (gzip) | ≤ 30 KB | **19.1 KB** | |
| CLS | ≤ 0.1 | **0** | เดิม 0.113 — แก้ด้วยการ preload ฟอนต์ |
| LCP | ≤ 2.5s | **176 ms** | วัดบน localhost ยังไม่ได้ทดสอบแบบ throttle |
| INP (หน้า Products) | ≤ 200 ms | **5–29 ms** | กด filter → DOM อัปเดต วัดด้วย MutationObserver |
| Contrast AA | ผ่านทุกคู่ | **ผ่าน 1,058 จุด** | ต่ำสุด 4.59:1 (`text-warning` 12px) |
| Touch target | ≥ 44×44 | **ผ่าน** | |
| ภาพใหญ่สุด | ≤ 250 KB | **68 KB** | |

### ฟอนต์ต้อง preload เสมอ

`@fontsource` ตั้ง `font-display: swap` ให้ทุกไฟล์ ถ้าไม่ preload เบราว์เซอร์จะวาดด้วย
ฟอนต์ระบบก่อนแล้วค่อยสลับ ซึ่งดันทั้งหน้าให้กระโดด — บล็อก hero สูงต่างกันถึง **76px**
ระหว่างฟอนต์ fallback กับ IBM Plex Sans Thai

plugin `idie:preload-critical-fonts` ใน `vite.config.ts` ใส่ `<link rel="preload">`
ให้ฟอนต์ทั้ง 8 ไฟล์ (4 น้ำหนัก × ไทย/ละติน) ตอน build **อย่าถอดออก** และถ้าเพิ่มน้ำหนักฟอนต์ใหม่
ใน `main.tsx` ต้องเพิ่มใน `CRITICAL_FONT_PATTERN` ด้วย ไม่งั้น CLS จะกลับมา

### วิธีวัดซ้ำ

```bash
npm run build
```

แล้วเปิด preview — ต้องเป็น **พอร์ตที่ยังไม่เคยเปิด** ถ้าจะวัด CLS แบบแคชเปล่า
(แคชฟอนต์ผูกกับ origin ถ้าเคยเข้าพอร์ตนั้นแล้วจะวัด CLS ไม่เจอ) launch config
`idie-preview` ใช้พอร์ต 4173 ส่วน `idie-preview-cold` ใช้ 4176 สำหรับวัดแบบแคชเปล่า

ตรวจว่าฟอนต์ถูก preload ครบ:

```bash
grep -c 'rel="preload"' dist/index.html
```

## สถานะ

| Phase | ขอบเขต | สถานะ |
|---|---|---|
| 0 | Bootstrap | ✅ |
| 1 | Design System, โครงสร้าง, Routing | ✅ |
| 2 | Header, Footer, Responsive Nav | ✅ |
| 3 | Homepage 15 section | ✅ (13/15 — Featured Projects และ Latest News ยังไม่ได้ประกอบ) |
| 4 | Content pages ครบทุก route | ✅ |
| 4b | หน้า News/Projects วาดเนื้อหาจริง | ✅ (ส.ค. 2026) |
| — | ระบบหลังบ้าน (Node + MySQL) | ✅ (ส.ค. 2026 — นอกขอบเขตเดิม) |
| 5 | 3D & Motion | ⬜ |
| 6 | Responsive, Performance, A11y, QA | ✅ |

Phase 6 ตรวจครบแล้ว: responsive 13 route × 5 ความกว้าง, contrast AA, keyboard, ฟอร์ม,
performance budget — ผลอยู่ในหัวข้อ [Performance & Accessibility](#performance--accessibility)
แก้ไป 3 จุด: CLS จากการสลับฟอนต์, เมนูมือถือที่ปิดแล้วยัง Tab เข้าไปได้ และพื้นที่กดของลิงก์ท้ายหน้า

**เมนูเดสก์ท็อปเริ่มที่ `xl` (1280) ไม่ใช่ `lg` (1024)** — เมนู 8 รายการภาษาไทยกว้าง 698px
รวมกับโลโก้และปุ่มสลับภาษาแล้วต้องการ ~1012px แต่ที่ 1024 มีที่ว่างจริงแค่ 913px
ทำให้โลโก้ถูกบีบจนตัวอักษรเรียงลงมาทีละตัว ช่วง 1024–1279 จึงใช้เมนูแบบมือถือแทน
ถ้าจะย้ายกลับไป `lg` ต้องลดจำนวนเมนูหรือย่อข้อความก่อน

Header และ Footer เป็นของจริงแล้ว: header โปร่งใสทับ hero ของหน้าแรกแล้วเปลี่ยนเป็นทึบ
เมื่อ scroll, dropdown ใต้ Products และ Reference, เมนูมือถือแบบ slide-in ที่ trap focus
ปิดด้วย Esc คืน focus ให้ปุ่มเดิม และล็อค body scroll

หน้า Home ประกอบครบแล้ว 13 จาก 15 section — **Featured Projects และ Latest News
ยังไม่ได้ประกอบเพราะยังไม่มีข้อมูลจริงเลย** (เว็บเดิมไม่มีหน้า Projects และหน้า News
เขียนว่า "Comming Soon....") การแสดง section เปล่าหรือข้อมูลที่แต่งขึ้นแย่กว่าการไม่แสดง
เมื่อได้ข้อมูลจาก IDIE ให้แทรกกลับตามที่คอมเมนต์ไว้ใน `src/pages/Home.tsx`

ทุก route ประกอบเสร็จแล้ว ส่วนที่ยังไม่มีข้อมูลจากบริษัท (Projects, News, รายการสินค้า,
ประวัติ, vision/mission, ทีม, ใบรับรอง, แผนที่) แสดงเป็นบล็อก `PendingContent`
ที่ระบุชัดว่า**ต้องขออะไร** แทนการซ่อนทิ้งหรือแต่งข้อมูลใส่ — ทำให้หน้าเว็บทำหน้าที่
เป็นรายการขอข้อมูลไปในตัว
