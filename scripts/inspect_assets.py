import os
import zipfile

folder = r"C:\Users\abdel\OneDrive\Desktop\New folder"
for fname in sorted(os.listdir(folder)):
    if not fname.endswith('.zip'):
        continue
    fpath = os.path.join(folder, fname)
    print(f"\n==========================================")
    print(f"ZIP: {fname}")
    print(f"==========================================")
    try:
        with zipfile.ZipFile(fpath, 'r') as z:
            names = [n for n in z.namelist() if not n.startswith('__MACOSX')]
            # Print directory summary and first 25 non-dir files
            dirs = set(os.path.dirname(n) for n in names if n.endswith('/'))
            print("Directories:", sorted(list(dirs))[:10])
            files = [n for n in names if not n.endswith('/')]
            print(f"Total non-dir files: {len(files)}")
            for f in files[:20]:
                print("  ", f)
            if len(files) > 20:
                print(f"  ... and {len(files)-20} more")
    except Exception as e:
        print("Error:", e)
