import { Button, KeepPhrases, Section } from '@/components/ui'
import { useLocale } from '@/hooks/useLocale'
import { ui } from '@/data'
import { yearsOfExperience } from '@/config'

/**
 * Hero — Home section 1
 *
 * ตั้งใจให้ "เสร็จ" ในตัวเองโดยไม่มี 3D เลย เพราะ Phase 5 จะเอา R3F มาสวมทับ
 * แล้ว static version นี้จะกลายเป็น fallback ทันที — ถ้าเริ่มจาก 3D ก่อน
 * จะไม่มี fallback ให้ใช้และต้องกลับมาทำย้อนหลัง
 *
 * พาดหัวย้ายไปอยู่ที่ ui.home.heroTitle แล้ว (ส.ค. 2026) หลังลูกค้ายืนยันว่าต้องการ
 * TH/EN เต็มรูปแบบทั้งสองภาษา — เดิมเขียนตายตัวเป็นภาษาอังกฤษทั้งสองภาษาโดยตั้งใจ
 * TODO: ให้ IDIE เลือกระหว่างพาดหัวนี้กับ "TOTAL SOLUTION FOR INDUSTRIAL ENGINEERING"
 */
export function HomeHero() {
  const { t } = useLocale()
  const years = yearsOfExperience()

  return (
    <Section tone="dark" spacing="lg" className="blueprint-grid overflow-hidden">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-14">
        <div>
          <p className="text-eyebrow text-accent-glow flex items-center gap-2.5 uppercase">
            <span aria-hidden="true" className="bg-accent-glow inline-block h-px w-6" />
            ID Industrial Engineering Co.,Ltd.
          </p>

          {/*
            `uppercase` ไม่มีผลกับอักษรไทย (ภาษาไทยไม่มีตัวพิมพ์ใหญ่-เล็ก) จึงปล่อยไว้ได้
            ทั้งสองภาษา ส่วนการขึ้นบรรทัดปล่อยให้ text-balance จัดเอง ไม่ใส่ <br> ตายตัว
            เพราะความยาวของสองภาษาต่างกันมาก จุดตัดบรรทัดที่สวยในภาษาหนึ่งจะพังในอีกภาษา
          */}
          <h1 className="text-display mt-5 font-bold text-balance uppercase">
            {t(ui.home.heroTitle)}
          </h1>

          <p className="mt-6 max-w-xl text-lg text-white/70">
            <KeepPhrases>{t(ui.home.heroLead)}</KeepPhrases>
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button to="/services" variant="onDark" size="lg" withArrow>
              {t(ui.nav.services)}
            </Button>
            <Button
              to="/contact"
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 active:bg-white/15"
            >
              {t(ui.nav.contact)}
            </Button>
          </div>

          <p className="stat-figure mt-12 text-sm text-white/50">
            {t(ui.home.heroMeta).replace('{years}', String(years))}
          </p>
        </div>

        {/*
          หน้าปกแผ่นพับ INTRON-X วางคู่พาดหัว — ครึ่งขวาของ hero เดิมเป็นที่ว่างเปล่า

          ภาพเป็นแนวตั้ง จอกว้างจึงคุมด้วย **ความสูง** ไม่ใช่ความกว้าง ถ้าปล่อยให้กว้าง
          เต็มคอลัมน์ ภาพจะสูงเกิน 700px ดัน hero ยาวจนเนื้อหาถัดไปตกจอไปหมด

          ไม่ lazy เพราะอยู่เหนือขอบจอตั้งแต่เปิดหน้าแรก การ lazy จะทำให้เห็นช่องว่างแล้ว
          ภาพค่อยโผล่ทีหลัง ส่วน width/height ที่ระบุตรงกับไฟล์จริง เบราว์เซอร์จึงกันที่
          ให้ล่วงหน้าได้ ไม่เกิดอาการเนื้อหากระโดดตอนภาพโหลดเสร็จ

          จอแคบวางต่อท้ายข้อความ ไม่ซ่อนทิ้ง — เป็นภาพสินค้าที่กำลังโปรโมต ไม่ใช่ของตกแต่ง
        */}
        <img
          src="/images/home/intron-x-cover.webp"
          srcSet="/images/home/intron-x-cover-600.webp 1x, /images/home/intron-x-cover.webp 2x"
          alt={t(ui.home.heroImageAlt)}
          width={1200}
          height={1409}
          fetchPriority="high"
          decoding="async"
          className="rounded-card mx-auto w-full max-w-xs border border-white/15 shadow-2xl sm:max-w-sm lg:h-[34rem] lg:w-auto lg:max-w-full"
        />
      </div>
    </Section>
  )
}
