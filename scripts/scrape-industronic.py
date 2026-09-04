# -*- coding: utf-8 -*-
"""
ดึงรายการสินค้า Industronic จากเว็บผู้ผลิต https://www.industronic.com

รันด้วย:  python scripts/scrape-industronic.py
ต้องมี:   pip install pillow

  อ่าน   หน้าสินค้าบน industronic.com (ดู PAGES)
  เขียน  public/images/catalog/industronic/*.webp
         src/data/products-industronic.generated.ts

**ทำไมไม่ใช้ภาพจากไฟล์ PDF เหมือน FHF/MEDC** — เอกสาร PDF ของ Industronic
ให้ภาพที่ใช้ได้ไม่ครบ หลายรุ่นมีแต่ภาพแบบหรือ block diagram ไม่มีรูปสินค้าเลย
ส่วนเว็บของผู้ผลิตมีรูปสินค้าตัดพื้นหลังความละเอียด 767px ครบทุกรุ่น
พร้อมรายการคุณสมบัติที่ผู้ผลิตเขียนเอง ซึ่งดีกว่าทุกอย่างที่แกะจาก PDF ได้

**หมวดยึดตามหน้าสินค้าของเราเอง ไม่ใช่โครงเมนูของผู้ผลิต** — ดู PAGES ด้านล่าง
เว็บผู้ผลิตซอยหมวดย่อยละเอียดกว่า (ในอาคาร/กลางแจ้ง/กันระเบิด) แต่หน้าสินค้าของเรา
รวมเป็น "สถานีอินเตอร์คอม" หมวดเดียว การ map ไว้ตรงนี้ทำให้ทั้งสองฝั่งเปลี่ยนได้อิสระ

⚠️ ภาพและข้อความทั้งหมดเป็น**สื่อของผู้ผลิต** ที่ IDIE เผยแพร่ในฐานะตัวแทนจำหน่าย
   TODO: confirm with IDIE — ขอหนังสือยืนยันสิทธิ์เผยแพร่ก่อนขึ้น production
"""

from __future__ import annotations

import html as htmllib
import io
import json
import os
import re
import shutil
import sys
import time
import urllib.parse
import urllib.request
from io import BytesIO

from PIL import Image

# กติกาการครอบภาพเดียวกับ build-products.py เพื่อให้การ์ดของทุกแบรนด์เท่ากัน
from imageframe import frame_product

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.stdout.reconfigure(encoding='utf-8')

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATALOG_OUT = os.path.join(REPO, 'public', 'images', 'catalog', 'industronic')
DATA_OUT = os.path.join(REPO, 'src', 'data', 'products-industronic.generated.ts')
DATASHEETS_TS = os.path.join(REPO, 'src', 'data', 'datasheets.generated.ts')

BASE = 'https://www.industronic.com'
HEADERS = {'User-Agent': 'Mozilla/5.0 (compatible; IDIE-website-build/1.0)'}

GALLERY_WIDTH = 1000
GALLERY_QUALITY = 80
CARD_WIDTH = 480
CARD_QUALITY = 76

# หน้าบนเว็บผู้ผลิต → หมวดในหน้าสินค้าของเรา
PAGES = [
    ('/products/intron-x', 'intron-x'),
    ('/products/components/intercom-stations/indoor', 'intercom-stations'),
    ('/products/components/intercom-stations/outdoor', 'intercom-stations'),
    ('/products/components/intercom-stations/explosion-proof', 'intercom-stations'),
    ('/products/components/speakers-sirens/wall-mounted-indoor-speakers', 'speakers-sirens'),
    ('/products/components/speakers-sirens/in-ceiling-indoor-speakers', 'speakers-sirens'),
    ('/products/components/speakers-sirens/horn-speakers-weatherproof', 'speakers-sirens'),
    ('/products/components/speakers-sirens/horn-speakers-explosion-proof', 'speakers-sirens'),
    ('/products/components/speakers-sirens/en-54-24', 'speakers-sirens'),
    ('/products/components/speakers-sirens/sirens', 'speakers-sirens'),
    ('/products/components/flashing-warning-beacons', 'flashing-warning-beacons'),
    ('/products/components/public-address-pa-modules', 'public-address-pa-modules'),
    ('/products/components/xpa-next-level-amp', 'public-address-pa-modules'),
    ('/products/components/system-components', 'system-components'),
    ('/products/components/power-supply-units', 'power-supply-units'),
    ('/products/software/config-manager', 'system-software-interfaces'),
    ('/products/software/dustron', 'system-software-interfaces'),
    ('/products/software/service-tool', 'system-software-interfaces'),
]


