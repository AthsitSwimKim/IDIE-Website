---
name: idie-website
description: >-
  คู่มือปฏิบัติงานโครงการ IDIE Website Redesign (ID Industrial Engineering Co., Ltd.) — Modern Corporate
  Website ด้วย React + TypeScript + Vite + Tailwind + Framer Motion + React Three Fiber ให้บทบาทเฉพาะทาง
  6 บทบาท (Design System, Frontend Architect, Section Builder, 3D & Motion, Content & Data,
  Performance & A11y QA) พร้อม design token, sitemap 9 route, page spec รายหน้า, data model และ
  acceptance criteria. ใช้ Skill นี้ทุกครั้งที่ทำงานในโปรเจกต์นี้ — scaffold โปรเจกต์, สร้างหรือแก้ component,
  ทำหน้า Home/About/Services/Products/Reference/Projects/News/Careers/Contact, วาง data layer,
  ทำ 3D Hero หรือ Product Viewer, เพิ่ม scroll animation, ทำ responsive, ไล่ปัญหา performance หรือ
  accessibility, และรีวิวงานก่อนส่งมอบ — รวมถึงงานที่เอ่ยถึงธุรกิจของบริษัท เช่น intercom, PA/GA,
  explosion-proof telephone, hazardous area signalling, beacon, sounder, CCTV, Industronic, FHF, MEDC
  — ให้ใช้แม้ผู้ใช้ไม่ได้เอ่ยคำว่า "IDIE" ตรง ๆ แต่กำลังทำงานใน repo นี้
---

# IDIE Website Redesign — Project Operating Manual

โครงการนี้คือการทำ **Frontend Prototype** ของเว็บไซต์องค์กร ID Industrial Engineering Co., Ltd.
ให้เป็น Modern Industrial Corporate Website ที่มี Interactive Motion และ 3D ในจุดที่เหมาะสม
เป้าหมายของ Skill นี้คือทำให้ทุกงานย่อยในโครงการถูกทำ **ในบทบาทที่ถูกต้อง ตามลำดับที่ถูกต้อง
และอยู่ใน scope ที่ตกลงกันไว้** เพราะความเสี่ยงที่ใหญ่ที่สุดของโครงการแบบนี้คือทีมไปติดหล่มกับ
3D/effect ตั้งแต่ยังไม่มีโครงเว็บ แล้วส่งงานไม่ทันและ performance พัง

> **IDIE ทำธุรกิจอะไรจริง ๆ** — ก่อตั้ง **1996** ที่ระยอง เป็นบริษัท engineering + distributor + service
> ที่เชี่ยวชาญเฉพาะทางด้าน **ระบบสื่อสารและสัญญาณเตือนภัยสำหรับพื้นที่อันตราย (hazardous area)**
> — intercom, PA/GA, network & CCTV, explosion-proof telephone และ signaling device
> ให้โรงงานปิโตรเคมี น้ำมันและก๊าซ ปุ๋ย โรงไฟฟ้า และเหมืองแร่
> **ไม่ใช่ผู้รับเหมางานวิศวกรรม M&E ทั่วไป**
>
> ตัวอย่างชื่อบริการและ industry filter ในเอกสาร `.docx` ต้นฉบับ **ไม่ตรงกับธุรกิจจริง**
> ให้ยึด `references/company-facts.md` เป็นหลักเสมอเมื่อขัดกัน

---

## ขั้นตอนแรกเสมอ: เลือกบทบาท

ก่อนเริ่มเขียนโค้ดใด ๆ **ให้ระบุบทบาทที่กำลังสวมและบอกผู้ใช้สั้น ๆ 1 บรรทัด** แล้วอ่านไฟล์บทบาทนั้น
บทบาทมีไว้เพื่อจำกัดขอบเขตการตัดสินใจ ไม่ใช่เพื่อเล่นบท — สวม DS อยู่ก็ไม่ควรไปตัดสินใจเรื่อง 3D เอง

| บทบาท | รหัส | รับผิดชอบ | Phase | เปิดไฟล์ |
|---|---|---|---|---|
| **Design System Architect** | `DS` | Brand token, สี, typography scale, spacing, grid, UI primitive (Button/Card/Section/Container), dark-section pattern | 1 | `references/roles/01-design-system.md` |
| **Frontend Architect** | `FE` | โครงสร้าง `src/`, routing, layout (Header/Footer/Nav), code splitting, TS config, alias, boundary | 1–2 | `references/roles/02-frontend-architect.md` |
| **Section & Page Builder** | `UI` | ประกอบ section และหน้าให้ครบทุก route ตาม page spec | 3–4 | `references/roles/03-section-builder.md` |
| **3D & Motion Engineer** | `XP` | R3F scene, product viewer, hotspot, Framer Motion, GSAP scroll, device tier, fallback | 5 | `references/roles/04-3d-motion.md` |
| **Content & Data Architect** | `DATA` | TypeScript types, mock data layer, TH/EN, slug, asset pipeline | ตลอดทุก phase | `references/roles/05-content-data.md` |
| **Performance & A11y QA** | `QA` | Performance budget, lazy load, Lighthouse, keyboard/contrast/alt/reduced-motion, acceptance | 6 + ตรวจระหว่างทาง | `references/roles/06-perf-a11y-qa.md` |

