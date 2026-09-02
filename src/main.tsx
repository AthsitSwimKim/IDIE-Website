import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

/*
  ฟอนต์ self-host — ไม่ใช้ Google Fonts CDN เพื่อลด render-blocking
  และไม่ส่ง IP ผู้ใช้ไปยัง third party (เกี่ยวข้องกับ PDPA)
  ทั้ง Inter และ Kanit เป็น Google Fonts แต่ติดตั้งผ่าน @fontsource แทนการลิงก์ CDN

  **Inter = อังกฤษ · Kanit = ไทย** ลำดับใน `--font-sans` เป็นตัวกำหนด ไม่ใช่ที่นี่
  (ดูคำอธิบายในไฟล์ theme.css) ที่นี่แค่บอกว่าจะโหลดน้ำหนักไหนมาใช้บ้าง

  โหลด 4 น้ำหนักเท่าที่ใช้จริง: 400 ปกติ · 500 font-medium · 600 font-semibold · 700 font-bold
  ไฟล์ .css ของ @fontsource ประกาศทุก subset พร้อม unicode-range เบราว์เซอร์จึง
  ดาวน์โหลดเฉพาะช่วงอักขระที่หน้านั้นใช้จริง — ประกาศครบไม่ได้แปลว่าโหลดครบ
*/
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/kanit/400.css'
import '@fontsource/kanit/500.css'
import '@fontsource/kanit/600.css'
import '@fontsource/kanit/700.css'

import '@/styles/theme.css'
import { LocaleProvider } from '@/components/layout/LocaleProvider'
import { router } from '@/router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocaleProvider>
      <RouterProvider router={router} />
    </LocaleProvider>
  </StrictMode>,
)
