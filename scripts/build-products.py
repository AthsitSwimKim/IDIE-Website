# -*- coding: utf-8 -*-
"""
สร้างรายการสินค้าและภาพสินค้า จาก**เอกสารข้อมูลสินค้าที่อยู่ใน repo แล้ว**

รันด้วย:  python scripts/build-products.py
ต้องมี:   pip install pymupdf pillow

  อ่าน   public/documents/datasheets/<brand>/*.pdf  +  src/data/datasheets.generated.ts
  เขียน  public/images/catalog/<brand>/*.webp       +  src/data/products.generated.ts

**สินค้าหนึ่งรายการ = เอกสารข้อมูลสินค้าหนึ่งฉบับ** ชื่อ รหัสรุ่น หมวด และ slug
ยกมาจาก `datasheets.generated.ts` ทั้งหมด ไม่ได้แกะชื่อไฟล์ใหม่ — สองหน้านี้จึงพูดถึง
ของชิ้นเดียวกันด้วยชื่อเดียวกันเสมอ และลิงก์ข้ามกันไม่มีทางหลุด

**ทำไมอ่านจาก repo ไม่ใช่จากไดรฟ์ต้นทาง** — ไฟล์ใน `public/documents/` เป็นสำเนา
ที่ไม่ถูกแก้ไขของต้นฉบับอยู่แล้ว การอ่านจากตรงนั้นทำให้รันซ้ำได้ทุกเมื่อโดยไม่ต้อง
ต่อไดรฟ์ภายนอก และรับประกันว่าภาพที่ได้ตรงกับไฟล์ที่ผู้ใช้กดโหลดจริง ๆ

**ภาพในเอกสารมาสองแบบ ต้องดึงคนละวิธี**
  · **ภาพฝัง (raster)** — ภาพถ่ายสินค้าเกือบทั้งหมด และภาพแบบของ FHF/Industronic
    ดึงตรงจาก xref ของหน้า แล้วคัดสื่อประจำแบรนด์ออก (โลโก้ ตรามาตรฐาน แถบหัวท้าย)
  · **ภาพแบบที่วาดด้วยเส้น vector** — ของ MEDC เกือบทั้งหมดเป็นแบบนี้ ไม่มีภาพฝัง
    ให้ดึงเลย ต้องหาก้อนของเส้นบนหน้าแล้วเรนเดอร์เฉพาะกรอบนั้น ถ้าไม่ทำ
    ภาพแบบบอกขนาดจะหายไปทั้งแบรนด์

ไฟล์ผลลัพธ์ลงท้าย `.generated.ts` — **ห้ามแก้ด้วยมือ** ชื่อหมวดภาษาไทยและลำดับ
การแสดงผลอยู่ใน src/data/datasheets.ts ซึ่งหน้าสินค้าใช้ร่วมกับหน้าคลังเอกสาร
"""

from __future__ import annotations

import hashlib
import io
import json
import os
import re
import shutil
import sys
from collections import Counter

import numpy as np
import pymupdf
from io import BytesIO
from PIL import Image, ImageFilter

# กติกาการครอบภาพอยู่ในไฟล์กลาง เพื่อให้หน้าสินค้าของทุกแบรนด์หน้าตาเหมือนกัน
from imageframe import CARD_PADDING, frame_product, trim_background  # noqa: F401

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.stdout.reconfigure(encoding='utf-8')

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF_ROOT = os.path.join(REPO, 'public', 'documents', 'datasheets')
CATALOG_OUT = os.path.join(REPO, 'public', 'images', 'catalog')
DATASHEETS_TS = os.path.join(REPO, 'src', 'data', 'datasheets.generated.ts')
PRODUCTS_OUT = os.path.join(REPO, 'src', 'data', 'products.generated.ts')

GALLERY_WIDTH = 1000     # ภาพเต็มในแกลเลอรี — พอสำหรับดูภาพแบบและอ่านตัวเลขบอกขนาด
GALLERY_QUALITY = 78
CARD_WIDTH = 480         # ภาพบนการ์ดในหน้ารายการ (แสดงจริงราว 240px)
MIN_IMAGE_SIDE = 60      # ด้านสั้นสุดที่ยอมรับ — ไมโครโฟนมือถือในเอกสารกว้างแค่ 69px
                         # ของจิ๋วจริง ๆ ถูกกันด้วย MIN_IMAGE_AREA อีกชั้นอยู่แล้ว
MIN_IMAGE_AREA = 15000   # เล็กกว่านี้เป็นไอคอนหรือหัวลูกศร ไม่ใช่ภาพสินค้า
BADGE_MAX_SIDE = 200     # ภาพจัตุรัสที่เล็กกว่านี้คือตราสัญลักษณ์ ไม่ใช่ของจริง
TEXT_PANEL_WORDS = 12    # คำในเลเยอร์ข้อความที่ทับกรอบภาพ เกินนี้ถือว่าเป็นแผงข้อความ
TEXT_PANEL_SHARE = 0.20  # และต้องกินสัดส่วนคำในหน้าเกินนี้ด้วย
# ผอมกว่านี้เป็นแถบหัว/ท้ายกระดาษ ไม่ใช่ภาพสินค้า — เกณฑ์เดิม 5.0 แคบเกินไป
# เพราะโมดูลติดตู้แร็คของ Industronic เป็นแผงยาวแบน อัตราส่วนถึง 11:1 ก็มี
# ส่วนแถบหัวกระดาษจริงอยู่ที่ 16–25:1 และซ้ำทุกเอกสารอยู่แล้วจึงโดนคัดอีกชั้นหนึ่ง
MAX_ASPECT = 13.0
BOILERPLATE_DOCS = 4     # ภาพเดียวกันโผล่ในเอกสารตั้งแต่นี้ขึ้นไป = สื่อประจำแบรนด์
MAX_GALLERY = 10         # เกินนี้ผู้อ่านไม่ได้ประโยชน์เพิ่ม และไฟล์บวมเร็วมาก

# ภาพที่แปลงไม่สำเร็จ — รายงานท้ายการรัน ไม่ปล่อยให้หายเงียบเหมือนรอบแรก
FAILED: list[int] = []


# --------------------------------------------------------------------------- #
# อ่านรายการเอกสารที่สร้างไว้แล้ว                                                 #
# --------------------------------------------------------------------------- #
FIELD = re.compile(r'^\s{4}(\w+): (.+?),?$')


def read_datasheets():
    """แกะ datasheets.generated.ts กลับมาเป็น dict

    อ่านด้วย regex ไม่ใช่ JSON parser เพราะไฟล์เป็น TypeScript — แต่รูปแบบมันถูกเขียน
    ด้วยสคริปต์ ไม่ใช่คนพิมพ์ จึงคาดเดาได้ทุกบรรทัด ถ้าวันหนึ่งรูปแบบเปลี่ยน
    ฟังก์ชันนี้จะคืนรายการว่างแล้วสคริปต์หยุดทันที ไม่ใช่เขียนข้อมูลผิด ๆ ทับ
    """
    text = io.open(DATASHEETS_TS, encoding='utf-8').read()
    records = []
    current = None
    for line in text.splitlines():
        stripped = line.strip()
        if stripped == '{':
            current = {}
            continue
        if current is None:
            continue
        if stripped in ('},', '}'):
            if 'id' in current:
                records.append(current)
            current = None
            continue
        match = FIELD.match(line)
        if not match:
            continue
        key, raw = match.group(1), match.group(2).rstrip(',')
        if raw.startswith('"'):
            current[key] = json.loads(raw)
        elif raw.isdigit():
            current[key] = int(raw)
    return records


# --------------------------------------------------------------------------- #
# ภาพสินค้า                                                                     #
# --------------------------------------------------------------------------- #
def pixmap_to_pil(pix) -> Image.Image | None:
    """แปลง pixmap ของ PyMuPDF เป็นภาพ Pillow

    **แปลงผ่าน PNG ไม่ใช่อ่าน `pix.samples` ตรง ๆ** — วิธีอ่าน samples ต้องเดา mode
    กับ stride ให้ตรงกับที่ PyMuPDF วางไว้ ซึ่งไม่ตรงเสมอไป (ภาพ indexed, separation
    หรือที่ stride ไม่พอดี) แล้ว Pillow จะโยน "not enough image data" ทิ้งภาพไปเงียบ ๆ
    รอบแรกมีภาพในเอกสารหายไปด้วยวิธีนี้จริง `tobytes('png')` ให้ PyMuPDF จัดการเอง
    """
    try:
        # PNG เก็บได้แค่ RGB/เทา — ภาพ CMYK, separation หรือ stencil ต้องแปลงก่อน
        # ไม่งั้น tobytes('png') จะโยน exception แล้วภาพหายไปทั้งใบ
        if pix.colorspace is None or pix.colorspace.n != 3:
            pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
        if pix.alpha:
            # ทิ้งช่อง alpha — พื้นโปร่งของ PDF ควรกลายเป็นขาว ไม่ใช่ดำ
            pix = pymupdf.Pixmap(pix, 0)
        return Image.open(BytesIO(pix.tobytes('png'))).convert('RGB')
    except Exception:
        return None


