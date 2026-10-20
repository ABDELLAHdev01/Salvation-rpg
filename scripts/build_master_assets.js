import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Helper to create RGBA buffer from pixel grid
function createPixelBuffer(width, height) {
  const buf = Buffer.alloc(width * height * 4, 0); // Transparent black
  return {
    buf,
    width,
    height,
    set(x, y, r, g, b, a = 255) {
      if (x < 0 || x >= width || y < 0 || y >= height) return;
      const idx = (y * width + x) * 4;
      buf[idx] = r;
      buf[idx + 1] = g;
      buf[idx + 2] = b;
      buf[idx + 3] = a;
    },
    rect(x, y, w, h, r, g, b, a = 255) {
      for (let py = y; py < y + h; py++) {
        for (let px = x; px < x + w; px++) {
          this.set(px, py, r, g, b, a);
        }
      }
    },
    ellipse(cx, cy, rx, ry, r, g, b, a = 255) {
      for (let py = Math.floor(cy - ry); py <= Math.ceil(cy + ry); py++) {
        for (let px = Math.floor(cx - rx); px <= Math.ceil(cx + rx); px++) {
          const dx = (px - cx) / rx;
          const dy = (py - cy) / ry;
          if (dx * dx + dy * dy <= 1) {
            this.set(px, py, r, g, b, a);
          }
        }
      }
    },
    async save(filePath) {
      await sharp(this.buf, { raw: { width: this.width, height: this.height, channels: 4 } })
        .png()
        .toFile(filePath);
    }
  };
}

// Hex color to RGB
function _hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  if (clean.length === 6) {
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  }
  return [255, 255, 255];
}

async function buildTerrainTiles() {
  const dir = 'public/assets/tilesets';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  console.log('Building terrain tiles...');

  // 1. Authentic Smooth RPG Meadow Grass from assets (Kenney CC0 - Darker tone)
  if (fs.existsSync(path.join(dir, 'RPGpack_sheet.png'))) {
    await sharp(path.join(dir, 'RPGpack_sheet.png'))
      .extract({ left: 3 * 64, top: 2 * 64, width: 64, height: 64 })
      .resize(32, 32, { kernel: 'lanczos3' })
      .linear(0.80, 0)
      .png()
      .toFile(path.join(dir, 'tile_grass.png'));
  } else {
    const grass = createPixelBuffer(32, 32);
    grass.rect(0, 0, 32, 32, 112, 156, 41); // Richer meadow green base
    for (let y = 0; y < 32; y += 4) {
      for (let x = 0; x < 32; x += 4) {
        const v = (x * 7 + y * 13) % 4;
        if (v === 0) grass.rect(x, y, 2, 2, 133, 189, 47);
        else if (v === 1) grass.rect(x + 1, y + 1, 2, 1, 148, 203, 59);
      }
    }
    await grass.save(path.join(dir, 'tile_grass.png'));
  }

  // 2. Cobblestone / Dirt Path Tile (32x32)
  if (fs.existsSync(path.join(dir, 'RPGpack_sheet.png'))) {
    await sharp(path.join(dir, 'RPGpack_sheet.png'))
      .extract({ left: 8 * 64, top: 1 * 64, width: 64, height: 64 })
      .resize(32, 32, { kernel: 'lanczos3' })
      .png()
      .toFile(path.join(dir, 'tile_path.png'));
  } else {
    const pathTile = createPixelBuffer(32, 32);
    pathTile.rect(0, 0, 32, 32, 193, 140, 90); // Earth brown dirt
    await pathTile.save(path.join(dir, 'tile_path.png'));
  }

  // 3. Deep Cavern Stone Tile (32x32)
  if (fs.existsSync(path.join(dir, 'RPGpack_sheet.png'))) {
    await sharp(path.join(dir, 'RPGpack_sheet.png'))
      .extract({ left: 10 * 64, top: 7 * 64, width: 64, height: 64 })
      .resize(32, 32, { kernel: 'lanczos3' })
      .png()
      .toFile(path.join(dir, 'tile_stone.png'));
  } else {
    const stone = createPixelBuffer(32, 32);
    stone.rect(0, 0, 32, 32, 96, 96, 96); // Slate grey
    await stone.save(path.join(dir, 'tile_stone.png'));
  }

  // 4. Rich Tilled Farm Soil Tile (32x32)
  const soil = createPixelBuffer(32, 32);
  soil.rect(0, 0, 32, 32, 60, 32, 14); // Dark humus base
  for (let y = 3; y < 30; y += 7) {
    soil.rect(2, y, 28, 4, 108, 58, 26); // Raised ridge
    soil.rect(2, y, 28, 1, 135, 75, 35); // Sun-warmed crest
    soil.rect(2, y + 4, 28, 2, 44, 22, 9); // Shadow furrow
    soil.rect(6, y + 2, 2, 2, 44, 22, 9); // Moist clod
    soil.rect(20, y + 1, 2, 2, 44, 22, 9);
  }
  await soil.save(path.join(dir, 'tile_soil.png'));

  // 5. Shimmering Water Tile (32x32)
  if (fs.existsSync(path.join(dir, 'RPGpack_sheet.png'))) {
    await sharp(path.join(dir, 'RPGpack_sheet.png'))
      .extract({ left: 13 * 64, top: 1 * 64, width: 64, height: 64 })
      .resize(32, 32, { kernel: 'lanczos3' })
      .png()
      .toFile(path.join(dir, 'tile_water.png'));
  } else {
    const water = createPixelBuffer(32, 32);
    water.rect(0, 0, 32, 32, 104, 198, 206); // Azure water
    await water.save(path.join(dir, 'tile_water.png'));
  }

  console.log('Terrain tiles built.');
}

