import type { Brand, DownloadItem, LocalizedText } from '@/types/content'

/**
 * แบรนด์คู่ค้าจริง 3 ราย — มีหน้าเฉพาะของตัวเองบนเว็บเดิมของ IDIE
 *
 * ✅ ใช้ไฟล์ต้นฉบับที่ลูกค้าส่งมา เก็บไว้ที่ assets-src/brand-logos/
 *    ทั้งสามเป็นโลโก้สีบนพื้นขาว จึงทำพื้นโปร่งและใช้ block เดียวกับ
 *    logo wall ในหน้า Reference ได้ทั้งหมด
 *
 * (ชุดเดิมที่ดึงจากเว็บ IDIE มีสองปัญหาที่ชุดใหม่แก้ไปแล้ว: Industronic เป็น
 *  ตัวอักษรขาวบนพื้นน้ำเงินซึ่งทำพื้นโปร่งไม่ได้ และ FHF เป็นเวอร์ชัน
 *  "Bergbautechnik" สายเหมืองแร่ ซึ่งแคบกว่าขอบเขตที่ IDIE ทำจริง)
 */

/** ผืนผ้าใบเดียวกับโลโก้ลูกค้าในหน้า Reference — กล่องแสดงผลเป็น aspect-3/2 เหมือนกัน */
const LOGO_SIZE = { width: 480, height: 320 } as const

function logo(id: string, alt: LocalizedText) {
  return {
    src: `/images/brands/${id}.webp`,
    srcSet: `/images/brands/${id}-240.webp 1x, /images/brands/${id}.webp 2x`,
    alt,
    ...LOGO_SIZE,
  }
}

export const brands: Brand[] = [
  {
    id: 'industronic',
    name: 'Industronic',
    logo: logo('industronic', { th: 'โลโก้ Industronic', en: 'Industronic' }),
    country: 'Germany',
    /*
      เคยไม่ตั้ง `website` ไว้ เพราะตอนนั้นปุ่มออกนอกเว็บของ Industronic ชี้ไป
      หน้าดาวน์โหลดเอกสารอยู่แล้ว การมีสองปุ่มไปเว็บเดียวกันคนละหน้าทำให้ต้องเลือก
      โดยไม่รู้ว่าต่างกันตรงไหน — ตอนนี้ลิงก์ดาวน์โหลดย้ายเข้าไปอยู่ในหน้า
      เอกสารข้อมูลสินค้าแล้ว (ดู `brandDownloadCentre`) ปุ่มบนหน้าแบรนด์จึงว่าง
      ให้ลิงก์หน้าแรกของผู้ผลิตได้ตามที่ IDIE ขอ (ก.ย. 2026)
    */
    website: 'https://www.industronic.com/',
    /*
      ตราวงกลมของ Industronic ที่ IDIE ส่งมา (ก.ย. 2026) ใช้ท้ายปุ่มเว็บไซต์ผู้ผลิต
      ต้นฉบับเป็น JPEG พื้นขาว จึงทำพื้นนอกวงกลมให้โปร่งก่อน (ดู assets-src/README.md)

      ไฟล์เดียวไม่มีคู่ 1x/2x — แสดงจริงแค่ 16px ไฟล์ 96px จึงคมพอถึงจอ 4x
      และยังเล็กกว่า 4 KB การทำสองไฟล์ให้ภาพขนาดนี้เพิ่มงานโดยไม่ได้อะไรกลับมา
    */
    siteIcon: {
      src: '/images/brands/industronic-icon.webp',
      alt: { th: 'ตราสัญลักษณ์ Industronic', en: 'Industronic emblem' },
      width: 96,
      height: 96,
    },
  },
  {
    id: 'fhf',
    name: 'FHF — Funke + Huster · Fernsig',
    logo: logo('fhf', { th: 'โลโก้ FHF Funke + Huster Fernsig', en: 'FHF Funke + Huster Fernsig' }),
    country: 'Germany',
  },
  {
    id: 'medc',
    name: 'MEDC',
    logo: logo('medc', { th: 'โลโก้ MEDC', en: 'MEDC' }),
    country: 'United Kingdom',
  },
]

