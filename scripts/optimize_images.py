import os
import sys
from PIL import Image, ImageOps

TARGETS = [
    ("assets/images/cat-goat", 1400),
    ("assets/images/cat-cow", 1400),
    ("assets/images/cat-socks", 1400),
    ("assets/images/gallery", 1600),
    ("assets/images/jeke", 1400),
    # brand/ is handled manually (logo, QR codes) - excluded from this batch
    # pipeline since resizing a binarized/flat PNG here reintroduces antialiasing
    # noise and can bloat the file instead of shrinking it.
]

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def optimize(path, max_w):
    try:
        img = Image.open(path)
        img = ImageOps.exif_transpose(img)
        if img.mode in ("RGBA", "P"):
            if path.lower().endswith(".png"):
                pass
            else:
                img = img.convert("RGB")
        else:
            img = img.convert("RGB") if not path.lower().endswith(".png") else img
        w, h = img.size
        if w > max_w:
            new_h = int(h * (max_w / w))
            img = img.resize((max_w, new_h), Image.LANCZOS)
        ext = os.path.splitext(path)[1].lower()
        if ext == ".png":
            img.save(path, "PNG", optimize=True)
        else:
            img.save(path, "JPEG", quality=78, optimize=True, progressive=True)
        return True
    except Exception as e:
        print(f"FAIL {path}: {e}")
        return False

total_before = 0
total_after = 0
for folder, max_w in TARGETS:
    full = os.path.join(ROOT, folder)
    if not os.path.isdir(full):
        continue
    for fn in os.listdir(full):
        p = os.path.join(full, fn)
        if not os.path.isfile(p):
            continue
        before = os.path.getsize(p)
        total_before += before
        optimize(p, max_w)
        after = os.path.getsize(p)
        total_after += after
        print(f"{folder}/{fn}: {before//1024}KB -> {after//1024}KB")

print(f"\nTOTAL: {total_before/1024/1024:.1f}MB -> {total_after/1024/1024:.1f}MB")
