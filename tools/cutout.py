from pathlib import Path

from PIL import Image
from rembg import new_session, remove

SOURCE = Path("public/products")
OUTPUT = Path("public/products/cut")
OUTPUT.mkdir(parents=True, exist_ok=True)

session = new_session("u2net")

for path in sorted(SOURCE.glob("*.jpg")):
    image = Image.open(path).convert("RGBA")
    cut = remove(image, session=session)

    alpha = cut.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        print(f"{path.name}: empty cutout, skipped")
        continue

    product = cut.crop(bbox)
    side = max(product.size)
    margin = round(side * 0.07)
    stage = Image.new("RGBA", (side + margin * 2, side + margin * 2), (0, 0, 0, 0))
    stage.paste(
        product,
        ((stage.width - product.width) // 2, (stage.height - product.height) // 2),
        product,
    )
    stage = stage.resize((1200, 1200), Image.LANCZOS)

    target = OUTPUT / f"{path.stem}.png"
    stage.save(target, optimize=True)
    print(f"{path.name} -> {target.name} ({target.stat().st_size // 1024} KB)")
