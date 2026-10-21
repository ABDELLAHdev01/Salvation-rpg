from PIL import Image
import os

dest = r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\tilesets"
im_ext = Image.open(os.path.join(dest, "home_exterior.png"))
base_grass = Image.open(os.path.join(dest, "tile_grass.png")).convert("RGBA")

# Extract separate flower props
flower_pink = im_ext.crop((44, 862, 44 + 24, 862 + 30))
flower_pink.save(os.path.join(dest, "prop_flower_pink.png"))

flower_yellow = im_ext.crop((74, 862, 74 + 36, 862 + 30))
flower_yellow.save(os.path.join(dest, "prop_flower_yellow.png"))

flower_orange = im_ext.crop((116, 862, 116 + 32, 862 + 30))
flower_orange.save(os.path.join(dest, "prop_flower_orange.png"))

grass_tuft = im_ext.crop((195, 865, 195 + 24, 865 + 24))
grass_tuft.save(os.path.join(dest, "prop_grass_tuft.png"))

grass_bush = im_ext.crop((225, 862, 225 + 36, 862 + 30))
grass_bush.save(os.path.join(dest, "prop_grass_bush.png"))

# Composite grass variants
# 1. Yellow & pink flowers
tg_flowers = base_grass.copy()
# Paste small flowers
f_y_small = im_ext.crop((78, 866, 78 + 14, 866 + 14))
f_p_small = im_ext.crop((56, 866, 56 + 12, 866 + 14))
tg_flowers.paste(f_y_small, (4, 10), f_y_small)
tg_flowers.paste(f_p_small, (18, 6), f_p_small)
tg_flowers.save(os.path.join(dest, "tile_grass_flowers.png"))

# 2. Clovers variant
tg_clovers = base_grass.copy()
c_small = im_ext.crop((198, 868, 198 + 16, 868 + 16))
tg_clovers.paste(c_small, (8, 8), c_small)
tg_clovers.save(os.path.join(dest, "tile_grass_clovers.png"))

# 3. Orange wildflowers variant
tg_pebbles = base_grass.copy()
o_small = im_ext.crop((122, 866, 122 + 14, 866 + 14))
tg_pebbles.paste(o_small, (10, 8), o_small)
tg_pebbles.save(os.path.join(dest, "tile_grass_pebbles.png"))

print("Extracted flower props and composite grass variants successfully!")
