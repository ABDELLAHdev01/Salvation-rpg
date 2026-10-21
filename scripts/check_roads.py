from PIL import Image
import os

base = r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\roads"
for r in sorted(os.listdir(base)):
    if r.endswith('.png'):
        im = Image.open(os.path.join(base, r))
        print(f"{r}: {im.size}")
