from PIL import Image
import os

dest = r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\tilesets"
im = Image.open(os.path.join(dest, "home_exterior.png"))

# Pumpkin scarecrow
im.crop((16, 570, 16 + 52, 570 + 64)).save(os.path.join(dest, "prop_scarecrow.png"))

# Giant red mushroom
im.crop((74, 575, 74 + 36, 575 + 45)).save(os.path.join(dest, "prop_red_mushroom.png"))

# Water well with grassy fringe
im.crop((58, 528, 58 + 42, 528 + 44)).save(os.path.join(dest, "prop_water_well.png"))

# Timber crates
im.crop((116, 532, 116 + 28, 532 + 40)).save(os.path.join(dest, "prop_crates.png"))

# Tree stump
im.crop((168, 620, 168 + 18, 620 + 26)).save(os.path.join(dest, "prop_stump.png"))

# Boulders with grassy roots
im.crop((18, 510, 18 + 26, 510 + 20)).save(os.path.join(dest, "prop_rock_moss1.png"))
im.crop((52, 510, 52 + 28, 510 + 20)).save(os.path.join(dest, "prop_rock_moss2.png"))

print("Extracted farm props cleanly!")
