import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

function createPixelBuffer(width, height) {
  const buf = Buffer.alloc(width * height * 4, 0);
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

async function buildItemIcons() {
  const dir = 'public/assets/items';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  console.log('Generating high-definition 32x32 pixel art item icons...');

  // 1. Health Potion (Flask with sparkling crimson elixir and cork)
  const healthPot = createPixelBuffer(32, 32);
  healthPot.ellipse(16, 28, 7, 2, 0, 0, 0, 80); // Shadow
  // Cork stopper
  healthPot.rect(14, 5, 4, 4, 180, 83, 9);
  healthPot.rect(13, 8, 6, 2, 120, 53, 15); // Glass lip
  // Neck
  healthPot.rect(14, 10, 4, 4, 203, 213, 225, 200);
  // Flask Bulb (Glass outline)
  healthPot.ellipse(16, 20, 8, 8, 30, 41, 59, 240);
  healthPot.ellipse(16, 20, 7, 7, 220, 38, 38); // Crimson red elixir
  healthPot.ellipse(16, 18, 6, 4, 239, 68, 68); // Lighter liquid body
  // Specular shine on glass
  healthPot.rect(12, 16, 2, 5, 255, 255, 255, 230);
  healthPot.rect(13, 15, 2, 2, 255, 255, 255, 230);
  await healthPot.save(path.join(dir, 'item_health_potion.png'));

  // 2. Mana Potion (Flask with sparkling azure elixir)
  const manaPot = createPixelBuffer(32, 32);
  manaPot.ellipse(16, 28, 7, 2, 0, 0, 0, 80);
  manaPot.rect(14, 5, 4, 4, 180, 83, 9); // Cork
  manaPot.rect(13, 8, 6, 2, 120, 53, 15);
  manaPot.rect(14, 10, 4, 4, 203, 213, 225, 200);
  manaPot.ellipse(16, 20, 8, 8, 30, 41, 59, 240);
  manaPot.ellipse(16, 20, 7, 7, 2, 132, 199); // Azure liquid
  manaPot.ellipse(16, 18, 6, 4, 56, 189, 248);
  manaPot.rect(12, 16, 2, 5, 255, 255, 255, 230);
  manaPot.rect(13, 15, 2, 2, 255, 255, 255, 230);
  await manaPot.save(path.join(dir, 'item_mana_potion.png'));

  // 3. Iron Ore
  const ironOre = createPixelBuffer(32, 32);
  ironOre.ellipse(16, 27, 8, 3, 0, 0, 0, 80);
  ironOre.rect(8, 10, 16, 14, 39, 39, 42); // Granite matrix
  ironOre.rect(9, 9, 14, 14, 71, 85, 105);
  ironOre.rect(12, 11, 7, 5, 148, 163, 184); // Metallic veins
  ironOre.rect(14, 17, 6, 4, 203, 213, 225);
  ironOre.rect(13, 12, 3, 2, 241, 245, 249); // Specular highlight
  await ironOre.save(path.join(dir, 'item_iron_ore.png'));

  // 4. Copper Ore
  const copperOre = createPixelBuffer(32, 32);
  copperOre.ellipse(16, 27, 8, 3, 0, 0, 0, 80);
  copperOre.rect(8, 10, 16, 14, 69, 26, 3);
  copperOre.rect(9, 9, 14, 14, 146, 64, 14);
  copperOre.rect(11, 11, 7, 6, 217, 119, 6); // Bronze vein
  copperOre.rect(15, 16, 6, 5, 245, 158, 11);
  copperOre.rect(12, 12, 3, 2, 254, 240, 138); // Highlight
  await copperOre.save(path.join(dir, 'item_copper_ore.png'));

  // 5. Gold Ore
  const goldOre = createPixelBuffer(32, 32);
  goldOre.ellipse(16, 27, 8, 3, 0, 0, 0, 80);
  goldOre.rect(8, 10, 16, 14, 30, 41, 59);
  goldOre.rect(9, 9, 14, 14, 71, 85, 105);
  goldOre.rect(11, 11, 6, 6, 202, 138, 4); // Rich gold vein
  goldOre.rect(16, 15, 7, 6, 234, 179, 8);
  goldOre.rect(13, 12, 3, 3, 250, 204, 21);
  goldOre.rect(14, 13, 2, 2, 255, 255, 255); // Gleam
  await goldOre.save(path.join(dir, 'item_gold_ore.png'));

  // 6. Crystal Geode
  const geode = createPixelBuffer(32, 32);
  geode.ellipse(16, 27, 8, 3, 0, 0, 0, 80);
  geode.rect(8, 10, 16, 14, 24, 24, 27);
  geode.rect(9, 9, 14, 14, 63, 63, 70);
  geode.rect(11, 10, 8, 8, 147, 51, 234); // Amethyst violet crystal
  geode.rect(15, 15, 7, 6, 192, 132, 252);
  geode.rect(13, 12, 3, 3, 245, 208, 254);
  geode.rect(14, 13, 2, 2, 255, 255, 255); // Star glint
  await geode.save(path.join(dir, 'item_crystal_geode.png'));

  // 7. Iron Bar / Ingot
  const ironBar = createPixelBuffer(32, 32);
  ironBar.ellipse(16, 27, 9, 3, 0, 0, 0, 80);
  ironBar.rect(7, 14, 18, 9, 71, 85, 105);
  ironBar.rect(9, 12, 14, 3, 148, 163, 184); // Beveled top
  ironBar.rect(9, 12, 14, 1, 226, 232, 240); // Edge sheen
  ironBar.rect(7, 21, 18, 2, 30, 41, 59); // Bottom shade
  await ironBar.save(path.join(dir, 'item_iron_bar.png'));

  // 8. Copper Bar / Ingot
  const copperBar = createPixelBuffer(32, 32);
  copperBar.ellipse(16, 27, 9, 3, 0, 0, 0, 80);
  copperBar.rect(7, 14, 18, 9, 180, 83, 9);
  copperBar.rect(9, 12, 14, 3, 217, 119, 6);
  copperBar.rect(9, 12, 14, 1, 251, 191, 36);
  copperBar.rect(7, 21, 18, 2, 120, 53, 15);
  await copperBar.save(path.join(dir, 'item_copper_bar.png'));

  // 9. Gold Bar / Ingot
  const goldBar = createPixelBuffer(32, 32);
  goldBar.ellipse(16, 27, 9, 3, 0, 0, 0, 80);
  goldBar.rect(7, 14, 18, 9, 202, 138, 4);
  goldBar.rect(9, 12, 14, 3, 234, 179, 8);
  goldBar.rect(9, 12, 14, 1, 254, 240, 138); // Pure gold shine
  goldBar.rect(7, 21, 18, 2, 146, 64, 14);
  await goldBar.save(path.join(dir, 'item_gold_bar.png'));

  // 10. Tempered Steel Broadsword
  const sword = createPixelBuffer(32, 32);
  sword.ellipse(16, 29, 6, 2, 0, 0, 0, 80);
  // Diagonal sword: Blade from (10, 22) up to (24, 8)
  for (let i = 0; i < 16; i++) {
    sword.rect(8 + i, 23 - i, 2, 2, 226, 232, 240); // Silver edge
    sword.rect(9 + i, 23 - i, 2, 2, 148, 163, 184); // Core fuller
  }
  sword.rect(10, 21, 5, 2, 234, 179, 8); // Gold Crossguard
  sword.rect(8, 23, 2, 3, 120, 53, 15); // Leather grip
  sword.rect(7, 25, 2, 2, 234, 179, 8); // Pommel
  await sword.save(path.join(dir, 'item_sword.png'));

  // 11. Forged Iron Pickaxe
  const pick = createPixelBuffer(32, 32);
  pick.ellipse(16, 29, 6, 2, 0, 0, 0, 80);
  // Diagonal shaft
  for (let i = 0; i < 18; i++) {
    pick.rect(8 + i, 25 - i, 2, 2, 146, 64, 14);
  }
  // Curved pickaxe head at top
  pick.rect(20, 6, 8, 3, 100, 116, 139);
  pick.rect(22, 5, 6, 2, 203, 213, 225);
  pick.rect(27, 7, 2, 3, 71, 85, 105);
  await pick.save(path.join(dir, 'item_pickaxe.png'));

  // 12. Farmer Harvest Scythe
  const scythe = createPixelBuffer(32, 32);
  scythe.ellipse(16, 29, 6, 2, 0, 0, 0, 80);
  for (let i = 0; i < 18; i++) {
    scythe.rect(14, 8 + i, 2, 2, 120, 53, 15); // Long shaft
  }
  // Curved harvest blade
  scythe.rect(14, 7, 11, 3, 148, 163, 184);
  scythe.rect(17, 6, 8, 2, 226, 232, 240);
  scythe.rect(23, 8, 3, 4, 100, 116, 139);
  await scythe.save(path.join(dir, 'item_scythe.png'));

  // 13. Elder Oak Wand
  const wand = createPixelBuffer(32, 32);
  wand.ellipse(16, 29, 6, 2, 0, 0, 0, 80);
  for (let i = 0; i < 16; i++) {
    wand.rect(8 + i, 24 - i, 2, 2, 92, 40, 8); // Twisted oak
  }
  // Glowing mana crystal orb at tip
  wand.ellipse(24, 8, 4, 4, 56, 189, 248);
  wand.rect(23, 7, 2, 2, 255, 255, 255); // Star sparkle
  await wand.save(path.join(dir, 'item_wand.png'));

  // 14. Turnip
  const turnip = createPixelBuffer(32, 32);
  turnip.ellipse(16, 27, 7, 2, 0, 0, 0, 80);
  turnip.rect(15, 6, 2, 8, 34, 197, 94); // Leaf stem
  turnip.rect(13, 5, 3, 3, 74, 222, 128); // Green fronds
  turnip.rect(17, 5, 3, 3, 74, 222, 128);
  turnip.ellipse(16, 19, 7, 7, 241, 245, 249); // White turnip body
  turnip.ellipse(16, 15, 6, 3, 168, 85, 247); // Purple shoulder
  await turnip.save(path.join(dir, 'item_turnip.png'));

  // 15. Wheat Bundle
  const wheat = createPixelBuffer(32, 32);
  wheat.ellipse(16, 27, 7, 2, 0, 0, 0, 80);
  wheat.rect(15, 14, 2, 12, 180, 83, 9); // Tied sheaf
  wheat.rect(13, 20, 6, 2, 220, 38, 38); // Red ribbon
  // Golden grain heads
  wheat.rect(12, 7, 3, 8, 234, 179, 8);
  wheat.rect(15, 5, 3, 10, 250, 204, 21);
  wheat.rect(18, 7, 3, 8, 234, 179, 8);
  await wheat.save(path.join(dir, 'item_wheat.png'));

  // 16. Sylvan Herb
  const herb = createPixelBuffer(32, 32);
  herb.ellipse(16, 27, 7, 2, 0, 0, 0, 80);
  herb.rect(15, 10, 2, 16, 5, 150, 105);
  herb.rect(11, 12, 4, 4, 16, 185, 129);
  herb.rect(17, 10, 4, 4, 16, 185, 129);
  herb.rect(12, 17, 4, 4, 52, 211, 153);
  herb.rect(17, 16, 4, 4, 52, 211, 153);
  herb.rect(14, 7, 4, 3, 110, 231, 183); // Blossom
  await herb.save(path.join(dir, 'item_herb.png'));

  // 17. Moonberry
  const moonberry = createPixelBuffer(32, 32);
  moonberry.ellipse(16, 27, 7, 2, 0, 0, 0, 80);
  moonberry.rect(15, 7, 2, 7, 107, 33, 168);
  moonberry.ellipse(13, 17, 4, 4, 147, 51, 234);
  moonberry.ellipse(19, 17, 4, 4, 147, 51, 234);
  moonberry.ellipse(16, 22, 4, 4, 168, 85, 247);
  moonberry.rect(12, 16, 2, 2, 245, 208, 254); // Moon sheen
  moonberry.rect(18, 16, 2, 2, 245, 208, 254);
  await moonberry.save(path.join(dir, 'item_moonberry.png'));

  // 18. Sunroot
  const sunroot = createPixelBuffer(32, 32);
  sunroot.ellipse(16, 27, 7, 2, 0, 0, 0, 80);
  sunroot.rect(15, 5, 2, 7, 194, 65, 12);
  sunroot.ellipse(16, 18, 5, 8, 249, 115, 22); // Fiery orange carrot/root
  sunroot.ellipse(16, 16, 4, 6, 251, 146, 60);
  sunroot.rect(15, 14, 2, 3, 254, 240, 138); // Amber highlight
  await sunroot.save(path.join(dir, 'item_sunroot.png'));

  // 19. Seed Pouch
  const seedPouch = createPixelBuffer(32, 32);
  seedPouch.ellipse(16, 27, 7, 2, 0, 0, 0, 80);
  seedPouch.ellipse(16, 19, 8, 7, 146, 64, 14); // Canvas burlap sack
  seedPouch.ellipse(16, 18, 7, 6, 180, 83, 9);
  seedPouch.rect(14, 10, 4, 3, 217, 119, 6); // Tied string
  seedPouch.rect(13, 9, 6, 2, 245, 158, 11); // Sprouting top
  seedPouch.rect(15, 7, 2, 3, 34, 197, 94); // Tiny green sprout peek
  await seedPouch.save(path.join(dir, 'item_seed_pouch.png'));

  // 20. Slime Gel
  const slimeGel = createPixelBuffer(32, 32);
  slimeGel.ellipse(16, 26, 7, 2, 0, 0, 0, 80);
  slimeGel.ellipse(16, 19, 7, 6, 5, 150, 105);
  slimeGel.ellipse(16, 18, 6, 5, 16, 185, 129);
  slimeGel.rect(13, 16, 3, 3, 167, 243, 208); // Bubble gleam
  await slimeGel.save(path.join(dir, 'item_slime_gel.png'));

  // 21. Wolf Pelt
  const pelt = createPixelBuffer(32, 32);
  pelt.ellipse(16, 26, 7, 2, 0, 0, 0, 80);
  pelt.rect(9, 11, 14, 12, 30, 27, 75); // Dark shadow fur
  pelt.rect(10, 12, 12, 10, 49, 46, 129);
  pelt.rect(13, 10, 6, 2, 67, 56, 202);
  pelt.rect(15, 16, 2, 2, 239, 68, 68); // Red crest badge
  await pelt.save(path.join(dir, 'item_wolf_pelt.png'));

  // 22. Bone Shard
  const bone = createPixelBuffer(32, 32);
  bone.ellipse(16, 27, 7, 2, 0, 0, 0, 80);
  for (let i = 0; i < 14; i++) {
    bone.rect(9 + i, 23 - i, 3, 3, 226, 232, 240); // Chiseled bone
  }
  bone.rect(9, 23, 4, 3, 203, 213, 225); // Knuckle joint
  bone.rect(20, 10, 3, 3, 241, 245, 249); // Sharp tip
  await bone.save(path.join(dir, 'item_bone_shard.png'));

  // 23. Contract Sigil
  const sigil = createPixelBuffer(32, 32);
  sigil.ellipse(16, 27, 7, 2, 0, 0, 0, 80);
  sigil.rect(9, 9, 14, 16, 254, 243, 199); // Ancient parchment
  sigil.rect(10, 10, 12, 14, 253, 230, 138);
  sigil.rect(14, 17, 4, 4, 185, 28, 28); // Crimson wax seal
  sigil.rect(15, 18, 2, 2, 239, 68, 68);
  await sigil.save(path.join(dir, 'item_contract_sigil.png'));

  // 24. Imperial Gold Coin
  const coin = createPixelBuffer(32, 32);
  coin.ellipse(16, 27, 7, 2, 0, 0, 0, 80);
  coin.ellipse(16, 17, 8, 8, 180, 83, 9); // Rim shade
  coin.ellipse(16, 17, 7, 7, 234, 179, 8); // Gold coin face
  coin.ellipse(16, 16, 5, 5, 250, 204, 21);
  coin.rect(15, 14, 2, 5, 254, 240, 138); // Stamped crown crest
  coin.rect(13, 16, 6, 1, 254, 240, 138);
  await coin.save(path.join(dir, 'item_gold_coin.png'));

  console.log('All 24 item icons generated successfully.');
}

buildItemIcons().catch(console.error);
