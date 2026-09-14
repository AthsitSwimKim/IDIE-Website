import type { Service } from '@/types/content'

/**
 * บริการจริง — **ยึดตามหัวข้อ System Integrator ใน Company Profile ฉบับย่อ 2026**
 * ชื่อภาษาอังกฤษ = ของจริง · ชื่อและคำอธิบายภาษาไทย = ร่าง TODO: confirm with IDIE
 *
 * เอกสารระบุกลุ่มงานไว้ห้าข้อตามลำดับนี้
 *   1. Intercom, Public Address and General Alarm (PA/GA) system  (+ Siren system)
 *   2. Telephone System
 *   3. WAN/LAN System
 *   4. CCTV
 *   5. Access Control System
 *
 * ที่นี่กลายเป็นหกรายการเพราะแยกข้อ 1 ออกเป็นอินเตอร์คอมกับ PA/GA คนละหน้า —
 * สองงานนี้ใช้อุปกรณ์และวิธีออกแบบร่วมกันก็จริง แต่ผู้อ่านมาด้วยโจทย์คนละแบบ
 * (คุยกันให้รู้เรื่องระหว่างกะ กับ แจ้งอพยพทั้งโรงงาน) ลำดับที่เหลือตรงกับเอกสารทุกข้อ
 *
 * ⚠️ รายการ Mechanical / Electrical / Automation & Control ในเอกสารโครงการต้นฉบับ
 *    ไม่ใช่บริการของ IDIE — เป็นตัวอย่างทั่วไปที่เขียนไว้ก่อนได้ข้อมูลจริง
 *
 * ภาพและ gallery ยังไม่ครบ — ต้องขอจาก IDIE (ดู docs/data-requests.md)
 */
