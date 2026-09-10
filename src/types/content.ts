/**
 * IDIE Content Model
 *
 * หลักการ: entity เชื่อมกันด้วย id/slug ไม่ใช่ nested object
 * เพราะ API/CMS จริงใน phase ถัดไปจะคืนค่ามาแบบ reference — ถ้าวันนี้ nested ไว้
 * วันนั้นต้องรื้อทั้ง data layer
 */

/* -------------------------------------------------------------------------- */
/* พื้นฐาน                                                                     */
/* -------------------------------------------------------------------------- */

/** ทุกข้อความที่ผู้ใช้เห็นต้องมีทั้งสองภาษาตั้งแต่วันแรก */
export interface LocalizedText {
  th: string;
  en: string;
}

export type Locale = 'th' | 'en';

/**
 * ทุก record ที่แต่งขึ้นเองต้องตั้ง _placeholder: true
 * QA จะ grep หาตัวที่หลุดก่อนส่งมอบ และห้ามมี record ที่ดูเหมือนข้อมูลจริงของบริษัท
 * โดยไม่มีธงนี้
 */
export interface Placeholderable {
  _placeholder?: true;
}

export interface ImageAsset {
  src: string;
  alt: LocalizedText;
  /** srcset สำหรับภาพที่มีหลายความละเอียด เช่น '/a-240.webp 1x, /a.webp 2x' */
  srcSet?: string;
  width?: number;
  height?: number;
  /**
   * ชนิดของภาพ ไม่ใช่วิธีแสดงผล — ค่าเริ่มต้นคือ 'photo'
   *
   * 'diagram' คือผังระบบหรือภาพลายเส้นที่**มีตัวอักษรอยู่ข้างใน** การครอบตัดให้เต็มกรอบ
   * จะตัดป้ายกำกับหายไป ภาพจึงต้องแสดงทั้งภาพเสมอ ส่วนภาพถ่ายครอบตัดได้โดยไม่เสียความหมาย
   * (เก็บเป็นข้อเท็จจริงของภาพ ไม่ใช่ชื่อคลาส CSS เพื่อให้ component เป็นคนตัดสินใจ
   *  ว่าจะแปลงเป็น object-cover หรือ object-contain)
   */
  kind?: 'photo' | 'diagram';
}

/**
 * 7 อุตสาหกรรมแรกคือรายการที่ IDIE ระบุเอง
 * 'epc' และ 'manufacturing' เพิ่มเพื่อรองรับลูกค้าจริงบางรายในหน้า Reference
 * (CTCI, TTCL/Toyo-Thai, Uhde เป็น EPC contractor ไม่ใช่เจ้าของโรงงาน)
 *
 * 'steel-plant' มาจาก Company Profile ฉบับย่อ 2026 ที่ระบุ field of services เป็น
 * "Chemical, Petrochemical, Oil & Gas, Steel plant, Power plant and mining"
 * ส่วน 'fertilizer' ยังอยู่เพราะมาจากเว็บเดิมและมีลูกค้าจริง (Thai Nitrate) ใช้อยู่
 */
export type IndustrySlug =
  | 'petrochemical'
  | 'oil-gas'
  | 'chemical'
  | 'power-plant'
  | 'steel-plant'
  | 'fertilizer'
  | 'mining'
  | 'epc'
  | 'manufacturing';

/* -------------------------------------------------------------------------- */
/* Company                                                                     */
/* -------------------------------------------------------------------------- */