/**
 * คำอธิบายสั้น ๆ ต่อแบรนด์ สำหรับ section คู่ค้าบนหน้า Home
 * อ้างอิงจากสิ่งที่แบรนด์ทำจริงและสิ่งที่ IDIE จัดจำหน่าย — TODO: ให้ IDIE ตรวจ
 */
export const brandBlurbs: Record<string, LocalizedText> = {
  industronic: {
    th: 'ระบบอินเตอร์คอมและระบบประกาศอุตสาหกรรมสำหรับพื้นที่ที่ต้องการความชัดของเสียงเป็นพิเศษ',
    en: 'Industrial intercom and public address systems for environments where intelligibility is critical.',
  },
  fhf: {
    th: 'โทรศัพท์อุตสาหกรรมและอุปกรณ์ส่งสัญญาณ ผู้ผลิตจากเยอรมนีที่อยู่ในวงการมาตั้งแต่ปี 1897',
    en: 'Industrial telephones and signalling devices from a German manufacturer established in 1897.',
  },
  medc: {
    th: 'อุปกรณ์สัญญาณเสียงและแสงสำหรับพื้นที่อันตราย พร้อมมาตรฐาน ATEX และ IECEx',
    en: 'Acoustic and optical signalling devices for hazardous areas, certified to ATEX and IECEx.',
  },
}

/**
 * ประเภทสินค้าที่แต่ละแบรนด์ครอบคลุม — อ้างอิงจากสารบัญ catalog ของผู้ผลิตเอง
 * ใช้บอกลูกค้าบนหน้า Brands ว่าแบรนด์ไหนมีอะไร
 *
 * เก็บเป็น**ข้อความตรง ๆ ไม่ใช่ slug ที่ชี้ไปหมวดสินค้า** — เดิมชี้ไป
 * `product-categories.ts` เพื่อทำลิงก์ไปหน้าสินค้าด้วย พอ IDIE สั่งถอดหน้าสินค้าออก
 * (ก.ย. 2026) ปลายทางนั้นไม่มีแล้ว เหลือแต่ตัวข้อความที่ยังมีประโยชน์อยู่
 * ถ้อยคำยกมาจากชื่อหมวดเดิมทั้งหมด ไม่ได้เขียนใหม่
 */
export const brandSupplies: Record<string, LocalizedText[]> = {
  industronic: [
    { th: 'สถานีอินเตอร์คอม', en: 'Intercom Stations' },
    { th: 'ระบบและโซลูชัน', en: 'Systems & Solutions' },
  ],
  fhf: [
    { th: 'โทรศัพท์อุตสาหกรรม', en: 'Industrial Telephones' },
    { th: 'อุปกรณ์สัญญาณเสียง', en: 'Acoustic Signalling Devices' },
    { th: 'อุปกรณ์สัญญาณแสง', en: 'Optical Signalling Devices' },
    { th: 'อุปกรณ์สัญญาณเสียงและแสงรวม', en: 'Optical-Acoustic Combination Units' },
    { th: 'จุดแจ้งเหตุและอุปกรณ์ตรวจจับ', en: 'Manual Alarm Call Points & Detectors' },
  ],
  medc: [
    { th: 'อุปกรณ์สัญญาณเสียง', en: 'Acoustic Signalling Devices' },
    { th: 'อุปกรณ์สัญญาณแสง', en: 'Optical Signalling Devices' },
    { th: 'อุปกรณ์สัญญาณเสียงและแสงรวม', en: 'Optical-Acoustic Combination Units' },
    { th: 'จุดแจ้งเหตุและอุปกรณ์ตรวจจับ', en: 'Manual Alarm Call Points & Detectors' },
  ],
}

