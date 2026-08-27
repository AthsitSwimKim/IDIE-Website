# Project Brief — IDIE Website Redesign

สรุปจากเอกสาร `IDIE_Website_Redesign_Project_Details.docx` ใช้เป็น source of truth เรื่อง **scope**
เมื่อไม่แน่ใจว่างานใดอยู่ในขอบเขตหรือไม่ ให้ตัดสินจากไฟล์นี้

> ⚠️ **เรื่อง *เนื้อหา* ให้ยึด `company-facts.md` แทนเสมอ**
> เอกสารฉบับนี้เขียนขึ้นก่อนได้ข้อมูลจริงจากบริษัท ตัวอย่างชื่อบริการและ industry filter ในนี้
> จึงเป็นของทั่วไปที่ไม่ตรงกับธุรกิจจริงของ IDIE (ระบบสื่อสารและสัญญาณเตือนภัย hazardous area)
> ดูรายการที่คลาดเคลื่อนทั้งหมดใน `company-facts.md` §8

## สารบัญ
- [1. แก่นของโครงการ](#1-แก่นของโครงการ)
- [2. วัตถุประสงค์](#2-วัตถุประสงค์)
- [3. กลุ่มผู้ใช้เป้าหมาย](#3-กลุ่มผู้ใช้เป้าหมาย)
- [4. Design Direction](#4-design-direction)
- [5. Tech Stack](#5-tech-stack)
- [6. Deliverables](#6-deliverables)
- [7. Acceptance Criteria](#7-acceptance-criteria)
- [8. นอกขอบเขต Phase หลัก](#8-นอกขอบเขต-phase-หลัก)
- [9. แนวทางต่อยอดในอนาคต](#9-แนวทางต่อยอดในอนาคต)

---

## 1. แก่นของโครงการ

**Engineering the Future of Industry** — ผู้เข้าชมต้องเข้าใจได้เร็วว่า IDIE คือใคร ให้บริการอะไร
มีผลิตภัณฑ์อะไร เคยทำงานกับบริษัทใด และติดต่ออย่างไร

ยกระดับเว็บไซต์เดิมให้เป็น Modern Corporate Website โดย**คงความน่าเชื่อถือของบริษัทเดิมไว้**
สิ่งที่เปลี่ยนคือภาพลักษณ์ โครงสร้างข้อมูล และประสบการณ์ใช้งาน ไม่ใช่ตัวตนของบริษัท

**Final Design Direction ที่ตกลงไว้:**
European Industrial Corporate Website + Modern Engineering + Interactive Technology
+ 3D Product Experience + Premium IDIE Corporate Identity

### จุดเด่นที่ต้องได้ 6 ข้อ
1. **Modern Corporate** — ยกจากเว็บเดิมสู่ภาพลักษณ์องค์กรวิศวกรรมยุคใหม่
2. **Interactive 3D** — 3D เด่นใน Hero, Product และบาง section โดยไม่รบกวนการใช้งาน
3. **Product Focus** — เพิ่มหน้า Products และ Product Detail รองรับสินค้าอุตสาหกรรม
4. **Reference Logo** — โชว์โลโก้ลูกค้าเป็น social proof ที่เด่นชัด
5. **Project Showcase** — แยก Reference Company ออกจาก Project Reference ให้ชัด
6. **Future Ready** — โครงสร้าง frontend พร้อมต่อ backend/API/CMS

---

## 2. วัตถุประสงค์

- ปรับภาพลักษณ์ให้ทันสมัยและสอดคล้องมาตรฐานเว็บองค์กรปัจจุบัน
- สื่อสาร Engineering, Industrial Solutions, Products, Services ให้เข้าใจง่าย
- สร้างความน่าเชื่อถือผ่าน Company Profile, Project Experience, Reference Logos
- จัดโครงสร้างข้อมูลใหม่ให้ค้นหาบริการและสินค้าได้สะดวกกว่าเว็บเดิม
- เพิ่มความน่าสนใจผ่าน 3D, Motion, Scroll Storytelling, Micro Interaction โดยยังคง Professional UX
- รองรับหลายขนาดจอ และคำนึงถึง Accessibility กับ Performance
- เตรียม architecture ให้ต่อ backend/API/CMS/Inquiry ได้ง่าย

---

## 3. กลุ่มผู้ใช้เป้าหมาย

ใช้ตารางนี้ตัดสินว่า section หรือ CTA ควรพาไปไหน — ถ้า section ไหนไม่ตอบใครเลย แปลว่าไม่จำเป็น

| กลุ่มผู้ใช้ | ความต้องการหลัก | สิ่งที่เว็บต้องตอบ |
|---|---|---|
| ลูกค้าองค์กร / โรงงาน | หาผู้ให้บริการและ solution | Services, Projects, Reference, Contact |
| ฝ่ายวิศวกรรม / จัดซื้อ | ค้นหาสินค้าและสเปก | Products, Categories, Brand, Datasheet placeholder |
| Partner / Supplier | ประเมินศักยภาพบริษัท | Company Profile, Reference, Industries |
| ผู้สมัครงาน | ดูบริษัทและตำแหน่งงาน | Company, Career, Contact |
| ผู้ใช้ทั่วไป | ทำความรู้จักบริษัท | Home, About, News |

---

## 4. Design Direction

แนวทาง **Modern Industrial Corporate** — ผสมความเป็น Engineering เข้ากับเทคโนโลยีสมัยใหม่
white space เพียงพอ, ภาพขนาดใหญ่, typography ชัดเจน เสริมด้วย blueprint grid, technical line,
wireframe, data node และ 3D object เพื่อสร้างเอกลักษณ์ของ IDIE

### 4.1 Brand & Color System

| องค์ประกอบ | แนวทาง |
|---|---|
| Primary | **IDIE Blue** — CTA, active state, accent, key visual |
| Dark | **Deep Navy** — Hero, Statistics, Footer, section ที่ต้องการ contrast |
| Neutral | White / Light Gray / Industrial Gray — ทำให้ layout สะอาดและอ่านง่าย |
| Accent | Cyan / Electric Blue **ในปริมาณจำกัด** สำหรับ 3D, glow, technical line, interaction |
| Typography | Sans Serif บุคลิก Corporate + Engineering อ่านง่ายทั้งไทยและอังกฤษ |

ค่าจริงของ token อยู่ใน `assets/design-tokens.css` (สกัดจากโลโก้และ mockup ที่ลูกค้าให้มา)

### 4.2 Visual Language

**ใช้:** Industrial factory, machinery, pipeline, electrical, automation, engineering component;
blueprint/CAD-inspired grid และ technical drawing แบบ subtle; large image composition และ
full-width visual สำหรับ project/product; เส้น engineering line หรือ pipeline line เป็น motif
ที่เชื่อม section

**หลีกเลี่ยง:** Cyberpunk, neon มากเกินไป, sci-fi ที่ทำให้เสียความน่าเชื่อถือขององค์กร

### 4.3 Motion Design Principles

> Motion should support the engineering story, not distract from it.

| ควรใช้ | ไม่ควรใช้ |
|---|---|
| Smooth reveal, parallax, mask/image reveal, count-up, 3D tilt, magnetic button แบบ subtle | Animation ทุก element พร้อมกัน |
| Scroll progress เพื่อเล่าเรื่องและเชื่อม section | Glow หนัก ๆ หรือเอฟเฟกต์กะพริบ |
| 3D เฉพาะ Hero / Product / Interactive Showcase | 3D หนักทุกหน้าและทุก device |
| Motion ที่มีจุดประสงค์และไม่บัง content | Scroll hijacking ที่ทำให้ใช้งานยาก |

---

## 5. Tech Stack

| หมวด | เทคโนโลยี | วัตถุประสงค์ |
|---|---|---|
| Core | React + TypeScript | Component-based UI + type safety |
| Build | Vite | Dev/build เร็ว |
| Routing | React Router | Route และ detail page |
| Styling | **Tailwind CSS v4 + CSS Variables** (ตัดสินใจแล้ว) | Design system + responsive |
| Motion | Framer Motion | Page/component animation, micro interaction |
| Advanced scroll | GSAP *(เฉพาะจุดจำเป็น)* | Scroll storytelling / complex timeline |
| 3D | Three.js + React Three Fiber (+ drei) | Interactive 3D scene, product viewer |
| Data | TypeScript objects / JSON | Mock data layer เตรียมต่อ API |
| Assets | WebP/AVIF, compressed 3D | Performance |

เอกสารต้นฉบับเปิดให้เลือกระหว่าง SCSS กับ Tailwind — **โครงการนี้ล็อคที่ Tailwind v4 + CSS Variables**
อย่าเสนอสลับกลับเป็น SCSS เว้นแต่ผู้ใช้ขอเอง

---

## 6. Deliverables

- Frontend source code: React + TypeScript
- Responsive prototype ครบทุก route ที่กำหนด
- Reusable UI components และ design system
- Mock data layer สำหรับ Services, Products, Reference, Projects, News
- 3D / Interactive components ตาม scope
- Optimized assets
- README / setup instruction สำหรับ run และ build
- โครงสร้างพร้อมต่อ backend/CMS ใน phase ถัดไป

---

## 7. Acceptance Criteria

ใช้เป็น checklist ตอน QA — ทุกข้อต้องผ่านก่อนถือว่าส่งมอบได้

| หัวข้อ | เกณฑ์ |
|---|---|
| **Visual** | ใช้ identity ของ IDIE ชัดเจน ดู modern / professional / industrial และไม่เป็น template ทั่วไป |
| **Navigation** | เข้าถึง Services, Products, Reference, News, Contact ได้ง่าย |
| **Products** | มี product listing, filter structure และ product detail prototype |
| **Reference** | แสดงโลโก้ลูกค้าเป็นระบบและ responsive |
| **3D** | ลื่นบน desktop และมี fallback บน mobile / low-performance device |
| **Responsive** | ใช้งานได้ดีบน desktop, tablet, mobile |
| **Accessibility** | Keyboard, focus, contrast, reduced motion, alt text ผ่านเกณฑ์เบื้องต้น |
| **Performance** | ไม่โหลด asset/3D หนักทั้งหมดพร้อมกัน มี lazy load ตามความเหมาะสม |

---

## 8. นอกขอบเขต Phase หลัก

ถ้าผู้ใช้ขอสิ่งเหล่านี้ ให้บอกว่าอยู่นอก scope ที่ตกลงไว้ 1 บรรทัด แล้วถามว่าจะขยาย scope หรือไม่
(ถ้าผู้ใช้ยืนยัน ก็ทำให้ — แต่ต้องรู้ตัวว่ากำลังขยาย scope)

- Backend API และ Database
- Admin Panel / CMS
- ระบบ Login / User Account
- E-commerce / Shopping Cart / Payment
- ระบบจัดการ Product หรือ News ผ่านหลังบ้าน
- ระบบส่งอีเมล inquiry จริงจาก server *(Frontend form ทำ UI ได้)*
- 3D model เชิงวิศวกรรมซับซ้อนจาก CAD หากไม่มี asset ต้นฉบับ
- การเขียน content และแปลภาษาอย่างเป็นทางการทั้งหมด หากบริษัทไม่ได้ส่งข้อมูลมา

---

## 9. แนวทางต่อยอดในอนาคต

ไม่ต้องทำใน phase นี้ แต่ **การตัดสินใจเชิงสถาปัตยกรรมวันนี้ต้องไม่ปิดทางเหล่านี้**

| หัวข้อ | สิ่งที่ต้องเตรียมไว้ตั้งแต่ตอนนี้ |
|---|---|
| Backend / CMS | Data layer แยกจาก component, มี async-ready accessor |
| Inquiry Workflow | Form schema เป็นกลาง ส่งต่อ email/CRM/ticket ได้ |
| Advanced Product Viewer | Product type มีช่อง `models3d`, `hotspots`, `downloads` ไว้แล้ว |
| Search & SEO | Semantic HTML, meta per route, slug ที่ stable |
| Analytics | Event naming ที่สื่อความหมาย (`product_inquiry_click` ไม่ใช่ `btn3`) |
| Multilingual CMS | ทุกข้อความเป็น `{ th, en }` ตั้งแต่แรก |