export interface CompanyInfo extends Placeholderable {
  legalName: LocalizedText;
  shortName: string;
  tagline: LocalizedText;
  foundedYear: number | null; // null = ยังไม่ได้รับข้อมูลจาก IDIE
  about: LocalizedText;
  vision: LocalizedText;
  mission: LocalizedText[];
  address: LocalizedText;
  /**
   * ที่อยู่รูปแบบท้ายเว็บ — ขึ้นบรรทัดใหม่ตรงจุดที่เขียน \n ไว้ในค่าจริง
   *
   * แยกจาก `address` เพราะสองที่ต้องการคนละอย่าง: หน้าติดต่อเราและหน้าเกี่ยวกับเรา
   * วางที่อยู่ในคอลัมน์กว้าง จึงอยากได้บรรทัดเดียวที่ปล่อยให้เบราว์เซอร์ตัดเอง
   * ส่วนท้ายเว็บเป็นคอลัมน์แคบที่เจ้าของเว็บกำหนดจุดขึ้นบรรทัดเอง และมีชื่อประเทศ
   * ต่อท้ายสำหรับผู้อ่านต่างชาติ ซึ่งไม่ได้อยู่ใน `address`
   */
  addressFooter: LocalizedText;
  phone: string[];
  email: string[];
  businessHours: LocalizedText;
  mapEmbedUrl: string | null;
  socials: { label: string; url: string }[];
}

export interface Milestone extends Placeholderable {
  year: number;
  title: LocalizedText;
  description: LocalizedText;
}

/** Engineering Statistics (dark section + count-up) */
export interface Stat extends Placeholderable {
  id: string;
  label: LocalizedText;
  value: number;
  suffix?: string; // '+', '%', 'MW'
}

/** Engineering Highlights / Why IDIE */
export interface ValueProp extends Placeholderable {
  id: string;
  icon: string; // ชื่อ icon ใน icon set
  title: LocalizedText;
  description: LocalizedText;
}

/* -------------------------------------------------------------------------- */
/* Services                                                                    */
/* -------------------------------------------------------------------------- */

export interface Service extends Placeholderable {
  slug: string;
  name: LocalizedText;
  shortDescription: LocalizedText;
  overview: LocalizedText;
  /** ขอบเขตงาน — แสดงเป็น list ในหน้า detail */
  scope: LocalizedText[];
  applications: LocalizedText[];
  icon: string;
  /** ไม่มี = ยังไม่ได้รับภาพจาก IDIE — UI จะแสดง ImagePlaceholder แทน */
  cover?: ImageAsset;
  gallery?: ImageAsset[];
  featured?: boolean;
  order: number;
  relatedProjectSlugs?: string[];
}

/* -------------------------------------------------------------------------- */
/* Brands & documents                                                          */
/* -------------------------------------------------------------------------- */

export interface Brand extends Placeholderable {
  id: string;
  name: string;
  logo: ImageAsset;
  country?: string;
  website?: string;
  /**
   * ตราสัญลักษณ์ย่อของผู้ผลิต (แบบ favicon) ใช้ท้ายปุ่มลิงก์ออกไปเว็บของแบรนด์
   *
   * คนละไฟล์กับ `logo` ซึ่งเป็นโลโก้เต็มพร้อมชื่อแบรนด์ — โลโก้เต็มย่อลงเหลือ 16px
   * แล้วอ่านไม่ออก ตราย่อจึงต้องเป็นไฟล์แยกที่ออกแบบมาให้เล็กได้
   */
  siteIcon?: ImageAsset;
}

/**
 * สินค้าหนึ่งรายการ = **เอกสารข้อมูลสินค้าหนึ่งฉบับ**
 *
 * ทั้งชื่อ รหัสรุ่น หมวด และภาพ ถูกดึงออกจากไฟล์ PDF ของผู้ผลิตโดยตรงด้วย
 * `scripts/build-catalog.py` ไม่มีข้อความที่เราแต่งเองแม้แต่คำเดียว — จงใจเป็นแบบนี้
 * เพราะค่าทางเทคนิคของอุปกรณ์พื้นที่อันตรายเป็นสิ่งที่ผู้ซื้อและผู้ตรวจสอบย้อนกลับไป
 * เทียบกับเอกสารต้นทางได้ การเขียนคำโปรยเพิ่มเองจึงเป็นความเสี่ยง ไม่ใช่การตลาด
 *
 * `slug` เป็นตัวเดียวกับ `Datasheet.id` โดยตั้งใจ — ของสองอย่างนี้คือของชิ้นเดียวกัน
 * ที่มองคนละมุม (หน้าสินค้า = ดูว่ามีอะไรขาย · คลังเอกสาร = หาไฟล์ที่จะโหลด)
 */
