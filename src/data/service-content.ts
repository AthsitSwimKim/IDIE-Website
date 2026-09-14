import type { LocalizedText } from '@/types/content'

// Overview copy revised in Thai and English against IDIE COMPANY PROFILE SHORT 26.pdf,
// pages 10–14. Intercom and PA/GA also reference INDUSTRONIC manufacturer information:
// https://www.industronic.com/products/functions
// https://www.industronic.com/solutions/
// Functions are conditional on the selected system, not universal service guarantees.

/**
 * เนื้อหาเชิงลึกของหน้าบริการ — แยกไฟล์จาก `services.ts`
 *
 * แยกเพราะสองอย่างนี้มีลักษณะต่างกัน: `services.ts` เก็บ **ข้อเท็จจริงของบริการ**
 * (ชื่อ ขอบเขต พื้นที่ใช้งาน) ที่มาจากเว็บเดิมของ IDIE ส่วนไฟล์นี้เป็น
 * **ความรู้เชิงวิศวกรรมของสายงาน** ที่เขียนเพิ่มเพื่อให้หน้าบริการมีน้ำหนัก
 * เท่ากับที่ฝ่ายวิศวกรรมของโรงงานคาดหวังจากผู้จัดจำหน่ายที่รู้จริง
 *
 * **ทุกข้อความในไฟล์นี้เป็นความรู้ทางเทคนิคที่ตรวจสอบได้ ไม่ใช่คำกล่าวอ้างเกี่ยวกับ IDIE**
 * — ไม่มีตัวเลขผลงาน จำนวนโครงการ ขนาดทีม หรือความสำเร็จที่พิสูจน์ไม่ได้
 * ศัพท์และค่ามาตรฐานที่อ้างถึง (ATEX · IECEx · IP ตาม IEC 60529 · Zone · gas group ·
 * temperature class) เป็นชุดเดียวกับที่ปรากฏใน catalog ของผู้ผลิตและในข้อมูลสินค้า
 * 103 รุ่นที่อยู่ในเว็บนี้แล้ว
 *
 * TODO: confirm with IDIE — ให้วิศวกรของบริษัทอ่านทวนก่อน production
 *
 * หมวด "ขั้นตอนการทำงาน" กับ "ประเด็นทางเทคนิคที่ควรรู้ก่อนออกแบบ" ถูกถอดออก
 * ตามที่เจ้าของเว็บสั่ง (ก.ย. 2026) พร้อมฟิลด์ process กับ technicalNotes ในไฟล์นี้
 * ถ้าจะเอากลับมาให้ดูที่ประวัติ git — เนื้อหาเดิมมีครบทั้งหกบริการ
 */

export interface ServiceDepth {
  /**
   * ภาพรวมงานฉบับเต็ม — ย่อหน้าละประเด็น
   *
   * แยกจาก `overview` ใน `services.ts` ที่เป็นประโยคสรุปหนึ่งบรรทัดสำหรับใช้เป็น
   * meta description และคำโปรยบนการ์ด ส่วนตรงนี้คือเนื้อหาที่ผู้อ่านซึ่งกำลัง
   * ประเมินว่าจะใช้บริการนี้หรือไม่ ต้องการจริง ๆ
   */
  overviewDetail: LocalizedText[]
  /** ข้อมูลที่ลูกค้าต้องเตรียมเพื่อให้ประเมินราคาได้ — ส่วนที่ผู้อ่านเอาไปใช้ได้ทันที */
  quoteChecklist: LocalizedText[]
}

