# IDIE Website — เซิร์ฟเวอร์หลังบ้าน

API สำหรับ **ข่าวสาร** และ **ผลงาน** พร้อมระบบล็อกอินและอัปโหลดรูป
Node + TypeScript + Express + MySQL · รูปเก็บเป็นไฟล์บนดิสก์ (local path)

เนื้อหาส่วนอื่นของเว็บ (บริษัท บริการ สินค้า แบรนด์ ลูกค้าอ้างอิง) **ไม่ได้อยู่ในฐานข้อมูล** —
ยังเป็นไฟล์ใน `src/data/` เหมือนเดิม เพราะเปลี่ยนแทบไม่ได้และไม่ควรแก้ผ่านหน้าเว็บ
โดยไม่ผ่านการรีวิว

---

## ติดตั้งครั้งแรก

### 1. สร้างฐานข้อมูลและตาราง

```bash
mysql -u root -p < server/schema.sql
```

สร้างฐานข้อมูล `idie_website` พร้อมตาราง `users` · `news` · `projects` ·
`project_scope_items` · `project_images` · `sessions`

แนะนำให้สร้างผู้ใช้ MySQL แยกสำหรับแอป แทนการใช้ root:

```sql
CREATE USER 'idie'@'localhost' IDENTIFIED BY 'ตั้งรหัสผ่านที่นี่';
GRANT SELECT, INSERT, UPDATE, DELETE ON idie_website.* TO 'idie'@'localhost';
```

สิทธิ์แค่สี่ตัวนี้พอ — แอปไม่ต้อง `CREATE TABLE` หรือ `DROP` อะไรเลยตอนรัน
(ตาราง `sessions` ประกาศไว้ใน `schema.sql` แล้ว จึงตั้ง `createDatabaseTable: false`)

### 2. ตั้งค่า

```bash
cp server/.env.example server/.env
```

สร้าง `SESSION_SECRET` แล้วใส่ลงไฟล์:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. ติดตั้ง dependency

```bash
cd server && npm install
```

### 4. สร้างบัญชีแอดมิน

```bash
cd server && npm run create-user
```

**ไม่มีหน้าสมัครสมาชิกบนเว็บโดยตั้งใจ** — หน้าสมัครที่เปิดทิ้งไว้บนอินเทอร์เน็ต
คือช่องให้ใครก็ได้สร้างบัญชีที่แก้เนื้อหาเว็บบริษัทได้ การสร้างบัญชีจึงต้องมีสิทธิ์
เข้าถึงเครื่องเซิร์ฟเวอร์ ทุกบัญชีสิทธิ์เท่ากัน

---

## ใช้งานตอนพัฒนา

เปิดสองหน้าต่าง:

```bash
cd server && npm run dev
```

```bash
npm run dev
```

Vite ที่พอร์ต 5173 จะ proxy `/api` และ `/uploads` มาที่เซิร์ฟเวอร์พอร์ต 3001 ให้เอง
เบราว์เซอร์จึงเห็นทุกอย่างเป็น origin เดียวกัน — **ไม่ต้องตั้ง CORS**
เปิดหลังบ้านที่ <http://localhost:5173/admin>

| คำสั่ง (ในโฟลเดอร์ `server/`) | ทำอะไร |
|---|---|
| `npm run dev` | รันพร้อม auto-reload |
| `npm start` | รันปกติ |
| `npm run typecheck` | ตรวจชนิดข้อมูล |
| `npm run create-user` | สร้างบัญชีแอดมิน |

---

## ขึ้น production

```bash
npm run build
```

```bash
cd server && NODE_ENV=production npm start
```

เมื่อ `NODE_ENV=production` เซิร์ฟเวอร์จะเสิร์ฟ `dist/` เอง — หน้าเว็บ API และรูป
อยู่ origin เดียวกันทั้งหมด ไม่ต้องตั้งค่าเพิ่มในหน้าเว็บ

ถ้าอยู่หลัง nginx/Caddy ที่ทำ https ให้ตั้ง `SESSION_COOKIE_SECURE=true` ด้วย
**ถ้าตั้ง true บน http คุกกี้จะไม่ถูกส่งเลย** อาการที่เห็นคือล็อกอินผ่านแต่เด้งกลับทันที

