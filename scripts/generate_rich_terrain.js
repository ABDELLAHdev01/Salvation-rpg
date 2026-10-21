import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../public/assets/tilesets');

function createPixelBuffer(width, height) {
  const buf = Buffer.alloc(width * height * 4, 0);
  return {
    buf,
    width,
    height,
    set(x, y, r, g, b, a = 255) {
      if (x < 0 || x >= width || y < 0 || y >= height) return;
      const idx = (Math.floor(y) * width + Math.floor(x)) * 4;
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
    async save(filename) {
      await sharp(this.buf, { raw: { width: this.width, height: this.height, channels: 4 } })
        .png()
        .toFile(path.join(dir, filename));
      console.log(`Saved: ${filename}`);
    }
  };
}

async function generateAll() {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // 1. Lush Seamless Meadow Grass (32x32) - Soothing classic RPG earth-green palette
  const grass = createPixelBuffer(32, 32);
  grass.rect(0, 0, 32, 32, 58, 108, 54); // Soothing classic RPG meadow green
  // Subtle organic color modulation
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const n = (x * 17 + y * 23) % 7;
      if (n === 0) grass.set(x, y, 48, 92, 44);
      else if (n === 1) grass.set(x, y, 68, 122, 62);
    }
  }
  // Pixel grass blade clusters (tiled organically)
  const blades = [
    { x: 4, y: 6 }, { x: 18, y: 4 }, { x: 12, y: 16 }, { x: 26, y: 14 },
    { x: 6, y: 24 }, { x: 22, y: 26 }
  ];
  for (const b of blades) {
    // shadow base
    grass.rect(b.x, b.y + 2, 3, 1, 36, 68, 32);
    // blade stems
    grass.rect(b.x, b.y, 1, 2, 78, 138, 70);
    grass.rect(b.x + 1, b.y - 1, 1, 3, 92, 158, 82);
    grass.rect(b.x + 2, b.y, 1, 2, 72, 130, 66);
  }
  await grass.save('tile_grass.png');

  // 2. Meadow Grass with Wildflowers (32x32)
  const grassFlowers = createPixelBuffer(32, 32);
  // Copy grass base
  grass.buf.copy(grassFlowers.buf);
  // Daisy 1 at (8, 8)
  grassFlowers.rect(8, 7, 1, 3, 255, 255, 250); // vertical white petals
  grassFlowers.rect(7, 8, 3, 1, 255, 255, 250); // horizontal white petals
  grassFlowers.set(8, 8, 255, 215, 30); // gold center
  // Buttercup at (24, 12)
  grassFlowers.rect(23, 11, 3, 3, 255, 205, 35);
  grassFlowers.set(24, 12, 230, 140, 20);
  // Bluebell at (14, 22)
  grassFlowers.rect(13, 21, 3, 3, 110, 160, 255);
  grassFlowers.set(14, 22, 255, 255, 255);
  await grassFlowers.save('tile_grass_flowers.png');

  // 3. Meadow Grass with Clover Patches (32x32)
  const grassClovers = createPixelBuffer(32, 32);
  grass.buf.copy(grassClovers.buf);
  // Clover at (10, 14)
  grassClovers.rect(10, 13, 1, 1, 55, 145, 40);
  grassClovers.rect(9, 14, 1, 1, 55, 145, 40);
  grassClovers.rect(11, 14, 1, 1, 55, 145, 40);
  grassClovers.set(10, 15, 45, 120, 30);
  // Clover at (22, 8)
  grassClovers.rect(22, 7, 1, 1, 65, 155, 50);
  grassClovers.rect(21, 8, 1, 1, 65, 155, 50);
  grassClovers.rect(23, 8, 1, 1, 65, 155, 50);
  grassClovers.set(22, 9, 45, 120, 30);
  await grassClovers.save('tile_grass_clovers.png');

  // 4. Meadow Grass with Pebbles (32x32)
  const grassPebbles = createPixelBuffer(32, 32);
  grass.buf.copy(grassPebbles.buf);
  // River pebble 1
  grassPebbles.rect(15, 12, 3, 2, 140, 145, 150);
  grassPebbles.rect(15, 11, 2, 1, 180, 185, 190); // highlight
  grassPebbles.rect(15, 14, 3, 1, 75, 80, 85); // shadow
  // Pebble 2
  grassPebbles.rect(8, 20, 2, 2, 160, 155, 145);
  grassPebbles.rect(8, 22, 2, 1, 85, 80, 75);
  await grassPebbles.save('tile_grass_pebbles.png');

  // 5. Rich Earth / Loam Dirt Tile (32x32)
  const dirt = createPixelBuffer(32, 32);
  dirt.rect(0, 0, 32, 32, 152, 104, 62); // Warm rich earth
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const v = (x * 19 + y * 31) % 5;
      if (v === 0) dirt.set(x, y, 132, 88, 48);
      else if (v === 1) dirt.set(x, y, 172, 122, 78);
    }
  }
  // Subtle pebbles in dirt
  dirt.rect(6, 10, 2, 1, 195, 150, 105);
  dirt.rect(20, 18, 2, 1, 110, 70, 35);
  dirt.rect(14, 26, 2, 2, 180, 135, 95);
  await dirt.save('tile_dirt.png');

  // 6. City Plaza Cobblestone / Flagstone Tile (32x32)
  const cityStone = createPixelBuffer(32, 32);
  cityStone.rect(0, 0, 32, 32, 78, 68, 60); // Dark mortar grout
  // Paver blocks
  const blocks = [
    { x: 1, y: 1, w: 14, h: 8, r: 155, g: 148, b: 140 },
    { x: 17, y: 1, w: 14, h: 8, r: 140, g: 132, b: 125 },
    { x: 1, y: 11, w: 7, h: 9, r: 142, g: 135, b: 128 },
    { x: 10, y: 11, w: 13, h: 9, r: 165, g: 158, b: 150 },
    { x: 25, y: 11, w: 6, h: 9, r: 148, g: 140, b: 133 },
    { x: 1, y: 22, w: 13, h: 9, r: 145, g: 138, b: 130 },
    { x: 16, y: 22, w: 15, h: 9, r: 160, g: 152, b: 145 },
  ];
  for (const blk of blocks) {
    cityStone.rect(blk.x, blk.y, blk.w, blk.h, blk.r, blk.g, blk.b);
    // highlight top & left
    cityStone.rect(blk.x, blk.y, blk.w, 1, Math.min(255, blk.r + 28), Math.min(255, blk.g + 28), Math.min(255, blk.b + 28));
    cityStone.rect(blk.x, blk.y, 1, blk.h, Math.min(255, blk.r + 20), Math.min(255, blk.g + 20), Math.min(255, blk.b + 20));
    // shadow bottom & right
    cityStone.rect(blk.x, blk.y + blk.h - 1, blk.w, 1, Math.max(0, blk.r - 30), Math.max(0, blk.g - 30), Math.max(0, blk.b - 30));
    cityStone.rect(blk.x + blk.w - 1, blk.y, 1, blk.h, Math.max(0, blk.r - 25), Math.max(0, blk.g - 25), Math.max(0, blk.b - 25));
  }
  await cityStone.save('tile_city_stone.png');

  // 7. Horizontal Wooden Fence (32x32)
  const fenceH = createPixelBuffer(32, 32);
  // Post Left
  fenceH.rect(2, 6, 4, 24, 115, 75, 40); // post body
  fenceH.rect(2, 6, 1, 24, 150, 105, 60); // highlight
  fenceH.rect(5, 6, 1, 24, 80, 50, 25); // shadow
  fenceH.rect(1, 4, 6, 3, 140, 95, 55); // post cap
  // Post Right
  fenceH.rect(26, 6, 4, 24, 115, 75, 40);
  fenceH.rect(26, 6, 1, 24, 150, 105, 60);
  fenceH.rect(29, 6, 1, 24, 80, 50, 25);
  fenceH.rect(25, 4, 6, 3, 140, 95, 55);
  // Top Rail across full width
  fenceH.rect(0, 12, 32, 3, 130, 88, 48);
  fenceH.rect(0, 12, 32, 1, 165, 120, 72); // top edge highlight
  fenceH.rect(0, 14, 32, 1, 90, 58, 30); // bottom shadow
  // Bottom Rail across full width
  fenceH.rect(0, 20, 32, 3, 130, 88, 48);
  fenceH.rect(0, 20, 32, 1, 165, 120, 72);
  fenceH.rect(0, 22, 32, 1, 90, 58, 30);
  // Nails
  fenceH.set(4, 13, 40, 40, 45);
  fenceH.set(4, 21, 40, 40, 45);
  fenceH.set(28, 13, 40, 40, 45);
  fenceH.set(28, 21, 40, 40, 45);
  await fenceH.save('prop_fence_h.png');

  // 8. Vertical Wooden Fence (32x32)
  const fenceV = createPixelBuffer(32, 32);
  fenceV.rect(14, 0, 4, 32, 115, 75, 40);
  fenceV.rect(14, 0, 1, 32, 150, 105, 60);
  fenceV.rect(17, 0, 1, 32, 80, 50, 25);
  // Cross slats
  fenceV.rect(11, 6, 10, 3, 130, 88, 48);
  fenceV.rect(11, 22, 10, 3, 130, 88, 48);
  await fenceV.save('prop_fence_v.png');

  // 9. Stone Water Well (32x32)
  const well = createPixelBuffer(32, 32);
  // Shadow
  well.ellipse(16, 26, 12, 4, 20, 30, 10, 140);
  // Stone Circular Basin
  well.ellipse(16, 22, 11, 7, 130, 128, 124); // rim base
  well.ellipse(16, 21, 10, 6, 160, 158, 154); // inner rim
  well.ellipse(16, 21, 8, 4, 45, 95, 160); // water depth
  well.rect(14, 20, 4, 1, 180, 230, 255); // water gleam
  // Stone brick lines
  well.rect(6, 22, 20, 5, 115, 112, 108);
  well.rect(7, 24, 18, 1, 80, 78, 75);
  // Timber Support Posts
  well.rect(6, 8, 2, 14, 110, 72, 38);
  well.rect(24, 8, 2, 14, 110, 72, 38);
  // Winch Bar & Rope
  well.rect(8, 12, 16, 2, 130, 85, 45);
  well.rect(15, 12, 2, 7, 200, 185, 140); // hanging rope
  well.rect(14, 18, 4, 3, 100, 65, 35); // wood bucket
  // Pitched Roof
  for (let r = 0; r < 7; r++) {
    const w = 24 - r * 2;
    const x = 16 - Math.floor(w / 2);
    well.rect(x, 7 - r, w, 1, 180 - r * 8, 60, 45);
  }
  well.rect(4, 7, 24, 1, 130, 40, 30); // roof eaves
  await well.save('prop_well.png');

  // 10. Lush Leafy Bush (32x32)
  const bush = createPixelBuffer(32, 32);
  // Drop shadow
  bush.ellipse(16, 25, 12, 4, 25, 45, 15, 130);
  // Foliage lobes
  bush.ellipse(16, 18, 11, 9, 65, 125, 35); // base shadow
  bush.ellipse(11, 15, 7, 6, 85, 155, 45); // left lobe
  bush.ellipse(21, 15, 7, 6, 85, 155, 45); // right lobe
  bush.ellipse(16, 13, 8, 7, 105, 180, 55); // top center highlight lobe
  bush.ellipse(16, 11, 5, 3, 135, 210, 75); // sun glint crest
  await bush.save('prop_bush.png');

  // 11. Sweetberry Bush (32x32)
  const berryBush = createPixelBuffer(32, 32);
  bush.buf.copy(berryBush.buf);
  // Red berries
  const berrySpots = [
    { x: 10, y: 15 }, { x: 15, y: 12 }, { x: 21, y: 14 },
    { x: 13, y: 19 }, { x: 19, y: 18 }
  ];
  for (const pt of berrySpots) {
    berryBush.rect(pt.x, pt.y, 2, 2, 225, 35, 40);
    berryBush.set(pt.x, pt.y, 255, 160, 170); // berry shine
  }
  await berryBush.save('prop_berry_bush.png');

  // 12. Mossy Granite Boulder (32x32)
  const rock = createPixelBuffer(32, 32);
  rock.ellipse(16, 24, 10, 4, 30, 45, 20, 140); // shadow
  rock.ellipse(16, 19, 9, 7, 110, 112, 115); // main stone
  rock.ellipse(15, 17, 7, 5, 145, 148, 152); // face highlight
  rock.ellipse(13, 15, 4, 3, 180, 185, 190); // crest glint
  // Moss patch on top
  rock.ellipse(17, 14, 5, 2, 95, 165, 45);
  rock.set(16, 13, 125, 195, 65);
  await rock.save('prop_rock.png');

  // 13. Pond Reeds & Cattails (32x32)
  const reeds = createPixelBuffer(32, 32);
  // Stems
  reeds.rect(8, 8, 1, 20, 80, 145, 45);
  reeds.rect(14, 4, 1, 24, 70, 135, 40);
  reeds.rect(20, 6, 1, 22, 85, 155, 50);
  reeds.rect(25, 10, 1, 18, 75, 140, 42);
  // Cattail heads
  reeds.rect(7, 8, 3, 8, 115, 62, 28);
  reeds.rect(13, 4, 3, 9, 115, 62, 28);
  reeds.rect(19, 6, 3, 8, 115, 62, 28);
  reeds.rect(24, 10, 3, 7, 115, 62, 28);
  // Blade leaves
  reeds.set(10, 20, 95, 165, 55);
  reeds.set(11, 19, 95, 165, 55);
  reeds.set(16, 18, 95, 165, 55);
  reeds.set(17, 17, 95, 165, 55);
  await reeds.save('prop_reeds.png');

  // 14. Water Lilypad with Lotus (32x32)
  const lily = createPixelBuffer(32, 32);
  lily.ellipse(16, 17, 9, 6, 45, 140, 55);
  // Wedge cut
  lily.rect(16, 11, 4, 6, 0, 0, 0, 0);
  // Lotus flower in center
  lily.rect(15, 14, 3, 3, 255, 180, 210);
  lily.rect(15, 13, 1, 1, 255, 230, 240);
  lily.rect(17, 13, 1, 1, 255, 230, 240);
  lily.set(16, 15, 255, 220, 40); // golden stamen
  await lily.save('prop_lilypad.png');

  // 15. Wooden Planter Flowerbox (32x32)
  const flowerbed = createPixelBuffer(32, 32);
  flowerbed.ellipse(16, 26, 12, 3, 20, 30, 10, 120); // shadow
  // Wooden box
  flowerbed.rect(3, 16, 26, 10, 120, 78, 42);
  flowerbed.rect(3, 16, 26, 1, 160, 110, 60); // top rim
  flowerbed.rect(3, 25, 26, 1, 80, 50, 25); // base shadow
  // Soil
  flowerbed.rect(5, 14, 22, 3, 75, 45, 22);
  // Colorful flowers
  const fColors = [
    [255, 60, 70], [255, 215, 30], [255, 120, 190],
    [90, 160, 255], [255, 255, 255]
  ];
  for (let i = 0; i < 5; i++) {
    const fx = 6 + i * 4;
    const c = fColors[i];
    flowerbed.rect(fx, 11, 3, 3, c[0], c[1], c[2]);
    flowerbed.set(fx + 1, 12, 255, 220, 40);
    flowerbed.rect(fx + 1, 14, 1, 2, 70, 140, 45); // stem
  }
  await flowerbed.save('prop_flowerbed.png');

  console.log('All rich terrain assets generated successfully!');
}

generateAll().catch(console.error);
