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

async function main() {
  const dir = 'public/assets/items';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // 1. Savory Roast Boar Meat
  const meat = createPixelBuffer(32, 32);
  meat.ellipse(16, 26, 7, 2, 0, 0, 0, 80);
  meat.rect(10, 12, 13, 9, 153, 27, 27);
  meat.rect(11, 13, 11, 7, 185, 28, 28);
  meat.rect(13, 15, 7, 3, 239, 68, 68);
  meat.rect(7, 14, 4, 3, 241, 245, 249);
  meat.rect(6, 13, 2, 5, 226, 232, 240);
  await meat.save(path.join(dir, 'item_meat.png'));

  // 2. Thick Beast Hide
  const hide = createPixelBuffer(32, 32);
  hide.ellipse(16, 26, 7, 2, 0, 0, 0, 80);
  hide.rect(9, 10, 14, 13, 120, 53, 15);
  hide.rect(10, 11, 12, 11, 146, 64, 14);
  hide.rect(12, 13, 8, 7, 180, 83, 9);
  hide.rect(11, 12, 2, 2, 217, 119, 6);
  await hide.save(path.join(dir, 'item_hide.png'));

  // 3. Amber Fox Pelt
  const foxPelt = createPixelBuffer(32, 32);
  foxPelt.ellipse(16, 26, 7, 2, 0, 0, 0, 80);
  foxPelt.rect(9, 11, 14, 12, 194, 65, 12);
  foxPelt.rect(10, 12, 12, 10, 234, 88, 12);
  foxPelt.rect(12, 14, 8, 6, 251, 146, 60);
  foxPelt.rect(13, 19, 6, 3, 255, 255, 255);
  await foxPelt.save(path.join(dir, 'item_fox_pelt.png'));

  // 4. Ancient Dungeon Relic
  const relic = createPixelBuffer(32, 32);
  relic.ellipse(16, 27, 7, 2, 0, 0, 0, 80);
  relic.rect(11, 8, 10, 12, 180, 83, 9);
  relic.rect(12, 9, 8, 10, 234, 179, 8);
  relic.rect(13, 10, 6, 8, 250, 204, 21);
  relic.rect(14, 12, 4, 4, 147, 51, 234);
  relic.rect(15, 13, 2, 2, 192, 132, 252);
  await relic.save(path.join(dir, 'item_relic.png'));

  // 5. Fresh Farm Egg
  const egg = createPixelBuffer(32, 32);
  egg.ellipse(16, 26, 6, 2, 0, 0, 0, 70);
  egg.ellipse(16, 17, 7, 9, 217, 119, 6); // shadow rim
  egg.ellipse(16, 17, 6, 8, 254, 243, 199); // cream shell
  egg.ellipse(15, 15, 4, 6, 255, 251, 235); // highlight
  await egg.save(path.join(dir, 'item_egg.png'));

  // 6. Fluffy Wool Bundle
  const wool = createPixelBuffer(32, 32);
  wool.ellipse(16, 26, 8, 2, 0, 0, 0, 70);
  wool.ellipse(16, 17, 9, 8, 148, 163, 184); // dark slate outline
  wool.ellipse(16, 17, 8, 7, 241, 245, 249); // bright cloud wool
  wool.ellipse(14, 15, 5, 4, 255, 255, 255); // puff shine
  wool.ellipse(18, 18, 5, 4, 226, 232, 240); // shadow crease
  await wool.save(path.join(dir, 'item_wool.png'));

  console.log('Extra icons (Meat, Hide, Fox Pelt, Relic, Egg, Wool) generated successfully!');
}

main().catch(console.error);
