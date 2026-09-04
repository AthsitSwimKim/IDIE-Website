import type { Certificate, CompanyInfo, Milestone, Stat, ValueProp } from '@/types/content'
import { config } from '@/config'

/**
 * ข้อมูลจริงจากเว็บไซต์บริษัท http://www.idindustrial.com/ (ดึง 18 ส.ค. 2026)
 * ฟิลด์ที่ยังไม่มีข้อมูลจริงถูกทำเครื่องหมายไว้เป็นรายฟิลด์ อย่าเติมค่าที่แต่งขึ้น
 */
export const company: CompanyInfo = {
  legalName: {
    th: 'บริษัท ไอดี อินดัสเตรียล เอ็นจิเนียริ่ง จำกัด',
    en: 'ID Industrial Engineering Co.,Ltd.',
  },
  shortName: 'IDIE',
  tagline: {
    // TODO: confirm with IDIE — สรุปจากข้อความ business activities บนเว็บเดิม ยังไม่ใช่ tagline ทางการ
    th: 'ระบบสื่อสารและสัญญาณเตือนภัยสำหรับอุตสาหกรรม',
    en: 'Industrial Communication & Safety Signalling',
  },
  // อ่านจาก config เพื่อไม่ให้มีปีก่อตั้งสองที่ที่เพี้ยนจากกันได้
  foundedYear: config.foundedYear,
  /*
    ข้อความนี้ยึดตามย่อหน้า business activities ใน Company Profile ฉบับย่อ 2026
    ซึ่งระบุระบบไว้ครบหกอย่างและระบุ steel plant เป็นหนึ่งในสายงาน — ฉบับก่อนหน้านี้
    อ้างอิงเว็บเดิมที่ยังไม่ได้พูดถึงระบบโทรศัพท์เต็มระบบและระบบควบคุมการเข้าออกเลย
    (คงคำว่า "งานบริการ / service" ไว้ตามเว็บเดิม เพราะเป็นสิ่งที่บริษัทระบุเองและ
     เอกสารฉบับย่อไม่ได้ปฏิเสธ)
  */
  about: {
    th: 'บริษัท ไอดี อินดัสเตรียล เอ็นจิเนียริ่ง จำกัด เป็นบริษัทวิศวกรรม ตัวแทนจำหน่าย และงานบริการ ที่เชี่ยวชาญด้านการออกแบบและงานวิศวกรรม รวมถึงการจัดหาระบบสื่อสารสำหรับโรงงาน ได้แก่ ระบบอินเตอร์คอม ระบบประกาศและสัญญาณเตือนภัย ระบบโทรศัพท์ ระบบเครือข่าย WAN/LAN ระบบกล้องวงจรปิด และระบบควบคุมการเข้าออก ครอบคลุมอุตสาหกรรมเคมี ปิโตรเคมี น้ำมันและก๊าซ โรงงานเหล็ก โรงไฟฟ้า และเหมืองแร่',
    en: 'ID Industrial Engineering Co.,Ltd. is an engineering, distribution and service company specialising in design and engineering, and in the procurement of communication systems — intercom, public address and warning alarm, telephone, WAN/LAN, CCTV and access control. Our field of service covers the chemical, petrochemical, oil and gas, steel plant, power plant and mining industries.',
  },
  vision: {
    th: '',
    en: '',
  },
  mission: [],
  address: {
    th: '69/13 ถนนจันทอุดม ตำบลเชิงเนิน อำเภอเมืองระยอง จังหวัดระยอง 21000',
    en: '69/13 Chanthaudom Road, Tambol Choengnoen, Muang Rayong, Rayong 21000, Thailand',
  },
  phone: ['+66 38 623000', '+66 87 616 0216'],
  email: ['sales@idindustrial.com'],
  businessHours: {
    // TODO: confirm with IDIE — เว็บเดิมไม่ระบุเวลาทำการ
    th: '',
    en: '',
  },
  /**
   * ลิงก์ฝังแผนที่จาก Google Maps ที่ IDIE ส่งมา (ส.ค. 2026) — หมุดชื่อบริษัทจริง
   *
   * เก็บเฉพาะค่า src ของ iframe ไม่เก็บแท็ก iframe ทั้งก้อน เพราะ component
   * เป็นคนกำหนดขนาด ความปลอดภัย และ title เอง ถ้าเก็บทั้งแท็กจะกลายเป็นการฝัง HTML
   * จากข้อมูลซึ่งควบคุมไม่ได้
   */
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d508.120892239708!2d101.27404758559926!3d12.686822827496792!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3102fc6bcffcab5f%3A0x9a2e60e9381155f7!2zSUQgSU5EVVNUUklBTCBFTkdJTkVFUklORyBDTy4sIExURC4gKOC4muC4o-C4tOC4qeC4seC4lyDguYTguK3guJTguLUg4Lit4Li04LiZ4LiU4Lix4Liq4LmA4LiV4Lij4Li14Lii4LilIOC5gOC4reC5h-C4meC4iOC4tOC5gOC4meC4teC4ouC4o-C4tOC5iOC4hyDguIjguIEu!5e1!3m2!1sth!2sth!4v1787726956239!5m2!1sth!2sth',
  socials: [],
}

