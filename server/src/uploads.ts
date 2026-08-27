import { randomBytes } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import multer from 'multer'
import sharp from 'sharp'
import { env } from './env.ts'
import { badRequest } from './http.ts'

/**
 * รับรูปที่แอดมินอัปโหลด แล้วแปลงเป็น WebP สองความละเอียดก่อนเก็บลงดิสก์
 *
 * **ไม่เก็บไฟล์ต้นฉบับตามที่ผู้ใช้ส่งมา** ด้วยเหตุผลสามข้อ:
 *
 * 1. รูปจากกล้องหรือมือถือมักกว้าง 4000px และหนัก 5–8 MB ซึ่งเกินงบของโครงการ
 *    (ภาพใหญ่สุด ≤ 250 KB) ถ้าเก็บดิบ ๆ หน้าเว็บจะช้าลงทันทีที่มีคนลงข่าวแรก
 * 2. ทั้งเว็บใช้ WebP + srcSet สองความละเอียดอยู่แล้ว รูปที่ลงผ่านแอดมินต้อง
 *    เข้าชุดกัน ไม่ใช่เป็น JPEG ก้อนเดียวที่ดูต่างจากรูปอื่นบนหน้าเดียวกัน
 * 3. ไฟล์ที่ผู้ใช้อัปโหลดคือข้อมูลที่ไม่น่าเชื่อถือ การให้ sharp ถอดรหัสแล้ว
 *    เข้ารหัสใหม่ ทำให้สิ่งที่ตกถึงดิสก์เป็นรูปจริงเสมอ ไม่ใช่ไฟล์ที่แค่ตั้งชื่อ .jpg
 *    (พร้อมกับตัด EXIF ที่อาจมีพิกัด GPS ของหน้างานติดมาด้วย)
 */

/** ความกว้างของไฟล์ 2x — พอสำหรับปกข่าวและภาพผลงานเต็มความกว้างคอนเทนต์ */
const WIDTH_2X = 1600
/** ความกว้างของไฟล์ 1x */
const WIDTH_1X = 800

/**
 * เก็บไว้ในหน่วยความจำก่อน ไม่เขียนลงดิสก์ทันที
 *
 * เพราะไฟล์ที่ผู้ใช้ส่งมาจะถูกทิ้งอยู่ดีหลังแปลงเป็น WebP แล้ว การเขียนลงดิสก์
 * ก่อนแล้วค่อยลบทีหลังเปิดช่องให้มีไฟล์ขยะค้างเมื่อการแปลงล้มกลางทาง
 */
export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.uploads.maxBytes, files: 1 },
  fileFilter(_req, file, callback) {
    // ด่านแรกเท่านั้น — mimetype มาจากเบราว์เซอร์จึงปลอมได้ ด่านจริงคือ sharp
    // ที่จะโยน error ถ้าเนื้อไฟล์ไม่ใช่รูป
    if (!file.mimetype.startsWith('image/')) {
      callback(badRequest('อัปโหลดได้เฉพาะไฟล์รูปภาพ'))
      return
    }
    callback(null, true)
  },
})

export interface StoredImage {
  src: string
  srcSet?: string
  width: number
  height: number
}

/**
 * ตั้งชื่อไฟล์จากค่าสุ่ม ไม่ใช่ชื่อไฟล์เดิมของผู้ใช้
 *
 * ชื่อเดิมอาจมีอักษรไทย เว้นวรรค `..` หรืออักขระที่ระบบไฟล์บนเซิร์ฟเวอร์คนละตัว
 * ปฏิบัติไม่เหมือนกัน และการเดาชื่อไฟล์ของคนอื่นไม่ได้ก็เป็นผลพลอยได้ที่ดี
 */
function randomBaseName() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return `${stamp}-${randomBytes(8).toString('hex')}`
}

export async function storeImage(buffer: Buffer): Promise<StoredImage> {
  await mkdir(env.uploads.dir, { recursive: true })

  const source = sharp(buffer, { failOn: 'error' })

  let width: number | undefined
  let height: number | undefined
  try {
    const metadata = await source.metadata()
    width = metadata.width
    height = metadata.height
  } catch {
    throw badRequest('ไฟล์นี้ไม่ใช่รูปภาพที่อ่านได้')
  }

  if (!width || !height) throw badRequest('อ่านขนาดของรูปไม่ได้')

  const base = randomBaseName()

  /**
   * `withoutEnlargement` สำคัญ — ถ้ารูปต้นฉบับเล็กกว่าเป้าหมาย การขยายจะได้ภาพเบลอ
   * ที่ไฟล์ใหญ่กว่าเดิมโดยไม่ได้รายละเอียดเพิ่มขึ้นเลย
   */
  const render = (targetWidth: number) =>
    sharp(buffer, { failOn: 'error' })
      .rotate() // ใช้ EXIF orientation ก่อนที่จะตัด EXIF ทิ้ง ไม่งั้นรูปจากมือถือจะตะแคง
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true })

  const large = await render(WIDTH_2X)
  await writeFile(join(env.uploads.dir, `${base}.webp`), large.data)

  const result: StoredImage = {
    src: `/uploads/${base}.webp`,
    width: large.info.width,
    height: large.info.height,
  }

  // สร้างไฟล์ 1x เฉพาะเมื่อรูปใหญ่พอที่จะมีสองความละเอียดจริง ๆ
  // ไม่งั้นจะได้ไฟล์สองไฟล์ที่เหมือนกันเป๊ะ กินที่ดิสก์เปล่า ๆ
  if (large.info.width > WIDTH_1X) {
    const small = await render(WIDTH_1X)
    await writeFile(join(env.uploads.dir, `${base}-${WIDTH_1X}.webp`), small.data)
    result.srcSet = `/uploads/${base}-${WIDTH_1X}.webp 1x, /uploads/${base}.webp 2x`
  }

  return result
}