export const services: Service[] = [
  {
    slug: 'intercommunication-system',
    name: { th: 'ระบบอินเตอร์คอมอุตสาหกรรม', en: 'Intercommunication System' },
    shortDescription: {
      th: 'ระบบสื่อสารภายในโรงงานที่ได้รับการออกแบบสำหรับพื้นที่เสียงดังและพื้นที่เสี่ยงระเบิด',
      en: 'Plant-wide communication designed for high-noise and hazardous areas.',
    },
    overview: {
      th: 'ระบบอินเตอร์คอมอุตสาหกรรมเชื่อมการสื่อสารสองทางระหว่างห้องควบคุมกับผู้ปฏิบัติงานในพื้นที่โรงงาน ช่วยให้การส่งคำสั่งและประสานงานเป็นไปอย่างรวดเร็ว ผ่านสถานีแม่และสถานีภาคสนามที่จัดวางตามลักษณะงาน',
      en: 'Industrial intercom systems provide two-way communication between control rooms and field operators, enabling prompt instructions and coordination through master stations and field stations positioned around the plant.',
    },
    scope: [
      { th: 'สำรวจหน้างานและออกแบบระบบ', en: 'Site survey and system design' },
      { th: 'จัดหาอุปกรณ์จากผู้ผลิตยุโรปและสหรัฐฯ', en: 'Procurement from European and US manufacturers' },
      { th: 'ติดตั้งและทดสอบการใช้งาน', en: 'Installation and commissioning' },
      { th: 'บริการหลังการขายและอะไหล่', en: 'After‑sales service and spare parts' },
    ],
    applications: [
      { th: 'ห้องควบคุมกับพื้นที่ผลิต', en: 'Control room to process area' },
      { th: 'จุดปฏิบัติงานในพื้นที่เสี่ยงระเบิด', en: 'Operator points in hazardous zones' },
      { th: 'ระบบ party line และ conference', en: 'Party line and conference systems' },
      {
        th: 'สื่อสารสองทางระหว่างสถานีแม่กับสถานีย่อยในพื้นที่',
        en: 'Two-way communication between master stations and field stations',
      },
    ],
    icon: 'radio',
    cover: {
      src: '/images/services/intercommunication-system/cover.webp',
      srcSet: '/images/services/intercommunication-system/cover-800.webp 1x, /images/services/intercommunication-system/cover.webp 2x',
      alt: {
        th: 'ระบบอินเตอร์คอมอุตสาหกรรมติดตั้งในพื้นที่โรงงาน',
        en: 'Industrial intercom station installed in a process area',
      },
      width: 1181,
      height: 1181,
    },
    featured: true,
    order: 1,
  },
  {
    slug: 'public-address-warning-alarm',
    name: {
      th: 'ระบบประกาศและสัญญาณเตือนภัย',
      en: 'Public Address & General Alarm System (PA/GA)',
    },
    shortDescription: {
      th: 'ระบบ PA/GA และไซเรน สำหรับประกาศทั่วโรงงานและแจ้งเตือนเหตุฉุกเฉิน',
      en: 'PA/GA and siren systems for plant‑wide announcement and emergency alarm.',
    },
    overview: {
      th: 'ระบบประกาศและสัญญาณเตือนภัย PA/GA ใช้กระจายเสียงประกาศและแจ้งเตือนบุคลากรในโรงงาน ทั้งการสื่อสารระหว่างการปฏิบัติงานและการแจ้งเหตุฉุกเฉิน โดยกำหนดพื้นที่รับฟังและรูปแบบสัญญาณให้เหมาะกับการใช้งาน',
      en: 'Public Address and General Alarm (PA/GA) systems distribute announcements and warnings to plant personnel for routine operations and emergency notification, with coverage areas and alarm functions configured for the application.',
    },
    scope: [
      { th: 'คำนวณการครอบคลุมเสียงและแสงสัญญาณ', en: 'Acoustic and visual coverage calculation' },
      { th: 'ออกแบบระบบและจัดทำแบบ', en: 'System design and documentation' },
      { th: 'จัดหา ติดตั้ง และทดสอบ', en: 'Supply, installation and testing' },
      { th: 'บำรุงรักษาและตรวจสอบตามรอบ', en: 'Maintenance and periodic inspection' },
    ],
    applications: [
      { th: 'ประกาศทั่วพื้นที่โรงงาน', en: 'Plant‑wide announcement' },
      { th: 'สัญญาณอพยพฉุกเฉิน', en: 'Emergency evacuation alarm' },
      { th: 'ไซเรนแจ้งเหตุครอบคลุมพื้นที่กว้าง', en: 'Wide-area siren warning' },
      { th: 'แจ้งเตือนพื้นที่เสียงดังสูง', en: 'High-noise area notification' },
    ],
    icon: 'megaphone',
    cover: {
      src: '/images/services/public-address-warning-alarm/cover.webp',
      alt: {
        th: 'ลำโพงและไฟสัญญาณเตือนภัยติดตั้งบนโครงสร้างโรงงาน',
        en: 'Loudspeaker and warning beacon mounted on plant structure',
      },
      width: 800,
      height: 500,
    },
    featured: true,
    order: 2,
  },
  {
    /*
      เดิมรายการนี้ชื่อ `explosion‑proof-telephone-signalling` และเล่าเรื่องเป็น
      "งานจัดจำหน่ายโทรศัพท์กันระเบิด" Company Profile ฉบับย่อ 2026 จัด Telephone System
      ไว้เป็นงาน system integration ข้อที่ 2 ไม่ใช่งานขายอุปกรณ์ — ขอบเขตจึงกว้างกว่าเดิม
      คือครอบตั้งแต่ตู้สาขา PABX ไปจนถึงเครื่องปลายทางและงานเดินสาย MDF/IDF
      ส่วนเครื่องชนิดกันระเบิดกลายเป็น "หนึ่งในชนิดของเครื่องปลายทาง" ตามที่เอกสารเขียนไว้
      (URL เดิมถูก redirect มาที่นี่ ดู src/router.tsx และ server/src/redirects.ts)
    */
    slug: 'telephone-system',
    name: { th: 'ระบบโทรศัพท์', en: 'Telephone System' },
    shortDescription: {
      th: 'ระบบโทรศัพท์ของสำนักงานและโรงงาน ตั้งแต่ตู้สาขาจนถึงเครื่องกันระเบิดในพื้นที่ผลิต',
      en: 'Office and plant telephony, from the PABX through to explosion‑proof handsets in the field.',
    },
    overview: {
      th: 'ระบบโทรศัพท์เป็นช่องทางสื่อสารหลักของสำนักงานและโรงงาน สำหรับติดต่อภายในพื้นที่และเชื่อมต่อกับบุคคลภายนอก ครอบคลุมทั้งระบบอนาล็อก ระบบโทรศัพท์ IP และระบบไฮบริดที่ใช้งานอนาล็อกร่วมกับ IP',
      en: 'Telephone systems provide a principal communication channel for offices and plants, supporting calls within the premises and to external parties. Available configurations include analogue, IP and hybrid systems that combine analogue and IP telephony.',
    },
    scope: [
      { th: 'ออกแบบระบบและเลือกตู้สาขา PABX', en: 'System design and PABX selection' },
      {
        th: 'เลือกเครื่องปลายทางตามจุดติดตั้ง (ในอาคาร กลางแจ้ง กันสภาพอากาศ กันระเบิด)',
        en: 'Handset selection by location — indoor, outdoor, weatherproof, explosion‑proof',
      },
      { th: 'งานตู้กระจายสาย MDF / IDF และการเดินสาย', en: 'MDF / IDF distribution frames and cabling' },
      {
        th: 'เชื่อมต่อกับชุมสายภายนอกและระบบเดิมของโรงงาน',
        en: 'Integration with external lines and existing plant systems',
      },
      { th: 'ติดตั้ง ทดสอบ และบริการหลังการขาย', en: 'Installation, testing and after‑sales service' },
    ],
    applications: [
      { th: 'ระบบโทรศัพท์สำนักงานและอาคารควบคุม', en: 'Office and control building telephony' },
      { th: 'จุดโทรฉุกเฉินในพื้นที่ผลิต', en: 'Emergency call points in process areas' },
      { th: 'เครื่องกันระเบิดในพื้นที่จำแนกอันตราย', en: 'Explosion‑proof sets in classified areas' },
      { th: 'ทยอยเปลี่ยนจากอนาล็อกเป็น IP แบบไฮบริด', en: 'Phased analogue-to-IP migration on a hybrid system' },
    ],
    icon: 'phone',
    cover: {
      src: '/images/services/telephone-system/cover.webp',
      srcSet:
        '/images/services/telephone-system/cover-800.webp 1x, /images/services/telephone-system/cover.webp 2x',
      alt: {
        th: 'ผังระบบโทรศัพท์ที่เชื่อมสำนักงานใหญ่กับสาขา ผ่านตู้สาขาและ media gateway ออกไปยังชุมสายภายนอกและอินเทอร์เน็ต โดยมีเครื่องปลายทางทั้งแบบอนาล็อก SIP และซอฟต์โฟน',
        en: 'Telephone system diagram linking a headquarters to branch sites through a PABX and media gateways out to PSTN and internet, with analogue, SIP and softphone endpoints',
      },
      width: 1194,
      height: 582,
      kind: 'diagram',
    },
    featured: true,
    order: 3,
  },
  /*
    เดิมสองรายการถัดไปนี้เป็นบริการเดียวชื่อ "Network & CCTV System" ตามที่เว็บเดิม
    ของบริษัทเขียนไว้ แยกออกจากกันแล้วเพราะเป็นงานคนละแบบที่ลูกค้าถามคนละคำถาม —
    ฝ่ายไอทีถามเรื่องโครงข่ายและแบนด์วิดท์ ส่วนฝ่ายความปลอดภัยถามเรื่องมุมกล้อง
    และระยะเวลาเก็บภาพ การรวมไว้หน้าเดียวทำให้ทั้งสองฝ่ายต้องอ่านผ่านเรื่องที่
    ไม่ใช่ของตัวเองก่อน (ทั้งสองงานยังทำร่วมกันในโครงการเดียวได้ตามปกติ)
  */
  {
    slug: 'network-system',
    name: { th: 'ระบบเครือข่าย WAN/LAN', en: 'WAN/LAN & Network System' },
    shortDescription: {
      th: 'โครงข่ายสื่อสารที่รองรับระบบอินเตอร์คอม ระบบประกาศ และกล้องวงจรปิดของทั้งโรงงาน',
      en: 'The communication backbone that carries intercom, PA and CCTV traffic across the plant.',
    },
    overview: {
      th: 'ระบบเครือข่าย LAN และ WAN เป็นโครงสร้างพื้นฐานสำหรับการรับส่งข้อมูลและการเชื่อมต่อระบบที่ใช้ Internet Protocol (IP) การออกแบบเครือข่ายและเลือกอุปกรณ์ให้เหมาะสมจึงเป็นส่วนสำคัญของระบบสื่อสารโดยรวม',
      en: 'Local Area Networks (LAN) and Wide Area Networks (WAN) provide the infrastructure for data transfer and systems that use Internet Protocol (IP). Appropriate network design and equipment selection are therefore central to the overall communication infrastructure.',
    },
    scope: [
      { th: 'สำรวจเส้นทางสายและออกแบบผังเครือข่าย', en: 'Cable route survey and network topology design' },
      { th: 'ประเมินแบนด์วิดท์และงบกำลังไฟ PoE', en: 'Bandwidth and PoE power budget sizing' },
      { th: 'จัดหาสวิตช์อุตสาหกรรมและอุปกรณ์ตู้สนาม', en: 'Supply of industrial switches and field cabinet equipment' },
      { th: 'เดินสาย ติดตั้ง และทดสอบพร้อมส่งมอบผังจริง', en: 'Cabling, installation and testing with as-built documentation' },
    ],
    applications: [
      { th: 'แกนหลักเชื่อมอาคารสำนักงานกับพื้นที่ผลิต', en: 'Backbone linking offices and process areas' },
      { th: 'เครือข่ายรองรับระบบ PA/GA และอินเตอร์คอมแบบ IP', en: 'Network for IP-based PA/GA and intercom systems' },
      { th: 'เครือข่ายกล้องที่แยกออกจากระบบควบคุม', en: 'Camera network segregated from process control' },
      { th: 'เชื่อมโยงหลายไซต์เข้าด้วยกันผ่าน WAN', en: 'Linking multiple sites over a WAN' },
    ],
    icon: 'network',
    cover: {
      src: '/images/services/network-system/cover.webp',
      srcSet:
        '/images/services/network-system/cover-800.webp 1x, /images/services/network-system/cover.webp 2x',
      alt: {
        th: 'ผังเครือข่ายที่แยกชั้นแกนหลักกับชั้นขอบออกจากกัน เชื่อมกลุ่มผู้ใช้ผ่านสวิตช์เข้าหาแกนกลาง พร้อมสตอเรจบนเครือข่าย เราเตอร์ออกอินเทอร์เน็ต และช่องทาง VPN จากระยะไกล โดยแยกสีของลิงก์ตามความเร็ว',
        en: 'Network diagram separating a core layer from edge layers, with user groups reaching the core through switches, network-attached storage, internet routers and a remote VPN path, colour-coded by link speed',
      },
      width: 1001,
      height: 690,
      kind: 'diagram',
    },
    order: 4,
  },
  {
    slug: 'cctv-system',
    name: { th: 'ระบบกล้องวงจรปิด (CCTV)', en: 'Closed Circuit Television (CCTV) System' },
    shortDescription: {
      th: 'ระบบกล้องวงจรปิดสำหรับพื้นที่อุตสาหกรรม พื้นที่กลางแจ้ง และพื้นที่จำแนกอันตราย',
      en: 'CCTV systems for industrial, outdoor and classified areas.',
    },
    overview: {
      th: 'ระบบกล้องวงจรปิด CCTV เป็นส่วนหนึ่งของระบบเฝ้าระวังและรักษาความปลอดภัยในโรงงาน ใช้ติดตามความผิดปกติในพื้นที่ปฏิบัติงานและกระบวนการผลิต รวมถึงเฝ้าระวังการบุกรุกบริเวณแนวรั้วและขอบเขตพื้นที่',
      en: 'Closed Circuit Television (CCTV) forms part of plant surveillance and security systems. It supports monitoring for abnormalities in operating and process areas, as well as intrusion along fences and site boundaries.',
    },
    scope: [
      { th: 'สำรวจจุดที่ต้องการเห็นภาพและออกแบบมุมกล้อง', en: 'Survey of required views and camera coverage design' },
      { th: 'จัดหากล้องกันระเบิดและกันสภาพอากาศ', en: 'Supply of Ex and weatherproof cameras' },
      { th: 'คำนวณพื้นที่จัดเก็บตามระยะเวลาเก็บภาพ', en: 'Storage sizing against the retention period' },
      { th: 'ติดตั้ง ตั้งค่าระบบบันทึก และทดสอบทั้งกลางวันกลางคืน', en: 'Installation, recorder setup and day/night verification' },
    ],
    applications: [
      { th: 'เฝ้าระวังพื้นที่ผลิต', en: 'Process area surveillance' },
      { th: 'ความปลอดภัยรอบขอบเขตโรงงาน', en: 'Plant perimeter security' },
      { th: 'ตรวจการณ์จุดเสี่ยงจากห้องควบคุม', en: 'Remote monitoring of critical points' },
    ],
    icon: 'video',
    cover: {
      src: '/images/services/cctv-system/cover.webp',
      srcSet:
        '/images/services/cctv-system/cover-800.webp 1x, /images/services/cctv-system/cover.webp 2x',
      alt: {
        th: 'ผังระบบกล้องวงจรปิดหลายอาคาร กล้องต่อเข้าเครื่องบันทึกประจำอาคารด้วยสายโคแอกเชียลและสาย IP แล้วเชื่อมถึงกันผ่าน LAN และ WAN เพื่อดูภาพรวม 16 กล้องจากห้องควบคุมและจากเครื่องลูกข่ายระยะไกล',
        en: 'Multi-building CCTV diagram: cameras feed local recorders over coaxial and IP links, tied together across LAN and WAN so a 16-camera view is available from the control room and from a remote client',
      },
      width: 1019,
      height: 712,
      kind: 'diagram',
    },
    order: 5,
  },
  {
    /* งานข้อที่ 5 ใน Company Profile — ไม่เคยมีบนเว็บมาก่อนทั้งที่บริษัททำอยู่จริง */
    slug: 'access-control-system',
    name: { th: 'ระบบควบคุมการเข้าออก', en: 'Access Control System' },
    shortDescription: {
      th: 'ระบบควบคุมสิทธิ์การเข้าออกอาคารและพื้นที่ผลิต พร้อมเชื่อมกับระบบบันทึกเวลาและระบบดับเพลิง',
      en: 'Controlled entry to buildings and process areas, tied into time attendance and fire protection.',
    },
    overview: {
      th: 'ระบบควบคุมการเข้าออกช่วยตรวจสอบและบริหารสิทธิ์การเข้าถึงอาคารหรือสถานประกอบการของพนักงานและผู้ปฏิบัติงาน เป็นส่วนหนึ่งของระบบรักษาความปลอดภัยที่กำหนดให้บุคคลเข้าใช้งานพื้นที่ตามสิทธิ์ที่ได้รับ',
      en: 'Access control systems monitor and manage authorised entry for employees and workers in buildings and facilities. As part of the security system, they regulate access according to assigned permissions.',
    },
    scope: [
      { th: 'กำหนดสิทธิ์การเข้าถึงตามพื้นที่และกลุ่มผู้ใช้', en: 'Access rights by area and user group' },
      { th: 'ออกแบบจุดควบคุมประตูและอุปกรณ์อ่านบัตร', en: 'Door controller and reader point design' },
      {
        th: 'เชื่อมกับระบบป้องกันอัคคีภัยให้ประตูปลดล็อกเมื่อเกิดเหตุ',
        en: 'Interlock with fire protection so doors release on alarm',
      },
      { th: 'เชื่อมข้อมูลกับระบบบันทึกเวลาและระบบเงินเดือน', en: 'Integration with time attendance and payroll' },
      { th: 'ติดตั้ง ทดสอบ และบริการหลังการขาย', en: 'Installation, testing and after‑sales service' },
    ],
    applications: [
      { th: 'ทางเข้าออกอาคารสำนักงานและห้องควบคุม', en: 'Office and control room entrances' },
      { th: 'พื้นที่หวงห้ามภายในโรงงาน', en: 'Restricted areas inside the plant' },
      { th: 'บันทึกเวลาเข้าออกของพนักงานและผู้รับเหมา', en: 'Time recording for staff and contractors' },
    ],
    icon: 'lock',
    cover: {
      src: '/images/services/access-control-system/cover.webp',
      alt: {
        th: 'ผังลำดับเหตุการณ์ของระบบรักษาความปลอดภัยอาคาร ตั้งแต่การเปิดใช้งานระบบ การตรวจจับผู้บุกรุกและบันทึกภาพด้วยกล้องวงจรปิด การแจ้งไปยังศูนย์เฝ้าระวัง ไปจนถึงการเข้าออกนอกเวลาด้วยบัตรหรือรหัส และรายงานบันทึกเหตุการณ์',
        en: 'Sequence diagram of a building security system: arming the system, an intruder triggering detection and CCTV recording, the alert reaching a monitoring centre, after-hours entry by card or keypad, and the resulting audit trail',
      },
      width: 620,
      height: 313,
      kind: 'diagram',
    },
    order: 6,
  },
]

/**
 * ความสามารถที่คร่อมทุกบริการ — ใช้ในหน้า Home ส่วน Engineering Highlights
 * มาจากข้อความ "design and engineering, procurement ... and service company" บนเว็บเดิม
 */
export const capabilities = [
  {
    id: 'design-engineering',
    name: { th: 'ออกแบบและงานวิศวกรรม', en: 'Design & Engineering' },
  },
  {
    id: 'procurement',
    name: { th: 'จัดหาอุปกรณ์มาตรฐาน', en: 'Certified Procurement' },
  },
  {
    id: 'service',
    name: { th: 'ติดตั้งและบริการหลังการขาย', en: 'Installation & Service' },
  },
] as const
