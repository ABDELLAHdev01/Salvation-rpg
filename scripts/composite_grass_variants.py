from PIL import Image
import os

dest = r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\tilesets"
base_grass = Image.open(os.path.join(dest, "tile_grass.png")).convert("RGBA")

# Load wildflowers
wf_y = Image.open(os.path.join(dest, "prop_flower_yellow.png")).convert("RGBA")
wf_p = Image.open(os.path.join(dest, "prop_flower_pink.png")).convert("RGBA")
wf_t = Image.open(os.path.join(dest, "prop_grass_tuft.png")).convert("RGBA")
wf_o = Image.open(os.path.join(dest, "prop_flower_orange.png")).convert("RGBA")

# 1. Flowers variant
tg_flowers = base_grass.copy()
tg_flowers.paste(wf_y, (6, 8), wf_y)
tg_flowers.paste(wf_p, (18, 14), wf_p)
tg_flowers.save(os.path.join(dest, "tile_grass_flowers.png"))

# 2. Clovers/Tuft variant
tg_clovers = base_grass.copy()
tg_clovers.paste(wf_t, (8, 8), wf_t)
tg_clovers.save(os.path.join(dest, "tile_grass_clovers.png"))

# 3. Orange wildflowers / pebble variant
tg_pebbles = base_grass.copy()
tg_pebbles.paste(wf_o, (10, 10), wf_o)
tg_pebbles.save(os.path.join(dest, "tile_grass_pebbles.png"))

print("Composited grass variants cleanly!")
