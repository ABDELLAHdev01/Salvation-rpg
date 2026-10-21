from PIL import Image
import os

ext = Image.open(r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\tilesets\home_exterior.png")

# Let's inspect rows around y=170..240
# The path has:
# block 1: x=24..72, y=176..224 (48x48)
# horizontal: x=144..208, y=176..208
# vertical: x=232..264, y=176..224
p1 = ext.crop((24, 176, 24 + 48, 176 + 48))
p1.save(r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\tilesets\test_p1.png")

ph = ext.crop((144, 176, 144 + 64, 176 + 32))
ph.save(r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\tilesets\test_ph.png")

pv = ext.crop((232, 176, 232 + 32, 176 + 64))
pv.save(r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\tilesets\test_pv.png")

print("Cropped paths!")
