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
        th: 'เครือข่ายในโรงงานไม่ได้ทำหน้าที่แค่ส่งข้อมูล ระบบอินเตอร์คอม ระบบประกาศ และกล้องวงจรปิดที่เป็นแบบ IP ทั้งหมดวิ่งอยู่บนโครงข่ายเดียวกันนี้ เมื่อสวิตช์ตัวหนึ่งดับ สิ่งที่หายไปจึงไม่ใช่แค่ภาพจากกล้อง แต่รวมถึงช่องทางที่ใช้เรียกคนออกจากพื้นที่ด้วย โครงข่ายส่วนนี้จึงต้องออกแบบด้วยเกณฑ์เดียวกับอุปกรณ์ความปลอดภัย ไม่ใช่เกณฑ์ของเครือข่ายสำนักงาน',
        en: 'A plant network does more than move data. Intercom, public address and CCTV — once they are IP based — all ride on the same infrastructure, so when a switch goes down what is lost is not only the camera view but the channel used to call people out of an area. This network has to be designed to the standard applied to safety equipment, not to the standard of an office LAN.',
      },
      {
        th: 'อุปกรณ์เครือข่ายที่ใช้ในพื้นที่ผลิตต่างจากที่ใช้ในห้องเซิร์ฟเวอร์ สวิตช์ระดับอุตสาหกรรมทำงานได้ในช่วงอุณหภูมิที่กว้างกว่า ระบายความร้อนโดยไม่ใช้พัดลม รับไฟ DC ซ้ำสองชุด และยึดบนราง DIN ในตู้สนามได้ ส่วนสายที่เดินผ่านบริเวณที่มีมอเตอร์หรืออินเวอร์เตอร์ต้องเลือกชนิดที่มีชีลด์และวางแยกระยะจากสายกำลัง มิฉะนั้นจะเจออาการแพ็กเก็ตหายเป็นช่วงที่หาสาเหตุยากหลังระบบเดินแล้ว',
        en: 'Network hardware for a process area is not the hardware used in a server room. Industrial switches work across a much wider temperature range, cool without fans, accept dual DC feeds and mount on DIN rail inside field cabinets. Cable passing near motors or variable-speed drives has to be shielded and physically separated from power runs — otherwise the result is intermittent packet loss that is very hard to trace once the plant is running.',
      },
      {
        th: 'ระยะทางเป็นตัวกำหนดสื่อกลาง สายทองแดงตามมาตรฐานอีเทอร์เน็ตใช้ได้ราว 100 เมตรต่อช่วง ซึ่งสั้นกว่าระยะระหว่างอาคารของโรงงานส่วนใหญ่ ไฟเบอร์จึงเป็นตัวเลือกของแกนหลัก และยังตัดปัญหาความต่างศักย์ระหว่างอาคารที่ทำให้พอร์ตทองแดงเสียหายได้ในงานที่แต่ละอาคารใช้ระบบกราวด์คนละชุด',
        en: 'Distance decides the medium. A copper Ethernet run is limited to roughly 100 metres per segment, which is shorter than the gap between buildings on most sites, so fibre becomes the backbone choice. Fibre also removes the ground potential difference between buildings that can destroy copper ports where each building sits on its own earthing system.',
      },
      {
        th: 'เรื่องสุดท้ายที่ต้องตกลงร่วมกับฝ่ายไอทีของโรงงานคือการแบ่งเครือข่าย ระบบสื่อสารและกล้องควรอยู่บนวีแลนหรือเครือข่ายกายภาพที่แยกจากระบบควบคุมกระบวนการผลิต เพราะภาระข้อมูลจากวิดีโอมีปริมาณมากและสม่ำเสมอ และเพราะขอบเขตความรับผิดชอบของแต่ละทีมควรตรงกับขอบเขตของเครือข่ายจริง ไม่ใช่คร่อมกันจนไม่มีใครรู้ว่าปัญหาอยู่ฝั่งไหน',
        en: 'The last decision belongs jointly with the plant IT team: segmentation. Communication and video should sit on a VLAN — or a physically separate network — away from process control, because video traffic is heavy and constant, and because each team’s responsibility should line up with a real network boundary rather than overlapping until nobody can say which side a fault is on.',
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
        th: 'งานกล้องวงจรปิดเริ่มจากคำถามว่าต้องการเห็นอะไร ไม่ใช่จะติดกี่ตัว ระหว่าง "รู้ว่ามีคนอยู่ตรงนั้น" กับ "ระบุได้ว่าเป็นใคร" คือความละเอียดที่ต่างกันหลายเท่า และแปลเป็นจำนวนพิกเซลต่อเมตรที่ต้องได้ ณ ระยะที่สนใจ การกำหนดข้อนี้ให้ชัดตั้งแต่ต้นเป็นสิ่งที่ทำให้เลือกเลนส์และตำแหน่งกล้องได้ถูก แทนที่จะได้ภาพที่ดูสวยแต่ขยายแล้วไม่เห็นอะไร',
        en: 'A CCTV design starts from what has to be seen, not from how many cameras to fit. The gap between “someone is there” and “that is who it is” is several times the resolution, and it translates into a required pixel density per metre at the distance that matters. Settling this first is what makes lens and position choices correct, instead of producing footage that looks fine until it is zoomed in on.',
      },
      {
        th: 'สภาพแวดล้อมในโรงงานต่างจากอาคารสำนักงานอย่างสิ้นเชิง กล้องต้องทนฝุ่น การล้างพื้นด้วยน้ำแรงดันสูง แรงสั่นสะเทือนจากเครื่องจักร ไอเกลือในพื้นที่ชายฝั่ง และช่วงอุณหภูมิที่กว้างกว่ามาก ส่วนจุดที่อยู่ในพื้นที่จำแนกอันตรายต้องใช้ตัวถังที่ผ่านการรับรองเฉพาะ ซึ่งเป็นสินค้าคนละหมวดที่มีทั้งราคาและระยะเวลาสั่งของต่างจากกล้องอุตสาหกรรมทั่วไปมาก',
        en: 'Plant conditions are nothing like an office building. Cameras have to survive dust, high-pressure wash-down, vibration from machinery, salt air on coastal sites, and a far wider temperature range. Points inside a classified area need a certified enclosure — a different product class altogether, with price and lead time to match.',
      },
      {
        th: 'สามค่าที่ต้องตัดสินใจตั้งแต่ต้นคือความละเอียดของภาพ ระยะเวลาที่ต้องเก็บย้อนหลัง และจำนวนกล้อง สามค่านี้คูณกันกลายเป็นขนาดพื้นที่จัดเก็บและแบนด์วิดท์ที่ระบบต้องรองรับ การระบุว่าเก็บ 90 วันที่ความละเอียดสูงสุดโดยไม่คำนวณล่วงหน้า มักทำให้ค่าอุปกรณ์จัดเก็บสูงกว่าค่ากล้องทั้งระบบรวมกัน',
        en: 'Three values must be settled at the start: image resolution, retention period, and camera count. Multiplied together they define the storage and bandwidth the system has to carry. Specifying 90 days at maximum resolution without doing that arithmetic frequently makes the recording hardware cost more than every camera combined.',
      },
      {
        th: 'สุดท้ายคือสภาพแสง กล้องที่ให้ภาพดีตอนกลางวันอาจใช้ไม่ได้เลยหลังพระอาทิตย์ตกถ้าจุดนั้นไม่มีไฟส่องสว่าง ไฟอินฟราเรดในตัวกล้องมีระยะจำกัดและถูกไอน้ำหรือฝุ่นสะท้อนกลับได้ง่าย จึงต้องดูควบคู่กับไฟฟ้าแสงสว่างที่มีอยู่จริงในพื้นที่ และควรทดสอบภาพตอนกลางคืนก่อนตรวจรับเสมอ ไม่ใช่ทดสอบเฉพาะช่วงกลางวันที่เข้าไปติดตั้ง',
        en: 'Finally there is light. A camera that performs well by day can be useless after sunset if the point has no lighting of its own. Built-in infrared has a limited reach and is readily reflected back by mist or dust, so it has to be assessed against the lighting that actually exists on site — and night-time imaging should always be verified before acceptance, not only during the daytime installation visit.',
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
        th: 'ระบบโทรศัพท์เป็นระบบที่ใช้มากที่สุดทั้งในสำนักงานและในโรงงาน เพราะเป็นช่องทางสื่อสารแบบมีสายหลักทั้งภายในพื้นที่และกับโลกภายนอก หัวใจของระบบคือตู้สาขา PABX ที่ทำหน้าที่เชื่อมสายทั้งหมดเข้าด้วยกัน ตามด้วยเครื่องปลายทางที่มีให้เลือกหลายชนิด และงานที่คนมักไม่นับว่าเป็นส่วนของระบบแต่กำหนดคุณภาพทั้งหมด คือตู้กระจายสาย MDF และ IDF กับสายสัญญาณที่เดินถึงทุกจุด',
        en: 'The telephone system is the most widely used system in both offices and plants: it is the primary wired channel inside the premises and out to the world beyond. At its heart is the PABX, which ties every line together, followed by the handsets — available in several types — and by the part people rarely count as part of the system even though it sets the quality of the whole: the MDF and IDF distribution frames and the cabling that reaches every point.',
      },
      {
        th: 'ระบบดั้งเดิมเป็นแบบอนาล็อก ซึ่งกำลังถูกแทนที่ด้วยแบบ IP ทีละน้อย และยังมีระบบไฮบริดที่รองรับทั้งอนาล็อกและ IP อยู่ในตู้เดียวกัน ทางเลือกนี้สำคัญกับโรงงานที่มีสายเดิมเดินอยู่แล้วหลายร้อยจุด เพราะการเปลี่ยนทั้งระบบพร้อมกันแปลว่าต้องหยุดใช้งานเป็นช่วง ในขณะที่ระบบไฮบริดยอมให้ทยอยเปลี่ยนเฉพาะจุดที่ต้องการฟังก์ชันใหม่ก่อน แล้วปล่อยจุดที่ยังใช้ได้ดีไว้ตามเดิม',
        en: 'Traditional systems are analogue, and are slowly being replaced by the IP version. There are also hybrid systems that support both analogue and IP within one platform. That choice matters for a plant with hundreds of existing lines already pulled, because replacing everything at once means planned downtime, whereas a hybrid system allows the points that need new functionality to be converted first while the ones still working stay as they are.',
      },
      {
        th: 'เครื่องปลายทางเลือกตามจุดติดตั้ง ไม่ใช่ตามงบประมาณเพียงอย่างเดียว มีทั้งแบบอนาล็อก ดิจิทัล และ IP และมีทั้งชนิดใช้ในอาคาร ชนิดกลางแจ้ง ชนิดกันสภาพอากาศ และชนิดกันระเบิดสำหรับจุดที่อยู่ในบรรยากาศที่อาจติดไฟ เครื่องที่เหมาะกับโต๊ะทำงานในสำนักงานกับเครื่องที่ต้องอยู่กลางลานถังจึงเป็นสินค้าคนละหมวดกันโดยสิ้นเชิง แม้จะต่อเข้าตู้สาขาตัวเดียวกัน',
        en: 'Handsets are selected by where they are mounted, not by budget alone. They come as analogue, digital and IP, and as indoor, outdoor, weather-proof and explosion‑proof versions for points inside a potentially flammable atmosphere. A set suited to an office desk and a set that has to live in a tank farm are entirely different product classes, even when both terminate on the same PABX.',
      },
      {
        th: 'สำหรับจุดที่อยู่ในพื้นที่จำแนกอันตราย การเลือกรุ่นเริ่มจากเอกสารจำแนกพื้นที่ของโรงงาน ซึ่งต้องอ่านครบสามค่าเสมอ คือโซน (ความถี่ที่บรรยากาศติดไฟจะปรากฏ) กลุ่มก๊าซ IIA IIB หรือ IIC (ชนิดของสารที่อาจมีอยู่ โดย IIC เข้มงวดที่สุดเพราะครอบคลุมไฮโดรเจนและอะเซทิลีน) และ temperature class T1 ถึง T6 (อุณหภูมิผิวสูงสุดที่อุปกรณ์มีได้โดยไม่จุดสารนั้น) ใบสั่งซื้อที่ระบุแค่โซนอย่างเดียวยังไม่พอให้ผู้ขายเสนอรุ่นที่ถูกต้อง',
        en: 'For points inside a classified area, selection begins from the plant area classification, and all three values must be read together: the zone (how often a flammable atmosphere is present), the gas group — IIA, IIB or IIC, with IIC the most demanding as it covers hydrogen and acetylene — and the temperature class T1 to T6, capping the surface temperature the equipment may reach without igniting that substance. A purchase order stating only the zone is not yet enough for a supplier to propose the correct model.',
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
        th: 'ระบบควบคุมการเข้าออกเป็นส่วนหนึ่งของระบบรักษาความปลอดภัยที่ทำสามหน้าที่พร้อมกัน คือเฝ้าระวังว่าใครเข้าออกที่ไหนเมื่อไร ป้องกันไม่ให้ผู้ที่ไม่มีสิทธิ์เข้าถึงพื้นที่ที่กำหนด และบริหารสิทธิ์เหล่านั้นให้เปลี่ยนแปลงได้เมื่อคนย้ายหน้าที่หรือหมดสัญญา สองหน้าที่แรกเป็นสิ่งที่ทุกคนนึกถึง แต่หน้าที่ที่สามคือสิ่งที่ทำให้ระบบยังใช้ได้จริงหลังผ่านไปสองปี',
        en: 'Access control is the part of a security system that does three things at once: it monitors who went where and when, it protects defined areas from people without the right to be there, and it manages those rights as staff change roles or contracts end. The first two are what everyone pictures. The third is what keeps the system usable two years after handover.',
      },
      {
        th: 'ระบบเดียวกันนี้มักถูกใช้เป็นระบบบันทึกเวลาทำงานไปด้วย เพราะข้อมูลเวลาเข้าออกที่ระบบเก็บอยู่แล้วสามารถส่งต่อให้ระบบเงินเดือนได้โดยตรง ข้อดีคือไม่ต้องมีเครื่องรูดบัตรสองชุด ข้อควรระวังคือต้องตกลงกันตั้งแต่ต้นว่าใครเป็นเจ้าของข้อมูลชุดนี้และเก็บไว้นานเท่าใด เพราะข้อมูลเวลาเข้าออกของพนักงานเป็นข้อมูลส่วนบุคคล ไม่ใช่แค่บันทึกของประตู',
        en: 'The same system is often used as a time and attendance system, since the entry and exit times it already records can feed payroll directly. The benefit is obvious — no second set of card readers. The point to settle early is who owns that data and how long it is retained, because an employee’s movement record is personal data, not merely a log of a door.',
      },
      {
        th: 'จุดที่ต้องออกแบบร่วมกับงานความปลอดภัยคือการเชื่อมกับระบบป้องกันอัคคีภัย ระบบควบคุมการเข้าออกที่ทำงานถูกต้องต้องปลดล็อกประตูตามเส้นทางหนีไฟเมื่อเกิดเหตุ เพื่อให้คนออกจากอาคารได้เร็วและปลอดภัย ประตูที่ล็อกแน่นหนาที่สุดในวันปกติ จึงต้องเป็นประตูที่เปิดได้ทันทีในวันที่เกิดเหตุ เงื่อนไขนี้เป็นเรื่องที่ต้องกำหนดตั้งแต่ตอนออกแบบ ไม่ใช่ตอนติดตั้งเสร็จแล้วค่อยหาวิธีต่อสายเพิ่ม',
        en: 'The point that has to be designed together with the safety systems is the interface to fire protection. A correctly engineered access control system releases the doors along the escape routes under a fire condition, so that people can leave the building quickly and safely. The door that is most firmly locked on an ordinary day has to be the one that opens immediately on the day it matters. That condition belongs in the design, not in a search for spare wiring after installation.',
      },
      {
        th: 'สำหรับโรงงาน ระบบนี้ยังทำหน้าที่ที่สำนักงานทั่วไปไม่ต้องการ คือคุมการเข้าพื้นที่หวงห้ามที่ต้องมีใบอนุญาตทำงานก่อน และรู้ว่าขณะนี้มีใครอยู่ในพื้นที่ใดบ้างเมื่อต้องอพยพ ข้อมูลนี้มีค่ามากที่สุดในนาทีที่ต้องนับหัวคน ซึ่งเป็นเหตุผลว่าทำไมระบบควบคุมการเข้าออกกับระบบแจ้งเหตุจึงควรออกแบบให้คุยกันได้ ไม่ใช่แยกกันอยู่คนละระบบ',
        en: 'In a plant the system also does something an ordinary office never asks of it: it restricts entry to areas that require a work permit first, and it knows who is inside which area when an evacuation begins. That information is worth most in the minutes when people have to be counted — which is why access control and the alarm system should be designed to talk to each other rather than living side by side as separate installations.',
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