/**
 * เอกสารของผู้ผลิตที่ IDIE ส่งมาให้เผยแพร่ต่อ
 *
 * เก็บไฟล์**ต้นฉบับที่ไม่ผ่านการแก้ไข** ไว้ที่ `public/documents/` โดยตั้งใจ —
 * เอกสารพวกนี้เป็นสื่อของผู้ผลิตที่ IDIE แจกในฐานะตัวแทนจำหน่าย การบีบอัดหรือ
 * ตัดหน้าใหม่ทำให้สิ่งที่ลูกค้าได้รับไม่ตรงกับที่ผู้ผลิตออกให้
 *
 * ผลที่ตามมาคือไฟล์ใหญ่ทั้งคู่ (FHF 13 MB / MEDC 13.5 MB) ถ้าอยากได้เล็กลง
 * ต้องขอเวอร์ชันสำหรับเว็บจากผู้ผลิต ไม่ใช่บีบเอง
 * IDIE ตัดสินใจ (ส.ค. 2026) ว่าไม่ต้องขึ้นขนาดไฟล์และที่มาบนหน้าเว็บ —
 * `sizeKb` จึงเก็บไว้เป็นบันทึกของไฟล์ ยังไม่มี UI ตัวไหนแสดง
 *
 * TODO: confirm with IDIE — ขอหนังสือยืนยันสิทธิ์เผยแพร่สื่อจากผู้ผลิตก่อนขึ้น production
 *
 * **ของ Industronic เป็นลิงก์ออกไปเว็บผู้ผลิต ไม่ใช่ไฟล์ที่เราโฮสต์เอง** — `url` จึงเป็น
 * URL เต็มแทน path ใน `public/` ปุ่มบนหน้าเว็บใช้ตัวเดียวกันได้เพราะเป็น `<a href>`
 * อยู่แล้ว และการชี้ไปหน้าของผู้ผลิตแปลว่าผู้อ่านได้ฉบับล่าสุดเสมอ ไม่ต้องรอเราอัปเดต
 * ทั้งยังไม่มีคำถามเรื่องสิทธิ์เผยแพร่ เพราะเราไม่ได้แจกไฟล์ของใคร
 */
export const brandDocuments: Record<string, DownloadItem[]> = {
  fhf: [
    {
      /**
       * ชื่อตามหน้าปกและ metadata ของไฟล์เอง ไม่ได้ตั้งใหม่
       * ที่มา: Eaton (Crouse-Hinds series) · ปี 2022 · 11 หน้า · ภาษาอังกฤษ
       */
      label: {
        th: 'ภาพรวมสายผลิตภัณฑ์ FHF — โทรศัพท์และอุปกรณ์เสริม',
        en: 'FHF Product Line Overview — Phones and Accessories',
      },
      url: '/documents/fhf-product-line-overview-2022.pdf',
      type: 'catalog',
      sizeKb: 13281,
    },
  ],
  medc: [
    {
      /**
       * ชื่อตามหน้าปกของไฟล์เอง (ไฟล์นี้ไม่มี /Title ใน metadata)
       * ที่มา: Eaton (Crouse-Hinds series) · ปี 2016 · 92 หน้า · ภาษาอังกฤษ
       *
       * **เอกสารเล่มนี้ครอบทั้ง MEDC และ FHF** — หน้าปกเขียนว่า "the comprehensive
       * MEDC and FHF signalling, alarm and notification range" และหน้าสุดท้ายมีตรา
       * ทั้งสองแบรนด์ วางไว้ใต้ MEDC เพราะเป็นเล่มที่ใกล้เคียง catalog ของ MEDC ที่สุด
       * และ MEDC ขึ้นก่อนบนปก ไม่ได้ใส่ซ้ำใต้ FHF เพราะ FHF มีเล่มของตัวเองอยู่แล้ว
       * และปุ่มสองอันที่เขียนเหมือนกันบนแบรนด์เดียวจะแยกไม่ออกว่าอันไหนคืออะไร
       *
       * การมีเอกสารนี้**ไม่ใช่การอ้างสถานะตัวแทน MEDC** — IDIE แจ้งแล้วว่าไม่มีหนังสือ
       * แต่งตั้งจาก MEDC เล่มนี้เป็นสื่อสินค้าที่จัดจำหน่าย ไม่ใช่หนังสือแต่งตั้ง
       */
      label: {
        th: 'ภาพรวมสินค้า — อุปกรณ์สัญญาณและระบบแจ้งเหตุ',
        en: 'Signalling and alarms — Product overview',
      },
      url: '/documents/medc-signalling-product-overview-2016.pdf',
      type: 'catalog',
      sizeKb: 13810,
    },
  ],
}

