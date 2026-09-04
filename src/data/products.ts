import type { LocalizedText, Product } from '@/types/content'

/**
 * รายการสินค้า — สร้างจากเอกสารข้อมูลสินค้าของผู้ผลิตด้วย `scripts/build-products.py`
 *
 * **สินค้าหนึ่งรายการคือเอกสารหนึ่งฉบับ** ทั้งชื่อ รหัสรุ่น หมวด และภาพ มาจากไฟล์ PDF
 * ของผู้ผลิตโดยตรง ไม่มีข้อความที่เราแต่งเอง — ค่าทางเทคนิคของอุปกรณ์พื้นที่อันตราย
 * เป็นสิ่งที่ผู้ซื้อย้อนกลับไปเทียบกับเอกสารต้นทางได้ การเขียนคำโปรยเพิ่มจึงเป็นความเสี่ยง
 *
 * **หมวดใช้ชุดเดียวกับหน้าคลังเอกสาร** (`datasheetCategories` ใน `datasheets.ts`)
 * ไม่ได้ทำรายการหมวดของตัวเองขึ้นมาใหม่ — ถ้ามีสองชุด วันหนึ่งจะเพี้ยนจากกัน
 * แล้วสินค้าตัวเดียวกันจะอยู่คนละหมวดในสองหน้า
 *
 * โหลดแบบ dynamic import ด้วยเหตุผลเดียวกับ `datasheets.ts` — ก้อนข้อมูลใหญ่
 * และมีแค่หน้าสินค้ากับหน้ารายละเอียดที่ใช้ ไม่ควรติดไปกับ bundle แรกของทุกคน
 */
let cache: Product[] | null = null

export async function loadProducts(): Promise<Product[]> {
  if (!cache) {
    // สองแหล่ง: Industronic มาจากเว็บผู้ผลิต ส่วน FHF/MEDC มาจากไฟล์ดาต้าชีต
    // (ดูเหตุผลใน scripts/scrape-industronic.py) โหลดพร้อมกันเพราะไม่ขึ้นต่อกัน
    const [fromDatasheets, fromIndustronic] = await Promise.all([
      import('@/data/products.generated'),
      import('@/data/products-industronic.generated'),
    ])
    cache = [...fromIndustronic.industronicProducts, ...fromDatasheets.generatedProducts]
  }
  return cache
}

/**
 * สัญลักษณ์คุณสมบัติจากเว็บ Industronic → ข้อความที่ผู้อ่านเข้าใจ
 *
 * เว็บผู้ผลิตใช้ไอคอนเล็ก ๆ ที่ชื่อไฟล์เป็นภาษาเยอรมันบ้างอังกฤษบ้าง
 * ("aussen" = กลางแจ้ง · "ex-bereich" = พื้นที่อันตราย) เก็บเป็นข้อความสองภาษา
 * แทนการเอาไอคอนของเขามาแสดง เพราะไอคอนที่ไม่มีคำกำกับอ่านไม่ออกอยู่ดี
 *
 * ค่าที่ไม่รู้จักจะไม่ถูกแสดง ไม่ใช่แสดงรหัสดิบ — ถ้าผู้ผลิตเพิ่มไอคอนใหม่
 * หน้าเว็บจะเงียบไว้จนกว่าจะมีคนมาเติมคำแปล ดีกว่าโชว์คำที่ผู้อ่านไม่เข้าใจ
 */
export const PRODUCT_ATTRIBUTES: Record<string, LocalizedText> = {
  ipwolke: { th: 'ทำงานบนเครือข่าย IP', en: 'IP network' },
  innen: { th: 'ใช้ในอาคาร', en: 'Indoor' },
  aussen: { th: 'ใช้กลางแจ้ง', en: 'Outdoor' },
  'ex-bereich': { th: 'พื้นที่อันตราย (Ex)', en: 'Hazardous area (Ex)' },
  iecex: { th: 'IECEx', en: 'IECEx' },
  en5416: { th: 'EN 54-16', en: 'EN 54-16' },
  ip40: { th: 'IP40', en: 'IP40' },
  ip41: { th: 'IP41', en: 'IP41' },
  ip42: { th: 'IP42', en: 'IP42' },
  ip54: { th: 'IP54', en: 'IP54' },
  ip65: { th: 'IP65', en: 'IP65' },
  ip66: { th: 'IP66', en: 'IP66' },
  ip67: { th: 'IP67', en: 'IP67' },
}
