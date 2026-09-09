import { ExpandIcon } from '@/components/ui/icons'
import {
  Badge,
  Button,
  Heading,
  ImageLightbox,
  KeepPhrases,
  KeepWords,
  Section,
} from '@/components/ui'
import { useState } from 'react'
import type { ImageAsset } from '@/types/content'
import { Seo } from '@/components/layout/Seo'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { contactPerson, getCertificates, getCompany, getIndustries, getServices, ui } from '@/data'
import { yearsOfExperience } from '@/config'

/**
 * About Us — Phase 4
 *
 * ประกอบจากข้อมูลที่บริษัทให้มาจริงทั้งหน้า — ข้อมูลบริษัท ขอบเขตงาน อุตสาหกรรม
 * ผู้ติดต่อ และหนังสือแต่งตั้งจากผู้ผลิต
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
  const { data: certificates } = useAsyncData(getCertificates)

  /**
   * เก็บ "ภาพที่กำลังเปิดอยู่" ไม่ใช่ boolean — ป๊อปอัปมีตัวเดียวใช้ร่วมกันทุกใบ
   * ถ้าทำ dialog ต่อใบจะได้ element ซ้ำใน DOM โดยไม่ได้อะไรเพิ่ม
   */
  const [openImage, setOpenImage] = useState<ImageAsset | null>(null)
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
              <img
                src="/images/brand/idie-logo-360.webp"
                srcSet="/images/brand/idie-logo-180.webp 1x, /images/brand/idie-logo-360.webp 2x"
                alt=""
                width={360}
                height={242}
                loading="lazy"
                decoding="async"
                className="h-auto w-full max-w-[220px]"
              />
            </div>
          </div>
        </Section>
      )}

      <Section tone="alt">
        <Heading level={2} eyebrow="SCOPE OF WORK">
          {t(ui.about.scopeHeading)}
        </Heading>
        <p className="text-ink-muted mt-4 max-w-prose">{t(ui.about.scopeLead)}</p>

        <ol className="border-line mt-8 grid divide-y border-t border-b md:grid-cols-2 md:divide-y-0">
          {services?.map((service, index) => (
            <li key={service.slug} className="flex gap-5 py-5 md:px-2">
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

      {/*
        การแต่งตั้งจากผู้ผลิตได้ section ของตัวเอง เพราะเป็นหลักฐานที่มีน้ำหนักที่สุด
        ในหน้านี้สำหรับผู้ซื้องานพื้นที่อันตราย — ข้อความในการ์ดสรุปตามถ้อยคำบนเอกสารตัวจริง

        getCertificates() กรองฉบับที่ `status: 'expired'` ออกและเรียงจากใหม่ไปเก่าให้แล้ว
        หน้านี้จึงไม่ต้องจัดลำดับหรือคัดกรองเอง — IDIE แจ้ง (ส.ค. 2026) ว่าไม่ให้เผยแพร่
        หนังสือที่หมดอายุ ฉบับปี 2006 จึงถูกถอดออกจากข้อมูลไปแล้ว
        ถ้าเพิ่มฉบับใหม่ที่หมดอายุเข้ามา มันจะไม่ขึ้นหน้าเว็บโดยตั้งใจ ไม่ใช่บั๊ก
      */}
      {certificates && certificates.length > 0 && (
        <Section tone="alt">
          <Heading level={2} eyebrow="AUTHORISATIONS">
            {t(ui.about.certificatesHeading)}
          </Heading>
          <p className="text-ink-muted mt-4 max-w-prose">{t(ui.about.certificatesLead)}</p>

          {/*
            แสดงเป็นแถวของเอกสาร ไม่ใช่การ์ดใบใหญ่ — หน้าที่ของส่วนนี้คือให้ผู้อ่าน
            เห็นว่ามีหนังสือแต่งตั้งจริง ไม่ใช่ให้อ่านสรุปเนื้อหาทีละฉบับบนหน้าเว็บ
            คำบรรยายเต็มยังอยู่ใน src/data/company.ts และตัวเอกสารเปิดดูขนาดเต็มได้

            จำกัดความสูงเท่ากันทุกใบด้วย object-contain เพราะเอกสารมีทั้งแนวนอน (Industronic)
            และแนวตั้ง (FHF) ถ้าไม่คุมความสูงแถวจะเหลื่อมกันจนดูเหมือนวางผิด
          */}
          {/*
            ตะแกรงสองคอลัมน์เต็มความกว้างคอนเทนเนอร์ — ขอบซ้ายของการ์ดใบแรกตรงกับ
            แนวหัวข้อ ขอบขวาของใบที่สองชนแนวขวาสุดของหน้า ไม่เหลือช่องโหว่เหมือนตอน
            ใช้สามคอลัมน์กับเอกสารสองฉบับ

            เอกสารฉบับที่สามในอนาคตจะตกลงแถวล่างชิดซ้าย ซึ่งถูกต้องแล้วสำหรับตะแกรง —
            ถ้าอยากให้แถวที่ไม่เต็มอยู่กึ่งกลางต้องกลับไปใช้ flex-wrap แทน
          */}
          <ul className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2">
            {certificates.map((cert) => (
              <li key={cert.id}>
                {cert.image && (
                  <button
                    type="button"
                    onClick={() => setOpenImage(cert.image ?? null)}
                    /*
                      ตั้งชื่อปุ่มเองด้วย aria-label แทนที่จะปล่อยให้ไปหยิบ alt ของภาพมาเป็นชื่อ —
                      alt ของเอกสารเป็นคำบรรยายยาวหลายสิบคำ ถ้าใช้เป็นชื่อปุ่ม ผู้ใช้ screen reader
                      จะต้องฟังทั้งย่อหน้าก่อนจะรู้ว่ากดแล้วเกิดอะไร ชื่อปุ่มต้องบอก "การกระทำ"
                      ส่วนคำบรรยายเต็มไปอยู่ที่ชื่อของหน้าต่างที่เปิดขึ้นมาแทน

                      เป็น <button> ไม่ใช่ <a> เพราะไม่ได้พาไปที่อื่น แค่เปิดของบนหน้าเดิม
                      ลิงก์ที่ไม่พาไปไหนทำให้ผู้ใช้ screen reader เข้าใจผิดว่ากำลังจะออกจากหน้า

                      การ์ดล็อกสัดส่วน 4:3 ทุกใบ ขนาดกรอบจึงเท่ากันเป๊ะไม่ว่าเอกสารข้างในจะเป็น
                      แนวนอนหรือแนวตั้ง คำบรรยายใต้การ์ดจึงอยู่ระดับเดียวกันทั้งแถวโดยอัตโนมัติ
                      ตัวเอกสารจัดกึ่งกลางการ์ด ฉบับแนวตั้งจะเหลือที่ว่างซ้าย-ขวาเล็กน้อย
                      ซึ่งเป็นระเบียบกว่าการปล่อยให้กรอบสูงไม่เท่ากันตามสัดส่วนกระดาษ
                    */
                    aria-label={t(ui.about.certificatesOpen).replace('{name}', t(cert.name))}
                    className="border-line bg-surface-alt rounded-card group relative flex aspect-4/3 w-full cursor-pointer items-center justify-center border p-5 transition-[translate,box-shadow] duration-(--duration-ui) ease-(--ease-out-expo) hover:-translate-y-1 hover:shadow-lift motion-reduce:translate-none sm:p-7"
                  >
                    {/*
                      ตั้ง transition เป็น `translate` ไม่ใช่ `transform` — Tailwind v4 คอมไพล์
                      `-translate-y-1` เป็นคุณสมบัติ `translate` เดี่ยว ๆ (วัดแล้วได้ `translate: 0 -4px`
                      ส่วน `transform` ยังเป็น none) ถ้าเขียน `transition-[transform,…]` การ์ดจะ
                      กระตุกขึ้นทันทีแทนที่จะไถลขึ้น และ `motion-reduce:transform-none` ก็จะไม่มีผล

                      ไอคอนขยายโผล่ตอนชี้เมาส์ — ประโยค "กดที่เอกสารเพื่อดูขนาดเต็ม"
                      อยู่บนสุดของหมวด คนที่เลื่อนผ่านมาแล้วอาจไม่ทันอ่าน ไอคอนที่จุดนั้น
                      บอกซ้ำตรงตำแหน่งที่มือกำลังจะกดพอดี

                      `aria-hidden` เพราะเป็นการบอกซ้ำด้วยภาพ ปุ่มมีชื่อจาก aria-label อยู่แล้ว
                      ผู้ใช้ screen reader ไม่ควรได้ยินคำว่า "ขยาย" ซ้อนเข้ามาอีกชั้น

                      ต้องมี `z-10` — ภาพเอกสารมี `drop-shadow` ซึ่งทำให้มันสร้าง stacking
                      context ของตัวเองแล้วขึ้นไปอยู่ชั้นเดียวกับ element ที่ absolute
                      พอมันอยู่หลังกว่าใน DOM จึงวาดทับไอคอนนี้ (เห็นเป็นวงกลมโดนมุมเอกสารบัง)
                    */}
                    <span
                      aria-hidden="true"
                      className="border-line bg-surface text-primary-600 absolute top-3 right-3 z-10 flex size-9 items-center justify-center rounded-full border opacity-0 transition-opacity duration-(--duration-ui) group-hover:opacity-100"
                    >
                      <ExpandIcon className="size-4" strokeWidth={1.75} />
                    </span>
                    <img
                      src={cert.image.src}
                      srcSet={cert.image.srcSet}
                      alt=""

                      width={cert.image.width}
                      height={cert.image.height}
                      loading="lazy"
                      decoding="async"
                      /*
                        `size-full` + `object-contain` ไม่ใช่ `max-h-full w-auto` —
                        ภาพเป็นลูกของ flex container การใส่ max ทั้งสองแกนทำให้เบราว์เซอร์
                        บีบเฉพาะแกนเดียวจนสัดส่วนเพี้ยน (วัดได้: ใบแนวตั้ง 565×800 ถูกวาง
                        ในกล่อง 518×374) แบบนี้กล่องเต็มพื้นที่การ์ดแล้วให้ object-contain
                        จัดกึ่งกลางกับคุมสัดส่วนแทน ซึ่งเป็นงานที่มันทำได้ถูกต้องเสมอ

                        ไม่มีเส้นขอบที่ตัวภาพแล้ว — ขอบจะไปล้อมกล่องที่ใหญ่กว่าตัวกระดาษ

                        เงาใช้ `drop-shadow` ไม่ใช่ `shadow` (box-shadow) ด้วยเหตุผลเดียวกัน —
                        box-shadow วาดรอบ**กล่อง**ซึ่งใหญ่กว่ากระดาษ ส่วน drop-shadow เดินตาม
                        รูปทรงที่วาดจริง เงาจึงล้อมขอบกระดาษพอดีทั้งใบแนวนอนและแนวตั้ง
                      */
                      className="size-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                    />
                  </button>
                )}
                <p className="text-ink-muted mt-4 text-center text-sm">
                  <span className="text-ink font-semibold">{t(cert.issuer)}</span>
                  <span className="mt-0.5 block">{t(cert.name)}</span>
                </p>
              </li>
            ))}
          </ul>

          <ImageLightbox image={openImage} onClose={() => setOpenImage(null)} />
        </Section>
      )}

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
