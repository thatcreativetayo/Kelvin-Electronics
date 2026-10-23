from PIL import Image, ImageDraw
from pathlib import Path
import os

root = Path(os.environ['TEMP']) / 'cloud-pexels'
groups = ['line-light-strip', 'current-4-way-strip', 'plug-mini', 'orbit-power-cube']
files = []
for g in groups:
    files += sorted(root.glob(f'{g}-*.jpg'))
thumb = 260
cols = 4
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * thumb, rows * (thumb + 34)), (245, 248, 252))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB')
    im.thumbnail((thumb - 16, thumb - 16))
    x = (i % cols) * thumb + (thumb - im.width) // 2
    y = (i // cols) * (thumb + 34) + (thumb - im.height) // 2
    sheet.paste(im, (x, y))
    d.text(((i % cols) * thumb + 6, (i // cols) * (thumb + 34) + thumb + 6), f.stem, fill=(20, 17, 13))
out = Path(os.environ['TEMP']) / 'cloud-shots' / 'power-sheet.png'
sheet.save(out)
print(out, len(files))
