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
      th: 'ระบบสื่อสารภายในโรงงานที่ได้ยินชัดแม้ในพื้นที่เสียงดังและพื้นที่เสี่ยงระเบิด',
      en: 'Plant-wide intercom that stays intelligible in high-noise and hazardous areas.',
    },
    overview: {
      th: 'ออกแบบ จัดหา และติดตั้งระบบอินเตอร์คอมอุตสาหกรรมสำหรับพื้นที่ผลิต ห้องควบคุม และพื้นที่เสี่ยง โดยเลือกอุปกรณ์ให้เหมาะกับระดับเสียงรบกวนและการจำแนกพื้นที่อันตรายของแต่ละจุด',
      en: 'Design, supply and installation of industrial intercom systems for process areas, control rooms and classified zones — with equipment selected to match the noise level and area classification of each location.',
    },
    scope: [
      { th: 'สำรวจหน้างานและออกแบบระบบ', en: 'Site survey and system design' },
      { th: 'จัดหาอุปกรณ์จากผู้ผลิตยุโรปและสหรัฐฯ', en: 'Procurement from European and US manufacturers' },
      { th: 'ติดตั้งและทดสอบการใช้งาน', en: 'Installation and commissioning' },
      { th: 'บริการหลังการขายและอะไหล่', en: 'After-sales service and spare parts' },
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
      en: 'PA/GA and siren systems for plant-wide announcement and emergency alarm.',
    },
    overview: {
      th: 'ระบบประกาศและสัญญาณเตือนภัยแบบครบวงจร ครอบคลุมทั้งลำโพง อุปกรณ์ส่งเสียง ไฟสัญญาณ ไซเรน และจุดแจ้งเหตุด้วยมือ ออกแบบให้ครอบคลุมพื้นที่ตามข้อกำหนดด้านความปลอดภัยของโรงงาน',
      en: 'End-to-end public address and general alarm systems covering loudspeakers, sounders, beacons, sirens and manual call points — engineered for area coverage that meets plant safety requirements.',
    },
    scope: [
      { th: 'คำนวณการครอบคลุมเสียงและแสงสัญญาณ', en: 'Acoustic and visual coverage calculation' },
      { th: 'ออกแบบระบบและจัดทำแบบ', en: 'System design and documentation' },
      { th: 'จัดหา ติดตั้ง และทดสอบ', en: 'Supply, installation and testing' },
      { th: 'บำรุงรักษาและตรวจสอบตามรอบ', en: 'Maintenance and periodic inspection' },
    ],
    applications: [
      { th: 'ประกาศทั่วพื้นที่โรงงาน', en: 'Plant-wide announcement' },
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
      เดิมรายการนี้ชื่อ `explosion-proof-telephone-signalling` และเล่าเรื่องเป็น
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
      en: 'Office and plant telephony, from the PABX through to explosion-proof handsets in the field.',
    },
    overview: {
      th: 'ออกแบบ จัดหา และติดตั้งระบบโทรศัพท์สำหรับสำนักงานและโรงงาน ทั้งแบบอนาล็อกเดิม แบบ IP และแบบไฮบริดที่รองรับทั้งสองอย่างในระบบเดียว โดยมีตู้สาขา PABX เป็นหัวใจของระบบ ตามด้วยเครื่องปลายทางที่เลือกให้ตรงกับจุดติดตั้ง ตั้งแต่เครื่องในสำนักงานไปจนถึงเครื่องกันสภาพอากาศและเครื่องชนิดกันระเบิด รวมถึงงานตู้กระจายสาย MDF/IDF และการเดินสายทั้งระบบ',
      en: 'Design, supply and installation of telephone systems for offices and plants — traditional analogue, IP, or hybrid systems supporting both at once. The PABX sits at the heart of the system, followed by handsets selected for where they are mounted: office sets, weatherproof units and explosion-proof versions — together with the MDF/IDF distribution frames and cabling that tie them together.',
    },
    scope: [
      { th: 'ออกแบบระบบและเลือกตู้สาขา PABX', en: 'System design and PABX selection' },
      {
        th: 'เลือกเครื่องปลายทางตามจุดติดตั้ง (ในอาคาร กลางแจ้ง กันสภาพอากาศ กันระเบิด)',
        en: 'Handset selection by location — indoor, outdoor, weatherproof, explosion-proof',
      },
      { th: 'งานตู้กระจายสาย MDF / IDF และการเดินสาย', en: 'MDF / IDF distribution frames and cabling' },
      {
        th: 'เชื่อมต่อกับชุมสายภายนอกและระบบเดิมของโรงงาน',
        en: 'Integration with external lines and existing plant systems',
      },
      { th: 'ติดตั้ง ทดสอบ และบริการหลังการขาย', en: 'Installation, testing and after-sales service' },
    ],
    applications: [
      { th: 'ระบบโทรศัพท์สำนักงานและอาคารควบคุม', en: 'Office and control building telephony' },
      { th: 'จุดโทรฉุกเฉินในพื้นที่ผลิต', en: 'Emergency call points in process areas' },
      { th: 'เครื่องกันระเบิดในพื้นที่จำแนกอันตราย', en: 'Explosion-proof sets in classified areas' },
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
      th: 'ออกแบบและวางโครงข่าย LAN และ WAN สำหรับพื้นที่อุตสาหกรรม ทั้งแกนหลักไฟเบอร์ระหว่างอาคาร สวิตช์ระดับอุตสาหกรรมในตู้สนาม และการจ่ายไฟผ่านสาย PoE ให้อุปกรณ์ปลายทาง เลือกผังเครือข่ายแบบ star ring หรือ mesh ตามลักษณะการใช้งานของแต่ละพื้นที่ และแยกภาระข้อมูลของระบบสื่อสารออกจากเครือข่ายที่ระบบควบคุมกระบวนการผลิตใช้อยู่',
      en: 'Design and installation of LAN and WAN infrastructure for industrial sites — fibre backbone between buildings, industrial-grade switches in field cabinets, and PoE power to end devices. Star, ring or mesh topology is chosen to suit how each area is used, and communication traffic is kept off the network the process control system depends on.',
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
      th: 'ออกแบบ จัดหา และติดตั้งระบบกล้องวงจรปิดที่ทนสภาพแวดล้อมโรงงาน รองรับได้ทั้งระบบ IP ดิจิทัล ระบบอนาล็อกเดิม และระบบไฮบริด ตั้งแต่ระบบขนาดเล็กไปจนถึงระบบหลายร้อยกล้อง เลือกชนิดกล้องตามหน้างานจริง ทั้งกล้องในอาคาร กล้องกันสภาพอากาศ กล้องชนิดกันระเบิด กล้องแบบยึดนิ่งและแบบหมุนก้มเงยซูมได้ พร้อมคำนวณพื้นที่จัดเก็บให้ตรงกับระยะเวลาเก็บภาพย้อนหลังที่โรงงานต้องการ',
      en: 'Design, supply and installation of CCTV built for plant conditions — digital IP, conventional analogue or hybrid, from a handful of cameras to systems supporting several hundred. Camera type is selected against the actual location: indoor, weatherproof, explosion-proof, fixed or pan-tilt-zoom, with recording storage sized to the retention period the site requires.',
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
      th: 'ออกแบบและติดตั้งระบบควบคุมการเข้าออกที่ทำหน้าที่เฝ้าระวัง ป้องกัน และบริหารสิทธิ์การเข้าถึงของพนักงานและผู้รับเหมาในอาคารหรือพื้นที่โรงงาน ใช้เป็นระบบบันทึกเวลาทำงานเพื่อส่งต่อให้ระบบเงินเดือนได้ และเชื่อมกับระบบป้องกันอัคคีภัยเพื่อให้ประตูปลดล็อกเมื่อเกิดเหตุ ซึ่งเป็นเงื่อนไขด้านความปลอดภัยที่ต้องออกแบบไว้ตั้งแต่ต้น ไม่ใช่เพิ่มทีหลัง',
      en: 'Design and installation of access control that monitors, protects and manages the authorised access of employees and contractors across a building or plant. The same system can serve as time and attendance — feeding payroll — and links to fire protection so that doors release under a fire condition, a safety requirement that has to be designed in from the start rather than added later.',
    },
    scope: [
      { th: 'กำหนดสิทธิ์การเข้าถึงตามพื้นที่และกลุ่มผู้ใช้', en: 'Access rights by area and user group' },
      { th: 'ออกแบบจุดควบคุมประตูและอุปกรณ์อ่านบัตร', en: 'Door controller and reader point design' },
      {
        th: 'เชื่อมกับระบบป้องกันอัคคีภัยให้ประตูปลดล็อกเมื่อเกิดเหตุ',
        en: 'Interlock with fire protection so doors release on alarm',
      },
      { th: 'เชื่อมข้อมูลกับระบบบันทึกเวลาและระบบเงินเดือน', en: 'Integration with time attendance and payroll' },
      { th: 'ติดตั้ง ทดสอบ และบริการหลังการขาย', en: 'Installation, testing and after-sales service' },
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
