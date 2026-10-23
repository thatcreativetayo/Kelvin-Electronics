from PIL import Image, ImageDraw
from pathlib import Path

files = sorted(Path('public/products').glob('*.png'))
thumb = 300
cols = 4
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGBA', (cols * thumb, rows * (thumb + 30)), (245, 248, 252, 255))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGBA')
    im.thumbnail((thumb - 20, thumb - 20))
    x = (i % cols) * thumb + (thumb - im.width) // 2
    y = (i // cols) * (thumb + 30) + (thumb - im.height) // 2
    sheet.alpha_composite(im, (x, y))
    d.text(((i % cols) * thumb + 10, (i // cols) * (thumb + 30) + thumb + 6), f.stem, fill=(20, 17, 13, 255))
out = Path(r'C:\Users\Ariyo Eyitayo\AppData\Local\Temp\cloud-shots\products-sheet.png')
sheet.convert('RGB').save(out)
print(out, len(files))
