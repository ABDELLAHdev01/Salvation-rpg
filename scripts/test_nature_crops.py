from PIL import Image
import os

nature_path = r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\nature_pixels\Nature.png"
im = Image.open(nature_path)
print("Nature.png size:", im.size)

# Let's crop various 32x32 tiles and save them to inspect
out_dir = r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\tilesets\test_crops"
os.makedirs(out_dir, exist_ok=True)

# In Nature.png (304x128):
# Large grass patch on the right: from x=176, y=0 to x=288, y=128
# Let's see the center of that large grass patch:
# e.g. x=200..232, y=32..64
crop_grass = im.crop((192, 16, 192 + 32, 16 + 32))
crop_grass.save(os.path.join(out_dir, "grass_center1.png"))

crop_grass2 = im.crop((208, 32, 208 + 32, 32 + 32))
crop_grass2.save(os.path.join(out_dir, "grass_center2.png"))

# Small grass patch at x=64, y=80
crop_grass3 = im.crop((56, 72, 56 + 32, 72 + 32))
crop_grass3.save(os.path.join(out_dir, "grass_center3.png"))

# Flowers and details in Nature.png:
# at y=64..128, x=130..176
crop_flowers = im.crop((136, 96, 136 + 32, 96 + 32))
crop_flowers.save(os.path.join(out_dir, "flowers1.png"))

# Stepping stones at x=104, y=104
crop_stepping = im.crop((104, 104, 104 + 32, 104 + 24))
crop_stepping.save(os.path.join(out_dir, "stepping_stones.png"))

print("Saved test crops!")
