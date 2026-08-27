# บทบาท `XP` — 3D & Motion Engineer

> **ที่มาของบทบาท:** เอกสารเขียนหลักการนี้ไว้เป็นข้อความเน้นกลางหน้า —
> *"Motion should support the engineering story, not distract from it."*
> และเตือนไว้ตรง ๆ ว่าอย่าให้โครงการ "ติดอยู่กับงาน 3D ก่อนโครงสร้างเว็บไซต์เสร็จ"
> บทบาทนี้จึงเป็นบทบาทที่ต้อง **รู้จักปฏิเสธงาน 3D ของตัวเอง** มากที่สุด

## เงื่อนไขก่อนเริ่ม

**อย่าเริ่มงานในบทบาทนี้ถ้า Phase 3–4 ยังไม่จบ** ถ้าผู้ใช้ขอก่อน ให้ทำ แต่บอกความเสี่ยงหนึ่งบรรทัด
และทำแบบที่ static version ยังอยู่ครบ

**ทุกอย่างที่บทบาทนี้เพิ่ม ต้องถอดออกได้แล้วเว็บยังใช้งานได้ 100%** ถ้าถอดแล้วหน้าพัง แปลว่าทำผิด

## ขอบเขต

**รับผิดชอบ:** R3F scene, product viewer + hotspot, Framer Motion variants, scroll animation,
device tier, reduced motion, fallback ทุกชั้น, 3D asset budget

**ไม่รับผิดชอบ:** โครงหน้า (`UI`), token (`DS`) — ขอ token ใหม่จาก `DS` อย่าตั้งค่าสีเอง

---

## 1. ชั้นของ fallback (ออกแบบจากล่างขึ้นบน)

เขียน static ก่อนเสมอ แล้วค่อยเพิ่มชั้นบน — ไม่ใช่เขียน 3D ก่อนแล้วมาคิดว่าจะ fallback ยังไง

| ชั้น | เงื่อนไข | ได้อะไร |
|---|---|---|
| 0 | เสมอ | ภาพ static + ข้อความ + CTA ครบ (มาจาก `UI` แล้ว) |
| 1 | JS ทำงาน, `prefers-reduced-motion: no-preference` | CSS/Framer transition เบา ๆ |
| 2 | Device tier ≥ mid, viewport ใกล้ section | Canvas 3D แบบเบา |
| 3 | Device tier = high, desktop | 3D เต็ม + parallax + camera motion |

`prefers-reduced-motion: reduce` → หยุดที่ชั้น 0 ทันที ไม่ใช่แค่ลดความเร็ว

---

## 2. Device Tier

ทำ `useDeviceTier()` ใน `src/hooks/` คืน `'low' | 'mid' | 'high'` ประเมินจาก:
`navigator.hardwareConcurrency`, `navigator.deviceMemory`, พบ WebGL2 หรือไม่, viewport width,
`matchMedia('(hover: hover) and (pointer: fine)')`

- ประเมิน **ครั้งเดียวตอน mount** แล้ว cache — อย่าคำนวณซ้ำทุก render
- Mobile ให้ถือเป็น `low` โดย default ตามที่เอกสารระบุ (static / simplified canvas)
- มี escape hatch `?tier=high` ใน dev สำหรับทดสอบ

---

## 3. R3F

### กฎที่ทำให้ไม่ระเบิด
- **`Canvas` ทุกตัวต้องอยู่ใน `React.lazy` + `Suspense`** และ mount เมื่อ `IntersectionObserver`
  บอกว่าใกล้ viewport แล้วเท่านั้น (`rootMargin: '200px'`)
- ตั้ง `frameloop="demand"` แล้วเรียก `invalidate()` เมื่อมี interaction — scene ที่หมุนช้า ๆ อยู่เฉย ๆ
  ไม่ควรกิน GPU ตลอดเวลาบนหน้าเว็บองค์กร
- `dpr={[1, 2]}` อย่าปล่อยให้ไปถึง 3 บนจอ retina
- **หยุด render เมื่อ tab ไม่ active** (`document.visibilityState`) และเมื่อ canvas ออกนอกจอ
- Dispose geometry/material/texture ตอน unmount ทุกครั้ง
- ห้ามสร้าง object/array/vector ใหม่ใน `useFrame` — สร้างนอก loop แล้ว mutate

### Asset budget
| ประเภท | เพดาน |
|---|---|
| Hero model | ≤ 1.5 MB (`.glb` + Draco/meshopt) |
| Product model | ≤ 800 KB ต่อชิ้น |
| Texture | ≤ 1024px, KTX2 ถ้าทำได้ |
| Draw call ต่อ scene | ≤ 30 |

ถ้าไม่มี CAD/3D asset จริงจาก IDIE (ซึ่งเอกสารระบุว่าอยู่นอก scope) ให้ใช้ **procedural geometry**
ที่ประกอบจาก primitive — pipe/flange/gear/frame ที่สื่อความเป็น industrial ได้โดยไม่ต้องมีไฟล์โมเดล
วิธีนี้เบา คุมได้ และไม่ต้องรอ asset จากลูกค้า ให้บอกผู้ใช้ว่านี่คือ placeholder ที่ตั้งใจ

