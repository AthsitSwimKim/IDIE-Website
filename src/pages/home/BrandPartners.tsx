import { Link } from 'react-router-dom'
import { Button, Heading, Reveal, Section } from '@/components/ui'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getBrands, sourcingStatement, ui } from '@/data'
import { cn } from '@/utils/cn'

/**
 * แบรนด์คู่ค้า — Home section
 *
 * เว็บเดิมของบริษัทให้ความสำคัญกับส่วนนี้บนหน้าแรก พร้อมประโยค
 * "We supplies only good quality product from Europe or USA, Our partner are as below."
 * เพราะ IDIE เป็น engineering + distributor — ความน่าเชื่อถือส่วนหนึ่งมาจาก
 * การเป็นตัวแทนของผู้ผลิตยุโรปที่ฝ่ายวิศวกรรมของลูกค้ารู้จักอยู่แล้ว
 *
 * ใช้ block แบบเดียวกับ logo wall ในหน้า Reference: กล่อง aspect-3/2 มีเส้นขอบ,
 * object-contain และแสดงสีเต็มตั้งแต่แรก (เหมือนกันทั้งสองที่)
 * hover แค่ขยายเล็กน้อย ไม่เปลี่ยนสี
 *
 * คำอธิบายรายแบรนด์ (brandBlurbs) ยังอยู่ใน data layer สำหรับใช้บนหน้า Products
 * แต่ไม่แสดงที่นี่ เพื่อให้ block สะอาดเหมือนหน้า Reference
 */
export function BrandPartners() {
  const { t } = useLocale()
  const { data: brands } = useAsyncData(getBrands)

  if (!brands?.length) return null

  return (
    <Section tone="alt" id="brands">
      {/* items-start กัน flex-col ยืดปุ่มให้เต็มความกว้างบนจอแคบ */}
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <Heading level={2} eyebrow="OUR BRAND PARTNERS">
            {t(ui.home.brandsTitle)}
          </Heading>
          <p className="text-ink-muted mt-4">{t(sourcingStatement)}</p>
        </div>
        <Button to="/products" variant="outline" withArrow className="shrink-0">
          {t(ui.nav.products)}
        </Button>
      </div>

      {/*
        จำกัดความกว้างไว้เพื่อให้ขนาดกล่องใกล้เคียงกับ logo wall ในหน้า Reference
        (ที่นั่นเป็น 5 คอลัมน์เต็มความกว้าง) ถ้าปล่อยให้ 3 กล่องกินเต็มจอ
        กล่องจะใหญ่กว่าฝั่ง Reference มากจนดูเป็นคนละระบบ
      */}
      <ul className="mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
        {brands.map((brand, index) => (
          <li key={brand.id}>
            <Reveal delay={index * 70}>
              {/* Link ไม่ใช่ <a> — ไม่งั้นกดแล้วโหลดหน้าใหม่ทั้งหน้า */}
              <Link to={`/products?brand=${brand.id}`} className="group block">
                <span
                  className={cn(
                    'border-line bg-surface rounded-card flex aspect-3/2 items-center justify-center border p-5',
                    'transition-colors duration-(--duration-ui) group-hover:border-primary-200',
                  )}
                >
                  <img
                    src={brand.logo.src}
                    srcSet={brand.logo.srcSet}
                    alt={t(brand.logo.alt)}
                    width={brand.logo.width}
                    height={brand.logo.height}
                    loading="lazy"
                    decoding="async"
                    className={cn(
                      'h-full w-full object-contain',
                      'transition-transform duration-(--duration-ui) ease-(--ease-out-expo)',
                      'group-hover:scale-105 motion-reduce:transform-none',
                    )}
                  />
                </span>
                <span className="mt-3 block text-sm font-semibold">{brand.name}</span>
                {brand.country && (
                  <span className="text-ink-muted mt-0.5 block text-xs">{brand.country}</span>
                )}
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}
