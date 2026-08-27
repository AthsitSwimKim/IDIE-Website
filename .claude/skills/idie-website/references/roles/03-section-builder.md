# บทบาท `UI` — Section & Page Builder

> **ที่มาของบทบาท:** เอกสารเขียนไว้ตรง ๆ ว่า service listing ต้อง "ไม่ซ้ำ layout ตลอดทั้งหน้า"
> และ acceptance criteria บอกว่าต้อง "ไม่เป็น template ทั่วไป" — ซึ่งแปลว่าการวาง card grid
> เหมือนกัน 8 section ติดกันคือการทำงานไม่ผ่าน บทบาทนี้จึงเป็นบทบาทของ **จังหวะการเล่าเรื่อง**
> ไม่ใช่แค่คนแปลง spec เป็น JSX

## ขอบเขต

**รับผิดชอบ:** ประกอบ section และหน้าทั้ง 9 route ตาม `references/page-specs.md`,
เลือก layout pattern, responsive behavior ของ section, empty/loading state

**ไม่รับผิดชอบ:** สร้าง token หรือ primitive ใหม่ (ขอจาก `DS`), motion จริง (`XP` มาเติม),
เนื้อหาและ type (`DATA`)

---

## 1. กฎเหล็ก 4 ข้อ

1. **ทุก section ห่อด้วย `<Section>` จาก `DS`** ห้ามกำหนด `py-` / พื้นหลังเองใน section
   เหตุผล: จังหวะแนวตั้งของทั้งเว็บต้องมาจากที่เดียว ไม่งั้นเว็บจะดู "ต่อกันไม่สนิท"

2. **ข้อความทุกตัวมาจาก data layer หรือ i18n dictionary** ห้ามพิมพ์ลง JSX
   แม้แต่ headline ของ section (`OUR SERVICES`) — เพราะต้องมี TH/EN

3. **สอง section ที่ติดกันต้องต่างกันเชิงโครงสร้าง** ไม่ใช่แค่ต่างสี
   สลับระหว่าง: full-bleed image / split 2 คอลัมน์ / grid / horizontal scroll / centered statement /
   overlap card / logo wall — ถ้ากำลังจะวาง card grid อันที่สามติดกัน ให้หยุดแล้วเปลี่ยน pattern

4. **สร้าง section ตามลำดับใน page spec** เพราะลำดับคือ flow การเล่าเรื่อง
   ไม่ใช่เพราะลำดับใน spec เขียนไว้เฉย ๆ

---

## 2. Section Pattern ที่ใช้ได้ (เลือกให้ต่างกัน)

| Pattern | เหมาะกับ | ระวัง |
|---|---|---|
| **Split 2 คอลัมน์** (ข้อความ / ภาพ) | Company Profile, Why IDIE, Service Detail Overview | สลับข้าง text-left / image-left ระหว่าง section เพื่อไม่ให้จำเจ |
| **Full-bleed image + overlay** | Featured Projects, Career CTA | ต้องมี overlay พอให้ text contrast ผ่าน AA |
| **Grid** | Products, News, Careers, Logo Wall | อย่าให้ติดกันเกิน 2 section |
| **Horizontal scroll / carousel** | Featured Projects, Services บน desktop | ต้องมีปุ่ม prev/next และเลื่อนด้วยคีย์บอร์ดได้ |
| **Overlap card strip** | Engineering Highlights (ตาม mockup — การ์ดคร่อมรอยต่อ hero) | ต้องคุม z-index และ mobile ให้ตกลงมาเป็น stack |
| **Centered statement** | Contact CTA, Vision & Mission | ใช้ได้ครั้งเดียวต่อหน้า ไม่งั้นหมดพลัง |
| **Dark stat band** | Engineering Statistics | ตัวเลขใช้ `tabular-nums` |
| **Timeline** | About History | mobile เปลี่ยนเป็นแนวตั้งเสมอ |

---

## 3. หน้าที่ต้องระวังเป็นพิเศษ

### Home
14 section ตาม `page-specs.md` — สร้างทีละ section แล้วรายงาน อย่าเขียนรวดเดียว 1400 บรรทัด
Hero ใน Phase 3 ทำเป็น **static hero ที่สมบูรณ์** (ภาพ + headline + CTA) ไปก่อน
`XP` จะมาสวม 3D ทับใน Phase 5 โดยที่ static version ยังคงอยู่เป็น fallback

### `/products` — หน้าที่สำคัญที่สุดของเว็บใหม่
- Filter (category + brand) และ search ต้อง **sync กับ URL query param**
  (`/products?category=pump&brand=abc&q=xyz`) เพราะผู้ใช้ B2B ส่งลิงก์หากันในองค์กร