/** เบอร์แฟกซ์แยกไว้เพราะ CompanyInfo.phone เป็นเบอร์ที่โทรออกได้เท่านั้น */
export const companyFax = '+66 38 623001'

/** ผู้ติดต่อหลักตามที่ระบุบนเว็บเดิม */
export const contactPerson = {
  name: 'Mr. Pitthaya Prasertsincharoen',
  role: { th: 'ผู้จัดการทั่วไป', en: 'General Manager' },
  email: 'pitthaya.rayong@gmail.com',
}

/**
 * Vision & Mission และประวัติบริษัท ไม่มีอยู่บนเว็บเดิมเลย
 * ปล่อยเป็น array ว่างโดยตั้งใจ — หน้า About ต้องซ่อน section ที่ไม่มีข้อมูล
 * แทนการแสดง section เปล่าหรือข้อความที่แต่งขึ้น
 */
export const milestones: Milestone[] = []

/**
 * หนังสือรับรองการเป็นตัวแทนจากผู้ผลิต — **ข้อมูลจริงจากเอกสารที่ IDIE ส่งมา (ส.ค. 2026)**
 *
 * ทุกบรรทัดในนี้สรุปจากถ้อยคำบนเอกสารตัวจริงที่อ่านแล้ว ไม่ได้เรียบเรียงให้ดูดีขึ้น
 * ในธุรกิจพื้นที่อันตราย ผู้ซื้อและผู้ตรวจสอบย้อนกลับไปถามผู้ผลิตได้โดยตรง
 * การเขียนเกินกว่าที่เอกสารระบุแม้คำเดียวจึงเป็นความเสี่ยงทางธุรกิจ ไม่ใช่แค่การตลาด
 *
 * **แสดงภาพสแกนบนหน้าเว็บ** — ภาพแปลงจาก PDF ต้นฉบับเป็น WebP สองความละเอียด
 * กดที่ภาพเพื่อเปิดขนาดเต็มได้ · ฉบับปี 2022 หมุนภาพให้ตั้งตรงแล้ว
 * (หน้า PDF ตั้ง /Rotate 270 ไว้)
 *
 * **หนังสือ Authorisation Certificate ปี 2006 ถูกถอดออกตามที่ IDIE แจ้ง (ส.ค. 2026)** —
 * เอกสารระบุอายุถึง 30 มิ.ย. 2007 และผูกกับงานของ TPI โดยเฉพาะ จึงไม่เผยแพร่
 * ถ้าจะเพิ่มหนังสือฉบับอื่นในอนาคต ต้องเป็นฉบับที่ยังมีผลเท่านั้น
 *
 * MEDC ไม่มีหนังสือแต่งตั้ง และ IDIE แจ้งว่าไม่ต้องขอใบรับรองระบบ (ISO) แล้ว (ส.ค. 2026)
 * รายการนี้จึงถือว่าครบแล้ว ไม่ต้องมีบล็อกขอข้อมูลบนหน้าเว็บอีก
 */
export const certificates: Certificate[] = [
  {
    id: 'industronic-exclusive-agent',
    name: {
      th: 'ตัวแทนจำหน่ายแต่เพียงผู้เดียวในประเทศไทย',
      en: 'Exclusive agent in Thailand',
    },
    issuer: { th: 'INDUSTRONIC (เยอรมนี)', en: 'INDUSTRONIC (Germany)' },
    year: 2022,
    scope: {
      th: 'หนังสือรับรองความเป็นพันธมิตรจาก INDUSTRONIC Industrie-Electronic GmbH & Co. KG ระบุว่า IDIE เป็นตัวแทนแต่เพียงผู้เดียวในประเทศไทย พร้อมตรารับรองความร่วมมือครบ 15 ปี ลงวันที่ 5 ตุลาคม 2565',
      en: 'Certificate of Partnership from INDUSTRONIC Industrie-Electronic GmbH & Co. KG naming IDIE its exclusive agent in Thailand, marked with a 15-year partnership seal. Dated 5 October 2022.',
    },
    status: 'active',
    image: {
      src: '/images/certificates/industronic-partnership-2022.webp',
      srcSet:
        '/images/certificates/industronic-partnership-2022-720.webp 1x, /images/certificates/industronic-partnership-2022.webp 2x',
      alt: {
        th: 'หนังสือรับรองความเป็นพันธมิตรจาก INDUSTRONIC ระบุ ID Industrial Engineering เป็นตัวแทนแต่เพียงผู้เดียวในประเทศไทย พร้อมตราครบ 15 ปี ลงนามที่เมือง Wertheim วันที่ 5 ตุลาคม 2022',
        en: 'INDUSTRONIC Certificate of Partnership naming ID Industrial Engineering its exclusive agent in Thailand, with a 15-year seal, signed in Wertheim on 5 October 2022.',
      },
      width: 1600,
      height: 1131,
    },
  },
  {
    id: 'fhf-authorized-distributor',
    name: {
      th: 'ตัวแทนจำหน่ายที่ได้รับอนุญาตในประเทศไทย',
      en: 'Authorized distributor in Thai territory',
    },
    issuer: {
      th: 'FHF Funke + Huster Fernsig GmbH (เยอรมนี)',
      en: 'FHF Funke + Huster Fernsig GmbH (Germany)',
    },
    year: 2008,
    scope: {
      th: 'หนังสืออนุญาตจาก FHF ยืนยันว่า ID Industrial Engineering Co., Ltd. เป็นตัวแทนจำหน่ายสินค้า FHF ที่ได้รับอนุญาตในประเทศไทย มีผลจนกว่าจะถูกเพิกถอนเป็นลายลักษณ์อักษร ลงวันที่ 21 กุมภาพันธ์ 2551',
      en: 'Letter of Authorization from FHF confirming ID Industrial Engineering Co., Ltd. as an authorized distributor of FHF products within the Thai territory, valid until revoked in writing. Dated 21 February 2008.',
    },
    status: 'active',
    image: {
      src: '/images/certificates/fhf-authorization-2008.webp',
      srcSet:
        '/images/certificates/fhf-authorization-2008-720.webp 1x, /images/certificates/fhf-authorization-2008.webp 2x',
      alt: {
        th: 'หนังสืออนุญาตจาก FHF Funke + Huster Fernsig GmbH ยืนยันว่า ID Industrial Engineering Co., Ltd. เป็นตัวแทนจำหน่ายสินค้า FHF ที่ได้รับอนุญาตในประเทศไทย ลงวันที่ 21 กุมภาพันธ์ 2008',
        en: 'FHF Funke + Huster Fernsig GmbH Letter of Authorization confirming ID Industrial Engineering Co., Ltd. as an authorized distributor of FHF products in the Thai territory, dated 21 February 2008.',
      },
      width: 1131,
      height: 1600,
    },
  },
]

