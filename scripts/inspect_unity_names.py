import zipfile, tarfile, os, io
src = r"C:\Users\abdel\OneDrive\Desktop\New folder\1776846603480-930518877-nature_pixels_v2___top_down_pixel_art_asset_pack___8211____nature_pixels_v2___vip.zip"
with zipfile.ZipFile(src, 'r') as z:
    for n in z.namelist():
        if n.endswith('.unitypackage'):
            data = z.read(n)
            with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as tar:
                names = [m.name for m in tar.getmembers()]
                print("Total members:", len(names))
                print("Sample member names:", names[:20])
