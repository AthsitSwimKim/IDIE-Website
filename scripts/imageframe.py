# -*- coding: utf-8 -*-
"""
จัดกรอบภาพสินค้าให้เป็นมาตรฐานเดียวกัน — ใช้ร่วมกันทั้ง build-products.py
และ scrape-industronic.py

**ปัญหาที่แก้** — ภาพสินค้ามาจากคนละแหล่งและถ่ายคนละมาตรฐาน ส่วนใหญ่พื้นขาว
แต่บางใบพื้นดำสนิท บางใบพื้นเทาไล่เฉด และสินค้าในกรอบใหญ่เล็กไม่เท่ากันมาก
พอเรียงเป็นตะแกรงบนหน้าสินค้าจึงกระโดดทั้งขนาดและสีพื้น

**วิธีจัด**
  1. อ่านสีพื้นหลังจากขอบภาพทั้งสี่ด้าน
  2. ตัดพื้นหลังที่ว่างเปล่ารอบ ๆ ออก เหลือเฉพาะตัวสินค้า
  3. ย่อ/ขยายให้พอดีกรอบจัตุรัสที่มีช่องไฟเท่ากันทุกใบ
  4. ภาพพื้นสว่าง → วางเต็มกรอบ  ภาพพื้นเข้ม/พื้นไล่เฉด → วางเป็นชิปรูปมุมมน
     บนพื้นการ์ดสีขาวเหมือนใบอื่น

**ทำไมไม่คีย์พื้นดำออกให้เป็นขาวทั้งหมด** — ลองแล้วและใช้ไม่ได้จริง สินค้าหลายตัว
ของ MEDC เป็นลำโพงฮอร์นสีดำถ่ายบนพื้นดำ ช่องว่างในขาตั้งรูปตัว U เชื่อมกับตัวสินค้า
สีดำผ่านขอบที่ไล่สี การไล่สีพื้นจึงกินตัวสินค้าไปด้วย ส่วนถ้าเลือกไล่เฉพาะพื้นที่
ติดขอบภาพ ช่องในขาตั้งจะเหลือเป็นแผ่นดำแปะอยู่กลางภาพ ซึ่งดูเหมือนภาพเสีย
หนักกว่าเดิม

**ชิปรูปแก้อะไร** — พื้นการ์ดทุกใบกลายเป็นสีเดียวกันหมด ภาพพื้นดำจึงอ่านเป็น
"ภาพถ่ายที่ใส่กรอบไว้" ไม่ใช่การ์ดสีดำโดด ๆ ที่ปนอยู่ในตะแกรงการ์ดขาว
และขนาดสินค้าที่ปรากฏยังใกล้เคียงกับใบอื่นเพราะคุมช่องไฟไว้เท่ากัน
"""

from __future__ import annotations

from collections import Counter
from statistics import median

from PIL import Image, ImageChops, ImageDraw

BORDER_UNIFORM = 0.55    # ขอบภาพต้องเป็นสีเดียวกันเกินสัดส่วนนี้จึงถือว่าเป็นพื้นหลัง
TRIM_TOLERANCE = 20      # ต่างจากสีพื้นน้อยกว่านี้ถือว่ายังเป็นพื้นหลัง
NEAR_WHITE = 236         # สว่างกว่านี้ให้ถือเป็นขาวสนิท กันไม่ให้เห็นเป็นกล่องเทาบนการ์ดขาว
LIGHT_TILE = 200         # ความสว่างพื้นหลังที่ยังวางเต็มกรอบได้โดยไม่ตีกับการ์ดใบอื่น
CARD_PADDING = 0.08      # ช่องไฟรอบสินค้าเมื่อวางเต็มกรอบ
MAX_UPSCALE = 2.5        # ขยายภาพเล็กได้ไม่เกินเท่านี้ เกินกว่านี้เบลอจนเสียมากกว่าได้
CHIP_SCALE = 0.90        # ชิปรูปกินพื้นที่เท่าไรของการ์ด
CHIP_PADDING = 0.07      # ช่องไฟรอบสินค้าภายในชิป
CHIP_RADIUS = 0.05       # รัศมีมุมมนของชิป เทียบกับด้านของการ์ด
CARD_SURFACE = (255, 255, 255)   # สีพื้นการ์ด ตรงกับพื้นการ์ดบนหน้าเว็บ


def background_colour(image: Image.Image):
    """สีพื้นหลังของภาพ อ่านจากขอบภาพทั้งสี่ด้าน

    คืน (สี, สัดส่วนที่สีนั้นครองขอบ) — สัดส่วนต่ำแปลว่าขอบไม่ได้เป็นสีเดียว
    เช่นภาพที่สินค้าชิดขอบ หรือฉากหลังไล่เฉด กรณีนั้นไม่ควรตัดขอบ
    """
    width, height = image.size
    edge = (list(image.crop((0, 0, width, 1)).getdata())
            + list(image.crop((0, height - 1, width, height)).getdata())
            + list(image.crop((0, 0, 1, height)).getdata())
            + list(image.crop((width - 1, 0, width, height)).getdata()))
    colour, count = Counter(edge).most_common(1)[0]
    return colour, count / max(len(edge), 1)