def is_blank(image: Image.Image) -> bool:
    """ภาพพื้นเรียบสีเดียว — พื้นหลัง แถบสี หรือช่องว่างที่ถูกฝังมาเป็นรูป"""
    small = image.convert('L').resize((32, 32))
    values = list(small.getdata())
    return max(values) - min(values) < 18


# หมึกบางกว่านี้ถือว่าเป็นเส้น ไม่ใช่ก้อนทึบ — วัดจริงแล้วภาพถ่ายอยู่ที่ 0.05–0.20
# ส่วนตาราง กราฟ และภาพลายเส้นอยู่ที่ 0.33–0.60
LINE_ART_THINNESS = 0.27
INK_LEVEL = 205          # เข้มกว่านี้นับเป็นหมึกหรือตัววัตถุ
WHITE_LEVEL = 235        # สว่างกว่านี้นับเป็นพื้นขาว
GREY_CHROMA = 8.0        # ความอิ่มสีต่ำกว่านี้ถือว่าเป็นภาพขาวดำ
DRAWING_WHITE = 0.58     # ภาพแบบมีพื้นขาวอย่างน้อยเท่านี้ (วัดจริง: แบบ 0.60–0.97)
DRAWING_THINNESS_MIN = 0.12   # ต่ำกว่านี้เป็นก้อนทึบ เช่นตรารับรองหรือภาพถ่ายขาวดำ
MARK_MAX_SIDE = 420      # ตรารับรองในเอกสารไม่เคยใหญ่กว่านี้ ส่วนภาพแบบใหญ่กว่าเสมอ
MARK_MAX_THINNESS = 0.18 # หมึกหนากว่าเส้นของแบบ — ตรา CCC/CE วัดได้ 0.08–0.17
MARK_MIN_WHITE = 0.30    # ตราวางบนพื้นขาว ต่างจากภาพถ่ายสินค้าที่ถ่ายบนพื้นดำ
MARK_MAX_MIDTONE = 0.15  # ตราวัดได้ 0.03–0.05 ส่วนภาพถ่ายเทา ๆ วัดได้ 0.41
MIDTONE_RANGE = (45, 210)  # ช่วงน้ำหนักกลาง ไม่นับดำสนิทกับขาวสนิท
THINNESS_SIZE = 220      # ต้องใหญ่พอที่เส้นบาง ๆ จะไม่หายไปตอนย่อ
THINNESS_BLUR = 1.5      # เบลอเบา ๆ ก่อนวัด ดูเหตุผลใน looks_like_drawing


def looks_like_drawing(image: Image.Image) -> bool:
    """ภาพฝังที่จริง ๆ แล้วเป็นตาราง กราฟ หรือภาพลายเส้น ไม่ใช่ภาพถ่ายสินค้า

    **วัดที่ "หมึกเป็นเส้นบางหรือเป็นก้อนทึบ"** — ตาราง กราฟ และแบบบอกขนาด
    ประกอบด้วยเส้นบาง ๆ พิกเซลเข้มเกือบทุกจุดจึงมีพื้นสว่างติดอยู่ข้าง ๆ (ค่าเข้าใกล้ 1)
    ส่วนภาพถ่ายของวัตถุเป็นก้อนทึบ มีเพียงขอบเท่านั้นที่ติดพื้น (ค่าต่ำกว่า 0.2)
    **ต้องเบลอเบา ๆ ก่อนวัด** ไม่งั้นพื้นผิวที่มีรูพรุนถี่ ๆ จะถูกตัดสินผิด —
    ลำโพงฝังฝ้า DB20C เป็นภาพถ่ายแต่หน้ากากมีรูเป็นพันจุด แต่ละจุดล้อมด้วยสีขาว
    ค่าจึงพุ่งไปถึง 0.51 เท่ากับลายเส้น พอเบลอรัศมี 1.5 รูพรุนรวมเป็นก้อนเดียว
    ค่าลดเหลือ 0.20 ขณะที่เส้นของตารางยังบางอยู่ที่ 0.33 ขึ้นไป

    เกณฑ์ก่อนหน้านี้ดูที่ความอิ่มสี ปริมาณหมึก และความสม่ำเสมอของพื้นหลัง ซึ่ง
    **ตัดสินผิดทั้งสองทาง**: ตารางตั้งค่าเสียงของ dEV 20 มีหมึกเยอะเลยถูกนับเป็น
    ภาพถ่าย ส่วนกล่องรีเลย์ TAR 22 ซึ่งเป็นกล่องเทาเรียบบนพื้นขาวถูกนับเป็นลายเส้น
    ผลคือการ์ดและภาพแรกของหลายรุ่นขึ้นเป็นตารางแทนรูปสินค้า
    """
    thin, chroma, white = ink_profile(image)

    # **ภาพแบบของ MEDC บางใบหมึกไม่บางพอ** — แบบบอกขนาดที่มีเส้นบอกระยะถี่ ๆ
    # และตัวหนังสือเยอะ วัดความบางได้แค่ 0.18–0.26 ต่ำกว่าเกณฑ์ลายเส้น เลยถูก
    # ติดป้ายเป็นภาพถ่ายทั้งที่เป็นแบบชัด ๆ (LD15, SL15) สองสัญญาณนี้แยกได้ขาด
    # เพราะแบบเป็นขาวดำล้วนบนพื้นขาวเสมอ ส่วนภาพถ่ายสินค้าของ MEDC เป็นของสีแดง
    # สีส้ม หรือถ่ายบนพื้นดำ — ถ้าไม่มีสีเลยและพื้นขาวเกินครึ่ง แทบไม่มีทางเป็นภาพถ่าย
    if chroma <= GREY_CHROMA and white >= DRAWING_WHITE and thin >= DRAWING_THINNESS_MIN:
        return True
    return thin >= LINE_ART_THINNESS


def ink_profile(image: Image.Image):
    """คืน (ความบางของหมึก, ความอิ่มสีเฉลี่ย, สัดส่วนพื้นขาว) ของภาพหนึ่งใบ"""
    grey = image.convert('L')
    scale = THINNESS_SIZE / max(grey.size)
    if scale < 1:
        grey = grey.resize((max(round(grey.width * scale), 8),
                            max(round(grey.height * scale), 8)))

    grey = grey.filter(ImageFilter.GaussianBlur(THINNESS_BLUR))
    pixels = np.asarray(grey, dtype=np.uint8)
    ink = pixels < INK_LEVEL
    total = int(ink.sum())

    if total == 0:
        return 1.0, 0.0, 1.0

    # ขอบภาพนับเป็นพื้นสว่าง เพื่อไม่ให้วัตถุที่ชิดขอบถูกมองว่าเป็นก้อนทึบเกินจริง
    background = np.pad(~ink, 1, constant_values=True)
    touching = ink & (background[:-2, 1:-1] | background[2:, 1:-1]
                      | background[1:-1, :-2] | background[1:-1, 2:])

    small = np.asarray(image.convert('RGB').resize((120, 120)), dtype=np.int16)
    chroma = float((small.max(axis=2) - small.min(axis=2)).mean())
    white = float((np.asarray(grey.resize((120, 120)), dtype=np.uint8) >= WHITE_LEVEL).mean())
    return int(touching.sum()) / total, chroma, white


def midtone_share(image: Image.Image) -> float:
    """สัดส่วนพิกเซลที่เป็นน้ำหนักกลาง ไม่ใช่ดำสนิทหรือขาวสนิท"""
    grey = np.asarray(image.convert('L').resize((160, 160)), dtype=np.uint8)
    low, high = MIDTONE_RANGE
    return float(((grey >= low) & (grey <= high)).mean())