export interface Product {
  slug: string;
  brandId: string;
  /** slug ของหมวด — ใช้ชุดเดียวกับ `datasheetCategories` */
  category: string;
  /** ชื่อตามที่ผู้ผลิตพิมพ์ไว้บนเอกสาร ไม่ใช่ข้อความที่เราเขียน จึงไม่ใช่ LocalizedText */
  name: string;
  model?: string;
  datasheetUrl: string;
  /**
   * คุณสมบัติที่ผู้ผลิตเขียนไว้เอง — มีเฉพาะสินค้าที่ดึงจากเว็บผู้ผลิต
   * เป็น string ไม่ใช่ LocalizedText เพราะเป็นถ้อยคำของผู้ผลิต ไม่ใช่ของเรา
   */
  features?: string[];
  /** รหัสสัญลักษณ์คุณสมบัติจากเว็บผู้ผลิต เช่น 'ip66', 'ex-bereich' — ดู PRODUCT_ATTRIBUTES */
  attributes?: string[];
  /** หน้าต้นทางบนเว็บผู้ผลิต ใช้อ้างอิงตอนตรวจข้อมูลย้อนหลัง */
  sourceUrl?: string;
  /** ภาพบนการ์ดในหน้ารายการ — ไม่มี = เอกสารนั้นไม่มีภาพที่ใช้ได้เลย */
  card?: { src: string; width: number; height: number };
  /** ภาพทั้งหมดที่ดึงได้จากเอกสาร ทั้งภาพถ่ายและภาพแบบบอกขนาด */
  gallery: ProductImage[];
}

export interface ProductImage {
  src: string;
  width: number;
  height: number;
  /** 'photo' = ภาพถ่ายสินค้า · 'drawing' = ภาพแบบบอกขนาด (ครอบตัดไม่ได้) */
  kind: 'photo' | 'drawing';
}

/**
 * ดาต้าชีตรายรุ่นของผู้ผลิต — คนละอย่างกับ `DownloadItem`
 *
 * `DownloadItem` คือเอกสารไม่กี่ชิ้นที่ผูกกับแบรนด์หรือสินค้าหนึ่งชิ้นและเขียนข้อมูลด้วยมือ
 * ส่วนตัวนี้คือ**คลังเอกสารทั้งชุด**ที่ผู้ผลิตออกให้ ซึ่งมีหลักร้อยรายการและถูกสร้าง
 * ด้วย `scripts/build-datasheets.py` จากไฟล์ PDF โดยตรง ฟิลด์จึงเป็นข้อเท็จจริงของ
 * ตัวไฟล์ล้วน ๆ ไม่มีคำโปรยหรือคำแปลที่ต้องให้คนเขียน
 *
 * `title` เป็น string ไม่ใช่ `LocalizedText` เพราะเป็น**ชื่อเอกสารที่ผู้ผลิตตั้ง**
 * ไม่ใช่ข้อความที่เราเขียน — เหมือน `Brand.name` การแปลชื่อเอกสารเป็นไทยจะทำให้
 * ผู้อ่านหาไฟล์ที่ผู้ผลิตอ้างถึงไม่เจอ ส่วนที่แปลได้คือ**ชื่อหมวด** ซึ่งอยู่ใน
 * `src/data/datasheets.ts`
 */
export interface Datasheet {
  id: string;
  brandId: string;
  /** slug ของหมวด — ชื่อที่แสดงอยู่ใน `datasheetCategories` */
  category: string;
  title: string;
  /** รหัสรุ่นตามที่ผู้ผลิตใช้ ไม่มีในเอกสารบางฉบับ เช่น คู่มือระบบ */
  model?: string;
  /** เลขเอกสารของผู้ผลิต ใช้แยกฉบับที่ชื่อซ้ำกัน (เช่น ฉบับ global กับฉบับสหรัฐฯ) */
  docNo?: string;
  language: 'en' | 'de';
  pages: number;
  sizeKb: number;
  pdfUrl: string;
  /** ภาพหน้าแรกของเอกสาร เรนเดอร์ไว้ล่วงหน้า */
  thumb: { src: string; width: number; height: number };
}

