from PIL import Image
import os

dest = r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\tilesets"
im_map = Image.open(r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\island\island_Tiled_map.png")

# Base seamless grass from (416, 168)
base_grass = im_map.crop((416, 168, 416 + 32, 168 + 32)).convert("RGBA")
base_grass.save(os.path.join(dest, "tile_grass.png"))

# Authentic flowers from island_Tiled_map:
# Look around (460, 240) in island_Tiled_map: there are flowers!
# Let's crop a 32x32 grass patch with flowers from island_Tiled_map:
# e.g. at (520, 240)
flowers_patch = im_map.crop((512, 240, 512 + 32, 240 + 32)).convert("RGBA")
flowers_patch.save(os.path.join(dest, "tile_grass_flowers.png"))

# Tiny clovers/sprouts patch from (480, 272):
clover_patch = im_map.crop((480, 272, 480 + 32, 272 + 32)).convert("RGBA")
clover_patch.save(os.path.join(dest, "tile_grass_clovers.png"))

# Small pebble/earth detail from (448, 208):
pebble_patch = im_map.crop((448, 208, 448 + 32, 208 + 32)).convert("RGBA")
pebble_patch.save(os.path.join(dest, "tile_grass_pebbles.png"))

print("Created 4 authentic seamless grass tiles!")
