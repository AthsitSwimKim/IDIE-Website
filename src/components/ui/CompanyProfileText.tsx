import { KeepPhrases } from '@/components/ui/KeepPhrases'

const COMPANY_PHRASES = [
  'พ.ศ. 2549',
  'ก่อตั้ง',
  'ให้บริการ',
  'อุปกรณ์สื่อสาร',
  'สำหรับอุตสาหกรรม',
  'กลุ่มอุตสาหกรรม',
  'การใช้งานทั่วไป',
  'สำนักงาน',
  'เหมืองแร่',
  'วิศวกรรม',
  'จัดจำหน่าย',
  'จัดหาอุปกรณ์',
  'การบูรณาการระบบ',
  '(System Integration)',
  'อินเตอร์คอม',
  '(PA/GA)',
  'ระบบไซเรน',
  'เครือข่าย WAN/LAN',
  'จังหวัดระยอง',
  'น้ำมันและก๊าซ',
  'พื้นที่เสี่ยงระเบิด',
]

/** ข้อความ Company Profile ใช้ชุดวลีเดียวกันทั้งหน้าแรกและหน้าเกี่ยวกับเรา */
export function CompanyProfileText({ children }: { children: string }) {
  const phrases = /[\u0e00-\u0e7f]/.test(children) ? COMPANY_PHRASES : undefined

  return children.split('\n\n').map((paragraph) => (
    <p key={paragraph}>
      <KeepPhrases phrases={phrases}>{paragraph}</KeepPhrases>
    </p>
  ))
}
