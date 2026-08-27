import type { LocalizedText, Product, ProductArea, SpecRow } from '@/types/content'
import { industronicSeeds } from '@/data/products-industronic'

/**
 * สินค้าจริงที่ IDIE จัดจำหน่าย
 *
 * ที่มาของข้อมูล (ผู้ใช้อนุญาตให้ใช้ทั้งสามแหล่ง):
 * - FHF / MEDC — catalog ที่ IDIE เผยแพร่บนเว็บตัวเอง (idindustrial.com)
 * - Industronic — เว็บไซต์ผู้ผลิต industronic.com
 *
 * ⚠️ ขอบเขตที่ใช้: **ชื่อรุ่น หมวดหมู่ ค่าทางเทคนิค และภาพสินค้า**
 *    ส่วนคำบรรยายทั้งหมดในไฟล์นี้เขียนขึ้นใหม่จากค่าทางเทคนิคเหล่านั้น
 *    ไม่ได้คัดลอกข้อความโฆษณาจาก catalog
 *
 * ⚠️ ภาพสินค้าเป็นภาพของผู้ผลิต — เป็นแนวปฏิบัติปกติของตัวแทนจำหน่าย
 *    แต่ควรให้ IDIE ยืนยันสิทธิ์การใช้กับผู้ผลิตอย่างเป็นทางการก่อน production
 *    (บันทึกไว้ใน docs/data-requests.md แล้ว)
 *
 * รุ่นของ Industronic อยู่ในไฟล์ products-industronic.ts ซึ่ง generate ด้วยสคริปต์
 * จากรายการบนเว็บผู้ผลิต — รุ่นที่ไม่มีภาพ UI จะแสดง ImagePlaceholder ให้เอง
 */

export interface Seed {
  slug: string
  model: string
  brandId: 'fhf' | 'medc' | 'industronic'
  category: string
  area: ProductArea[]
  certs?: string[]
  th: string
  en: string
  shortTh: string
  shortEn: string
  specs?: [label: string, value: string][]
  featured?: boolean
  keywords?: string[]
  /** ไม่มีภาพสินค้า — UI จะ fallback ไป placeholder */
  noImage?: boolean
}

/**
 * รูปแบบ seed ของ Industronic — ไม่มี brandId (เป็น industronic เสมอ)
 * และไม่มีคำบรรยาย เพราะสร้างจากชื่อรุ่นกับค่าทางเทคนิคตอน build
 */
export type IndustronicSeed = Omit<Seed, 'brandId' | 'shortTh' | 'shortEn'>

