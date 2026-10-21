import os
import zipfile
from PIL import Image

src_folder = r"C:\Users\abdel\OneDrive\Desktop\New folder"
dest_base = r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets"

os.makedirs(os.path.join(dest_base, "trees"), exist_ok=True)
os.makedirs(os.path.join(dest_base, "island"), exist_ok=True)
os.makedirs(os.path.join(dest_base, "roads"), exist_ok=True)
os.makedirs(os.path.join(dest_base, "rocks"), exist_ok=True)

# 1. Extract Trees from craftpix-net-385863-free-top-down-trees-pixel-art.zip
trees_zip = os.path.join(src_folder, "craftpix-net-385863-free-top-down-trees-pixel-art.zip")
print(f"Opening {trees_zip}...")
with zipfile.ZipFile(trees_zip, 'r') as z:
    for item in z.namelist():
        if "PNG/Assets_separately/Trees/" in item and item.endswith('.png'):
            base_name = os.path.basename(item)
            out_path = os.path.join(dest_base, "trees", base_name)
            with z.open(item) as src, open(out_path, 'wb') as dst:
                dst.write(src.read())
            print(f"Extracted tree: {base_name}")
        elif "PNG/Assets_separately/Trees_shadow/" in item and item.endswith('.png'):
            base_name = "shadow_" + os.path.basename(item)
            out_path = os.path.join(dest_base, "trees", base_name)
            with z.open(item) as src, open(out_path, 'wb') as dst:
                dst.write(src.read())

# 2. Extract Island kit from craftpix-net-351300-free-island-adventure-pixel-top-down-minigame-kit.zip
island_zip = os.path.join(src_folder, "craftpix-net-351300-free-island-adventure-pixel-top-down-minigame-kit.zip")
print(f"\nOpening {island_zip}...")
with zipfile.ZipFile(island_zip, 'r') as z:
    for item in z.namelist():
        if item.endswith('.png') and not item.startswith('__MACOSX'):
            base_name = os.path.basename(item)
            # Check if it is tileset or UI or map
            if "Tileset" in item or "Tiled" in item:
                out_path = os.path.join(dest_base, "island", f"island_{base_name}")
                with z.open(item) as src, open(out_path, 'wb') as dst:
                    dst.write(src.read())
                print(f"Extracted island asset: {item} -> island_{base_name}")

# 3. Extract Paths and Roads from craftpix-net-574220-free-path-and-road-top-down-pixel-tileset.zip
roads_zip = os.path.join(src_folder, "craftpix-net-574220-free-path-and-road-top-down-pixel-tileset.zip")
print(f"\nOpening {roads_zip}...")
with zipfile.ZipFile(roads_zip, 'r') as z:
    for item in z.namelist():
        if item.endswith('.png') and not item.startswith('__MACOSX'):
            base_name = os.path.basename(item)
            out_path = os.path.join(dest_base, "roads", base_name)
            with z.open(item) as src, open(out_path, 'wb') as dst:
                dst.write(src.read())
            print(f"Extracted road asset: {base_name}")

# 4. Extract Rocks and Stones from craftpix-net-974061-free-rocks-and-stones-top-down-pixel-art.zip
rocks_zip = os.path.join(src_folder, "craftpix-net-974061-free-rocks-and-stones-top-down-pixel-art.zip")
print(f"\nOpening {rocks_zip}...")
with zipfile.ZipFile(rocks_zip, 'r') as z:
    for item in z.namelist():
        if "Objects_separately" in item and item.endswith('.png') and not item.startswith('__MACOSX'):
            base_name = os.path.basename(item)
            out_path = os.path.join(dest_base, "rocks", base_name)
            with z.open(item) as src, open(out_path, 'wb') as dst:
                dst.write(src.read())

print("\nExtraction complete! Checking dimensions...")
