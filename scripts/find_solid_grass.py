from PIL import Image
import os

def find_solid_patch(img_path, patch_w=32, patch_h=32):
    im = Image.open(img_path).convert("RGBA")
    w, h = im.size
    best_patch = None
    best_score = float('inf')
    
    for y in range(0, h - patch_h, 4):
        for x in range(0, w - patch_w, 4):
            patch = im.crop((x, y, x + patch_w, y + patch_h))
            # Check all pixels are 100% opaque
            alpha = [p[3] for p in patch.getdata()]
            if min(alpha) < 255:
                continue
            # Check colors are within grass green range (G > R and G > B)
            is_green = all(p[1] > p[0] and p[1] > p[2] for p in patch.getdata())
            if not is_green:
                continue
            # Check that boundary pixels (top vs bottom, left vs right) match closely for seamlessness
            top = [patch.getpixel((px, 0)) for px in range(patch_w)]
            bottom = [patch.getpixel((px, patch_h - 1)) for px in range(patch_w)]
            left = [patch.getpixel((0, py)) for py in range(patch_h)]
            right = [patch.getpixel((patch_w - 1, py)) for py in range(patch_h)]
            
            diff_tb = sum(abs(t[1] - b[1]) for t, b in zip(top, bottom))
            diff_lr = sum(abs(l[1] - r[1]) for l, r in zip(left, right))
            score = diff_tb + diff_lr
            
            if score < best_score:
                best_score = score
                best_patch = (patch, x, y, score)
                
    return best_patch

# Test across our sources
dest = r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\tilesets"
sources = [
    r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\island\island_Tiled_map.png",
    r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\roads\Road1_grass.png",
    r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\roads\Ground_grass.png",
    r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\tilesets\home_exterior.png"
]

for s in sources:
    res = find_solid_patch(s, 32, 32)
    if res:
        p, x, y, sc = res
        print(f"Found solid patch in {os.path.basename(s)} at ({x}, {y}) score {sc}")
        p.save(os.path.join(dest, f"test_solid_{os.path.basename(s)}"))
