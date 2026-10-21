from PIL import Image
import os

base = r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets"

files = [
    r"island\island_Tiled.png",
    r"island\island_Tiled_map.png",
    r"roads\Ground_grass.png",
    r"roads\Road1_grass.png",
    r"roads\Road1.png",
    r"trees\Palm_tree1_1.png",
    r"trees\Palm_tree2_1.png",
    r"trees\Fruit_tree1.png",
    r"trees\Flower_tree1.png",
    r"trees\Tree1.png",
    r"trees\Moss_tree1.png",
]

for rel in files:
    full = os.path.join(base, rel)
    if os.path.exists(full):
        im = Image.open(full)
        print(f"{rel}: size = {im.size}, mode = {im.mode}")
    else:
        print(f"NOT FOUND: {rel}")
