from PIL import Image, ImageDraw
from pathlib import Path
import os

root = Path(os.environ['TEMP']) / 'cloud-vecteezy'
files = sorted(root.glob('*.jpg'))
thumb = 260
cols = 5
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * thumb, rows * (thumb + 30)), (245, 248, 252))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    try:
        im = Image.open(f).convert('RGB')
    except Exception:
        continue
    im.thumbnail((thumb - 12, thumb - 12))
    x = (i % cols) * thumb + (thumb - im.width) // 2
    y = (i // cols) * (thumb + 30) + (thumb - im.height) // 2
    sheet.paste(im, (x, y))
    d.text(((i % cols) * thumb + 6, (i // cols) * (thumb + 30) + thumb + 5), f.stem[:38], fill=(20, 17, 13))
out = Path(os.environ['TEMP']) / 'cloud-shots' / 'vecteezy-sheet.png'
sheet.save(out)
print(out, len(files))
