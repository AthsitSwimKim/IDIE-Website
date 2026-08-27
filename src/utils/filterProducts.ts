import type { Product, ProductFilter } from '@/types/content'

/**
 * กรองรายการสินค้า
 *
 * แยกออกมาจาก component โดยตั้งใจ — วันที่ย้าย filter ไปทำฝั่ง server
 * (เมื่อรายการสินค้าโตจนส่งทั้งหมดมาไม่ไหว) จะเปลี่ยนแค่ที่ data layer
 * โดยที่หน้า Products ไม่ต้องแก้เลย
 *
 * การค้นหาไล่ดูทั้งชื่อสองภาษา รหัสรุ่น และ searchKeywords เพราะวิศวกรหน้างาน
 * เรียกของชิ้นเดียวกันได้หลายชื่อ — "ไฟแฟลช", "beacon", หรือรหัสรุ่นตรง ๆ
 */
export function filterProducts(products: Product[], filter: ProductFilter = {}): Product[] {
  const query = filter.query?.trim().toLowerCase()

  return products.filter((product) => {
    if (filter.categorySlug && product.categorySlug !== filter.categorySlug) return false
    if (filter.brandId && product.brandId !== filter.brandId) return false
    if (filter.area && !product.area.includes(filter.area)) return false

    if (query) {
      const haystack = [
        product.model,
        product.name.th,
        product.name.en,
        product.shortDescription.th,
        product.shortDescription.en,
        ...(product.certifications ?? []),
        ...(product.searchKeywords ?? []),
      ]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(query)) return false
    }

    return true
  })
}
