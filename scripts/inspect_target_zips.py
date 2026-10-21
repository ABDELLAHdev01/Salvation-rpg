import os
import zipfile

folder = r"C:\Users\abdel\OneDrive\Desktop\New folder"

for name in [
    'craftpix-net-385863-free-top-down-trees-pixel-art.zip',
    'craftpix-net-351300-free-island-adventure-pixel-top-down-minigame-kit.zip',
    'craftpix-net-574220-free-path-and-road-top-down-pixel-tileset.zip',
    'craftpix-net-668008-free-bridges-top-down-pixel-art-asset-pack.zip'
]:
    fpath = os.path.join(folder, name)
    print(f"\n==========================================")
    print(f"ZIP: {name}")
    print(f"==========================================")
    with zipfile.ZipFile(fpath, 'r') as z:
        for f in z.namelist():
            if not f.startswith('__MACOSX') and not f.endswith('/'):
                print(f)
