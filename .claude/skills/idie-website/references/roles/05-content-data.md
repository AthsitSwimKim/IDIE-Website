# บทบาท `DATA` — Content & Data Architect

> **ที่มาของบทบาท:** เอกสารเขียนไว้ตรง ๆ ว่าข้อมูล "ไม่ควร hardcode กระจายอยู่ใน component
> แต่ควรแยกเป็น Data Layer เพื่อให้แก้ไขข้อมูลและเชื่อม Backend/CMS ในอนาคตได้ง่าย"
> บทบาทนี้ทำงานคู่กับทุก phase ไม่ใช่ phase เดียว — ทุกครั้งที่ `UI` ต้องการเนื้อหาใหม่

## ขอบเขต

**รับผิดชอบ:** TypeScript types, mock data, accessor layer, TH/EN, slug, ข้อมูลบริษัท,
รายการ "ต้องขอจาก IDIE", asset naming

**ไม่รับผิดชอบ:** การแสดงผล (`UI`), การ optimize รูป (`QA`)

---

## 1. โครงสร้าง

```
src/
├── types/content.ts        # จาก assets/data-model.ts — คัดลอกมาทั้งไฟล์
└── data/
    ├── index.ts            # accessor เท่านั้น — จุดเดียวที่ component เรียก
    ├── company.ts          # ข้อมูลบริษัท, ที่อยู่, สถิติ, why-us
    ├── services.ts
    ├── products.ts
    ├── product-categories.ts
    ├── brands.ts
    ├── references.ts       # โลโก้ลูกค้า (ไม่ใช่ project)
    ├── projects.ts         # ผลงานจริง (ไม่ใช่ logo)
    ├── news.ts
    ├── industries.ts
    ├── careers.ts
    └── i18n.ts             # ข้อความ UI ที่ไม่ใช่เนื้อหา (ปุ่ม, label, empty state)
```

### Accessor
`src/data/index.ts` เป็น **กำแพงเดียว** ระหว่าง component กับข้อมูล — component ห้าม
`import { products } from '@/data/products'` เด็ดขาด

```ts
export async function getProducts(filter?: ProductFilter): Promise<Product[]>
export async function getProductBySlug(slug: string): Promise<Product | null>
export async function getFeaturedProjects(limit = 3): Promise<Project[]>
export async function getLatestNews(limit = 3): Promise<NewsArticle[]>
export async function getReferenceCompanies(industry?: IndustrySlug): Promise<ReferenceCompany[]>
```

ทำเป็น `async` ตั้งแต่วันนี้ทั้งที่ข้อมูลอยู่ในหน่วยความจำ เพราะวันที่ต่อ API ถ้า signature
เปลี่ยนจาก sync เป็น async ทุก component ที่เรียกต้องแก้หมด — ต้นทุนวันนี้เท่ากับศูนย์

---

## 2. TH/EN

ทุกข้อความที่ผู้ใช้เห็นเป็น `LocalizedText = { th: string; en: string }`

```ts
name: { th: 'ระบบไฟฟ้าและเครื่องมือวัด', en: 'Electrical & Instrumentation' }
```

- อ่านผ่าน `useLocale()` → `t(field)` เลือกภาษาปัจจุบัน
- Fallback: ถ้า `th` ว่างให้ใช้ `en` และกลับกัน — อย่าให้หน้าว่างเปล่า
- ภาษาปัจจุบันเก็บใน `localStorage` + sync กับ `<html lang>` (สำคัญกับ screen reader และ SEO)
- **ห้ามแปลข้อความทางการของบริษัทเอง** — ชื่อบริการ, vision, mission, ชื่อใบรับรอง
  ถ้ายังไม่มีฉบับจริงให้ใส่ placeholder แล้วรวมเป็นรายการขอ (เอกสารระบุว่าการแปลอย่างเป็นทางการ
  อยู่นอก scope ถ้าบริษัทไม่ส่งข้อมูลมา)

---

## 3. ข้อมูลจริง vs Placeholder

