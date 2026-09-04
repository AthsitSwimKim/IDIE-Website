# -*- coding: utf-8 -*-
"""
สร้างคลังเอกสารข้อมูลสินค้าของสามแบรนด์ จากโฟลเดอร์ไฟล์ PDF ที่ IDIE ส่งมา

รันด้วย:  python scripts/build-catalog.py
ต้องมี:   pip install pymupdf pillow  ·  และต้องต่อไดรฟ์ต้นทางไว้ (ดู SOURCES)

สคริปต์นี้ทำสามอย่าง
  1. คัดลอกไฟล์ PDF **ต้นฉบับที่ไม่แก้ไข** ไป public/documents/datasheets/<brand>/
  2. เรนเดอร์หน้าแรกเป็นภาพปกเอกสาร → public/images/datasheets/<brand>/
  3. เขียน src/data/datasheets.generated.ts

**รายการสินค้าอยู่คนละสคริปต์** — `scripts/build-products.py` อ่านจากไฟล์ PDF ที่
สคริปต์นี้คัดลอกมาไว้ใน repo แล้ว บวกกับ datasheets.generated.ts จึงรันได้โดย
ไม่ต้องต่อไดรฟ์ต้นทาง และ id ของสินค้ากับเอกสารตรงกันเสมอเพราะอ่านจากไฟล์เดียวกัน

**ชื่อเอกสาร/สินค้ามาจากไหน** — ลองสองทางแล้วเลือกทางที่ได้ผลดีกว่าเป็นราย ๆ ไป
  · หัวเรื่องบนหน้าแรกของ PDF (ตัวอักษรขนาดใหญ่สุด) — อ่านเป็นภาษาคนมากที่สุด
    เพราะเป็นชื่อที่ผู้ผลิตพิมพ์ไว้เอง เช่น "Wall-mounted Speaker with Volume Control"
  · ถ้าหัวเรื่องใช้ไม่ได้ (สั้นเกิน เป็นโลโก้ เป็นเลขหน้า) ถอยไปใช้ชื่อไฟล์
    ซึ่งมีโครงสร้างแน่นอนทั้งสามแบรนด์ เช่น DAT-013-010-002_V03_EN_1FS21-FootSwitch

ไม่ใช้ /Title ใน metadata เป็นหลักเพราะเชื่อถือไม่ได้ — หลายไฟล์เป็นชื่อไฟล์ Word
ที่ค้างมาจากตอนแปลง ("Microsoft Word - DAT-001-206-014_R02_EN_....doc")

ไฟล์ผลลัพธ์ลงท้าย `.generated.ts` ให้ชัดว่า **ห้ามแก้ด้วยมือ** ส่วนที่ต้องตัดสินใจเอง
(ชื่อหมวดภาษาไทย ลำดับการแสดง) อยู่ใน src/data/datasheets.ts ซึ่งเขียนมือตามปกติ
"""

from __future__ import annotations

import io
import json
import os
import re
import shutil
import sys
import unicodedata

import pymupdf

sys.stdout.reconfigure(encoding='utf-8')

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SOURCES = {
    'industronic': r'F:\Industronic datasheets',
    'fhf': r'F:\FHF datasheet',
    'medc': r'F:\MEDC datasheet',
}

PDF_OUT = os.path.join(REPO, 'public', 'documents', 'datasheets')
THUMB_OUT = os.path.join(REPO, 'public', 'images', 'datasheets')
DATA_OUT = os.path.join(REPO, 'src', 'data', 'datasheets.generated.ts')


# กว้าง 480px — การ์ดแสดงผลกว้างราว 240px จึงคมบนจอ 2x โดยไม่ต้องมีไฟล์สองชุด
THUMB_WIDTH = 480
THUMB_QUALITY = 72


# คำที่อยู่บนหน้าแรกด้วยขนาดใหญ่แต่ไม่ใช่ชื่อเอกสาร — ส่วนใหญ่เป็นโลโก้หรือชื่อ series
HEADING_NOISE = re.compile(
    r'^(crouse-hinds|series|eaton|industronic|fhf|medc|www\.|©|®|\d+\s*/\s*\d+|page \d+)',
    re.I,
)


