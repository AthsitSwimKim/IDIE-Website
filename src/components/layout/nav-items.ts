import type { LocalizedText } from '@/types/content'
import { ui } from '@/data'

export interface NavItem {
  to: string
  label: LocalizedText
  end?: boolean
  children?: NavItem[]
}

/**
 * เมนูหลัก — แหล่งเดียวที่ Header, Mobile menu และ Footer ใช้ร่วมกัน
 *
 * Projects อยู่ใน dropdown ใต้ Reference เพราะทั้งคู่ตอบคำถามเดียวกันว่า
 * "เคยทำให้ใครมาแล้วบ้าง" ทำให้ header ไม่แน่นและผู้ใช้ยังหาเจอ
 *
 * Brands เคยอยู่ใน dropdown ใต้ Products — พอ IDIE สั่งถอดหน้าสินค้าออก (ก.ย. 2026)
 * ตัวเปิด dropdown ก็หายไปด้วย Brands จึงขึ้นมาเป็นเมนูหลักแทน ซึ่งตรงกับความจริง
 * ที่ตอนนี้เป็นทางเข้าเดียวของทั้งข้อมูลแบรนด์และคลังเอกสารข้อมูลสินค้า
 */
export const navItems: NavItem[] = [
  { to: '/', label: ui.nav.home, end: true },
  { to: '/about', label: ui.nav.about },
  { to: '/services', label: ui.nav.services },
  {
    to: '/products',
    label: ui.nav.products,
    children: [
      { to: '/products', label: ui.nav.products, end: true },
      { to: '/brands', label: ui.nav.brands },
    ],
  },
  {
    to: '/reference',
    label: ui.nav.reference,
    children: [
      { to: '/reference', label: ui.nav.reference, end: true },
      { to: '/projects', label: ui.nav.projects },
    ],
  },
  { to: '/news', label: ui.nav.news },
  { to: '/careers', label: ui.nav.careers },
  { to: '/contact', label: ui.nav.contact },
]

/** คอลัมน์เมนูใน footer — จัดกลุ่มตามความตั้งใจของผู้ใช้ ไม่ใช่ตามลำดับ header */
export const footerColumns: { heading: LocalizedText; items: NavItem[] }[] = [
  {
    heading: ui.footer.exploreHeading,
    items: [
      { to: '/services', label: ui.nav.services },
      { to: '/products', label: ui.nav.products },
      { to: '/brands', label: ui.nav.brands },
    ],
  },
  {
    heading: ui.footer.companyHeading,
    items: [
      { to: '/about', label: ui.nav.about },
      { to: '/reference', label: ui.nav.reference },
      { to: '/projects', label: ui.nav.projects },
      { to: '/news', label: ui.nav.news },
      { to: '/careers', label: ui.nav.careers },
    ],
  },
]
