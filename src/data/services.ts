import type { Service } from '@/types/content'

/**
 * บริการจริง 4 กลุ่ม สกัดจากข้อความ business activities บนเว็บบริษัท
 * ชื่อภาษาอังกฤษ = ของจริง · ชื่อและคำอธิบายภาษาไทย = ร่าง TODO: confirm with IDIE
 *
 * ⚠️ รายการ Mechanical / Electrical / Automation & Control ในเอกสารโครงการต้นฉบับ
 *    ไม่ใช่บริการของ IDIE — เป็นตัวอย่างทั่วไปที่เขียนไว้ก่อนได้ข้อมูลจริง
 *
 * ภาพและ gallery ยังไม่มี — ต้องขอจาก IDIE (ดู docs/data-requests.md)
 */
export const services: Service[] = [
  {
    slug: 'intercommunication-system',
    name: { th: 'ระบบอินเตอร์คอมอุตสาหกรรม', en: 'Intercommunication System' },
    shortDescription: {
      th: 'ระบบสื่อสารภายในโรงงานที่ได้ยินชัดแม้ในพื้นที่เสียงดังและพื้นที่เสี่ยงระเบิด',
      en: 'Plant-wide intercom that stays intelligible in high-noise and hazardous areas.',
    },
    overview: {
      th: 'ออกแบบ จัดหา และติดตั้งระบบอินเตอร์คอมอุตสาหกรรมสำหรับพื้นที่ผลิต ห้องควบคุม และพื้นที่เสี่ยง โดยเลือกอุปกรณ์ให้เหมาะกับระดับเสียงรบกวนและการจำแนกพื้นที่อันตรายของแต่ละจุด',
      en: 'Design, supply and installation of industrial intercom systems for process areas, control rooms and classified zones — with equipment selected to match the noise level and area classification of each location.',
    },
    scope: [
      { th: 'สำรวจหน้างานและออกแบบระบบ', en: 'Site survey and system design' },
      { th: 'จัดหาอุปกรณ์จากผู้ผลิตยุโรปและสหรัฐฯ', en: 'Procurement from European and US manufacturers' },
      { th: 'ติดตั้งและทดสอบการใช้งาน', en: 'Installation and commissioning' },
      { th: 'บริการหลังการขายและอะไหล่', en: 'After-sales service and spare parts' },
    ],
    applications: [
      { th: 'ห้องควบคุมกับพื้นที่ผลิต', en: 'Control room to process area' },
      { th: 'จุดปฏิบัติงานในพื้นที่เสี่ยงระเบิด', en: 'Operator points in hazardous zones' },
      { th: 'ระบบ party line และ conference', en: 'Party line and conference systems' },
    ],
    icon: 'radio',
    cover: {
      src: '/images/services/intercommunication-system/cover.webp',
      srcSet: '/images/services/intercommunication-system/cover-800.webp 1x, /images/services/intercommunication-system/cover.webp 2x',
      alt: {
        th: 'ระบบอินเตอร์คอมอุตสาหกรรมติดตั้งในพื้นที่โรงงาน',
        en: 'Industrial intercom station installed in a process area',
      },
      width: 1181,
      height: 1181,
    },
    featured: true,
    order: 1,
    relatedProductCategorySlugs: ['telephones', 'systems'],
  },
  {
    slug: 'public-address-warning-alarm',
    name: {
      th: 'ระบบประกาศและสัญญาณเตือนภัย',
      en: 'Public Address & Warning Alarm System (PA/GA)',
    },
    shortDescription: {
      th: 'ระบบ PA/GA สำหรับประกาศทั่วโรงงานและแจ้งเตือนเหตุฉุกเฉิน',
      en: 'PA/GA systems for plant-wide announcement and emergency alarm.',
    },
    overview: {
      th: 'ระบบประกาศและสัญญาณเตือนภัยแบบครบวงจร ครอบคลุมทั้งลำโพง อุปกรณ์ส่งเสียง ไฟสัญญาณ และจุดแจ้งเหตุด้วยมือ ออกแบบให้ครอบคลุมพื้นที่ตามข้อกำหนดด้านความปลอดภัยของโรงงาน',
      en: 'End-to-end public address and general alarm systems covering loudspeakers, sounders, beacons and manual call points — engineered for area coverage that meets plant safety requirements.',
    },
    scope: [
      { th: 'คำนวณการครอบคลุมเสียงและแสงสัญญาณ', en: 'Acoustic and visual coverage calculation' },
      { th: 'ออกแบบระบบและจัดทำแบบ', en: 'System design and documentation' },
      { th: 'จัดหา ติดตั้ง และทดสอบ', en: 'Supply, installation and testing' },
      { th: 'บำรุงรักษาและตรวจสอบตามรอบ', en: 'Maintenance and periodic inspection' },
    ],
    applications: [
      { th: 'ประกาศทั่วพื้นที่โรงงาน', en: 'Plant-wide announcement' },
      { th: 'สัญญาณอพยพฉุกเฉิน', en: 'Emergency evacuation alarm' },
      { th: 'แจ้งเตือนพื้นที่เสียงดังสูง', en: 'High-noise area notification' },
    ],
    icon: 'megaphone',
    cover: {
      src: '/images/services/public-address-warning-alarm/cover.webp',
      alt: {
        th: 'ลำโพงและไฟสัญญาณเตือนภัยติดตั้งบนโครงสร้างโรงงาน',
        en: 'Loudspeaker and warning beacon mounted on plant structure',
      },
      width: 800,
      height: 500,
    },
    featured: true,
    order: 2,
    relatedProductCategorySlugs: ['acoustic-signalling', 'optical-signalling', 'combination-units'],
  },
  {
    slug: 'network-cctv-system',
    name: { th: 'ระบบเครือข่ายและกล้องวงจรปิด', en: 'Network & CCTV System' },
    shortDescription: {
      th: 'ระบบเครือข่ายและกล้องวงจรปิดสำหรับพื้นที่อุตสาหกรรมและพื้นที่เสี่ยง',
      en: 'Network and CCTV systems for industrial and classified areas.',
    },
    overview: {
      th: 'วางระบบเครือข่ายและกล้องวงจรปิดที่รองรับสภาพแวดล้อมอุตสาหกรรม ทั้งกล้องชนิดกันระเบิดและกันสภาพอากาศ พร้อมเชื่อมต่อเข้ากับระบบสื่อสารเดิมของโรงงาน',
      en: 'Network and CCTV infrastructure built for industrial conditions — explosion-protected and weatherproof cameras, integrated with the plant’s existing communication systems.',
    },
    scope: [
      { th: 'ออกแบบเครือข่ายและตำแหน่งกล้อง', en: 'Network and camera layout design' },
      { th: 'จัดหากล้องกันระเบิดและกันสภาพอากาศ', en: 'Supply of Ex and weatherproof cameras' },
      { th: 'ติดตั้งและเชื่อมระบบ', en: 'Installation and system integration' },
    ],
    applications: [
      { th: 'เฝ้าระวังพื้นที่ผลิต', en: 'Process area surveillance' },
      { th: 'ความปลอดภัยรอบขอบเขตโรงงาน', en: 'Plant perimeter security' },
      { th: 'ตรวจการณ์จุดเสี่ยงจากห้องควบคุม', en: 'Remote monitoring of critical points' },
    ],
    icon: 'video',
    cover: {
      src: '/images/services/network-cctv-system/cover.webp',
      alt: {
        th: 'กล้องวงจรปิดชนิดกันระเบิดติดตั้งในพื้นที่โรงงาน',
        en: 'Explosion-protected CCTV camera station in a plant area',
      },
      width: 583,
      height: 360,
    },
    order: 3,
    relatedProductCategorySlugs: ['systems'],
  },
  {
    slug: 'explosion-proof-telephone-signalling',
    name: {
      th: 'โทรศัพท์อุตสาหกรรมและอุปกรณ์ส่งสัญญาณชนิดกันระเบิด',
      en: 'Industrial & Explosion-proof Telephone / Signalling Device',
    },
    shortDescription: {
      th: 'จัดจำหน่ายโทรศัพท์และอุปกรณ์ส่งสัญญาณสำหรับพื้นที่อันตรายและสภาพแวดล้อมรุนแรง',
      en: 'Supply of telephones and signalling devices for hazardous and harsh environments.',
    },
    overview: {
      th: 'ตัวแทนจำหน่ายโทรศัพท์อุตสาหกรรม โทรศัพท์กันระเบิด และอุปกรณ์ส่งสัญญาณทั้งชนิดเสียงและชนิดแสง จากผู้ผลิตในยุโรปและสหรัฐอเมริกา พร้อมคำแนะนำการเลือกรุ่นให้ตรงกับการจำแนกพื้นที่และมาตรฐานที่โครงการกำหนด',
      en: 'Authorised supply of industrial telephones, explosion-proof telephones, and both acoustic and optical signalling devices from European and US manufacturers — with selection guidance matched to area classification and project specifications.',
    },
    scope: [
      { th: 'เลือกรุ่นให้ตรงกับการจำแนกพื้นที่', en: 'Model selection by area classification' },
      { th: 'ตรวจสอบมาตรฐานและใบรับรอง', en: 'Certification and compliance review' },
      { th: 'จัดหาและส่งมอบ', en: 'Procurement and delivery' },
      { th: 'อะไหล่และงานเปลี่ยนทดแทน', en: 'Spare parts and replacement' },
    ],
    applications: [
      { th: 'พื้นที่อันตรายตามมาตรฐาน ATEX / IECEx', en: 'ATEX / IECEx classified areas' },
      { th: 'พื้นที่กลางแจ้งและงานนอกชายฝั่ง', en: 'Outdoor and offshore installations' },
      { th: 'จุดโทรฉุกเฉินในพื้นที่ผลิต', en: 'Emergency call points in process areas' },
    ],
    icon: 'phone',
    cover: {
      src: '/images/services/explosion-proof-telephone-signalling/cover.webp',
      alt: {
        th: 'โทรศัพท์ชนิดกันระเบิดติดตั้งในพื้นที่อันตราย',
        en: 'Explosion-proof telephone installed in a hazardous area',
      },
      width: 750,
      height: 500,
    },
    featured: true,
    order: 4,
    relatedProductCategorySlugs: ['telephones', 'acoustic-signalling', 'optical-signalling'],
  },
]

/**
 * ความสามารถที่คร่อมทุกบริการ — ใช้ในหน้า Home ส่วน Engineering Highlights
 * มาจากข้อความ "design and engineering, procurement ... and service company" บนเว็บเดิม
 */
export const capabilities = [
  {
    id: 'design-engineering',
    name: { th: 'ออกแบบและงานวิศวกรรม', en: 'Design & Engineering' },
  },
  {
    id: 'procurement',
    name: { th: 'จัดหาอุปกรณ์', en: 'Procurement' },
  },
  {
    id: 'service',
    name: { th: 'ติดตั้งและบริการหลังการขาย', en: 'Installation & Service' },
  },
] as const
