import zipfile
import tarfile
import os
import io

src = r"C:\Users\abdel\OneDrive\Desktop\New folder\1776846603480-930518877-nature_pixels_v2___top_down_pixel_art_asset_pack___8211____nature_pixels_v2___vip.zip"
with zipfile.ZipFile(src, 'r') as z:
    for n in z.namelist():
        if n.endswith('.unitypackage'):
            print(f"Found unitypackage: {n}")
            data = z.read(n)
            with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as tar:
                members = tar.getmembers()
                print(f"Unitypackage contains {len(members)} entries")
                # Look for pathname files
                pathnames = {}
                for m in members:
                    if m.name.endswith('/pathname'):
                        f = tar.extractfile(m)
                        if f:
                            pathnames[m.name.split('/')[0]] = f.read().decode('utf-8', errors='ignore').strip()
                print(f"Found {len(pathnames)} named assets:")
                for guid, p in sorted(pathnames.items(), key=lambda x: x[1])[:25]:
                    print("  ", p)
