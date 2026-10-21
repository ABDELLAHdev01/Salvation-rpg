from PIL import Image

im = Image.open(r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\tilesets\home_exterior.png")
# Scan rows 500..650
crop = im.crop((0, 500, 272, 650))
crop.save(r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\tilesets\test_mid_row.png")
print("Saved mid row!")
