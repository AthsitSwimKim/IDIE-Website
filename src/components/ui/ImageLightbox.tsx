import type { ImageAsset } from '@/types/content'
import { Lightbox } from '@/components/ui/Lightbox'
import { useLocale } from '@/hooks/useLocale'

export interface ImageLightboxProps {
  /** ภาพที่จะแสดงเต็มจอ — `null` = ปิดอยู่ */
  image: ImageAsset | null
  onClose: () => void
}

/**
 * ป๊อปอัปดูภาพขนาดเต็ม (ใช้กับเอกสารหนังสือแต่งตั้งในหน้า About)
 *
 * พฤติกรรมของหน้าต่าง (Esc, ล็อก scroll, คลิกพื้นหลังปิด, ปุ่มปิด) อยู่ใน <Lightbox>
 * ไฟล์นี้เหลือแค่เรื่องของ "ภาพ" อย่างเดียว
 *
 * โหลด `src` ตรง ๆ ไม่ใส่ `srcSet` โดยตั้งใจ — srcSet ของภาพย่อจะเลือกไฟล์ 720px
 * ซึ่งเล็กเกินไปสำหรับการอ่านตัวหนังสือบนเอกสาร ป๊อปอัปนี้ต้องได้ไฟล์เต็มเสมอ
 */
export function ImageLightbox({ image, onClose }: ImageLightboxProps) {
  const { t } = useLocale()

  return (
    <Lightbox open={!!image} onClose={onClose} label={image ? t(image.alt) : ''}>
      {image && (
        /*
          `alt=""` โดยตั้งใจ — คำบรรยายเต็มถูกใช้เป็นชื่อของ dialog ไปแล้ว
          ถ้าใส่ alt ซ้ำ screen reader จะอ่านประโยคเดียวกันสองรอบติดกัน
          (ชื่อหน้าต่างตอนเปิด แล้วตามด้วยภาพ) ภาพนี้จึงเป็นภาพประกอบของหน้าต่างที่ถูกตั้งชื่อแล้ว

          max-h เผื่อที่ให้แถวปุ่มปิดด้านบน (44px + ช่องไฟ) ไม่งั้นภาพสูงเต็มจอจะดันปุ่มหลุดขอบ
        */
        <img
          src={image.src}
          alt=""
          width={image.width}
          height={image.height}
          className="mx-auto block h-auto max-h-[76dvh] w-auto max-w-full object-contain"
        />
      )}
    </Lightbox>
  )
}
