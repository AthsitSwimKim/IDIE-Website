# -*- coding: utf-8 -*-
"""
สร้างภาพแชร์กลาง public/images/brand/og-default.png (1200×630)

ใช้เมื่อแชร์ลิงก์เว็บลง Facebook, LINE, LinkedIn — ทุกหน้าใช้ภาพนี้จนกว่าจะมีภาพเฉพาะหน้า
(ส่ง prop `image` ให้ <Seo>)

ต้นทาง: ตราบริษัท public/images/brand/idie-icon-source.png (817×550 พื้นโปร่ง)
วางบนพื้นขาว มีชื่อบริษัทใต้ตรา — ใช้ PNG ไม่ใช่ WebP เพราะ crawler ของ Facebook/LINE
บางตัวยังไม่รองรับ WebP

รัน:  python scripts/build-og-image.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'public/images/brand/idie-icon-source.png'
OUT = ROOT / 'public/images/brand/og-default.png'

W, H = 1200, 630
NAVY = (0, 27, 72)  # --color-navy-900
GREY = (85, 99, 122)  # ใกล้ text-ink-muted

canvas = Image.new('RGB', (W, H), 'white')

mark = Image.open(SRC).convert('RGBA')
mark_h = 300
mark = mark.resize((round(mark.width * mark_h / mark.height), mark_h), Image.LANCZOS)
mark_x = (W - mark.width) // 2
mark_y = 100
canvas.paste(mark, (mark_x, mark_y), mark)

# ฟอนต์ระบบ Windows — ภาพนี้สร้างครั้งเดียวแล้ว commit จึงไม่ต้องพึ่งฟอนต์ของโปรเจกต์
fonts = Path('C:/Windows/Fonts')
bold = ImageFont.truetype(str(fonts / 'seguisb.ttf'), 46)
regular = ImageFont.truetype(str(fonts / 'segoeui.ttf'), 28)

draw = ImageDraw.Draw(canvas)


def centered(text, font, y, fill):
    w = draw.textlength(text, font=font)
    draw.text(((W - w) / 2, y), text, font=font, fill=fill)


centered('ID INDUSTRIAL ENGINEERING CO., LTD.', bold, mark_y + mark_h + 52, NAVY)
centered('Industrial Communication & Safety Signalling  ·  Rayong, Thailand', regular, mark_y + mark_h + 118, GREY)

canvas.save(OUT, optimize=True)
print(f'{OUT.relative_to(ROOT)}  {canvas.size}  {OUT.stat().st_size // 1024} KB')