**อ่าน `references/company-facts.md` ก่อนสร้าง data ทุกครั้ง** — มีข้อมูลจริงจากเว็บบริษัทแล้ว
การใส่ mock ทับสิ่งที่มีของจริงอยู่คือการทำงานซ้ำและเสี่ยงข้อมูลผิด

| Collection | สถานะ |
|---|---|
| `company.ts` (ชื่อ, ที่อยู่, โทร, อีเมล, ปีก่อตั้ง 1996, GM) | ✅ **จริง** |
| `services.ts` (4 บริการ — ชื่อ EN) | ✅ **จริง** (ชื่อไทยยังเป็นร่าง) |
| `industries.ts` (6 อุตสาหกรรม) | ✅ **จริง** |
| `brands.ts` (Industronic, FHF, MEDC) | ✅ **จริง** |
| `product-categories.ts` (6 category + area filter) | ✅ **จริง** (taxonomy จาก catalog ผู้ผลิต) |
| `references.ts` (35 บริษัท — ชื่อย่อ) | ✅ **จริง** (ชื่อเต็มยังเป็นร่าง) |
| `careers.ts` (Sale/Electrical Engineer) | ✅ **จริง** |
| `products.ts` (สินค้ารายตัว: ชื่อรุ่น, สเปก, ภาพ) | ⚠️ placeholder |
| `projects.ts` | ⚠️ placeholder — เว็บเดิมไม่มีข้อมูลผลงานเลย |
| `news.ts` | ⚠️ placeholder — เว็บเดิมเขียนว่า "Coming Soon" |
| Statistics, Vision/Mission, Certificates, ภาพทั้งหมด | ⚠️ placeholder |

### กติกาสำหรับส่วนที่ยังเป็น placeholder

```ts
{
  slug: 'petrochemical-plant-paga-upgrade',
  name: { th: 'โครงการตัวอย่าง (ยังไม่ยืนยัน)', en: 'Sample Project (placeholder)' },
  client: { th: 'ไม่เปิดเผย', en: 'Confidential' },
  industry: 'petrochemical',
  year: null,
  _placeholder: true, // TODO: confirm with IDIE
}
```

- ทุก record ที่แต่งขึ้นมี `_placeholder: true`
- **ห้ามผูกชื่อลูกค้าจริงเข้ากับ project ที่แต่งขึ้น** — รายชื่อ 35 รายเป็นลูกค้าจริงก็จริง
  แต่การบอกว่า "ทำโครงการ X ให้ PTT" โดยไม่มีข้อมูลยืนยัน คือการกล่าวอ้างเท็จ
  ใช้ `Confidential` หรือระบุแค่ industry
- ชื่อเต็มของบริษัทลูกค้า (คอลัมน์ที่ 3 ใน `company-facts.md` §7) เป็นการขยายจากชื่อย่อ
  → ใส่ `_placeholder: true` ไว้จนกว่า IDIE จะยืนยัน
- ตัวเลขสถิติใส่ `null` หรือค่าที่ดูออกว่าเป็น placeholder พร้อมคอมเมนต์ —
  **ตัวเลขที่แต่งขึ้นแล้วดูน่าเชื่อคือสิ่งที่อันตรายที่สุดในไฟล์นี้**
  ยกเว้นปีประสบการณ์ที่คำนวณจาก 1996 ได้จริง (`new Date().getFullYear() - 1996`)
- **ห้ามคัดลอกสเปกหรือภาพจาก catalog ของ FHF/MEDC/Eaton** — เป็นลิขสิทธิ์ผู้ผลิต
  ใช้ได้แค่โครงสร้างหมวดหมู่
- มี util `assertNoPlaceholders()` ที่ `QA` เรียกใน Phase 6 เพื่อไล่หา `_placeholder: true` ที่เหลือ