/**
 * ตัวเลขสถิติ: มีเพียงปีประสบการณ์ที่คำนวณจากปีก่อตั้งจริงได้
 * ที่เหลือเป็น null รอข้อมูลจาก IDIE — ห้ามเดาตัวเลข
 */
export const stats: Stat[] = [
  {
    id: 'years',
    label: { th: 'ปีในสายระบบสื่อสารอุตสาหกรรม', en: 'Years in industrial communication' },
    // คำนวณตอน render ผ่าน yearsOfExperience() — ค่านี้เป็นแค่ค่าเริ่มต้น
    value: 0,
    suffix: '+',
  },
  {
    id: 'reference-companies',
    label: { th: 'องค์กรที่เคยร่วมงาน', en: 'Companies served' },
    value: 35, // นับจากโลโก้จริงบนหน้า Reference ของเว็บเดิม
    suffix: '+',
  },
  {
    id: 'projects',
    label: { th: 'โครงการที่ส่งมอบ', en: 'Projects delivered' },
    value: 0,
    _placeholder: true, // TODO: confirm with IDIE
  },
]

/**
 * Engineering Highlights / Why IDIE
 * ทุกข้อต้องอ้างอิงข้อเท็จจริงที่ตรวจสอบได้จากเว็บบริษัท ไม่ใช่คำโฆษณาลอย ๆ
 */
export const valueProps: ValueProp[] = [
  {
    id: 'specialist',
    icon: 'target',
    title: { th: 'เชี่ยวชาญเฉพาะทาง', en: 'Focused Specialist' },
    description: {
      th: 'ทำเฉพาะระบบสื่อสารและสัญญาณเตือนภัยอุตสาหกรรมมาตั้งแต่ปี 2549 ไม่ใช่งานรับเหมาทั่วไปที่รับงานนี้เป็นงานเสริม',
      en: 'Dedicated to industrial communication and signalling since 2006 — not a general contractor taking this on as a side line.',
    },
  },
  {
    id: 'hazardous-area',
    icon: 'shield',
    title: { th: 'งานพื้นที่อันตราย', en: 'Hazardous Area Expertise' },
    description: {
      th: 'อุปกรณ์กันระเบิดสำหรับพื้นที่เสี่ยง พร้อมมาตรฐานสากลอย่าง ATEX และ IECEx',
      en: 'Explosion-proof equipment for classified areas, backed by international certifications such as ATEX and IECEx.',
    },
  },
  {
    id: 'european-usa',
    icon: 'award',
    title: { th: 'สินค้าจากยุโรปและสหรัฐฯ', en: 'European & US Products' },
    description: {
      th: 'จัดจำหน่ายเฉพาะสินค้าคุณภาพจากผู้ผลิตในยุโรปหรือสหรัฐอเมริกา เป็นนโยบายของบริษัท',
      en: 'We supply only quality products from European or US manufacturers — a standing company policy.',
    },
  },
  {
    id: 'rayong-based',
    icon: 'map-pin',
    title: { th: 'ฐานที่ระยอง', en: 'Based in Rayong' },
    description: {
      th: 'ตั้งอยู่ในระยอง ใกล้พื้นที่อุตสาหกรรมของลูกค้า ทำให้ตอบงานบริการและงานด่วนได้เร็ว',
      en: 'Located in Rayong, close to our customers’ plants — enabling fast service response.',
    },
  },
]
