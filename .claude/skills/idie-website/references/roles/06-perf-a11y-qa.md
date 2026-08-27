# บทบาท `QA` — Performance & Accessibility QA

> **ที่มาของบทบาท:** acceptance criteria 8 ข้อคือสิ่งที่ตัดสินว่างานนี้ผ่านหรือไม่ผ่าน
> และ 4 ใน 8 ข้อ (3D fallback, responsive, accessibility, performance) เป็นเรื่องที่
> **มองไม่เห็นจากการดูหน้าจอเฉย ๆ** ต้องมีคนตั้งใจไปหา บทบาทนี้คือคนนั้น

## ขอบเขต

**รับผิดชอบ:** performance budget, การวินิจฉัยปัญหา, a11y audit, responsive audit,
ตรวจ acceptance criteria, ตรวจ placeholder ที่หลุด

**ไม่รับผิดชอบ:** การแก้ — **วินิจฉัยแล้วส่งต่อบทบาทที่เป็นเจ้าของ**
(bundle ใหญ่ → `FE`, 3D อืด → `XP`, contrast ไม่ผ่าน → `DS`, alt หาย → `UI`, placeholder → `DATA`)
บทบาทนี้แก้เองได้เฉพาะของเล็กที่ชัดเจนและไม่กระทบการตัดสินใจของใคร

**ตรวจระหว่างทางด้วย ไม่ใช่แค่ Phase 6** — เรียกใช้เมื่อจบแต่ละ phase

---

## 1. Performance Budget

เอกสารระบุว่า "กำหนด performance budget ก่อนเข้าสู่ production" — นี่คือค่าที่ใช้

| ตัวชี้วัด | เพดาน | วัดที่ |
|---|---|---|
| Initial JS (gzip) | ≤ 200 KB | หน้า Home, ยังไม่นับ 3D chunk |
| Initial CSS (gzip) | ≤ 30 KB | |
| LCP | ≤ 2.5s | Fast 3G + CPU 4× throttle |
| CLS | ≤ 0.1 | ทุกหน้า |
| INP | ≤ 200ms | หน้า Products (มี filter) |
| 3D chunk | แยกออกจาก initial เสมอ | ตรวจใน network tab |
| ภาพ hero | ≤ 250 KB (WebP/AVIF) | |
| Total route chunk | ≤ 150 KB ต่อ route | |

```bash
npm run build
npx vite-bundle-visualizer
```

### วินิจฉัยตามอาการ

| อาการ | สาเหตุที่พบบ่อยในโครงการนี้ | ส่งต่อให้ |
|---|---|---|
| Initial bundle ใหญ่ | `three` หลุดเข้า initial chunk เพราะมี import ที่ไม่ lazy | `FE` + `XP` |
| Scroll กระตุก | animate property ที่ไม่ใช่ transform/opacity หรือ `useFrame` สร้าง object ใหม่ | `XP` |
| CLS สูง | `<img>` ไม่มี dimension / font swap / skeleton ขนาดไม่ตรง | `UI` / `DS` |
| หน้าค้างตอนเข้า | `Canvas` mount ทันทีแทนที่จะรอ IntersectionObserver | `XP` |
| Memory โตเรื่อย ๆ | ไม่ dispose 3D resource ตอน unmount | `XP` |
| Mobile ร้อน/แบตหมด | `frameloop` ไม่ใช่ `demand` หรือ render ตอน tab ไม่ active | `XP` |

---

## 2. Accessibility Checklist

ตรวจด้วยคีย์บอร์ดจริงและ DevTools ไม่ใช่แค่รัน automated tool
(automated tool จับได้ราว 30% ของปัญหาจริง)

### Keyboard
- [ ] Tab ผ่านทั้งหน้าได้ตามลำดับที่สมเหตุสมผล ไม่มี focus หาย
- [ ] Focus ring มองเห็นชัดทั้งบนพื้นขาวและพื้น navy
- [ ] Mobile menu: trap focus, Esc ปิด, คืน focus ให้ปุ่มเดิม
- [ ] Product 3D hotspot เข้าถึงด้วย Tab, เปิดด้วย Enter/Space
- [ ] Carousel/horizontal scroll เลื่อนด้วยคีย์บอร์ดได้
- [ ] Filter/search บนหน้า Products ใช้ได้ด้วยคีย์บอร์ดล้วน
- [ ] Skip-to-content link ที่ต้นหน้า