**วิธีเลือก** — ดูว่า "ผลลัพธ์ที่ผู้ใช้อยากได้" ตกอยู่ในความรับผิดชอบของใคร ไม่ใช่ดูว่าไฟล์ไหนถูกแก้
เช่น "ปุ่มบนมือถือกดยาก" = `DS` (แก้ token ขนาด touch target) ไม่ใช่ `UI`;
"หน้า Products โหลดช้า" = `QA` วินิจฉัยก่อน แล้วส่งงานให้ `XP` หรือ `FE` แก้

**งานหนึ่งอาจต้องหลายบทบาท** — ทำทีละบทบาทตามลำดับ และประกาศตอนสลับ เช่น
"เสร็จส่วน DS แล้ว — สลับเป็น UI เพื่อเอา token ไปประกอบ Hero section"

---

## กติกาโครงการ (ทุกบทบาทต้องเคารพ)

กติกาเหล่านี้มาจากขอบเขตที่ลูกค้าตกลงไว้ ถ้าจะฝ่าต้องถามผู้ใช้ก่อน

1. **Frontend-only** — ไม่มี backend, database, login, CMS, admin, e-commerce, payment
   Inquiry Form ทำได้แค่ UI + validation + fake submit state (`ยังไม่ส่งอีเมลจริง`)

2. **ข้อมูลอยู่ใน `src/data/` เท่านั้น** — ห้าม hardcode ชื่อบริการ/สินค้า/ลูกค้า/ตัวเลขลงใน component
   เหตุผล: Phase ถัดไปต้องสลับ data layer ไปเป็น API/CMS โดยไม่แตะ component

3. **Content-first, 3D ทีหลัง** — ห้ามเริ่มงาน 3D ก่อน Phase 3 (Homepage โครงครบ) ผ่านแล้ว
   ถ้าผู้ใช้ขอ 3D ก่อนกำหนด ให้ทำได้แต่เตือนความเสี่ยงหนึ่งบรรทัดแล้วทำต่อ

4. **Progressive enhancement เป็นข้อบังคับ** — เนื้อหาทุกอย่างต้องอ่านและใช้งานได้แม้ WebGL พัง,
   3D โหลดไม่สำเร็จ, JS animation ไม่ทำงาน หรือผู้ใช้เปิด `prefers-reduced-motion`

5. **IDIE identity ไม่ใช่ ARIT clone** — ARIT Group ใช้อ้างอิงแค่ *ความรู้สึก*: white space, typography scale,
   image composition, การเล่าเรื่องผ่าน section ห้ามลอก layout, สี, หรือ copy

6. **Reference ≠ Projects** — `Reference` = โลโก้บริษัทลูกค้า (social proof, ไม่เปิดรายละเอียดงาน),
   `Projects` = ผลงานจริง (มี client, scope, ภาพ) สอง concept นี้ต้องไม่ปนกันทั้งใน UI, route และ data

7. **ใช้ข้อมูลจริงก่อนเสมอ — ที่เหลือต้องดูออกว่าเป็น mock**
   `references/company-facts.md` มีข้อมูลจริงจากเว็บบริษัทแล้ว: ข้อมูลติดต่อ, ปีก่อตั้ง, บริการ 4 กลุ่ม,
   6 industry, 3 brand, product taxonomy และรายชื่อลูกค้า **35 ราย** — ใช้ได้ทันที ห้ามแต่งทับ
   ส่วนที่ยังไม่มีข้อมูลจริง (Projects, News, สถิติ, Vision/Mission, Certificates, คำแปลไทย, ภาพทั้งหมด)
   ต้องมี `_placeholder: true` และคอมเมนต์ `// TODO: confirm with IDIE`
   **ห้ามแต่งตัวเลขผลงาน ใบรับรอง หรือปีก่อตั้ง แล้วปล่อยไว้เหมือนเป็นข้อมูลจริง**

8. **TH/EN ตั้งแต่วันแรก** — ห้ามฝัง string ภาษาเดียวลง JSX ทุกข้อความผู้ใช้เห็นต้องผ่าน data layer
   หรือ i18n dictionary ที่มีทั้ง `th` และ `en`

9. **Corporate credibility มาก่อนความเท่** — หลีกเลี่ยง cyberpunk, neon จัด, glow หนัก, กะพริบ,
   scroll hijacking ทุกอย่างที่ทำให้เว็บบริษัทวิศวกรรมดูเหมือนเว็บเกม

---

## ลำดับ Phase (อย่าข้าม)

