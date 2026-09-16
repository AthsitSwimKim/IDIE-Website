# ขึ้น production ด้วย Docker

เว็บทั้งชุดรันเป็น 3 คอนเทนเนอร์บนเซิร์ฟเวอร์เครื่องเดียว:

| คอนเทนเนอร์ | หน้าที่ | เข้าถึงจากภายนอก |
|---|---|---|
| `idie-caddy` | รับ HTTPS ขอใบรับรอง Let's Encrypt ให้เอง ส่งต่อไป API | **80 / 443** (ทางเข้าเดียว) |
| `idie-api` | Express เสิร์ฟหน้าเว็บ (`dist/`) + `/api` + รูปที่อัปโหลด | ไม่ |
| `idie-mysql` | ฐานข้อมูลข่าว ผลงาน อ้างอิงหน้างาน ผู้ใช้ เซสชัน | ไม่ |

ไฟล์ที่เกี่ยวข้อง: [`Dockerfile`](../Dockerfile) (build หน้าเว็บ + API เป็น image เดียว) ·
[`docker-compose.prod.yml`](../docker-compose.prod.yml) · [`Caddyfile`](../Caddyfile)

> `docker-compose.yml` (ไม่มี `.prod`) คือชุด**พัฒนา** — API อย่างเดียว หน้าเว็บรันด้วย `npm run dev`
> อย่าใช้ชุดนั้นบนเซิร์ฟเวอร์ เพราะเปิดพอร์ต MySQL ออกสู่ภายนอกและไม่มีหน้าเว็บ

---

## 1. เตรียมเซิร์ฟเวอร์ (ทำครั้งเดียว)

**สเปกขั้นต่ำ:** Ubuntu 22.04/24.04 · 1 vCPU · 2 GB RAM · 20 GB ดิสก์ (image ~900 MB เพราะมี
ดาต้าชีต 179 MB อยู่ข้างใน + ฐานข้อมูล + รูปอัปโหลด)

```bash
# ติดตั้ง Docker Engine + Compose plugin ตามคู่มือทางการ
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # ออกจาก shell แล้วเข้าใหม่ให้มีผล

# firewall — เปิดแค่ ssh, http, https
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

**DNS** ที่ผู้ให้บริการโดเมน — ทั้งสองชื่อต้องชี้มาที่ IP เซิร์ฟเวอร์ก่อนขั้นตอนที่ 3
ไม่งั้น Caddy ขอใบรับรองไม่ได้:

| ชนิด | ชื่อ | ค่า |
|---|---|---|
| A | `www` | IP ของเซิร์ฟเวอร์ |
| A | `@` (apex) | IP ของเซิร์ฟเวอร์ |

ตรวจว่าชี้แล้ว: `dig +short www.idindustrialengineering.com`

---

## 2. วางโค้ดและตั้งค่า

```bash
git clone https://github.com/AthsitSwimKim/IDIE-Website.git idie
cd idie
cp server/.env.example server/.env
nano server/.env
```

ค่าที่**ต้องตั้ง**ใน `server/.env` (ค่าอื่นปล่อยตามตัวอย่างได้):

| ตัวแปร | ค่า | หมายเหตุ |
|---|---|---|
| `DB_USER` | `idie` | **ห้ามเป็น `root`** — compose สร้างผู้ใช้นี้ให้เองพร้อมสิทธิ์เฉพาะฐาน `idie_website` |
| `DB_PASSWORD` | รหัสยาว ๆ สุ่มใหม่ | ใช้ครั้งเดียวตอนสร้าง volume — เปลี่ยนทีหลังต้องเปลี่ยนใน MySQL ด้วย |
| `DB_NAME` | `idie_website` | ต้องตรงกับ `server/schema.sql` |
| `SESSION_SECRET` | `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` | **ห้ามใช้ค่าเดิมจากเครื่องพัฒนา** |
| `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASSWORD` | ของบัญชีอีเมลที่ใช้ส่ง | Gmail ต้องใช้ App Password ไม่ใช่รหัสบัญชี |
| `MAIL_TO` | อีเมลที่รับคำถามจากฟอร์ม | |
| `MAIL_FROM` | บัญชีเดียวกับ `SMTP_USER` | |

ค่าที่ compose **บังคับทับ** ให้เอง ไม่ต้องแก้ใน `.env`: `NODE_ENV=production`, `PORT=3001`,
`DB_HOST=db`, `DB_PORT=3306`, `SESSION_COOKIE_SECURE=true`

`server/.env` ถูก gitignore ไว้ — ไม่มีวันถูก commit ห้ามคัดลอกไปไว้ที่อื่นในโปรเจกต์

---

## 3. เปิดระบบครั้งแรก

```bash
docker compose -f docker-compose.prod.yml --env-file server/.env up -d --build
```

ครั้งแรกใช้เวลา 3–5 นาที (build หน้าเว็บ + ดึง image) ดูความคืบหน้า:

```bash
docker compose -f docker-compose.prod.yml logs -f
```

สิ่งที่ต้องเห็นใน log:
* `idie-mysql` — `/docker-entrypoint-initdb.d/schema.sql` ถูกรัน แล้ว `ready for connections`
* `idie-api` — `IDIE API พร้อมใช้งานที่ http://localhost:3001`
* `idie-caddy` — `certificate obtained successfully` ทั้งสองชื่อ