def fetch(path: str) -> str:
    request = urllib.request.Request(BASE + path, headers=HEADERS)
    return urllib.request.urlopen(request, timeout=40).read().decode('utf-8', 'replace')


def fetch_bytes(url: str) -> bytes:
    request = urllib.request.Request(url, headers=HEADERS)
    return urllib.request.urlopen(request, timeout=60).read()


def text_of(fragment: str) -> str:
    """ถอดแท็กออกให้เหลือข้อความล้วน พร้อมคืนค่า entity และรีดช่องว่าง"""
    plain = re.sub(r'<[^>]+>', ' ', fragment)
    plain = htmllib.unescape(plain).replace('\xa0', ' ')
    return re.sub(r'\s+', ' ', plain).strip()


def slugify(text: str) -> str:
    text = re.sub(r'[^a-zA-Z0-9]+', '-', text).strip('-').lower()
    return re.sub(r'-{2,}', '-', text)


ITEM = re.compile(r'<div class="item">')
NAME = re.compile(r'class="productNumber"[^>]*>(.*?)</h3>', re.S)
MODEL = re.compile(r'class="productName"[^>]*>(.*?)</span>', re.S)
FEATURES = re.compile(r'Features and Functions\s*</h3>\s*<ul>(.*?)</ul>', re.S)
# `<li[^>]*>` ไม่ใช่ `<li>` — บางหน้า CMS ใส่ data-list-item-id มาในแท็กด้วย
# เกณฑ์เดิมจับไม่ได้เลย ทำให้สินค้า 15 รุ่นขึ้นเว็บโดยไม่มีคุณสมบัติสักข้อ
LIST_ITEM = re.compile(r'<li[^>]*>(.*?)</li>', re.S)
ICONS = re.compile(r'<div class="producticons">(.*?)</div>', re.S)
ICON_ALT = re.compile(r'alt="([^"]*)"')
DATASHEET = re.compile(r'<a href="([^"]+\.pdf)"[^>]*class="datasheet"', re.I)
IMG_SRC = re.compile(r'<img[^>]+src="(/fileadmin/[^"]+)"')


WORDY = re.compile(r'[a-z]{2}')


def looks_like_model(text: str) -> bool:
    """ข้อความนี้เป็นรหัสรุ่นหรือชื่อสินค้า

    รหัสรุ่นแทบไม่มีคำที่เป็นภาษาคน ("PMOD 1 XCO 001", "12 NIB 001", "D1xL2F 25W")
    ส่วนชื่อสินค้ามีคำที่มีตัวพิมพ์เล็กติดกันอย่างน้อยสองคำ ("Digital Gateway Module")
    """
    return sum(1 for word in text.split() if WORDY.search(word)) < 2


def name_and_model(number_field: str, name_field: str) -> tuple[str, str]:
    """คืน (ชื่อสินค้า, รหัสรุ่น) จากสองฟิลด์ของ CMS

    **ผู้ผลิตใช้สองฟิลด์นี้สลับกันคนละหน้า** — หน้าในหมวด components ใส่ชื่อไว้ใน
    `productNumber` และรุ่นไว้ใน `productName` ส่วนหน้า INTRON-X ทำกลับกัน
    ถ้าเชื่อชื่อฟิลด์ตรง ๆ จะได้การ์ดที่พาดหัวเป็น "PMOD 1 XCO 001" แล้วบรรทัดรุ่น
    เป็น "X-Controller Module" ซึ่งกลับหัวกลับหาง

    ตัดสินจากตัวข้อความเองแทน ถ้าดูไม่ออกทั้งคู่ค่อยใช้ลำดับปกติ
    """
    number_is_model = looks_like_model(number_field)
    name_is_model = looks_like_model(name_field)
    if number_is_model and not name_is_model:
        return name_field, number_field
    return number_field, name_field