/**
 * ศูนย์ดาวน์โหลดเอกสารของผู้ผลิต — ลิงก์ออกนอกเว็บ ไม่ใช่ไฟล์ที่เราโฮสต์เอง
 *
 * เดิม Industronic ใช้ลิงก์นี้เป็นปุ่ม "ดาต้าชีต" บนหน้าแบรนด์ เพราะยังไม่มีไฟล์ราย
 * รุ่นให้เปิดดู ตอนนี้เว็บมีคลังดาต้าชีตของตัวเองแล้ว (`/brands/:id/datasheets`)
 * ลิงก์นี้จึงย้ายไปอยู่ **ในหน้าคลังนั้น** แทน — คนที่อยากได้ฉบับล่าสุดที่สุด
 * หรือเอกสารที่เราไม่ได้โฮสต์ไว้ ยังไปต่อที่ต้นทางได้ในที่ที่กำลังหาเอกสารอยู่พอดี
 *
 * มีเฉพาะแบรนด์ที่เปิดศูนย์ดาวน์โหลดสาธารณะ — FHF กับ MEDC อยู่ใต้เว็บ Eaton
 * ซึ่งต้องล็อกอินก่อนถึงจะโหลดได้ จึงไม่ใส่ลิงก์ที่พาผู้อ่านไปเจอหน้าล็อกอิน
 */
export const brandDownloadCentre: Record<string, string> = {
  industronic: 'https://www.industronic.com/support/downloads',
}

/**
 * ข้อความจุดยืนเรื่องแหล่งสินค้า — มาจากประโยคบนเว็บเดิมโดยตรง
 * "We supplies only good quality product from Europe or USA, Our partner are as below."
 */
export const sourcingStatement: LocalizedText = {
  th: 'เราจัดจำหน่ายเฉพาะสินค้าคุณภาพจากผู้ผลิตในยุโรปและสหรัฐอเมริกาเท่านั้น',
  en: 'We supply only quality products from European and US manufacturers.',
}

/**
 * แบรนด์/สายผลิตภัณฑ์อื่นที่ปรากฏใน meta keywords ของเว็บเดิม
 * ยังไม่ยืนยันว่าเป็น partner ทางการ — อย่านำขึ้นแสดงบนเว็บจนกว่า IDIE จะยืนยัน
 * TODO: confirm with IDIE
 *
 * **'Crouse-Hinds' ตอบแล้วจาก catalog ที่ IDIE ส่งมา (ส.ค. 2026)** — ไม่ใช่ partner
 * รายที่สี่ แต่เป็นชื่อ series ของ Eaton ที่สาย FHF สังกัดอยู่ ("The FHF product line
 * is part of the Eaton Crouse-Hinds series") จึงไม่ต้องเพิ่มเป็นแบรนด์แยก
 * และ **ห้ามอ้างว่า IDIE เป็นตัวแทน Crouse-Hinds** เพราะหนังสือแต่งตั้งที่มีคือของ FHF
 */
export const unconfirmedBrandMentions = [
  'Gai-Tronics',
  'Federal Signal',
  'Neumann',
  'Crouse-Hinds',
  'Ferntel',
  'ResistTel / ExResistTel',
] as const