ตรวจจากเครื่องอื่น:

```bash
curl -I https://www.idindustrialengineering.com/            # 200 + strict-transport-security
curl -I https://idindustrialengineering.com/                # 301 → www
curl    https://www.idindustrialengineering.com/api/health  # {"ok":true}
curl -I https://www.idindustrialengineering.com/robots.txt  # 200
```

แล้วเปิดเว็บในเบราว์เซอร์ดูหน้าแรก หน้าสินค้า 1 หน้า และดาวน์โหลดดาต้าชีต 1 ฉบับ

---

## 4. สร้างบัญชีแอดมินบัญชีแรก

```bash
docker compose -f docker-compose.prod.yml exec api npm run create-user
```

ตอบ prompt: ชื่อผู้ใช้ · ชื่อแสดง · รหัสผ่าน (≥ 12 ตัว) แล้วล็อกอินที่
`https://www.idindustrialengineering.com/admin/login`

ถ้าล็อกอินผ่านแต่เด้งกลับหน้า login ทันที = คุกกี้ secure ไม่ถูกส่ง → แปลว่าเข้าผ่าน http
ไม่ใช่ https หรือ Caddy ยังไม่ได้ใบรับรอง ดู log ของ `idie-caddy`

---

## 5. อัปเดตเว็บเมื่อมีโค้ดใหม่บน `main`

```bash
cd idie
git pull
docker compose -f docker-compose.prod.yml --env-file server/.env up -d --build
```

* หน้าเว็บ/API ถูก build ใหม่และสลับตัวให้ (ดับ ~10 วินาที)
* ฐานข้อมูล รูปอัปโหลด และใบรับรอง **ไม่ถูกแตะ** — อยู่ใน volume
* ถ้า `server/schema.sql` มีตารางใหม่ ต้องรันส่วนที่เพิ่มด้วยมือ (initdb รันเฉพาะตอน volume ว่าง):
  `docker compose -f docker-compose.prod.yml exec -T db mysql -u idie -p idie_website < server/schema.sql`
  (ทุกตารางประกาศด้วย `IF NOT EXISTS` รันซ้ำจึงปลอดภัย)

ย้อนกลับเวอร์ชันก่อน: `git checkout <commit เดิม>` แล้วรันคำสั่ง `up -d --build` เดิม

---

## 6. สำรองข้อมูล

สองอย่างที่กู้คืนไม่ได้ถ้าหาย: **ฐานข้อมูล** และ **โฟลเดอร์รูปอัปโหลด** (โค้ดอยู่บน GitHub แล้ว)

```bash
# ฐานข้อมูล — ต้องใส่รหัส DB_PASSWORD
docker compose -f docker-compose.prod.yml exec -T db \
  mysqldump -u idie -p idie_website > backup-$(date +%F).sql

# รูปที่อัปโหลด
tar -czf uploads-$(date +%F).tar.gz server/uploads
```

ตั้ง cron ให้ทำทุกคืนแล้วคัดลอกออกนอกเครื่อง (object storage หรือเครื่องอื่น) —
backup ที่อยู่บนดิสก์เดียวกับเซิร์ฟเวอร์ไม่ใช่ backup

กู้คืน:

```bash
docker compose -f docker-compose.prod.yml exec -T db mysql -u idie -p idie_website < backup-YYYY-MM-DD.sql
tar -xzf uploads-YYYY-MM-DD.tar.gz
```

---

## 7. คำสั่งที่ใช้บ่อย

```bash
# สถานะ + healthcheck
docker compose -f docker-compose.prod.yml ps

# log ของตัวใดตัวหนึ่ง
docker compose -f docker-compose.prod.yml logs -f api

# รีสตาร์ต API อย่างเดียว (เช่น หลังแก้ server/.env)
docker compose -f docker-compose.prod.yml --env-file server/.env up -d api

# ปิดทั้งหมด (ข้อมูลใน volume ยังอยู่)
docker compose -f docker-compose.prod.yml down
```

**อย่ารัน `down -v`** — จะลบ volume รวมทั้งฐานข้อมูลและใบรับรองทิ้ง

---

## สิ่งที่ยังไม่ได้ทำในชุดนี้ (ตัดสินใจทีหลังได้)

* **Content-Security-Policy** — helmet ปิด CSP ไว้ เพราะต้องกำหนดรายการ source (Google Maps iframe)
  และทดสอบทุกหน้าก่อน
* **sitemap ของข่าว/ผลงาน** — sitemap ตอนนี้มีเฉพาะหน้าคงที่ บริการ แบรนด์ สินค้า (210 URL)
* **backup อัตโนมัติ** — มีแค่คำสั่ง ยังไม่มี cron ในชุด compose
* **monitoring/แจ้งเตือน** เมื่อ container ล่ม — `restart: always` ปลุกขึ้นเอง แต่ไม่มีใครรู้ว่าเคยล่ม
