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
      th: 'ระบบสื่อสารและสัญญาณเตือนภัยสำหรับโรงงานอุตสาหกรรมและพื้นที่อันตราย ตั้งแต่ปี 2549',
      en: 'Industrial communication and safety signalling for plants and hazardous areas since 2006.',
    },
    exploreHeading: { th: 'สำรวจเว็บไซต์', en: 'Explore' },
    companyHeading: { th: 'บริษัท', en: 'Company' },
    contactHeading: { th: 'ติดต่อ', en: 'Get in touch' },
    fax: { th: 'แฟกซ์', en: 'Fax' },
    rights: { th: 'สงวนลิขสิทธิ์', en: 'All rights reserved.' },
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
    viewProducts: { th: 'ดูสินค้าของแบรนด์นี้', en: 'View products' },
    /**
     * ชื่อบนปุ่มเอกสาร — ตั้งตาม**ชนิด**ของเอกสาร ไม่ใช่ชื่อเต็มของไฟล์
     * ชื่อจริงยาวเกินกว่าจะใส่ในปุ่มได้ (ของ FHF คือ "ภาพรวมสายผลิตภัณฑ์ FHF —
     * โทรศัพท์และอุปกรณ์เสริม") ปุ่มจึงบอกแค่ว่ากดแล้วได้เอกสารประเภทไหน
     *
     * แยกเป็น key แบนสี่ตัวแทนการซ้อน object ตาม `doc.type` เพราะ `ui` ทั้งก้อน
     * ถูกบังคับด้วย `satisfies Record<string, Record<string, LocalizedText>>` ท้ายไฟล์ —
     * โครงสองชั้นนี้คือสิ่งที่ทำให้ไล่นับคู่ th/en ทั้งเว็บได้ในครั้งเดียว
     *
     * หมายเหตุ: ไทยกับอังกฤษของ `documentCatalog` ไม่ตรงกันโดยตั้งใจ —
     * IDIE เลือกถ้อยคำนี้เอง (ส.ค. 2026)
     */
    documentCatalog: { th: 'รายละเอียดสินค้า (PDF)', en: 'Datasheet (PDF)' },
    documentDatasheet: { th: 'ดาต้าชีต', en: 'Datasheet' },
    documentManual: { th: 'คู่มือการใช้งาน', en: 'User manual' },
    documentCertificate: { th: 'ใบรับรอง', en: 'Certificate' },
    visitSite: { th: 'เว็บไซต์ผู้ผลิต', en: 'Manufacturer site' },
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
    backToHome: { th: 'กลับสู่หน้าแรก', en: 'Back to home' },
    retry: { th: 'ลองใหม่อีกครั้ง', en: 'Try again' },
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
    /*
      สถานะโหลดไม่สำเร็จของหน้าที่ดึงข้อมูลจาก API — ใช้ร่วมกันทั้งหน้าข่าวและหน้าผลงาน
      เพราะผู้อ่านไม่ได้ต้องการรู้ว่า endpoint ไหนล้ม แค่ต้องการรู้ว่าทำอะไรต่อได้
    */
    loadFailedTitle: { th: 'ไม่สามารถโหลดข้อมูลได้', en: 'Unable to load this content' },
    loadFailedBody: {
      th: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง',
      en: 'A connection error occurred. Please try again.',
    },
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
      th: 'ออกแบบ จัดหา และติดตั้งระบบสื่อสารของโรงงาน ตั้งแต่อินเตอร์คอมและระบบประกาศ ไปจนถึงระบบโทรศัพท์ ระบบเครือข่าย กล้องวงจรปิด และระบบควบคุมการเข้าออก สำหรับโรงงานปิโตรเคมี น้ำมันและก๊าซ โรงงานเหล็ก โรงไฟฟ้า และพื้นที่อันตราย',
      en: 'Design, supply and installation of plant communication systems — intercom, public address and warning alarm, telephone, WAN/LAN, CCTV and access control — for petrochemical, oil and gas, steel, power generation and hazardous-area facilities.',
    },
    /** {years} ถูกแทนค่าตอน render จากปีก่อตั้งจริง ไม่ใช่ตัวเลขที่พิมพ์ทิ้งไว้ */
    heroMeta: {
      th: '{years}+ ปีในสายระบบสื่อสารอุตสาหกรรม · ตั้งแต่ พ.ศ. 2549 · ระยอง ประเทศไทย',
      en: '{years}+ years in industrial communication · Since 2006 · Rayong, Thailand',
    },
    whyTitle: { th: 'ทำไมโรงงานถึงเลือก IDIE', en: 'Why plants choose IDIE' },
    brandsTitle: {
      th: 'ตัวแทนจำหน่ายผู้ผลิตชั้นนำจากยุโรป',
      en: 'Authorised distributor for leading European manufacturers',
    },
    companyTitle: { th: 'ผู้เชี่ยวชาญเฉพาะทางมาตั้งแต่ปี 2549', en: 'A focused specialist since 2006' },
    companyCta: { th: 'รู้จักบริษัทเพิ่มเติม', en: 'More about the company' },

    highlightsTitle: { th: 'สิ่งที่เราทำให้ลูกค้า', en: 'What we do for our customers' },
    highlightsLead: {
      th: 'ครบตั้งแต่ออกแบบระบบ จัดหาอุปกรณ์ที่ผ่านมาตรฐาน ไปจนถึงติดตั้งและดูแลหลังส่งมอบ',
      en: 'From system design through certified equipment procurement to installation and long-term support.',
    },

    /**
     * {count} ถูกแทนด้วยจำนวนบริการจริงตอน render — เคยเขียนตัวเลขตายตัวไว้ว่า 5
     * แล้วค้างอยู่อย่างนั้นตอนเพิ่มบริการที่หกเข้ามา หัวข้อที่นับของเองไม่มีทางเพี้ยน
     * (ใช้วิธีเดียวกับ heroMeta ที่แทน {years} ด้วยปีที่คำนวณจากปีก่อตั้งจริง)
     */
    servicesTitle: { th: 'บริการหลัก {count} กลุ่ม', en: '{count} core services' },
    servicesLead: {
      th: 'ทุกงานอยู่บนพื้นฐานเดียวกัน — ระบบต้องทำงานได้ในวันที่เกิดเหตุจริง',
      en: 'Every service rests on the same premise — the system has to work on the day it matters.',
    },

    productsTitle: { th: 'อุปกรณ์ที่เราจัดจำหน่าย', en: 'Equipment we supply' },
    productsLead: {
      th: 'อุปกรณ์สื่อสารและสัญญาณเตือนภัยสำหรับพื้นที่อันตราย พื้นที่อุตสาหกรรม และงานนอกชายฝั่ง ทุกรุ่นมีเอกสารข้อมูลสินค้าของผู้ผลิตกำกับ',
      en: 'Communication and signalling equipment for hazardous, industrial and offshore environments — every model backed by the manufacturer’s datasheet.',
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

  /**
   * หน้าสินค้า — รายการทั้งหมดมาจากเอกสารข้อมูลสินค้าของผู้ผลิต
   * ไม่มีคำโปรยรายรุ่นเพราะเอกสารไม่ได้ให้มา และการเขียนเอง 279 ประโยคไม่มีใครตรวจได้
   */
  products: {
    title: { th: 'สินค้า', en: 'Products' },
    lead: {
      th: 'อุปกรณ์สื่อสารและสัญญาณเตือนภัยจากผู้ผลิตยุโรปที่ IDIE เป็นตัวแทน ทุกรุ่นมีเอกสารข้อมูลสินค้าของผู้ผลิตให้เปิดดูได้',
      en: 'Communication and signalling equipment from the European manufacturers IDIE represents — every model comes with the manufacturer’s own datasheet.',
    },
    searchPlaceholder: { th: 'ชื่อรุ่นหรือชื่อสินค้า', en: 'Model or product name' },
    resultCount: { th: 'พบ {count} รายการ', en: '{count} products' },
    noImage: { th: 'ยังไม่มีภาพสินค้า', en: 'No product image yet' },
  },

  productDetail: {
    backToProducts: { th: 'กลับไปหน้าสินค้า', en: 'Back to products' },
    modelLabel: { th: 'รหัสรุ่น', en: 'Model' },
    featuresHeading: { th: 'คุณสมบัติและการทำงาน', en: 'Features and functions' },
    documentHeading: { th: 'เอกสารข้อมูลสินค้า', en: 'Product datasheet' },
    documentLead: {
      th: 'ค่าทางเทคนิคทั้งหมด ทั้งมาตรฐานที่ผ่าน ระดับ IP ช่วงอุณหภูมิ และการจำแนกพื้นที่ อยู่ในเอกสารฉบับเต็มของผู้ผลิต เราไม่พิมพ์ซ้ำลงหน้าเว็บเพื่อไม่ให้มีค่าสองชุดที่อาจไม่ตรงกัน',
      en: 'Every technical value — certifications, IP rating, temperature range and area classification — is in the manufacturer’s full datasheet. We do not retype them here, so there is never a second set of figures that might disagree.',
    },
    photoNote: { th: 'กดที่ภาพเพื่อดูขนาดเต็ม', en: 'Tap the image to view it full size' },
    drawingNote: {
      th: 'ภาพแบบบอกขนาด — กดเพื่อดูขนาดเต็มและอ่านตัวเลข',
      en: 'Dimensional drawing — tap to view full size and read the figures',
    },
    viewFull: { th: 'ดูภาพของ {name} ขนาดเต็ม', en: 'View the full-size image of {name}' },
    thumbPhoto: { th: 'ดูภาพถ่ายที่ {n}', en: 'Show photo {n}' },
    thumbDrawing: { th: 'ดูภาพแบบที่ {n}', en: 'Show drawing {n}' },
    relatedHeading: { th: 'สินค้าในหมวดเดียวกัน', en: 'Others in this category' },
  },

  /** หน้าคลังดาต้าชีตรายรุ่นของแต่ละแบรนด์ */
  datasheets: {
    title: { th: 'เอกสารข้อมูลสินค้า', en: 'Product datasheets' },
    lead: {
      th: 'เอกสารข้อมูลจำเพาะที่ผู้ผลิตออกให้ ครบทุกรุ่นที่ IDIE จัดจำหน่าย กดที่หน้าปกเพื่อเปิดไฟล์',
      en: 'Specification sheets issued by the manufacturer, covering every model IDIE supplies. Open a cover to read the PDF.',
    },
    backToBrands: { th: 'กลับไปหน้าแบรนด์คู่ค้า', en: 'Back to brand partners' },
    downloadCentre: { th: 'ศูนย์ดาวน์โหลดของผู้ผลิต', en: 'Manufacturer download centre' },
    searchLabel: { th: 'ค้นหา', en: 'Search' },
    searchPlaceholder: { th: 'ชื่อรุ่นหรือชื่อเอกสาร', en: 'Model or document name' },
    /** {shown} และ {total} ถูกแทนค่าตอน render */
    totalCount: { th: 'ทั้งหมด {total} ฉบับ', en: '{total} documents' },
    resultCount: { th: 'พบ {shown} จาก {total} ฉบับ', en: '{shown} of {total} documents' },
    empty: { th: 'ไม่พบเอกสารที่ตรงกับคำค้น', en: 'No documents match that search' },
    pages: { th: '{n} หน้า', en: '{n} pages' },
    openPdf: { th: '(ไฟล์ PDF เปิดในแท็บใหม่)', en: '(PDF, opens in a new tab)' },
  },

  media: {
    awaitingPhoto: { th: 'รอภาพจริงจาก IDIE', en: 'Awaiting photo from IDIE' },
    /*
      ผังระบบบนหน้าบริการกดดูขนาดเต็มได้ — ป้ายกำกับในผังเล็กเกินกว่าจะอ่านออก
      ที่ขนาดบนการ์ด คำใบ้จึงเป็นข้อความที่มองเห็น ไม่ใช่แค่ tooltip
      {name} ถูกแทนด้วยชื่อบริการตอน render
    */
    diagramHint: { th: 'กดที่ผังเพื่อดูขนาดเต็ม', en: 'Tap the diagram to view it full size' },
    diagramOpen: { th: 'ดูผัง{name} ขนาดเต็ม', en: 'View the full-size {name} diagram' },
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
      th: 'กลุ่มงานหลักที่บริษัทระบุไว้เอง ครอบคลุมตั้งแต่ออกแบบจนถึงบริการหลังการขาย',
      en: 'The core areas the company defines for itself, from design through after-sales service.',
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
    processHeading: { th: 'ขั้นตอนการทำงาน', en: 'How we work' },
    processLead: {
      th: 'ลำดับงานตั้งแต่รับโจทย์จนส่งมอบ — แต่ละโครงการอาจปรับตามเงื่อนไขหน้างาน',
      en: 'From brief to handover. Individual projects adapt to site conditions.',
    },
    checklistHeading: { th: 'ข้อมูลที่ใช้ในการเสนอราคา', en: 'What we need to quote' },
    checklistLead: {
      th: 'เตรียมข้อมูลเหล่านี้มาให้ครบ จะช่วยให้เสนอราคาได้ตรงและเร็วขึ้นมาก',
      en: 'Having these ready lets us quote accurately and far more quickly.',
    },
    notesHeading: { th: 'ประเด็นทางเทคนิคที่ควรรู้ก่อนออกแบบ', en: 'Technical points worth settling early' },
    notesLead: {
      th: 'เรื่องที่มักถูกมองข้ามตอนกำหนดสเปก แล้วกลายเป็นปัญหาตอนติดตั้งหรือตรวจรับ',
      en: 'Points often missed at specification stage that turn into problems at installation or acceptance.',
    },
    backToServices: { th: 'กลับไปหน้าบริการ', en: 'Back to services' },
    ctaTitle: { th: 'มีงานที่อยากให้เราช่วยดูไหม', en: 'Have a project for us to look at?' },
  },

  projects: {
    title: { th: 'ผลงาน', en: 'Projects' },
    lead: {
      th: 'รวมโครงการและผลงานความสำเร็จทางวิศวกรรม ที่เราส่งมอบโซลูชันคุณภาพและได้มาตรฐานให้กับภาคอุตสาหกรรม',
      en: 'Engineering projects and successful deliveries — quality solutions, built to standard, for the industrial sector.',
    },
    /*
      ข้อความสองชุดนี้ผู้เข้าชมเป็นคนอ่าน ไม่ใช่ทีมงาน — ห้ามใส่สถานะภายในของโครงการ
      หรือรายการข้อมูลที่ยังรอจากบริษัท เพราะหน้านี้ตกมาที่บล็อกนี้ตอนหลังบ้านล่มด้วย
    */
    emptyTitle: { th: 'ยังไม่มีผลงานเผยแพร่ในขณะนี้', en: 'No projects published at the moment' },
    emptyBody: {
      th: 'เรากำลังรวบรวมโครงการที่ส่งมอบแล้วเพื่อเผยแพร่ ระหว่างนี้ดูรายชื่อองค์กรที่เคยร่วมงานกับเราได้ที่หน้าลูกค้าอ้างอิง',
      en: 'We are compiling delivered projects for publication. In the meantime, see the companies we have worked with on our reference page.',
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
    /* เช่นเดียวกับหน้าผลงาน — ข้อความที่ผู้เข้าชมอ่าน ไม่ใช่สถานะงานของทีม */
    emptyTitle: { th: 'ยังไม่มีข่าวสารใหม่ในขณะนี้', en: 'No news updates at the moment' },
    emptyBody: {
      th: 'เรากำลังเตรียมอัปเดตข้อมูลและกิจกรรมใหม่ ๆ โปรดติดตามอีกครั้งเร็ว ๆ นี้',
      en: 'We are preparing new updates and activities. Please check back again soon.',
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
    submittedTitle: { th: 'ส่งคำถามเรียบร้อยแล้ว', en: 'Your inquiry has been sent' },
    submittedBody: {
      th: 'ทีมงานได้รับคำถามของคุณแล้ว และจะติดต่อกลับทางอีเมลที่ให้ไว้ หากเป็นเรื่องเร่งด่วนโทรหาเราได้โดยตรง',
      en: 'We have received your inquiry and will reply to the email address you gave. For anything urgent, please call us directly.',
    },
    sendAnother: { th: 'ส่งคำถามอีกข้อ', en: 'Send another inquiry' },
    sending: { th: 'กำลังส่ง…', en: 'Sending…' },
    /** ใช้เมื่อ API ตอบกลับว่าล้มเหลว — ต้องบอกทางออกอื่นเสมอ ไม่ใช่แค่บอกว่าพัง */
    sendFailed: {
      th: 'ส่งคำถามไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หรือติดต่อเราทางโทรศัพท์หรืออีเมลโดยตรง',
      en: 'We could not send your inquiry. Please try again, or contact us by phone or email directly.',
    },
  },

  /** ข้อความบนหน้าอื่น ๆ */
  pages: {
    servicesTitle: { th: 'บริการของ IDIE', en: 'Our services' },
    servicesLead: {
      th: 'ครอบคลุมตั้งแต่การออกแบบและงานวิศวกรรม การจัดหาอุปกรณ์ ไปจนถึงการติดตั้งและบริการหลังการขาย ทุกกลุ่มงานอยู่บนโจทย์เดียวกัน คือระบบต้องทำงานได้ในวันที่เกิดเหตุจริง ไม่ใช่แค่วันที่ตรวจรับ',
      en: 'From design and engineering through procurement to installation and after-sales service. Every one of them answers the same brief: the system has to work on the day something happens, not only on the day it is accepted.',
    },
    /** ป้ายบอกว่าหน้ารายละเอียดมีอะไรให้อ่านต่อ — แสดงเฉพาะบริการที่เขียนเนื้อหาส่วนลึกไว้แล้ว */
    servicesDepthHint: {
      th: 'รายละเอียดขั้นตอนการติดตั้งและมาตรฐานความปลอดภัย',
      en: 'Installation process and safety standards in detail',
    },
    servicesCtaTitle: {
      th: 'ไม่แน่ใจว่างานของคุณอยู่ในกลุ่มไหน',
      en: 'Not sure which of these your project falls under?'
    },
    servicesCtaLead: {
      th: 'ส่งผังหน้างานหรือเอกสารจำแนกพื้นที่มาให้เรา ทีมวิศวกรจะช่วยดูว่าต้องใช้ระบบแบบไหนและอุปกรณ์ระดับไหน — หลายโครงการต้องใช้มากกว่าหนึ่งกลุ่มร่วมกันอยู่แล้ว',
      en: 'Send us a site layout or your area classification drawings and our engineers will work out which systems and equipment grades apply. Most projects need more than one of these working together anyway.',
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
    category: { th: 'หมวดหมู่', en: 'Category' },
    menu: { th: 'เมนู', en: 'Menu' },
    closeMenu: { th: 'ปิดเมนู', en: 'Close menu' },
    brand: { th: 'แบรนด์', en: 'Brand' },
    industry: { th: 'อุตสาหกรรม', en: 'Industry' },
    search: { th: 'ค้นหา', en: 'Search' },
    all: { th: 'ทั้งหมด', en: 'All' },
  },
} satisfies Record<string, Record<string, LocalizedText>>
