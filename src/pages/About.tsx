import {
  Badge,
  Button,
  Heading,
  KeepPhrases,
  KeepWords,
  Section,
} from '@/components/ui'
import { Seo } from '@/components/layout/Seo'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { contactPerson, getCompany, getIndustries, getServices, ui } from '@/data'
import { yearsOfExperience } from '@/config'

/**
 * About Us — Phase 4
 *
 * ประกอบจากข้อมูลที่บริษัทให้มาจริงทั้งหน้า — ข้อมูลบริษัท ขอบเขตงาน อุตสาหกรรม
 * และผู้ติดต่อ
 *
 * หมวดหนังสือแต่งตั้งจากผู้ผลิตถูกถอดออกตามที่เจ้าของเว็บสั่ง (ก.ย. 2026) —
 * ข้อมูลกับไฟล์ภาพเอกสารยังอยู่ครบใน src/data/company.ts และ public/images/
 * ถ้าจะเอากลับมาให้ดูที่ประวัติ git ของไฟล์นี้
 *
 * เคยมีสามช่องที่ประกาศว่า "รอข้อมูลจากบริษัท" (ประวัติ · วิสัยทัศน์และพันธกิจ · ทีมงาน)
 * ไว้ให้คนรีวิวเห็นว่าหน้านี้จะมีอะไรต่อ ถอดออกตามที่เจ้าของเว็บสั่ง (ก.ย. 2026) —
 * หน้าที่ประกาศว่าตัวเองยังไม่เสร็จให้ลูกค้าเห็น มีราคาแพงกว่าหน้าที่สั้นแต่ครบ
 * ถ้าวันหนึ่งได้ข้อมูลสามอย่างนั้นมา ให้เพิ่มเป็น section ที่มีเนื้อหาจริงไปเลย
 */