async function buildProps() {
  const dir = 'public/assets/tilesets';

  console.log('Building high-definition props...');

  // 1. Manor House Sprite (96x80)
  const house = createPixelBuffer(96, 80);
  // Ground Shadow
  house.ellipse(48, 76, 44, 4, 0, 0, 0, 90);
  // Stone Foundation
  house.rect(10, 68, 76, 8, 75, 85, 99);
  house.rect(10, 68, 76, 1, 107, 114, 128); // Foundation cap
  // Heavy Timber Wall
  house.rect(12, 32, 72, 36, 146, 64, 14); // Warm timber
  house.rect(14, 34, 68, 32, 180, 83, 9);
  // Vertical timber beams
  for (let x = 14; x <= 80; x += 16) {
    house.rect(x, 32, 3, 36, 92, 40, 8); // Dark posts
  }
  // Gabled Shingled Red Roof
  for (let i = 0; i < 32; i++) {
    const w = 92 - i * 2.8;
    const x = 48 - w / 2;
    const y = 32 - i;
    if (y >= 4) {
      const col = (i % 3 === 0) ? [185, 28, 28] : [153, 27, 27];
      house.rect(Math.round(x), y, Math.round(w), 1, col[0], col[1], col[2]);
    }
  }
  // Roof overhang eaves trim
  house.rect(2, 31, 92, 3, 127, 29, 29);
  house.rect(2, 34, 92, 1, 69, 10, 10);
  // Brick Chimney with smoke top
  house.rect(70, 6, 10, 18, 120, 53, 15);
  house.rect(69, 5, 12, 3, 75, 85, 99); // Chimney stone rim
  // Arched Oak Door
  house.rect(40, 46, 16, 22, 69, 26, 3);
  house.rect(42, 48, 12, 20, 120, 53, 15);
  house.rect(51, 58, 2, 2, 245, 158, 11); // Brass knob
  // Leaded Windows with Warm Golden Interior Glow
  const drawWindow = (wx, wy) => {
    house.rect(wx, wy, 14, 14, 69, 26, 3); // Frame
    house.rect(wx + 1, wy + 1, 12, 12, 254, 240, 138); // Golden glow
    house.rect(wx + 2, wy + 2, 10, 10, 250, 204, 21);
    // Window mullions cross
    house.rect(wx + 6, wy + 1, 2, 12, 120, 53, 15);
    house.rect(wx + 1, wy + 6, 12, 2, 120, 53, 15);
  };
  drawWindow(18, 44);
  drawWindow(64, 44);
  await house.save(path.join(dir, 'prop_house.png'));

  // 2. Majestic Pine Tree (48x64)
  const tree = createPixelBuffer(48, 64);
  tree.ellipse(24, 60, 18, 4, 0, 0, 0, 90); // Shadow
  // Trunk
  tree.rect(20, 40, 8, 20, 69, 26, 3);
  tree.rect(22, 42, 4, 18, 120, 53, 15);
  // Foliage Tier 3 (Bottom)
  tree.ellipse(24, 40, 18, 10, 20, 83, 45);
  tree.ellipse(24, 38, 17, 8, 22, 101, 52);
  // Foliage Tier 2 (Middle)
  tree.ellipse(24, 27, 15, 9, 22, 101, 52);
  tree.ellipse(24, 25, 14, 7, 34, 197, 94);
  // Foliage Tier 1 (Top cone)
  tree.ellipse(24, 15, 11, 8, 34, 197, 94);
  tree.ellipse(24, 13, 9, 6, 74, 222, 128); // Sunlit top
  tree.rect(23, 5, 2, 3, 74, 222, 128); // Tip
  await tree.save(path.join(dir, 'prop_tree.png'));

  // 3. Storage Vault Chest (32x32)
  const chest = createPixelBuffer(32, 32);
  chest.ellipse(16, 29, 12, 3, 0, 0, 0, 90); // Shadow
  // Mahogany chest body
  chest.rect(5, 10, 22, 18, 92, 40, 8);
  chest.rect(6, 11, 20, 16, 146, 64, 14);
  chest.rect(7, 12, 18, 14, 180, 83, 9);
  // Iron Bands
  chest.rect(5, 10, 3, 18, 63, 63, 70);
  chest.rect(24, 10, 3, 18, 63, 63, 70);
  chest.rect(5, 17, 22, 2, 63, 63, 70);
  // Brass corner studs
  chest.rect(5, 10, 2, 2, 234, 179, 8);
  chest.rect(25, 10, 2, 2, 234, 179, 8);
  chest.rect(5, 26, 2, 2, 234, 179, 8);
  chest.rect(25, 26, 2, 2, 234, 179, 8);
  // Gold Lock plate & Keyhole
  chest.rect(13, 15, 6, 6, 234, 179, 8);
  chest.rect(14, 16, 4, 4, 250, 204, 21);
  chest.rect(15, 18, 2, 2, 24, 24, 27); // Keyhole
  await chest.save(path.join(dir, 'prop_chest.png'));

  // 4. Blacksmith Forge Anvil & Workbench (32x32)
  const bench = createPixelBuffer(32, 32);
  bench.ellipse(16, 29, 12, 3, 0, 0, 0, 90); // Shadow
  // Heavy timber table
  bench.rect(4, 14, 24, 5, 120, 53, 15);
  bench.rect(4, 14, 24, 1, 180, 83, 9);
  bench.rect(6, 19, 3, 10, 69, 26, 3);
  bench.rect(23, 19, 3, 10, 69, 26, 3);
  // Solid Cast Iron Anvil
  bench.rect(10, 7, 12, 7, 63, 63, 70);
  bench.rect(10, 7, 12, 1, 113, 113, 122); // Top plate shine
  bench.rect(7, 8, 4, 3, 82, 82, 91); // Anvil horn
  bench.rect(13, 14, 6, 2, 39, 39, 42); // Base
  // Cross hammer resting on side
  bench.rect(22, 8, 2, 7, 120, 53, 15); // Wooden handle
  bench.rect(21, 7, 4, 2, 113, 113, 122); // Steel head
  await bench.save(path.join(dir, 'prop_workbench.png'));

  console.log('Props built.');
}