const seeds: Seed[] = [
  /* ---------------------------------------------------------------- FHF */
  {
    slug: 'fhf-resisttel',
    model: 'ResistTel',
    brandId: 'fhf',
    category: 'telephones',
    area: ['industrial', 'marine-offshore'],
    certs: ['IP66'],
    th: 'โทรศัพท์อุตสาหกรรม ResistTel',
    en: 'ResistTel industrial telephone',
    shortTh: 'โทรศัพท์ตัวถัง GRP สำหรับงานกลางแจ้งและสภาพแวดล้อมรุนแรง ปุ่มกดและชิ้นส่วนโลหะเป็นสเตนเลส V4A',
    shortEn: 'GRP-housed telephone for outdoor and harsh conditions, with V4A stainless keypad and metal parts.',
    specs: [
      ['ระดับการป้องกัน|Protection', 'IP66'],
      ['วัสดุตัวถัง|Housing', 'GRP (โพลีเอสเตอร์เสริมใยแก้ว)|GRP (glassfibre reinforced polyester)'],
      ['อุณหภูมิใช้งาน|Temperature range', '-25 °C … +60 °C'],
      ['ขนาด (ก×ส×ล)|Dimensions (W×H×D)', '227 × 293 × 135 mm'],
      ['คุณสมบัติ|Features', 'จอแสดงผล · สมุดโทรศัพท์ · สนทนาไม่ยกหู · สายหูฟังหุ้มเกลียวเหล็ก|Display · phonebook · handsfree · steel-armoured handset cord'],
    ],
    featured: true,
    keywords: ['resisttel', 'grp', 'weatherproof telephone', 'โทรศัพท์กันน้ำ'],
  },
  {
    slug: 'fhf-ferntel-3',
    model: 'FernTel 3',
    brandId: 'fhf',
    category: 'telephones',
    area: ['industrial'],
    certs: ['IP65'],
    th: 'โทรศัพท์อนาล็อก FernTel 3',
    en: 'FernTel 3 analogue telephone',
    shortTh: 'โทรศัพท์อนาล็อกตัวถังโพลีคาร์บอเนต ติดผนังหรือตั้งโต๊ะ เสียงเรียกดังราว 95 dB(A)',
    shortEn: 'Polycarbonate analogue telephone for wall or desk mounting, with a call tone of about 95 dB(A).',
    specs: [
      ['ระดับการป้องกัน|Protection', 'IP65'],
      ['วัสดุตัวถัง|Housing', 'โพลีคาร์บอเนต|Polycarbonate'],
      ['อุณหภูมิใช้งาน|Temperature range', '-25 °C … +60 °C'],
      ['ขนาด (ก×ส×ล)|Dimensions (W×H×D)', '190 × 293 × 128 mm'],
      ['เสียงเรียก|Call tone', 'ประมาณ 95 dB(A)|approx. 95 dB(A)'],
    ],
    featured: true,
    keywords: ['ferntel', 'analogue telephone', 'โทรศัพท์อนาล็อก'],
  },
  {
    slug: 'fhf-indutel-ip',
    model: 'InduTel IP',
    brandId: 'fhf',
    category: 'telephones',
    area: ['industrial'],
    certs: ['IP66'],
    th: 'โทรศัพท์ VoIP InduTel IP',
    en: 'InduTel IP VoIP telephone',
    shortTh: 'โทรศัพท์ VoIP สำหรับงานอุตสาหกรรม มีฝาครอบใสให้เลือก เหมาะกับจุดที่ต้องกันฝุ่นและน้ำ',
    shortEn: 'Industrial VoIP telephone, available with a clear protective cover for dust- and water-exposed positions.',
    specs: [
      ['ระดับการป้องกัน|Protection', 'IP66'],
      ['ระบบสัญญาณ|Signalling', 'VoIP (SIP)'],
    ],
    keywords: ['indutel', 'voip', 'sip'],
  },
  {
    slug: 'fhf-resisttel-ip2',
    model: 'ResistTel IP2',
    brandId: 'fhf',
    category: 'telephones',
    area: ['industrial', 'marine-offshore'],
    certs: ['IP65', 'IP66'],
    th: 'โทรศัพท์ VoIP ResistTel IP2',
    en: 'ResistTel IP2 VoIP telephone',
    shortTh: 'รุ่น VoIP ของ ResistTel รองรับการสนทนาไม่ยกหู เหมาะกับพื้นที่เสียงดังที่ต้องต่อระบบ IP',
    shortEn: 'The VoIP version of ResistTel with handsfree operation, for high-noise areas served by an IP network.',
    specs: [
      ['ระดับการป้องกัน|Protection', 'IP65 / IP66'],
      ['ระบบสัญญาณ|Signalling', 'VoIP (SIP)'],
      ['วัสดุตัวถัง|Housing', 'GRP'],
    ],
    keywords: ['resisttel ip2', 'voip'],
  },
  {
    slug: 'fhf-exresisttel',
    model: 'ExResistTel',
    brandId: 'fhf',
    category: 'telephones',
    area: ['hazardous-area', 'marine-offshore'],
    certs: ['ATEX', 'IECEx', 'IP66'],
    th: 'โทรศัพท์กันระเบิด ExResistTel',
    en: 'ExResistTel explosion-proof telephone',
    shortTh: 'โทรศัพท์อนาล็อกสำหรับพื้นที่อันตราย ผ่านมาตรฐาน ATEX และ IECEx ตัวถังทนสภาพแวดล้อมรุนแรง',
    shortEn: 'Analogue telephone for classified areas, certified to ATEX and IECEx, in a housing rated for harsh conditions.',
    specs: [
      ['ระดับการป้องกัน|Protection', 'IP66'],
      ['มาตรฐานพื้นที่อันตราย|Hazardous area', 'ATEX · IECEx'],
      ['วัสดุตัวถัง|Housing', 'GRP'],
    ],
    featured: true,
    keywords: ['exresisttel', 'atex', 'iecex', 'explosion proof telephone', 'โทรศัพท์กันระเบิด'],
  },
  {
    slug: 'fhf-exresisttel-ip2',
    model: 'ExResistTel IP2',
    brandId: 'fhf',
    category: 'telephones',
    area: ['hazardous-area', 'marine-offshore'],
    certs: ['ATEX', 'IECEx', 'IP66'],
    th: 'โทรศัพท์ VoIP กันระเบิด ExResistTel IP2',
    en: 'ExResistTel IP2 explosion-proof VoIP telephone',
    shortTh: 'รุ่น VoIP สำหรับพื้นที่อันตราย รองรับจ่ายไฟผ่านสาย LAN (PoE) หรือแหล่งจ่ายภายนอก',
    shortEn: 'VoIP model for classified areas, powered over the LAN (PoE) or from an external supply.',
    specs: [
      ['ระดับการป้องกัน|Protection', 'IP66'],
      ['มาตรฐานพื้นที่อันตราย|Hazardous area', 'ATEX · IECEx'],
      ['การจ่ายไฟ|Power', 'PoE หรือแหล่งจ่ายภายนอก|PoE or external supply'],
    ],
    featured: true,
    keywords: ['exresisttel ip2', 'poe', 'voip', 'atex'],
  },
  {
    slug: 'fhf-ferntel-ip',
    model: 'FernTel IP',
    brandId: 'fhf',
    category: 'telephones',
    area: ['hazardous-area', 'industrial'],
    certs: ['Zone 2', 'IP65'],
    th: 'โทรศัพท์ VoIP FernTel IP',
    en: 'FernTel IP VoIP telephone',
    shortTh: 'โทรศัพท์ VoIP สำหรับพื้นที่ Zone 2 ตัวถังโพลีคาร์บอเนต ติดตั้งง่ายในงานปรับปรุงระบบเดิม',
    shortEn: 'VoIP telephone for Zone 2 areas in a polycarbonate housing, straightforward to fit in system upgrades.',
    specs: [
      ['ระดับการป้องกัน|Protection', 'IP65'],
      ['พื้นที่อันตราย|Hazardous area', 'Zone 2'],
      ['ระบบสัญญาณ|Signalling', 'VoIP (SIP)'],
    ],
    keywords: ['ferntel ip', 'zone 2', 'voip'],
  },
  {
    slug: 'fhf-intellycom',
    model: 'IntellyCom',
    brandId: 'fhf',
    category: 'systems',
    area: ['industrial'],
    certs: ['IP66'],
    th: 'สถานีอินเตอร์คอม IntellyCom',
    en: 'IntellyCom intercom station',
    shortTh: 'สถานีอินเตอร์คอมแบบฝังแผง ใช้งานได้ตั้งแต่ -40 °C เหมาะกับห้องควบคุมและจุดปฏิบัติงานกลางแจ้ง',
    shortEn: 'Panel-mount intercom station rated from -40 °C, for control rooms and outdoor operator positions.',
    specs: [
      ['ระดับการป้องกัน|Protection', 'IP66'],
      ['อุณหภูมิใช้งาน|Temperature range', '-40 °C … +60 °C'],
    ],
    keywords: ['intellycom', 'intercom station', 'อินเตอร์คอม'],
  },
  {
    slug: 'fhf-dgw-21',
    model: 'dGW 21',
    brandId: 'fhf',
    category: 'acoustic-signalling',
    area: ['hazardous-area'],
    certs: ['ATEX', 'IECEx', 'IP66'],
    th: 'กระดิ่งสัญญาณกันระเบิด dGW 21',
    en: 'dGW 21 explosion-proof signalling bell',
    shortTh: 'กระดิ่งสัญญาณสำหรับพื้นที่อันตราย ให้เสียงต่อเนื่องที่แยกออกจากเสียงรบกวนในโรงงานได้ดี',
    shortEn: 'Signalling bell for classified areas, producing a continuous tone that cuts through plant noise.',
    specs: [
      ['ระดับการป้องกัน|Protection', 'IP66'],
      ['มาตรฐานพื้นที่อันตราย|Hazardous area', 'ATEX · IECEx'],
    ],
    keywords: ['dgw 21', 'bell', 'กระดิ่ง'],
  },
  {
    slug: 'fhf-hpo',
    model: 'HPO',
    brandId: 'fhf',
    category: 'acoustic-signalling',
    area: ['industrial'],
    th: 'ฮูตเตอร์เสียงดัง HPO',
    en: 'HPO high-volume hooter',
    shortTh: 'อุปกรณ์ส่งเสียงกำลังสูงสำหรับพื้นที่กลางแจ้งและพื้นที่กว้าง',
    shortEn: 'High-output sounder for outdoor and wide-area coverage.',
    keywords: ['hpo', 'hooter', 'ฮูตเตอร์'],
  },
  {
    slug: 'fhf-dgh-21',
    model: 'dGH 21',
    brandId: 'fhf',
    category: 'acoustic-signalling',
    area: ['hazardous-area'],
    certs: ['ATEX', 'IECEx', 'IP66'],
    th: 'ฮูตเตอร์กันระเบิด dGH 21',
    en: 'dGH 21 explosion-proof hooter',
    shortTh: 'ฮูตเตอร์สำหรับพื้นที่อันตราย ใช้งานได้ในช่วงอุณหภูมิกว้างตั้งแต่ -55 °C ถึง +70 °C',
    shortEn: 'Hooter for classified areas with a wide operating range of -55 °C to +70 °C.',
    specs: [
      ['ระดับการป้องกัน|Protection', 'IP66'],
      ['มาตรฐานพื้นที่อันตราย|Hazardous area', 'ATEX · IECEx'],
      ['อุณหภูมิใช้งาน|Temperature range', '-55 °C … +70 °C'],
    ],
    featured: true,
    keywords: ['dgh 21', 'hooter', 'atex'],
  },
  {
    slug: 'fhf-motor-siren',
    model: 'Motor Siren',
    brandId: 'fhf',
    category: 'acoustic-signalling',
    area: ['industrial'],
    th: 'ไซเรนมอเตอร์',
    en: 'Motor-driven siren',
    shortTh: 'ไซเรนขับด้วยมอเตอร์ สำหรับแจ้งเตือนครอบคลุมพื้นที่กว้างระดับทั้งโรงงาน',
    shortEn: 'Motor-driven siren for plant-wide, wide-area warning.',
    keywords: ['motor siren', 'ไซเรน'],
  },
  {
    slug: 'fhf-dev-21',
    model: 'dEV 21',
    brandId: 'fhf',
    category: 'acoustic-signalling',
    area: ['hazardous-area'],
    certs: ['ATEX', 'IECEx', 'IP66'],
    th: 'อุปกรณ์ส่งเสียงกันระเบิด dEV 21',
    en: 'dEV 21 explosion-proof sounder',
    shortTh: 'อุปกรณ์ส่งเสียงอิเล็กทรอนิกส์สำหรับพื้นที่อันตราย เลือกรูปแบบเสียงได้หลายแบบ',
    shortEn: 'Electronic sounder for classified areas with a choice of alarm tones.',
    specs: [
      ['ระดับการป้องกัน|Protection', 'IP66'],
      ['มาตรฐานพื้นที่อันตราย|Hazardous area', 'ATEX · IECEx'],
      ['อุณหภูมิใช้งาน|Temperature range', '-50 °C … +60 °C'],
    ],
    keywords: ['dev 21', 'sounder', 'atex'],
  },
  {
    slug: 'fhf-ex-starline',
    model: 'Ex-Starline',
    brandId: 'fhf',
    category: 'acoustic-signalling',
    area: ['hazardous-area', 'marine-offshore'],
    certs: ['ATEX', 'IECEx', 'IP66'],
    th: 'ลำโพงกันระเบิด Ex-Starline',
    en: 'Ex-Starline explosion-proof loudspeaker',
    shortTh: 'ลำโพงฮอร์นสำหรับพื้นที่อันตราย ใช้กับระบบประกาศและแจ้งเตือนในโรงงานปิโตรเคมี',
    shortEn: 'Horn loudspeaker for classified areas, used in plant public address and alarm systems.',
    specs: [
      ['ระดับการป้องกัน|Protection', 'IP66'],
      ['มาตรฐานพื้นที่อันตราย|Hazardous area', 'ATEX · IECEx'],
      ['อุณหภูมิใช้งาน|Temperature range', '-55 °C … +80 °C'],
    ],
    featured: true,
    keywords: ['ex-starline', 'loudspeaker', 'ลำโพงกันระเบิด', 'paga'],
  },
  {
    slug: 'fhf-ble-led',
    model: 'BLE LED',
    brandId: 'fhf',
    category: 'optical-signalling',
    area: ['industrial'],
    certs: ['IP65', 'IP66', 'IP67'],
    th: 'ไฟสัญญาณ LED BLE LED',
    en: 'BLE LED signal light',
    shortTh: 'ไฟสัญญาณ LED กินไฟต่ำและอายุการใช้งานยาว ใช้แทนไฟแฟลชหลอดซีนอนแบบเดิม',
    shortEn: 'Low-consumption, long-life LED signal light replacing traditional xenon strobes.',
    specs: [
      ['ระดับการป้องกัน|Protection', 'IP65 / IP66 / IP67'],
      ['อุณหภูมิใช้งาน|Temperature range', '-30 °C … +50 °C'],
    ],
    keywords: ['ble led', 'beacon', 'ไฟสัญญาณ'],
  },

  /* --------------------------------------------------------------- MEDC */
  {
    slug: 'medc-bg2',
    model: 'BG2',
    brandId: 'medc',
    category: 'alarm-call-points',
    area: ['hazardous-area', 'marine-offshore'],
    certs: ['ATEX', 'IECEx', 'IP66', 'IP67'],
    th: 'จุดแจ้งเหตุด้วยมือ BG2',
    en: 'BG2 manual alarm call point',
    shortTh: 'จุดแจ้งเหตุแบบกดกระจกสำหรับพื้นที่อันตราย ตัวถังทนการกัดกร่อนสำหรับงานกลางแจ้งและนอกชายฝั่ง',
    shortEn: 'Break-glass manual call point for classified areas, in a corrosion-resistant housing for outdoor and offshore use.',
    specs: [
      ['ระดับการป้องกัน|Protection', 'IP66 / IP67'],
      ['มาตรฐานพื้นที่อันตราย|Hazardous area', 'ATEX · IECEx'],
    ],
    featured: true,
    keywords: ['bg2', 'call point', 'break glass', 'จุดแจ้งเหตุ'],
  },
  {
    slug: 'medc-bg3',
    model: 'BG3',
    brandId: 'medc',
    category: 'alarm-call-points',
    area: ['hazardous-area'],
    certs: ['ATEX', 'IECEx', 'IP66', 'IP67'],
    th: 'จุดแจ้งเหตุด้วยมือ BG3',
    en: 'BG3 manual alarm call point',
    shortTh: 'จุดแจ้งเหตุแบบปุ่มกดสำหรับพื้นที่อันตราย เลือกรูปแบบการทำงานและป้ายกำกับได้ตามการใช้งาน',
    shortEn: 'Push-button manual call point for classified areas, with selectable actions and labelling.',
    specs: [
      ['ระดับการป้องกัน|Protection', 'IP66 / IP67'],
      ['มาตรฐานพื้นที่อันตราย|Hazardous area', 'ATEX · IECEx'],
    ],
    keywords: ['bg3', 'call point', 'push button'],
  },
  {
    slug: 'medc-xb15',
    model: 'XB15',
    brandId: 'medc',
    category: 'optical-signalling',
    area: ['hazardous-area', 'marine-offshore'],
    certs: ['ATEX', 'IECEx', 'IP66', 'IP67'],
    th: 'ไฟสัญญาณกันระเบิด XB15',
    en: 'XB15 explosion-proof beacon',
    shortTh: 'ไฟสัญญาณสำหรับพื้นที่อันตราย มีให้เลือกหลายสีเลนส์เพื่อแยกความหมายของสัญญาณ',
    shortEn: 'Beacon for classified areas, available in several lens colours to separate alarm meanings.',
    specs: [
      ['ระดับการป้องกัน|Protection', 'IP66 / IP67'],
      ['มาตรฐานพื้นที่อันตราย|Hazardous area', 'ATEX · IECEx'],
    ],
    featured: true,
    keywords: ['xb15', 'beacon', 'ไฟสัญญาณกันระเบิด'],
  },
  {
    slug: 'medc-fl4',
    model: 'FL4',
    brandId: 'medc',
    category: 'optical-signalling',
    area: ['hazardous-area'],
    certs: ['ATEX', 'IECEx', 'IP66', 'IP67'],
    th: 'ไฟแฟลชกันระเบิด FL4',
    en: 'FL4 explosion-proof flashing beacon',
    shortTh: 'ไฟแฟลชสำหรับพื้นที่อันตราย ใช้เป็นสัญญาณเตือนด้วยแสงคู่กับสัญญาณเสียง',
    shortEn: 'Flashing beacon for classified areas, used as the visual half of an audible-visual alarm.',
    specs: [
      ['ระดับการป้องกัน|Protection', 'IP66 / IP67'],
      ['มาตรฐานพื้นที่อันตราย|Hazardous area', 'ATEX · IECEx'],
    ],
    keywords: ['fl4', 'flashing beacon', 'ไฟแฟลช'],
  },
  {
    slug: 'medc-db3b',
    model: 'DB3B',
    brandId: 'medc',
    category: 'acoustic-signalling',
    area: ['hazardous-area', 'marine-offshore'],
    certs: ['ATEX', 'IECEx', 'IP66', 'IP67'],
    th: 'อุปกรณ์ส่งเสียงกันระเบิด DB3B',
    en: 'DB3B explosion-proof sounder',
    shortTh: 'อุปกรณ์ส่งเสียงสำหรับพื้นที่อันตราย เลือกโทนเสียงได้หลายแบบเพื่อแยกประเภทเหตุการณ์',
    shortEn: 'Sounder for classified areas with multiple selectable tones to distinguish event types.',
    specs: [
      ['ระดับการป้องกัน|Protection', 'IP66 / IP67'],
      ['มาตรฐานพื้นที่อันตราย|Hazardous area', 'ATEX · IECEx'],
    ],
    featured: true,
    keywords: ['db3b', 'sounder', 'alarm horn'],
  },
  {
    slug: 'medc-db12',
    model: 'DB12',
    brandId: 'medc',
    category: 'acoustic-signalling',
    area: ['industrial'],
    certs: ['IP66', 'IP67'],
    th: 'อุปกรณ์ส่งเสียงอุตสาหกรรม DB12',
    en: 'DB12 industrial sounder',
    shortTh: 'อุปกรณ์ส่งเสียงสำหรับพื้นที่อุตสาหกรรมทั่วไปที่ไม่ได้จำแนกเป็นพื้นที่อันตราย',
    shortEn: 'Sounder for general industrial areas outside hazardous-area classification.',
    specs: [['ระดับการป้องกัน|Protection', 'IP66 / IP67']],
    keywords: ['db12', 'industrial sounder'],
  },
  {
    slug: 'medc-db14',
    model: 'DB14',
    brandId: 'medc',
    category: 'acoustic-signalling',
    area: ['industrial'],
    certs: ['IP66', 'IP67'],
    th: 'ลำโพง DB14',
    en: 'DB14 loudspeaker',
    shortTh: 'ลำโพงสำหรับระบบประกาศในพื้นที่ปลอดภัย ติดตั้งฝังฝ้าหรือติดผนัง',
    shortEn: 'Public address loudspeaker for safe areas, for ceiling or wall mounting.',
    specs: [['ระดับการป้องกัน|Protection', 'IP66 / IP67']],
    keywords: ['db14', 'loudspeaker', 'ลำโพง'],
  },
  {
    slug: 'medc-db4b',
    model: 'DB4B',
    brandId: 'medc',
    category: 'acoustic-signalling',
    area: ['hazardous-area', 'marine-offshore'],
    certs: ['ATEX', 'IECEx', 'IP66', 'IP67'],
    th: 'ลำโพงกันระเบิด DB4B',
    en: 'DB4B explosion-proof loudspeaker',
    shortTh: 'ลำโพงฮอร์นสำหรับพื้นที่อันตราย ใช้ในระบบ PA/GA ของโรงงานและงานนอกชายฝั่ง',
    shortEn: 'Horn loudspeaker for classified areas, used in plant and offshore PA/GA systems.',
    specs: [
      ['ระดับการป้องกัน|Protection', 'IP66 / IP67'],
      ['มาตรฐานพื้นที่อันตราย|Hazardous area', 'ATEX · IECEx'],
    ],
    keywords: ['db4b', 'loudspeaker', 'paga', 'ลำโพงกันระเบิด'],
  },

]

