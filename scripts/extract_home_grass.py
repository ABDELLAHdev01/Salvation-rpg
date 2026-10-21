import zipfile
import os

src_folder = r"C:\Users\abdel\OneDrive\Desktop\New folder"
home_zip = os.path.join(src_folder, "craftpix-net-654184-main-characters-home-free-top-down-pixel-art-asset.zip")

with zipfile.ZipFile(home_zip, 'r') as z:
    for item in z.namelist():
        if "ground_grass_details.png" in item and not item.startswith('__MACOSX'):
            out_path = r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\tilesets\ground_grass_details.png"
            with z.open(item) as src, open(out_path, 'wb') as dst:
                dst.write(src.read())
            print(f"Extracted: {item} -> {out_path}")
