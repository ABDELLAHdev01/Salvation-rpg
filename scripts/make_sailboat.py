from PIL import Image, ImageDraw

# Create a crisp, beautiful 48x48 pixel-art sailboat / sloop
w, h = 48, 48
im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
draw = ImageDraw.Draw(im)

# 1. Timber Hull (curved boat shape at y=28..42)
# Keel / base
draw.polygon([
    (8, 32), (12, 42), (36, 42), (40, 32), (44, 28), (4, 28)
], fill=(139, 90, 43, 255), outline=(92, 58, 26, 255))

# Hull planking lines
draw.line([(6, 32), (42, 32)], fill=(115, 72, 32, 255))
draw.line([(10, 37), (38, 37)], fill=(100, 60, 25, 255))

# Deck railing / gunwale
draw.line([(4, 28), (44, 28)], fill=(175, 120, 65, 255))

# 2. Wooden Mast (center at x=23..25, y=6..34)
draw.rectangle([23, 6, 25, 34], fill=(110, 70, 30, 255), outline=(75, 45, 18, 255))

# Mast crossbar / spar
draw.line([(14, 10), (34, 10)], fill=(90, 55, 22, 255), width=2)

# 3. Main Billowing Canvas Sail (white/cream with shadow)
# Triangle sail
draw.polygon([
    (23, 8), (23, 26), (38, 24)
], fill=(245, 242, 230, 255), outline=(200, 195, 180, 255))
# Sail shadow line
draw.line([(24, 20), (36, 23)], fill=(215, 210, 195, 255))

# Jib sail (front triangular sail)
draw.polygon([
    (21, 10), (21, 26), (8, 25)
], fill=(235, 230, 215, 255), outline=(190, 185, 170, 255))

# 4. Golden Pennant / Flag at top of mast
draw.polygon([
    (24, 4), (32, 6), (24, 8)
], fill=(234, 179, 8, 255), outline=(180, 130, 6, 255))

# 5. Brass prow lantern (x=42, y=26)
draw.rectangle([41, 25, 43, 28], fill=(251, 191, 36, 255))

# Save
dest = r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\tilesets\prop_sailboat.png"
im.save(dest)
print("Created authentic pixel-art prop_sailboat.png!")