def _luma(colour) -> float:
    return 0.299 * colour[0] + 0.587 * colour[1] + 0.114 * colour[2]


def _edge_median(image: Image.Image):
    """สีกลางของขอบภาพ ใช้กับภาพที่ขอบไม่ได้เป็นสีเดียว เช่นฉากหลังไล่เฉด

    ใช้ค่ามัธยฐานแทนสีที่พบบ่อยที่สุด เพราะบนฉากไล่เฉดไม่มีสีไหนพบบ่อยจริง
    ค่ามัธยฐานจึงเป็นตัวแทนของพื้นได้ตรงกว่า
    """
    width, height = image.size
    edge = (list(image.crop((0, 0, width, 1)).getdata())
            + list(image.crop((0, height - 1, width, height)).getdata())
            + list(image.crop((0, 0, 1, height)).getdata())
            + list(image.crop((width - 1, 0, width, height)).getdata()))
    return tuple(round(median(channel)) for channel in zip(*edge))


def _content_box(image: Image.Image, colour):
    flat = Image.new('RGB', image.size, colour)
    diff = ImageChops.difference(image, flat).convert('L')
    return diff.point(lambda value: 255 if value > TRIM_TOLERANCE else 0).getbbox()


def _fit(image: Image.Image, box: int) -> Image.Image:
    """ย่อหรือขยายภาพให้พอดีกรอบด้านละ box

    **ขยายได้ ไม่ใช่ย่ออย่างเดียว** — ภาพต้นทางบางใบกว้างแค่ 199px ถ้าย่ออย่างเดียว
    จะลอยจิ๋วอยู่กลางกรอบ ทำให้ตะแกรงสินค้าดูขนาดกระโดดไปมา
    """
    scale = min(box / image.width, box / image.height)
    if scale > 1:
        scale = min(scale, MAX_UPSCALE)
    return image.resize((max(round(image.width * scale), 1),
                         max(round(image.height * scale), 1)), Image.LANCZOS)


def _centre(tile: Image.Image, fitted: Image.Image, mask=None):
    tile.paste(fitted, ((tile.width - fitted.width) // 2,
                        (tile.height - fitted.height) // 2), mask)
    return tile


def trim_background(image: Image.Image) -> Image.Image:
    """ตัดขอบพื้นหลังว่าง ๆ ออก แต่คงสัดส่วนเดิม — ใช้กับภาพในแกลเลอรี

    ไม่บังคับเป็นจัตุรัส เพราะภาพแบบบอกขนาดที่ยาว ๆ ถ้ายัดลงกรอบจัตุรัส
    จะเล็กจนอ่านตัวเลขไม่ออก
    """
    colour, share = background_colour(image)
    if share < BORDER_UNIFORM:
        return image
    box = _content_box(image, colour)
    if not box:
        return image
    margin = round(max(image.size) * 0.02)  # เผื่อขอบไว้ ไม่ให้สินค้าชนขอบพอดีเป๊ะ
    return image.crop((max(box[0] - margin, 0), max(box[1] - margin, 0),
                       min(box[2] + margin, image.width), min(box[3] + margin, image.height)))


def frame_product(image: Image.Image, canvas: int) -> Image.Image:
    """วางสินค้ากลางกรอบจัตุรัสขนาดเดียวกันทุกใบ พร้อมช่องไฟเท่ากัน"""
    image = image.convert('RGB')
    colour, share = background_colour(image)
    uniform = share >= BORDER_UNIFORM

    if uniform:
        box = _content_box(image, colour)
        if box:
            image = image.crop(box)

    if uniform and _luma(colour) >= LIGHT_TILE:
        if min(colour) >= NEAR_WHITE:
            colour = (255, 255, 255)
        inner = max(round(canvas * (1 - 2 * CARD_PADDING)), 16)
        return _centre(Image.new('RGB', (canvas, canvas), colour), _fit(image, inner))

    # พื้นเข้มหรือขอบไม่สม่ำเสมอ → วางเป็นชิปรูปมุมมนบนพื้นการ์ดสีเดียวกับใบอื่น
    side = max(round(canvas * CHIP_SCALE), 32)
    chip = Image.new('RGB', (side, side), colour)
    if uniform:
        _centre(chip, _fit(image, max(round(side * (1 - 2 * CHIP_PADDING)), 16)))
    else:
        # ขอบภาพไม่สม่ำเสมอ (ฉากหลังไล่เฉด หรือสินค้าชิดขอบ) จึงตัดขอบไม่ได้
        # ต้องวางทั้งภาพลงในชิปโดยไม่ครอบตัด — เคยลองขยายให้เต็มชิปแล้วครอบกลาง
        # ปรากฏว่ากินตัวสินค้าหายไปครึ่งตัว ส่วนที่เหลือรอบภาพเติมด้วยสีกลางของขอบภาพ
        # ซึ่งใกล้เคียงพื้นของภาพเองอยู่แล้ว
        chip = Image.new('RGB', (side, side), _edge_median(image))
        _centre(chip, _fit(image, side))

    mask = Image.new('L', (side, side), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, side - 1, side - 1],
                                           radius=round(canvas * CHIP_RADIUS), fill=255)
    return _centre(Image.new('RGB', (canvas, canvas), CARD_SURFACE), chip, mask)