def split_items(page: str) -> list[str]:
    """ตัดหน้าออกเป็นบล็อกละสินค้า

    ใช้ตำแหน่งของ `<div class="item">` เป็นตัวคั่น แทนการไล่นับวงเล็บปิด —
    โครง HTML ซ้อนกันหลายชั้นและมี div ปิดเกินจริงอยู่บ้าง การนับจึงเชื่อถือไม่ได้
    บล็อกสุดท้ายลากไปจนจบ section ซึ่งอาจมีท้ายหน้าติดมา แต่ทุกอย่างที่เราดึง
    (ชื่อ รุ่น คุณสมบัติ รูป) ถูกจับด้วย regex ที่หยุดเองอยู่แล้ว
    """
    marks = [m.start() for m in ITEM.finditer(page)]
    if not marks:
        return []
    end = page.find('</section>', marks[-1])
    bounds = marks + [end if end != -1 else len(page)]
    return [page[bounds[i]:bounds[i + 1]] for i in range(len(marks))]


PICTURE = re.compile(r'<picture>(.*?)</picture>', re.S)
SRCSET = re.compile(r'<source[^>]+srcset="([^"]+)"')


def product_images(block: str) -> list[str]:
    """URL ภาพสินค้าขนาดใหญ่ที่สุดของแต่ละรูป เรียงตามลำดับที่ปรากฏ

    เว็บใช้ `<picture>` ที่มี `<source>` ไล่ตามความกว้างจอ แล้วปิดท้ายด้วย `<img>`
    เลือกทีละ `<picture>` แบบนี้
      1. ถ้ามีไฟล์ต้นฉบับใต้ /fileadmin/Bilder/ ให้ใช้ตัวนั้น — ความละเอียดเต็ม
      2. ถ้าไม่มี (บางรุ่นผู้ผลิตอัปโหลดเฉพาะไฟล์ที่ย่อแล้ว) ให้ใช้ `<source>` **ตัวสุดท้าย**
         ซึ่งเป็นของ breakpoint กว้างสุด จึงใหญ่ที่สุดในบรรดาที่มี

    ข้อ 2 สำคัญ — รอบแรกผมกรอง `_processed_` ทิ้งทั้งหมด ทำให้สินค้าสี่รุ่นที่ผู้ผลิต
    ไม่ได้อัปไฟล์ต้นฉบับไว้กลายเป็นไม่มีภาพเลย ทั้งที่บนเว็บเขามีรูปแสดงอยู่

    ไม่เอา /typo3temp/ เพราะเป็นไอคอนคุณสมบัติ ไม่ใช่ภาพสินค้า
    """
    urls = []
    for picture in PICTURE.findall(block):
        candidates = SRCSET.findall(picture) + IMG_SRC.findall(picture)
        candidates = [c for c in candidates if '/typo3temp/' not in c]
        if not candidates:
            continue
        original = next((c for c in candidates if '_processed_' not in c), None)
        chosen = original or SRCSET.findall(picture)[-1] if SRCSET.findall(picture) else None
        chosen = original or chosen or candidates[-1]
        if chosen and chosen not in urls:
            urls.append(chosen)
    return urls


def load_local_datasheets() -> dict[str, str]:
    """รหัสรุ่น → URL ดาต้าชีตที่เราโฮสต์เอง

    ถ้ารุ่นไหนมีไฟล์อยู่ใน repo แล้วให้ลิงก์ไปที่ไฟล์ของเรา ผู้อ่านจะได้ไม่ต้อง
    ออกนอกเว็บ ส่วนรุ่นที่ไม่มีค่อยลิงก์ไปเว็บผู้ผลิต
    """
    text = io.open(DATASHEETS_TS, encoding='utf-8').read()
    out = {}
    for block in re.split(r'\n  \{', text)[1:]:
        model = re.search(r'\n    model: "([^"]+)"', block)
        url = re.search(r'\n    pdfUrl: "([^"]+)"', block)
        brand = re.search(r'\n    brandId: "([^"]+)"', block)
        if model and url and brand and brand.group(1) == 'industronic':
            key = re.sub(r'[^a-z0-9]', '', model.group(1).lower())
            out.setdefault(key, url.group(1))
    return out


def save_web(image: Image.Image, path: str, width: int, quality: int):
    if image.width > width:
        height = max(round(image.height * width / image.width), 1)
        image = image.resize((width, height), Image.LANCZOS)
    image.save(path, 'WEBP', quality=quality, method=6)
    return image.size


