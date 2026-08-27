import type { LocalizedText, ProductArea, ProductCategory } from '@/types/content'

/**
 * Taxonomy จริง สกัดจากสารบัญ catalog ของ FHF และ MEDC ที่ IDIE เผยแพร่บนเว็บเดิม
 *
 * ⚠️ ใช้ได้เฉพาะ "โครงสร้างหมวดหมู่" เท่านั้น
 *    ห้ามคัดลอกสเปก ข้อความ หรือภาพจาก catalog เพราะเป็นลิขสิทธิ์ของผู้ผลิต
 *
 * คำแปลไทยเป็นร่าง — TODO: confirm with IDIE
 */
export const productCategories: ProductCategory[] = [
  {
    slug: 'telephones',
    name: { th: 'โทรศัพท์อุตสาหกรรม', en: 'Industrial Telephones' },
    description: {
      th: 'โทรศัพท์กันสภาพอากาศและกันระเบิด ทั้งระบบอนาล็อกและ VoIP รวมถึงสถานีอินเตอร์คอมและอุปกรณ์เสริม',
      en: 'Weatherproof and explosion-proof telephones in analogue and VoIP, plus intercom stations and accessories.',
    },
    cover: {
      src: '/images/product-categories/telephones.webp',
      alt: { th: 'โทรศัพท์อุตสาหกรรม', en: 'Industrial telephones' },
      width: 1200,
      height: 800,
    },
    featured: true,
    order: 1,
  },
  {
    slug: 'acoustic-signalling',
    name: { th: 'อุปกรณ์สัญญาณเสียง', en: 'Acoustic Signalling Devices' },
    description: {
      th: 'กระดิ่ง แตรลม ฮูตเตอร์ ไซเรนมอเตอร์ อุปกรณ์ส่งเสียงอิเล็กทรอนิกส์ และลำโพง',
      en: 'Signalling bells, pneumatic horns, hooters, motor sirens, electronic sounders and loudspeakers.',
    },
    cover: {
      src: '/images/product-categories/acoustic-signalling.webp',
      alt: { th: 'อุปกรณ์สัญญาณเสียงอุตสาหกรรม', en: 'Industrial acoustic signalling devices' },
      width: 1200,
      height: 800,
    },
    featured: true,
    order: 2,
  },
  {
    slug: 'optical-signalling',
    name: { th: 'อุปกรณ์สัญญาณแสง', en: 'Optical Signalling Devices' },
    description: {
      th: 'ไฟแฟลช ไฟหมุน โคมสัญญาณ ไฟ LED ไฟพลังงานแสงอาทิตย์ ไฟกีดขวาง และเสาไฟสัญญาณ',
      en: 'Strobe lights, rotating beacons, signalling lamps, LED lamps, solar lights, obstruction lights and stack lights.',
    },
    cover: {
      src: '/images/product-categories/optical-signalling.webp',
      alt: { th: 'ไฟสัญญาณเตือนภัยอุตสาหกรรม', en: 'Industrial optical signalling devices' },
      width: 1200,
      height: 800,
    },
    featured: true,
    order: 3,
  },
  {
    slug: 'combination-units',
    name: { th: 'อุปกรณ์สัญญาณเสียงและแสงรวม', en: 'Optical-Acoustic Combination Units' },
    description: {
      th: 'อุปกรณ์ที่รวมเสียงและแสงในตัวเดียว รวมถึงไฟแสดงสถานะและแตรขนาดเล็กพร้อมโคมไฟ',
      en: 'Combined sounder-strobe units, status lights and mini hooters with integrated lamps.',
    },
    cover: {
      src: '/images/product-categories/combination-units.webp',
      alt: { th: 'อุปกรณ์สัญญาณเสียงและแสงรวมในตัวเดียว', en: 'Combined sounder and strobe unit' },
      width: 1200,
      height: 800,
    },
    order: 4,
  },
  {
    slug: 'alarm-call-points',
    name: { th: 'จุดแจ้งเหตุและอุปกรณ์ตรวจจับ', en: 'Manual Alarm Call Points & Detectors' },
    description: {
      th: 'จุดแจ้งเหตุด้วยมือ สวิตช์แจ้งเหตุเพลิงไหม้ โฟโตเซลล์ สวิตช์ลูกตุ้ม และอุปกรณ์ป้องกันไฟกระชาก',
      en: 'Manual call points, fire alarm switches, twilight photocells, pendulum switches and surge arrestors.',
    },
    cover: {
      src: '/images/product-categories/alarm-call-points.webp',
      alt: { th: 'จุดแจ้งเหตุด้วยมือชนิดกันระเบิด', en: 'Explosion-protected manual alarm call point' },
      width: 1200,
      height: 800,
    },
    order: 5,
  },
  {
    slug: 'systems',
    name: { th: 'ระบบและโซลูชัน', en: 'Systems & Solutions' },
    description: {
      th: 'ระบบ PA/GA ระบบอินเตอร์คอม ระบบ CCTV ระบบเครือข่าย และชุดควบคุมเฝ้าระวังส่วนกลาง',
      en: 'PA/GA, intercom, CCTV and network systems, plus central monitoring units.',
    },
    cover: {
      src: '/images/product-categories/systems.webp',
      alt: { th: 'ตู้ควบคุมระบบสื่อสารในห้องควบคุม', en: 'Communication system control cabinet' },
      width: 1200,
      height: 800,
    },
    order: 6,
  },
]

/**
 * แกน filter ที่สำคัญที่สุดของธุรกิจนี้
 *
 * ฝ่ายวิศวกรรม/จัดซื้อในโรงงานปิโตรเคมีถามคำถามนี้ก่อนคำถามอื่นเสมอ ("ใช้ในพื้นที่ไหน")
 * และ catalog ของผู้ผลิตทั้งสองเล่มก็แบ่งสินค้าด้วยแกนนี้เป็นหลัก
 * การมี filter นี้คือสิ่งที่ทำให้หน้า Products ของ IDIE ต่างจาก product listing ทั่วไป
 */
export const productAreas: { slug: ProductArea; name: LocalizedText }[] = [
  {
    slug: 'hazardous-area',
    name: { th: 'พื้นที่อันตราย (Ex — ATEX / IECEx)', en: 'Hazardous Area (Ex — ATEX / IECEx)' },
  },
  {
    slug: 'industrial',
    name: { th: 'พื้นที่อุตสาหกรรมทั่วไป / กันสภาพอากาศ', en: 'Industrial / Weatherproof' },
  },
  {
    slug: 'marine-offshore',
    name: { th: 'งานเรือและนอกชายฝั่ง', en: 'Marine & Offshore' },
  },
]