### รายการขอจาก IDIE
ดูแล `docs/data-requests.md` ให้เป็นปัจจุบัน — ทุกครั้งที่ใส่ placeholder ให้เพิ่มรายการ
จัดกลุ่มเป็น: ข้อความ / รูปภาพ / โลโก้ / เอกสาร (datasheet, certificate) / 3D asset
ไฟล์นี้คือสิ่งที่ผู้ใช้เอาไปคุยกับลูกค้าได้เลย มีค่ากับโครงการมากกว่าโค้ดหลายไฟล์

---

## 4. Slug

- Slug คือส่วนหนึ่งของ URL สาธารณะ → เมื่อกำหนดแล้ว **ห้ามเปลี่ยน** โดยไม่คิด (SEO + ลิงก์ที่ส่งกันไปแล้ว)
- ใช้อังกฤษ lowercase คั่นด้วย `-` แม้ชื่อไทย (`ระบบไฟฟ้า` → `electrical-systems`)
- ต้อง unique ภายในแต่ละ collection — เขียน test/assert เล็ก ๆ ตรวจตอน dev
- อย่าเจนจาก `name.th` อัตโนมัติ ให้กำหนดมือ เพราะ transliteration ไทยได้ผลลัพธ์ที่อ่านไม่รู้เรื่อง

---

## 5. ความสัมพันธ์ระหว่าง entity

เชื่อมด้วย **id/slug เท่านั้น** ไม่ใช่ nested object — เพราะ API/CMS จริงจะคืนมาเป็น reference

```ts
Project.relatedServices: ServiceSlug[]
Product.categorySlug: string
Product.brandId: string
ReferenceCompany.industry: IndustrySlug
```

- Resolve ความสัมพันธ์ใน accessor ไม่ใช่ใน component
- เขียน validation ตอน dev ว่าทุก reference ชี้ไปยัง entity ที่มีอยู่จริง — mock data ที่ชี้ผิด
  จะกลายเป็นหน้า 404 ที่หาสาเหตุยากตอน `UI` ประกอบหน้า

### Reference vs Project (ย้ำอีกครั้ง)
สอง collection นี้แยกกันสิ้นเชิงตามที่ลูกค้าต้องการ
- `ReferenceCompany` — ใคร: name, logo, industry, (optional) website
- `Project` — ทำอะไร: name, client, industry, location, year, scope, gallery, solution

`Project.client` เป็นแค่ **ข้อความ** ไม่ใช่ FK ไป `ReferenceCompany` เพราะบางโครงการลูกค้า
ไม่อนุญาตให้เปิดเผยชื่อ ถ้าผูกเป็น FK จะบังคับให้ต้องเปิดเผย

---

## 6. Asset naming

```
public/images/
├── reference/<slug>.svg          # โลโก้ลูกค้า — SVG หรือ PNG พื้นโปร่ง
├── projects/<slug>/cover.webp
├── projects/<slug>/gallery-01.webp
├── products/<slug>/main.webp
├── news/<slug>/cover.webp
└── company/...
public/models/
└── <slug>.glb
```

ชื่อไฟล์ผูกกับ slug เสมอ เพื่อให้เดาที่อยู่ไฟล์ได้จาก data โดยไม่ต้องเปิดดู

---

## Definition of Done

- [ ] `types/content.ts` ครบทุก entity และ `tsc --noEmit` ผ่าน
- [ ] ข้อมูลจริงจาก `company-facts.md` ถูกใส่ครบ: company, services 4, industries 8, brands 3,
      product-categories 6, references **35**, careers 1
- [ ] ส่วนที่ยังไม่มีของจริงมี mock พอทดสอบ: products 12 (กระจายข้าม category/brand/area),
      projects 6, news 6 — พอสำหรับทดสอบ filter, grid และ empty state จริง
- [ ] accessor ครบและเป็น async
- [ ] `grep -r "from '@/data/" src/components src/pages` ไม่พบผลลัพธ์ (ทุกอย่างผ่าน `@/data`)
- [ ] ทุก record ที่แต่งขึ้นมี `_placeholder: true`
- [ ] `docs/data-requests.md` เป็นปัจจุบัน
