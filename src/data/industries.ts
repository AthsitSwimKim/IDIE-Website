import type { Industry } from '@/types/content'

/**
 * 6 อุตสาหกรรมแรก = รายการที่ IDIE ระบุเองบนเว็บบริษัท ("The field of services covers to
 * chemical, petrochemical, oil and gas, fertilizer, power plant and mining")
 *
 * 'epc' และ 'manufacturing' เพิ่มเข้ามาเพื่อจัดหมวดลูกค้าจริงบางรายในหน้า Reference
 * (CTCI, TTCL/Toyo-Thai, Uhde เป็น EPC contractor ไม่ใช่เจ้าของโรงงาน)
 *
 * คำแปลไทยทั้งหมดเป็นร่าง — TODO: confirm with IDIE
 */
export const industries: Industry[] = [
  {
    slug: 'petrochemical',
    name: { th: 'ปิโตรเคมี', en: 'Petrochemical' },
    description: {
      th: 'โรงงานปิโตรเคมีที่มีพื้นที่เสี่ยงต่อการระเบิดและต้องการระบบแจ้งเตือนที่เชื่อถือได้ตลอดเวลา',
      en: 'Petrochemical plants with classified areas that depend on always-available alarm and communication systems.',
    },
    icon: 'flask',
    order: 1,
  },
  {
    slug: 'oil-gas',
    name: { th: 'น้ำมันและก๊าซ', en: 'Oil & Gas' },
    description: {
      th: 'โรงกลั่น คลังน้ำมัน และงานนอกชายฝั่ง ที่ต้องใช้อุปกรณ์ทนสภาพแวดล้อมรุนแรง',
      en: 'Refineries, terminals and offshore facilities requiring equipment rated for harsh environments.',
    },
    icon: 'droplet',
    order: 2,
  },
  {
    slug: 'chemical',
    name: { th: 'เคมีภัณฑ์', en: 'Chemical' },
    description: {
      th: 'โรงงานเคมีที่ต้องการระบบประกาศและสัญญาณเตือนภัยครอบคลุมทั้งพื้นที่ผลิต',
      en: 'Chemical plants needing plant-wide public address and warning alarm coverage.',
    },
    icon: 'beaker',
    order: 3,
  },
  {
    slug: 'power-plant',
    name: { th: 'โรงไฟฟ้า', en: 'Power Plant' },
    description: {
      th: 'โรงไฟฟ้าที่มีเสียงรบกวนสูง ต้องการระบบสื่อสารที่ได้ยินชัดในทุกพื้นที่',
      en: 'Power generation sites with high ambient noise, where intelligibility is critical.',
    },
    icon: 'zap',
    order: 4,
  },
  {
    slug: 'fertilizer',
    name: { th: 'ปุ๋ยเคมี', en: 'Fertilizer' },
    description: {
      th: 'โรงงานปุ๋ยที่มีฝุ่นและสารเคมีกัดกร่อน ต้องใช้อุปกรณ์ระดับป้องกันสูง',
      en: 'Fertilizer plants with dust and corrosive media, requiring high-protection enclosures.',
    },
    icon: 'layers',
    order: 5,
  },
  {
    slug: 'mining',
    name: { th: 'เหมืองแร่', en: 'Mining' },
    description: {
      th: 'งานเหมืองที่ต้องการระบบสื่อสารครอบคลุมพื้นที่กว้างและทนต่อการใช้งานหนัก',
      en: 'Mining operations needing wide-area, ruggedised communication systems.',
    },
    icon: 'mountain',
    order: 6,
  },
  {
    slug: 'epc',
    name: { th: 'ผู้รับเหมา EPC', en: 'EPC Contractors' },
    description: {
      th: 'ผู้รับเหมาออกแบบและก่อสร้างโรงงาน ที่ต้องการคู่ค้าด้านระบบสื่อสารตั้งแต่ขั้นออกแบบ',
      en: 'Engineering and construction contractors who need a communication systems partner from design stage.',
    },
    icon: 'blueprint',
    order: 7,
  },
  {
    slug: 'manufacturing',
    name: { th: 'อุตสาหกรรมการผลิต', en: 'Manufacturing' },
    description: {
      th: 'โรงงานผลิตทั่วไปที่ต้องการระบบประกาศ สัญญาณเตือน และกล้องวงจรปิด',
      en: 'General manufacturing plants requiring public address, signalling and CCTV.',
    },
    icon: 'factory',
    order: 8,
  },
]
