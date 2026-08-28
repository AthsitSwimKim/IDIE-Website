import { env } from '../src/env.ts'
import { mailEnabled, sendInquiry } from '../src/mailer.ts'

/**
 * ยิงอีเมลทดสอบหนึ่งฉบับด้วยค่าใน `server/.env` ที่ใช้อยู่จริง
 *
 *   cd server && npm run test-mail
 *
 * มีไว้เพราะ **ปัญหาการตั้งค่า SMTP มักไม่บอกสาเหตุตรง ๆ** — ถ้าไปเจอตอนมีลูกค้า
 * กรอกฟอร์มจริง สิ่งที่เห็นคือหน้าเว็บขึ้นข้อความ error กลาง ๆ แล้วต้องไปไล่หา
 * ใน log ของเซิร์ฟเวอร์ สคริปต์นี้ย่นขั้นตอนนั้นเหลือคำสั่งเดียวและแปลรหัส error
 * ที่พบบ่อยเป็นคำอธิบายว่าต้องไปแก้อะไร
 */

function line(label: string, value: string) {
  console.log(`  ${label.padEnd(14)} ${value}`)
}

async function main() {
  console.log('\nค่าที่กำลังใช้อยู่')
  line('SMTP_HOST', env.mail.host || '(ว่าง)')
  line('SMTP_PORT', String(env.mail.port))
  line('SMTP_USER', env.mail.user || '(ว่าง)')
  line('SMTP_PASSWORD', env.mail.password ? `กรอกแล้ว ${env.mail.password.length} ตัวอักษร` : '(ว่าง)')
  line('MAIL_FROM', env.mail.from || '(ว่าง)')
  line('MAIL_TO', env.mail.to || '(ว่าง)')
  console.log()

  if (!mailEnabled) {
    console.error('ยังตั้งค่าไม่ครบ — ต้องมีอย่างน้อย SMTP_HOST, SMTP_USER และ MAIL_TO')
    process.exit(1)
  }

  if (env.mail.host === '127.0.0.1' || env.mail.host === 'localhost') {
    console.warn('หมายเหตุ: SMTP_HOST ชี้มาที่เครื่องตัวเอง')
    console.warn('อีเมลจะไปที่ตัวดักจดหมายในเครื่อง ไม่ได้ออกไปถึงปลายทางจริง\n')
  }

  const stamp = new Date().toLocaleString('th-TH')

  try {
    await sendInquiry({
      name: 'ทดสอบระบบส่งอีเมล',
      company: 'IDIE Website',
      email: env.mail.to,
      phone: '-',
      subject: `ทดสอบระบบ ${stamp}`,
      message:
        'นี่คืออีเมลทดสอบจากสคริปต์ npm run test-mail\n' +
        'ถ้าคุณได้รับฉบับนี้ แปลว่าแบบฟอร์มติดต่อบนเว็บไซต์ส่งอีเมลได้แล้ว',
      locale: 'th',
    })
    console.log(`ส่งสำเร็จ — ตรวจกล่องจดหมายของ ${env.mail.to}`)
    console.log('ถ้าไม่เจอในกล่องหลัก ให้ดูในโฟลเดอร์สแปมหรือจดหมายขยะด้วย')
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause)
    console.error(`\nส่งไม่สำเร็จ: ${message}\n`)
    console.error(explain(message))
    process.exit(1)
  }
}

/**
 * แปลข้อความ error ของ SMTP เป็นสิ่งที่ต้องไปแก้
 *
 * ข้อความดิบจากเซิร์ฟเวอร์เมลเขียนสำหรับคนดูแลระบบเมล ไม่ใช่คนตั้งค่าเว็บ
 * เช่น "535-5.7.8 Username and Password not accepted" ซึ่งอ่านแล้วยังไม่รู้ว่า
 * ต้องไปสร้าง App password ที่ไหน
 */
function explain(message: string): string {
  const m = message.toLowerCase()

  if (m.includes('invalid login') || m.includes('535') || m.includes('authentication')) {
    return [
      'บัญชีหรือรหัสผ่านไม่ถูกต้อง',
      '',
      'ถ้าใช้ Gmail: รหัสผ่านปกติของบัญชีใช้ไม่ได้ ต้องใช้ "App password" เท่านั้น',
      '  1. เปิด 2-Step Verification ที่ https://myaccount.google.com/security',
      '  2. สร้าง App password ที่ https://myaccount.google.com/apppasswords',
      '  3. เอารหัส 16 หลักที่ได้มาใส่ SMTP_PASSWORD (ตัดช่องว่างออกให้หมด)',
    ].join('\n')
  }

  if (m.includes('econnrefused') || m.includes('etimedout') || m.includes('enotfound')) {
    return [
      'ต่อเซิร์ฟเวอร์เมลไม่ได้',
      '',
      '- ตรวจว่า SMTP_HOST สะกดถูก',
      '- พอร์ตที่ใช้กันคือ 587 (STARTTLS) หรือ 465 (SSL) — ลองสลับดู',
      '- บางเครือข่ายองค์กรบล็อกพอร์ตขาออกเหล่านี้ ต้องให้ฝ่ายไอทีเปิดให้',
    ].join('\n')
  }

  if (m.includes('self signed') || m.includes('certificate')) {
    return 'ใบรับรอง TLS ของเซิร์ฟเวอร์เมลมีปัญหา — ถ้าเป็นเมลเซิร์ฟเวอร์ภายในองค์กร ให้ถามฝ่ายไอทีว่าต้องตั้งค่าอย่างไร'
  }

  return 'ดูข้อความด้านบนประกอบ และตรวจค่าใน server/.env อีกครั้ง'
}

main()