/** แยกข้อความรูปแบบ 'ไทย|English' ออกเป็น LocalizedText — ถ้าไม่มี | ใช้ค่าเดียวกันทั้งสองภาษา */
function bi(value: string): LocalizedText {
  const [th, en] = value.split('|')
  return { th, en: en ?? th }
}

function toSpecs(rows: Seed['specs']): SpecRow[] {
  return (rows ?? []).map(([label, value]) => ({ label: bi(label), value: bi(value) }))
}

/**
 * สร้างคำบรรยายสั้นของสินค้า Industronic จากชื่อรุ่นและค่าทางเทคนิคที่สกัดได้
 *
 * ทำแบบนี้แทนการคัดลอกข้อความ marketing จากเว็บผู้ผลิต — ได้ประโยคที่เป็นข้อเท็จจริง
 * ล้วน ๆ ซึ่งเป็นสิ่งที่ฝ่ายวิศวกรรมอยากเห็นบนการ์ดสินค้าอยู่แล้ว
 */
function describeIndustronic(seed: IndustronicSeed): { th: string; en: string } {
  const facts = (seed.specs ?? [])
    .filter(([label]) => /Protection|Hazardous zone|Temperature|Housing|Power$/.test(label))
    .map(([, value]) => bi(value))

  const suffixTh = facts.length ? ` — ${facts.map((f) => f.th).join(' · ')}` : ''
  const suffixEn = facts.length ? ` — ${facts.map((f) => f.en).join(' · ')}` : ''
  return { th: `${seed.th} ${seed.model}${suffixTh}`, en: `${seed.en} ${seed.model}${suffixEn}` }
}

