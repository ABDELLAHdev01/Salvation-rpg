from PIL import Image
import os

r5 = Image.open(r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\roads\Road5_grass.png")
print("Road5_grass size:", r5.size)

# The TSX said tilewidth=16, tileheight=16, columns=15 (240x416)
# That means 2x2 16x16 tiles = 32x32 tile!
# Top-left circle is 48x48 (3x3 16x16 tiles): from (0, 0) to (48, 48)
# Center road tile (solid cobblestones):
# Let's see: tile at x=16..48, y=16..48
center_cobble = r5.crop((16, 16, 48, 48))
center_cobble.save(r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\tilesets\tile_path.png")

# Let's save a horizontal road segment (32x32)
# At row 3 or bottom row:
# Look at the bottom strip: x=16..112, y=368..400
road_h = r5.crop((16, 368, 16 + 64, 368 + 32))
road_h.save(r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\tilesets\prop_road_cobble_h.png")

# Vertical road segment (32x64):
road_v = r5.crop((208, 176, 208 + 32, 176 + 64))
road_v.save(r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\tilesets\prop_road_cobble_v.png")

# Crossroads / Plaza intersection (48x48):
road_cross = r5.crop((144, 160, 144 + 48, 160 + 48))
road_cross.save(r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\tilesets\prop_road_cross.png")

print("Saved cobblestone road tiles!")
