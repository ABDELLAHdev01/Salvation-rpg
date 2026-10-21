import zipfile
import os

src_folder = r"C:\Users\abdel\OneDrive\Desktop\New folder"

with zipfile.ZipFile(os.path.join(src_folder, "craftpix-net-351300-free-island-adventure-pixel-top-down-minigame-kit.zip"), 'r') as z:
    for name in z.namelist():
        if name.endswith('.tsx') or name.endswith('.tmx'):
            print(f"\n--- {name} ---")
            print(z.read(name).decode('utf-8', errors='ignore')[:500])

with zipfile.ZipFile(os.path.join(src_folder, "craftpix-net-574220-free-path-and-road-top-down-pixel-tileset.zip"), 'r') as z:
    for name in z.namelist():
        if name.endswith('.tsx') or name.endswith('.tmx'):
            print(f"\n--- {name} ---")
            print(z.read(name).decode('utf-8', errors='ignore')[:500])
