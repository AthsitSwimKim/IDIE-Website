import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import type { ResultSetHeader } from 'mysql2'
import { hashPassword } from '../src/auth.ts'
import { closePool, pool } from '../src/db.ts'

/**
 * สร้างบัญชีแอดมินจากบรรทัดคำสั่ง
 *
 *   cd server && npm run create-user
 *
 * **ยังจำเป็นแม้จะมีหน้า "บัญชีผู้ใช้" ในระบบแล้ว** — หน้านั้นอยู่หลังการล็อกอิน
 * จึงใช้ได้เฉพาะตอนที่ยังมีคนเข้าระบบได้ สคริปต์นี้คือทางเดียวของอีกสองกรณีที่เหลือ
 * คือสร้างบัญชีแรกตอนติดตั้ง และตอนที่ทุกคนลืมรหัสจนไม่มีใครเข้าหลังบ้านได้เลย
 *
 * ที่ยังไม่มีคือ**หน้าสมัครสมาชิกแบบเปิดสาธารณะ** — หน้าสมัครที่เปิดทิ้งไว้บน
 * อินเทอร์เน็ตคือช่องให้ใครก็ได้สร้างบัญชีที่แก้เนื้อหาเว็บบริษัทได้
 *
 * รับรหัสผ่านทาง prompt ไม่ใช่ argument เพราะ argument จะติดอยู่ใน shell history
 * และเห็นได้จาก `ps` ของผู้ใช้อื่นบนเครื่องเดียวกัน
 */

const MIN_PASSWORD_LENGTH = 12

interface Credentials {
  username: string
  displayName: string
  password: string
}

/**
 * รับค่าจาก environment เมื่อ stdin ไม่ใช่ terminal
 *
 * **จำเป็นเพราะ readline เงียบเมื่อ stdin เป็น pipe** — `question()` จะไม่ resolve
 * หลัง stdin ปิด แล้ว event loop ว่างจนโปรเซสจบด้วย exit 0 ทั้งที่ยังไม่ได้สร้างบัญชี
 * ใครที่เอาสคริปต์นี้ไปใส่ขั้นตอนติดตั้งอัตโนมัติจะเห็นว่า "สำเร็จ" แล้วไปเจอทีหลัง
 * ว่าล็อกอินไม่ได้ — จึงต้องแยกทางเดินให้ชัดและล้มเสียงดังถ้าค่าไม่ครบ
 */
function fromEnv(): Credentials {
  const username = process.env.ADMIN_USERNAME?.trim() ?? ''
  const displayName = process.env.ADMIN_DISPLAY_NAME?.trim() ?? ''
  const password = process.env.ADMIN_PASSWORD ?? ''

  if (!username || !displayName || !password) {
    throw new Error(
      'stdin ไม่ใช่ terminal จึงถามทีละข้อไม่ได้ — ส่งค่าผ่าน environment แทน:\n' +
        '  ADMIN_USERNAME=somchai ADMIN_DISPLAY_NAME="สมชาย" ADMIN_PASSWORD=... npm run create-user',
    )
  }
  return { username, displayName, password }
}

async function fromPrompt(): Promise<Credentials> {
  const rl = createInterface({ input: stdin, output: stdout })
  try {
    const username = (await rl.question('ชื่อผู้ใช้ (a-z, 0-9, จุด, ขีดล่าง): ')).trim()
    const displayName = (await rl.question('ชื่อที่แสดงในระบบ: ')).trim()
    const password = await rl.question(`รหัสผ่าน (อย่างน้อย ${MIN_PASSWORD_LENGTH} ตัว): `)
    const confirm = await rl.question('พิมพ์รหัสผ่านอีกครั้ง: ')

    if (password !== confirm) throw new Error('รหัสผ่านสองครั้งไม่ตรงกัน')
    return { username, displayName, password }
  } finally {
    rl.close()
  }
}

async function main() {
  try {
    // `isTTY` เป็น undefined เมื่อ stdin ถูก redirect มาจาก pipe หรือไฟล์
    const { username, displayName, password } = stdin.isTTY
      ? await fromPrompt()
      : fromEnv()

    if (!/^[a-z0-9._-]{3,64}$/.test(username)) {
      throw new Error('ชื่อผู้ใช้ต้องยาว 3–64 ตัว ใช้ได้เฉพาะ a-z 0-9 . _ -')
    }
    if (!displayName) throw new Error('ต้องระบุชื่อที่แสดง')
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`รหัสผ่านสั้นเกินไป ต้องอย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร`)
    }

    const passwordHash = await hashPassword(password)

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (username, display_name, password_hash) VALUES (?, ?, ?)',
      [username, displayName, passwordHash],
    )

    console.log(`\nสร้างบัญชี "${username}" เรียบร้อย (id ${result.insertId})`)
  } finally {
    await closePool()
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(
    message.includes('ER_DUP_ENTRY') ? '\nมีชื่อผู้ใช้นี้ในระบบแล้ว' : `\n${message}`,
  )
  process.exit(1)
})