def is_certification_mark(image: Image.Image) -> bool:
    """ตรารับรอง (CCC, CE) ที่ผู้ผลิตวางไว้ในหน้าเอกสาร ไม่ใช่ภาพสินค้า

    ตัวนับ "ภาพซ้ำข้ามเอกสาร" จับไม่ได้ เพราะ Eaton ฝังตราใหม่ทุกฉบับ ค่า hash
    จึงไม่ตรงกันสักคู่ — วัดจริงแล้วไม่มีภาพใดใน MEDC ซ้ำเกินสองฉบับ

    ตราพวกนี้เป็นขาวดำเหมือนภาพแบบ แต่ต่างกันสามอย่าง: หมึกเป็นก้อนหนา
    ไม่ใช่เส้นบาง, พื้นขาวน้อยกว่าภาพแบบ, และตัวภาพเล็กเสมอ ส่วนภาพแบบที่
    ผู้ผลิตฝังมาเป็น raster ล้วนกว้างหรือสูงเกิน 450px ขึ้นไปทั้งนั้น

    **และต้องไม่มีน้ำหนักกลาง** — ตราเป็นดำสนิทบนขาวสนิท พิกเซลเทากลาง ๆ
    มีแค่ 3–5% (ขอบตัวอักษรเท่านั้น) ส่วนภาพถ่ายมีแสงเงาไล่น้ำหนักเต็มไปหมด
    ถ้าไม่คุมข้อนี้ รูปสินค้าสีเทาบนพื้นขาวที่ไม่มีสีสัน — TWIN EExII ของ FHF
    เป็นกล่องเทากับฝาครอบใส — จะเข้าเกณฑ์ "ขาวดำ + หมึกหนา + มีพื้นขาว" ครบทุกข้อ
    แล้วโดนคัดทิ้งทั้งที่เป็นรูปสินค้าเพียงใบเดียวของรุ่นนั้น
    """
    if max(image.size) > MARK_MAX_SIDE:
        return False
    if midtone_share(image) >= MARK_MAX_MIDTONE:
        return False
    thin, chroma, white = ink_profile(image)
    # **ต้องมีพื้นขาวด้วย** — ตราถูกวางบนพื้นขาวของหน้าเสมอ ถ้าไม่คุมข้อนี้ไว้
    # ภาพถ่ายลำโพงสีดำบนพื้นดำ (DB14, DB15) จะเข้าเกณฑ์ "ขาวดำ + หมึกหนา" ครบ
    # แล้วโดนคัดทิ้งทั้งที่เป็นภาพสินค้าเพียงใบเดียวของรุ่นนั้น
    return (chroma <= GREY_CHROMA and thin < MARK_MAX_THINNESS
            and white >= MARK_MIN_WHITE)


def usable_size(width: int, height: int) -> bool:
    """ภาพที่ใหญ่พอและรูปทรงสมเหตุสมผลพอที่จะเป็นภาพสินค้า

    **ไม่ใช้ "ด้านสั้นต้องเกิน 140px" แบบเดิม** เพราะสินค้าทรงสูงแคบตกเกณฑ์หมด —
    ภาพวิทยุมือถือ DP4801 กว้างแค่ 103px แต่สูง 302px เป็นภาพสินค้าเต็ม ๆ
    เกณฑ์จึงดูที่**พื้นที่รวม**แทน แล้วคุมด้านสั้นไว้แค่กันของจิ๋วจริง ๆ

    ที่ต้องเพิ่มคือ**กันตราสัญลักษณ์** — โลโก้ INTRON-X ในเอกสาร Industronic
    เป็นภาพ 154×154 ซึ่งผ่านเกณฑ์พื้นที่สบาย ๆ และมีหลายแบบจนตัวนับ "ซ้ำข้ามเอกสาร"
    จับไม่หมด ตราพวกนี้เป็นจัตุรัสและเล็กเสมอ ต่างจากภาพสินค้าจัตุรัสจริงซึ่งใหญ่กว่านี้
    """
    short = min(width, height)
    long = max(width, height)
    if short < MIN_IMAGE_SIDE or width * height < MIN_IMAGE_AREA:
        return False
    if long / short > MAX_ASPECT:
        return False
    return not (long < BADGE_MAX_SIDE and 0.85 <= width / height <= 1.18)


def is_margin_art(page_rect, box) -> bool:
    """ภาพที่เป็นส่วนประกอบของหน้า ไม่ใช่ภาพสินค้า

    สองแบบ:
    · **แถบหัว/ท้ายกระดาษ** — กว้างเกือบเต็มหน้าและแปะอยู่ริมบนหรือริมล่าง
      ตัวนับ "ภาพซ้ำข้ามเอกสาร" จับไม่หมด เพราะ Industronic ทำแถบหัวใหม่ต่อรุ่น
      (ชื่อรุ่นถูกวาดลงในแถบ) ภาพจึงต่างกันทุกไฟล์ทั้งที่ทำหน้าที่เดียวกัน
    · **ตราเล็ก ๆ ที่เชิงหน้า** — ตรารับรอง CCC/CE/ATEX ที่ Eaton วางไว้ท้ายหน้าแรก
      กว้างไม่ถึงหนึ่งในสามของหน้า ตัวกรอง is_certification_mark จับไม่ได้เมื่อมี
      ตราสองดวงวางชิดกันแล้วถูกต่อเป็นภาพเดียว เพราะช่องว่างระหว่างดวงทำให้
      ค่าความบางของหมึกสูงขึ้นจนหลุดเกณฑ์
    """
    wide = box.width >= page_rect.width * 0.85
    at_top = box.y1 <= page_rect.height * 0.22
    at_bottom = box.y0 >= page_rect.height * 0.80
    if wide and (at_top or at_bottom):
        return True
    return at_bottom and box.width <= page_rect.width * 0.30


def is_page_furniture(page, xref) -> bool:
    """เวอร์ชันที่รับ xref — ภาพหนึ่งวัตถุอาจถูกวางหลายที่ในหน้า"""
    try:
        rects = page.get_image_rects(xref)
    except Exception:
        return False
    return any(is_margin_art(page.rect, box) for box in rects)


def is_text_panel(page, xref) -> bool:
    """ภาพที่เป็น "แผงข้อความ" ไม่ใช่ภาพสินค้า

    Industronic วางตารางสเปกกับรายการคุณสมบัติเป็นภาพ แล้ววางข้อความจริงทับตำแหน่ง
    เดียวกัน ภาพพวกนี้ผ่านทุกเกณฑ์เรื่องขนาดและรูปทรง แต่เอาไปแสดงในแกลเลอรีสินค้า
    ไม่ได้เลย เพราะเป็นตัวหนังสือล้วน

    จับด้วยการนับว่ามีคำในเลเยอร์ข้อความของหน้ากี่คำที่ตกอยู่ในกรอบของภาพนั้น —
    ภาพถ่ายสินค้าและภาพแบบไม่มีข้อความของหน้าทับอยู่ ส่วนแผงข้อความมีเต็มไปหมด
    (ตัวเลขบอกขนาดในภาพแบบเป็นส่วนหนึ่งของภาพ ไม่ได้อยู่ในเลเยอร์ข้อความ)
    """
    try:
        rects = page.get_image_rects(xref)
    except Exception:
        return False
    if not rects:
        return False

    words = page.get_text('words')
    if not words:
        return False

    box = max(rects, key=lambda r: r.get_area())
    inside = 0
    for x0, y0, x1, y1, *_rest in words:
        if box.x0 <= (x0 + x1) / 2 <= box.x1 and box.y0 <= (y0 + y1) / 2 <= box.y1:
            inside += 1
    return inside >= TEXT_PANEL_WORDS and inside / len(words) >= TEXT_PANEL_SHARE


def raster_images(doc, hash_only=False, skip=None):
    """ภาพฝังทุกภาพในเอกสาร คืนเป็น (md5, ภาพ, ชนิด) เรียงตามหน้า

    กันซ้ำด้วย xref — โลโก้หัวกระดาษถูกอ้างซ้ำทุกหน้าแต่เป็นวัตถุเดียวใน PDF
    `hash_only=True` ใช้ตอนสำรวจว่าภาพไหนซ้ำข้ามเอกสาร จะไม่คืนตัวภาพกลับมา
    เพื่อไม่ให้กินหน่วยความจำ (ของ Industronic อย่างเดียวมีภาพผ่านเกณฑ์ราว 1,800 ใบ)
    `skip` คือ xref ที่ถูกดึงไปเป็นส่วนหนึ่งของแผงแบบแล้ว ไม่ต้องเก็บซ้ำ
    """
    seen = set(skip or ())
    out = []
    for page_index, page in enumerate(doc):
        for info in page.get_images(full=True):
            xref = info[0]
            if xref in seen:
                continue
            seen.add(xref)
            try:
                pix = pymupdf.Pixmap(doc, xref)
            except Exception:
                continue
            if not usable_size(pix.width, pix.height):
                pix = None
                continue
            if is_text_panel(page, xref) or is_page_furniture(page, xref):
                pix = None
                continue
            image = pixmap_to_pil(pix)
            pix = None
            if image is None:
                FAILED.append(xref)
                continue
            if is_blank(image) or is_certification_mark(image):
                continue
            digest = hashlib.md5(image.tobytes()).hexdigest()
            if hash_only:
                out.append((digest, None, 'photo', page_index))
            else:
                kind = 'drawing' if looks_like_drawing(image) else 'photo'
                out.append((digest, image, kind, page_index))
    return out


MOSAIC_GAP = 2.0         # ห่างกันไม่เกินนี้ถือว่าเป็นชิ้นส่วนของภาพเดียวกัน
MOSAIC_MIN_PIECES = 2    # ต้องมีอย่างน้อยสองชิ้นจึงเรียกว่าโมเสก
MOSAIC_EDGE_SHARE = 0.8  # ขอบที่ชนกันต้องยาวเท่านี้ของด้านนั้น จึงถือว่าเป็นชิ้นเดียวกัน


