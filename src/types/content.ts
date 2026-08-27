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
}

/**
 * 6 อุตสาหกรรมแรกคือรายการที่ IDIE ระบุเองบนเว็บบริษัท
 * 'epc' และ 'manufacturing' เพิ่มเพื่อรองรับลูกค้าจริงบางรายในหน้า Reference
 * (CTCI, TTCL/Toyo-Thai, Uhde เป็น EPC contractor ไม่ใช่เจ้าของโรงงาน)
 */
export type IndustrySlug =
  | 'petrochemical'
  | 'oil-gas'
  | 'chemical'
  | 'power-plant'
  | 'fertilizer'
  | 'mining'
  | 'epc'
  | 'manufacturing';

/**
 * แกนที่ฝ่ายจัดซื้อในโรงงานปิโตรเคมีมองหาก่อนอย่างอื่น และเป็นแกนที่ catalog
 * ของผู้ผลิตใช้แบ่งสินค้าเป็นหลัก — ต้องเป็น filter ชั้นแรกบนหน้า /products
 */
export type ProductArea = 'hazardous-area' | 'industrial' | 'marine-offshore';

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

export interface Certificate extends Placeholderable {
  id: string;
  name: LocalizedText;
  issuer: LocalizedText;
  year: number | null;
  /**
   * ขอบเขตที่หนังสือฉบับนั้นรับรอง — **ต้องสรุปตามถ้อยคำในเอกสารจริงเท่านั้น**
   * ห้ามขยายความให้ดูกว้างกว่าที่เขียนไว้ เพราะเป็นข้อความที่ลูกค้าใช้ตัดสินใจ
   * และผู้ผลิตตรวจสอบได้
   */
  scope?: LocalizedText;
  /**
   * `active` = เอกสารยังมีผล · `expired` = หมดอายุตามที่ระบุในเอกสารเอง
   * ใช้บอกสถานะเท่านั้น ไม่ได้ใช้ซ่อนเอกสาร — ฉบับที่หมดอายุก็แสดงได้
   * ตราบใดที่คำบรรยายระบุวันหมดอายุตามที่พิมพ์บนเอกสารไว้ชัด
   */
  status: 'active' | 'expired';
  image?: ImageAsset;
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
  cover: ImageAsset;
  gallery?: ImageAsset[];
  featured?: boolean;
  order: number;
  relatedProjectSlugs?: string[];
  relatedProductCategorySlugs?: string[];
}

/* -------------------------------------------------------------------------- */
/* Products                                                                    */
/* -------------------------------------------------------------------------- */

export interface ProductCategory extends Placeholderable {
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  cover: ImageAsset;
  featured?: boolean;
  order: number;
}

export interface Brand extends Placeholderable {
  id: string;
  name: string;
  logo: ImageAsset;
  country?: string;
  website?: string;
}

export interface SpecRow {
  label: LocalizedText;
  value: LocalizedText;
}

export interface DownloadItem extends Placeholderable {
  label: LocalizedText;
  /** null = ยังไม่ได้รับไฟล์จาก IDIE — UI ต้องแสดงเป็น disabled ไม่ใช่ลิงก์เสีย */
  url: string | null;
  type: 'datasheet' | 'manual' | 'catalog' | 'certificate';
  sizeKb?: number;
}

/** จุดอธิบาย feature บนโมเดล 3D — ตำแหน่งเป็นพิกัดในระบบของโมเดล */
export interface Hotspot {
  id: string;
  position: [number, number, number];
  title: LocalizedText;
  description: LocalizedText;
}

export interface Product extends Placeholderable {
  slug: string;
  name: LocalizedText;
  model: string;
  brandId: string;
  categorySlug: string;
  area: ProductArea[];
  /** มาตรฐาน/ใบรับรอง เช่น 'ATEX', 'IECEx', 'IP66', 'Ex d IIC T6' — เป็นจุดตัดสินใจซื้อจริง */
  certifications?: string[];
  shortDescription: LocalizedText;
  overview: LocalizedText;
  features: LocalizedText[];
  applications: LocalizedText[];
  specs: SpecRow[];
  gallery: ImageAsset[]; // fallback ของ 3D viewer — ต้องมีเสมอ
  /** path ไป .glb; ไม่มี = แสดง gallery อย่างเดียว ไม่ต้องมีปุ่ม 3D */
  model3dUrl?: string;
  hotspots?: Hotspot[];
  downloads?: DownloadItem[];
  featured?: boolean;
  /** keyword เสริมสำหรับ search — ชื่อเรียกในโรงงาน, คำพ้อง, ตัวสะกดอื่น */
  searchKeywords?: string[];
}

export interface ProductFilter {
  categorySlug?: string;
  brandId?: string;
  area?: ProductArea;
  query?: string;
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
