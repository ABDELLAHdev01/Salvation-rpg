const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('projects/Salvation-rpg/assets_source/craftpix-net-169442-free-2d-top-down-pixel-dungeon-asset-pack/Tiled_files/Dungeon1.tmx', 'utf8');
const tsRegex = /<tileset[^>]*>([\s\S]*?)<\/tileset>/g;
let match;
const tilesets = [];
while ((match = tsRegex.exec(content)) !== null) {
  const full = match[0];
  const name = full.match(/name="([^"]+)"/)?.[1];
  const fg = parseInt(full.match(/firstgid="([^"]+)"/)?.[1], 10);
  const img = full.match(/source="([^"]+)"/)?.[1];
  const col = parseInt(full.match(/columns="([^"]+)"/)?.[1], 10);
  tilesets.push({ name, fg, img, col });
}
console.log('Tilesets:', tilesets);

const tileId = 1075;
const ts = tilesets.slice().reverse().find(t => tileId >= t.fg);
console.log('Tile 1075 belongs to:', ts);
if (ts) {
  const localId = tileId - ts.fg;
  const col = localId % ts.col;
  const row = Math.floor(localId / ts.col);
  console.log(`Local ID: ${localId}, col: ${col}, row: ${row}, x: ${col * 16}, y: ${row * 16}`);
}
