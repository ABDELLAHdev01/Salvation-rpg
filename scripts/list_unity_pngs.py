import zipfile
import tarfile
import os
import io

src = r"C:\Users\abdel\OneDrive\Desktop\New folder\1776846603480-930518877-nature_pixels_v2___top_down_pixel_art_asset_pack___8211____nature_pixels_v2___vip.zip"
with zipfile.ZipFile(src, 'r') as z:
    for n in z.namelist():
        if n.endswith('.unitypackage'):
            data = z.read(n)
            with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as tar:
                members = tar.getmembers()
                pathnames = {}
                for m in members:
                    if m.name.endswith('/pathname'):
                        f = tar.extractfile(m)
                        if f:
                            raw = f.read().decode('utf-8', errors='ignore').strip().replace('\x00', '').strip()
                            pathnames[m.name.split('/')[0]] = raw
                print("All PNG files in unitypackage:")
                for guid, p in sorted(pathnames.items(), key=lambda x: x[1]):
                    if p.lower().endswith('.png'):
                        print("  ", p)
