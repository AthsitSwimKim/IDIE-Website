import type { CompanyInfo, Milestone, Stat, ValueProp } from '@/types/content'
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
    /*
      ย่อหน้าแรกไม่ขึ้นต้นด้วยชื่อเต็มบริษัทอีกแล้ว — หัวข้อเหนือย่อหน้านี้เป็นชื่อเต็ม
      อยู่แล้วทั้งบนหน้าเกี่ยวกับเราและหมวด Company Profile หน้าแรก การเขียนซ้ำทันที
      ในบรรทัดถัดมาทำให้ผู้อ่านต้องอ่านชื่อเดียวกันสองรอบก่อนจะได้ข้อมูลจริงข้อแรก
    */
    th:
      'เราคือผู้เชี่ยวชาญด้านงานวิศวกรรม ออกแบบ จัดหา และติดตั้งระบบสื่อสารความปลอดภัยสำหรับโรงงานอุตสาหกรรมโดยเฉพาะ\n\nครอบคลุมระบบอินเตอร์คอม, ระบบเตือนภัย, ระบบโทรศัพท์, โครงข่าย WAN/LAN, กล้องวงจรปิด และระบบควบคุมการเข้าออก (Access Control) เพื่อรองรับกลุ่มอุตสาหกรรมหนัก ทั้งปิโตรเคมี, น้ำมันและก๊าซ, โรงเหล็ก, โรงไฟฟ้า ตลอดจนเหมืองแร่',
    en:
      'We specialise in engineering, design, procurement and installation of safety communication systems built for industrial plants.\n\nCovering intercom, warning alarm, telephone, WAN/LAN networks, CCTV and access control — for heavy industry: petrochemical, oil and gas, steel plants, power generation and mining.',
  },
  vision: {
    th: '',
    en: '',
  },
  mission: [],
  address: {
    th: '69/13 ถนนจันทอุดม ตำบลเชิงเนิน อำเภอเมืองระยอง จังหวัดระยอง 21000',
    /*
      ช่องว่างใน "Mueang Rayong District," เป็น non-breaking space (U+00A0) ไม่ใช่ช่องว่างธรรมดา
      ไม่งั้นหน้าติดต่อเราตัดเป็น "…Sub-district, Mueang / Rayong District" ที่บรรทัดแรกจบด้วย
      คำว่า "Mueang" โดด ๆ ก้อนนี้กว้าง 215px จึงยังอยู่ในกล่องที่แคบที่สุดของหน้ามือถือได้
    */
    en: '69/13 Chanthaudom Road, Choeng Noen Sub-district, Mueang Rayong District, Rayong 21000',
  },
  /*
    จุดขึ้นบรรทัดเป็นค่าที่เจ้าของเว็บกำหนดมาเอง ไม่ใช่การตัดของเบราว์เซอร์
    ทั้งสองภาษาแบ่งคนละแบบ ไทยสองบรรทัด อังกฤษสี่บรรทัดโดยมีชื่อประเทศต่อท้าย
  */
  addressFooter: {
    th: '69/13 ถนนจันทอุดม ตำบลเชิงเนิน\nอำเภอเมืองระยอง จังหวัดระยอง 21000',
    en: '69/13 Chanthaudom Road, Choeng Noen Sub-district,\nMueang Rayong District, Rayong\n21000\nThailand',
  },
  phone: ['+66 38 623000', '+66 87 616 0216'],
  /*
    อีเมลที่สองเจ้าของเว็บแจ้งมาเอง (8 ก.ย. 2026) ไม่ได้อยู่บนเว็บเดิม
    เรียงต่อท้ายไม่ใช่ขึ้นก่อน เพราะ sales@ เป็นอีเมลบริษัทที่ลูกค้าใช้ติดต่ออยู่แล้ว
    ทั้งหน้าติดต่อเราและท้ายเว็บวนแสดงทุกค่าในอาเรย์นี้ ใส่ที่เดียวขึ้นทั้งสองที่
  */
  email: ['sales@idindustrial.com', 'pitthaya.rayong@gmail.com'],
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
      th: 'มุ่งเน้นระบบสื่อสารและเตือนภัยในโรงงานอุตสาหกรรมโดยเฉพาะ ต่อเนื่องตั้งแต่ปี 2549 มั่นใจได้ในมาตรฐานระดับมืออาชีพ',
      en: 'Focused on communication and warning systems for industrial plants, continuously since 2006, to a professional standard.',
    },
  },
  {
    id: 'hazardous-area',
    icon: 'shield',
    title: { th: 'งานพื้นที่อันตราย', en: 'Hazardous Area Expertise' },
    description: {
      th: 'อุปกรณ์กันระเบิดสำหรับพื้นที่เสี่ยง พร้อมมาตรฐานระดับสากลอย่าง ATEX และ IECEx',
      en: 'Explosion‑proof equipment for classified areas, backed by international standards such as ATEX and IECEx.',
    },
  },
  {
    id: 'european-usa',
    icon: 'award',
    title: { th: 'สินค้าจากยุโรปและสหรัฐฯ', en: 'European & US Products' },
    description: {
      th: 'จัดจำหน่ายเฉพาะสินค้าคุณภาพสูง นำเข้าตรงจากผู้ผลิตในยุโรปและสหรัฐอเมริกาตามมาตรฐานบริษัท',
      en: 'We supply only high‑quality products, imported directly from manufacturers in Europe and the United States, in line with company standards.',
    },
  },
  {
    id: 'rayong-based',
    icon: 'map-pin',
    title: { th: 'ฐานที่ระยอง', en: 'Based in Rayong' },
    description: {
      th: 'สำนักงานตั้งอยู่ในระยอง ใกล้พื้นที่นิคมอุตสาหกรรมหลักของลูกค้า พร้อมเข้าหน้างานและดูแลงานด่วนได้ทันที',
      en: 'Our office is in Rayong, close to our customers’ main industrial estates — ready to attend site and handle urgent work immediately.',
    },
  },
]
