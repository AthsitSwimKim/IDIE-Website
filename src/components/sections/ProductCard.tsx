import { Link } from 'react-router-dom'
import type { Product } from '@/types/content'
import { useLocale } from '@/hooks/useLocale'
import { ui } from '@/data'

export interface ProductCardProps {
  product: Product
}

/**
 * การ์ดสินค้าในหน้ารายการ
 *
 * **ภาพเต็มกรอบ ไม่มีช่องไฟสีขาวคั่น** — ไฟล์ภาพการ์ดถูกจัดกรอบมาแล้วตั้งแต่ตอนสร้าง
 * (ดู `scripts/imageframe.py`): ตัดพื้นหลังว่างออก วางสินค้ากลางกรอบจัตุรัสที่มี
 * ช่องไฟเท่ากันทุกใบ และใช้สีพื้นเดิมของภาพเป็นสีกรอบ
 *
 * ที่นี่จึงปล่อยให้ภาพเต็มกล่องพอดี — ถ้าใส่ padding สีขาวเพิ่มอีกชั้น ภาพที่ถ่าย
 * บนพื้นดำจะกลายเป็นสี่เหลี่ยมดำลอยกลางกรอบขาว ซึ่งอ่านเหมือนภาพเสียมากกว่า
 * ภาพถ่ายในกรอบ
 *
 * ไม่มีคำโปรยใต้ชื่อ เพราะเอกสารผู้ผลิตไม่ได้ให้ประโยคสรุปมา และการเขียนเองแปลว่า
 * ต้องเขียน 279 ประโยคที่ไม่มีใครตรวจได้ — สิ่งที่ช่วยผู้อ่านจริงคือรหัสรุ่น ซึ่งอยู่ตรงนั้นแล้ว
 */
export function ProductCard({ product }: ProductCardProps) {
  const { t } = useLocale()

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group focus-visible:outline-primary-600 block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <span className="border-line rounded-card bg-surface-alt block overflow-hidden border transition-shadow duration-(--duration-ui) group-hover:shadow-lift">
        {product.card ? (
          <img
            src={product.card.src}
            alt=""
            width={product.card.width}
            height={product.card.height}
            loading="lazy"
            decoding="async"
            className="block aspect-square w-full object-cover"
          />
        ) : (
          <span className="text-ink-muted flex aspect-square w-full items-center justify-center text-center text-xs">
            {t(ui.products.noImage)}
          </span>
        )}
      </span>

      <span className="mt-3 block text-base leading-snug font-semibold group-hover:underline sm:text-lg">
        {product.name}
      </span>
      {product.model && (
        <span className="stat-figure text-ink-muted mt-1 block text-xs">{product.model}</span>
      )}
    </Link>
  )
}
