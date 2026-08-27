import { Link } from 'react-router-dom'
import { Badge, ImagePlaceholder } from '@/components/ui'
import { useLocale } from '@/hooks/useLocale'
import type { Product } from '@/types/content'

/**
 * การ์ดสินค้า — ใช้ทั้งหน้า Products และหน้า Product Detail (สินค้าที่เกี่ยวข้อง)
 * จึงอยู่ใน components/sections ไม่ใช่ใต้ pages
 *
 * แสดงรหัสรุ่นเด่นกว่าชื่อเต็ม เพราะฝ่ายจัดซื้อโรงงานค้นและสั่งของด้วยรหัสรุ่น
 * ไม่ใช่ชื่อบรรยาย — และแสดง certification ที่เป็นตัวตัดสินใจซื้อจริงไว้บนการ์ดเลย
 */
export function ProductCard({ product }: { product: Product }) {
  const { t } = useLocale()
  const image = product.gallery[0]

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group border-line bg-surface rounded-card hover:shadow-lift hover:border-primary-200 flex h-full flex-col overflow-hidden border transition-[box-shadow,border-color] duration-(--duration-ui)"
    >
      <span className="bg-surface-alt flex aspect-square items-center justify-center p-6">
        {image ? (
          <img
            src={image.src}
            srcSet={image.srcSet}
            alt={t(image.alt)}
            width={image.width}
            height={image.height}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain transition-transform duration-(--duration-ui) ease-(--ease-out-expo) group-hover:scale-105 motion-reduce:transform-none"
          />
        ) : (
          <ImagePlaceholder
            aspect="aspect-square"
            className="w-full"
            label={`${t(product.name)} (${product.model})`}
            size="1200 × 1200"
          />
        )}
      </span>

      <span className="flex flex-1 flex-col p-5">
        <span className="stat-figure text-primary-600 text-sm font-bold">{product.model}</span>
        <span className="mt-1 font-semibold">{t(product.name)}</span>
        <span className="text-ink-muted mt-2 line-clamp-3 flex-1 text-sm">
          {t(product.shortDescription)}
        </span>

        {product.certifications && product.certifications.length > 0 && (
          <span className="mt-4 flex flex-wrap gap-1.5">
            {product.certifications.slice(0, 3).map((cert) => (
              <Badge key={cert}>{cert}</Badge>
            ))}
          </span>
        )}
      </span>
    </Link>
  )
}