def mosaic_images(doc, skip=None):
    """ภาพที่ถูกหั่นเป็นชิ้น ๆ วางต่อกันในหน้า — ประกอบกลับด้วยการเรนเดอร์ทั้งผืน

    **ทำไมต้องมี** — โปรแกรมทำเอกสารของ Eaton หั่นภาพถ่ายสินค้าเป็นตาราง
    ชิ้นละ 135×145px แล้ววางต่อกัน 13 ชิ้น (LD15M, XB15M) ส่วนแบบบอกขนาด
    ถูกหั่นเป็นแถบยาว 800×40px เรียงซ้อนกัน 15 แถบ (CU1, DB7) ถ้าดึงทีละ xref
    จะได้เศษภาพที่ไม่มีความหมาย เช่น ตะแกรงระยะใกล้ ขอบสีแดง หรือหัวน็อต
    ซึ่งขึ้นไปอยู่ในแกลเลอรีสินค้าจริงมาแล้ว

    ชิ้นส่วนถูกจับกลุ่มด้วยการวางชิดกัน แล้วเรนเดอร์บริเวณนั้นจากหน้าเอกสารทีเดียว
    จึงได้ภาพเดิมกลับมาครบใบ ส่วนภาพที่วางเดี่ยว ๆ ปล่อยให้ raster_images
    ดึงจาก xref ตามเดิม เพราะได้ความละเอียดเต็มของต้นฉบับมากกว่าการเรนเดอร์
    """
    skip = set(skip or ())
    out = []
    consumed = set()
    for page_index, page in enumerate(doc):
        # หน้ากากโปร่งใสของแต่ละภาพ (SMask) เก็บเป็นวัตถุแยกใน PDF ต้องประกอบเอง
        masks = {info[0]: info[1] for info in page.get_images(full=True)}
        placements = []
        for info in page.get_image_info(xrefs=True):
            xref = info.get('xref')
            if xref in skip:
                continue
            rect = pymupdf.Rect(info['bbox']) & page.rect
            if rect.get_area() <= 0:
                continue
            placements.append((xref, rect))
        placements = [p for p in placements
                      if not is_overlay(doc, p, placements, masks)]
        if len(placements) < MOSAIC_MIN_PIECES:
            continue

        groups: list[list] = []   # [กรอบรวม, {xref}, จำนวนชิ้น, [กรอบของแต่ละชิ้น]]
        for xref, rect in placements:
            touching = [g for g in groups if any(pieces_join(rect, box) for box in g[3])]
            if touching:
                head = touching[0]
                for other in touching[1:]:
                    head[0] |= other[0]
                    head[1] |= other[1]
                    head[2] += other[2]
                    head[3] += other[3]
                    groups.remove(other)
                head[0] |= rect
                head[1].add(xref)
                head[2] += 1
                head[3].append(rect)
            else:
                groups.append([pymupdf.Rect(rect), {xref}, 1, [rect]])

        for rect, xrefs, pieces, _boxes in groups:
            if pieces < MOSAIC_MIN_PIECES:
                continue
            if is_margin_art(page.rect, rect):
                consumed |= xrefs
                continue
            # กลุ่มที่กินแผงข้อความข้าง ๆ เข้ามาด้วย ให้ปล่อยผ่าน — ปล่อยให้ raster_images
            # ดึงทีละใบแล้วคัดแผงข้อความออกเองตามเกณฑ์เดิม ดีกว่าได้ภาพสินค้าที่มี
            # กล่องคำโฆษณาแปะอยู่ครึ่งใบ
            words = page.get_text('words', clip=rect)
            page_words = len(page.get_text('words'))
            if (len(words) >= TEXT_PANEL_WORDS and page_words
                    and len(words) / page_words >= TEXT_PANEL_SHARE):
                continue
            pieces = [p for p in placements if rect.contains(p[1])]
            image = paste_pieces(doc, rect, pieces, masks)
            if image is None:
                pix = page.get_pixmap(clip=rect, matrix=pymupdf.Matrix(3, 3), alpha=False)
                image = pixmap_to_pil(pix)
                pix = None
            if image is None or is_blank(image) or is_certification_mark(image):
                consumed |= xrefs
                continue
            if not usable_size(image.width, image.height):
                consumed |= xrefs
                continue
            kind = 'drawing' if looks_like_drawing(image) else 'photo'
            out.append((hashlib.md5(image.tobytes()).hexdigest(), image, kind, page_index))
            consumed |= xrefs
    return out, consumed


def piece_image(doc, xref, smask) -> Image.Image | None:
    """ภาพฝังหนึ่งชิ้นพร้อมหน้ากากโปร่งใสของมัน วางบนพื้นขาว

    `pymupdf.Pixmap(doc, xref)` คืนมาแต่ภาพฐาน ส่วนที่ควรโปร่งจะเป็นสีดำสนิท
    ภาพสินค้าของ MEDC ที่ไดคัตมาแล้ว (SM87SL) จึงกลายเป็นกล่องดำทั้งใบ
    ต้องรวมกับ SMask ซึ่งเก็บเป็นวัตถุแยกใน PDF ก่อนถึงจะได้ภาพที่ถูกต้อง
    """
    try:
        pix = pymupdf.Pixmap(doc, xref)
        if smask:
            pix = pymupdf.Pixmap(pix, pymupdf.Pixmap(doc, smask))
    except Exception:
        return None
    if not pix.alpha:
        return pixmap_to_pil(pix)
    try:
        if pix.colorspace is None or pix.colorspace.n != 3:
            pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
        cutout = Image.open(BytesIO(pix.tobytes('png'))).convert('RGBA')
    except Exception:
        return None
    flat = Image.new('RGB', cutout.size, (255, 255, 255))
    flat.paste(cutout, (0, 0), cutout.split()[3])
    return flat


def is_overlay(doc, placement, placements, masks) -> bool:
    """ชิ้นนี้เป็นแผ่นสีทึบที่วางทับอยู่บนภาพอื่น ไม่ใช่ส่วนหนึ่งของภาพ

    เอกสาร TAR 22 ของ FHF วางแถบสีฟ้าทึบสองแถบไว้บนรูปสินค้า พอรวมชิ้นส่วน
    กลับเป็นผืนเดียวแถบพวกนี้จึงติดมาแปะอยู่บนรูปด้วย

    ต่างจากชิ้นส่วนที่ถูกหั่นตรงที่ **อยู่ในกรอบของชิ้นอื่นทั้งใบ** — ชิ้นที่ถูกหั่น
    วางต่อกันไม่ทับกัน จึงไม่เข้าเงื่อนไขนี้ และต้องเป็นสีทึบล้วนด้วย
    เพื่อไม่ให้ภาพซ้อนที่มีเนื้อหาจริงถูกทิ้งไปด้วย
    """
    xref, rect = placement
    inside = any(other is not placement and other[1].contains(rect)
                 and other[1].get_area() > rect.get_area() * 1.5
                 for other in placements)
    if not inside or not xref:
        return False
    image = piece_image(doc, xref, masks.get(xref, 0))
    return image is not None and is_blank(image)


def pieces_join(a, b) -> bool:
    """สองชิ้นนี้เป็นส่วนของภาพเดียวกันไหม

    **แค่ "วางชิดกัน" ไม่พอ** — เอกสาร FHF ของ EL 101 D วางกล่องคำโฆษณากับ
    ภาพถ่ายไว้ติดกันพอดี ถ้ารวมสองใบนี้เข้าด้วยกันจะได้การ์ดสินค้าที่เป็นกล่อง
    ข้อความครึ่งใบ ส่วนภาพที่ถูกหั่นจริง ๆ จะต่อกันเป็นตาราง ขอบที่ชนกันจึงยาว
    เกือบเท่ากันทั้งสองฝั่ง

    เงื่อนไขที่ยอมให้รวม:
    · ซ้อนทับกันมาก — ภาพเต็มใบที่วางคร่อมตารางชิ้นย่อยของตัวเอง
    · หรือชนขอบกันโดยขอบที่ชนยาวเกือบเท่าด้านนั้นของทั้งคู่ (ตารางหรือแถบ)
    """
    overlap = a & b
    if overlap.get_area() > 0:
        return overlap.get_area() >= min(a.get_area(), b.get_area()) * 0.3

    shared_x = min(a.x1, b.x1) - max(a.x0, b.x0)
    shared_y = min(a.y1, b.y1) - max(a.y0, b.y0)
    gap_x = max(a.x0, b.x0) - min(a.x1, b.x1)
    gap_y = max(a.y0, b.y0) - min(a.y1, b.y1)
    if shared_x > 0 and gap_y <= MOSAIC_GAP:      # ต่อกันบน-ล่าง
        return shared_x >= max(a.width, b.width) * MOSAIC_EDGE_SHARE
    if shared_y > 0 and gap_x <= MOSAIC_GAP:      # ต่อกันซ้าย-ขวา
        return shared_y >= max(a.height, b.height) * MOSAIC_EDGE_SHARE
    return False


