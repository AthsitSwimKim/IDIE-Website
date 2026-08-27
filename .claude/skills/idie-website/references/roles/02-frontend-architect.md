# บทบาท `FE` — Frontend Architect

> **ที่มาของบทบาท:** deliverable ข้อสุดท้ายคือ "โครงสร้างที่พร้อมเชื่อม Backend / CMS ใน phase ถัดไป"
> โครงสร้างที่พร้อมต่อ backend ไม่ได้เกิดตอนจะต่อ backend — มันเกิดตอนวางโฟลเดอร์วันแรก
> บทบาทนี้ตัดสินใจเรื่องที่**แก้ทีหลังแพง** ส่วนเรื่องที่แก้ทีหลังถูกให้ปล่อยผ่าน

## ขอบเขต

**รับผิดชอบ:** โครงสร้าง `src/`, vite config, TS config + path alias, routing + code splitting,
layout shell (Header/Footer/Nav/ScrollToTop), error & suspense boundary, SEO meta per route

**ไม่รับผิดชอบ:** เนื้อหาใน section (`UI`), token (`DS`), data content (`DATA`)

---

## 1. โครงสร้าง `src/`

โครงนี้มาจากเอกสารโครงการโดยตรง อย่าคิดโครงใหม่

```
src/
├── assets/              # รูป/ไอคอน/โมเดล ที่ผ่าน build pipeline
├── components/
│   ├── ui/              # primitive จาก DS (Button, Card, Section, Container...)
│   ├── layout/          # Header, Footer, Nav, MobileMenu, LanguageSwitch, Layout
│   └── sections/        # section ที่ใช้ซ้ำข้ามหน้า (CtaBanner, LogoWall, NewsGrid...)
├── pages/
│   ├── home/            # section เฉพาะหน้า Home อยู่ใต้ folder ของหน้านั้น
│   ├── products/
│   ├── reference/
│   ├── projects/
│   ├── news/
│   └── ...
├── data/                # mock data layer — จุดเดียวที่มีเนื้อหา
├── types/               # TypeScript types (content.ts จาก assets/data-model.ts)
├── hooks/               # useDeviceTier, useReducedMotion, useLocale, useScrollProgress
├── utils/               # cn(), formatDate(), slugify()
├── styles/              # theme.css (token) + global
├── three/               # scene, model, material, loader — ทุกอย่างที่ import three
└── animations/          # motion variants ที่ใช้ซ้ำ
```

**กฎเดียวที่สำคัญ:** section ที่ใช้ในหน้าเดียวอยู่ใต้ `pages/<page>/`, section ที่ใช้ ≥2 หน้า
ย้ายขึ้น `components/sections/` ย้ายตอนที่ต้องใช้จริง ไม่ใช่ตอนเดา

### Path alias
ตั้ง `@/*` → `src/*` ทั้งใน `tsconfig.json` (`paths`) และ `vite.config.ts` (`resolve.alias`)
ต้องตั้งทั้งสองที่ ไม่งั้น TS ผ่านแต่ build พัง

---

## 2. Routing

```
/                    Home
/about               About
/services            ServiceList
/services/:slug      ServiceDetail
/products            ProductList
/products/:slug      ProductDetail
/reference           Reference
/projects            ProjectList
/projects/:slug      ProjectDetail
/news                NewsList
/news/:slug          NewsDetail
/careers             Careers
/contact             Contact
*                    NotFound
```

- ใช้ `createBrowserRouter` กับ layout route เดียวที่ครอบทุกหน้า
- **Code split ตาม route ทุกหน้า** ด้วย `React.lazy` — ยกเว้น Home ที่ควรอยู่ใน initial bundle
  เพราะเป็นทางเข้าหลัก
- ทุก route ต้องมี `<ScrollToTop />` — React Router ไม่รีเซ็ต scroll ให้เอง และอาการ
  "กดเมนูแล้วอยู่กลางหน้า" คือสิ่งแรกที่ลูกค้าเห็น
- `:slug` ที่ไม่พบใน data layer ต้อง render NotFound ไม่ใช่ crash

### SEO meta
ทำ `<Seo title description image />` component เล็ก ๆ (React 19 hoist `<title>`/`<meta>` ให้เอง
ไม่ต้องพึ่ง react-helmet) แล้วเรียกทุกหน้า — เตรียมทางไว้สำหรับ structured data ใน phase ถัดไป

---

## 3. Layout Shell (Phase 2)

### Header
- Desktop: logo + 8 เมนู + TH/EN switch ตาม mockup
- **Projects อยู่ใน dropdown ใต้ Reference** เพื่อไม่ให้ header แน่น
- Transparent บน Hero → เปลี่ยนเป็นพื้นทึบ + shadow เมื่อ scroll ผ่าน ~80px
  (ทำด้วย `IntersectionObserver` บน sentinel element ไม่ใช่ scroll listener — ถูกกว่ามาก)
- Active route ต้องเห็นชัด (underline สีน้ำเงินตาม mockup)

### Mobile Nav
- Hamburger → full-screen หรือ slide-in panel
- **ต้อง trap focus ตอนเปิด, ปิดด้วย Esc, คืน focus ให้ปุ่มเดิมตอนปิด, ล็อค body scroll**
  นี่คือจุดที่ acceptance criteria ข้อ keyboard มักตกในโครงการแบบนี้
- ปิดเมนูอัตโนมัติเมื่อ route เปลี่ยน

### Footer
ข้อมูลบริษัท + เมนู Services / Products / Reference + Contact
เนื้อหามาจาก `src/data/company.ts` ไม่ hardcode

---

## 4. Boundary

- `<ErrorBoundary>` ครอบ layout — เว็บพังทั้งจอเพราะ section เดียวคือสิ่งที่รับไม่ได้ในเว็บองค์กร
- `<Suspense>` แยกสองระดับ: route-level (skeleton เต็มหน้า) และ 3D-level (`XP` จัดการเอง)
- Skeleton ต้องมีขนาดใกล้เคียงของจริงเพื่อกัน layout shift

---

## 5. เตรียมทางต่อ backend

สิ่งเหล่านี้ทำตอนนี้เกือบไม่มีต้นทุน แต่ทำทีหลังแพงมาก:

- **Component ห้าม import จาก `src/data/` โดยตรง** — ให้ผ่าน accessor ใน `src/data/index.ts`
  (`getProducts()`, `getProductBySlug()`, ...) วันที่เปลี่ยนเป็น API แก้แค่ไฟล์เดียว
- Accessor ควรมี signature ที่กลายเป็น async ได้ไม่เจ็บ — ถ้าจะให้ดีทำเป็น `async` ตั้งแต่แรก
  แล้วให้หน้าใช้ผ่าน hook `useProducts()` ที่วันนี้ resolve ทันที
- Env-driven config อยู่ใน `src/config.ts` ตัวเดียว (API base URL, feature flag เช่น `ENABLE_3D`)
- อย่าใส่ state manager (Redux/Zustand) — โครงการนี้ไม่มี state ที่ต้องใช้ ใส่ไปคือหนี้

---

## Definition of Done

**Phase 0–1:** `npm run dev` ขึ้น, `tsc --noEmit` ผ่าน, lint ผ่าน, alias ใช้ได้,
ทุก route ใน sitemap render placeholder ได้, code split ทำงาน (เห็น chunk แยกใน network)

**Phase 2:** Header/Footer/Nav ครบ, ทดสอบด้วยคีย์บอร์ดล้วนผ่านทุกเมนู,
ทดสอบ 4 breakpoint (mobile 375 / tablet 768 / laptop 1280 / desktop 1536) แล้วไม่มี overflow แนวนอน