### สำรองข้อมูล

สองอย่างที่ต้องสำรอง — ขาดอย่างใดอย่างหนึ่งแล้วกู้กลับไม่ครบ:

```bash
mysqldump -u root -p idie_website > backup.sql
```

และโฟลเดอร์ `server/uploads/` ทั้งโฟลเดอร์ (ฐานข้อมูลเก็บแค่ *ที่อยู่* ของรูป ไม่ได้เก็บตัวไฟล์)

---

## endpoint

| method | path | ต้องล็อกอิน | ทำอะไร |
|---|---|---|---|
| `GET` | `/api/health` | – | ตรวจว่าเซิร์ฟเวอร์ตอบอยู่ |
| `POST` | `/api/auth/login` | – | เข้าสู่ระบบ |
| `POST` | `/api/auth/logout` | – | ออกจากระบบ |
| `GET` | `/api/auth/me` | – | ถามว่ายังล็อกอินอยู่ไหม |
| `GET` | `/api/news` · `/api/news/:slug` | – | ข่าวที่**เผยแพร่แล้ว**เท่านั้น |
| `GET` | `/api/projects` · `/api/projects/:slug` | – | ผลงานที่**เผยแพร่แล้ว**เท่านั้น |
| `GET/POST/PUT/DELETE` | `/api/admin/news` | ✔ | จัดการข่าว (เห็นร่างด้วย) |
| `GET/POST/PUT/DELETE` | `/api/admin/projects` | ✔ | จัดการผลงาน |
| `POST` | `/api/admin/uploads` | ✔ | อัปโหลดรูปหนึ่งไฟล์ |

---

## เรื่องที่ตัดสินใจไว้ และเหตุผล

**รหัสผ่านใช้ `crypto.scrypt` ที่มากับ Node ไม่ใช่ bcrypt/argon2** — สองตัวนั้นต้อง
compile native module ซึ่งบนเครื่อง Windows ที่ไม่มี build tools จะติดตั้งไม่ผ่าน
และเป็นปัญหาที่โผล่ตอน deploy scrypt เป็น memory-hard KDF เหมาะกับรหัสผ่านเหมือนกัน

**เซสชันเก็บใน MySQL ไม่ใช่ในหน่วยความจำ** — MemoryStore ของ express-session
รั่วและลืมทุกครั้งที่รีสตาร์ต ในเมื่อมี MySQL อยู่แล้วก็ใช้เลย

**รูปถูกแปลงเป็น WebP สองความละเอียดเสมอ ไม่เก็บไฟล์ต้นฉบับ** — รูปจากมือถือ
มักกว้าง 4000px และหนัก 5–8 MB ซึ่งเกินงบของโครงการ (ภาพใหญ่สุด ≤ 250 KB)
การให้ sharp ถอดรหัสแล้วเข้ารหัสใหม่ยังทำให้สิ่งที่ตกถึงดิสก์เป็นรูปจริงเสมอ
ไม่ใช่ไฟล์อันตรายที่แค่ตั้งชื่อ `.jpg` และตัด EXIF ที่อาจมีพิกัด GPS ของหน้างานทิ้งไปด้วย

**`status` แยกจาก `published_at`** — ตั้งวันประกาศล่วงหน้าไว้ก่อนแล้วค่อยกดเผยแพร่
ทีหลังได้ ถ้าใช้วันที่ตัวเดียวตัดสิน จะแยกไม่ออกว่าอันไหนคือร่างที่ยังไม่เสร็จ
อันไหนคือของที่เขียนเสร็จแล้วรอวัน

**ข้อความ th/en แยกเป็นคนละคอลัมน์ ไม่ใช่ JSON ก้อนเดียว** — บังคับ `NOT NULL`
ได้ทั้งสองภาษาตั้งแต่ระดับฐานข้อมูล ตรงกับที่ IDIE เลือกไว้ว่าต้องกรอกครบทั้งคู่
และคนที่เปิด phpMyAdmin มาแก้ข้อความตรง ๆ ยังอ่านออก
