import type { Datasheet, LocalizedText } from '@/types/content'

/**
 * คลังดาต้าชีตรายรุ่นของสามแบรนด์ที่ IDIE เป็นตัวแทน
 *
 * **รายการเอกสารทั้งหมดอยู่ใน `datasheets.generated.ts` ซึ่งสร้างด้วยสคริปต์**
 * (`python scripts/build-datasheets.py`) จากไฟล์ PDF ที่ผู้ผลิตออกให้โดยตรง
 * ไฟล์นี้เก็บเฉพาะสิ่งที่สคริปต์ตัดสินใจแทนคนไม่ได้ คือ **ชื่อหมวดสองภาษา**
 * และ **ลำดับการแสดงหมวด**
 *
 * ทำไมต้องแยกสองไฟล์ — ชุดเอกสารเปลี่ยนทุกครั้งที่ผู้ผลิตออกเวอร์ชันใหม่ ถ้าเขียน
 * รวมไฟล์เดียว การรันสคริปต์รอบหน้าจะลบคำแปลไทยที่เขียนด้วยมือทิ้งไปด้วย
 *
 * ⚠️ ไฟล์ PDF ทั้งหมดเป็น**สื่อของผู้ผลิต** ที่ IDIE แจกในฐานะตัวแทนจำหน่าย
 *    เก็บต้นฉบับที่ไม่ผ่านการแก้ไข — TODO: confirm with IDIE ขอหนังสือยืนยันสิทธิ์
 *    เผยแพร่ก่อนขึ้น production เหมือนที่ค้างไว้กับ catalog สองเล่มใน `brands.ts`
 */

/**
 * โหลดรายการเอกสารแบบ dynamic import — **ตั้งใจไม่ import ตรง ๆ**
 *
 * รายการ 279 ฉบับกินพื้นที่ราว 17 KB หลังบีบอัด ถ้า import แบบปกติ ก้อนนี้จะไป
 * รวมอยู่ใน bundle แรกที่ทุกคนต้องโหลด ทั้งที่มีแค่หน้า `/brands/:id/datasheets`
 * กับปุ่มนับจำนวนบนหน้าแบรนด์เท่านั้นที่ใช้ — วัดแล้วต่างกันจริงที่ก้อน initial JS
 *
 * เก็บผลไว้ใน `cache` เพราะหน้าแบรนด์เรียกสามครั้ง (แบรนด์ละครั้ง) ติดกัน
 * ถ้าไม่เก็บจะได้ promise คนละตัวสามอัน แม้ bundler จะไม่โหลดไฟล์ซ้ำก็ตาม
 */
let cache: Datasheet[] | null = null

export async function loadDatasheets(): Promise<Datasheet[]> {
  if (!cache) {
    const module = await import('@/data/datasheets.generated')
    cache = module.generatedDatasheets
  }
  return cache
}

/**
 * ชื่อหมวดที่แสดงบนหน้าเว็บ — key คือ slug ที่สคริปต์สร้างจากชื่อโฟลเดอร์ต้นทาง
 * (ของ MEDC สร้างจากคำท้ายชื่อไฟล์ เพราะผู้ผลิตส่งมาแบนไม่มีโฟลเดอร์)
 *
 * คำแปลไทยเป็นร่าง — TODO: confirm with IDIE โดยเฉพาะคำที่แต่ละโรงงานเรียกไม่เหมือนกัน
 */