async function buildOreNodes() {
  const dir = 'public/assets/tilesets';

  console.log('Building mining ore boulders...');

  const createOre = (oreR, oreG, oreB, shineR, shineG, shineB) => {
    const boulder = createPixelBuffer(32, 32);
    boulder.ellipse(16, 28, 12, 4, 0, 0, 0, 90); // Shadow
    // Chiseled rock base
    boulder.rect(6, 10, 20, 16, 39, 39, 42);
    boulder.rect(7, 8, 18, 18, 63, 63, 70);
    boulder.rect(9, 10, 14, 14, 82, 82, 91);
    // Rock Facets
    boulder.rect(7, 8, 10, 2, 113, 113, 122);
    boulder.rect(7, 8, 2, 10, 113, 113, 122);
    // Embedded Ore Veins
    boulder.rect(11, 11, 6, 5, oreR, oreG, oreB);
    boulder.rect(18, 16, 6, 6, oreR, oreG, oreB);
    boulder.rect(10, 18, 5, 5, oreR, oreG, oreB);
    // Mineral Highlights
    boulder.rect(12, 12, 3, 2, shineR, shineG, shineB);
    boulder.rect(19, 17, 3, 2, shineR, shineG, shineB);
    boulder.rect(11, 19, 2, 2, shineR, shineG, shineB);
    return boulder;
  };

  await createOre(161, 161, 170, 244, 244, 245).save(path.join(dir, 'ore_iron.png'));
  await createOre(217, 119, 6, 251, 191, 36).save(path.join(dir, 'ore_copper.png'));
  await createOre(234, 179, 8, 254, 240, 138).save(path.join(dir, 'ore_gold.png'));
  await createOre(168, 85, 247, 245, 208, 254).save(path.join(dir, 'ore_crystal.png'));

  console.log('Ore nodes built.');
}

