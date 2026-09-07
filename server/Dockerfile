# เซิร์ฟเวอร์ API ของเว็บ IDIE
#
# **ใช้ image ฐาน Debian ไม่ใช่ Alpine** — sharp ที่ใช้ย่อรูปที่อัปโหลดมี binary
# สำเร็จรูปสำหรับ glibc เท่านั้น ถ้าใช้ Alpine (musl) จะต้องคอมไพล์ libvips เอง
# ทำให้ image ใหญ่ขึ้นและ build นานขึ้นหลายนาทีโดยไม่ได้อะไรกลับมา
FROM node:22-bookworm-slim

WORKDIR /app

# ติดตั้ง dependency แยกชั้นจากซอร์ส เพื่อให้แก้โค้ดแล้วไม่ต้องติดตั้งใหม่ทุกครั้ง
COPY package.json package-lock.json ./
# --omit=dev ตัด typescript กับ @types ออก เซิร์ฟเวอร์รัน TypeScript ตรง ๆ ด้วย tsx
# ซึ่งอยู่ใน dependencies อยู่แล้ว (ดูเหตุผลใน package.json)
RUN npm ci --omit=dev

COPY . .

# โฟลเดอร์เก็บรูปที่อัปโหลด — compose ผูก volume ทับตรงนี้ ไฟล์จึงอยู่รอดข้ามการ rebuild
RUN mkdir -p uploads

EXPOSE 3001
CMD ["npm", "start"]
