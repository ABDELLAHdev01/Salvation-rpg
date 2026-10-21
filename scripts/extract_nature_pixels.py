import zipfile, tarfile, os, io

src = r"C:\Users\abdel\OneDrive\Desktop\New folder\1776846603480-930518877-nature_pixels_v2___top_down_pixel_art_asset_pack___8211____nature_pixels_v2___vip.zip"
out_dir = r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\nature_pixels"
os.makedirs(out_dir, exist_ok=True)

with zipfile.ZipFile(src, 'r') as z:
    for n in z.namelist():
        if n.endswith('.unitypackage'):
            data = z.read(n)
            with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as tar:
                # Map guid to pathname
                guids = {}
                for m in tar.getmembers():
                    if m.name.endswith('/pathname'):
                        f = tar.extractfile(m)
                        if f:
                            p = f.read().decode('utf-8', errors='ignore').strip().replace('\x00', '')
                            guids[m.name.split('/')[0]] = p
                
                # Now extract asset files
                for m in tar.getmembers():
                    if m.name.endswith('/asset'):
                        guid = m.name.split('/')[0]
                        orig_path = guids.get(guid, '')
                        if orig_path.lower().endswith('.png'):
                            fname = os.path.basename(orig_path)
                            dest = os.path.join(out_dir, fname)
                            f = tar.extractfile(m)
                            if f:
                                with open(dest, 'wb') as df:
                                    df.write(f.read())
                                print(f"Extracted {orig_path} -> {fname}")

print("Done extracting Nature Pixels V2!")