async function buildCropStages() {
  const dir = 'public/assets/tilesets';

  console.log('Building 4-stage farming crops...');

  const crops = [
    { id: 'turnip', fruitCol: [226, 232, 240], topCol: [168, 85, 247], leafCol: [34, 197, 94] },
    { id: 'wheat', fruitCol: [234, 179, 8], topCol: [250, 204, 21], leafCol: [202, 138, 4] },
    { id: 'herb', fruitCol: [52, 211, 153], topCol: [16, 185, 129], leafCol: [5, 150, 105] },
    { id: 'moonberry', fruitCol: [192, 132, 252], topCol: [147, 51, 234], leafCol: [107, 33, 168] },
    { id: 'sunroot', fruitCol: [249, 115, 22], topCol: [234, 88, 12], leafCol: [194, 65, 12] },
  ];

  for (const crop of crops) {
    for (let s = 1; s <= 4; s++) {
      const c = createPixelBuffer(32, 32);
      if (s === 1) { // Sprout
        c.rect(15, 20, 2, 7, 34, 197, 94);
        c.rect(13, 18, 2, 2, 74, 222, 128);
        c.rect(17, 18, 2, 2, 74, 222, 128);
      } else if (s === 2) { // Seedling
        c.rect(14, 16, 4, 11, crop.leafCol[0], crop.leafCol[1], crop.leafCol[2]);
        c.rect(11, 14, 3, 4, 74, 222, 128);
        c.rect(18, 14, 3, 4, 74, 222, 128);
      } else if (s === 3) { // Growing plant
        c.rect(13, 12, 6, 15, crop.leafCol[0], crop.leafCol[1], crop.leafCol[2]);
        c.rect(9, 12, 4, 6, crop.leafCol[0], crop.leafCol[1], crop.leafCol[2]);
        c.rect(19, 12, 4, 6, crop.leafCol[0], crop.leafCol[1], crop.leafCol[2]);
        c.rect(14, 17, 4, 4, crop.topCol[0], crop.topCol[1], crop.topCol[2]);
      } else { // Mature harvestable crop
        c.ellipse(16, 27, 7, 2, 0, 0, 0, 80); // Ground shadow
        c.rect(12, 8, 8, 14, crop.leafCol[0], crop.leafCol[1], crop.leafCol[2]);
        c.rect(7, 9, 5, 7, crop.leafCol[0], crop.leafCol[1], crop.leafCol[2]);
        c.rect(20, 9, 5, 7, crop.leafCol[0], crop.leafCol[1], crop.leafCol[2]);
        // Ripened fruit/root body
        c.ellipse(16, 20, 6, 6, crop.fruitCol[0], crop.fruitCol[1], crop.fruitCol[2]);
        c.ellipse(16, 17, 5, 3, crop.topCol[0], crop.topCol[1], crop.topCol[2]);
        // Glistening specular highlight
        c.rect(14, 18, 2, 2, 255, 255, 255);
      }
      await c.save(path.join(dir, `crop_${crop.id}_${s}.png`));
    }
  }

  console.log('Crop stages built.');
}

