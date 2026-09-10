import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * ฟอนต์ที่ต้อง preload
 *
 * ครอบคลุมทั้ง 4 น้ำหนัก (400 เนื้อความ · 500 เน้น · 600 หัวข้อย่อย · 700 พาดหัว)
 * ของทั้งชุดอักษรไทยและละติน รวม 8 ไฟล์ ~150 KB
 *
 * **preload ทั้งหมดไม่ได้เพิ่มขนาดที่ดาวน์โหลดเลย** — ทั้ง 8 ไฟล์ถูกโหลดอยู่แล้วบนหน้าแรก
 * เพียงแต่เดิมเบราว์เซอร์เพิ่งรู้ว่าต้องโหลดหลังจาก React วาดเนื้อหาเสร็จ (~120–280ms)
 * แล้วค่อยสลับฟอนต์ทีหลัง = หน้ากระโดดหนึ่งครั้ง การ preload แค่ย้ายเวลาโหลดมาไว้ต้นทาง
 *
 * เคยลอง preload เฉพาะ 400/700 แล้ววัดได้ CLS 0.1118 เท่าเดิม เพราะตัวที่ทำให้กระตุก
 * คือน้ำหนัก 500/600 ที่มาถึงตอน ~300ms ไม่ใช่สองน้ำหนักแรก
 *
 * ฟอนต์ที่ตั้ง `font-display: swap` ไม่บล็อกการวาดหน้าจอ การ preload จึงไม่ทำให้ FCP ช้าลง
 * แค่แย่ง bandwidth กับ JS ซึ่งแลกกับการไม่มี layout shift แล้วคุ้มกว่า
 */
const CRITICAL_FONT_PATTERN = /(?:inter-latin|kanit-thai)-(400|500|600|700)-normal/

/**
 * ใส่ `<link rel="preload">` ของฟอนต์หลักลงใน index.html ตอน build
 *
 * **ทำไมต้องมี** — @fontsource ตั้ง `font-display: swap` ให้ทุกไฟล์ แปลว่าเบราว์เซอร์
 * วาดข้อความด้วยฟอนต์ระบบก่อน แล้วค่อยสลับเมื่อฟอนต์จริงมาถึง วัดจริงแล้วบล็อก hero
 * สูงต่างกันถึง 76px ระหว่างสองฟอนต์ ทั้งหน้าจึงกระโดดหนึ่งครั้งตอนสลับ
 * (วัดได้ CLS 0.113 บนแคชเปล่า เกินงบ 0.1 ของโครงการ)
 *
 * ถ้าไม่ preload เบราว์เซอร์จะรู้ว่าต้องโหลดฟอนต์ก็ต่อเมื่ออ่าน CSS จบและคำนวณ layout
 * เจอว่ามีข้อความใช้ฟอนต์นั้น ซึ่งช้ากว่าการรู้ตั้งแต่บรรทัดแรกของ <head> หลาย roundtrip
 *
 * ต้องเป็น plugin เพราะชื่อไฟล์ฟอนต์มี hash ที่รู้ค่าได้ตอน build เท่านั้น
 * เขียน `<link>` ตายตัวใน index.html ไม่ได้
 */
function preloadCriticalFonts(): Plugin {
  let base = '/'
  return {
    name: 'idie:preload-critical-fonts',
    apply: 'build',
    configResolved(config) {
      base = config.base
    },
    transformIndexHtml(_html, ctx) {
      const files = Object.keys(ctx.bundle ?? {}).filter(
        (file) => file.endsWith('.woff2') && CRITICAL_FONT_PATTERN.test(file),
      )

      return files.map((file) => ({
        tag: 'link',
        attrs: {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: base + file,
          // ฟอนต์ถูกดึงแบบ anonymous CORS เสมอ ถ้าไม่ใส่ crossorigin
          // เบราว์เซอร์จะถือว่าเป็นคนละ request แล้วโหลดซ้ำสองรอบ
          crossorigin: '',
        },
        injectTo: 'head-prepend' as const,
      }))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), preloadCriticalFonts()],
  server: {
    // เคารพ PORT ที่ environment กำหนดมา เผื่อพอร์ต 5173 ถูกใช้อยู่แล้ว
    port: Number(process.env.PORT) || 5173,

    /**
     * ส่งต่อ /api และ /uploads ไปยังเซิร์ฟเวอร์ใน server/ ตอน dev
     *
     * **ใช้ proxy แทนการเปิด CORS โดยตั้งใจ** — proxy ทำให้เบราว์เซอร์เห็นทุกอย่าง
     * เป็น origin เดียวกัน คุกกี้เซสชันจึงถูกส่งไปเองโดยไม่ต้องตั้ง
     * `SameSite=None` หรือรายการ origin ที่อนุญาต ซึ่งเป็นสองอย่างที่พลาดแล้ว
     * กลายเป็นช่องโหว่ได้ง่าย และตอน production เซิร์ฟเวอร์ตัวเดียวเสิร์ฟทั้ง
     * หน้าเว็บและ API อยู่แล้ว — dev จึงจำลองสภาพเดียวกันกับของจริง
     *
     * ตั้ง API_PORT ให้ตรงกับ PORT ใน server/.env ถ้าเปลี่ยนจากค่าเริ่มต้น
     */
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${process.env.API_PORT || 3001}`,
        changeOrigin: false,
      },
      '/uploads': {
        target: `http://127.0.0.1:${process.env.API_PORT || 3001}`,
        changeOrigin: false,
      },
    },
  },
  resolve: {
    alias: {
      // ต้องตั้งคู่กับ "paths" ใน tsconfig.app.json — ตั้งที่เดียว TS ผ่านแต่ build พัง
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // แยก three/R3F ออกจาก initial bundle ตั้งแต่วันนี้ เพื่อให้ Phase 5
          // เพิ่ม 3D ได้โดยไม่ทำให้หน้าแรกหนักขึ้น (performance budget: initial JS ≤ 200KB gzip)
          if (id.includes('node_modules/three') || id.includes('@react-three')) {
            return 'three'
          }
          if (id.includes('node_modules/react-router')) return 'router'
        },
      },
    },
  },
})