export const serviceDepth: Record<string, ServiceDepth> = {
  /* ---------------------------------------------------------------------- */
  'intercommunication-system': {
    overviewDetail: [
      {
        th: 'ระบบมีโครงสร้างแบบโมดูลาร์ เพื่อจัดชุดอุปกรณ์และขยายระบบให้เหมาะกับแต่ละพื้นที่ รูปแบบการใช้งานอาจประกอบด้วยการเรียกเฉพาะจุด การสนทนาแบบไม่ต้องยกหู การประชุมสาย และการสนทนากลุ่มแบบ Party Line ตามฟังก์ชันของระบบที่เลือก',
        en: 'A modular architecture allows the equipment configuration and system capacity to match each site. Depending on the selected system, communication options include point-to-point calls, hands-free operation, conference calls and party-line conversations.',
      },
      {
        th: 'การเลือกสถานีสื่อสารควรพิจารณาระดับเสียงรบกวน สภาพแวดล้อม และข้อกำหนดของจุดติดตั้ง โดยเฉพาะพื้นที่กลางแจ้งหรือพื้นที่อันตราย ระบบที่รองรับสามารถเชื่อมต่อกับระบบประกาศและระบบสื่อสารอื่น เพื่อให้การประสานงานระหว่างพื้นที่เป็นไปอย่างต่อเนื่อง',
        en: 'Station selection takes account of ambient noise, environmental conditions and installation requirements, particularly outdoors and in hazardous areas. Where supported, integration with public address and other communication systems helps coordinate operations across the site.',
      },
    ],
    quoteChecklist: [
      { th: 'ผังโรงงานพร้อมตำแหน่งที่ต้องการติดตั้งสถานี', en: 'Plant layout with the intended station positions' },
      {
        th: 'เอกสารจำแนกพื้นที่อันตราย (Zone) ของแต่ละจุด',
        en: 'Hazardous area classification (Zone) for each location',
      },
      {
        th: 'ระดับเสียงรบกวนโดยประมาณของพื้นที่ที่จะติดตั้ง',
        en: 'Approximate ambient noise level in the areas concerned',
      },
      {
        th: 'ระบบเดิมที่ใช้อยู่ และต้องการเชื่อมต่อกับระบบเดิมหรือเปลี่ยนใหม่ทั้งหมด',
        en: 'The existing system, and whether it must be integrated with or fully replaced',
      },
      {
        th: 'สายสัญญาณเดิมที่มีอยู่ และระยะทางระหว่างจุดที่ไกลที่สุด',
        en: 'Existing cabling and the distance between the furthest points',
      },
    ],
  },

  /* ---------------------------------------------------------------------- */
  'public-address-warning-alarm': {
    overviewDetail: [
      {
        th: 'ระบบสามารถรองรับการประกาศสด ข้อความหรือเสียงเตือนที่บันทึกไว้ และการประกาศเฉพาะกลุ่มหรือทั่วพื้นที่ ตามความสามารถของระบบที่เลือก การจัดลำดับความสำคัญของประกาศและสัญญาณเตือนช่วยให้ข้อความฉุกเฉินได้รับการส่งต่ออย่างเหมาะสม',
        en: 'Depending on the selected system, functions include live announcements, recorded messages or alarm tones, and group or all-area broadcasts. Configured announcement and alarm priorities help ensure emergency messages take precedence when required.',
      },
      {
        th: 'องค์ประกอบของระบบประกอบด้วยชุดควบคุม เครื่องขยายเสียง ลำโพง และอุปกรณ์แจ้งเตือน เช่น ไซเรนหรือไฟสัญญาณ ตามข้อกำหนดของพื้นที่ ระบบที่รองรับยังสามารถรับสัญญาณจากระบบตรวจจับเพลิงไหม้และก๊าซ หรือระบบหยุดฉุกเฉิน เพื่อเริ่มลำดับการแจ้งเตือนที่กำหนดไว้',
        en: 'System components include controllers, amplifiers, loudspeakers and warning devices such as sirens or beacons, as required by the site. Compatible systems can also accept inputs from fire and gas detection or emergency shutdown systems to initiate configured warning sequences.',
      },
    ],
    quoteChecklist: [
      { th: 'ผังพื้นที่พร้อมขนาดและความสูงเพดาน', en: 'Area layout with dimensions and ceiling heights' },
      { th: 'ระดับเสียงรบกวนของแต่ละพื้นที่', en: 'Ambient noise level for each area' },
      { th: 'เอกสารจำแนกพื้นที่อันตรายและช่วงอุณหภูมิแวดล้อม', en: 'Area classification drawings and ambient temperature range' },
      { th: 'จำนวนโซนประกาศที่ต้องแยกกัน', en: 'How many independently addressable announcement zones are needed' },
      {
        th: 'ต้องเชื่อมกับระบบดับเพลิงหรือระบบหยุดฉุกเฉินเดิมหรือไม่',
        en: 'Whether it must interface with an existing fire or emergency shutdown system',
      },
      {
        th: 'ต้องการประกาศด้วยเสียงพูดสด ข้อความที่อัดไว้ หรือทั้งสองอย่าง',
        en: 'Live speech, pre-recorded messages, or both',
      },
    ],
  },

  /* ---------------------------------------------------------------------- */
  'network-system': {
    overviewDetail: [
      {
        th: 'รูปแบบการเชื่อมต่อเครือข่ายสามารถจัดเป็น Star, Ring หรือ Mesh โดยเลือกตามวัตถุประสงค์และลักษณะการใช้งาน เพื่อให้โครงข่ายสอดคล้องกับระบบที่ต้องเชื่อมต่อ',
        en: 'Network topology can follow a star, ring or mesh arrangement. The choice depends on the purpose of the network and its applications, so that the infrastructure suits the systems it connects.',
      },
      {
        th: 'การกำหนดขนาดระบบและชุดอุปกรณ์พิจารณาตามความต้องการของโครงการ ตั้งแต่เครือข่ายสำหรับธุรกิจขนาดเล็กและขนาดกลาง ไปจนถึงโครงข่ายของโครงการขนาดใหญ่',
        en: 'System scale and equipment configuration are selected for the project requirements, ranging from networks for small and medium-sized businesses to infrastructure for large projects.',
      },
    ],
    quoteChecklist: [
      { th: 'ผังอาคารพร้อมระยะระหว่างจุดที่ต้องเชื่อมถึงกัน', en: 'Site layout with the distances between the points to be linked' },
      {
        th: 'รายการอุปกรณ์ปลายทางที่จะต่อเข้าเครือข่าย และจำนวนพอร์ตที่ต้องการเผื่อไว้',
        en: 'The end devices to be connected, and how many spare ports to allow for',
      },
      { th: 'ตู้และเส้นทางสายเดิมที่ยังใช้ต่อได้ พร้อมสภาพปัจจุบัน', en: 'Existing cabinets and cable routes that can be reused, and their condition' },
      {
        th: 'มีไฟฟ้าและระบบไฟสำรองถึงจุดที่จะตั้งตู้สวิตช์หรือไม่',
        en: 'Whether power and UPS backup reach the intended switch cabinet locations',
      },
      {
        th: 'นโยบายของฝ่ายไอทีเรื่องการแยกเครือข่ายและการเข้าถึงจากภายนอก',
        en: 'The IT department’s policy on network separation and remote access',
      },
      { th: 'ช่วงเวลาที่เข้าทำงานได้ และมีช่วงหยุดเดินเครื่องหรือไม่', en: 'Available working windows, and whether there is a shutdown period' },
    ],
  },

  /* ---------------------------------------------------------------------- */
  'cctv-system': {
    overviewDetail: [
      {
        th: 'ระบบสามารถใช้เทคโนโลยีดิจิทัล IP อนาล็อก หรือไฮบริด โดยกำหนดขนาดให้เหมาะกับงาน ตั้งแต่ระบบขนาดเล็กไปจนถึงระบบขนาดใหญ่ที่รองรับกล้องหลายร้อยตัว',
        en: 'Systems can use digital IP, analogue or hybrid technology, with configurations ranging from small installations to large systems supporting several hundred cameras.',
      },
      {
        th: 'การเลือกกล้องพิจารณาทั้งความต้องการใช้งานและสภาพแวดล้อมของแต่ละจุด มีทั้งกล้องภายในอาคาร กล้องทนสภาพอากาศ กล้องป้องกันการระเบิด กล้องแบบยึดนิ่ง และกล้องแบบหมุน ก้มเงย และซูมได้ (PTZ) เพื่อให้เหมาะกับพื้นที่ที่ต้องการเฝ้าระวัง',
        en: 'Camera selection follows the operational requirements and environmental conditions at each location. Options include indoor, weatherproof and explosion-proof models, as well as fixed and pan-tilt-zoom (PTZ) cameras to suit the area being monitored.',
      },
    ],
    quoteChecklist: [
      { th: 'ผังพื้นที่พร้อมจุดที่ต้องการเห็นภาพ', en: 'Site layout marked with the views required' },
      {
        th: 'ต้องเก็บภาพย้อนหลังกี่วัน ตัวเลขนี้กำหนดขนาดสตอเรจโดยตรง',
        en: 'How many days of retention are required — this drives storage size directly',
      },
      {
        th: 'ต้องการเห็นแค่ว่ามีคน หรือเห็นชัดพอระบุตัวบุคคลและป้ายทะเบียน',
        en: 'Whether you need to detect presence, or identify faces and plates',
      },
      { th: 'สภาพแสงตอนกลางคืนของแต่ละจุด', en: 'Night-time lighting conditions at each point' },
      { th: 'ระบบเครือข่ายเดิมที่มีอยู่และสวิตช์ที่รองรับการจ่ายไฟผ่านสายแลน', en: 'Existing network infrastructure and PoE-capable switches' },
      { th: 'มีจุดใดอยู่ในพื้นที่จำแนกอันตรายหรือไม่', en: 'Whether any point falls inside a classified hazardous area' },
    ],
  },

  /* ---------------------------------------------------------------------- */
  /*
    เดิมคีย์นี้ชื่อ 'explosion‑proof-telephone-signalling' และเล่าเรื่องเป็นงานจัดจำหน่าย
    อุปกรณ์ Company Profile จัด Telephone System ไว้เป็นงานระบบเต็มรูปแบบ เนื้อหาจึงถูก
    ขยายให้เริ่มจากตัวระบบ (ตู้สาขา ชนิดของชุมสาย งานเดินสาย) แล้วค่อยลงไปที่การเลือก
    เครื่องปลายทาง — ย่อหน้าเรื่องพื้นที่อันตรายทั้งหมดยังอยู่ครบ เพราะเครื่องกันระเบิด
    เป็นชนิดหนึ่งของเครื่องปลายทางในระบบเดียวกันนี้ ไม่ได้หายไปไหน
  */
  'telephone-system': {
    overviewDetail: [
      {
        th: 'ตู้สาขาโทรศัพท์ PABX เป็นศูนย์กลางของระบบ ทำงานร่วมกับเครื่องโทรศัพท์ปลายทาง ตู้กระจายสาย MDF และ IDF รวมถึงสายสัญญาณและส่วนประกอบที่เกี่ยวข้อง การจัดระบบจึงต้องพิจารณาองค์ประกอบเหล่านี้ร่วมกัน',
        en: 'The PABX is the core of the system, working with telephone handsets, main and intermediate distribution frames (MDF and IDF), cabling and associated components. These elements form the complete telephone infrastructure.',
      },
      {
        th: 'เครื่องปลายทางมีทั้งแบบอนาล็อก ดิจิทัล และ IP โดยเลือกให้ตรงกับระบบและตำแหน่งใช้งาน เช่น ภายในอาคาร กลางแจ้ง ชนิดทนสภาพอากาศ หรือชนิดป้องกันการระเบิด ส่วนระบบไฮบริดรองรับการใช้อุปกรณ์อนาล็อกและ IP ภายในระบบเดียวกัน',
        en: 'Handsets are available in analogue, digital and IP versions, with indoor, outdoor, weatherproof and explosion-proof models selected to suit the system and location. Hybrid configurations allow analogue and IP devices to operate within a single system.',
      },
    ],
    quoteChecklist: [
      { th: 'จำนวนจุดใช้งานทั้งหมด และแยกว่าอยู่ในสำนักงานกี่จุด อยู่ในพื้นที่ผลิตกี่จุด', en: 'Total number of extensions, split between office and process areas' },
      { th: 'ระบบเดิมเป็นอนาล็อกหรือ IP และตู้สาขาเดิมยังใช้ต่อได้หรือไม่', en: 'Whether the existing system is analogue or IP, and whether the current PABX is to be reused' },
      {
        th: 'เอกสารจำแนกพื้นที่ที่ระบุโซน กลุ่มก๊าซ (IIA / IIB / IIC) และ temperature class (T1–T6) ของจุดที่อยู่ในบริเวณอันตราย',
        en: 'Area classification stating zone, gas group (IIA / IIB / IIC) and temperature class (T1–T6) for points in hazardous locations',
      },
      { th: 'อุณหภูมิแวดล้อมต่ำสุดและสูงสุดที่จุดติดตั้งเจอจริง', en: 'The lowest and highest ambient temperatures the point actually sees' },
      {
        th: 'สภาพกัดกร่อน เช่น ใกล้ทะเล ไอกรด หรือพื้นที่ล้างด้วยสารเคมี',
        en: 'Corrosive conditions — coastal, acid vapour, or chemical wash-down areas',
      },
      { th: 'ระยะสายจากตู้กระจายสายถึงจุดที่ไกลที่สุด', en: 'Cable distance from the distribution frame to the furthest point' },
    ],
  },

  /* ---------------------------------------------------------------------- */
  'access-control-system': {
    overviewDetail: [
      {
        th: 'นอกจากควบคุมการเข้าออก ระบบยังสามารถใช้บันทึกเวลาทำงานและเชื่อมโยงข้อมูลกับระบบเงินเดือนได้ ตามฟังก์ชันและการเชื่อมต่อของระบบที่เลือก',
        en: 'In addition to controlling entry, the system can support time and attendance recording and link to payroll systems, depending on the functions and interfaces selected.',
      },
      {
        th: 'ระบบสามารถเชื่อมต่อกับระบบป้องกันอัคคีภัย เพื่อให้ประตูที่กำหนดปลดล็อกเมื่อเกิดเพลิงไหม้และเอื้อต่อการออกจากอาคาร การทำงานร่วมกันนี้ต้องกำหนดให้สอดคล้องกับรูปแบบการควบคุมประตูและการอพยพของสถานที่',
        en: 'Integration with fire protection systems can release designated doors during a fire to facilitate evacuation. This operation is configured to suit the door-control arrangement and evacuation requirements of the facility.',
      },
    ],
    quoteChecklist: [
      { th: 'จำนวนประตูที่ต้องคุม และแต่ละจุดคุมทางเดียวหรือสองทาง', en: 'Number of controlled doors, and whether each is one-way or two-way' },
      { th: 'จำนวนผู้ใช้ทั้งหมด แยกพนักงานประจำ ผู้รับเหมา และผู้มาติดต่อ', en: 'Total users, split between staff, contractors and visitors' },
      { th: 'ต้องใช้เป็นระบบบันทึกเวลาทำงานด้วยหรือไม่ และต้องส่งข้อมูลให้ระบบเงินเดือนตัวไหน', en: 'Whether it must double as time attendance, and which payroll system receives the data' },
      { th: 'ระบบแจ้งเหตุเพลิงไหม้ที่มีอยู่เดิม และจุดที่ต้องปลดล็อกเมื่อเกิดเหตุ', en: 'The existing fire alarm system and which doors must release on alarm' },
      { th: 'พื้นที่ที่ต้องมีใบอนุญาตทำงานก่อนเข้า', en: 'Areas requiring a work permit before entry' },
      { th: 'สภาพแวดล้อมของจุดติดตั้ง เช่น กลางแจ้ง ฝุ่นมาก หรืออยู่ในพื้นที่จำแนกอันตราย', en: 'Environment at each point — outdoor, dusty, or inside a classified area' },
    ],
  },
}