export interface DownloadItem extends Placeholderable {
  label: LocalizedText;
  /** null = ยังไม่ได้รับไฟล์จาก IDIE — UI ต้องแสดงเป็น disabled ไม่ใช่ลิงก์เสีย */
  url: string | null;
  type: 'datasheet' | 'manual' | 'catalog' | 'certificate';
  sizeKb?: number;
}

/* -------------------------------------------------------------------------- */
/* Reference (ใคร) — แยกจาก Project (ทำอะไร) เด็ดขาด                            */
/* -------------------------------------------------------------------------- */

export interface ReferenceCompany extends Placeholderable {
  id: string;
  name: LocalizedText;
  /** โลโก้ควรเป็น SVG หรือ PNG พื้นโปร่ง — alt ต้องเป็นชื่อบริษัท ไม่ใช่ "logo" */
  logo: ImageAsset;
  industry: IndustrySlug;
  website?: string;
  featured?: boolean; // แสดงบน Home (8–12 ราย)
  order: number;
}

/* -------------------------------------------------------------------------- */
/* Projects (ทำอะไร)                                                           */
/* -------------------------------------------------------------------------- */

/**
 * กล่องอ้างอิงหน้างานบนหน้า /reference
 *
 * คนละชุดข้อมูลกับ `Project` — อันนั้นเป็นหน้ารายละเอียดเต็ม อันนี้คือบรรทัดสรุป
 * ที่ตอบว่า "เคยติดตั้งที่ไหน ให้ใคร ทำอะไร" สำหรับคนที่กำลังประเมินผู้รับเหมา
 */
export interface SiteReference {
  id: number;
  name: LocalizedText;
  /** ใส่ "ไม่เปิดเผย / Confidential" ได้ เมื่อลูกค้าไม่อนุญาตให้เอ่ยชื่อ */
  customer: LocalizedText;
  location: LocalizedText;
  image: ImageAsset | null;
}

export interface Project extends Placeholderable {
  slug: string;
  name: LocalizedText;
  /**
   * ชื่อลูกค้าเป็น "ข้อความ" ไม่ใช่ FK ไป ReferenceCompany โดยตั้งใจ —
   * บางโครงการลูกค้าไม่อนุญาตให้เปิดเผยชื่อ (ใช้ 'Confidential' ได้)
   */
  client: LocalizedText;
  industry: IndustrySlug;
  location: LocalizedText;
  year: number | null;
  scopeOfWork: LocalizedText[];
  overview: LocalizedText;
  engineeringSolution: LocalizedText;
  cover: ImageAsset;
  gallery: ImageAsset[];
  featured?: boolean;
  relatedServiceSlugs?: string[];
  relatedProjectSlugs?: string[];
}

/* -------------------------------------------------------------------------- */
/* News / Industries / Careers                                                 */
/* -------------------------------------------------------------------------- */

export type NewsCategory = 'company' | 'project' | 'product' | 'article' | 'event';

export interface NewsArticle extends Placeholderable {
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  /** เก็บเป็น markdown เพื่อให้ย้ายไป CMS แล้วไม่ต้องแปลง */
  body: LocalizedText;
  category: NewsCategory;
  publishedAt: string; // ISO 8601
  cover: ImageAsset;
  featured?: boolean;
}

export interface Industry extends Placeholderable {
  slug: IndustrySlug;
  name: LocalizedText;
  description: LocalizedText;
  icon: string;
  order: number;
}

export interface JobOpening extends Placeholderable {
  slug: string;
  title: LocalizedText;
  department: LocalizedText;
  location: LocalizedText;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  positions: number;
  responsibilities: LocalizedText[];
  qualifications: LocalizedText[];
  postedAt: string; // ISO 8601
  isOpen: boolean;
}

/* -------------------------------------------------------------------------- */
/* Contact form (frontend เท่านั้น — ยังไม่ส่งจริง)                              */
/* -------------------------------------------------------------------------- */

export interface InquiryPayload {
  name: string;
  company: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  /** slug ของสินค้า เมื่อผู้ใช้มาจาก /contact?product=<slug> */
  productContext?: string;
}