| Phase | ขอบเขต | บทบาทหลัก | ถือว่าจบเมื่อ |
|---|---|---|---|
| 0 | Bootstrap โปรเจกต์ (ถ้า repo ยังว่าง) | `FE` | `npm run dev` ขึ้นได้, lint/tsc ผ่าน |
| 1 | Design System + Project Structure + Routing | `DS` → `FE` | token ใช้ได้จริงใน primitive, ทุก route render placeholder ได้ |
| 2 | Header, Footer, Global Layout, Responsive Nav | `FE` | nav ใช้งานได้ครบ 4 breakpoint + keyboard |
| 3 | Homepage ครบ 14 section | `UI` (+`DATA`) | หน้า Home เล่าเรื่องจบใน flow เดียวโดยยังไม่มี 3D |
| 4 | Content pages ครบ 9 route | `UI` (+`DATA`) | ทุก route มีเนื้อหาจริงจาก data layer, filter/search ใช้ได้ |
| 5 | 3D & Motion | `XP` | 3D ทำงานลื่นบน desktop + มี fallback ครบ |
| 6 | Responsive, Performance, A11y, QA | `QA` | ผ่าน acceptance criteria ทุกข้อ |

หลักการที่อยู่เบื้องหลังลำดับนี้: **core UI/UX ต้องสมบูรณ์ก่อน แล้วค่อยเติม 3D และ animation
เป็น progressive enhancement** เพื่อไม่ให้โครงการติดหล่มกับงาน 3D ตั้งแต่ยังไม่มีเว็บ

---

## ไฟล์อ้างอิง

อ่านเมื่อจำเป็น ไม่ต้องโหลดทั้งหมดพร้อมกัน

| ไฟล์ | อ่านเมื่อ |
|---|---|
| **`references/company-facts.md`** | **ทุกครั้งที่ต้องแตะเนื้อหา ชื่อบริการ สินค้า ลูกค้า หรือข้อมูลติดต่อ** — เป็นข้อมูลจริงจากเว็บบริษัท และมีหัวข้อ "จุดที่เอกสารโครงการคลาดเคลื่อน" ที่ override เอกสารต้นฉบับ |
| `references/project-brief.md` | ต้องการภาพรวม เป้าหมาย กลุ่มผู้ใช้ design direction acceptance criteria หรือเช็คว่า "อยู่ใน scope ไหม" |
| `references/page-specs.md` | ก่อนสร้างหรือแก้หน้า/section ใด ๆ — มี sitemap, Home 14 section, spec ราย route และตารางลำดับความสำคัญ 3D |
| `references/roles/0X-*.md` | ตอนสวมบทบาทนั้น |
| `assets/design-tokens.css` | ตั้งค่า Tailwind theme (Phase 1) — คัดลอกไป `src/styles/theme.css` |
| `assets/data-model.ts` | วาง data layer — คัดลอกไป `src/types/content.ts` |
| `assets/idie-logo-reference.png` | ต้องการสีแบรนด์/รูปโลโก้อ้างอิง |
| `assets/idie-mockup-reference.png` | ต้องการเห็น visual direction ที่ลูกค้าอนุมัติแล้ว (header, hero, highlight strip, company profile, services) |

---

## Bootstrap (ใช้เมื่อ repo ยังว่าง)

```bash
npm create vite@latest . -- --template react-ts
```

จากนั้น (สวมบทบาท `FE`):

```bash
npm i react-router-dom framer-motion three @react-three/fiber @react-three/drei clsx
npm i -D tailwindcss @tailwindcss/vite @types/three eslint-plugin-jsx-a11y
```

- **Tailwind v4** — ตั้งค่าผ่าน `@tailwindcss/vite` plugin + `@theme` ใน CSS (ไม่มี `tailwind.config.js`)
- GSAP ติดตั้งเฉพาะตอนถึง Phase 5 และเฉพาะเมื่อ Framer Motion ทำ scroll timeline นั้นไม่ไหวจริง ๆ
- อย่าติดตั้ง dependency ที่ยังไม่ถึงเวลาใช้ — ทุกตัวมีต้นทุน bundle

รายละเอียดโครงสร้างโฟลเดอร์และ vite config อยู่ใน `references/roles/02-frontend-architect.md`

---

## รูปแบบการรายงานงาน

จบทุกงานย่อย ให้สรุปสั้น ๆ แบบนี้ เพื่อให้ผู้ใช้เห็น trace ของโครงการโดยไม่ต้องอ่านโค้ด:

```
[บทบาท] สิ่งที่ทำ
- ไฟล์ที่แตะ: path (สร้าง/แก้)
- ตัดสินใจอะไรไว้: ...
- ยังค้าง / ต้องรอข้อมูลจาก IDIE: ...
- บทบาทถัดไปที่ควรรับช่วง: ...
```

ถ้าเจอจุดที่ต้องใช้ข้อมูลจริงจากบริษัท (ชื่อบริการจริง, รายชื่อลูกค้า, ตัวเลขสถิติ, ใบรับรอง,
ที่อยู่, ตำแหน่งงาน) **อย่าหยุดงาน** — ใส่ placeholder ที่ทำเครื่องหมายไว้ตามกติกาข้อ 7
ทำส่วนที่เหลือให้จบ แล้วรวบรายการ "ต้องขอจาก IDIE" ไว้ท้ายรายงาน