const allSeeds: Seed[] = [
  ...seeds,
  ...industronicSeeds.map((seed) => {
    const described = describeIndustronic(seed)
    return {
      ...seed,
      brandId: 'industronic' as const,
      shortTh: described.th,
      shortEn: described.en,
    }
  }),
]

export const products: Product[] = allSeeds.map((seed) => ({
  slug: seed.slug,
  name: { th: seed.th, en: seed.en },
  model: seed.model,
  brandId: seed.brandId,
  categorySlug: seed.category,
  area: seed.area,
  certifications: seed.certs,
  shortDescription: { th: seed.shortTh, en: seed.shortEn },
  overview: { th: seed.shortTh, en: seed.shortEn },
  features: [],
  applications: [],
  specs: toSpecs(seed.specs),
  gallery: seed.noImage
    ? []
    : [
        {
          src: `/images/products/${seed.slug}.webp`,
          srcSet: `/images/products/${seed.slug}-280.webp 1x, /images/products/${seed.slug}.webp 2x`,
          alt: { th: `${seed.th} (${seed.model})`, en: `${seed.en} (${seed.model})` },
          width: 560,
          height: 560,
        },
      ],
  featured: seed.featured,
  searchKeywords: [seed.model, ...(seed.keywords ?? [])],
}))
