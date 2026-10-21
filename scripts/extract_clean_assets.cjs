const fs = require('fs');
const path = require('path');
const sharp = require('../node_modules/sharp');

async function run() {
  const root = path.resolve(__dirname, '..');
  const srcCraftpixHome = path.join(root, 'assets_source/craftpix-net-654184-main-characters-home-free-top-down-pixel-art-asset/PNG');
  const srcWorkshop = path.join(root, 'assets_source/craftpix-net-692491-free-glassblowers-workshop-top-down-pixel-art-asset/PNG');
  const srcNature = path.join(root, 'assets_source/nature_pixels_extracted/Assets');
  const srcRoads = path.join(root, 'assets_source/craftpix-net-574220-free-path-and-road-top-down-pixel-tileset/PNG_Tiled');
  const srcDungeon = path.join(root, 'assets_source/craftpix-net-169442-free-2d-top-down-pixel-dungeon-asset-pack/PNG');
  const outDir = path.join(root, 'public/assets/tilesets');

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log('1. Extracting Cottage Interior assets...');
  // Parquet floor
  await sharp(path.join(srcCraftpixHome, 'walls_floor.png'))
    .extract({ left: 112, top: 64, width: 32, height: 32 })
    .toFile(path.join(outDir, 'tile_cottage_floor.png'));

  // Cottage Stone Wall with skirting
  await sharp(path.join(srcCraftpixHome, 'walls_floor.png'))
    .extract({ left: 0, top: 96, width: 32, height: 32 })
    .toFile(path.join(outDir, 'tile_cottage_wall.png'));

  // Cottage Doorway (Arched wooden door)
  await sharp(path.join(srcCraftpixHome, 'walls_floor.png'))
    .extract({ left: 112, top: 88, width: 32, height: 40 })
    .toFile(path.join(outDir, 'prop_cottage_doorway.png'));

  // Single Bed (Pillow & Blanket)
  await sharp(path.join(srcCraftpixHome, 'Interior.png'))
    .extract({ left: 51, top: 0, width: 23, height: 39 })
    .toFile(path.join(outDir, 'prop_cottage_single_bed.png'));

  // Copy single bed as prop_cottage_bed so it overrides the slatted frame!
  fs.copyFileSync(path.join(outDir, 'prop_cottage_single_bed.png'), path.join(outDir, 'prop_cottage_bed.png'));

  // Round Dining Table with tea set & chairs
  await sharp(path.join(srcCraftpixHome, 'Interior.png'))
    .extract({ left: 21, top: 146, width: 39, height: 55 })
    .toFile(path.join(outDir, 'prop_cottage_table.png'));

  // Arcane Bookshelf
  await sharp(path.join(srcCraftpixHome, 'Interior.png'))
    .extract({ left: 163, top: 81, width: 26, height: 44 })
    .toFile(path.join(outDir, 'prop_cottage_bookshelf.png'));

  // Double Bookshelf
  await sharp(path.join(srcCraftpixHome, 'Interior.png'))
    .extract({ left: 115, top: 81, width: 42, height: 44 })
    .toFile(path.join(outDir, 'prop_cottage_double_bookshelf.png'));

  // Pantry Cabinet
  await sharp(path.join(srcCraftpixHome, 'Interior.png'))
    .extract({ left: 6, top: 85, width: 51, height: 55 })
    .toFile(path.join(outDir, 'prop_cottage_cabinet.png'));

  // Alchemy Table
  await sharp(path.join(srcCraftpixHome, 'Interior.png'))
    .extract({ left: 84, top: 36, width: 26, height: 38 })
    .toFile(path.join(outDir, 'prop_cottage_alchemy.png'));

  // Nightstand
  await sharp(path.join(srcCraftpixHome, 'Interior.png'))
    .extract({ left: 86, top: 2, width: 19, height: 27 })
    .toFile(path.join(outDir, 'prop_cottage_nightstand.png'));

  // Red Rug (Fringed hearth rug)
  await sharp(path.join(srcCraftpixHome, 'Interior.png'))
    .extract({ left: 126, top: 297, width: 52, height: 62 })
    .toFile(path.join(outDir, 'prop_cottage_red_rug.png'));

  // Starry Rug
  await sharp(path.join(srcCraftpixHome, 'Interior.png'))
    .extract({ left: 12, top: 280, width: 90, height: 79 })
    .toFile(path.join(outDir, 'prop_cottage_rug.png'));

  // Potted Houseplant
  await sharp(path.join(srcCraftpixHome, 'Interior.png'))
    .extract({ left: 39, top: 370, width: 18, height: 16 })
    .toFile(path.join(outDir, 'prop_cottage_plant.png'));

  console.log('2. Extracting Fireplace / Kiln Hearth...');
  // Frame 1 of Forge.png: Frame width 64, height 96.
  // The kiln itself is centered: left: 8, top: 12, width: 48, height: 76
  await sharp(path.join(srcWorkshop, 'Forge.png'))
    .extract({ left: 8, top: 12, width: 48, height: 76 })
    .toFile(path.join(outDir, 'prop_cottage_fireplace.png'));

  // Blacksmith Artisan Forge
  await sharp(path.join(srcWorkshop, 'Forge.png'))
    .extract({ left: 72, top: 12, width: 48, height: 76 })
    .toFile(path.join(outDir, 'prop_artisan_forge.png'));

  console.log('3. Extracting Seamless Cavern Floor...');
  // Create a clean, rich, seamless dark cavern stone floor tile
  // 32x32 dark stone with subtle mineral texture
  const stoneData = Buffer.alloc(32 * 32 * 4);
  const baseR = 34, baseG = 38, baseB = 48; // Deep cavern slate
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const idx = (y * 32 + x) * 4;
      // Perlin-like pseudo noise with stone grain
      const n1 = Math.sin(x * 0.45) * Math.cos(y * 0.45) * 6;
      const n2 = Math.sin((x + y) * 0.8) * 4;
      const n3 = ((x * 17 + y * 31) % 7) - 3;
      // Subtle mortar lines every 16px
      const isMortar = (x % 16 === 0) || (y % 16 === 0);
      const shade = isMortar ? -10 : Math.round(n1 + n2 + n3);

      stoneData[idx] = Math.max(18, Math.min(65, baseR + shade));
      stoneData[idx + 1] = Math.max(20, Math.min(70, baseG + shade));
      stoneData[idx + 2] = Math.max(28, Math.min(85, baseB + shade + 4));
      stoneData[idx + 3] = 255;
    }
  }
  await sharp(stoneData, { raw: { width: 32, height: 32, channels: 4 } })
    .toFile(path.join(outDir, 'tile_dungeon_floor.png'));

  console.log('4. Copying Village & Nature Props...');
  const npHouseDir = path.join(srcNature, 'Nature Pixels V2/Assets/House');
  if (fs.existsSync(npHouseDir)) {
    fs.copyFileSync(path.join(npHouseDir, 'House1.png'), path.join(outDir, 'prop_village_house1.png'));
    fs.copyFileSync(path.join(npHouseDir, 'House2.png'), path.join(outDir, 'prop_village_house2.png'));
    fs.copyFileSync(path.join(npHouseDir, 'House3.png'), path.join(outDir, 'prop_village_house3.png'));
  }

  const npRocksDir = path.join(srcNature, 'Nature Pixels V2/Assets/Rocks and Chest');
  if (fs.existsSync(npRocksDir)) {
    fs.copyFileSync(path.join(npRocksDir, 'Chest/GoldenChest/1.png'), path.join(outDir, 'prop_chest_gold.png'));
    fs.copyFileSync(path.join(npRocksDir, 'Chest/IronChest/1.png'), path.join(outDir, 'prop_chest_iron.png'));
    fs.copyFileSync(path.join(npRocksDir, 'MagicStoons/MagicStones1.png'), path.join(outDir, 'prop_magic_stones1.png'));
    fs.copyFileSync(path.join(npRocksDir, 'MagicStoons/MagicStones2.png'), path.join(outDir, 'prop_magic_stones2.png'));
    fs.copyFileSync(path.join(npRocksDir, 'MagicStoons/MagicStones3.png'), path.join(outDir, 'prop_magic_stones3.png'));
  }

  // Extract from Nature.png (Pond dock and mushrooms/flowers)
  const natureTiles = path.join(srcNature, 'Nature Pixels V2/Assets/Tiles/Nature.png');
  if (fs.existsSync(natureTiles)) {
    // Dock / Bridge (x=160, y=0, w=32, h=64)
    await sharp(natureTiles)
      .extract({ left: 160, top: 0, width: 32, height: 64 })
      .toFile(path.join(outDir, 'prop_wood_dock.png'));

    // Red Mushrooms
    await sharp(natureTiles)
      .extract({ left: 80, top: 56, width: 16, height: 16 })
      .toFile(path.join(outDir, 'prop_wild_mushrooms.png'));

    // Wildflower blossom patch
    await sharp(natureTiles)
      .extract({ left: 88, top: 72, width: 16, height: 16 })
      .toFile(path.join(outDir, 'prop_wildflowers.png'));
  }

  console.log('5. Extracting Forest Trees & Details from CraftPix Exterior...');
  const extPng = path.join(srcCraftpixHome, 'exterior.png');
  // Large Oak Tree: x=120, y=100, w=48, h=56
  await sharp(extPng)
    .extract({ left: 120, top: 100, width: 48, height: 56 })
    .toFile(path.join(outDir, 'prop_tree_oak.png'));

  // Apple Tree: x=0, y=180, w=48, h=56
  await sharp(extPng)
    .extract({ left: 0, top: 180, width: 48, height: 56 })
    .toFile(path.join(outDir, 'prop_tree_apple.png'));

  // Pine / Round Bush: x=144, y=200, w=32, h=36
  await sharp(extPng)
    .extract({ left: 144, top: 200, width: 32, height: 36 })
    .toFile(path.join(outDir, 'prop_tree_pine.png'));

  // Tree Stump
  await sharp(extPng)
    .extract({ left: 72, top: 352, width: 24, height: 20 })
    .toFile(path.join(outDir, 'prop_tree_stump.png'));

  // Fallen Log
  await sharp(extPng)
    .extract({ left: 64, top: 368, width: 32, height: 16 })
    .toFile(path.join(outDir, 'prop_tree_log.png'));

  // Granite Boulder
  await sharp(extPng)
    .extract({ left: 48, top: 384, width: 36, height: 38 })
    .toFile(path.join(outDir, 'prop_granite_boulder.png'));

  console.log('All clean assets extracted successfully!');
}

run().catch(console.error);
