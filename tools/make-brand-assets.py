from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONT_SERIF = ROOT / "src/app/fonts/InstrumentSerif-Regular.ttf"
FONT_SERIF_ITALIC = ROOT / "src/app/fonts/InstrumentSerif-Italic.ttf"
FONT_SANS = ROOT / "src/app/fonts/DMSans-Variable.ttf"
CANVAS = "#f6f3eb"
PAPER = "#fffdf8"
INK = "#101214"
MUTED = "#6e7176"
ACCENT = "#1f3bff"
SKY = "#dbe7f6"

serif = ImageFont.truetype(str(FONT_SERIF), 132)
serif_italic = ImageFont.truetype(str(FONT_SERIF_ITALIC), 132)
sans = ImageFont.truetype(str(FONT_SANS), 25)
sans_small = ImageFont.truetype(str(FONT_SANS), 18)
wordmark = ImageFont.truetype(str(FONT_SANS), 42)

# Open Graph card -----------------------------------------------------------
og = Image.new("RGB", (1200, 630), CANVAS)
draw = ImageDraw.Draw(og)

draw.rounded_rectangle((700, 58, 1148, 572), radius=28, fill=SKY)
bulb = Image.open(ROOT / "public/products/halo-bulb.png").convert("RGBA")
bulb.thumbnail((440, 440))
og.paste(bulb, (730, 128), bulb)
plug = Image.open(ROOT / "public/products/plug-mini.png").convert("RGBA")
plug.thumbnail((220, 220))
og.paste(plug, (946, 380), plug)

draw.text((72, 58), "cloud", font=wordmark, fill=INK)
cloud_width = draw.textlength("cloud", font=wordmark)
draw.text((72 + cloud_width, 58), ".", font=wordmark, fill=ACCENT)

draw.text((72, 158), "The good stuff,", font=serif, fill=INK)
draw.text((72, 286), "brought home.", font=serif_italic, fill=INK)
draw.text(
    (76, 464),
    "Home essentials and everyday wear, sourced abroad\nand delivered across Nigeria.",
    font=sans,
    fill=MUTED,
    spacing=10,
)
draw.rounded_rectangle((76, 560, 470, 566), radius=3, fill=ACCENT)
draw.text((76, 584), "Naira pricing  ·  Customs included  ·  Nationwide delivery", font=sans_small, fill=MUTED)
og.save(ROOT / "public/og.png", quality=95)

# Apple touch icon ----------------------------------------------------------
icon = Image.new("RGB", (180, 180), ACCENT)
icon_draw = ImageDraw.Draw(icon)
icon_font = ImageFont.truetype(str(FONT_SERIF), 142)
icon_draw.text((62, 10), "c", font=icon_font, fill=PAPER, anchor="ma")
icon_draw.ellipse((116, 122, 134, 140), fill=PAPER)
icon.save(ROOT / "src/app/apple-icon.png")

print("wrote public/og.png and src/app/apple-icon.png")