def flatten(image: Image.Image) -> Image.Image:
    """ภาพสินค้าเป็น PNG พื้นโปร่ง — วางบนพื้นขาวก่อนแปลงเป็น WebP

    การ์ดกับแกลเลอรีบนเว็บเป็นพื้นขาวอยู่แล้ว การวางพื้นให้ตั้งแต่ตอนแปลงทำให้
    ขนาดไฟล์เล็กลงและไม่มีขอบดำโผล่ถ้าวันหนึ่งเอาไปวางบนพื้นสีอื่น
    """
    if image.mode in ('RGBA', 'LA', 'P'):
        image = image.convert('RGBA')
        flat = Image.new('RGB', image.size, (255, 255, 255))
        flat.paste(image, mask=image.split()[3])
        return flat
    return image.convert('RGB')


def build():
    local_sheets = load_local_datasheets()
    shutil.rmtree(CATALOG_OUT, ignore_errors=True)
    os.makedirs(CATALOG_OUT, exist_ok=True)

    products = []
    seen_slugs = set()
    seen_products = set()
    duplicates = []
    image_cache: dict[str, tuple[str, int, int]] = {}
    failures = []

    for path, category in PAGES:
        try:
            page = fetch(path)
        except Exception as exc:
            failures.append('%s — โหลดหน้าไม่ได้: %s' % (path, exc))
            continue

        blocks = split_items(page)
        for block in blocks:
            name_match = NAME.search(block)
            model_match = MODEL.search(block)
            if not name_match:
                continue
            name, model = name_and_model(
                text_of(name_match.group(1)),
                text_of(model_match.group(1)) if model_match else '',
            )
            if not name:
                continue

            features = []
            features_match = FEATURES.search(block)
            if features_match:
                for item in LIST_ITEM.findall(features_match.group(1)):
                    line = text_of(item)
                    if line:
                        features.append(line)

            attributes = []
            icons_match = ICONS.search(block)
            if icons_match:
                attributes = [a for a in ICON_ALT.findall(icons_match.group(1)) if a]

            # **สินค้าเดียวกันถูกลงไว้หลายหน้าบนเว็บผู้ผลิต** — ฝาครอบอะคูสติกอยู่ทั้ง
            # หน้ากลางแจ้งและหน้ากันระเบิด · โมดูล PMOD อยู่ทั้งหน้า INTRON-X และ
            # หน้าชิ้นส่วนระบบ · ลำโพง EN 54 อยู่ทั้งหน้าตามชนิดและหน้า EN 54-24
            # เดิมเติมเลขต่อท้าย slug ทำให้ได้การ์ดหน้าตาเหมือนกันสองใบเรียงติดกัน
            # ตอนนี้เก็บเฉพาะครั้งแรกที่เจอ ซึ่งเรียงตามลำดับใน PAGES
            identity = (name.lower(), model.lower())
            if identity in seen_products:
                duplicates.append('%s %s (ซ้ำกับหน้าก่อนหน้า)' % (model, name))
                continue
            seen_products.add(identity)

            slug = slugify('%s %s' % (model, name))[:70] or slugify(name)[:70]
            suffix = 2
            while slug in seen_slugs:
                slug = '%s-%d' % (slug, suffix)
                suffix += 1
            seen_slugs.add(slug)

            gallery = []
            for index, src in enumerate(product_images(block)):
                if src in image_cache:
                    cached = image_cache[src]
                    gallery.append({'src': cached[0], 'width': cached[1], 'height': cached[2]})
                    continue
                try:
                    raw = fetch_bytes(BASE + urllib.parse.quote(src))
                    image = flatten(Image.open(BytesIO(raw)))
                except Exception as exc:
                    failures.append('%s — โหลดภาพไม่ได้ %s: %s' % (slug, src, exc))
                    continue
                filename = '%s-%d.webp' % (slug, index + 1)
                size = save_web(image, os.path.join(CATALOG_OUT, filename),
                                GALLERY_WIDTH, GALLERY_QUALITY)
                url = '/images/catalog/industronic/%s' % filename
                image_cache[src] = (url, size[0], size[1])
                gallery.append({'src': url, 'width': size[0], 'height': size[1]})

                time.sleep(0.15)

            card = None
            if gallery:
                # สร้างภาพการ์ดจากภาพแรกใน gallery เสมอ **ไม่ใช่เฉพาะตอนดาวน์โหลดใหม่** —
                # สินค้าหลายรุ่นใช้ภาพไฟล์เดียวกัน (เช่น รุ่นย่อยของสายเดียวกัน) ตัวแคช
                # จะข้ามการดาวน์โหลด ทำให้รุ่นหลัง ๆ ไม่มีภาพการ์ดถ้าผูกไว้กับรอบดาวน์โหลด
                card_name = '%s-card.webp' % slug
                card_path = os.path.join(CATALOG_OUT, card_name)
                source_path = os.path.join(REPO, 'public',
                                           gallery[0]['src'].lstrip('/').replace('/', os.sep))
                try:
                    with Image.open(source_path) as first:
                        framed = frame_product(first, CARD_WIDTH)
                    size = save_web(framed, card_path, CARD_WIDTH, CARD_QUALITY)
                    card = {'src': '/images/catalog/industronic/%s' % card_name,
                            'width': size[0], 'height': size[1]}
                except Exception as exc:
                    failures.append('%s — สร้างภาพการ์ดไม่ได้: %s' % (slug, exc))

            key = re.sub(r'[^a-z0-9]', '', model.lower())
            datasheet_match = DATASHEET.search(block)
            datasheet = local_sheets.get(key)
            if not datasheet and datasheet_match:
                datasheet = BASE + datasheet_match.group(1)

            products.append({
                'slug': slug,
                'brandId': 'industronic',
                'category': category,
                'name': name,
                'model': model or None,
                'features': features,
                'attributes': attributes,
                'datasheetUrl': datasheet,
                'sourceUrl': BASE + path,
                'card': card,
                'gallery': gallery,
            })
        print('%-58s %2d รายการ' % (path, len(blocks)))
        time.sleep(0.3)

    products.sort(key=lambda p: (p['category'], p['name'].lower()))
    write_products(products)

    images = sum(len(p['gallery']) for p in products)
    with_local = sum(1 for p in products if p['datasheetUrl'] and p['datasheetUrl'].startswith('/'))
    print('\nรวม %d รายการ · ภาพ %d ไฟล์ · มีคุณสมบัติ %d · ดาต้าชีตในเว็บเรา %d'
          % (len(products), images,
             sum(1 for p in products if p['features']), with_local))
    if duplicates:
        print('คัดรายการซ้ำออก %d รายการ (ผู้ผลิตลงไว้หลายหน้า)' % len(duplicates))
    if failures:
        print('ปัญหาที่เจอ %d รายการ:' % len(failures))
        for line in failures[:15]:
            print('   ', line)


