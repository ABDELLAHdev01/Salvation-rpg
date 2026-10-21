from PIL import Image

im = Image.open(r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\tilesets\home_exterior.png")
crop_bottom = im.crop((0, 860, 272, 895))
crop_bottom.save(r"C:\Users\abdel\WorkSpace\projects\Salvation-rpg\public\assets\tilesets\test_flowers_row.png")
print("Saved flowers row!")
