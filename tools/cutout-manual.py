from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter
import numpy as np
from rembg import new_session, remove

PRODUCTS = Path("public/products")
CUT = PRODUCTS / "cut"
CUT.mkdir(parents=True, exist_ok=True)


def stage(image: Image.Image, margin_ratio: float = 0.07) -> Image.Image:
    """Trim transparent edges, pad to a square, and resize to 1200px."""
    image = image.convert("RGBA")
    bbox = image.getchannel("A").getbbox()
    if not bbox:
        raise ValueError("empty cutout")
    product = image.crop(bbox)
    side = max(product.size)
    margin = round(side * margin_ratio)
    canvas = Image.new("RGBA", (side + margin * 2, side + margin * 2), (0, 0, 0, 0))
    canvas.paste(
        product,
        ((canvas.width - product.width) // 2, (canvas.height - product.height) // 2),
        product,
    )
    return canvas.resize((1200, 1200), Image.LANCZOS)


def rounded_alpha(size: tuple[int, int], radius_ratio: float) -> Image.Image:
    """Build an antialiased rounded-rectangle mask at 4x and downsample."""
    width, height = size
    scale = 4
    mask = Image.new("L", (width * scale, height * scale), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle(
        [0, 0, width * scale - 1, height * scale - 1],
        radius=round(min(width, height) * radius_ratio * scale),
        fill=255,
    )
    return mask.resize((width, height), Image.LANCZOS)


def rounded_crop(image: Image.Image, box: tuple[int, int, int, int], radius_ratio: float) -> Image.Image:
    crop = image.crop(box).convert("RGBA")
    crop.putalpha(rounded_alpha(crop.size, radius_ratio))
    return crop


# iPad Pro: the centre device in the Commons group photograph. The photograph
# is flat-on, so a rounded crop isolates the tablet cleanly.
group = Image.open(PRODUCTS / "ipad-pro.jpg")
ipad = rounded_crop(group, (456, 366, 912, 986), 0.035)
stage(ipad).save(CUT / "ipad-pro.png", optimize=True)

# Kindle: crop the right-hand device from the existing press-style photograph.
kindle_source = Image.open(PRODUCTS / "kindle-paperwhite.jpg").convert("RGB")
gray = np.array(kindle_source.convert("L"))
dark = gray < 60
dark[:, :700] = False
ys, xs = np.where(dark)
kindle = rounded_crop(
    kindle_source,
    (int(xs.min()) - 2, int(ys.min()) - 2, int(xs.max()) + 3, int(ys.max()) + 3),
    0.04,
)
stage(kindle).save(CUT / "kindle-paperwhite.png", optimize=True)

# AirPods Pro: the pair in its open charging case. U2Net handles the white
# product against the light-grey studio sweep cleanly.
airpods_source = Image.open(PRODUCTS / "airpods-pro.jpg").convert("RGBA")
airpods = remove(airpods_source, session=new_session("u2net"))
stage(airpods).save(CUT / "airpods-pro.png", optimize=True)

# iPhone 15 Pro: the source sheet shows a front and back handset. Isolate the
# front-facing phone so the product reads as one object.
iphone_source = Image.open(PRODUCTS / "iphone-15-pro.jpg").convert("RGB")
gray = np.array(iphone_source.convert("L"))
dark = gray < 220
dark[:, :800] = False
ys, xs = np.where(dark)
iphone = rounded_crop(
    iphone_source,
    (int(xs.min()) - 2, int(ys.min()) - 2, int(xs.max()) + 3, int(ys.max()) + 3),
    0.12,
)
# The photograph has a faint green cast on the handset edge. Pull the alpha in
# by two pixels so the crop's own backdrop cannot appear as a fringe.
iphone.putalpha(iphone.getchannel("A").filter(ImageFilter.MinFilter(5)))
stage(iphone).save(CUT / "iphone-15-pro.png", optimize=True)

# Nintendo Switch OLED: a public-domain studio composition with the console
# and dock. It has more silhouette than the all-white front shot.
switch = Image.open(PRODUCTS / "nintendo-switch-oled-source.png")
stage(switch).save(CUT / "nintendo-switch-oled.png", optimize=True)

print("wrote ipad-pro.png, kindle-paperwhite.png, airpods-pro.png, iphone-15-pro.png, nintendo-switch-oled.png")
