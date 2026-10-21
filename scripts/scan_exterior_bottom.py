from PIL import Image

im = Image.open(r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\tilesets\home_exterior.png")
w, h = im.size
print("Width:", w, "Height:", h)

# Scan bottom 150 rows
for y in range(h - 150, h, 10):
    row_pixels = [im.getpixel((x, y))[3] for x in range(w)]
    non_zero = sum(1 for a in row_pixels if a > 0)
    print(f"y={y}: {non_zero} non-zero alpha pixels")
