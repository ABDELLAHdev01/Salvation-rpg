from PIL import Image
import os

p = r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\island\island_Tiled_map.png"
if os.path.exists(p):
    im = Image.open(p)
    print("Size:", im.size, "Mode:", im.mode)
    # Check if it has content (non-transparent)
    bbox = im.getbbox()
    print("BBox:", bbox)
