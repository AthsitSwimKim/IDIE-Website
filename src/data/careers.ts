import type { JobOpening } from '@/types/content'
import { contactPerson } from '@/data/company'

/** อีเมลรับสมัครงานตามที่ระบุบนหน้า Job ของเว็บเดิม */
export const careersEmail = contactPerson.email

/**
 * ประกาศรับสมัครงานจริงจากหน้า Job ของเว็บบริษัท (ดึง 18 ส.ค. 2026)
 * ข้อความต้นฉบับเป็นภาษาอังกฤษ — ฉบับไทยเป็นคำแปลร่าง TODO: confirm with IDIE
 *
 * เว็บเดิมไม่ระบุวันที่ประกาศและจำนวนอัตรา — postedAt ใช้วันที่ดึงข้อมูล
 * และ positions ตั้งเป็น 0 เพื่อให้ UI ซ่อนตัวเลขแทนการแสดงจำนวนที่แต่งขึ้น
 */
export const jobOpenings: JobOpening[] = [
  {
    slug: 'sales-engineer',
    title: { th: 'วิศวกรฝ่ายขาย', en: 'Sales Engineer' },
    department: { th: 'ฝ่ายขายและวิศวกรรม', en: 'Sales & Engineering' },
    location: { th: 'ระยอง', en: 'Rayong' },
    employmentType: 'full-time',
    positions: 0,
    responsibilities: [
      {
        th: 'ดูแลลูกค้าโรงงานอุตสาหกรรมและนำเสนอระบบสื่อสารและสัญญาณเตือนภัย',
        en: 'Serve industrial plant customers and present communication and signalling systems.',
      },
      {
        th: 'ประสานงานกับผู้ผลิตในยุโรปและสหรัฐฯ เพื่อจัดหาอุปกรณ์ให้ตรงสเปก',
        en: 'Coordinate with European and US manufacturers to source equipment to specification.',
      },
    ],
    qualifications: [
      {
        th: 'จบวิศวกรรมไฟฟ้าหรือสาขาที่เกี่ยวข้อง',
        en: 'Degree in Electrical Engineering or a related field.',
      },
      {
        th: 'มีประสบการณ์ด้านระบบอินเตอร์คอม PA/GA ระบบโทรศัพท์ และ CCTV',
        en: 'Experience in intercom, PA/GA system, telephone system and CCTV.',
      },
      { th: 'สื่อสารภาษาอังกฤษได้ดี', en: 'Fluent in English.' },
      { th: 'ประสบการณ์ 1–2 ปี', en: '1–2 years of experience.' },
    ],
    postedAt: '2026-08-18',
    isOpen: true,
  },
  {
    slug: 'electrical-engineer',
    title: { th: 'วิศวกรไฟฟ้า', en: 'Electrical Engineer' },
    department: { th: 'ฝ่ายวิศวกรรม', en: 'Engineering' },
    location: { th: 'ระยอง', en: 'Rayong' },
    employmentType: 'full-time',
    positions: 0,
    responsibilities: [
      {
        th: 'ออกแบบและติดตั้งระบบสื่อสารและสัญญาณเตือนภัยในพื้นที่โรงงาน',
        en: 'Design and install communication and signalling systems in plant areas.',
      },
      {
        th: 'ทดสอบระบบและให้บริการหลังการขาย',
        en: 'Commission systems and provide after-sales service.',
      },
    ],
    qualifications: [
      {
        th: 'จบวิศวกรรมไฟฟ้าหรือสาขาที่เกี่ยวข้อง',
        en: 'Degree in Electrical Engineering or a related field.',
      },
      {
        th: 'มีประสบการณ์ด้านระบบอินเตอร์คอม PA/GA ระบบโทรศัพท์ และ CCTV',
        en: 'Experience in intercom, PA/GA system, telephone system and CCTV.',
      },
      { th: 'สื่อสารภาษาอังกฤษได้ดี', en: 'Fluent in English.' },
      { th: 'ประสบการณ์ 1–2 ปี', en: '1–2 years of experience.' },
    ],
    postedAt: '2026-08-18',
    isOpen: true,
  },
]