# --------------------------------------------------------------------------- #
# ชื่อเอกสาร                                                                    #
# --------------------------------------------------------------------------- #
def words_from_camel(text: str) -> str:
    text = text.replace('_', ' ').replace('-', ' ')
    text = re.sub(r'(?<=[a-z0-9])(?=[A-Z])', ' ', text)
    text = re.sub(r'(?<=[A-Z])(?=[A-Z][a-z])', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()


def heading_from_page(page) -> str:
    """หัวเรื่องบนหน้าแรก = กลุ่มข้อความที่ฟอนต์ใหญ่ที่สุด เรียงตามลำดับการอ่าน"""
    spans = []
    for block in page.get_text('dict')['blocks']:
        for line in block.get('lines', []):
            for span in line['spans']:
                text = ' '.join(span['text'].split())
                if not text or HEADING_NOISE.match(text):
                    continue
                # ต้องมีตัวอักษรจริง ไม่ใช่สัญลักษณ์หรือเลขหน้าล้วน
                if not re.search(r'[A-Za-z]', text):
                    continue
                spans.append((round(span['size'], 1), span['bbox'][1], span['bbox'][0], text))
    if not spans:
        return ''

    biggest = max(s[0] for s in spans)
    top = [s for s in spans if s[0] >= biggest - 0.6]
    top.sort(key=lambda s: (s[1], s[2]))  # บนลงล่าง แล้วซ้ายไปขวา

    title = ' '.join(part for *_ignored, part in top)
    title = re.sub(r'\s+', ' ', title).strip(' -–—·|')
    return title


def usable(title: str) -> bool:
    """หัวเรื่องที่เอาไปแสดงบนการ์ดได้จริง"""
    if len(title) < 6 or len(title) > 90:
        return False
    # ต้องมีอย่างน้อยสองคำ ไม่งั้นได้แค่ชื่อรุ่นซึ่งซ้ำกับช่อง model อยู่แล้ว
    return len(title.split()) >= 2


# ตัวย่อที่ต้องคงตัวพิมพ์ใหญ่ไว้ตอนแปลงหัวเรื่องตัวพิมพ์ใหญ่ล้วนเป็น Title Case
ACRONYMS = {
    'IP', 'PC', 'LED', 'GRP', 'ATEX', 'IECEX', 'IECEx', 'DC', 'AC', 'PA', 'GA', 'PABX',
    'VOIP', 'SIP', 'IO', 'USB', 'RU', 'UL', 'EN54', 'SIL2', 'DB', 'PTZ', 'LAN', 'WAN',
    'XENON', 'RJ45', 'POE', 'NTP', 'SNMP', 'UPS', 'EX', 'II', 'III', 'PMOD', 'MODULE',
}
ACRONYM_FIX = {'IECEX': 'IECEx', 'VOIP': 'VoIP', 'POE': 'PoE', 'XENON': 'Xenon',
               'EX': 'Ex', 'MODULE': 'Module'}


def tidy_title(title: str) -> str:
    """เก็บกวาดหัวเรื่องที่แกะมาจากหน้า PDF ให้อ่านเป็นชื่อเอกสารได้จริง"""
    # ยัติภังค์ที่ถูกตัดข้ามบรรทัดแล้วเหลือช่องว่างค้าง: "FLUSH- MOUNTED" → "FLUSH-MOUNTED"
    title = re.sub(r'(\w)-\s+(\w)', r'\1-\2', title)
    title = re.sub(r'\s+', ' ', title).strip(' -–—·|')

    letters = [c for c in title if c.isalpha()]
    if letters and sum(1 for c in letters if c.isupper()) / len(letters) > 0.8:
        # หัวเรื่องตัวพิมพ์ใหญ่ล้วน (Industronic กับ MEDC ใช้แบบนี้) อ่านยากเมื่อมาเรียงกัน
        # เป็นตารางการ์ด แปลงเป็น Title Case แต่คงตัวย่อกับรหัสรุ่นที่มีตัวเลขปนไว้
        words = []
        for word in title.split():
            bare = re.sub(r'[^A-Za-z0-9]', '', word).upper()
            if bare in ACRONYMS:
                words.append(word.replace(bare, ACRONYM_FIX.get(bare, bare))
                             if bare in ACRONYM_FIX else word.upper())
            elif any(c.isdigit() for c in word):
                words.append(word.upper())  # รหัสรุ่น เช่น XB11, DB20, 5W
            else:
                words.append(word.capitalize())
        title = ' '.join(words)
    return title


def version_key(version: str | None) -> tuple[int, int]:
    """เรียงเวอร์ชันเอกสาร — เลขมากกว่าใหม่กว่า และ V ถือว่าใหม่กว่า R ที่เลขเท่ากัน"""
    if not version:
        return (0, 0)
    return (int(re.sub(r'\D', '', version) or 0), 1 if version.upper().startswith('V') else 0)


# --------------------------------------------------------------------------- #
# แกะชื่อไฟล์ของแต่ละแบรนด์                                                      #
# --------------------------------------------------------------------------- #
IND_NAME = re.compile(r'^(?P<doc>[A-Z]{3}-[\d-]+(?:-[A-Z]{2})?)_(?:(?P<ver>[VR]\d+)_)?(?P<lang>[A-Z]{2})_(?P<rest>.+)$')
FHF_NAME = re.compile(r'(?P<doc>dsfh[\d.a-z]*\d)-(?P<lang>en|de)-(?:fhf-)?(?P<rest>.+)$', re.I)
MEDC_NAME = re.compile(r'(?P<doc>[a-z0-9]*ds[a-z]*\d+[a-z]?)-(?P<lang>en|de)-(?:medc-)?(?P<rest>.+)$', re.I)


def model_like(part: str) -> bool:
    """ส่วนของชื่อไฟล์ที่เป็นรหัสรุ่น ไม่ใช่คำในชื่อเอกสาร

    รหัสรุ่นของ Industronic เป็นตัวพิมพ์ใหญ่ล้วน ("NSO001") หรือมีตัวเลขปนและสั้น
    ("1FS21", "BExBG21D") ส่วนคำในชื่อเอกสารเป็น CamelCase ที่มีตัวพิมพ์เล็กและไม่มีเลข
    ("FootSwitch", "IPOutdoorIntercomStation")
    """
    if not any(c.islower() for c in part):
        return True
    return any(c.isdigit() for c in part) and len(part) <= 10


def parse_industronic(stem: str):
    """คืนค่า (เลขเอกสาร, เวอร์ชัน, รุ่น, ภาษา, ชื่อจากชื่อไฟล์)"""
    match = IND_NAME.match(stem)
    if not match:
        return None, None, None, 'en', words_from_camel(stem)
    # บางไฟล์คั่นชื่อรุ่นกับชื่อเอกสารด้วย _ แทน - ("8XDG001_DigitalGatewayModule")
    rest = match.group('rest').replace('_', '-')
    parts = [p for p in rest.split('-') if p]
    # ชื่อรุ่นคือทุกส่วนหน้าสุดที่ยัง "หน้าตาเหมือนรหัสรุ่น" — รุ่นมีขีดกลางในตัวได้
    # ("6-12NOAK001", "DT-DTE705") ส่วนที่เหลือคือชื่อเอกสารแบบ CamelCase
    start = next((i for i, p in enumerate(parts) if not model_like(p)), len(parts))
    model = '-'.join(parts[:start]) or None
    title = words_from_camel(' '.join(parts[start:])) or words_from_camel(rest)
    return match.group('doc'), match.group('ver'), model, match.group('lang').lower(), title


def parse_signalling(stem: str, pattern):
    """FHF และ MEDC ใช้รูปแบบเดียวกัน: <docno>-<lang>-<brand>-<model>-<kind>"""
    match = pattern.search(stem)
    if not match:
        return None, None, None, 'en', words_from_camel(stem)
    rest = re.sub(r'\.pdf$', '', match.group('rest'), flags=re.I)
    parts = [p for p in rest.split('-') if p]
    # ส่วนท้ายที่เป็นคำอังกฤษล้วนคือชนิดอุปกรณ์ ส่วนหน้าคือชื่อรุ่น
    kind_start = len(parts)
    for i in range(len(parts) - 1, -1, -1):
        if re.match(r'^[a-z]+$', parts[i]) and parts[i] not in ('and', 'ul', 'sl', 'mb', 'z2'):
            kind_start = i
        else:
            break
    model = '-'.join(parts[:kind_start]).upper() or None
    title = ' '.join(parts[kind_start:]).replace('-', ' ').strip()
    # เลขเอกสารของสองแบรนด์นี้ไม่ซ้ำกันอยู่แล้ว จึงไม่มีเวอร์ชันให้เทียบ
    return match.group('doc').upper(), None, model, match.group('lang').lower(), title.title()


PARSERS = {
    'industronic': parse_industronic,
    'fhf': lambda stem: parse_signalling(stem, FHF_NAME),
    'medc': lambda stem: parse_signalling(stem, MEDC_NAME),
}


# --------------------------------------------------------------------------- #
# หมวดหมู่                                                                      #
# --------------------------------------------------------------------------- #
# MEDC ส่งไฟล์มาแบนไม่มีโฟลเดอร์ — จัดหมวดจากคำท้ายชื่อไฟล์ซึ่งเป็นชนิดอุปกรณ์
MEDC_KINDS = [
    ('combination-unit', 'combination-units'),
    ('junction-box', 'junction-boxes'),
    ('heat-detector', 'detectors'),
    ('alarm-bell', 'sounders'),
    ('callpoint', 'call-points'),
    ('loudspeaker', 'loudspeakers'),
    ('speaker', 'loudspeakers'),
    ('sounder', 'sounders'),
    ('beacon', 'beacons'),
]


def slugify(text: str) -> str:
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode()
    text = re.sub(r'[^a-zA-Z0-9]+', '-', text).strip('-').lower()
    return re.sub(r'-{2,}', '-', text)


def category_of(brand: str, rel_dir: str, stem: str) -> str:
    if brand == 'medc':
        low = stem.lower()
        for needle, group in MEDC_KINDS:
            if needle in low:
                return group
        return 'other'
    if rel_dir in ('.', ''):
        return 'other'
    return slugify(rel_dir)


# --------------------------------------------------------------------------- #
# main                                                                         #
# --------------------------------------------------------------------------- #
def collect(brand: str, root: str):
    """เดินโฟลเดอร์ต้นทาง แกะชื่อไฟล์ แล้วคัดเฉพาะเอกสารเวอร์ชันล่าสุดของแต่ละเลขเอกสาร

    ผู้ผลิตส่งมาทั้งของเก่าและของใหม่ปนกันในโฟลเดอร์เดียว (เช่น DAT-302-056-000
    มีทั้ง V03 และ V04) ถ้าไม่คัดออกจะได้การ์ดหน้าตาเหมือนกันสองใบเรียงติดกัน
    แล้วผู้อ่านต้องเปิดทั้งสองไฟล์เองเพื่อดูว่าอันไหนใหม่กว่า
    """
    candidates = []
    for dirpath, _dirs, files in os.walk(root):
        rel_dir = os.path.relpath(dirpath, root).replace(os.sep, '/')
        for filename in sorted(files):
            if not filename.lower().endswith('.pdf'):
                continue
            stem = re.sub(r'(\.pdf)+$', '', filename, flags=re.I)
            doc_no, version, model, language, name_title = PARSERS[brand](stem)
            candidates.append({
                'source': os.path.join(dirpath, filename),
                'stem': stem,
                'docNo': doc_no,
                'version': version,
                'model': model,
                'language': language,
                'nameTitle': name_title,
                'category': category_of(brand, rel_dir, stem),
            })

    newest = {}
    dropped = 0
    for item in candidates:
        key = item['docNo'] or item['stem']
        current = newest.get(key)
        if current is None:
            newest[key] = item
        elif version_key(item['version']) > version_key(current['version']):
            newest[key] = item
            dropped += 1
        else:
            dropped += 1
    return list(newest.values()), dropped


def build():
    records = []
    for brand, root in SOURCES.items():
        if not os.path.isdir(root):
            sys.exit('ไม่พบโฟลเดอร์ต้นทางของ %s: %s' % (brand, root))

        pdf_dir = os.path.join(PDF_OUT, brand)
        thumb_dir = os.path.join(THUMB_OUT, brand)
        for folder in (pdf_dir, thumb_dir):
            # ล้างของเดิมก่อน ไม่งั้นไฟล์ของเวอร์ชันที่ถูกคัดออกจะค้างอยู่ใน public/
            shutil.rmtree(folder, ignore_errors=True)
            os.makedirs(folder, exist_ok=True)

        items, dropped = collect(brand, root)
        seen_ids = set()
        for item in sorted(items, key=lambda i: i['stem']):
            doc = pymupdf.open(item['source'])
            heading = heading_from_page(doc[0])
            title = tidy_title(heading if usable(heading) else item['nameTitle'])
            page_count = doc.page_count

            item_id = slugify('%s-%s' % (item['model'] or '', title))[:70] or slugify(item['stem'])[:70]
            suffix = 2
            while item_id in seen_ids:
                item_id = '%s-%d' % (item_id, suffix)
                suffix += 1
            seen_ids.add(item_id)

            page = doc[0]
            zoom = THUMB_WIDTH / page.rect.width
            pixmap = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False)
            thumb_name = '%s.webp' % item_id
            pixmap.pil_save(
                os.path.join(thumb_dir, thumb_name),
                format='WEBP',
                quality=THUMB_QUALITY,
                method=6,
            )
            thumb_size = (pixmap.width, pixmap.height)
            doc.close()

            # ไฟล์ PDF ต้นฉบับ ไม่บีบอัดซ้ำ — เป็นสื่อของผู้ผลิตที่ต้องส่งต่อตามเดิม
            pdf_name = '%s.pdf' % item_id
            shutil.copy2(item['source'], os.path.join(pdf_dir, pdf_name))

            records.append({
                'id': item_id,
                'brandId': brand,
                'category': item['category'],
                'title': title,
                'model': item['model'],
                'docNo': item['docNo'],
                'language': item['language'],
                'pages': page_count,
                'sizeKb': round(os.path.getsize(item['source']) / 1024),
                'pdfUrl': '/documents/datasheets/%s/%s' % (brand, pdf_name),
                'thumbSrc': '/images/datasheets/%s/%s' % (brand, thumb_name),
                'thumbWidth': thumb_size[0],
                'thumbHeight': thumb_size[1],
            })
        kept = sum(1 for r in records if r['brandId'] == brand)
        print('%-12s เก็บ %3d ไฟล์ · คัดเวอร์ชันเก่าออก %d' % (brand, kept, dropped))

    records.sort(key=lambda r: (r['brandId'], r['category'], r['title'].lower()))
    write_data(records)

    total_mb = sum(r['sizeKb'] for r in records) / 1024
    print('\nรวม %d รายการ · PDF %.0f MB' % (len(records), total_mb))
    print('ขั้นต่อไป: python scripts/build-products.py  (ดึงภาพสินค้าจาก PDF ที่คัดลอกมาแล้ว)')


