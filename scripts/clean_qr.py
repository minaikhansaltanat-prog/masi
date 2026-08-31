import numpy as np
from PIL import Image, ImageFilter
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = os.path.join(ROOT, "WeChat.jpeg")
out = os.path.join(ROOT, "assets", "images", "brand", "wechat-qr.png")

img = Image.open(src).convert("L")
arr = np.array(img)
h, w = arr.shape

# Dark-pixel density per row/column to locate the QR square
dark = arr < 140
row_density = dark.mean(axis=1)
col_density = dark.mean(axis=0)

# Find contiguous band where density is high (the QR code itself is much
# denser than the sparse header text / footer caption).
row_mask = row_density > 0.10
col_mask = col_density > 0.10

def largest_run(mask):
    # segment into contiguous True runs, return the run with the largest span
    idx = np.where(mask)[0]
    if len(idx) == 0:
        return idx.min(), idx.max()
    splits = np.where(np.diff(idx) > 5)[0]
    runs = np.split(idx, splits + 1)
    best = max(runs, key=lambda r: r.max() - r.min())
    return best.min(), best.max()

r0, r1 = largest_run(row_mask)
# restrict column search to the identified row band so header content
# (which may be wider/narrower) doesn't skew the column bounds; within
# this band all dark columns legitimately belong to the QR square, so a
# plain min/max is correct (no need to worry about gaps from sparse
# white QR modules splitting the run).
col_density2 = dark[r0:r1 + 1].mean(axis=0)
col_idx = np.where(col_density2 > 0.05)[0]
c0, c1 = col_idx.min(), col_idx.max()

pad = int(0.06 * max(r1 - r0, c1 - c0))
r0 = max(0, r0 - pad); r1 = min(h - 1, r1 + pad)
c0 = max(0, c0 - pad); c1 = min(w - 1, c1 + pad)

cropped = img.crop((c0, r0, c1, r1))
print("crop box:", (c0, r0, c1, r1), "size:", cropped.size)

# Upscale for a crisper result, then binarize to remove JPEG haze/noise.
target = 900
scale = target / max(cropped.size)
if scale > 1:
    cropped = cropped.resize((int(cropped.width * scale), int(cropped.height * scale)), Image.LANCZOS)

sharp = cropped.filter(ImageFilter.UnsharpMask(radius=2, percent=140, threshold=2))
arr2 = np.array(sharp).astype(np.float32)

# Local-ish threshold: use a global Otsu-like threshold for a clean B/W QR.
hist, _ = np.histogram(arr2, bins=256, range=(0, 256))
total = arr2.size
sum_all = np.dot(np.arange(256), hist)
sumB = 0.0
wB = 0.0
maxvar = 0.0
threshold = 128
for t in range(256):
    wB += hist[t]
    if wB == 0:
        continue
    wF = total - wB
    if wF == 0:
        break
    sumB += t * hist[t]
    mB = sumB / wB
    mF = (sum_all - sumB) / wF
    var = wB * wF * (mB - mF) ** 2
    if var > maxvar:
        maxvar = var
        threshold = t

bw = (arr2 > threshold).astype(np.uint8) * 255
out_img = Image.fromarray(bw, mode="L").convert("RGB")

# Add a clean white quiet-zone border for reliable scanning.
border = int(out_img.width * 0.06)
final = Image.new("RGB", (out_img.width + border * 2, out_img.height + border * 2), "white")
final.paste(out_img, (border, border))

os.makedirs(os.path.dirname(out), exist_ok=True)
final.save(out, "PNG", optimize=True)
print("saved:", out, final.size, os.path.getsize(out), "bytes")
