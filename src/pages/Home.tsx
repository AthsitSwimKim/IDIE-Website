import { Seo } from '@/components/layout/Seo'
import { HomeHero } from '@/pages/home/HomeHero'
import { CompanyProfile } from '@/pages/home/CompanyProfile'
import { EngineeringHighlights } from '@/pages/home/EngineeringHighlights'
import { HomeServices } from '@/pages/home/HomeServices'
import { BrandPartners } from '@/pages/home/BrandPartners'
import { HomeProducts } from '@/pages/home/HomeProducts'
import { HomeReferences } from '@/pages/home/HomeReferences'
import { IndustriesServed } from '@/pages/home/IndustriesServed'
import { WhyIdie } from '@/pages/home/WhyIdie'
import { EngineeringStats } from '@/pages/home/EngineeringStats'
import { CareerCta } from '@/pages/home/CareerCta'
import { ContactCta } from '@/pages/home/ContactCta'

/**
 * หน้า Home — Phase 3
 *
 * ลำดับ section คือลำดับการเล่าเรื่อง ไม่ใช่ลำดับความสำคัญของแต่ละหน้า:
 * เราคือใคร → ทำอะไรได้ → ขายของใคร → ขายอะไร → เคยส่งมอบให้ใคร →
 * อยู่ในวงการไหน → ทำไมต้องเรา → ตัวเลขยืนยัน → ร่วมงาน → ติดต่อ
 *
 * **Featured Projects และ Latest News ยังไม่ได้ประกอบ** เพราะยังไม่มีข้อมูลจริงเลย
 * (เว็บเดิมไม่มีหน้า Projects และหน้า News เขียนว่า "Comming Soon....")
 * ตามกติกาโครงการข้อ 7 การแสดง section เปล่าหรือข้อมูลที่แต่งขึ้นแย่กว่าการไม่แสดง —
 * เมื่อได้ข้อมูลจาก IDIE ให้แทรก FeaturedProjects ไว้หลัง HomeReferences
 * และ LatestNews ไว้หลัง EngineeringStats
 */
export default function Home() {
  return (
    <>
      <Seo
        title={{
          th: 'ระบบสื่อสารและสัญญาณเตือนภัยอุตสาหกรรม',
          en: 'Industrial Communication & Safety Signalling',
        }}
        description={{
          th: 'ID Industrial Engineering — ออกแบบ จัดหา และติดตั้งระบบอินเตอร์คอม ระบบประกาศและสัญญาณเตือนภัย ระบบเครือข่ายและกล้องวงจรปิด สำหรับโรงงานอุตสาหกรรมและพื้นที่อันตราย',
          en: 'ID Industrial Engineering — design, supply and installation of intercom, PA/GA, network and CCTV systems for industrial plants and hazardous areas.',
        }}
      />

      <HomeHero />
      <CompanyProfile />
      <EngineeringHighlights />
      <HomeServices />
      <BrandPartners />
      <HomeProducts />
      <HomeReferences />
      {/* Featured Projects — รอข้อมูลจาก IDIE */}
      <IndustriesServed />
      <WhyIdie />
      <EngineeringStats />
      {/* Latest News — รอข้อมูลจาก IDIE */}
      <CareerCta />
      <ContactCta />
    </>
  )
}