def paste_pieces(doc, rect, placements, masks) -> Image.Image | None:
    """ต่อชิ้นส่วนภาพกลับเป็นผืนเดียว ตามตำแหน่งที่วางไว้ในหน้า

    **ไม่เรนเดอร์จากหน้าเอกสาร** เพราะตัวหนังสือของหน้าที่วางทับบริเวณนั้น
    (คำโปรยใต้ชื่อรุ่น เลขหน้า) จะติดลงมาในภาพสินค้าด้วย การต่อจากชิ้นส่วนจริง
    ยังได้ความละเอียดเต็มของต้นฉบับ ไม่ใช่ภาพที่แรสเตอร์ซ้ำอีกรอบ
    """
    scale = 3
    canvas = Image.new('RGB', (max(round(rect.width * scale), 1),
                               max(round(rect.height * scale), 1)), (255, 255, 255))
    pasted = 0
    for xref, box in placements:
        piece = piece_image(doc, xref, masks.get(xref, 0)) if xref else None
        if piece is None:
            continue
        width = max(round(box.width * scale), 1)
        height = max(round(box.height * scale), 1)
        canvas.paste(piece.resize((width, height), Image.LANCZOS),
                     (round((box.x0 - rect.x0) * scale), round((box.y0 - rect.y0) * scale)))
        pasted += 1
    # **ต้องต่อได้ครบทุกชิ้นเท่านั้น** ชิ้นที่แตกไปจะเหลือเป็นช่องขาวกลางภาพ
    # ซึ่งดูเหมือนภาพเสีย ถ้าไม่ครบให้ผู้เรียกไปเรนเดอร์จากหน้าเอกสารแทน
    return canvas if pasted == len(placements) else None


FEATURE_BRANDS = {'fhf', 'medc'}   # ดึงคุณสมบัติจากเอกสารของสองแบรนด์นี้
# หัวข้อที่ผู้ผลิตใช้กำกับรายการคุณสมบัติ (เอกสารบางฉบับเป็นภาษาเยอรมัน)
FEATURE_HEADINGS = ('features', 'characteristics', 'merkmale', 'eigenschaften')
# ฟอนต์สัญลักษณ์ที่ใช้แทนจุดนำหน้าในเอกสารรุ่นเก่า
DINGBAT_FONTS = ('dingbat', 'wingding', 'zapf', 'symbol', 'commercialpi')
# จุดนำหน้าที่พบในเอกสารจริง — MEDC รุ่นเก่าใช้อักขระควบคุม STX เป็นจุด
BULLET_CHARS = ('\u2022', '\x02')
# ตัวอักษรควบ (ligature) ที่ PyMuPDF คืนมาเป็นอักขระเดียว ต้องแตกกลับเป็นตัวอักษรปกติ
LIGATURES = {'\ufb00': 'ff', '\ufb01': 'fi', '\ufb02': 'fl', '\ufb03': 'ffi', '\ufb04': 'ffl'}
SUBLINE_INDENT = 6        # เว้นวรรคนำหน้าเกินนี้คือรายการย่อย ไม่ใช่ประโยคที่ตัดคำ
FEATURE_LINE_GAP = 6      # บรรทัดที่ล้นมาจากข้อก่อนหน้าอยู่ชิดกันขนาดนี้
FEATURE_INDENT = 20       # เยื้องเกินนี้ถือว่าเป็นค่าคนละบรรทัด ไม่ใช่ประโยคที่ตัดคำ


def clean_feature(text: str, joiner: str = ' ') -> str:
    """รวมข้อความหลายบรรทัดของคุณสมบัติหนึ่งข้อให้เป็นบรรทัดเดียว"""
    for ligature, plain in LIGATURES.items():
        text = text.replace(ligature, plain)
    text = (text.replace('\u0007', ' ').replace('\xa0', ' ')
                .replace('\u2028', ' ').replace('\t', ' '))
    for bullet in BULLET_CHARS:
        text = text.lstrip(bullet)
    text = text.lstrip(' ')
    text = re.sub(r'\s*\n\s*', joiner, text)
    text = re.sub(r'\s{2,}', ' ', text)
    # **จุดที่ลอยอยู่กลางประโยค** — เอกสาร MEDC ขึ้นบรรทัดใหม่ด้วยจุดนำ
    # ("Groups A, B, . C & D") ตัดออกได้เพราะจุดที่มีเว้นวรรคขนาบสองข้าง
    # ไม่ใช่จุดย่อคำ (จุดใน "Div. 2" ติดตัวอักษรด้านหน้าเสมอ)
    text = re.sub(r'\s\.\s', ' ', text)
    # ตัวอักษรควบที่ถูกแยกออกมาพร้อมเว้นวรรค ("Certifi ed", "fl ash")
    text = re.sub(r'(?<=[A-Za-z])(ffi|ffl|fi|fl|ff) (?=[a-z])', r'\1', text)
    text = re.sub(r'\b(ffi|ffl|fi|fl|ff) (?=[a-z])', r'\1', text)
    text = re.sub(r'\s{2,}', ' ', text)
    # **ตัดขีดนำหน้าเฉพาะที่เป็นจุดนำรายการ** — ขีดที่ติดตัวเลขคือเครื่องหมายลบ
    # ของอุณหภูมิ ("–55ºC") ถ้าตัดทิ้งด้วยจะกลายเป็นค่าที่ผิดจากเอกสาร
    text = re.sub(r'^[–-]\s+', '', text.lstrip(' '))
    return re.sub(r'\s*[/·]?\s*$', '', text.rstrip(' .;·')).strip()

def features_from_heading(page):
    """รายการคุณสมบัติที่อยู่ใต้หัวข้อ Features — รูปแบบเอกสารปัจจุบันของ FHF

    แต่ละข้อเป็น text block ของตัวเองที่ขึ้นต้นด้วย "•" ส่วนบรรทัดที่ยาวเกิน
    จะกลายเป็น block แยกที่ไม่มีจุดนำหน้า ต้องต่อกลับเข้ากับข้อก่อนหน้า
    ไม่งั้นรายการจะขาดกลางคัน — เอกสาร MHG 11, DEV 20 และ TWIN EExII
    เคยได้ไม่ครบเพราะเหตุนี้

    บรรทัดที่ต่อมาแบบ**เยื้องเข้าไป**คือค่าอีกค่าหนึ่งในคอลัมน์เดียวกัน
    (เช่นรหัสการป้องกันการระเบิดหลายบรรทัด) จึงคั่นด้วย " / " ไม่ใช่เว้นวรรค
    """
    blocks = page.get_text('blocks')
    dingbats = dingbat_block_starts(page)
    start = None
    for index, block in enumerate(blocks):
        if block[4].strip().lower().rstrip(':') in FEATURE_HEADINGS:
            start = index
            break
    if start is None:
        return None

    items: list[str] = []
    span = None      # (ซ้ายสุด, ขวาสุด, ล่างสุด) ของข้อที่กำลังต่ออยู่
    for block in blocks[start + 1:]:
        x0, y0, x1, y1, text = block[0], block[1], block[2], block[3], block[4]
        if not text.strip():
            continue
        if text.lstrip().startswith(BULLET_CHARS) or (round(x0), round(y0)) in dingbats:
            items.append(clean_feature(strip_dingbat(text)))
            span = (x0, x1, y1)
            continue
        if span and span[0] - 4 <= x0 <= span[1] and -1 <= y0 - span[2] <= FEATURE_LINE_GAP:
            # **บรรทัดที่ย่อหน้าลึกคือรายการย่อย ไม่ใช่ประโยคที่ตัดคำ** — เอกสาร MEDC
            # ไล่เงื่อนไขการรับรองเป็นบรรทัดย่อยใต้หัวข้อเดียวกัน ถ้าต่อด้วยเว้นวรรค
            # จะกลายเป็นประโยคยาวรวดที่อ่านไม่ออกว่าแยกเป็นข้อ ๆ
            leading = len(text) - len(text.lstrip(' '))
            if leading >= SUBLINE_INDENT:
                joiner = ' · '
            elif x0 - span[0] > FEATURE_INDENT:
                joiner = ' / '
            else:
                joiner = ' '
            items[-1] = (items[-1] + joiner + clean_feature(text, joiner)).strip()
            items[-1] = re.sub(r'\s*[/·]\s*$', '', items[-1])
            span = (span[0], max(span[1], x1), y1)
            continue
        break
    return items


def strip_dingbat(text: str) -> str:
    """ตัดอักขระจุดนำหน้าที่มาจากฟอนต์สัญลักษณ์ออก

    ฟอนต์พวกนี้แมปจุดไว้กับรหัสตัวอักษรธรรมดา อ่านออกมาเป็น "4" หรือ "3"
    ถ้าไม่ตัดออกจะกลายเป็นตัวเลขนำหน้าคุณสมบัติทุกข้อ
    """
    stripped = text.lstrip()
    if stripped[:1].isalnum() and stripped[1:2] in (' ', '\t'):
        return stripped[2:]
    return text


