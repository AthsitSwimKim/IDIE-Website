import nodemailer from 'nodemailer'
import { env } from './env.ts'

/**
 * ตัวส่งอีเมลของแบบฟอร์มติดต่อ
 *
 * **ตั้งค่าไม่ครบ = ไม่ส่ง แต่ไม่ล้ม** — ต่างจากการต่อฐานข้อมูลที่ถ้าต่อไม่ได้
 * เซิร์ฟเวอร์ต้องตายตั้งแต่บูต เพราะทั้งเว็บพึ่งฐานข้อมูล แต่การส่งอีเมลกระทบแค่
 * ฟอร์มเดียว การบังคับให้มี SMTP ก่อนถึงจะรันได้ จะทำให้คนที่แค่อยากดูเว็บ
 * ในเครื่องตัวเองต้องไปหาบัญชีอีเมลมาก่อน ซึ่งไม่สมเหตุสมผล
 *
 * คำถามยังถูกบันทึกลงตาราง `inquiries` เสมอไม่ว่าอีเมลจะส่งได้หรือไม่ —
 * ตรงนี้จึงเป็น "ช่องทางแจ้งเตือน" ไม่ใช่ "ที่เก็บข้อมูล"
 */

const configured = Boolean(env.mail.host && env.mail.user && env.mail.to)

export const mailEnabled = configured

const transporter = configured
  ? nodemailer.createTransport({
      host: env.mail.host,
      port: env.mail.port,
      // port 465 คือ SMTPS ที่เข้ารหัสตั้งแต่เริ่มเชื่อมต่อ ส่วน 587 เริ่มแบบธรรมดา
      // แล้วยกระดับด้วย STARTTLS — nodemailer ใช้ค่านี้ตัดสินว่าจะทำแบบไหน
      secure: env.mail.port === 465,
      auth: { user: env.mail.user, pass: env.mail.password },
    })
  : null

export interface InquiryMail {
  name: string
  company?: string | undefined
  email: string
  phone?: string | undefined
  subject: string
  message: string
  locale: 'th' | 'en'
}

/**
 * ส่งคำถามไปยังกล่องจดหมายของ IDIE
 *
 * โยน error ออกไปเมื่อส่งไม่สำเร็จ เพื่อให้ผู้เรียกบันทึกสาเหตุลงฐานข้อมูลได้
 * ไม่กลืนไว้เงียบ ๆ
 */
export async function sendInquiry(inquiry: InquiryMail): Promise<void> {
  if (!transporter) throw new Error('ยังไม่ได้ตั้งค่า SMTP')

  const rows: [string, string][] = [
    ['ชื่อผู้ติดต่อ', inquiry.name],
    ['บริษัท', inquiry.company || '—'],
    ['อีเมล', inquiry.email],
    ['โทรศัพท์', inquiry.phone || '—'],
    ['เรื่อง', inquiry.subject],
    ['ภาษาที่ใช้กรอก', inquiry.locale === 'th' ? 'ไทย' : 'English'],
  ]

  const text = [
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'รายละเอียด:',
    inquiry.message,
    '',
    '— ส่งอัตโนมัติจากแบบฟอร์มติดต่อบนเว็บไซต์ idindustrial.com',
  ].join('\n')

  await transporter.sendMail({
    from: env.mail.from,
    to: env.mail.to,
    /**
     * `replyTo` เป็นอีเมลของผู้ถาม ไม่ใช่ของระบบ — ทีมงานกดตอบกลับในโปรแกรมอีเมล
     * ได้ทันทีโดยไม่ต้องคัดลอกที่อยู่จากเนื้อจดหมาย ซึ่งเป็นจุดที่พิมพ์ผิดกันบ่อย
     *
     * ส่วน `from` ต้องเป็นบัญชีของเราเสมอ ถ้าใส่อีเมลผู้ถามลงไปตรง ๆ
     * จดหมายจะไม่ผ่าน SPF/DKIM ของโดเมนเขาแล้วตกถังขยะหรือถูกปฏิเสธ
     */
    replyTo: `${inquiry.name} <${inquiry.email}>`,
    subject: `[เว็บไซต์] ${inquiry.subject} — ${inquiry.name}`,
    text,
  })
}
