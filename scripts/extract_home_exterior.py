import zipfile, os
src_folder = r"C:\Users\abdel\OneDrive\Desktop\New folder"
home_zip = os.path.join(src_folder, "craftpix-net-654184-main-characters-home-free-top-down-pixel-art-asset.zip")
with zipfile.ZipFile(home_zip, 'r') as z:
    for n in z.namelist():
        if "exterior.png" in n and not n.startswith('__MACOSX'):
            out_path = r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\tilesets\home_exterior.png"
            with z.open(n) as src, open(out_path, 'wb') as dst:
                dst.write(src.read())
            print("Extracted home_exterior.png!")