async function buildAnimatedEnemies() {
  const dir = 'public/assets/enemies';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  console.log('Building animated enemy spritesheets (128x32)...');

  // Helper to draw into a 128x32 spritesheet (4 frames of 32x32)
  const createEnemySheet = (drawFrame) => {
    const sheet = createPixelBuffer(128, 32);
    for (let f = 0; f < 4; f++) {
      const ox = f * 32;
      drawFrame(sheet, ox, f);
    }
    return sheet;
  };

  // 1. Emerald Slime (Bouncing Jelly)
  const slime = createEnemySheet((sheet, ox, f) => {
    // Bob and squash offsets
    const squish = (f === 1) ? 2 : (f === 2) ? -2 : 0;
    const yOff = (f === 2) ? -3 : 0;
    const shadowW = (f === 1) ? 12 : (f === 2) ? 6 : 9;

    sheet.ellipse(ox + 16, 29, shadowW, 3, 0, 0, 0, 90); // Shadow
    // Outer slime body
    sheet.ellipse(ox + 16, 21 + yOff + squish / 2, 8 + (f === 1 ? 2 : 0), 7 - squish, 5, 150, 105);
    sheet.ellipse(ox + 16, 20 + yOff + squish / 2, 7 + (f === 1 ? 2 : 0), 6 - squish, 16, 185, 129);
    // Inner nucleus
    sheet.ellipse(ox + 16, 20 + yOff, 4, 4, 52, 211, 153);
    // Big expressive eyes
    sheet.rect(ox + 13, 18 + yOff, 2, 3, 2, 44, 34);
    sheet.rect(ox + 18, 18 + yOff, 2, 3, 2, 44, 34);
    sheet.rect(ox + 13, 18 + yOff, 1, 1, 255, 255, 255); // Eye glint
    sheet.rect(ox + 18, 18 + yOff, 1, 1, 255, 255, 255);
  });
  await slime.save(path.join(dir, 'enemy_slime.png'));

  // 2. Shadow Wolf (Dark prowling beast)
  const wolf = createEnemySheet((sheet, ox, f) => {
    const step = (f === 1) ? 2 : (f === 3) ? -2 : 0;
    sheet.ellipse(ox + 16, 29, 11, 4, 0, 0, 0, 90); // Shadow
    // Fur torso
    sheet.rect(ox + 10, 14, 15, 9, 30, 27, 75);
    sheet.rect(ox + 11, 15, 13, 7, 49, 46, 129);
    // Wolf Head & Snout
    sheet.rect(ox + 6, 11, 8, 8, 49, 46, 129);
    sheet.rect(ox + 3, 15, 4, 3, 30, 27, 75);
    // Pointed ears
    sheet.rect(ox + 7, 7, 2, 4, 49, 46, 129);
    sheet.rect(ox + 11, 7, 2, 4, 49, 46, 129);
    // Glowing red eyes
    sheet.rect(ox + 6, 13, 2, 2, 239, 68, 68);
    // Legs walking
    sheet.rect(ox + 6 + step, 23, 3, 6, 30, 27, 75);
    sheet.rect(ox + 12 - step, 23, 3, 6, 30, 27, 75);
    sheet.rect(ox + 18 + step, 23, 3, 6, 30, 27, 75);
    sheet.rect(ox + 22 - step, 23, 3, 6, 30, 27, 75);
  });
  await wolf.save(path.join(dir, 'enemy_wolf.png'));

  // 3. Deepforge Skeleton Warrior (Armored undead with rusty blade)
  const skeleton = createEnemySheet((sheet, ox, f) => {
    const bob = (f === 1 || f === 3) ? -1 : 0;
    sheet.ellipse(ox + 16, 29, 8, 3, 0, 0, 0, 90); // Shadow
    // Skull
    sheet.rect(ox + 12, 7 + bob, 8, 7, 226, 232, 240);
    sheet.rect(ox + 13, 9 + bob, 2, 2, 15, 23, 42); // Eye socket
    sheet.rect(ox + 17, 9 + bob, 2, 2, 15, 23, 42);
    sheet.rect(ox + 13, 9 + bob, 1, 1, 56, 189, 248); // Cyan eye glow
    sheet.rect(ox + 17, 9 + bob, 1, 1, 56, 189, 248);
    // Ribcage & spine
    sheet.rect(ox + 15, 14 + bob, 2, 9, 203, 213, 225);
    sheet.rect(ox + 12, 16 + bob, 8, 2, 148, 163, 184);
    sheet.rect(ox + 13, 19 + bob, 6, 2, 148, 163, 184);
    // Iron Helmet
    sheet.rect(ox + 11, 6 + bob, 10, 3, 71, 85, 105);
    // Rusty broadsword held at side
    const bladeY = (f === 2) ? 6 : 10;
    sheet.rect(ox + 22, bladeY + bob, 2, 14, 148, 163, 184);
    sheet.rect(ox + 21, bladeY + 10 + bob, 4, 2, 180, 83, 9); // Crossguard
    // Legs
    sheet.rect(ox + 13, 23 + bob, 2, 6, 203, 213, 225);
    sheet.rect(ox + 17, 23 + bob, 2, 6, 203, 213, 225);
  });
  await skeleton.save(path.join(dir, 'enemy_skeleton.png'));

  // 4. Wildlands Goblin Raider (Hooded green scoundrel with dual daggers)
  const goblin = createEnemySheet((sheet, ox, f) => {
    const bob = (f === 1 || f === 3) ? -1 : 0;
    sheet.ellipse(ox + 16, 29, 8, 3, 0, 0, 0, 90); // Shadow
    // Green goblin skin
    sheet.rect(ox + 11, 9 + bob, 10, 8, 101, 163, 13);
    // Pointed ears
    sheet.rect(ox + 7, 11 + bob, 4, 3, 101, 163, 13);
    sheet.rect(ox + 21, 11 + bob, 4, 3, 101, 163, 13);
    // Menacing red eyes
    sheet.rect(ox + 13, 12 + bob, 2, 2, 220, 38, 38);
    sheet.rect(ox + 17, 12 + bob, 2, 2, 220, 38, 38);
    // Leather hood & Jerkin
    sheet.rect(ox + 10, 7 + bob, 12, 3, 120, 53, 15);
    sheet.rect(ox + 12, 17 + bob, 8, 7, 120, 53, 15);
    // Bronze Daggers
    sheet.rect(ox + 21, 16 + bob, 2, 7, 217, 119, 6);
    sheet.rect(ox + 9, 16 + bob, 2, 7, 217, 119, 6);
    // Boots
    sheet.rect(ox + 13, 24 + bob, 2, 5, 63, 98, 18);
    sheet.rect(ox + 17, 24 + bob, 2, 5, 63, 98, 18);
  });
  await goblin.save(path.join(dir, 'enemy_goblin.png'));

  console.log('Animated enemy spritesheets built.');
}

async function main() {
  await buildTerrainTiles();
  await buildProps();
  await buildOreNodes();
  await buildCropStages();
  await buildAnimatedEnemies();
  console.log('Master assets build complete!');
}

main().catch(console.error);