def dingbat_block_starts(page):
    """ตำแหน่งมุมบนซ้ายของ block ที่ขึ้นต้นด้วยอักขระจากฟอนต์สัญลักษณ์

    ใช้จับคู่กับผลของ get_text('blocks') ซึ่งไม่มีข้อมูลฟอนต์ติดมาด้วย
    """
    starts = set()
    for block in page.get_text('dict')['blocks']:
        lines = block.get('lines')
        if not lines or not lines[0]['spans']:
            continue
        font = lines[0]['spans'][0]['font'].lower()
        if any(key in font for key in DINGBAT_FONTS):
            starts.add((round(block['bbox'][0]), round(block['bbox'][1])))
    return starts


def features_from_dingbats(page):
    """รายการคุณสมบัติของเอกสารรุ่นเก่าที่ใช้ฟอนต์สัญลักษณ์แทนจุดนำหน้า

    EL 101 D ไม่มีหัวข้อ Features เลย มีแต่รายการสองข้อที่ขึ้นต้นด้วยอักขระ
    จากฟอนต์ FFDingbats ซึ่งอ่านออกมาเป็นเลข "3" ถ้าดูแต่ตัวอักษรจะแยกไม่ออก
    ว่าเป็นจุดนำหน้า ต้องดูที่ชื่อฟอนต์ของ span แรกของบรรทัด
    """
    for block in page.get_text('dict')['blocks']:
        lines = block.get('lines')
        if not lines:
            continue
        items: list[str] = []
        for line in lines:
            spans = line['spans']
            if not spans:
                continue
            body = ''.join(span['text'] for span in spans[1:])
            if any(k in spans[0]['font'].lower() for k in DINGBAT_FONTS) and body.strip():
                items.append(body)
            elif items:
                items[-1] += ' ' + ''.join(span['text'] for span in spans)
        items = [x for x in (clean_feature(i) for i in items) if x]
        if len(items) >= 2:
            return items
    return []


def product_features(doc) -> list[str]:
    """คุณสมบัติสินค้าตามที่ผู้ผลิตเขียนไว้ในเอกสาร — ไม่เขียนขึ้นเอง"""
    for page in doc:
        items = features_from_heading(page)
        if items:
            return items
    for page in doc:
        items = features_from_dingbats(page)
        if items:
            return items
    return []


MANUAL_HEADING = re.compile(
    r'^(technical|instruction|installation|operating|user|service)\s+manual', re.I)


def is_manual(doc) -> bool:
    """เอกสารเล่มนี้เป็นคู่มือ ไม่ใช่ดาต้าชีตสินค้า

    คู่มือติดตั้ง/ซ่อมบำรุงประกาศตัวเองไว้บรรทัดแรกของหน้าแรกเสมอ
    ("Technical manual", "Instruction manual") ต่างจากดาต้าชีตที่ขึ้นต้นด้วยชื่อรุ่น

    ต้องคัดออกจาก**หน้าสินค้า** เพราะไม่ใช่ของที่ขาย — เล่มที่เจอคือคู่มือ 32 หน้า
    ของ XB15/XB15M ซึ่งตัวสินค้าทั้งสองรุ่นมีรายการของตัวเองอยู่แล้ว การปล่อยไว้
    ทำให้ได้การ์ดที่ชื่อเป็นสตริงจากชื่อไฟล์และรูปเป็นภาพลายเส้นจากหน้าปก
    **ยังอยู่ในคลังเอกสารตามเดิม** เพราะเป็นไฟล์ที่ IDIE ส่งให้ลูกค้าได้จริง
    """
    lines = [line.strip() for line in doc[0].get_text().splitlines() if line.strip()]
    return bool(lines) and bool(MANUAL_HEADING.match(lines[0]))


def merge_rects(rects, gap=14):
    """รวมกรอบที่อยู่ชิดกันเป็นก้อนเดียว — ภาพแบบหนึ่งภาพประกอบด้วยเส้นหลายร้อยเส้น"""
    boxes = [pymupdf.Rect(r) for r in rects]
    changed = True
    while changed:
        changed = False
        out = []
        while boxes:
            current = boxes.pop()
            merged = True
            while merged:
                merged = False
                rest = []
                for box in boxes:
                    grown = pymupdf.Rect(current)
                    grown.x0 -= gap
                    grown.y0 -= gap
                    grown.x1 += gap
                    grown.y1 += gap
                    if grown.intersects(box):
                        current = current | box
                        merged = True
                        changed = True
                    else:
                        rest.append(box)
                boxes = rest
            out.append(current)
        boxes = out
    return boxes


GA_CAPTION = 'General arrangement drawing'
# ฟอนต์ที่มากับไฟล์ CAD — ตัวเลขบอกระยะและป้ายชี้ในแบบใช้ฟอนต์กลุ่มนี้เท่านั้น
CAD_FONTS = ('centurygothic', 'arial', 'helvetica', 'commercialpi', 'courier', 'isocp', 'romans')
# คำบรรยายย่อยที่วางอยู่ในแผงแบบเอง ("Exd version", "Break glass", "15W version")
INPANEL_FONTS = ('eaton-regular', 'eaton-medium')
INPANEL_MAX_SIZE = 9.5   # ใหญ่กว่านี้เป็นหัวเรื่องของหน้า ไม่ใช่คำบรรยายในแผง
GA_MIN_BAND = 60         # แผงที่เตี้ยกว่านี้แปลว่าตัดผิด ไม่เอาดีกว่าได้ภาพเสี้ยว
GA_MIN_VECTOR = 4        # เส้นน้อยกว่านี้แปลว่าแผงเป็นภาพฝัง ปล่อยให้ raster_images จัดการ
CALLOUT_MAX_CHARS = 3    # ข้อความสั้นเท่านี้ในแผงคือเลขชี้ตำแหน่ง ไม่ใช่หัวข้อถัดไป
GA_IMAGE_BLEED = 24      # แถบภาพของแบบเริ่มเยื้องซ้ายออกนอกคอลัมน์ได้เท่านี้


def ga_panel_bottom(page, caption, left: float, right: float) -> float:
    """ขอบล่างของแผงแบบ = ข้อความชิ้นแรกที่เป็น "เนื้อความของเอกสาร" ใต้คำบรรยาย

    แผงแบบไม่มีเส้นกรอบล้อมไว้ และความสูงไม่คงที่ บางฉบับตามด้วยตารางสเปก
    บางฉบับตามด้วยช่องกรอกรหัสสั่งซื้อ จะใช้ระยะตายตัวไม่ได้

    สิ่งที่คงที่คือ**ฟอนต์** — ทุกอย่างในแบบมาจากไฟล์ CAD จึงเป็น Arial หรือ
    Century Gothic ขนาด 3–5pt ส่วนเนื้อความของเอกสารใช้ฟอนต์ประจำแบรนด์
    (Univers, Eaton) ข้อความแรกที่ใช้ฟอนต์แบรนด์จึงเป็นจุดจบของแผงพอดี

    **ยกเว้นคำบรรยายย่อยในแผง** เช่น "Exd version" หรือ "Break glass" ที่ Eaton
    พิมพ์กำกับไว้เหนือแต่ละมุมมอง ใช้ Eaton-Regular ขนาด 7–8pt ถ้าไม่ยกเว้นไว้
    แผงจะถูกตัดตั้งแต่บรรทัดแรกจนเหลือแค่เส้นเดียว ขนาดที่ใหญ่กว่านั้นเป็น
    หัวเรื่องของหน้า (12pt ขึ้นไป) ซึ่งต้องตัด

    **และยกเว้นเลขชี้ตำแหน่ง** — แบบของ SL15 มีเลข 1–6 ชี้ช่องไฟแต่ละดวง
    เรียงพิมพ์ด้วยฟอนต์เนื้อความขนาด 12pt ซึ่งเข้าเกณฑ์ "จบแผง" ทุกข้อ
    ทั้งที่เป็นส่วนหนึ่งของแบบ ข้อความสั้นระดับนี้ไม่เคยเป็นหัวเรื่องของหัวข้อ
    """
    bottom = page.rect.height - 16
    for block in page.get_text('dict')['blocks']:
        for line in block.get('lines', []):
            for span in line['spans']:
                x0, y0, x1, _y1 = span['bbox']
                if y0 < caption.y1 + 6 or not span['text'].strip():
                    continue
                if x1 < left + 2 or x0 > right - 2:
                    continue
                if len(span['text'].strip()) <= CALLOUT_MAX_CHARS:
                    continue    # เลขชี้ตำแหน่งในแบบ ("1", "2", "Ø8") ไม่ใช่เนื้อความ
                font = span['font'].lower()
                if font.startswith(CAD_FONTS):
                    continue
                if font.startswith(INPANEL_FONTS) and span['size'] <= INPANEL_MAX_SIZE:
                    continue
                bottom = min(bottom, y0 - 4)
    return bottom