def ts_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def write_data(records):
    lines = [
        '// ⚠️ ไฟล์นี้ถูกสร้างด้วย scripts/build-datasheets.py — **ห้ามแก้ด้วยมือ**',
        '//    แก้แล้วจะหายทั้งหมดตอนรันสคริปต์รอบหน้า ถ้าต้องเปลี่ยนชื่อหมวดหรือคำแปลไทย',
        '//    ให้แก้ที่ src/data/datasheets.ts แทน',
        "import type { Datasheet } from '@/types/content'",
        '',
        'export const generatedDatasheets: Datasheet[] = [',
    ]
    for r in records:
        lines.append('  {')
        lines.append('    id: %s,' % ts_string(r['id']))
        lines.append('    brandId: %s,' % ts_string(r['brandId']))
        lines.append('    category: %s,' % ts_string(r['category']))
        lines.append('    title: %s,' % ts_string(r['title']))
        if r['model']:
            lines.append('    model: %s,' % ts_string(r['model']))
        if r['docNo']:
            lines.append('    docNo: %s,' % ts_string(r['docNo']))
        lines.append('    language: %s,' % ts_string(r['language']))
        lines.append('    pages: %d,' % r['pages'])
        lines.append('    sizeKb: %d,' % r['sizeKb'])
        lines.append('    pdfUrl: %s,' % ts_string(r['pdfUrl']))
        lines.append('    thumb: {')
        lines.append('      src: %s,' % ts_string(r['thumbSrc']))
        lines.append('      width: %d,' % r['thumbWidth'])
        lines.append('      height: %d,' % r['thumbHeight'])
        lines.append('    },')
        lines.append('  },')
    lines.append(']')
    lines.append('')

    with io.open(DATA_OUT, 'w', encoding='utf-8', newline='') as handle:
        handle.write('\n'.join(lines))



if __name__ == '__main__':
    build()
