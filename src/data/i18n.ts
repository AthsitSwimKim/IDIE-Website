import type { LocalizedText } from '@/types/content'

/**
 * ข้อความ UI ที่ไม่ใช่ "เนื้อหา" — ปุ่ม, label, empty state, ชื่อเมนู
 * เนื้อหาจริง (บริการ สินค้า ลูกค้า) อยู่ในไฟล์ data อื่น ไม่ใช่ที่นี่
 *
 * แยกกันเพราะสองอย่างนี้มีเจ้าของต่างกัน — UI string เราคุมเอง
 * ส่วนเนื้อหาต้องรอ IDIE ยืนยัน
 */
export const ui = {
  nav: {
    home: { th: 'หน้าแรก', en: 'Home' },
    about: { th: 'เกี่ยวกับเรา', en: 'About Us' },
    services: { th: 'บริการ', en: 'Services' },
    products: { th: 'สินค้า', en: 'Products' },
    reference: { th: 'ลูกค้าอ้างอิง', en: 'Reference' },
    projects: { th: 'ผลงาน', en: 'Projects' },
    news: { th: 'ข่าวสาร', en: 'News' },
    careers: { th: 'ร่วมงานกับเรา', en: 'Careers' },
    contact: { th: 'ติดต่อเรา', en: 'Contact Us' },
    brands: { th: 'แบรนด์คู่ค้า', en: 'Brand Partners' },
  },

  footer: {
    tagline: {
      th: 'ระบบสื่อสารและสัญญาณเตือนภัยสำหรับโรงงานอุตสาหกรรมและพื้นที่อันตราย ตั้งแต่ปี 2539',
      en: 'Industrial communication and safety signalling for plants and hazardous areas since 1996.',
    },
    exploreHeading: { th: 'สำรวจเว็บไซต์', en: 'Explore' },
    companyHeading: { th: 'บริษัท', en: 'Company' },
    contactHeading: { th: 'ติดต่อ', en: 'Get in touch' },
    fax: { th: 'แฟกซ์', en: 'Fax' },
    rights: { th: 'สงวนลิขสิทธิ์', en: 'All rights reserved.' },
    prototypeNote: {
      th: 'เว็บไซต์ต้นแบบ — เนื้อหาบางส่วนยังรอข้อมูลจากบริษัท',
      en: 'Prototype site — some content is still awaiting company data.',
    },
  },

  brandsPage: {
    title: { th: 'แบรนด์คู่ค้าของเรา', en: 'Our brand partners' },
    lead: {
      th: 'IDIE เป็นตัวแทนจำหน่ายผู้ผลิตอุปกรณ์สื่อสารและสัญญาณเตือนภัยจากยุโรป ที่ฝ่ายวิศวกรรมของโรงงานปิโตรเคมีรู้จักและระบุในสเปกอยู่แล้ว',
      en: 'IDIE distributes European manufacturers of communication and signalling equipment that plant engineering teams already know and specify.',
    },
    seoDescription: {
      th: 'Industronic, FHF และ MEDC — แบรนด์ผู้ผลิตอุปกรณ์สื่อสารและสัญญาณเตือนภัยที่ IDIE เป็นตัวแทนจำหน่าย',
      en: 'Industronic, FHF and MEDC — the communication and signalling manufacturers IDIE distributes.',
    },
    suppliesHeading: { th: 'สินค้าที่จัดจำหน่าย', en: 'What we supply' },
    /**
     * ชื่อบนปุ่มเอกสาร — ตั้งตาม**ชนิด**ของเอกสาร ไม่ใช่ชื่อเต็มของไฟล์
     * ชื่อจริงยาวเกินกว่าจะใส่ในปุ่มได้ (ของ FHF คือ "ภาพรวมสายผลิตภัณฑ์ FHF —
     * โทรศัพท์และอุปกรณ์เสริม") ปุ่มจึงบอกแค่ว่ากดแล้วได้เอกสารประเภทไหน
     *
     * แยกเป็น key แบนสี่ตัวแทนการซ้อน object ตาม `doc.type` เพราะ `ui` ทั้งก้อน
     * ถูกบังคับด้วย `satisfies Record<string, Record<string, LocalizedText>>` ท้ายไฟล์ —
     * โครงสองชั้นนี้คือสิ่งที่ทำให้ไล่นับคู่ th/en ทั้งเว็บได้ในครั้งเดียว
     */

    // ไทยกับอังกฤษไม่ตรงกันโดยตั้งใจ — IDIE เลือกถ้อยคำนี้เอง (ส.ค. 2026)
    documentCatalog: { th: 'รายละเอียดสินค้า (PDF)', en: 'Datasheet (PDF)' },
    documentDatasheet: { th: 'ดาต้าชีต', en: 'Datasheet' },
    documentManual: { th: 'คู่มือการใช้งาน', en: 'User manual' },
    documentCertificate: { th: 'ใบรับรอง', en: 'Certificate' },
    visitSite: { th: 'เว็บไซต์ผู้ผลิต', en: 'Manufacturer site' },
    viewProducts: { th: 'ดูสินค้าของแบรนด์นี้', en: 'View products' },
    ctaTitle: { th: 'ไม่แน่ใจว่ารุ่นไหนตรงกับหน้างาน?', en: 'Not sure which model fits your site?' },
    ctaLead: {
      th: 'ส่งสเปกงานหรือการจำแนกพื้นที่มาให้เรา ทีมวิศวกรจะช่วยเลือกรุ่นที่ผ่านมาตรฐานและเหมาะกับสภาพแวดล้อมจริงของโรงงาน',
      en: 'Send us your specification or area classification — our engineers will help you select a model that is certified and suited to the actual plant environment.',
    },
  },
  actions: {
    readMore: { th: 'อ่านเพิ่มเติม', en: 'Read more' },
    viewAll: { th: 'ดูทั้งหมด', en: 'View all' },
    viewAllReferences: { th: 'ดูลูกค้าทั้งหมด', en: 'View all references' },
    contactInquiry: { th: 'ติดต่อสอบถาม', en: 'Contact for inquiry' },
    requestInformation: { th: 'ขอข้อมูลเพิ่มเติม', en: 'Request information' },
    clearFilters: { th: 'ล้างตัวกรอง', en: 'Clear filters' },
    backToTop: { th: 'กลับขึ้นด้านบน', en: 'Back to top' },
    skipToContent: { th: 'ข้ามไปยังเนื้อหาหลัก', en: 'Skip to main content' },
    close: { th: 'ปิด', en: 'Close' },
  },
  states: {
    loading: { th: 'กำลังโหลด…', en: 'Loading…' },
    empty: { th: 'ไม่พบข้อมูลที่ตรงกับเงื่อนไข', en: 'Nothing matches these filters' },
    notFoundTitle: { th: 'ไม่พบหน้าที่ต้องการ', en: 'Page not found' },
    notFoundBody: {
      th: 'หน้าที่คุณเปิดอาจถูกย้ายหรือไม่มีอยู่แล้ว ลองกลับไปหน้าแรกหรือเลือกจากเมนูด้านบน',
      en: 'The page may have moved or no longer exists. Try the home page or pick from the menu above.',
    },
    errorTitle: { th: 'เกิดข้อผิดพลาด', en: 'Something went wrong' },
    errorBody: {
      th: 'ส่วนนี้ของหน้าโหลดไม่สำเร็จ ส่วนอื่นของเว็บไซต์ยังใช้งานได้ตามปกติ',
      en: 'This part of the page failed to load. The rest of the site still works.',
    },
    comingSoon: { th: 'กำลังจัดเตรียมข้อมูล', en: 'Content coming soon' },
  },
  /** ข้อความบนหน้า Home */
  home: {
    /**
     * พาดหัวหน้าแรก
     *
     * เดิมเขียนตายตัวใน HomeHero.tsx เป็นภาษาอังกฤษทั้งสองภาษา โดยให้เหตุผลว่า
     * เป็นคำเรียกสายงานที่วิศวกรไทยใช้ทับศัพท์อยู่แล้ว — ย้ายเข้ามาที่นี่เมื่อลูกค้า
     * ยืนยันว่าต้องการ **TH/EN เต็มรูปแบบทั้งสองภาษา** (ส.ค. 2026)
     *
     * คำแปลไทยเป็นร่างที่เราเขียนเอง ใช้คำเดียวกับ SEO title ของหน้าแรกเพื่อให้
     * พาดหัวกับผลค้นหาตรงกัน
     * TODO: confirm with IDIE — ทั้งคำแปลไทยและตัวเลือกพาดหัวภาษาอังกฤษ
     * (ดูคำถามข้อ 1 ใน docs/data-requests.md)
     */
    heroTitle: {
      th: 'ระบบสื่อสารและสัญญาณเตือนภัยอุตสาหกรรม',
      en: 'Industrial Communication & Safety Signalling',
    },
    heroLead: {
      th: 'ออกแบบ จัดหา และติดตั้งระบบอินเตอร์คอม ระบบประกาศและสัญญาณเตือนภัย ระบบเครือข่ายและกล้องวงจรปิด สำหรับโรงงานปิโตรเคมี น้ำมันและก๊าซ โรงไฟฟ้า และพื้นที่อันตราย',
      en: 'Design, supply and installation of intercom, public address and warning alarm, network and CCTV systems for petrochemical, oil and gas, power generation and hazardous-area facilities.',
    },
    /** {years} ถูกแทนค่าตอน render จากปีก่อตั้งจริง ไม่ใช่ตัวเลขที่พิมพ์ทิ้งไว้ */
    heroMeta: {
      th: '{years}+ ปีในสายระบบสื่อสารอุตสาหกรรม · ตั้งแต่ พ.ศ. 2539 · ระยอง ประเทศไทย',
      en: '{years}+ years in industrial communication · Since 1996 · Rayong, Thailand',
    },
    whyTitle: { th: 'ทำไมโรงงานถึงเลือก IDIE', en: 'Why plants choose IDIE' },
    brandsTitle: {
      th: 'ตัวแทนจำหน่ายผู้ผลิตชั้นนำจากยุโรป',
      en: 'Authorised distributor for leading European manufacturers',
    },
    companyTitle: { th: 'ผู้เชี่ยวชาญเฉพาะทางมาตั้งแต่ปี 2539', en: 'A focused specialist since 1996' },
    companyCta: { th: 'รู้จักบริษัทเพิ่มเติม', en: 'More about the company' },

    highlightsTitle: { th: 'สิ่งที่เราทำให้ลูกค้า', en: 'What we do for our customers' },
    highlightsLead: {
      th: 'ครบตั้งแต่ออกแบบระบบ จัดหาอุปกรณ์ที่ผ่านมาตรฐาน ไปจนถึงติดตั้งและดูแลหลังส่งมอบ',
      en: 'From system design through certified equipment procurement to installation and long-term support.',
    },

    servicesTitle: { th: 'บริการหลัก 4 กลุ่ม', en: 'Four core services' },
    servicesLead: {
      th: 'ทุกงานอยู่บนพื้นฐานเดียวกัน — ระบบต้องทำงานได้ในวันที่เกิดเหตุจริง',
      en: 'Every service rests on the same premise — the system has to work on the day it matters.',
    },

    productsTitle: { th: 'อุปกรณ์ที่เราจัดจำหน่าย', en: 'Equipment we supply' },
    productsLead: {
      th: 'อุปกรณ์สื่อสารและสัญญาณเตือนภัยสำหรับพื้นที่อันตราย พื้นที่อุตสาหกรรม และงานนอกชายฝั่ง',
      en: 'Communication and signalling equipment for hazardous, industrial and offshore environments.',
    },

    referencesTitle: { th: 'โรงงานที่ไว้วางใจเรา', en: 'Plants that trust us' },
    referencesLead: {
      th: 'ตั้งแต่โรงกลั่นและปิโตรเคมี ไปจนถึงโรงไฟฟ้าและผู้รับเหมา EPC ระดับสากล',
      en: 'From refineries and petrochemical plants to power generation and international EPC contractors.',
    },

    industriesTitle: { th: 'อุตสาหกรรมที่เราให้บริการ', en: 'Industries we serve' },
    industriesLead: {
      th: 'ทุกกลุ่มมีเงื่อนไขหน้างานต่างกัน — ฝุ่น ความร้อน สารกัดกร่อน เสียงรบกวน และการจำแนกพื้นที่เสี่ยง',
      en: 'Each has different site conditions — dust, heat, corrosives, ambient noise and area classification.',
    },

    whyLead: {
      th: 'สี่ข้อนี้ตรวจสอบได้จากข้อมูลบริษัท ไม่ใช่คำโฆษณา',
      en: 'All four are verifiable from company records, not marketing claims.',
    },

    statsTitle: { th: 'ตัวเลขที่ตรวจสอบได้', en: 'Numbers you can verify' },

    careerTitle: { th: 'กำลังมองหาวิศวกรที่อยากทำงานที่มีผลจริง', en: 'Looking for engineers who want work that matters' },
    careerLead: {
      th: 'งานของเราคือระบบที่ต้องทำงานตอนเกิดเหตุ ถ้าคุณมีประสบการณ์ด้าน intercom, PA/GA หรือ CCTV เราอยากคุยด้วย',
      en: 'We build systems that have to work in an emergency. If you have intercom, PA/GA or CCTV experience, we would like to talk.',
    },
    careerCta: { th: 'ดูตำแหน่งที่เปิดรับ', en: 'See open positions' },

    contactCtaTitle: {
      th: 'พร้อมคุยเรื่องระบบของโรงงานคุณแล้ว',
      en: "Let's engineer your next solution.",
    },
    contactCtaLead: {
      th: 'ส่งสเปกงาน แบบผัง หรือการจำแนกพื้นที่มาให้เรา แล้วเราจะช่วยเลือกอุปกรณ์และวางระบบให้ตรงกับหน้างานจริง',
      en: 'Send us your specification, layout or area classification and we will help you select equipment and design a system that fits the actual site.',
    },

    outlineTitle: { th: 'โครงหน้า Home', en: 'Home page outline' },
    outlineNote: {
      th: '15 section ตามลำดับการเล่าเรื่องที่กำหนดไว้ — Hero, Why IDIE และ Brand Partners คือของจริงที่ทำแล้ว',
      en: '15 sections in the planned narrative order — Hero, Why IDIE and Brand Partners are built.',
    },
  },

  media: {
    awaitingPhoto: { th: 'รอภาพจริงจาก IDIE', en: 'Awaiting photo from IDIE' },
  },

  /** บล็อกที่ใช้เมื่อ section มีโครงแล้วแต่ยังไม่ได้รับข้อมูลจากบริษัท */
  pending: {
    badge: { th: 'รอข้อมูลจากบริษัท', en: 'Awaiting company data' },
    needHeading: { th: 'ข้อมูลที่ต้องใช้', en: 'What we need' },
    contactPrompt: {
      th: 'ระหว่างนี้ติดต่อทีมงานเพื่อขอข้อมูลได้โดยตรง',
      en: 'In the meantime, contact our team for the information directly.',
    },
  },

  about: {
    title: { th: 'เกี่ยวกับเรา', en: 'About us' },
    lead: {
      th: 'ประวัติบริษัท ขอบเขตงาน ทีมงาน และมาตรฐานที่ IDIE ยึดถือ',
      en: 'Company background, scope of work, team and the standards IDIE works to.',
    },
    profileHeading: { th: 'ข้อมูลบริษัท', en: 'Company profile' },
    scopeHeading: { th: 'ขอบเขตงานของเรา', en: 'Our scope of work' },
    scopeLead: {
      th: 'สี่กลุ่มงานหลักที่บริษัทระบุไว้เอง ครอบคลุมตั้งแต่ออกแบบจนถึงบริการหลังการขาย',
      en: 'The four core areas the company defines for itself, from design through after-sales service.',
    },
    industriesHeading: { th: 'อุตสาหกรรมที่ให้บริการ', en: 'Industries we serve' },
    contactPersonHeading: { th: 'ผู้ติดต่อหลัก', en: 'Primary contact' },
    historyHeading: { th: 'ประวัติและพัฒนาการ', en: 'History and milestones' },
    historyNeed: {
      th: 'ปีสำคัญของบริษัท เช่น ปีที่เริ่มเป็นตัวแทนแต่ละแบรนด์ ปีที่ขยายทีม หรือโครงการแรกในแต่ละอุตสาหกรรม',
      en: 'Key years such as when each brand distributorship began, team expansions, or the first project in each industry.',
    },
    visionHeading: { th: 'วิสัยทัศน์และพันธกิจ', en: 'Vision and mission' },
    visionNeed: {
      th: 'ข้อความวิสัยทัศน์และพันธกิจฉบับทางการของบริษัท ทั้งภาษาไทยและอังกฤษ',
      en: 'The company’s official vision and mission statements, in both Thai and English.',
    },
    teamHeading: { th: 'ทีมงาน', en: 'Our team' },
    teamNeed: {
      th: 'โครงสร้างทีม จำนวนวิศวกร และรูปทีมงาน (ตอนนี้มีเพียงชื่อผู้จัดการทั่วไปจากเว็บเดิม)',
      en: 'Team structure, number of engineers and team photos (only the general manager is published today).',
    },
    certificatesHeading: { th: 'การแต่งตั้งจากผู้ผลิต', en: 'Manufacturer authorisations' },
    certificatesLead: {
      th: 'หนังสือรับรองที่ผู้ผลิตออกให้โดยตรง ระบุขอบเขตและพื้นที่ที่ IDIE ได้รับแต่งตั้ง',
      en: 'Authorisation documents issued directly by the manufacturers, stating the scope and territory granted to IDIE.',
    },
    /** ชื่อของปุ่มเปิดเอกสาร — {name} ถูกแทนด้วยชื่อหนังสือแต่ละฉบับตอน render */
    certificatesOpen: {
      th: 'ดูเอกสารขนาดเต็ม: {name}',
      en: 'View full-size document: {name}',
    },
    certificatesViewFull: {
      th: 'กดที่เอกสารเพื่อดูขนาดเต็ม',
      en: 'Select a document to view it full size',
    },
  },

  serviceDetail: {
    overviewHeading: { th: 'ภาพรวมงาน', en: 'Overview' },
    scopeHeading: { th: 'ขอบเขตงาน', en: 'Scope of work' },
    applicationsHeading: { th: 'ตัวอย่างการใช้งาน', en: 'Typical applications' },
    relatedProductsHeading: { th: 'สินค้าที่เกี่ยวข้อง', en: 'Related products' },
    backToServices: { th: 'กลับไปหน้าบริการ', en: 'Back to services' },
    ctaTitle: { th: 'มีงานที่อยากให้เราช่วยดูไหม', en: 'Have a project for us to look at?' },
  },

  products: {
    title: { th: 'สินค้า', en: 'Products' },
    lead: {
      th: 'อุปกรณ์สื่อสารและสัญญาณเตือนภัยจากผู้ผลิตยุโรป เลือกดูตามพื้นที่ใช้งาน หมวดสินค้า หรือแบรนด์',
      en: 'Communication and signalling equipment from European manufacturers — browse by application area, category or brand.',
    },
    searchPlaceholder: { th: 'ค้นหาชื่อสินค้า รุ่น หรือคำสำคัญ', en: 'Search by name, model or keyword' },
    resultCount: { th: 'พบ {count} รายการ', en: '{count} products' },
    pendingHeading: { th: 'รายการสินค้ายังอยู่ระหว่างจัดเตรียม', en: 'The product list is being prepared' },
    pendingNeed: {
      th: 'รุ่นสินค้าที่ต้องการโชว์ พร้อมภาพ สเปก มาตรฐานที่ผ่าน (ATEX / IECEx / IP) และไฟล์ datasheet ที่มีสิทธิ์เผยแพร่',
      en: 'The models to feature, with photos, specifications, certifications (ATEX / IECEx / IP) and datasheets you are licensed to distribute.',
    },
    browseByBrand: { th: 'เลือกดูตามแบรนด์', en: 'Browse by brand' },
  },

  productDetail: {
    specsHeading: { th: 'ข้อมูลทางเทคนิค', en: 'Technical data' },
    certsHeading: { th: 'มาตรฐานและการรับรอง', en: 'Certifications' },
    areaHeading: { th: 'พื้นที่ใช้งาน', en: 'Application area' },
    relatedHeading: { th: 'สินค้าที่เกี่ยวข้อง', en: 'Related products' },
    backToProducts: { th: 'กลับไปหน้าสินค้า', en: 'Back to products' },
    inquiryTitle: { th: 'ต้องการสเปกหรือใบเสนอราคา', en: 'Need a specification or a quotation?' },
    inquiryLead: {
      th: 'แจ้งรุ่นที่สนใจพร้อมเงื่อนไขหน้างาน ทีมวิศวกรจะช่วยยืนยันว่ารุ่นนี้ตรงกับการจำแนกพื้นที่และสภาพแวดล้อมจริงหรือไม่',
      en: 'Tell us the model and your site conditions — our engineers will confirm whether it matches the actual area classification and environment.',
    },
    noDatasheet: {
      th: 'ยังไม่มีไฟล์ datasheet ที่เผยแพร่ได้ — ติดต่อขอจากทีมงานได้โดยตรง',
      en: 'No distributable datasheet yet — contact the team to request one.',
    },
  },

  projects: {
    title: { th: 'ผลงาน', en: 'Projects' },
    lead: {
      th: 'ผลงานจริงของ IDIE — ต่างจากหน้าลูกค้าอ้างอิงที่บอกว่า "ลูกค้าคือใคร" หน้านี้บอกว่า "เราทำอะไรให้"',
      en: 'Delivered work. Where Reference answers “who our clients are”, this page answers “what we did for them”.',
    },
    pendingHeading: { th: 'กำลังรวบรวมผลงานเพื่อเผยแพร่', en: 'We are compiling projects for publication' },
    pendingNeed: {
      th: 'ต่อหนึ่งโครงการ: ชื่องาน ลูกค้า (หรือระบุว่าเปิดเผยไม่ได้) อุตสาหกรรม สถานที่ ปี ขอบเขตงาน และภาพหน้างาน',
      en: 'Per project: name, client (or “confidential”), industry, location, year, scope of work and site photos.',
    },
    seeReference: { th: 'ดูลูกค้าที่เคยร่วมงาน', en: 'See who we have worked with' },
    backToList: { th: 'กลับไปหน้าผลงาน', en: 'Back to projects' },
    clientLabel: { th: 'ลูกค้า', en: 'Client' },
    industryLabel: { th: 'อุตสาหกรรม', en: 'Industry' },
    locationLabel: { th: 'สถานที่', en: 'Location' },
    yearLabel: { th: 'ปีที่ส่งมอบ', en: 'Delivered' },
    yearUnknown: { th: 'ยังไม่ระบุ', en: 'Not specified' },
    overviewHeading: { th: 'ภาพรวมโครงการ', en: 'Project overview' },
    solutionHeading: { th: 'สิ่งที่ IDIE ทำ', en: 'What IDIE delivered' },
    scopeHeading: { th: 'ขอบเขตงาน', en: 'Scope of work' },
    galleryHeading: { th: 'ภาพหน้างาน', en: 'Site photos' },
    relatedHeading: { th: 'ผลงานอื่น', en: 'More projects' },
  },

  news: {
    title: { th: 'ข่าวสาร', en: 'News' },
    lead: {
      th: 'ข่าวสารและความเคลื่อนไหวของบริษัท',
      en: 'Company news and updates.',
    },
    pendingHeading: { th: 'ยังไม่มีข่าวเผยแพร่', en: 'No news published yet' },
    pendingNeed: {
      th: 'ข่าวอย่างน้อย 3 ชิ้นเพื่อให้ส่วนข่าวล่าสุดบนหน้าแรกทำงาน เช่น งานแสดงสินค้า การอบรม หรือโครงการที่เพิ่งส่งมอบ',
      en: 'At least three items so the “latest news” section on the home page can run — trade shows, training, or a recently delivered project.',
    },
    backToList: { th: 'กลับไปหน้าข่าวสาร', en: 'Back to news' },
    latestHeading: { th: 'ข่าวอื่นที่น่าสนใจ', en: 'More news' },
  },

  /**
   * ชื่อหมวดข่าว — key ตรงกับค่าใน `NewsCategory`
   *
   * วางเป็นกลุ่มของตัวเอง ไม่ใช่ซ้อนใต้ `news` เพราะ `ui` ทั้งก้อนถูกบังคับด้วย
   * `satisfies Record<string, Record<string, LocalizedText>>` ท้ายไฟล์ ซึ่งยอมให้
   * ซ้อนได้แค่สองชั้น — โครงนี้คือสิ่งที่ทำให้ไล่นับคู่ th/en ทั้งเว็บได้ในครั้งเดียว
   */
  newsCategory: {
    company: { th: 'ข่าวบริษัท', en: 'Company' },
    project: { th: 'ข่าวโครงการ', en: 'Project' },
    product: { th: 'ข่าวสินค้า', en: 'Product' },
    article: { th: 'บทความ', en: 'Article' },
    event: { th: 'กิจกรรม', en: 'Event' },
  },

  careers: {
    title: { th: 'ร่วมงานกับเรา', en: 'Careers' },
    lead: {
      th: 'งานของเราคือระบบที่ต้องทำงานตอนเกิดเหตุจริง ไม่ใช่ระบบที่ติดตั้งไว้เฉย ๆ',
      en: 'We build systems that have to work in an emergency — not systems that just sit there.',
    },
    openPositions: { th: 'ตำแหน่งที่เปิดรับ', en: 'Open positions' },
    responsibilities: { th: 'หน้าที่ความรับผิดชอบ', en: 'Responsibilities' },
    qualifications: { th: 'คุณสมบัติ', en: 'Qualifications' },
    howToApply: { th: 'วิธีสมัคร', en: 'How to apply' },
    applyLead: {
      th: 'ส่งประวัติย่อมาที่อีเมลด้านล่าง ระบุตำแหน่งที่สนใจในหัวข้ออีเมล',
      en: 'Send your resume to the address below with the position in the subject line.',
    },
    applyCta: { th: 'ส่งใบสมัครทางอีเมล', en: 'Apply by email' },
    fullTime: { th: 'งานประจำ', en: 'Full-time' },
    basedIn: { th: 'ประจำที่', en: 'Based in' },
  },

  contact: {
    title: { th: 'ติดต่อเรา', en: 'Contact us' },
    lead: {
      th: 'ส่งสเปกงาน แบบผัง หรือคำถามทางเทคนิคมาได้ ทีมวิศวกรจะตอบกลับพร้อมข้อเสนอที่ตรงกับหน้างาน',
      en: 'Send us a specification, layout or technical question and our engineers will come back with a proposal that fits the site.',
    },
    infoHeading: { th: 'ข้อมูลติดต่อ', en: 'Contact details' },
    formHeading: { th: 'แบบฟอร์มสอบถาม', en: 'Send an inquiry' },
    address: { th: 'ที่อยู่', en: 'Address' },
    phone: { th: 'โทรศัพท์', en: 'Telephone' },
    email: { th: 'อีเมล', en: 'Email' },
    contactPerson: { th: 'ผู้ติดต่อ', en: 'Contact person' },
    mapHeading: { th: 'แผนที่', en: 'Map' },
    mapExpand: { th: 'ดูแผนที่ขนาดใหญ่', en: 'View larger map' },
    /** ใช้เป็น title ของ iframe — iframe ที่ไม่มี title คือจุดตกของ a11y ที่เจอบ่อยที่สุด */
    mapTitle: {
      th: 'แผนที่สำนักงาน IDIE ที่จังหวัดระยอง',
      en: 'Map of the IDIE office in Rayong',
    },
    fieldName: { th: 'ชื่อ-นามสกุล', en: 'Full name' },
    fieldCompany: { th: 'บริษัท', en: 'Company' },
    fieldEmail: { th: 'อีเมล', en: 'Email' },
    fieldPhone: { th: 'โทรศัพท์', en: 'Telephone' },
    fieldSubject: { th: 'เรื่องที่ต้องการสอบถาม', en: 'Subject' },
    fieldMessage: { th: 'รายละเอียด', en: 'Message' },
    optional: { th: 'ไม่บังคับ', en: 'optional' },
    submit: { th: 'ส่งคำถาม', en: 'Send inquiry' },
    required: { th: 'กรุณากรอกข้อมูลนี้', en: 'This field is required' },
    invalidEmail: { th: 'รูปแบบอีเมลไม่ถูกต้อง', en: 'Enter a valid email address' },
    productContext: { th: 'สอบถามเกี่ยวกับสินค้า', en: 'Inquiry about product' },
    submittedTitle: { th: 'บันทึกข้อมูลในหน้าเว็บแล้ว', en: 'Captured in the browser' },
    submittedBody: {
      th: 'ระบบส่งอีเมลจริงยังไม่ได้เชื่อมต่อในเวอร์ชันนี้ ข้อมูลจึงยังไม่ถูกส่งไปถึงบริษัท กรุณาติดต่อทางอีเมลหรือโทรศัพท์โดยตรงไปก่อน',
      en: 'Email delivery is not connected in this version, so nothing has been sent to the company yet. Please use email or telephone directly for now.',
    },
    notConnectedNotice: {
      th: 'แบบฟอร์มนี้ยังไม่ได้ต่อระบบส่งอีเมล — เป็นส่วนหน้าเว็บเท่านั้น',
      en: 'This form is not connected to email delivery yet — front-end only.',
    },
  },

  /** ข้อความบนหน้าอื่น ๆ */
  pages: {
    servicesTitle: { th: 'บริการของ IDIE', en: 'Our services' },
    servicesLead: {
      th: 'ครอบคลุมตั้งแต่การออกแบบและงานวิศวกรรม การจัดหาอุปกรณ์ ไปจนถึงการติดตั้งและบริการหลังการขาย',
      en: 'From design and engineering through procurement to installation and after-sales service.',
    },
    referenceTitle: { th: 'องค์กรที่เคยร่วมงานกับเรา', en: 'Companies we have worked with' },
    referenceLead: {
      th: 'ได้รับความไว้วางใจจากองค์กรและคู่ค้าอุตสาหกรรมชั้นนำ ตั้งแต่โรงกลั่น ปิโตรเคมี โรงไฟฟ้า ไปจนถึงผู้รับเหมา EPC ระดับสากล',
      en: 'Trusted by leading companies and industrial partners — from refineries and petrochemical plants to power generation and international EPC contractors.',
    },
    outlineHeading: { th: 'โครงหน้านี้', en: 'Page outline' },
  },

  labels: {
    locale: { th: 'ภาษา', en: 'Language' },
    menu: { th: 'เมนู', en: 'Menu' },
    closeMenu: { th: 'ปิดเมนู', en: 'Close menu' },
    category: { th: 'หมวดหมู่', en: 'Category' },
    brand: { th: 'แบรนด์', en: 'Brand' },
    area: { th: 'พื้นที่ใช้งาน', en: 'Application area' },
    industry: { th: 'อุตสาหกรรม', en: 'Industry' },
    search: { th: 'ค้นหา', en: 'Search' },
    all: { th: 'ทั้งหมด', en: 'All' },
  },
} satisfies Record<string, Record<string, LocalizedText>>
