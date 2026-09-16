# image สำหรับ production — ตัวเดียวมีทั้งหน้าเว็บ (dist/) และ API
#
# **ต่างจาก server/Dockerfile** ซึ่งเป็นชุดพัฒนาที่มีแค่ API (หน้าเว็บรันด้วย Vite แยก)
# ตอน production เซิร์ฟเวอร์ Express เสิร์ฟ dist/ เองจาก `/dist` (ดู server/src/env.ts →
# webDist = SERVER_ROOT/../dist โดย SERVER_ROOT คือ /app) หน้าเว็บ API และรูปจึงอยู่
# origin เดียวกัน ไม่ต้องมี CORS และคุกกี้เซสชันใช้ SameSite=Lax ได้ตามที่ออกแบบไว้
#
# ใช้ผ่าน docker-compose.prod.yml เท่านั้น:
#   docker compose -f docker-compose.prod.yml --env-file server/.env up -d --build

# ---------------------------------------------------------------------------
# ขั้นที่ 1: build หน้าเว็บ (ต้องการ devDependencies: vite, typescript)
# ---------------------------------------------------------------------------
FROM node:22-bookworm-slim AS web

WORKDIR /web

COPY package.json package-lock.json ./
RUN npm ci

# .dockerignore ตัด node_modules, dist, docs, server/uploads, .env ออกแล้ว
COPY . .

# prebuild สร้าง public/sitemap.xml จากข้อมูลจริงก่อน แล้ว tsc -b && vite build
RUN npm run build

# ---------------------------------------------------------------------------
# ขั้นที่ 2: image ที่รันจริง — ใช้ Debian ไม่ใช่ Alpine เพราะ sharp มี binary
# สำเร็จรูปสำหรับ glibc เท่านั้น (เหตุผลเดียวกับ server/Dockerfile)
# ---------------------------------------------------------------------------
FROM node:22-bookworm-slim

WORKDIR /app

COPY server/package.json server/package-lock.json ./
# --omit=dev ตัด typescript กับ @types ออก — เซิร์ฟเวอร์รัน TypeScript ตรง ๆ ด้วย tsx
RUN npm ci --omit=dev

COPY server/ ./

# หน้าเว็บที่ build แล้วจากขั้นที่ 1 — ตำแหน่งต้องเป็น /dist ตาม env.webDist
COPY --from=web /web/dist /dist

# โฟลเดอร์รูปที่อัปโหลด — compose ผูก volume ทับ ไฟล์จึงอยู่รอดข้าม rebuild
RUN mkdir -p uploads

ENV NODE_ENV=production
EXPOSE 3001
CMD ["npm", "start"]