def ts_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def write_products(records):
    lines = [
        '// ⚠️ ไฟล์นี้ถูกสร้างด้วย scripts/scrape-industronic.py — **ห้ามแก้ด้วยมือ**',
        '//    ข้อมูลและภาพทั้งหมดมาจากเว็บผู้ผลิต industronic.com โดยตรง',
        "import type { Product } from '@/types/content'",
        '',
        'export const industronicProducts: Product[] = [',
    ]
    for r in records:
        lines.append('  {')
        lines.append('    slug: %s,' % ts_string(r['slug']))
        lines.append("    brandId: 'industronic',")
        lines.append('    category: %s,' % ts_string(r['category']))
        lines.append('    name: %s,' % ts_string(r['name']))
        if r['model']:
            lines.append('    model: %s,' % ts_string(r['model']))
        if r['datasheetUrl']:
            lines.append('    datasheetUrl: %s,' % ts_string(r['datasheetUrl']))
        lines.append('    sourceUrl: %s,' % ts_string(r['sourceUrl']))
        if r['features']:
            lines.append('    features: [')
            for feature in r['features']:
                lines.append('      %s,' % ts_string(feature))
            lines.append('    ],')
        if r['attributes']:
            lines.append('    attributes: [%s],'
                         % ', '.join(ts_string(a) for a in r['attributes']))
        if r['card']:
            lines.append('    card: { src: %s, width: %d, height: %d },'
                         % (ts_string(r['card']['src']), r['card']['width'], r['card']['height']))
        if r['gallery']:
            lines.append('    gallery: [')
            for g in r['gallery']:
                lines.append('      { src: %s, width: %d, height: %d, kind: "photo" },'
                             % (ts_string(g['src']), g['width'], g['height']))
            lines.append('    ],')
        else:
            lines.append('    gallery: [],')
        lines.append('  },')
    lines.append(']')
    lines.append('')

    with io.open(DATA_OUT, 'w', encoding='utf-8', newline='') as handle:
        handle.write('\n'.join(lines))


if __name__ == '__main__':
    build()