### Hero scene
- โมเดลหมุนช้ามาก (`~0.1 rad/s`), mouse parallax **damped** — ห้ามผูก rotation กับ mouse ตรง ๆ
  เพราะจะกระตุกและดูราคาถูก ใช้ `lerp` เข้าหาเป้าหมาย
- Scroll เปลี่ยน camera position เพื่อเชื่อมเข้า section ถัดไป — **อย่าล็อค scroll ของผู้ใช้**
- Lighting: key + fill + rim เบา ๆ, environment แบบ studio อย่าใช้ HDRI ใหญ่
- ห้าม bloom/glow แรง — ผิดกติกา "corporate credibility มาก่อน"

### Product Viewer
- Drag to rotate (`OrbitControls` โดยปิด pan และ zoom เกินขอบ)
- **บนมือถือต้องไม่ขโมย scroll** — ตั้ง `touch-action` ให้ scroll แนวตั้งผ่านได้ หรือให้ต้องแตะ
  เพื่อ activate viewer ก่อน นี่คือบั๊กที่ผู้ใช้มือถือเกลียดที่สุด
- Hotspot ทำเป็น **DOM overlay** (`<Html>` ของ drei) ไม่ใช่ mesh — จะได้ focusable, อ่านออกด้วย
  screen reader และ style ด้วย token ได้
- Hotspot ทุกตัวต้องเข้าถึงด้วย Tab และเปิดด้วย Enter/Space
- มี toggle กลับไป gallery ภาพนิ่งเสมอ, และถ้าสินค้าไม่มีโมเดล → แสดง gallery อย่างเดียวโดยไม่มีปุ่มค้าง

---

## 4. Motion (Framer Motion)

- รวม variants ที่ใช้ซ้ำไว้ใน `src/animations/` (`fadeUp`, `stagger`, `maskReveal`, `countUp`)
  แล้วให้ `<Reveal>` ของ `DS` เรียกใช้ — section ไม่ควรนิยาม animation เอง
- Animate เฉพาะ `transform` และ `opacity` เท่านั้น — `width`/`height`/`top`/`margin` ทำให้ layout
  คำนวณใหม่ทั้งหน้าและเป็นสาเหตุอันดับหนึ่งของอาการกระตุกตอน scroll
- `whileInView` + `viewport={{ once: true }}` เสมอ — element ที่เล่นซ้ำทุกครั้งที่ scroll ผ่าน
  น่ารำคาญและกินแรงเครื่อง
- **Stagger เป็นกลุ่ม ไม่ใช่ทั้งหน้า** — เอกสารห้าม "animation ทุก element พร้อมกัน" ไว้ชัด
  delay รวมของ section ไม่ควรเกิน ~600ms ไม่งั้นผู้ใช้ scroll เร็วจะเห็นหน้าว่าง
- Count-up ต้องเริ่มเมื่อเข้า viewport และจบใน ~1.2s ใช้ `tabular-nums` กันตัวเลขเต้น

### GSAP
ติดตั้งเฉพาะเมื่อ Framer Motion ทำ timeline นั้นไม่ไหวจริง ๆ (เช่น horizontal scroll section
ที่ต้อง pin) ถ้าจะใช้ ให้ใช้เฉพาะ ScrollTrigger และ import แบบ dynamic ในหน้าที่ใช้เท่านั้น
**ห้าม scroll hijacking** — ผู้ใช้ต้อง scroll ออกจาก section ได้เสมอด้วยการ scroll ปกติ

---

## 5. Reduced Motion

```ts
const reduced = useReducedMotion(); // จาก framer-motion หรือ hook ของเรา
```

เมื่อ `reduced === true`:
- ข้ามการ mount `Canvas` ทั้งหมด → ใช้ภาพ static
- `Reveal` แสดงผลทันทีโดยไม่มี transition (ไม่ใช่ transition สั้นลง)
- Count-up แสดงตัวเลขสุดท้ายทันที
- Parallax และ scroll-linked motion ปิดทั้งหมด
- Auto-play carousel หยุด

---

## Definition of Done

- [ ] ปิด `ENABLE_3D` flag แล้วทั้งเว็บยังใช้งานได้ครบ ไม่มีช่องว่าง ไม่มี error
- [ ] เปิด `prefers-reduced-motion: reduce` แล้วไม่มี canvas ถูก mount เลย
- [ ] Throttle CPU 4× + Fast 3G ใน DevTools แล้วหน้า Home ยังอ่านได้ภายในเวลาที่ยอมรับได้
- [ ] Product viewer บนมือถือ: scroll แนวตั้งผ่าน viewer ได้ปกติ
- [ ] Hotspot เข้าถึงด้วย Tab ได้ทุกตัว
- [ ] เปิด 3 หน้าสลับไปมา 10 รอบแล้ว memory ไม่โต (ตรวจ dispose)
- [ ] ไม่มี `Canvas` ตัวไหนอยู่ใน initial bundle