export default function About() {
  const { t } = useLocale()
  const { data: company } = useAsyncData(getCompany)
  const { data: services } = useAsyncData(getServices)
  const { data: industries } = useAsyncData(getIndustries)

  const years = yearsOfExperience()

  return (
    <>
      <Seo title={ui.about.title} description={ui.about.lead} />

      <Section tone="alt" spacing="lg">
        <Heading level={1} eyebrow="ABOUT US">
          {t(ui.about.title)}
        </Heading>
        <p className="text-ink-muted mt-4 max-w-prose">
          <KeepPhrases>{t(ui.about.lead)}</KeepPhrases>
        </p>
      </Section>

      {company && (
        <Section>
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <Heading level={2} eyebrow="COMPANY PROFILE">
                {/* ชื่อบริษัทเป็นชื่อเฉพาะ — ห้ามให้เบราว์เซอร์หั่นกลางคำตามพจนานุกรม */}
                <KeepWords>{t(company.legalName)}</KeepWords>
              </Heading>
              {/*
                ข้อความแนะนำบริษัทเก็บเป็นสตริงเดียวที่มีบรรทัดว่างคั่น แล้วแยกเป็น
                <p> ตอนแสดง — ไม่ได้แยกเป็นสองฟิลด์ในข้อมูล เพราะหน้าแรกใช้ข้อความ
                ชุดเดียวกันนี้ ถ้าแยกฟิลด์แล้วมีคนเติมย่อหน้าที่สามวันหลัง จะต้องไล่แก้
                ทุกหน้าที่แสดงมัน — ตัวคั่นทำให้เพิ่มย่อหน้าได้จากไฟล์ข้อมูลที่เดียว
              */}
              <div className="text-ink-muted mt-6 space-y-4">
                {/*
                  เคยใส่ `text-balance` เพื่อกันบรรทัดสุดท้ายสั้นกุด แล้วถอดออกตอนที่คุม
                  "อุตสาหกรรมหนัก" ไม่ให้ถูกตัด — วัดที่คอลัมน์ 560px หลังคุมวลีแล้ว
                  การตัดบรรทัดปกติได้ 502/517/380 ซึ่งไล่จากยาวไปสั้นตามธรรมชาติ
                  ส่วน balance ได้ 417/460/522 ที่ไล่จากสั้นไปยาวจนดูเหมือนบันไดกลับหัว
                */}
                {t(company.about).split('\n\n').map((paragraph) => (
                  <p key={paragraph}>
                    <KeepPhrases>{paragraph}</KeepPhrases>
                  </p>
                ))}
              </div>

              {/*
                `items-baseline` ไม่ใช่ค่าเริ่มต้น — ป้ายกำกับเป็น text-sm (บรรทัดสูง 23px)
                ส่วนค่าเป็นขนาดปกติ (บรรทัดสูง 28px) ถ้าปล่อยให้กล่องเริ่มที่ขอบบนเท่ากัน
                ตัวอักษรของสองฝั่งจะเหลื่อมกัน 2.4px ซึ่งพอที่จะรู้สึกว่าตารางไม่ตรง
                แม้จะบอกไม่ถูกว่าอะไรผิด — จับที่เส้นฐานตัวอักษรแทนขอบกล่องจึงตรงเสมอ
                ไม่ว่าขนาดตัวอักษรสองฝั่งจะต่างกันแค่ไหน และค่าที่ยาวหลายบรรทัด
                (ที่อยู่) ก็ยังจับกับบรรทัดแรกอยู่ดี

                py-5 เท่ากับตารางข้อมูลติดต่อในหน้า Contact — เป็นตารางแบบเดียวกัน
                ระยะควรเท่ากัน ค่านี้ผ่านการไล่ปรับกับเจ้าของเว็บหลายรอบ
                (16 → 20 → 24 → 22 → 20px) จนลงตัวที่ 20px แก้ทั้งสองหน้าพร้อมกันทุกครั้ง
              */}
              <dl className="border-line mt-8 divide-y border-t border-b">
                <div className="flex items-baseline gap-6 py-5">
                  <dt className="text-ink-muted w-40 shrink-0 text-sm">
                    {t({ th: 'ก่อตั้ง', en: 'Established' })}
                  </dt>
                  <dd className="stat-figure font-semibold">
                    {company.foundedYear}{' '}
                    <span className="text-ink-muted font-normal">
                      ({years} {t({ th: 'ปี', en: 'years' })})
                    </span>
                  </dd>
                </div>
                <div className="flex items-baseline gap-6 py-5">
                  <dt className="text-ink-muted w-40 shrink-0 text-sm">
                    {t({ th: 'สำนักงาน', en: 'Office' })}
                  </dt>
                  <dd>{t(company.address)}</dd>
                </div>
                <div className="flex items-baseline gap-6 py-5">
                  <dt className="text-ink-muted w-40 shrink-0 text-sm">
                    {t(ui.about.contactPersonHeading)}
                  </dt>
                  <dd>
                    {contactPerson.name}
                    <span className="text-ink-muted"> · {t(contactPerson.role)}</span>
                  </dd>
                </div>
              </dl>
            </div>

            {/*
              แผงตราสัญลักษณ์พื้นอ่อน — เดิมเป็นภาพตราขนาดใหญ่เต็มกรอบบนพื้นกรมท่า
              ซึ่งดึงน้ำหนักสายตาไปทางขวาจนดูเหมือนป้ายโฆษณามากกว่าภาพประกอบโปรไฟล์
              (เจ้าของเว็บทักมา ก.ย. 2026) ตอนนี้เป็นตราขนาดปกติวางกลางพื้นเทาอ่อน
              เดียวกับที่ใช้ทั้งเว็บ น้ำหนักจึงถ่วงกับก้อนข้อความฝั่งซ้ายได้

              `alt=""` เพราะเป็นภาพตกแต่งล้วน — ชื่อบริษัทอยู่ในหัวข้อข้าง ๆ อยู่แล้ว
              ถ้าใส่ alt เป็นชื่อบริษัท screen reader จะอ่านซ้ำสองรอบ

              TODO: ยังอยากได้ภาพอาคารสำนักงาน ทีมงาน หรือหน้างานติดตั้งจริงมาแทน
              (ดู docs/data-requests.md หัวข้อภาพองค์กร) — ภาพจริงสื่อความน่าเชื่อถือ
              ได้มากกว่าตราสัญลักษณ์ซึ่งผู้อ่านเห็นบน header อยู่แล้วทุกหน้า
            */}
            <div className="border-line rounded-card bg-surface-alt blueprint-grid-light grid aspect-[4/3] w-full place-items-center border p-10 sm:p-14">
              {/*
                ตราใหญ่ขึ้นจาก 220px เป็น 320px ตามที่เจ้าของงานสั่ง — กินพื้นที่ 71%
                ของกรอบด้านใน (448x308px) เหลือขอบหายใจข้างละ 64px และบน-ล่างข้างละ 46px

                ต้องมีไฟล์ 640px ด้วย ไม่ใช่ใช้ 360px ตัวเดิมยืดขึ้น — จอความละเอียดสูง
                ต้องการภาพกว้างสองเท่าของขนาดที่แสดง 360px จึงพอแค่ 1.1 เท่าซึ่งจะเห็น
                ขอบเบลอ ไฟล์ใหม่สร้างจาก idie-icon-source.png (817x550) ที่มีอยู่แล้ว
              */}
              <img
                src="/images/brand/idie-logo-360.webp"
                srcSet="/images/brand/idie-logo-360.webp 1x, /images/brand/idie-logo-640.webp 2x"
                alt=""
                width={360}
                height={242}
                loading="lazy"
                decoding="async"
                className="h-auto w-full max-w-[320px]"
              />
            </div>
          </div>
        </Section>
      )}

      <Section tone="alt">
        <Heading level={2} eyebrow="SCOPE OF WORK">
          {t(ui.about.scopeHeading)}
        </Heading>
        {/*
          ครอบด้วย KeepPhrases เพราะ "บริการหลังการขาย" ถูกตัดกลางเป็น "…จนถึงบริการ /
          หลังการขาย" ที่จอ 1024 และ 1440 — บรรทัดแรกจบด้วยคำว่า "บริการ" ซึ่งอ่านจบ
          เป็นคนละความหมายกับที่ตั้งใจ แล้วค่อยมาเฉลยที่ต้นบรรทัดถัดไป
        */}
        <p className="text-ink-muted mt-4 max-w-prose">
          <KeepPhrases>{t(ui.about.scopeLead)}</KeepPhrases>
        </p>

        {/*
          md:gap-x-10 — สองคอลัมน์นี้เดิมไม่มีช่องไฟระหว่างกันเลย (grid gap เป็น normal)
          มีแค่ระยะขอบ 8px ที่ตัวรายการ ทำให้ข้อความคอลัมน์ซ้ายจบห่างจากคอลัมน์ขวา
          แค่ 13px คือชนกันจนอ่านต่อกันเป็นบรรทัดเดียว

          40px ไม่ใช่ 48px — วัดแล้ว 48px บีบคอลัมน์จนคำอธิบายข้อ 01 ตกไปบรรทัดที่สอง
          และตารางสูงขึ้น 32px ส่วน 40px ได้ช่องไฟ 41px โดยจำนวนบรรทัดของทุกข้อเท่าเดิม
        */}
        <ol className="border-line mt-8 grid divide-y border-t border-b md:grid-cols-2 md:gap-x-10 md:divide-y-0">
          {services?.map((service, index) => (
            /* ไม่มีระยะขอบซ้าย-ขวาแล้ว — ช่องไฟระหว่างคอลัมน์ย้ายไปอยู่ที่ gap ของกริดแทน
               ผลพลอยได้คือเลขลำดับตรงแนวกับหัวข้อของหมวดพอดี จากเดิมเยื้องเข้ามา 8px */
            <li key={service.slug} className="flex gap-5 py-5">
              <span className="stat-figure text-primary-600 shrink-0 text-sm font-bold">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-h3 font-semibold">{t(service.name)}</h3>
                <p className="text-ink-muted mt-1">
                  <KeepPhrases>{t(service.shortDescription)}</KeepPhrases>
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <Heading level={2} eyebrow="INDUSTRIES">
          {t(ui.about.industriesHeading)}
        </Heading>
        <ul className="mt-6 flex flex-wrap gap-2">
          {industries?.map((industry) => (
            <li key={industry.slug}>
              <Badge tone="brand">{t(industry.name)}</Badge>
            </li>
          ))}
        </ul>
      </Section>


      <Section tone="dark" spacing="lg" className="blueprint-grid">
        <div className="max-w-2xl">
          <Heading level={2} eyebrow="NEXT STEP">
            {t(ui.home.contactCtaTitle)}
          </Heading>
          <p className="mt-4 text-white/70">{t(ui.home.contactCtaLead)}</p>
          <div className="mt-8">
            <Button to="/contact" variant="onDark" withArrow>
              {t(ui.actions.contactInquiry)}
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}