def ga_panels(doc):
    """แผง "General arrangement drawing" ของ MEDC — แบบบอกขนาดทุกมุมมองในภาพเดียว

    **ทำไมต้องมีทางแยกจาก vector_figures** — แบบของ MEDC หนึ่งชุดมีหลายมุมมอง
    (หน้าตรง ด้านข้าง หน้าแปลน) วางเรียงกันในแผงเดียว การจับก้อนเส้นแบบทั่วไป
    ให้ผลผิดสองทางพร้อมกัน: ถ้ารวมก้อนหลวมจะกลืนตารางสเปกที่อยู่ข้าง ๆ เข้ามาด้วย
    แล้วถูกตัดทิ้งทั้งแผง ถ้ารวมก้อนแน่นจะได้มุมมองละก้อนซึ่งเล็กกว่าเกณฑ์ทุกก้อน
    ผลคือสินค้า 23 รุ่นไม่มีภาพแบบเลยทั้งที่เอกสารมีครบ

    ที่นี่ใช้คำบรรยายของแผงเป็นหลักยึดแทน แล้วกวาดเส้นทั้งหมดในคอลัมน์นั้น
    จึงได้แบบครบทุกมุมมองในภาพเดียว ตรงกับที่พิมพ์อยู่ในเอกสาร

    **แผงที่เป็นภาพฝังก็ต้องเรนเดอร์ที่นี่เหมือนกัน** — เอกสารหลายฉบับ (CU1, DB7,
    SM87HXB) ฝังแบบมาเป็น "แถบ" กว้าง 800px สูง 40px เรียงซ้อนกันสิบกว่าใบ
    ทีละแถบไม่มีความหมายและตกเกณฑ์สัดส่วนภาพทุกใบ พอเรนเดอร์ทั้งแผงจึงได้แบบ
    กลับมาครบใบเดียวตามที่พิมพ์อยู่จริง

    คืน (ภาพที่ได้, เลขหน้าที่ใช้, xref ของภาพฝังที่ถูกกินเข้าไปในแผงแล้ว) —
    ผู้เรียกต้องข้ามทั้งหน้านั้นตอนกวาดก้อนเส้น และข้าม xref เหล่านั้นตอนดึงภาพฝัง
    ไม่งั้นจะได้ของเดิมซ้ำอีกใบ
    """
    figures = []
    pages_used = set()
    consumed = set()
    for page_index, page in enumerate(doc):
        hits = page.search_for(GA_CAPTION)
        if not hits:
            continue
        caption = hits[0]
        left, right = caption.x0 - 16, page.rect.width - 8
        band = pymupdf.Rect(left, caption.y1 + 2, right,
                            ga_panel_bottom(page, caption, left, right))
        if band.is_empty or band.height < GA_MIN_BAND:
            continue

        box = None
        strokes = 0
        for drawing in page.get_drawings():
            rect = pymupdf.Rect(drawing['rect'])
            if rect.get_area() <= 0 or not band.contains(rect):
                continue
            if rect.get_area() > band.get_area() * 0.85:
                continue  # กรอบพื้นหลังของแผง ไม่ใช่เส้นของแบบ
            strokes += 1
            box = rect if box is None else (box | rect)

        embedded = []
        for info in page.get_image_info(xrefs=True):
            rect = pymupdf.Rect(info['bbox']) & page.rect
            if rect.get_area() <= 0:
                continue
            # **เทียบแบบเผื่อขอบ ไม่ใช่ "อยู่ในกรอบพอดี"** — แถบภาพของแบบใน CU1
            # และ SM87HXB ถูกวางล้นออกไปนอกหน้ากระดาษทางขวา และเริ่มเยื้องซ้าย
            # กว่าขอบคอลัมน์ไปเล็กน้อย ถ้าใช้ contains จะไม่เข้าเงื่อนไขสักแถบเดียว
            if rect.y0 < band.y0 - 2 or rect.y1 > band.y1 + 2:
                continue
            if rect.x1 < band.x0 + 10 or rect.x0 < band.x0 - GA_IMAGE_BLEED:
                continue
            embedded.append((info.get('xref'), rect))
            box = rect if box is None else (box | rect)
        if strokes < GA_MIN_VECTOR and not embedded:
            continue

        # ตัวเลขบอกระยะอยู่นอกสุดของแบบเสมอ ถ้าไม่รวมเข้ามาจะโดนตัดหาย
        for word in page.get_text('words', clip=band):
            rect = pymupdf.Rect(word[:4])
            if band.contains(rect):
                box = box | rect
        if box.width < 60 or box.height < 60:
            continue

        padded = pymupdf.Rect(box.x0 - 6, box.y0 - 6, box.x1 + 6, box.y1 + 6) & page.rect
        pix = page.get_pixmap(clip=padded, matrix=pymupdf.Matrix(3, 3), alpha=False)
        image = pixmap_to_pil(pix)
        pix = None
        if image is None or is_blank(image):
            continue
        figures.append((hashlib.md5(image.tobytes()).hexdigest(), image, page_index))
        pages_used.add(page_index)
        consumed.update(xref for xref, _rect in embedded if xref)
    return figures, pages_used, consumed


def vector_figures(doc):
    """ภาพแบบที่วาดด้วยเส้น vector — ของ MEDC เกือบทั้งหมดเป็นแบบนี้

    เผื่อขอบไว้ 8pt เพื่อไม่ให้ตัวเลขบอกระยะที่อยู่นอกสุดโดนตัดหาย

    **ตารางก็เป็นเส้นเหมือนกัน** จึงคัดออกด้วยความหนาแน่นของคำ — ตารางสเปกมีคำ
    อัดแน่นเต็มกรอบ ส่วนภาพแบบมีแค่ตัวเลขบอกระยะไม่กี่ตัว
    """
    figures = []
    for page_index, page in enumerate(doc):
        page_area = page.rect.get_area()
        page_words = len(page.get_text('words'))
        rects = []
        for drawing in page.get_drawings():
            rect = pymupdf.Rect(drawing['rect'])
            area = rect.get_area()
            if area <= 0 or area > page_area * 0.5:
                continue
            if rect.width < 3 and rect.height < 3:
                continue
            rects.append(rect)
        if not rects:
            continue

        for cluster in merge_rects(rects):
            if cluster.width < 110 or cluster.height < 110:
                continue
            words = page.get_text('words', clip=cluster)
            if len(words) / max(cluster.get_area() / 10000, 1) > 12:
                continue  # ตาราง ไม่ใช่ภาพแบบ
            # แผงข้อความ (รายการคุณสมบัติ ตารางสเปก) กินข้อความของหน้าไปเกือบทั้งหมด
            # ส่วนภาพแบบมีแค่ตัวเลขบอกระยะไม่กี่ตัวเทียบกับข้อความทั้งหน้า
            if page_words and len(words) / page_words > 0.35:
                continue
            padded = pymupdf.Rect(cluster)
            padded.x0 -= 8
            padded.y0 -= 8
            padded.x1 += 8
            padded.y1 += 8
            padded = padded & page.rect
            pix = page.get_pixmap(clip=padded, matrix=pymupdf.Matrix(3, 3), alpha=False)
            image = pixmap_to_pil(pix)
            pix = None
            if image is None or is_blank(image):
                continue
            figures.append((hashlib.md5(image.tobytes()).hexdigest(), image, page_index))
    return figures


def save_web(image: Image.Image, path: str, width: int, quality: int):
    """ย่อให้กว้างไม่เกินที่กำหนดแล้วบันทึกเป็น WebP — ห้ามขยายเกินต้นฉบับ"""
    if image.width > width:
        height = max(round(image.height * width / image.width), 1)
        image = image.resize((width, height), Image.LANCZOS)
    image.save(path, 'WEBP', quality=quality, method=6)
    return image.size


