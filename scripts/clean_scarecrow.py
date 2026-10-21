from PIL import Image
import os

dest = r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\tilesets"
im = Image.open(os.path.join(dest, "home_exterior.png"))
# Just the scarecrow head and body
im.crop((16, 600, 16 + 52, 600 + 48)).save(os.path.join(dest, "prop_scarecrow.png"))
print("Done!")