export const datasheetCategories: Record<string, LocalizedText> = {
  /* Industronic */
  'intron-x': { th: 'ระบบ INTRON-X', en: 'INTRON-X system' },
  'intercom-stations': { th: 'สถานีอินเตอร์คอม', en: 'Intercom stations' },
  'accessories-for-intercom-stations': {
    th: 'อุปกรณ์เสริมสถานีอินเตอร์คอม',
    en: 'Intercom station accessories',
  },
  'speakers-sirens': { th: 'ลำโพงและไซเรน', en: 'Speakers & sirens' },
  'public-address-pa-modules': { th: 'โมดูลระบบประกาศ', en: 'Public address (PA) modules' },
  'flashing-warning-beacons': { th: 'ไฟสัญญาณกะพริบ', en: 'Flashing warning beacons' },
  'system-components': { th: 'ชิ้นส่วนของระบบ', en: 'System components' },
  'system-functions': { th: 'ฟังก์ชันของระบบ', en: 'System functions' },
  'system-software-interfaces': {
    th: 'ซอฟต์แวร์และอินเทอร์เฟซ',
    en: 'System software & interfaces',
  },
  'power-supply-units': { th: 'ชุดจ่ายไฟ', en: 'Power supply units' },
  'radio-devices': { th: 'อุปกรณ์วิทยุสื่อสาร', en: 'Radio devices' },
  cabinets: { th: 'ตู้ติดตั้งอุปกรณ์', en: 'Cabinets' },
  hoods: { th: 'ฝาครอบและกล่องกันสภาพอากาศ', en: 'Hoods' },
  'cabling-guidelines': { th: 'แนวทางการเดินสาย', en: 'Cabling guidelines' },

  /* FHF — สะกดตามชื่อโฟลเดอร์ต้นทางที่ผู้ผลิตส่งมา ("accessoires" สะกดผิดมาแต่เดิม) */
  'telephone-and-accessoires': { th: 'โทรศัพท์และอุปกรณ์เสริม', en: 'Telephones & accessories' },
  'visual-signalling': { th: 'สัญญาณชนิดแสง', en: 'Visual signalling' },
  'hooter-buzzer': { th: 'ฮูตเตอร์และบัซเซอร์', en: 'Hooters & buzzers' },
  sounder: { th: 'อุปกรณ์ส่งเสียงเตือน', en: 'Sounders' },
  'sounder-strobe-combination-unit': {
    th: 'ชุดรวมเสียงและไฟกะพริบ',
    en: 'Sounder-strobe combination units',
  },
  bell: { th: 'กระดิ่งสัญญาณ', en: 'Signalling bells' },
  'motor-siren': { th: 'ไซเรนมอเตอร์', en: 'Motor sirens' },

  /* MEDC */
  beacons: { th: 'ไฟสัญญาณ', en: 'Beacons' },
  sounders: { th: 'อุปกรณ์ส่งเสียงเตือน', en: 'Sounders' },
  loudspeakers: { th: 'ลำโพง', en: 'Loudspeakers' },
  'call-points': { th: 'จุดแจ้งเหตุด้วยมือ', en: 'Manual call points' },
  'combination-units': { th: 'ชุดรวมเสียงและแสง', en: 'Combination units' },
  detectors: { th: 'อุปกรณ์ตรวจจับ', en: 'Detectors' },
  'junction-boxes': { th: 'กล่องพักสาย', en: 'Junction boxes' },

  other: { th: 'อื่น ๆ', en: 'Other' },
}

/**
 * ลำดับหมวดของแต่ละแบรนด์ — เรียงตาม "สิ่งที่คนมาหาก่อน" ไม่ใช่ตามตัวอักษร
 *
 * คนที่เปิดหน้าดาต้าชีตของ Industronic ส่วนใหญ่กำลังหาสถานีอินเตอร์คอมหรือ
 * ตัวระบบ ไม่ได้มาหาฝาครอบ หมวดที่เป็นอุปกรณ์ประกอบจึงอยู่ท้าย
 * หมวดที่ไม่ได้อยู่ในรายการนี้จะไปต่อท้ายโดยเรียงตามตัวอักษร
 */
export const datasheetCategoryOrder: Record<string, string[]> = {
  industronic: [
    'intron-x',
    'intercom-stations',
    'speakers-sirens',
    'public-address-pa-modules',
    'flashing-warning-beacons',
    'system-functions',
    'system-components',
    'system-software-interfaces',
    'accessories-for-intercom-stations',
    'power-supply-units',
    'radio-devices',
    'cabinets',
    'hoods',
    'cabling-guidelines',
  ],
  fhf: [
    'telephone-and-accessoires',
    'visual-signalling',
    'hooter-buzzer',
    'sounder',
    'sounder-strobe-combination-unit',
    'bell',
    'motor-siren',
    'other',
  ],
  medc: [
    'beacons',
    'sounders',
    'loudspeakers',
    'call-points',
    'combination-units',
    'detectors',
    'junction-boxes',
    'other',
  ],
}
