import type { SiteReference } from '@/types/content'
import { AlertCircleIcon, RefreshIcon } from '@/components/ui/icons'
import { Button, EmptyState, Heading, Section } from '@/components/ui'
import { Seo } from '@/components/layout/Seo'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLocale } from '@/hooks/useLocale'
import { getReferenceCompanies, getSiteReferences, ui } from '@/data'
import { cn } from '@/utils/cn'

/**
 * หน้าลูกค้าอ้างอิง — กล่องข้อมูลโครงการ แล้วตามด้วยกำแพงโลโก้ลูกค้า
 *
 * **ลำดับนี้ตอบคำถามของผู้อ่านตามลำดับที่เขาถามจริง** — คนที่เปิดหน้านี้อยากรู้ว่า
 * "เคยทำงานอะไรมาบ้าง" ก่อน แล้วค่อยดูว่า "ลูกค้าคือใคร" กำแพงโลโก้จึงอยู่ล่าง
 * ทำหน้าที่ยืนยันความน่าเชื่อถือ ไม่ใช่เนื้อหาหลักของหน้า
 *
 * **ข้อมูลมาจากตาราง `site_references` ซึ่งแยกจาก `projects`** ตามที่เจ้าของระบบ
 * กำหนด สองอย่างนี้เขียนถึงผู้อ่านคนละแบบ — หน้า /projects เป็นรายละเอียดเต็ม
 * มีภาพรวมและแนวทางวิศวกรรม ส่วนกล่องนี้เป็นบรรทัดสรุปสำหรับคนที่กำลังประเมิน
 * ว่าจะจ้างหรือไม่ การแยกตารางทำให้แก้อันหนึ่งโดยไม่กระทบอีกอันได้
 */
