from PIL import Image
import os

dest_tiles = r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\tilesets"
os.makedirs(dest_tiles, exist_ok=True)

# 1. Load home_exterior.png
ext_path = os.path.join(dest_tiles, "home_exterior.png")
im_ext = Image.open(ext_path)
print("home_exterior size:", im_ext.size)

# The grass patch in home_exterior:
# Look at row 4: x=16..64, y=240..288 (48x48 rounded bush/grass patch)
# The inner color of that grass patch is the authentic palette!
# Let's inspect the center 16x16 of that grass patch:
center_grass = im_ext.crop((24, 252, 24 + 16, 252 + 16))
# Scale or tile it to 32x32 seamlessly
seamless_grass = Image.new("RGBA", (32, 32))
for i in range(2):
    for j in range(2):
        seamless_grass.paste(center_grass, (i * 16, j * 16))

# Let's save tile_grass.png (authentic warm meadow grass)
seamless_grass.save(os.path.join(dest_tiles, "tile_grass.png"))
print("Saved seamless natural tile_grass.png!")

# 2. Extract authentic cobblestone road from home_exterior (Row 2, y=176)
# Look at home_exterior around y=176:
# Cobblestone path:
# Tile at x=0, y=176: 32x32 or 48x48
path_single = im_ext.crop((0, 176, 32, 176 + 32))
path_single.save(os.path.join(dest_tiles, "tile_path.png"))
print("Saved authentic cobblestone tile_path.png!")

# 3. Extract cobblestone horizontal & vertical paths
path_h = im_ext.crop((144, 176, 144 + 64, 176 + 32))
path_h.save(os.path.join(dest_tiles, "prop_path_h.png"))

path_v = im_ext.crop((232, 176, 232 + 32, 176 + 64))
path_v.save(os.path.join(dest_tiles, "prop_path_v.png"))

# 4. Extract authentic wildflowers from home_exterior bottom (y=940..960)
# Wildflower cluster 1: pink
wf_pink = im_ext.crop((40, 942, 40 + 16, 942 + 16))
wf_pink.save(os.path.join(dest_tiles, "prop_flower_pink.png"))

# Wildflower cluster 2: yellow buttercups
wf_yellow = im_ext.crop((88, 942, 88 + 16, 942 + 16))
wf_yellow.save(os.path.join(dest_tiles, "prop_flower_yellow.png"))

# Wildflower cluster 3: orange lilies
wf_orange = im_ext.crop((128, 942, 128 + 16, 942 + 16))
wf_orange.save(os.path.join(dest_tiles, "prop_flower_orange.png"))

# Grass tuft sprout
wf_tuft = im_ext.crop((208, 942, 208 + 16, 942 + 16))
wf_tuft.save(os.path.join(dest_tiles, "prop_grass_tuft.png"))

# Create tile_grass_flowers by pasting yellow & pink flowers onto seamless grass
tile_grass_flowers = seamless_grass.copy()
tile_grass_flowers.paste(wf_yellow, (8, 8), wf_yellow)
tile_grass_flowers.save(os.path.join(dest_tiles, "tile_grass_flowers.png"))

# Create tile_grass_clovers with grass tuft
tile_grass_clovers = seamless_grass.copy()
tile_grass_clovers.paste(wf_tuft, (6, 8), wf_tuft)
tile_grass_clovers.save(os.path.join(dest_tiles, "tile_grass_clovers.png"))

# Create tile_grass_pebbles with soft subtle earth details
tile_grass_pebbles = seamless_grass.copy()
tile_grass_pebbles.paste(wf_orange, (10, 10), wf_orange)
tile_grass_pebbles.save(os.path.join(dest_tiles, "tile_grass_pebbles.png"))

# 5. Extract Pumpkin Scarecrow, Water Well, Red Mushrooms, Stumps
scarecrow = im_ext.crop((16, 640, 16 + 48, 640 + 64))
scarecrow.save(os.path.join(dest_tiles, "prop_scarecrow.png"))

water_well = im_ext.crop((64, 592, 64 + 48, 592 + 48))
water_well.save(os.path.join(dest_tiles, "prop_water_well.png"))

red_mushroom = im_ext.crop((72, 648, 72 + 32, 648 + 48))
red_mushroom.save(os.path.join(dest_tiles, "prop_red_mushroom.png"))

print("Extracted all natural world tiles and props successfully!")