### Semantic
- [ ] มี `<h1>` เดียวต่อหน้า, heading ไม่ข้ามระดับ (h2 → h4)
- [ ] `<nav>` `<main>` `<footer>` `<article>` ใช้ถูกที่
- [ ] `<html lang>` เปลี่ยนตาม TH/EN switch
- [ ] ปุ่มที่ทำงานคือ `<button>`, ลิงก์ที่ไปที่อื่นคือ `<a>` — ไม่ใช่ `<div onClick>`
- [ ] ARIA ใช้เฉพาะที่จำเป็น — ARIA ที่ใส่ผิดแย่กว่าไม่ใส่

### Content
- [ ] `alt` ของโลโก้ลูกค้า = ชื่อบริษัท ไม่ใช่ `"logo"` หรือ `"client"`
- [ ] ภาพตกแต่งล้วน ใช้ `alt=""` (ไม่ใช่ละไว้)
- [ ] Contrast ผ่าน AA ทุกคู่ — ตรวจ text บน hero overlay และ cyan accent เป็นพิเศษ
- [ ] Form มี `<label>` ผูกกับ input จริง, error message ผูกด้วย `aria-describedby`

### Motion
- [ ] `prefers-reduced-motion: reduce` → ไม่มี canvas mount, ไม่มี parallax, reveal แสดงทันที
- [ ] เนื้อหาไม่ถูกซ่อนถาวรเมื่อ animation ไม่ทำงาน (`opacity: 0` ค้างคืออาการคลาสสิก)
  ทดสอบโดยปิด JS แล้วดูว่ายังอ่านได้ไหม

---

## 3. Responsive Audit

ตรวจทุกหน้าที่ **375 / 768 / 1024 / 1280 / 1536**

- [ ] ไม่มี horizontal scroll ที่ 375px ทุกหน้า
- [ ] Touch target ≥ 44×44px ทุกปุ่ม/ลิงก์บนมือถือ
- [ ] Table (technical specs) มี horizontal scroll ในกล่องตัวเอง ไม่ดัน layout
- [ ] Grayscale บน logo wall หายไปบน touch device
- [ ] Product viewer ไม่ขโมย scroll แนวตั้งบนมือถือ
- [ ] ข้อความไทยยาว ๆ ไม่ล้นกล่อง (คำไทยไม่มีช่องว่าง — ตรวจ `overflow-wrap`)
- [ ] Header ไม่บังเนื้อหาตอน scroll ไปยัง anchor

---

## 4. ตรวจก่อนส่งมอบ

- [ ] `tsc --noEmit` ผ่าน, lint ไม่มี error
- [ ] `grep -rn "_placeholder: true" src/data` → รายการที่เหลือถูกรวมไว้ใน `docs/data-requests.md` แล้ว
- [ ] ไม่มีชื่อบริษัทจริงที่ยังไม่ได้รับอนุญาตอยู่ในโค้ด
- [ ] Contact form มีข้อความ/คอมเมนต์ชัดว่ายังไม่ส่งจริง
- [ ] ไม่มี `console.log` ค้าง
- [ ] `/styleguide` ถูกกันด้วย `import.meta.env.DEV` หรือลบแล้ว
- [ ] README มีวิธี run, build, และอธิบายว่า data layer อยู่ที่ไหน + วิธีต่อ API ในอนาคต
- [ ] เปิดเว็บโดยปิด WebGL แล้วยังใช้งานได้ครบ

---

## 5. รายงานผลตรวจ

รายงานเป็นตารางเสมอ เพื่อให้ผู้ใช้เห็นว่าอะไรบล็อกการส่งมอบจริง ๆ

```
| ข้อ | เกณฑ์ | ผล | หลักฐาน | ส่งต่อ |
|-----|-------|-----|---------|--------|
| A11y-03 | Focus ring บนพื้น navy | ไม่ผ่าน | contrast 1.9:1 ที่ Footer | DS |
```

จัดลำดับด้วยผลกระทบต่อ acceptance criteria — ข้อที่ทำให้ **ส่งงานไม่ผ่าน** ต้องอยู่บนสุด
ส่วนข้อที่เป็นแค่ "ทำได้ดีกว่านี้" แยกไว้ท้ายรายงานและระบุชัดว่าไม่บล็อก