export default function Reference() {
  const { t } = useLocale()
  const { data: references, loading, error, reload } = useAsyncData(getSiteReferences)
  const { data: companies } = useAsyncData(() => getReferenceCompanies())

  return (
    <>
      <Seo
        title={{ th: 'ลูกค้าอ้างอิง', en: 'Reference' }}
        description={{
          th: 'องค์กรและโรงงานอุตสาหกรรมชั้นนำที่เคยร่วมงานกับ IDIE',
          en: 'Leading companies and industrial partners that have worked with IDIE.',
        }}
      />

      <Section tone="alt" spacing="lg">
        <Heading level={1} eyebrow="REFERENCE">
          {t(ui.pages.referenceTitle)}
        </Heading>
        <p className="text-ink-muted mt-4 max-w-prose">{t(ui.pages.referenceLead)}</p>
      </Section>

      <Section spacing="md">
        <Heading level={2}>{t(ui.pages.referenceProjectsHeading)}</Heading>

        {loading && !references && (
          <p className="text-ink-muted mt-8 text-sm">{t(ui.states.loading)}</p>
        )}

        {/*
          โหลดไม่สำเร็จกับยังไม่มีผลงาน เป็นคนละเรื่องและต้องพูดคนละอย่าง —
          การบอกว่า "ยังไม่มีผลงาน" ตอน API ล่มคือการบอกข้อมูลที่ผิดกับผู้เข้าชม
        */}
        {error && (
          <EmptyState
            icon={<AlertCircleIcon aria-hidden="true" className="size-12" strokeWidth={1.5} />}
            title={t(ui.states.loadFailedTitle)}
            body={t(ui.states.loadFailedBody)}
          >
            <Button onClick={reload}>
              <RefreshIcon aria-hidden="true" className="size-4 shrink-0" />
              {t(ui.actions.retry)}
            </Button>
          </EmptyState>
        )}

        {!error && references && references.length > 0 && (
          /*
            เส้นคั่นบนพื้นขาวแทนการ์ดพื้นสี — `divide-y` วาดเส้นเฉพาะระหว่างแถว
            ไม่ใช่ทุกแถว จึงไม่มีเส้นซ้อนสองชั้นตรงรอยต่อ

            มีแต่เส้นปิดท้าย ไม่มีเส้นบนสุด — หัวข้อของหมวดทำหน้าที่เปิดรายการอยู่แล้ว
            เส้นที่คั่นระหว่างหัวข้อกับแถวแรกจึงเป็นเส้นส่วนเกิน

            ใช้ `steel/40` หนา 2px แทน `border-line` ที่เป็นค่ามาตรฐานของระบบ เพราะเส้น
            #e2e8f2 หนา 1px จางเกินกว่าจะคุมจังหวะสายตาในรายการที่แถวสูงราว 220px

            จำกัดความกว้างแล้วจัดกึ่งกลางหน้า ไม่ปล่อยให้ยาวเต็มคอนเทนเนอร์ — หัวข้อของหมวด
            ยังชิดซ้ายตามหัวข้ออื่นทั้งหน้า มีเฉพาะรายการที่อยู่ตรงกลาง ตามแบบที่เจ้าของระบบวาดมา
          */
          <ul className="divide-steel/40 border-steel/40 mx-auto mt-7 max-w-4xl divide-y-2 border-b-2">
            {references.map((item) => (
              <li key={item.id}>
                <ReferenceRow item={item} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section tone="alt" spacing="md">
        <Heading level={2}>{t(ui.pages.referenceLogosHeading)}</Heading>

        {companies && companies.length === 0 ? (
          <p className="text-ink-muted mt-8">{t(ui.states.empty)}</p>
        ) : (
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {companies?.map((item) => (
              <li key={item.id}>
                <div
                  className={cn(
                    'group border-line bg-surface rounded-card flex aspect-3/2 items-center justify-center border p-5',
                    'transition-colors duration-(--duration-ui) hover:border-primary-200',
                  )}
                >
                  <img
                    src={item.logo.src}
                    srcSet={item.logo.srcSet}
                    alt={t(item.logo.alt)}
                    width={item.logo.width}
                    height={item.logo.height}
                    loading="lazy"
                    decoding="async"
                    className={cn(
                      'h-full w-full object-contain',
                      // แสดงสีเต็มตั้งแต่แรกตามที่ลูกค้าเลือก — โลโก้ลูกค้าคือหลักฐาน
                      // ความน่าเชื่อถือ ไม่ควรต้อง hover ก่อนถึงจะเห็นว่าเป็นใคร
                      'transition-transform duration-(--duration-ui) ease-(--ease-out-expo)',
                      'group-hover:scale-105 motion-reduce:transform-none',
                    )}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  )
}

/**
 * รายการอ้างอิงหน้างานหนึ่งแถว — ภาพซ้าย รายละเอียดขวา คั่นด้วยเส้นบนพื้นขาว
 *
 * ใช้เส้นคั่นแทนการ์ดพื้นสีตามแบบที่เจ้าของระบบเลือกมา รายการแบบนี้กวาดสายตาลงมา
 * ได้ต่อเนื่องกว่าเพราะไม่ต้องข้ามขอบกล่องทีละใบ
 *
 * **สถานที่ยังอยู่ใต้ชื่อลูกค้า ไม่ได้ชิดขวาตามแบบอ้างอิง** — แบบนั้นทำได้เมื่อไม่มี
 * คอลัมน์ภาพเท่านั้น พอหักความกว้างภาพออกแล้ว คอลัมน์ชื่อโครงการเหลือน้อยจนชื่อยาว ๆ
 * ถูกบีบขึ้นบรรทัดทีละคำ (ลองแล้วหน้าล้นแนวนอนด้วย)
 *
 * ใช้ `<dl>` ไม่ใช่ย่อหน้าธรรมดา เพราะเนื้อหาเป็นคู่ "หัวข้อ–ค่า" จริง ๆ
 * โปรแกรมอ่านหน้าจอจะประกาศว่าอะไรคือชื่อโครงการ อะไรคือชื่อลูกค้า
 * แทนที่จะอ่านรวดเป็นข้อความก้อนเดียวจนแยกไม่ออก
 */
function ReferenceRow({ item }: { item: SiteReference }) {
  const { t } = useLocale()

  return (
    <article className="flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:gap-9">
      {/*
        ภาพเป็นตัวกำหนดความสูงของแถวด้วยสัดส่วน 4:3 ส่วนข้อความจัดกึ่งกลางแนวตั้งเทียบ
        กับภาพ (`items-center`) — รายละเอียดมีแค่สามบรรทัดซึ่งสั้นกว่าภาพเกือบทุกครั้ง
        ถ้าปล่อยชิดบนจะเหลือช่องว่างใต้ข้อความเป็นแถบใหญ่จนแถวดูเอียงขึ้นข้างบน

        แถวที่ไม่มีภาพกันคอลัมน์ซ้ายไว้เท่าเดิมและปล่อยว่าง ไม่ใส่กรอบหรือไอคอนแทนที่
        แต่ยังคง `aspect-4/3` ไว้ ความสูงของแถวและตำแหน่งข้อความจึงเท่ากับแถวที่มีภาพ
        กวาดสายตาลงมาทั้งรายการแล้วไม่มีแถวไหนสะดุด — ยกเว้นจอแคบที่เรียงเป็นแนวตั้ง
        ซึ่งไม่มีคอลัมน์ให้เรียงอยู่แล้ว จึงซ่อนทิ้งไม่ให้เหลือช่องไฟค้าง
      */}
      <div
        className={cn(
          'rounded-card relative aspect-4/3 w-full shrink-0 overflow-hidden sm:w-56 lg:w-72',
          !item.image && 'hidden sm:block',
        )}
      >
        {item.image && (
          <img
            src={item.image.src}
            srcSet={item.image.srcSet}
            alt={t(item.image.alt)}
            width={item.image.width}
            height={item.image.height}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
        )}
      </div>

      <dl className="min-w-0 flex-1 text-base leading-relaxed">
        {/*
          หัวข้อกับค่าไหลเป็นข้อความก้อนเดียวกัน (`inline`) ไม่ใช่กล่อง flex คนละใบ —
          ของเดิมพอชื่อโครงการยาวเกินที่ว่างข้างหลังหัวข้อ ชื่อจะกระโดดลงบรรทัดใหม่ทั้งก้อน
          เหลือ "ชื่อโครงการ:" ลอยอยู่บรรทัดบนคนเดียว แบบ inline ชื่อจะเริ่มต่อจากหัวข้อ
          บรรทัดเดียวกัน แล้วค่อยตัดลงบรรทัดถัดไปเมื่อเต็มจริง ๆ

          ใช้ `text-pretty` ไม่ใช่ `text-balance` — balance จะเฉลี่ยความยาวทุกบรรทัดให้
          เท่ากัน ทำให้บางชื่อตัดลงบรรทัดใหม่ทั้งที่บรรทัดแรกยังเหลือที่ว่างอีกครึ่งบรรทัด
          ส่วน pretty เติมบรรทัดแรกให้เต็มก่อนแล้วค่อยขึ้นบรรทัดใหม่ แค่กันไม่ให้บรรทัด
          สุดท้ายเหลือคำเดียว (เบราว์เซอร์ที่ยังไม่รองรับจะตัดบรรทัดแบบปกติ ซึ่งก็คือ
          พฤติกรรมที่ต้องการอยู่แล้ว)
        */}
        <div className="text-pretty">
          <dt className="text-steel inline">{t(ui.labels.projectName)}:</dt>{' '}
          <dd className="text-ink inline text-lg font-medium">{t(item.name)}</dd>
        </div>

        <Row label={t(ui.labels.customer)}>{t(item.customer)}</Row>
        <Row label={t(ui.labels.location)}>{t(item.location)}</Row>
      </dl>
    </article>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-1.5">
      <dt className="text-steel inline">{label}:</dt>{' '}
      <dd className="text-ink inline">{children}</dd>
    </div>
  )
}