- Filter ทำงานฝั่ง client บน mock data แต่เขียนให้ logic แยกเป็น `filterProducts(products, criteria)`
  ใน `src/utils/` เพื่อวันที่ย้ายไป server-side แล้วไม่ต้องรื้อ component
- ต้องมี **empty state** ที่เป็นมิตร ("ไม่พบสินค้าที่ตรงกับเงื่อนไข" + ปุ่มล้าง filter)
- ไม่มีราคา — CTA คือ `Contact for Inquiry` ที่ลิงก์ไป `/contact?product=<slug>`

### `/reference` vs `/projects` — อย่าให้ปนกัน
นี่คือความสับสนที่ลูกค้าระบุว่าอยากแก้จากเว็บเดิม

- `/reference` = **ใคร** — logo grid, ช่องเท่ากัน, grayscale→color hover, filter ตาม industry
  ไม่มีรายละเอียดงาน
- `/projects` = **ทำอะไร** — ภาพจริงเด่น, client/industry/location/year/scope
- ห้ามใส่ logo wall ลงหน้า Projects และห้ามใส่ project card ลงหน้า Reference
- Copy บนหน้าต้องช่วยแยกให้ผู้ใช้เข้าใจเอง ไม่ใช่ให้เดา

### Logo Wall (ใช้ทั้ง Home และ `/reference`)
- ทุกโลโก้อยู่ในกล่องสัดส่วนเท่ากัน (`aspect-[3/2]`) และ `object-contain` — โลโก้ลูกค้ามีสัดส่วนไม่เท่ากัน
  ถ้าไม่คุมกล่อง หน้าจะดูรก
- Default `grayscale` + opacity ~70%, hover เป็นสีเต็ม + `scale-105` + soft blue ring
- **Grayscale ต้องหายบน touch device** (`@media (hover: none)`) ไม่งั้นมือถือเห็นแต่โลโก้เทา
- `alt` ต้องเป็นชื่อบริษัทจริง ไม่ใช่ `"logo"` — acceptance criteria ระบุเรื่อง alt text

### `/contact`
- Form validate ฝั่ง client ครบ (required, email format, phone format)
- Submit → `setState('submitted')` แล้วแสดงข้อความว่า **ยังไม่ได้ส่งจริง** (`// TODO: connect to backend`)
  อย่าทำ UI ที่ทำให้ผู้ใช้เข้าใจผิดว่าข้อความถูกส่งไปแล้ว
- อ่าน `?product=` จาก query แล้ว prefill subject

---

## 4. Responsive

ทำ **mobile-first** เสมอ — เขียน base เป็น mobile แล้วเติม `md:` `lg:` `xl:`

| Breakpoint | แนวทาง |
|---|---|
| Mobile (< 768) | Content-first, stack ทุกอย่าง, hamburger, touch target ≥44px, CTA เต็มความกว้าง |
| Tablet (768–1023) | Simplified layout, grid 2 คอลัมน์, ลด complex scroll |
| Laptop (1024–1439) | รักษา layout หลัก ลดรายละเอียด effect บางส่วน |
| Desktop (≥1440) | Full experience, large typography, advanced layout |

ตรวจทุก section ที่ **375px** ก่อนถือว่าเสร็จ — จอแคบสุดคือที่ที่ layout พังก่อนเสมอ
และห้ามมี horizontal scroll เด็ดขาด

---

## 5. ภาพ

- ใช้ `<img>` พร้อม `width`/`height` หรือ `aspect-ratio` เสมอ — กัน layout shift
- `loading="lazy"` + `decoding="async"` ทุกภาพ **ยกเว้นภาพ hero** (ใส่ `fetchPriority="high"` แทน)
- ระหว่างยังไม่มีภาพจริงจาก IDIE ใช้ placeholder ที่เป็นสี่เหลี่ยมสีเทาพร้อมข้อความบอกขนาดที่ต้องการ
  (เช่น `Project image 1600×900`) จะได้รวมเป็นรายการขอภาพจากลูกค้าได้ทันที
- อย่าใช้ภาพจากอินเทอร์เน็ตที่ไม่มีสิทธิ์ใช้งาน แม้เป็น prototype

---

## Definition of Done (ต่อ section)

- [ ] ห่อด้วย `<Section>` และใช้ token จาก `DS` ทั้งหมด
- [ ] ข้อความมาจาก data layer / i18n ครบ ไม่มี string ใน JSX
- [ ] layout ต่างจาก section ที่อยู่ติดกัน
- [ ] ตรวจแล้วที่ 375 / 768 / 1280 / 1536
- [ ] มี empty state ถ้า section ขึ้นกับ list
- [ ] มี `alt` ที่มีความหมายทุกภาพ, heading level ต่อเนื่องไม่ข้ามระดับ
