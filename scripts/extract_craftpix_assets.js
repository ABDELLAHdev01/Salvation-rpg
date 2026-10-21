import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function main() {
  console.log('--- STARTING CRAFTPIX ASSET EXTRACTION PIPELINE ---');

  // Ensure target directories exist
  const dirs = [
    'public/assets/items/potions',
    'public/assets/enemies',
    'public/assets/props/farm_animals',
    'public/assets/tilesets/cottage',
    'public/assets/tilesets/dungeon',
    'public/assets/tilesets/trees',
    'public/assets/tilesets/roads',
    'public/assets/tilesets/workshop',
    'public/assets/ui/guild',
  ];
  for (const d of dirs) {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  }

  // 1. EXTRACT POTIONS (48 Clean 32x32 transparent icons)
  console.log('1. Extracting Magic Potions...');
  const potionSrc = 'assets_source/craftpix-net-128598-free-magic-potions-pixel-art-icons/PNG/Transperent';
  if (fs.existsSync(potionSrc)) {
    const files = fs.readdirSync(potionSrc).filter(f => f.endsWith('.png'));
    for (const f of files) {
      fs.copyFileSync(path.join(potionSrc, f), path.join('public/assets/items/potions', f));
    }
    // Also copy key potions into public/assets/items for standard items
    // Icon1: Crimson Healing Elixir
    fs.copyFileSync(path.join(potionSrc, 'Icon1.png'), 'public/assets/items/potion_health.png');
    // Icon2: Greater Healing Draught
    fs.copyFileSync(path.join(potionSrc, 'Icon2.png'), 'public/assets/items/potion_health_greater.png');
    // Icon3: Azure Mana Phial
    fs.copyFileSync(path.join(potionSrc, 'Icon3.png'), 'public/assets/items/potion_mana.png');
    // Icon4: Emerald Stamina Tonic
    fs.copyFileSync(path.join(potionSrc, 'Icon4.png'), 'public/assets/items/potion_stamina.png');
    // Icon9: Golden Sun Extract (Elixir of Life)
    fs.copyFileSync(path.join(potionSrc, 'Icon9.png'), 'public/assets/items/potion_rejuvenation.png');
    // Icon14: Berserker's Brew
    fs.copyFileSync(path.join(potionSrc, 'Icon14.png'), 'public/assets/items/potion_strength.png');
    console.log(`   Copied ${files.length} potion icons to public/assets/items/potions/`);
  }

  // 2. EXTRACT HUNT ANIMALS (Wild Boar, Fox, Deer, Hare)
  console.log('2. Extracting Animated Hunt Animals & Mobs...');
  const huntSrc = 'assets_source/craftpix-net-789196-free-top-down-hunt-animals-pixel-sprite-pack/PNG/With_Shadow';
  if (fs.existsSync(huntSrc)) {
    // Boar Walk & Attack (32x32 spritesheets)
    fs.copyFileSync(
      path.join(huntSrc, 'Boar/Boar_Walk_with_shadow.png'),
      'public/assets/enemies/boar_walk.png'
    );
    fs.copyFileSync(
      path.join(huntSrc, 'Boar/Boar_Attack_with_shadow.png'),
      'public/assets/enemies/boar_attack.png'
    );
    fs.copyFileSync(
      path.join(huntSrc, 'Boar/Boar_Death_with_shadow.png'),
      'public/assets/enemies/boar_death.png'
    );

    // Fox Walk & Idle
    fs.copyFileSync(
      path.join(huntSrc, 'Fox/Fox_walk_with_shadow.png'),
      'public/assets/enemies/fox_walk.png'
    );
    fs.copyFileSync(
      path.join(huntSrc, 'Fox/Fox_Idle_with_shadow.png'),
      'public/assets/enemies/fox_idle.png'
    );

    // Deer Walk & Idle
    fs.copyFileSync(
      path.join(huntSrc, 'Deer/Deer_Walk_with_shadow.png'),
      'public/assets/enemies/deer_walk.png'
    );
    fs.copyFileSync(
      path.join(huntSrc, 'Deer/Deer_Idle_with_shadow.png'),
      'public/assets/enemies/deer_idle.png'
    );

    console.log('   Copied Boar, Fox, and Deer spritesheets to public/assets/enemies/');
  }

  // 3. EXTRACT FARM ANIMALS (Sheep, Rooster, Bull)
  console.log('3. Extracting Farm Livestock & Ambient Companions...');
  const farmSrc = 'assets_source/craftpix-net-291971-free-top-down-animals-farm-pixel-art-sprites/PNG/With_shadow';
  if (fs.existsSync(farmSrc)) {
    fs.copyFileSync(
      path.join(farmSrc, 'Sheep_animation_with_shadow.png'),
      'public/assets/props/farm_animals/sheep_walk.png'
    );
    fs.copyFileSync(
      path.join(farmSrc, 'Rooster_animation_with_shadow.png'),
      'public/assets/props/farm_animals/rooster_walk.png'
    );
    fs.copyFileSync(
      path.join(farmSrc, 'Bull_animation_with_shadow.png'),
      'public/assets/props/farm_animals/bull_walk.png'
    );
    console.log('   Copied Sheep, Rooster, and Bull sprites to public/assets/props/farm_animals/');
  }

  // 4. EXTRACT TREES & VEGETATION
  console.log('4. Extracting High-Definition Top-Down Trees...');
  const treeSrc = 'assets_source/craftpix-net-385863-free-top-down-trees-pixel-art/PNG/Assets_separately/Trees_texture_shadow';
  if (fs.existsSync(treeSrc)) {
    const treesToCopy = [
      { src: 'Tree1.png', dest: 'tree_oak.png' },
      { src: 'Tree2.png', dest: 'tree_round.png' },
      { src: 'Tree3.png', dest: 'tree_large.png' },
      { src: 'Fruit_tree1.png', dest: 'tree_apple.png' },
      { src: 'Christmas_tree1.png', dest: 'tree_pine.png' },
      { src: 'Broken_tree1.png', dest: 'tree_stump.png' },
      { src: 'Broken_tree4.png', dest: 'tree_log.png' },
      { src: 'Moss_tree1.png', dest: 'tree_moss.png' },
    ];
    for (const t of treesToCopy) {
      const srcP = path.join(treeSrc, t.src);
      if (fs.existsSync(srcP)) {
        fs.copyFileSync(srcP, path.join('public/assets/tilesets/trees', t.dest));
      }
    }
    // Also copy primary trees into public/assets/tilesets/ for scene use
    fs.copyFileSync(path.join(treeSrc, 'Tree1.png'), 'public/assets/tilesets/prop_tree_oak.png');
    fs.copyFileSync(path.join(treeSrc, 'Christmas_tree1.png'), 'public/assets/tilesets/prop_tree_pine.png');
    fs.copyFileSync(path.join(treeSrc, 'Fruit_tree1.png'), 'public/assets/tilesets/prop_tree_apple.png');
    console.log('   Copied trees (Oak, Pine, Apple, Stump, Log, Moss) to public/assets/tilesets/trees/');
  }

  // 5. EXTRACT ROADS & COBBLESTONES
  console.log('5. Extracting Paved Road & Cobblestone Highway...');
  const roadSrc = 'assets_source/craftpix-net-574220-free-path-and-road-top-down-pixel-tileset/PNG_Tiled';
  if (fs.existsSync(roadSrc)) {
    fs.copyFileSync(path.join(roadSrc, 'Road1.png'), 'public/assets/tilesets/roads/road_cobble.png');
    fs.copyFileSync(path.join(roadSrc, 'Road2.png'), 'public/assets/tilesets/roads/road_stone.png');
    fs.copyFileSync(path.join(roadSrc, 'Road1_grass.png'), 'public/assets/tilesets/roads/road_grass_blend.png');
    // Extract a 32x32 clean cobblestone center tile for direct placement
    await sharp(path.join(roadSrc, 'Road1.png'))
      .extract({ left: 32, top: 48, width: 32, height: 32 })
      .png()
      .toFile('public/assets/tilesets/tile_cobblestone.png');
    console.log('   Extracted road tilesets and tile_cobblestone.png');
  }

  // 6. EXTRACT DUNGEON & CAVERN TILES (Walls, Floors, Torches, Chests)
  console.log('6. Extracting Deepforge Caverns Dungeon Assets...');
  const dungeonSrc = 'assets_source/craftpix-net-169442-free-2d-top-down-pixel-dungeon-asset-pack/PNG';
  if (fs.existsSync(dungeonSrc)) {
    fs.copyFileSync(path.join(dungeonSrc, 'walls_floor.png'), 'public/assets/tilesets/dungeon/walls_floor.png');
    fs.copyFileSync(path.join(dungeonSrc, 'Objects.png'), 'public/assets/tilesets/dungeon/objects.png');
    fs.copyFileSync(path.join(dungeonSrc, 'fire_animation.png'), 'public/assets/tilesets/dungeon/fire_animation.png');
    fs.copyFileSync(path.join(dungeonSrc, 'doors_lever_chest_animation.png'), 'public/assets/tilesets/dungeon/chest_door_anim.png');

    // Extract individual discrete props for Phaser:
    // Dungeon floor tile (32x32)
    await sharp(path.join(dungeonSrc, 'walls_floor.png'))
      .extract({ left: 32, top: 32, width: 32, height: 32 })
      .png()
      .toFile('public/assets/tilesets/tile_dungeon_floor.png');

    // Dungeon wall tile (32x32)
    await sharp(path.join(dungeonSrc, 'walls_floor.png'))
      .extract({ left: 0, top: 0, width: 32, height: 32 })
      .png()
      .toFile('public/assets/tilesets/tile_dungeon_wall.png');

    // Dungeon Treasure Chest (32x32)
    await sharp(path.join(dungeonSrc, 'doors_lever_chest_animation.png'))
      .extract({ left: 0, top: 64, width: 32, height: 32 })
      .png()
      .toFile('public/assets/tilesets/prop_dungeon_chest.png');

    // Dungeon Sarcophagus / Urn (32x32)
    await sharp(path.join(dungeonSrc, 'Objects.png'))
      .extract({ left: 16, top: 32, width: 32, height: 32 })
      .png()
      .toFile('public/assets/tilesets/prop_dungeon_urn.png');

    // Animated Torch (Frame 1: 16x32 scaled to 32x48)
    await sharp(path.join(dungeonSrc, 'fire_animation.png'))
      .extract({ left: 0, top: 0, width: 16, height: 32 })
      .resize(24, 48, { kernel: 'nearest' })
      .png()
      .toFile('public/assets/tilesets/prop_dungeon_torch.png');

    console.log('   Extracted dungeon floor, wall, chest, urn, and animated torch!');
  }

  // 7. EXTRACT COTTAGE & INTERIOR ASSETS (Bed, Fireplace, Rug, Table, Bookshelf, Exterior)
  console.log('7. Extracting Main Character Home & Interior Assets...');
  const homeSrc = 'assets_source/craftpix-net-654184-main-characters-home-free-top-down-pixel-art-asset/PNG';
  if (fs.existsSync(homeSrc)) {
    fs.copyFileSync(path.join(homeSrc, 'Interior.png'), 'public/assets/tilesets/cottage/interior.png');
    fs.copyFileSync(path.join(homeSrc, 'walls_floor.png'), 'public/assets/tilesets/cottage/walls_floor.png');
    fs.copyFileSync(path.join(homeSrc, 'exterior.png'), 'public/assets/tilesets/cottage/exterior.png');
    fs.copyFileSync(path.join(homeSrc, 'Smoke_animation.png'), 'public/assets/tilesets/cottage/smoke_animation.png');

    // Extract Cozy Cottage Bed (64x64 or 48x64) from Interior.png
    // In Interior.png (224x432): Bed is located at x:0, y:208, w:48, h:64
    await sharp(path.join(homeSrc, 'Interior.png'))
      .extract({ left: 0, top: 208, width: 48, height: 64 })
      .png()
      .toFile('public/assets/tilesets/prop_cottage_bed.png');

    // Extract Stone Hearth Fireplace (48x48)
    // In Interior.png: Fireplace is at x:80, y:144, w:48, h:48
    await sharp(path.join(homeSrc, 'Interior.png'))
      .extract({ left: 80, top: 144, width: 48, height: 48 })
      .png()
      .toFile('public/assets/tilesets/prop_cottage_fireplace.png');

    // Extract Dining Table with Stools (48x48)
    await sharp(path.join(homeSrc, 'Interior.png'))
      .extract({ left: 48, top: 144, width: 48, height: 48 })
      .png()
      .toFile('public/assets/tilesets/prop_cottage_table.png');

    // Extract Arcane Bookshelf (32x48)
    await sharp(path.join(homeSrc, 'Interior.png'))
      .extract({ left: 0, top: 144, width: 32, height: 48 })
      .png()
      .toFile('public/assets/tilesets/prop_cottage_bookshelf.png');

    // Extract Velvet Rug (64x48)
    await sharp(path.join(homeSrc, 'Interior.png'))
      .extract({ left: 112, top: 224, width: 64, height: 48 })
      .png()
      .toFile('public/assets/tilesets/prop_cottage_rug.png');

    // Extract Wooden Storage Cabinet / Wardrobe (32x48)
    await sharp(path.join(homeSrc, 'Interior.png'))
      .extract({ left: 144, top: 144, width: 32, height: 48 })
      .png()
      .toFile('public/assets/tilesets/prop_cottage_cabinet.png');

    // Extract Authentic Timber Parquet Floor Tile (32x32)
    await sharp(path.join(homeSrc, 'walls_floor.png'))
      .extract({ left: 32, top: 32, width: 32, height: 32 })
      .png()
      .toFile('public/assets/tilesets/tile_cottage_floor.png');

    // Extract Cottage Wall Tile (32x32)
    await sharp(path.join(homeSrc, 'walls_floor.png'))
      .extract({ left: 0, top: 0, width: 32, height: 32 })
      .png()
      .toFile('public/assets/tilesets/tile_cottage_wall.png');

    // Extract Manor House Exterior (112x128)
    await sharp(path.join(homeSrc, 'exterior.png'))
      .extract({ left: 16, top: 16, width: 112, height: 128 })
      .png()
      .toFile('public/assets/tilesets/prop_manor_house.png');

    console.log('   Extracted cottage bed, fireplace, table, bookshelf, rug, cabinet, floor, wall, and manor exterior!');
  }

  // 8. EXTRACT FORGE & WORKSHOP (Blacksmith Kiln, Anvil, Master Artisan, Merchant Seller)
  console.log('8. Extracting Blacksmith Forge & Artisan Workshop Assets...');
  const forgeSrc = 'assets_source/craftpix-net-692491-free-glassblowers-workshop-top-down-pixel-art-asset/PNG';
  if (fs.existsSync(forgeSrc)) {
    fs.copyFileSync(path.join(forgeSrc, 'Forge.png'), 'public/assets/tilesets/workshop/forge_anim.png');
    fs.copyFileSync(path.join(forgeSrc, 'Seller.png'), 'public/assets/tilesets/workshop/seller_anim.png');
    fs.copyFileSync(path.join(forgeSrc, 'Master_Idle.png'), 'public/assets/tilesets/workshop/master_idle.png');
    fs.copyFileSync(path.join(forgeSrc, 'Interior_objects.png'), 'public/assets/tilesets/workshop/interior_objects.png');

    // Extract Forge Kiln (64x64)
    await sharp(path.join(forgeSrc, 'Forge.png'))
      .extract({ left: 0, top: 0, width: 64, height: 64 })
      .png()
      .toFile('public/assets/tilesets/prop_artisan_forge.png');

    // Extract Master Blacksmith NPC frame (32x48)
    await sharp(path.join(forgeSrc, 'Master_Idle.png'))
      .extract({ left: 0, top: 0, width: 48, height: 48 })
      .png()
      .toFile('public/assets/tilesets/npc_blacksmith.png');

    // Extract Merchant Seller NPC frame (32x32)
    await sharp(path.join(forgeSrc, 'Seller.png'))
      .extract({ left: 0, top: 0, width: 32, height: 32 })
      .png()
      .toFile('public/assets/tilesets/npc_merchant.png');

    console.log('   Extracted artisan forge kiln, blacksmith master NPC, and merchant seller NPC!');
  }

  // 9. EXTRACT HERALDRY GUILD CRESTS
  console.log('9. Extracting Adventurers Guild Heraldry Crests...');
  const heraldrySrc = 'assets_source/craftpix-net-716070-free-heraldry-constructor-pixel-art/1 Division of the field/32x32';
  if (fs.existsSync(heraldrySrc)) {
    fs.copyFileSync(path.join(heraldrySrc, 'Division32_01.png'), 'public/assets/ui/guild/crest_copper.png');
    fs.copyFileSync(path.join(heraldrySrc, 'Division32_03.png'), 'public/assets/ui/guild/crest_iron.png');
    fs.copyFileSync(path.join(heraldrySrc, 'Division32_05.png'), 'public/assets/ui/guild/crest_silver.png');
    fs.copyFileSync(path.join(heraldrySrc, 'Division32_07.png'), 'public/assets/ui/guild/crest_gold.png');
    fs.copyFileSync(path.join(heraldrySrc, 'Division32_10.png'), 'public/assets/ui/guild/crest_mithril.png');
    console.log('   Extracted 5 Guild rank crests (Copper, Iron, Silver, Gold, Mithril)!');
  }

  console.log('--- ALL CRAFTPIX ASSETS EXTRACTED & STANDARDIZED SUCCESSFULLY! ---');
}

main().catch(console.error);
