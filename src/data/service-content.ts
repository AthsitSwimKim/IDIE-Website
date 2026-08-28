import type { LocalizedText } from '@/types/content'

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
 * โดยเฉพาะขั้นตอนการทำงาน ว่าตรงกับวิธีทำงานจริงของทีมหรือไม่
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
  /** ขั้นตอนการทำงานตั้งแต่รับโจทย์จนส่งมอบ */
  process: LocalizedText[]
  /** ข้อมูลที่ลูกค้าต้องเตรียมเพื่อให้ประเมินราคาได้ — ส่วนที่ผู้อ่านเอาไปใช้ได้ทันที */
  quoteChecklist: LocalizedText[]
  /** ประเด็นทางเทคนิคที่มักเข้าใจผิดหรือถูกมองข้ามตอนออกแบบ */
  technicalNotes: { title: LocalizedText; body: LocalizedText }[]
}

export const serviceDepth: Record<string, ServiceDepth> = {
  /* ---------------------------------------------------------------------- */
  'intercommunication-system': {
    overviewDetail: [
      {
        th: 'ระบบอินเตอร์คอมอุตสาหกรรมทำหน้าที่ที่โทรศัพท์ธรรมดาทำไม่ได้ในโรงงาน — เรียกได้โดยไม่ต้องยกหู พูดพร้อมกันหลายจุดในกลุ่มเดียว และได้ยินชัดในที่ที่เครื่องจักรดังกลบเสียงพูดปกติ ผู้ปฏิบัติงานที่มือไม่ว่างหรือใส่ถุงมือหนาจึงสื่อสารกับห้องควบคุมได้ทันทีโดยไม่ต้องหยุดงานที่ทำอยู่',
        en: 'An industrial intercom does what an ordinary telephone cannot inside a plant: it works hands-free, it lets several points talk within one group at the same time, and it stays intelligible where machinery drowns out normal speech. An operator whose hands are full — or wearing heavy gloves — can reach the control room without stopping what they are doing.',
      },
      {
        th: 'ความยากของงานนี้ไม่ได้อยู่ที่ตัวอุปกรณ์ แต่อยู่ที่สภาพแวดล้อม พื้นที่ผลิตมีทั้งเสียงรบกวนระดับสูง เสียงสะท้อนจากผนังโลหะและแนวท่อ ฝุ่น ไอเคมี และในหลายจุดยังเป็นบรรยากาศที่อาจติดไฟได้ อุปกรณ์ที่ทำงานได้ดีในห้องควบคุมจึงอาจใช้ในลานถังไม่ได้เลย แม้จะเป็นระบบเดียวกัน',
        en: 'The difficulty is rarely the hardware — it is the environment. Process areas combine high noise, reverberation off steel walls and pipe runs, dust, chemical vapour, and at many points an atmosphere that may ignite. Equipment that performs well in a control room may be unusable in a tank farm, even as part of the same system.',
      },
      {
        th: 'ระบบหนึ่งชุดประกอบด้วยสถานีแม่ในห้องควบคุม สถานีย่อยตามพื้นที่ปฏิบัติงาน และการจัดกลุ่มการเรียกที่ต้องออกแบบให้ตรงกับวิธีทำงานจริง เช่นกลุ่มสายร่วม (party line) สำหรับทีมที่ต้องได้ยินพร้อมกันทั้งกะ หรือการเรียกเฉพาะจุดเมื่อต้องคุยรายละเอียดโดยไม่รบกวนคนอื่น ผังการเรียกที่ออกแบบมาผิดทำให้ระบบที่อุปกรณ์ครบถ้วนกลายเป็นระบบที่ไม่มีใครอยากใช้',
        en: 'A complete system combines master stations in the control room, field stations across the operating areas, and a call-group structure designed around how the plant actually runs — party-line groups where a whole shift must hear at once, point-to-point calls where detail has to be discussed without interrupting everyone else. A call structure designed wrongly turns a fully equipped system into one nobody wants to use.',
      },
      {
        th: 'เราเลือกอุปกรณ์ให้ตรงกับสองเงื่อนไขที่ต่อรองไม่ได้ของแต่ละจุด คือระดับเสียงรบกวนจริงที่วัดได้ และการจำแนกพื้นที่อันตรายตามเอกสารของโรงงาน จากนั้นจึงพิจารณาเรื่องที่เหลือ เช่นจะใช้สายเดิมหรือเดินใหม่ จะเป็นอนาล็อกหรือ VoIP และจะเชื่อมกับระบบประกาศที่มีอยู่แล้วอย่างไร',
        en: 'Selection starts from the two conditions at each point that are not negotiable: the measured ambient noise level, and the hazardous area classification recorded in the plant own drawings. Everything else follows — whether existing cabling can be reused, whether the station should be analogue or VoIP, and how it ties into any public address system already in place.',
      },
    ],
    process: [
      {
        th: 'สำรวจหน้างานและวัดระดับเสียงรบกวนของแต่ละพื้นที่',
        en: 'Site survey and ambient noise measurement for each area',
      },
      {
        th: 'ตรวจเอกสารจำแนกพื้นที่อันตราย เพื่อกำหนดว่าจุดไหนต้องใช้อุปกรณ์ที่ผ่านมาตรฐาน Ex',
        en: 'Review the area classification drawings to identify which points require Ex-rated equipment',
      },
      {
        th: 'ออกแบบผังสถานีและกลุ่มการเรียก (party line / conference) ให้ตรงกับวิธีทำงานจริง',
        en: 'Design station layout and call groups (party line / conference) around how the plant actually works',
      },
      {
        th: 'จัดหาอุปกรณ์และตรวจว่าใบรับรองตรงกับโซนของแต่ละจุดก่อนส่งของ',
        en: 'Procure equipment and verify each unit’s certification against the zone it will be installed in',
      },
      { th: 'ติดตั้ง เดินสาย และตั้งค่าระบบ', en: 'Installation, cabling and configuration' },
      {
        th: 'ทดสอบความชัดของเสียงรายจุดขณะพื้นที่ทำงานจริง แล้วส่งมอบพร้อมอบรมผู้ใช้',
        en: 'Point-by-point intelligibility testing under live plant conditions, then handover with operator training',
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
    technicalNotes: [
      {
        title: { th: 'อนาล็อกหรือ VoIP — เลือกจากสิ่งที่ต้องทำงานตอนไฟดับ', en: 'Analogue or VoIP — decide from what must work during an outage' },
        body: {
          th: 'สถานี VoIP ใช้สาย LAN ที่มีอยู่แล้วและรับไฟผ่าน PoE ได้ ทำให้ติดตั้งง่ายกว่าในโรงงานที่วางเครือข่ายไว้ครบ แต่ระบบจะขึ้นกับสวิตช์และแหล่งจ่ายไฟสำรองของเครือข่ายนั้นทั้งหมด ส่วนสายอนาล็อกแบบเดิมทำงานต่อได้แม้เครือข่ายล่ม จุดที่ต้องสื่อสารได้แน่นอนในภาวะฉุกเฉินจึงมักยังใช้อนาล็อก',
          en: 'VoIP stations reuse existing LAN cabling and can draw power over PoE, which simplifies installation in plants that already have network coverage — but the system then depends entirely on that network’s switches and backup power. Traditional analogue lines keep working when the network is down, which is why points that must stay reachable during an emergency are often kept analogue.',
        },
      },
      {
        title: { th: 'การจำแนกพื้นที่เป็นตัวกำหนดรุ่นที่ใช้ได้ ไม่ใช่ราคา', en: 'Area classification decides the model — not budget' },
        body: {
          th: 'จุดที่อยู่ในพื้นที่เสี่ยงระเบิดต้องใช้รุ่นที่ผ่าน ATEX และ IECEx สำหรับโซนนั้นโดยเฉพาะ ส่วนพื้นที่อุตสาหกรรมทั่วไปที่แค่ต้องทนฝุ่น น้ำ และแดด ใช้รุ่นกันสภาพอากาศระดับ IP66 ก็เพียงพอ การใช้รุ่นกันระเบิดทั้งโรงงานทำให้ต้นทุนสูงเกินจำเป็น ส่วนการใช้รุ่นธรรมดาในโซนอันตรายเป็นเรื่องที่ยอมไม่ได้',
          en: 'Points inside a potentially explosive atmosphere require models certified to ATEX and IECEx for that specific zone. General industrial areas that only need to survive dust, water and sun are adequately served by weatherproof units rated to IP66. Specifying Ex equipment plant-wide inflates cost unnecessarily; specifying standard equipment inside a hazardous zone is simply not acceptable.',
        },
      },
      {
        title: { th: 'ความชัดสำคัญกว่าความดัง', en: 'Intelligibility matters more than loudness' },
        body: {
          th: 'ในพื้นที่ที่เสียงรบกวนแตะ 95 dB(A) การเพิ่มกำลังขับอย่างเดียวไม่ได้ทำให้ฟังรู้เรื่องขึ้น เพราะเสียงสะท้อนจากผนังโลหะและโครงสร้างท่อจะทับซ้อนกันจนคำเลอะ การวางตำแหน่งสถานีและการเลือกทิศทางของลำโพงมีผลต่อความเข้าใจมากกว่าจำนวนวัตต์',
          en: 'Where ambient noise reaches 95 dB(A), simply adding power does not make speech clearer — reflections from steel walls and pipework smear the words together. Station placement and speaker directivity affect comprehension far more than raw wattage.',
        },
      },
    ],
  },

  /* ---------------------------------------------------------------------- */
  'public-address-warning-alarm': {
    overviewDetail: [
      {
        th: 'ระบบ PA/GA ทำงานสองหน้าที่ในชุดเดียวกัน หน้าที่แรกคือการประกาศประจำวัน เรียกคน แจ้งเปลี่ยนกะ หรือสั่งงานข้ามพื้นที่ อีกหน้าที่คือการแจ้งเหตุฉุกเฉินและสั่งอพยพ ซึ่งเป็นงานที่ระบบต้องทำได้แน่นอนในวันที่ทุกอย่างอื่นกำลังผิดปกติ การออกแบบจึงต้องแยกลำดับความสำคัญของสัญญาณให้ชัด สัญญาณอพยพต้องตัดการประกาศทั่วไปได้ทันทีโดยไม่ต้องรอใครกดยกเลิก',
        en: 'A PA/GA system carries two duties at once. The first is routine paging — calling people, announcing shift changes, coordinating across areas. The second is emergency notification and evacuation, which has to work on the day everything else is going wrong. The design therefore has to separate signal priority explicitly: an evacuation signal must override routine paging immediately, without waiting for anyone to cancel it.',
      },
      {
        th: 'การออกแบบการครอบคลุมเป็นงานคำนวณ ไม่ใช่การประมาณด้วยสายตา แต่ละพื้นที่มีระดับเสียงรบกวนต่างกัน มีเพดานสูงต่างกัน และมีวัสดุที่สะท้อนเสียงต่างกัน ตำแหน่งและจำนวนลำโพงจึงต้องคิดจากค่าที่วัดได้จริงของพื้นที่นั้น การวางลำโพงให้ทั่วโดยไม่ดูค่าเสียงรบกวน มักได้ระบบที่ผ่านการตรวจนับจำนวนอุปกรณ์แต่ฟังไม่รู้เรื่องตอนใช้จริง',
        en: 'Coverage design is a calculation, not an eyeball estimate. Every area has its own noise level, ceiling height and reflective surfaces, so loudspeaker positions and counts have to follow the measured values for that specific area. Spreading speakers evenly without reference to noise data usually produces a system that passes a device count but cannot be understood in service.',
      },
      {
        th: 'อุปกรณ์ในระบบมีหลายชนิดตามงานที่ต้องทำ ลำโพงฮอร์นสำหรับพื้นที่กลางแจ้งและระยะไกล อุปกรณ์ส่งเสียงอิเล็กทรอนิกส์และไซเรนสำหรับสัญญาณเตือน ไฟสัญญาณและไฟแฟลชสำหรับพื้นที่ที่เสียงอย่างเดียวไม่พอ อุปกรณ์รวมเสียงและแสงในตัวเดียวสำหรับจุดที่พื้นที่ติดตั้งจำกัด และจุดแจ้งเหตุด้วยมือสำหรับให้คนหน้างานเป็นผู้เริ่มสัญญาณเอง',
        en: 'The equipment set follows the job each device does: horn loudspeakers for outdoor areas and long throw, electronic sounders and motor sirens for alarm tones, beacons and strobes where sound alone is not enough, combined sounder-beacon units where mounting space is limited, and manual call points so that people on the ground can raise the alarm themselves.',
      },
      {
        th: 'ในโรงงานส่วนใหญ่ระบบนี้ไม่ได้อยู่ลำพัง แต่ต้องรับสัญญาณจากระบบตรวจจับเพลิงไหม้ ระบบตรวจจับแก๊สรั่ว หรือระบบหยุดฉุกเฉิน แล้วแปลงเป็นเสียงและแสงที่คนเข้าใจได้ทันทีว่าต้องทำอะไรต่อ จุดเชื่อมต่อเหล่านี้ต้องถูกกำหนดตั้งแต่ตอนออกแบบ เพราะเป็นสิ่งที่แก้ทีหลังได้ยากที่สุดเมื่อระบบติดตั้งไปแล้ว',
        en: 'In most plants this system does not stand alone. It takes inputs from fire detection, gas detection or emergency shutdown, and converts them into sound and light that tell people immediately what to do next. Those interfaces have to be fixed during design — they are the hardest thing to change once the system is installed.',
      },
    ],
    process: [
      {
        th: 'สำรวจพื้นที่และวัดระดับเสียงรบกวนแยกตามโซน',
        en: 'Survey the site and measure ambient noise zone by zone',
      },
      {
        th: 'คำนวณการครอบคลุมของเสียงและแสง แล้วกำหนดจำนวนและตำแหน่งอุปกรณ์',
        en: 'Calculate acoustic and visual coverage, then set device count and positions',
      },
      {
        th: 'ออกแบบโซนประกาศและลำดับความสำคัญของสัญญาณ (ประกาศทั่วไป · อพยพ · เหตุฉุกเฉิน)',
        en: 'Design announcement zones and signal priority (general page · evacuation · emergency)',
      },
      {
        th: 'เลือกอุปกรณ์ตามโซนพื้นที่อันตรายและช่วงอุณหภูมิของหน้างานจริง',
        en: 'Select devices against the hazardous zone and the site’s actual temperature range',
      },
      { th: 'ติดตั้ง เดินสาย และเชื่อมกับระบบเดิมที่เกี่ยวข้อง', en: 'Install, cable and integrate with related existing systems' },
      {
        th: 'ทดสอบการครอบคลุมทุกจุดโดยวัดจริง ไม่ใช่ประเมินด้วยหู แล้วส่งมอบพร้อมผลการวัด',
        en: 'Verify coverage at every point by measurement rather than by ear, and hand over the recorded results',
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
    technicalNotes: [
      {
        title: { th: 'ครอบคลุมพื้นที่ ไม่เท่ากับได้ยิน', en: 'Covering an area is not the same as being heard' },
        body: {
          th: 'หลักปฏิบัติที่ใช้กันคือสัญญาณเตือนต้องดังกว่าเสียงรบกวนโดยรอบราว 10–15 dB จึงจะมั่นใจว่าคนได้ยินและแยกออกจากเสียงเครื่องจักร การนับว่าลำโพงส่องถึงพื้นที่แล้วโดยไม่ดูระดับเสียงรบกวนจริงของจุดนั้น เป็นสาเหตุที่พบบ่อยที่สุดของระบบที่ผ่านการตรวจรับแต่ใช้งานจริงไม่ได้',
          en: 'Common practice is that an alarm signal should sit roughly 10–15 dB above the surrounding noise before you can rely on people hearing it and separating it from machinery. Counting an area as covered because a loudspeaker points at it — without checking that point’s actual noise level — is the most frequent reason a system passes acceptance yet fails in service.',
        },
      },
      {
        title: { th: 'พื้นที่ที่ต้องใส่อุปกรณ์ป้องกันการได้ยิน ต้องมีสัญญาณแสงด้วย', en: 'Where hearing protection is worn, add a visual signal' },
        body: {
          th: 'ในพื้นที่ที่ระดับเสียงบังคับให้พนักงานใส่ที่อุดหูหรือที่ครอบหู เสียงสัญญาณอย่างเดียวไม่พอ ต้องมีไฟสัญญาณหรือไฟแฟลชประกอบเพื่อให้เห็นด้วยตา อุปกรณ์รวมเสียงและแสงในตัวเดียวจึงมีอยู่ในหมวดสินค้าด้วยเหตุผลนี้ ไม่ใช่เพื่อความสะดวกในการติดตั้ง',
          en: 'Where noise levels require ear plugs or ear defenders, an audible signal alone is not enough — a beacon or strobe must accompany it so the warning can be seen. Combined sounder-beacon units exist for exactly this reason, not merely to save installation effort.',
        },
      },
      {
        title: { th: 'ใบรับรองผ่านแล้ว แต่อุณหภูมิอาจไม่ผ่าน', en: 'Certified for the zone, yet wrong for the temperature' },
        body: {
          th: 'อุปกรณ์ที่ผ่าน ATEX และ IECEx ยังมีช่วงอุณหภูมิใช้งานกำกับมาด้วยเสมอ และช่วงนั้นต่างกันมากในแต่ละรุ่น เช่นฮูตเตอร์กันระเบิดบางรุ่นใช้ได้ตั้งแต่ -55 °C ถึง +70 °C ขณะที่รุ่นอื่นเริ่มที่ -20 °C การเลือกโดยดูแค่ว่า "ผ่าน Ex แล้ว" จึงยังไม่พอ ต้องเทียบกับอุณหภูมิสูงสุดและต่ำสุดที่จุดติดตั้งจริงเจอ',
          en: 'Equipment certified to ATEX and IECEx always carries an operating temperature range, and those ranges differ widely between models — some explosion-proof hooters are rated from −55 °C to +70 °C while others start at −20 °C. Selecting on “it is Ex certified” alone is therefore incomplete; it has to be checked against the highest and lowest temperatures the installation point actually sees.',
        },
      },
    ],
  },

  /* ---------------------------------------------------------------------- */
  'network-cctv-system': {
    overviewDetail: [
      {
        th: 'งานกลุ่มนี้ครอบสองส่วนที่ต้องออกแบบไปด้วยกัน คือโครงข่ายสื่อสารที่เป็นเส้นเลือดของระบบ และกล้องวงจรปิดที่วางอยู่บนโครงข่ายนั้น การเลือกกล้องก่อนแล้วค่อยหาทางเดินสายทีหลัง เป็นลำดับที่ทำให้โครงการบานปลายบ่อยที่สุด เพราะข้อจำกัดเรื่องเส้นทางสาย กำลังไฟ และแบนด์วิดท์ มักเป็นตัวตัดตัวเลือกของกล้องมากกว่าตัวสเปกกล้องเอง',
        en: 'This service covers two things that have to be designed together: the communication network that carries everything, and the cameras that sit on it. Choosing cameras first and working out cabling afterwards is the sequence that most often causes a project to overrun — routing, power and bandwidth constraints usually narrow the camera options more than the camera specification does.',
      },
      {
        th: 'สภาพแวดล้อมในโรงงานต่างจากอาคารสำนักงานอย่างสิ้นเชิง กล้องต้องทนฝุ่น การล้างพื้นด้วยน้ำแรงดันสูง การสั่นสะเทือนจากเครื่องจักร ไอเกลือในพื้นที่ชายฝั่ง และช่วงอุณหภูมิที่กว้างกว่ามาก ส่วนจุดที่อยู่ในพื้นที่จำแนกอันตรายต้องใช้ตัวถังที่ผ่านการรับรองเฉพาะ ซึ่งเป็นสินค้าคนละหมวดที่มีทั้งราคาและระยะเวลาสั่งของต่างจากกล้องอุตสาหกรรมทั่วไปมาก',
        en: 'Plant conditions are nothing like an office building. Cameras have to survive dust, high-pressure wash-down, vibration from machinery, salt air on coastal sites, and a far wider temperature range. Points inside a classified area need a certified enclosure — a different product class altogether, with price and lead time to match.',
      },
      {
        th: 'สามค่าที่ต้องตัดสินใจตั้งแต่ต้นคือความละเอียดของภาพ ระยะเวลาที่ต้องเก็บย้อนหลัง และจำนวนกล้อง สามค่านี้คูณกันกลายเป็นขนาดพื้นที่จัดเก็บและแบนด์วิดท์ที่ระบบต้องรองรับ การระบุว่าเก็บ 90 วันที่ความละเอียดสูงสุดโดยไม่คำนวณล่วงหน้า มักทำให้ค่าอุปกรณ์จัดเก็บสูงกว่าค่ากล้องทั้งระบบรวมกัน',
        en: 'Three values must be settled at the start: image resolution, retention period, and camera count. Multiplied together they define the storage and bandwidth the system has to carry. Specifying 90 days at maximum resolution without doing that arithmetic frequently makes the recording hardware cost more than every camera combined.',
      },
      {
        th: 'อีกเรื่องที่ต้องตัดสินใจร่วมกับฝ่ายไอทีของโรงงานคือระบบนี้จะอยู่บนเครือข่ายเดียวกับระบบควบคุมกระบวนการผลิตหรือแยกออกมา โรงงานส่วนใหญ่เลือกแยก เพราะภาระข้อมูลจากกล้องมีปริมาณมากและสม่ำเสมอ ซึ่งไม่ควรไปแย่งทรัพยากรกับเครือข่ายที่ระบบควบคุมใช้อยู่',
        en: 'One further decision belongs jointly to engineering and the plant IT team: whether this system shares a network with process control or sits on its own. Most plants separate them, because video traffic is heavy and constant, and should not compete for the network the control system depends on.',
      },
    ],
    process: [
      { th: 'สำรวจจุดที่ต้องการเห็นภาพและเส้นทางเดินสายที่เป็นไปได้', en: 'Survey the views required and the practical cable routes' },
      {
        th: 'ออกแบบผังเครือข่ายและประเมินแบนด์วิดท์กับพื้นที่จัดเก็บที่ต้องใช้',
        en: 'Design the network topology and size the bandwidth and storage required',
      },
      {
        th: 'เลือกกล้องตามสภาพแสง ระยะที่ต้องเห็นรายละเอียด และสภาพแวดล้อมของจุดติดตั้ง',
        en: 'Select cameras for the lighting, the detail range needed, and the environment at each point',
      },
      { th: 'ติดตั้งอุปกรณ์ เดินสาย และตั้งค่าระบบบันทึก', en: 'Install hardware, run cabling and configure recording' },
      { th: 'ทดสอบภาพทั้งกลางวันและกลางคืน พร้อมตรวจสิทธิ์การเข้าถึง', en: 'Verify imaging by day and by night, and review access permissions' },
      { th: 'ส่งมอบพร้อมอบรมผู้ดูแลระบบ', en: 'Handover with administrator training' },
    ],
    quoteChecklist: [
      { th: 'ผังพื้นที่พร้อมจุดที่ต้องการเห็นภาพ', en: 'Site layout marked with the views required' },
      {
        th: 'ต้องเก็บภาพย้อนหลังกี่วัน — ตัวเลขนี้กำหนดขนาดสตอเรจโดยตรง',
        en: 'How many days of retention are required — this drives storage size directly',
      },
      {
        th: 'ต้องการเห็นแค่ว่ามีคน หรือเห็นชัดพอระบุตัวบุคคลและป้ายทะเบียน',
        en: 'Whether you need to detect presence, or identify faces and plates',
      },
      { th: 'สภาพแสงตอนกลางคืนของแต่ละจุด', en: 'Night-time lighting conditions at each point' },
      { th: 'ระบบเครือข่ายเดิมที่มีอยู่และสวิตช์ที่รองรับ PoE', en: 'Existing network infrastructure and PoE-capable switches' },
      { th: 'มีจุดใดอยู่ในพื้นที่จำแนกอันตรายหรือไม่', en: 'Whether any point falls inside a classified hazardous area' },
    ],
    technicalNotes: [
      {
        title: { th: 'ระยะเวลาเก็บภาพเป็นตัวกำหนดงบประมาณมากกว่าจำนวนกล้อง', en: 'Retention period drives the budget more than camera count' },
        body: {
          th: 'การเพิ่มกล้องหนึ่งตัวคือค่าอุปกรณ์หนึ่งชิ้น แต่การเพิ่มจำนวนวันที่เก็บภาพย้อนหลังคือการเพิ่มพื้นที่จัดเก็บของทุกกล้องพร้อมกัน โรงงานที่ระบุว่า "เก็บ 90 วัน" โดยไม่ได้คำนวณล่วงหน้ามักพบว่าค่าสตอเรจสูงกว่าค่ากล้องทั้งระบบ ควรกำหนดตัวเลขนี้ตั้งแต่ตอนออกแบบ ไม่ใช่ตอนติดตั้งเสร็จ',
          en: 'Adding one camera costs one device. Extending retention adds storage for every camera at once. Plants that specify “90 days” without doing the arithmetic first often find storage costs more than the cameras. Fix this number during design, not after installation.',
        },
      },
      {
        title: { th: 'กล้องในพื้นที่อันตรายเป็นคนละหมวดสินค้า', en: 'Cameras in hazardous areas are a different product class' },
        body: {
          th: 'กล้องอุตสาหกรรมทั่วไปที่ระดับ IP66 ทนฝุ่นและน้ำได้ แต่ไม่ได้ออกแบบมาให้ใช้ในบรรยากาศที่อาจมีไอระเหยติดไฟ จุดที่อยู่ในโซนจำแนกต้องใช้กล้องที่มีตัวถังผ่านการรับรองเฉพาะ ซึ่งราคาและระยะเวลาสั่งของต่างจากกล้องทั่วไปมาก การรู้ตั้งแต่ตอนออกแบบว่าจุดไหนอยู่ในโซนใด จึงกันปัญหางบบานปลายกลางโครงการ',
          en: 'A standard industrial camera rated IP66 survives dust and water but is not built for an atmosphere that may contain flammable vapour. Points inside a classified zone need a certified enclosure, which differs sharply in both price and lead time. Knowing which points sit in which zone during design prevents the budget moving mid-project.',
        },
      },
      {
        title: { th: 'PoE มีเพดานกำลังไฟ', en: 'PoE has a power ceiling' },
        body: {
          th: 'กล้องที่มีฮีตเตอร์ ที่ปัดน้ำฝน หรือมอเตอร์หมุนกล้อง กินไฟมากกว่ากล้องแบบตายตัวหลายเท่า สวิตช์ PoE ที่คำนวณจากจำนวนพอร์ตอย่างเดียวโดยไม่ดูงบกำลังไฟรวม จะจ่ายไฟไม่พอเมื่อกล้องทุกตัวเปิดฮีตเตอร์พร้อมกันในคืนที่อากาศเย็น ซึ่งเป็นคืนที่ระบบต้องทำงานพอดี',
          en: 'Cameras with heaters, wipers or pan-tilt motors draw several times the power of a fixed dome. A PoE switch sized by port count alone, without checking the total power budget, will fall short on the cold night when every heater switches on at once — precisely the night the system is needed.',
        },
      },
    ],
  },

  /* ---------------------------------------------------------------------- */
  'explosion-proof-telephone-signalling': {
    overviewDetail: [
      {
        th: 'หมวดนี้ครอบอุปกรณ์สามกลุ่มที่มักถูกสั่งพร้อมกัน คือโทรศัพท์อุตสาหกรรมสำหรับพื้นที่ที่ต้องทนฝุ่น น้ำ และเสียงดัง โทรศัพท์กันระเบิดสำหรับจุดที่อยู่ในบรรยากาศเสี่ยงติดไฟ และอุปกรณ์ส่งสัญญาณทั้งชนิดเสียงและชนิดแสงที่ใช้แจ้งเหตุในพื้นที่เดียวกัน ทั้งหมดเป็นสินค้าที่วิศวกรระบุในสเปกด้วยชื่อรุ่นและใบรับรอง ไม่ใช่ด้วยคำบรรยายทั่วไป',
        en: 'This category covers three groups of equipment that are usually ordered together: industrial telephones for areas that must tolerate dust, water and noise; explosion-proof telephones for points inside a potentially flammable atmosphere; and both acoustic and optical signalling devices used to raise the alarm in those same areas. These are products engineers specify by model number and certificate, not by general description.',
      },
      {
        th: 'การเลือกรุ่นเริ่มจากเอกสารจำแนกพื้นที่ของโรงงาน ซึ่งต้องอ่านครบสามค่าเสมอ คือโซน (ความถี่ที่บรรยากาศติดไฟจะปรากฏ) กลุ่มก๊าซ IIA IIB หรือ IIC (ชนิดของสารที่อาจมีอยู่ โดย IIC เข้มงวดที่สุดเพราะครอบคลุมไฮโดรเจนและอะเซทิลีน) และ temperature class T1 ถึง T6 (อุณหภูมิผิวสูงสุดที่อุปกรณ์มีได้โดยไม่จุดสารนั้น) ใบสั่งซื้อที่ระบุแค่โซนอย่างเดียวยังไม่พอให้ผู้ขายเสนอรุ่นที่ถูกต้อง',
        en: 'Selection begins from the plant area classification, and all three values must be read together: the zone (how often a flammable atmosphere is present), the gas group — IIA, IIB or IIC, with IIC the most demanding as it covers hydrogen and acetylene — and the temperature class T1 to T6, capping the surface temperature the equipment may reach without igniting that substance. A purchase order stating only the zone is not yet enough for a supplier to propose the correct model.',
      },
      {
        th: 'เงื่อนไขที่สองคือสภาพแวดล้อมทางกายภาพ ซึ่งกำหนดวัสดุตัวถังและระดับ IP ที่ต้องใช้ พื้นที่ชายฝั่งและงานนอกชายฝั่งต้องการวัสดุที่ทนไอเกลือ เช่นตัวถัง GRP หรือชิ้นส่วนสเตนเลสเกรดสูง พื้นที่ที่ล้างด้วยสารเคมีต้องการความทนการกัดกร่อนอีกแบบ และทุกจุดต้องเทียบช่วงอุณหภูมิของรุ่นที่เลือกกับอุณหภูมิสูงสุดและต่ำสุดที่หน้างานเจอจริง เพราะอุปกรณ์ที่ผ่าน Ex แล้วยังมีข้อจำกัดเรื่องอุณหภูมิกำกับมาเสมอ',
        en: 'The second condition is the physical environment, which drives enclosure material and IP rating. Coastal and offshore locations need resistance to salt air — GRP housings or high-grade stainless fittings. Chemical wash-down areas call for a different kind of corrosion resistance. And at every point the selected model temperature range has to be checked against the highest and lowest the site actually reaches, because Ex certification always comes with a temperature limit attached.',
      },
      {
        th: 'ส่วนที่มักถูกมองข้ามคือเอกสาร อุปกรณ์กันระเบิดมาพร้อมใบรับรองและข้อกำหนดการติดตั้งที่เป็นเงื่อนไขให้ใบรับรองนั้นยังมีผล เช่นชนิดของ cable gland ที่ใช้ได้ แรงขันฝาครอบ และวิธีต่อสายดิน ชุดเอกสารนี้คือสิ่งที่ผู้ตรวจสอบขอดูในภายหลัง การเก็บให้ครบตั้งแต่วันส่งมอบจึงง่ายกว่าการไล่ตามหาย้อนหลังหลายปีให้หลังมาก',
        en: 'The part most often overlooked is documentation. Explosion-protected equipment arrives with certificates and installation conditions that keep those certificates valid — permitted cable glands, cover torque, earthing method. This document set is exactly what an inspector asks for later, and assembling it at handover is far easier than reconstructing it years afterwards.',
      },
    ],
    process: [
      {
        th: 'ตรวจเอกสารจำแนกพื้นที่: โซน กลุ่มก๊าซ และ temperature class ของจุดติดตั้ง',
        en: 'Review the area classification: zone, gas group and temperature class for each point',
      },
      {
        th: 'คัดรุ่นที่ใบรับรองครอบคลุมเงื่อนไขนั้นครบทุกข้อ ไม่ใช่แค่โซน',
        en: 'Shortlist models whose certification covers every one of those conditions, not just the zone',
      },
      {
        th: 'ตรวจช่วงอุณหภูมิและระดับ IP เทียบกับสภาพแวดล้อมจริง เช่นไอเกลือหรือสารกัดกร่อน',
        en: 'Check temperature range and IP rating against the real environment — salt spray or corrosive agents included',
      },
      { th: 'จัดหาและตรวจรับพร้อมเอกสารรับรองของแต่ละชิ้น', en: 'Procure and take delivery together with each unit’s certification documents' },
      {
        th: 'ติดตั้งตามข้อกำหนดการติดตั้งของผู้ผลิต ซึ่งเป็นเงื่อนไขที่ทำให้ใบรับรองยังมีผล',
        en: 'Install to the manufacturer’s instructions — the condition under which the certification remains valid',
      },
      { th: 'ทดสอบ ส่งมอบ และส่งชุดเอกสารสำหรับการตรวจสอบภายหลัง', en: 'Test, hand over, and provide the document set for later inspection' },
    ],
    quoteChecklist: [
      {
        th: 'เอกสารจำแนกพื้นที่ที่ระบุโซน กลุ่มก๊าซ (IIA / IIB / IIC) และ temperature class (T1–T6)',
        en: 'Area classification stating zone, gas group (IIA / IIB / IIC) and temperature class (T1–T6)',
      },
      { th: 'อุณหภูมิแวดล้อมต่ำสุดและสูงสุดที่จุดติดตั้งเจอจริง', en: 'The lowest and highest ambient temperatures the point actually sees' },
      {
        th: 'สภาพกัดกร่อน เช่น ใกล้ทะเล ไอกรด หรือพื้นที่ล้างด้วยสารเคมี',
        en: 'Corrosive conditions — coastal, acid vapour, or chemical wash-down areas',
      },
      { th: 'ระบบโทรศัพท์เดิมเป็นอนาล็อกหรือ VoIP', en: 'Whether the existing telephone system is analogue or VoIP' },
      { th: 'จำนวนจุดและระยะสายจากตู้ควบคุมถึงจุดที่ไกลที่สุด', en: 'Number of points and cable distance from the panel to the furthest one' },
    ],
    technicalNotes: [
      {
        title: { th: 'รู้แค่โซนยังเลือกของไม่ได้', en: 'Knowing the zone alone is not enough to select equipment' },
        body: {
          th: 'การจำแนกพื้นที่บอกความถี่ที่บรรยากาศติดไฟจะปรากฏ แต่การเลือกอุปกรณ์ต้องใช้อีกสองค่าประกอบเสมอ คือกลุ่มก๊าซ (IIA / IIB / IIC ซึ่ง IIC เข้มงวดที่สุดเพราะครอบคลุมไฮโดรเจนและอะเซทิลีน) และ temperature class (T1–T6 ซึ่งกำหนดอุณหภูมิผิวสูงสุดที่อุปกรณ์มีได้) ใบสั่งซื้อที่ระบุแค่ "Zone 1" จึงยังไม่พอให้ผู้ขายเสนอรุ่นที่ถูกต้อง',
          en: 'Area classification states how often a flammable atmosphere is present, but equipment selection always needs two further values: the gas group (IIA / IIB / IIC — IIC being the most demanding as it covers hydrogen and acetylene) and the temperature class (T1–T6, capping the equipment’s maximum surface temperature). A purchase order that says only “Zone 1” does not yet let a supplier propose the correct model.',
        },
      },
      {
        title: { th: 'IP กับ Ex เป็นคนละเรื่องกัน', en: 'IP and Ex answer different questions' },
        body: {
          th: 'ค่า IP ตาม IEC 60529 บอกความสามารถในการกันของแข็งและน้ำเข้าตัวถัง เช่น IP66 คือกันฝุ่นสนิทและทนน้ำฉีดแรง ส่วนการรับรอง Ex บอกว่าตัวอุปกรณ์จะไม่จุดระเบิดบรรยากาศรอบตัว อุปกรณ์ IP67 ที่ไม่มีใบรับรอง Ex จึงใช้ในโซนอันตรายไม่ได้ แม้จะกันน้ำได้ดีกว่าอุปกรณ์ Ex บางรุ่นก็ตาม',
          en: 'An IP rating under IEC 60529 describes how well an enclosure keeps solids and water out — IP66 means dust-tight and resistant to powerful water jets. An Ex certification says the device will not ignite the atmosphere around it. An IP67 device without Ex certification therefore cannot be used in a hazardous zone, even though it may keep water out better than some Ex-rated equipment does.',
        },
      },
      {
        title: { th: 'ใบรับรองมีผลเฉพาะเมื่อติดตั้งตามที่ระบุ', en: 'Certification holds only for the installation described' },
        body: {
          th: 'เอกสารรับรองของอุปกรณ์กันระเบิดมาพร้อมเงื่อนไขการติดตั้งเสมอ เช่นชนิดของ cable gland ที่ใช้ได้ แรงขันของสกรูฝาครอบ และวิธีต่อสายดิน การเปลี่ยน gland เป็นรุ่นที่หาได้ง่ายกว่าหน้างาน หรือขันฝาไม่ได้แรงตามที่กำหนด ทำให้การป้องกันไม่เป็นไปตามที่รับรองไว้ แม้ตัวอุปกรณ์จะเป็นรุ่นที่ถูกต้องก็ตาม',
          en: 'Certification for explosion-protected equipment always comes with installation conditions — which cable glands are permitted, the torque for the cover bolts, how earthing must be made. Substituting a gland for whatever was available on site, or under-torquing the cover, means the protection no longer matches what was certified, even though the device itself is the correct model.',
        },
      },
    ],
  },
}
