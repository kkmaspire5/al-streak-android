"""Makes the Android launcher icons from ONE logo file.

Put your logo at  app/src/main/assets/logo.png  (square, 512x512 or bigger, PNG).
The build runs this script automatically, so replacing that one file on GitHub
is all you need to do. The same file is also shown on the sign-in screen.
"""
import os
import sys
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGO = os.path.join(ROOT, "app", "src", "main", "assets", "logo.png")
RES = os.path.join(ROOT, "app", "src", "main", "res")
SIZES = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}

if not os.path.exists(LOGO):
    sys.exit("logo.png not found, keeping the existing icons")

src = Image.open(LOGO).convert("RGBA")
side = min(src.size)                      # centre-crop to a square
left, top = (src.width - side) // 2, (src.height - side) // 2
src = src.crop((left, top, left + side, top + side))

for name, px in SIZES.items():
    folder = os.path.join(RES, "mipmap-" + name)
    os.makedirs(folder, exist_ok=True)
    icon = src.resize((px, px), Image.LANCZOS)
    mask = Image.new("L", (px * 4, px * 4), 0)       # soft rounded corners
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, px * 4 - 1, px * 4 - 1), radius=int(px * 4 * 0.22), fill=255)
    mask = mask.resize((px, px), Image.LANCZOS)
    out = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    out.paste(icon, (0, 0), mask)
    out.save(os.path.join(folder, "ic_launcher.png"))
print("Launcher icons written for", ", ".join(SIZES))
