# Page Specs — Sitemap, Home Sections และ Route รายหน้า

อ่านไฟล์นี้**ก่อน**สร้างหรือแก้หน้า/section ใด ๆ

## สารบัญ
- [1. Sitemap และ Navigation](#1-sitemap-และ-navigation)
- [2. Home — 15 Section](#2-home--15-section)
- [3. Route รายหน้า](#3-route-รายหน้า)
- [4. ตารางลำดับความสำคัญ 3D](#4-ตารางลำดับความสำคัญ-3d)

---

## 1. Sitemap และ Navigation

| เมนู | Route | หน้าที่ |
|---|---|---|
| Home | `/` | สรุปภาพรวมบริษัท บริการ ผลิตภัณฑ์ reference project และ CTA |
| About Us | `/about` | Company Profile, History, Vision & Mission, Organization, Certificates |
| Services | `/services`, `/services/:slug` | บริการทั้งหมดและรายละเอียดแต่ละบริการ |
| Products | `/products`, `/products/:slug` | Categories, Brands, Listing, Product Detail |
| Brands ⭐ | `/brands` | แบรนด์คู่ค้า Industronic / FHF / MEDC — อยู่ใน dropdown ใต้ Products |
| Reference | `/reference` | โลโก้บริษัทลูกค้าที่เคยร่วมงานกับ IDIE |
| Projects | `/projects`, `/projects/:slug` | ผลงาน engineering ที่เคยดำเนินการ |
| News | `/news`, `/news/:slug` | ข่าวสารบริษัทและบทความ |
| Careers | `/careers` | ตำแหน่งงานและ employer branding |
| Contact Us | `/contact` | ข้อมูลติดต่อ แผนที่ และ inquiry form (frontend) |

**Desktop header:** `Home | About Us | Services | Products ▾ | Reference ▾ | News | Careers | Contact Us | TH/EN`

หน้าที่เกินจาก 8 เมนูหลักถูกจัดลง dropdown เพื่อไม่ให้ header แน่น:
- **Products ▾** → Products · Brands
- **Reference ▾** → Reference · Projects

จัดแบบนี้เพราะ Brands กับ Products เป็น "สิ่งที่เราขาย" เหมือนกัน ส่วน Projects กับ Reference
เป็น "หลักฐานว่าเราเคยทำอะไรมา" เหมือนกัน

---

## 2. Home — 15 Section

หน้า Home ต้องเล่าเรื่องบริษัททั้งหมดจบใน flow เดียว ผู้ใช้ควรเข้าใจธุรกิจ IDIE ได้โดยไม่ต้องเปิดทุกเมนู
**ลำดับนี้คือลำดับการเล่าเรื่อง อย่าสลับโดยไม่มีเหตุผล**

| # | Section | รายละเอียด / Interaction |
|---|---|---|
| 1 | **3D Hero** | Full-screen, headline, CTA, 3D engineering object, mouse parallax, subtle camera motion |
| 2 | **Company Profile** | ประวัติย่อ + ภาพองค์กร/โรงงาน + CTA ไป About Us |
| 3 | **Engineering Highlights** | Experience, Expert Team, Quality, Safety พร้อม icon / count-up |
| 4 | **Our Services** | Interactive service cards หรือ split layout พร้อม hover / image reveal |
| 5 | **Brand Partners** ⭐ | โลโก้ Industronic / FHF / MEDC + ประโยคจุดยืน "สินค้าจากยุโรปและสหรัฐฯ เท่านั้น" |
| 6 | **Products** | Featured product categories + 3D product showcase / technical hotspot |
| 7 | **Our References** | Logo wall 8–12 ราย แสดงสีเต็ม + hover ขยายเล็กน้อย |
| 8 | **Featured Projects** | Project showcase ภาพใหญ่ / parallax / horizontal transition |
| 9 | **Industries We Serve** | Industry network / node visualization หรือ interactive grid |
| 10 | **Why IDIE** | Quality, Safety, On-time Delivery, Support |
| 11 | **Engineering Statistics** | Dark section + count-up + wireframe background |
| 12 | **Latest News** | ข่าวล่าสุด 3 รายการ + CTA ไป News |
| 13 | **Career CTA** | Banner เชิญชวนร่วมงาน |
| 14 | **Contact CTA** | Large CTA: `LET'S ENGINEER YOUR NEXT SOLUTION.` |
| 15 | **Footer** | ข้อมูลบริษัท เมนู Services / Products / Reference และ Contact |

> ⭐ **Brand Partners เพิ่มเข้ามาเกินจากเอกสารต้นฉบับ** ตามคำขอของลูกค้า —
> เว็บเดิมให้ความสำคัญกับส่วนนี้บนหน้าแรก พร้อมประโยค
> *"We supplies only good quality product from Europe or USA, Our partner are as below."*
> เหตุผลเชิงธุรกิจ: IDIE เป็น engineering **+ distributor** ความน่าเชื่อถือส่วนหนึ่ง
> มาจากการเป็นตัวแทนของผู้ผลิตยุโรปที่ฝ่ายวิศวกรรมของลูกค้ารู้จักอยู่แล้ว
>
> **ใช้ block เดียวกับ logo wall ของลูกค้าทุกอย่าง** — กล่อง aspect-3/2 มีเส้นขอบ, object-contain,
> ผืนผ้าใบ 480×320 และแสดงสีเต็มตั้งแต่แรกเหมือนกัน เพื่อให้ผนังโลโก้ทั้งสองที่ดูเป็นระบบเดียวกัน
>
> โลโก้แบรนด์ใช้ไฟล์ต้นฉบับที่ลูกค้าส่งมา (`assets-src/brand-logos/`) ซึ่งเป็นสีบนพื้นขาวทั้งสาม
> จึงทำพื้นโปร่งได้หมด — ต่างจากไฟล์ชุดเดิมบนเว็บ IDIE ที่ Industronic เป็นขาวบนพื้นน้ำเงิน

### 2.1 Hero 3D Concept
- Headline: เอกสารเสนอ `ENGINEERING THE FUTURE OF INDUSTRY.` / `TOTAL SOLUTION FOR INDUSTRIAL ENGINEERING`
  แต่สองอันนี้กว้างเกินตัวตนจริง — เตรียมทางเลือกที่ตรงกว่าให้ลูกค้าเลือกด้วย เช่น
  `INDUSTRIAL COMMUNICATION & SAFETY SIGNALLING. SINCE 1996.` (ดู `company-facts.md` §8)
- ด้านขวาหรือกลางจอมี 3D object ที่**เป็นสินค้าที่ IDIE ขายจริง** — explosion-proof telephone,
  beacon, sounder หรือ signal horn ในบริบทฉาก plant ไม่ใช่ machine/factory module ลอย ๆ
  เพราะของจริงมีรายละเอียดเชิงกล (cable gland, mounting, certification plate) ที่สื่อความเชี่ยวชาญได้ทันที
- โมเดลหมุนช้า ๆ และตอบสนอง mouse movement เล็กน้อย
- Scroll เปลี่ยน camera / object position เพื่อเชื่อมเข้าสู่ section ถัดไป
- **Mobile ใช้ภาพ static หรือ simplified canvas แทนโมเดลหนัก**

### 2.2 Reference Logo Section
เน้น "โลโก้บริษัทที่เคยร่วมงานกับ IDIE" เพื่อสร้างความน่าเชื่อถือ แสดงเด่น 8–12 ราย + ปุ่ม `View All References`

- ~~Default: grayscale / low saturation~~ → **ลูกค้าเลือกให้แสดงสีเต็มตั้งแต่แรก** (ตัดสินใจ Phase 2)
  เหตุผล: โลโก้ลูกค้าคือหลักฐานความน่าเชื่อถือ ไม่ควรต้อง hover ก่อนถึงจะเห็นว่าเป็นใคร
- Hover: ขยายเล็กน้อย + ขอบกล่องเปลี่ยนสี (ไม่เปลี่ยนสีโลโก้)
- ใช้ treatment เดียวกันทั้ง logo wall ของลูกค้าและของแบรนด์คู่ค้า
- Desktop เพิ่ม depth / 3D logo wall แบบ subtle ได้
- Mobile ใช้ responsive logo grid เพื่อความเร็วและอ่านง่าย
- ถ้าบริษัทไม่ต้องการเปิดเผยรายละเอียด project ให้โลโก้ทำหน้าที่เป็น reference showcase เท่านั้น

---

## 3. Route รายหน้า

### 3.1 `/about` — About Us
- **Company Profile** — ประวัติและข้อมูลบริษัท
- **History / Timeline** — พัฒนาการของบริษัท
- **Vision & Mission** — เป้าหมายและแนวทางการดำเนินธุรกิจ
- **Organization / Team** — โครงสร้างหรือทีมหลักตามข้อมูลที่บริษัทเปิดเผย
- **Certificates / Standards** — ใบรับรองหรือมาตรฐาน (ถ้ามี)

### 3.2 `/services`, `/services/:slug`
บริการจริง 4 กลุ่ม (ดูรายละเอียดใน `company-facts.md` §3):
**Intercommunication System · Public Address & Warning Alarm (PA/GA) · Network & CCTV System ·
Industrial & Explosion-proof Telephone / Signaling Device**
คร่อมด้วยความสามารถ `Design & Engineering` · `Procurement` · `Service & Maintenance`

> ⚠️ รายการ Mechanical / Electrical / Automation & Control / Installation & Commissioning
> ในเอกสาร `.docx` **ไม่ใช่บริการของ IDIE** — เป็นตัวอย่างทั่วไปที่เอกสารใส่มาก่อนได้ข้อมูลจริง
> อย่านำมาใช้

- **Listing** — interactive section หรือ card ที่**ไม่ซ้ำ layout ตลอดทั้งหน้า**
- **Detail** — Hero, Overview, Scope, Applications, Related Project, Contact CTA
- เตรียม field เชื่อม service ↔ product ↔ project ไว้ในอนาคต

### 3.3 `/products`, `/products/:slug`
เมนูหลักและส่วนสำคัญที่สุดของเว็บใหม่ ออกแบบสำหรับ B2B industrial product
**ไม่ต้องใส่ราคา** เน้น brand, model, application, specification และ inquiry

| ส่วน | รายละเอียด |
|---|---|
| Product Hero | แนะนำ Product Solutions และ featured category |
| Category Filter | กรองตามประเภทสินค้า — 6 category จริงใน `company-facts.md` §6 |
| **Area Filter** | **Hazardous Area (Ex) / Industrial / Marine & Offshore** — แกนที่ฝ่ายจัดซื้อโรงงานปิโตรเคมีมองหาก่อนอย่างอื่น และเป็นแกนที่ catalog ผู้ผลิตใช้แบ่ง ต้องมีตั้งแต่ Phase 4 |
| Brand Filter | Industronic / FHF / MEDC |
| Search | ค้นหาชื่อสินค้า / model / keyword |
| Product Grid | Image, product name, brand, model, short description |
| Product Detail | Gallery, Overview, Features, Applications, Technical Specs, Downloads |
| CTA | Contact for Inquiry / Request Information |

**Product 3D Experience:** drag to rotate สำหรับสินค้าที่มี 3D model, hotspot อธิบาย feature,
เตรียมแนวทาง exploded view ในอนาคต, **ต้องมี static image / gallery เป็น fallback เสมอ**

### 3.4 `/reference`
แสดงบริษัทและองค์กรที่เคยร่วมงานกับ IDIE โดยใช้โลโก้เป็นองค์ประกอบหลัก
**แตกต่างจากหน้า Projects ที่นำเสนอรายละเอียดของงาน**

| องค์ประกอบ | รายละเอียด |
|---|---|
| Reference Hero | ข้อความสร้างความน่าเชื่อถือ เช่น "Trusted by leading companies and industrial partners" |
| Logo Grid | แสดงโลโก้ในสัดส่วนและพื้นที่เท่ากัน |
| Filter | All / Petrochemical / Oil & Gas / Chemical / Power Plant / Fertilizer / Mining / EPC *(ตาม `company-facts.md` §4 — ไม่ใช่รายการ Automotive/Electronics ในเอกสาร `.docx`)* |
| Hover | Grayscale → full color, slight scale, blue highlight |
| Optional Detail | ถ้ามีข้อมูล กดโลโก้ไป company reference detail หรือรายการ project ได้ |

### 3.5 `/projects`, `/projects/:slug`
นำเสนอ **ผลงานจริง** — `Reference คือใคร` ส่วน `Project คือทำอะไร`

- Field: Project Name / Client / Industry / Location / Year / Scope of Work
- Project Overview และ Engineering Solution
- Project Gallery โดยใช้ภาพจริงเป็นจุดเด่น
- Featured Projects บน Home ใช้ large image / parallax เพื่อสร้าง impact
- รองรับ Related Project และ Related Service

### 3.6 `/news`, `/news/:slug`
- Listing: ภาพ, category, date, title, short description
- Detail: รองรับบทความ รูปภาพ และข้อมูลอัปเดตของบริษัท
- Home แสดงเฉพาะ 3 ข่าวล่าสุด เพื่อบอกว่าบริษัทยัง active

### 3.7 `/careers`
- Career banner บน Home เพื่อ employer branding
- หน้า Careers แสดงตำแหน่งงานและรายละเอียดเบื้องต้น
- Phase นี้ใช้ mock data; เชื่อมระบบ recruitment ในอนาคต

### 3.8 `/contact`
- Company Information: Address, Telephone, Email, Business Hours
- Map placeholder / Google Map integration ในอนาคต
- Inquiry form (frontend): Name, Company, Email, Telephone, Subject, Message
- รองรับ **product inquiry context** — ส่งชื่อ product ที่ผู้ใช้กำลังดูมายัง form ได้
  (ทำผ่าน query param เช่น `/contact?product=<slug>` แล้ว prefill subject)

---

## 4. ตารางลำดับความสำคัญ 3D

โครงการนี้**ไม่ได้ต้องการให้ทุกส่วนเป็น 3D** — เลือกใช้เฉพาะจุดที่สร้างความแตกต่างและอธิบายงาน
engineering ได้ดีที่สุด ถ้าเวลาไม่พอ ให้ตัดจากล่างขึ้นบน

| พื้นที่ | 3D / Interaction | ความสำคัญ |
|---|---|---|
| Hero | 3D industrial object + camera/mouse parallax | **สูง** |
| Products | Interactive viewer, rotate, hotspot, optional exploded view | **สูง** |
| Reference | Depth logo wall / hover perspective | กลาง |
| Industries | Node network / 3D หรือ SVG interactive visualization | กลาง |
| Projects | Parallax image / depth transition | กลาง |
| Service Cards | 3D tilt / hover depth | ต่ำ–กลาง |
| Background | Blueprint / grid / technical line animation | ต่ำ |