# --------------------------------------------------------------------------- #
# main                                                                         #
# --------------------------------------------------------------------------- #
def build():
    sheets = read_datasheets()
    if len(sheets) < 50:
        sys.exit('อ่าน datasheets.generated.ts ได้แค่ %d รายการ — รูปแบบไฟล์เปลี่ยนไปหรือเปล่า'
                 % len(sheets))

    # **ไม่ทำ Industronic ที่นี่** — ภาพสินค้าของแบรนด์นั้นดึงจากเว็บผู้ผลิตแทน
    # ด้วย scripts/scrape-industronic.py เพราะเอกสาร PDF ให้ภาพไม่ครบ หลายรุ่น
    # มีแต่ภาพแบบหรือ block diagram (ดู docstring ของสคริปต์นั้น)
    # ส่วนหน้าคลังเอกสารยังมีดาต้าชีต Industronic ครบ 169 ฉบับเหมือนเดิม
    SKIP_BRANDS = {'industronic'}

    by_brand = {}
    for sheet in sheets:
        if sheet['brandId'] in SKIP_BRANDS:
            continue
        by_brand.setdefault(sheet['brandId'], []).append(sheet)

    products = []
    manuals = []
    for brand, items in by_brand.items():
        catalog_dir = os.path.join(CATALOG_OUT, brand)
        shutil.rmtree(catalog_dir, ignore_errors=True)
        os.makedirs(catalog_dir, exist_ok=True)

        # ---- รอบที่ 1: หาว่าภาพไหนเป็นสื่อประจำแบรนด์ ไม่ใช่ภาพสินค้า ----
        # โลโก้หัวกระดาษ ตรา ATEX/IECEx และแถบท้ายเล่มเหมือนกันทุกฉบับ ถ้าไม่คัดออก
        # สินค้าทุกตัวจะมีภาพเดียวกันสิบใบ นับที่ "จำนวนเอกสารที่พบ" ไม่ใช่จำนวนครั้ง
        # เพราะภาพจริงของสินค้าซ้ำได้ในเอกสารเดียว (ภาพเดียวกันคนละหน้า)
        #
        # รอบนี้ดูเฉพาะภาพฝัง ไม่แตะภาพแบบ vector เพราะสื่อประจำแบรนด์เป็นภาพฝัง
        # ทั้งหมด ส่วนภาพแบบเป็นของเฉพาะรุ่นอยู่แล้ว การเรนเดอร์ vector สองรอบ
        # จะเพิ่มเวลาอีกเท่าตัวโดยไม่ได้อะไรกลับมา
        census = Counter()
        for sheet in items:
            path = os.path.join(REPO, 'public', sheet['pdfUrl'].lstrip('/').replace('/', os.sep))
            doc = pymupdf.open(path)
            for digest, _image, _kind, _page in raster_images(doc, hash_only=True):
                census[digest] += 1
            doc.close()
        boilerplate = {d for d, n in census.items() if n >= BOILERPLATE_DOCS}

        # ---- รอบที่ 2: ดึงภาพจริงและบันทึก ----
        for sheet in items:
            path = os.path.join(REPO, 'public', sheet['pdfUrl'].lstrip('/').replace('/', os.sep))
            doc = pymupdf.open(path)
            if is_manual(doc):
                doc.close()
                manuals.append(sheet['id'])
                continue
            panels, panel_pages, panel_xrefs = ga_panels(doc)
            mosaics, mosaic_xrefs = mosaic_images(doc, skip=panel_xrefs)
            rasters = [x for x in raster_images(doc, skip=panel_xrefs | mosaic_xrefs)
                       if x[0] not in boilerplate]
            rasters += [x for x in mosaics if x[0] not in boilerplate]
            vectors = [(d, im, 'drawing', pg)
                       for d, im, pg in panels if d not in boilerplate]
            # หน้าที่ดึงแผงแบบไปแล้ว ไม่ต้องกวาดก้อนเส้นซ้ำ ไม่งั้นได้แบบเดียวกัน
            # สองใบ ใบหนึ่งเต็มแผง อีกใบเป็นเสี้ยวของมุมมองเดียว
            vectors += [(d, im, 'drawing', pg)
                        for d, im, pg in vector_figures(doc)
                        if d not in boilerplate and pg not in panel_pages]
            features = product_features(doc) if brand in FEATURE_BRANDS else []
            doc.close()

            # **เรียงตามหน้าในเอกสารเป็นหลัก** ไม่ใช่เชื่อตัวแยกภาพถ่าย/ภาพแบบอย่างเดียว
            #
            # ผู้ผลิตทั้ง FHF และ MEDC วางรูปสินค้าไว้หน้าแรกเสมอ ส่วนตารางตั้งค่า
            # กราฟ ผังต่อสาย และแบบบอกขนาดอยู่หน้าถัด ๆ ไป ลำดับหน้าจึงเป็นสัญญาณ
            # ที่ตรงกว่าการเดาจากค่าพิกเซลมาก — ตัวแยกที่ดูความบางของหมึกยังตัดสินผิด
            # กับผังต่อสายที่มีภาพตัดขวางทึบ ๆ อยู่ข้างใน และกับลำโพงฝังฝ้าที่หน้ากาก
            # เป็นรูพรุนถี่ ๆ
            #
            # ตัวแยกยังใช้อยู่ แต่ลดบทบาทเหลือแค่ (ก) จัดลำดับภายในหน้าเดียวกัน
            # และ (ข) เลือกคำบรรยายใต้ภาพว่าเป็นรูปถ่ายหรือภาพแบบ
            ordered = sorted(
                rasters + vectors,
                key=lambda item: (item[3], 0 if item[2] == 'photo' else 1,
                                  -item[1].width * item[1].height),
            )

            # ภาพถ่ายก่อนภาพแบบ และภาพใหญ่ก่อนภาพเล็ก — ภาพแรกถูกใช้เป็นภาพบนการ์ด
            # ผู้อ่านที่กวาดสายตาในหน้ารายการต้องเห็นว่า "ของหน้าตาอย่างไร"
            # ไม่ใช่เห็นแบบบอกขนาดเป็นอย่างแรก
            gallery = []
            used = set()
            for digest, image, kind, _page in ordered:
                if digest in used or len(gallery) >= MAX_GALLERY:
                    continue
                used.add(digest)
                name = '%s-%d.webp' % (sheet['id'], len(gallery) + 1)
                size = save_web(trim_background(image), os.path.join(catalog_dir, name),
                                GALLERY_WIDTH, GALLERY_QUALITY)
                gallery.append({
                    'src': '/images/catalog/%s/%s' % (brand, name),
                    'width': size[0],
                    'height': size[1],
                    'kind': kind,
                })

            card = None
            if gallery:
                first = frame_product(ordered[0][1], CARD_WIDTH)
                card_name = '%s-card.webp' % sheet['id']
                card_size = save_web(first, os.path.join(catalog_dir, card_name), CARD_WIDTH, 74)
                card = {
                    'src': '/images/catalog/%s/%s' % (brand, card_name),
                    'width': card_size[0],
                    'height': card_size[1],
                }

            products.append({
                'slug': sheet['id'],
                'brandId': brand,
                'category': sheet['category'],
                'name': sheet['title'],
                'model': sheet.get('model'),
                'datasheetUrl': sheet['pdfUrl'],
                'card': card,
                'gallery': gallery,
                'features': features,
            })

        mine = [p for p in products if p['brandId'] == brand]
        print('%-12s สินค้า %3d · ภาพ %4d · ไม่มีภาพ %d'
              % (brand, len(mine), sum(len(p['gallery']) for p in mine),
                 sum(1 for p in mine if not p['gallery'])))

    products.sort(key=lambda p: (p['brandId'], p['category'], p['name'].lower()))
    write_products(products)

    total_images = sum(len(p['gallery']) for p in products)
    photos = sum(1 for p in products for g in p['gallery'] if g['kind'] == 'photo')
    print('\nรวมสินค้า %d รายการ · ภาพ %d ไฟล์ (ภาพถ่าย %d · ภาพแบบ %d)'
          % (len(products), total_images, photos, total_images - photos))
    if manuals:
        print('คัดคู่มือออกจากหน้าสินค้า %d เล่ม (ยังอยู่ในคลังเอกสาร): %s'
              % (len(manuals), ', '.join(manuals)))
    if FAILED:
        print('!!  แปลงภาพไม่สำเร็จ %d ใบ — ตรวจว่าเป็นภาพสินค้าหรือไม่' % len(FAILED))
    empty = [p['slug'] for p in products if not p['gallery']]
    if empty:
        print('สินค้าที่ไม่มีภาพเลย %d รายการ:' % len(empty))
        for slug in empty:
            print('   ', slug)


def ts_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def write_products(records):
    lines = [
        '// ⚠️ ไฟล์นี้ถูกสร้างด้วย scripts/build-products.py — **ห้ามแก้ด้วยมือ**',
        '//    สินค้าหนึ่งรายการ = เอกสารข้อมูลสินค้าหนึ่งฉบับ ภาพทั้งหมดดึงจากไฟล์นั้นโดยตรง',
        "import type { Product } from '@/types/content'",
        '',
        'export const generatedProducts: Product[] = [',
    ]
    for r in records:
        lines.append('  {')
        lines.append('    slug: %s,' % ts_string(r['slug']))
        lines.append('    brandId: %s,' % ts_string(r['brandId']))
        lines.append('    category: %s,' % ts_string(r['category']))
        lines.append('    name: %s,' % ts_string(r['name']))
        if r['model']:
            lines.append('    model: %s,' % ts_string(r['model']))
        lines.append('    datasheetUrl: %s,' % ts_string(r['datasheetUrl']))
        if r['card']:
            lines.append('    card: { src: %s, width: %d, height: %d },'
                         % (ts_string(r['card']['src']), r['card']['width'], r['card']['height']))
        if r.get('features'):
            lines.append('    features: [')
            for f in r['features']:
                lines.append('      %s,' % ts_string(f))
            lines.append('    ],')
        if r['gallery']:
            lines.append('    gallery: [')
            for g in r['gallery']:
                lines.append('      { src: %s, width: %d, height: %d, kind: %s },'
                             % (ts_string(g['src']), g['width'], g['height'], ts_string(g['kind'])))
            lines.append('    ],')
        else:
            lines.append('    gallery: [],')
        lines.append('  },')
    lines.append(']')
    lines.append('')

    with io.open(PRODUCTS_OUT, 'w', encoding='utf-8', newline='') as handle:
        handle.write('\n'.join(lines))


if __name__ == '__main__':
    build()
