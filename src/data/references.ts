import type { IndustrySlug, ReferenceCompany } from '@/types/content'

/**
 * ลูกค้าจริง 35 ราย จากหน้า Reference ของเว็บบริษัท ("Some of our customers")
 * ดึงข้อมูลและไฟล์โลโก้ 18 ส.ค. 2026 · ต้นทาง idindustrial.com/images/Customer_Logo/
 *
 * ชื่อที่ใช้อ่านจากตัวโลโก้เอง ไม่ใช่จากชื่อไฟล์ — ซึ่งทำให้แก้การเดาผิดได้หลายราย
 * เช่น NNE ไม่ใช่ NNE Pharmaplan แต่เป็น "นวนครการไฟฟ้า" และ TLP คือโรงไฟฟ้าโคเจนเนอเรชัน
 * ไม่ใช่โรงงานผลิต
 *
 * รายที่โลโก้มีแต่ตัวย่อและไม่มีคำขยาย (ASM, MPS, RSM) ยังระบุอุตสาหกรรมไม่ได้
 * จึงตั้ง _placeholder ไว้ รอ IDIE ยืนยัน
 *
 * ⚠️ โลโก้เป็นเครื่องหมายการค้าของเจ้าของ IDIE เผยแพร่อยู่แล้วบนเว็บตัวเอง
 *    แต่ควรให้บริษัทยืนยันสิทธิ์การใช้อีกครั้งก่อน production
 */

/**
 * ทุกไฟล์โลโก้ถูก normalize มาที่ขนาดเดียวกัน — ระบุไว้เพื่อกัน layout shift
 *
 * ไฟล์ผ่านการซ่อมจากต้นฉบับ: ลอกกรอบเส้นขอบของเว็บเดิม, quantize เพื่อกำจัด
 * JPEG artifact, ทำพื้นขาวให้โปร่งใสด้วย flood fill (สีขาวในตัวโลโก้ไม่ทะลุ)
 * แล้วขยายแบบแยก mask รายสีเพื่อให้ขอบเรียบ
 *
 * ⚠️ ยัง "คมขึ้น" ไม่ใช่ "ละเอียดขึ้น" — ต้นฉบับกว้างสุดแค่ 339px
 *    ยังต้องขอไฟล์จริงจาก IDIE (ดู docs/data-requests.md)
 */
export const REFERENCE_LOGO_SIZE = { width: 480, height: 320 } as const

type ReferenceSeed = readonly [
  id: string,
  name: string,
  industry: IndustrySlug,
  featured?: boolean,
  /** ชื่อไทย เมื่อโลโก้เป็นภาษาไทยหรือชื่อไทยเป็นที่รู้จักมากกว่า */
  nameTh?: string,
  /** โลโก้มีแต่ตัวย่อ ยังจัดอุตสาหกรรมไม่ได้ */
  unconfirmed?: boolean,
]

const seeds: readonly ReferenceSeed[] = [
  ['ptt', 'PTT', 'oil-gas', true],
  ['pttep', 'PTTEP', 'oil-gas', true],
  ['pttgc', 'PTT Global Chemical', 'petrochemical', true],
  ['pttar', 'PTT AR', 'petrochemical'],
  ['pttchem', 'PTT Chem', 'petrochemical'],
  ['pttphenol', 'PTT Phenol', 'petrochemical'],
  ['ptt-mcc', 'PTT MCC Biochem', 'petrochemical'],
  ['thaioil', 'Thaioil', 'oil-gas', true],
  ['sprc', 'SPRC', 'oil-gas', true],
  ['esso', 'Esso', 'oil-gas', true],
  ['irpc', 'IRPC', 'petrochemical', true],
  ['irpc-group', 'IRPC Group', 'petrochemical'],
  // โลโก้ระบุชัดว่าเป็นสายเคมี ไม่ใช่ SCG ทั้งเครือ
  // ✅ ใช้ไฟล์ที่ลูกค้าส่งมาโดยตรง (assets-src/reference-logos/scg.png) ไม่ใช่ของที่ดึงจากเว็บเดิม
  ['scg', 'SCG Chemicals', 'chemical', true],
  ['hmc', 'HMC Polymers', 'petrochemical', true],
  ['thai-mma', 'Thai MMA', 'petrochemical'],
  ['thainitrate', 'Thai Nitrate', 'fertilizer'],
  ['tpc-vina', 'TPC Vina', 'petrochemical'],
  ['tpipolene', 'TPI Polene', 'petrochemical'],
  ['bayer', 'Bayer', 'chemical', true],
  ['kao', 'Kao', 'chemical'],
  ['momentive', 'Momentive Performance Materials', 'chemical'],
  ['agc', 'AGC', 'chemical', true],
  // โลโก้เขียนว่า "sanyo KASEI (THAILAND) LTD." — เป็นบริษัทเคมี ไม่ใช่เครื่องใช้ไฟฟ้า
  ['sanyo', 'Sanyo Kasei (Thailand)', 'chemical'],
  ['egat', 'EGAT', 'power-plant', true, 'การไฟฟ้าฝ่ายผลิตแห่งประเทศไทย'],
  ['hongsa', 'Hongsa Power', 'power-plant'],
  // ชื่อไทยอ่านจากโลโก้โดยตรง · ชื่ออังกฤษถอดจากชื่อไฟล์ต้นทาง (NNE)
  ['nne', 'Navanakorn Electricity', 'power-plant', false, 'นวนครการไฟฟ้า'],
  // โลโก้เขียนว่า "TLP Cogeneration" — โรงไฟฟ้าพลังงานร่วม
  ['tlp', 'TLP Cogeneration', 'power-plant'],
  ['ctci', 'CTCI (Thailand)', 'epc'],
  ['toyo-thai', 'TTCL (Toyo-Thai)', 'epc'],
  ['uhde', 'Uhde · thyssenkrupp', 'epc'],
  ['g-steel', 'G Steel', 'manufacturing'],
  ['saiden', 'Saiden', 'manufacturing'],
  ['asm', 'ASM', 'manufacturing', false, undefined, true],
  ['mps', 'MPS', 'manufacturing', false, undefined, true],
  ['rsm', 'RSM', 'manufacturing', false, undefined, true],
]

export const referenceCompanies: ReferenceCompany[] = seeds.map(
  ([id, name, industry, featured, nameTh, unconfirmed], index) => ({
    id,
    name: { th: nameTh ?? name, en: name },
    logo: {
      src: `/images/reference/${id}.webp`,
      // กล่องแสดงผลจริงกว้างราว 180 css px — จอ 1x ไม่ต้องโหลดไฟล์ 480px
      srcSet: `/images/reference/${id}-240.webp 1x, /images/reference/${id}.webp 2x`,
      // alt = ชื่อบริษัท ตาม acceptance criteria ไม่ใช่คำว่า "logo"
      alt: { th: nameTh ?? name, en: name },
      ...REFERENCE_LOGO_SIZE,
    },
    industry,
    featured: featured ?? false,
    order: index + 1,
    // TODO: confirm with IDIE — โลโก้มีแต่ตัวย่อ ยังระบุอุตสาหกรรมไม่ได้
    ...(unconfirmed ? { _placeholder: true as const } : {}),
  }),
)
