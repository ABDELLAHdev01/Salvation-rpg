/**
 * WorldTileGenerator
 * Generates game-ready tilesets and environmental props dynamically on HTML5 Canvas
 * ensuring zero missing textures or 404 image errors in Phaser 3.
 */

export function registerWorldTextures(scene) {
  if (scene.textures.exists('world_tiles')) return;

  const TILE_SIZE = 32;

  // 1. Generate Dedicated 32x32 Terrain Tile Textures
  const createTileCanvas = (drawFn) => {
    const c = document.createElement('canvas');
    c.width = TILE_SIZE;
    c.height = TILE_SIZE;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    drawFn(ctx);
    return c;
  };

  // Tile: Lush Meadow Grass
  const grassCanvas = createTileCanvas((ctx) => {
    ctx.fillStyle = '#1e3a1f';
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#2d5a2f';
    ctx.fillRect(4, 4, 24, 24);
    ctx.fillStyle = '#3e7b41';
    ctx.fillRect(6, 6, 8, 8);
    ctx.fillRect(18, 16, 6, 6);
    ctx.fillStyle = '#fde047'; // Flowers
    ctx.fillRect(8, 18, 2, 2);
    ctx.fillRect(22, 8, 2, 2);
  });
  scene.textures.addCanvas('tile_grass', grassCanvas);

  // Tile: Cobblestone Dirt Path
  const pathCanvas = createTileCanvas((ctx) => {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(2, 2, 28, 28);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(6, 6, 8, 6);
    ctx.fillRect(18, 14, 8, 8);
  });
  scene.textures.addCanvas('tile_path', pathCanvas);

  // Tile: Deep Cavern Stone
  const stoneCanvas = createTileCanvas((ctx) => {
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#292524';
    ctx.fillRect(2, 2, 28, 28);
    ctx.fillStyle = '#44403c';
    ctx.fillRect(6, 6, 10, 6);
    ctx.fillRect(18, 16, 8, 8);
    ctx.fillStyle = '#78716c'; // Mineral specks
    ctx.fillRect(8, 20, 2, 2);
    ctx.fillRect(20, 8, 2, 2);
  });
  scene.textures.addCanvas('tile_stone', stoneCanvas);

  // Tile: Tilled Farm Soil
  const soilCanvas = createTileCanvas((ctx) => {
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#5c2406';
    ctx.fillRect(2, 2, 28, 28);
    ctx.fillStyle = '#2b0f02'; // Furrows
    ctx.fillRect(4, 8, 24, 2);
    ctx.fillRect(4, 16, 24, 2);
    ctx.fillRect(4, 24, 24, 2);
  });
  scene.textures.addCanvas('tile_soil', soilCanvas);

  // Tile: Water
  const waterCanvas = createTileCanvas((ctx) => {
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(2, 2, 28, 28);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(6, 10, 12, 2);
    ctx.fillRect(14, 20, 10, 2);
  });
  scene.textures.addCanvas('tile_water', waterCanvas);

  // Composite Tileset Canvas for backward compatibility
  const terrainCanvas = document.createElement('canvas');
  terrainCanvas.width = TILE_SIZE * 8;
  terrainCanvas.height = TILE_SIZE * 4;
  const tCtx = terrainCanvas.getContext('2d');
  tCtx.imageSmoothingEnabled = false;
  tCtx.drawImage(grassCanvas, 0, 0);
  tCtx.drawImage(pathCanvas, TILE_SIZE, 0);
  tCtx.drawImage(stoneCanvas, TILE_SIZE * 2, 0);
  tCtx.drawImage(soilCanvas, TILE_SIZE * 3, 0);
  tCtx.drawImage(waterCanvas, TILE_SIZE * 4, 0);
  scene.textures.addCanvas('world_tiles', terrainCanvas);

  // 2. Generate Manor House Sprite (96x80)
  const houseCanvas = document.createElement('canvas');
  houseCanvas.width = 96;
  houseCanvas.height = 80;
  const hCtx = houseCanvas.getContext('2d');
  hCtx.imageSmoothingEnabled = false;
  // Shadow
  hCtx.fillStyle = 'rgba(0,0,0,0.4)';
  hCtx.fillRect(4, 72, 88, 8);
  // Timber Walls
  hCtx.fillStyle = '#78350f';
  hCtx.fillRect(10, 32, 76, 42);
  hCtx.fillStyle = '#92400e';
  hCtx.fillRect(14, 36, 68, 38);
  // Gabled Roof
  hCtx.fillStyle = '#991b1b';
  hCtx.beginPath();
  hCtx.moveTo(48, 4);
  hCtx.lineTo(6, 34);
  hCtx.lineTo(90, 34);
  hCtx.closePath();
  hCtx.fill();
  hCtx.fillStyle = '#b91c1c';
  hCtx.beginPath();
  hCtx.moveTo(48, 7);
  hCtx.lineTo(10, 32);
  hCtx.lineTo(86, 32);
  hCtx.closePath();
  hCtx.fill();
  // Wooden Arched Door
  hCtx.fillStyle = '#292524';
  hCtx.fillRect(40, 48, 16, 26);
  hCtx.fillStyle = '#f59e0b';
  hCtx.fillRect(52, 60, 2, 2); // Brass knob
  // Windows with golden interior light
  hCtx.fillStyle = '#fef08a';
  hCtx.fillRect(20, 44, 12, 12);
  hCtx.fillRect(64, 44, 12, 12);
  hCtx.fillStyle = '#78350f'; // Window cross
  hCtx.fillRect(25, 44, 2, 12);
  hCtx.fillRect(20, 49, 12, 2);
  hCtx.fillRect(69, 44, 2, 12);
  hCtx.fillRect(64, 49, 12, 2);
  scene.textures.addCanvas('prop_house', houseCanvas);

  // 3. Generate Pine Tree Sprite (48x64)
  const treeCanvas = document.createElement('canvas');
  treeCanvas.width = 48;
  treeCanvas.height = 64;
  const trCtx = treeCanvas.getContext('2d');
  trCtx.imageSmoothingEnabled = false;
  // Shadow
  trCtx.fillStyle = 'rgba(0,0,0,0.35)';
  trCtx.beginPath();
  trCtx.ellipse(24, 60, 18, 4, 0, 0, Math.PI * 2);
  trCtx.fill();
  // Trunk
  trCtx.fillStyle = '#451a03';
  trCtx.fillRect(20, 42, 8, 18);
  // Foliage Triangles
  trCtx.fillStyle = '#14532d';
  trCtx.beginPath();
  trCtx.moveTo(24, 6);
  trCtx.lineTo(6, 42);
  trCtx.lineTo(42, 42);
  trCtx.closePath();
  trCtx.fill();
  trCtx.fillStyle = '#166534';
  trCtx.beginPath();
  trCtx.moveTo(24, 10);
  trCtx.lineTo(10, 38);
  trCtx.lineTo(38, 38);
  trCtx.closePath();
  trCtx.fill();
  trCtx.fillStyle = '#22c55e';
  trCtx.fillRect(22, 14, 4, 4);
  trCtx.fillRect(16, 26, 6, 4);
  scene.textures.addCanvas('prop_tree', treeCanvas);

  // 4. Generate Storage Vault Chest Sprite (32x32)
  const chestCanvas = document.createElement('canvas');
  chestCanvas.width = 32;
  chestCanvas.height = 32;
  const cCtx = chestCanvas.getContext('2d');
  cCtx.imageSmoothingEnabled = false;
  cCtx.fillStyle = '#78350f';
  cCtx.fillRect(6, 12, 20, 16);
  cCtx.fillStyle = '#92400e';
  cCtx.fillRect(8, 14, 16, 12);
  // Iron bands
  cCtx.fillStyle = '#52525b';
  cCtx.fillRect(6, 12, 2, 16);
  cCtx.fillRect(24, 12, 2, 16);
  cCtx.fillRect(6, 18, 20, 2);
  // Gold Lock
  cCtx.fillStyle = '#eab308';
  cCtx.fillRect(14, 17, 4, 4);
  scene.textures.addCanvas('prop_chest', chestCanvas);

  // 5. Generate Crafting Anvil & Workbench Sprite (32x32)
  const benchCanvas = document.createElement('canvas');
  benchCanvas.width = 32;
  benchCanvas.height = 32;
  const bCtx = benchCanvas.getContext('2d');
  bCtx.imageSmoothingEnabled = false;
  // Timber Table
  bCtx.fillStyle = '#78350f';
  bCtx.fillRect(4, 14, 24, 6);
  bCtx.fillRect(6, 20, 3, 10);
  bCtx.fillRect(23, 20, 3, 10);
  // Anvil on top
  bCtx.fillStyle = '#3f3f46';
  bCtx.fillRect(10, 8, 12, 6);
  bCtx.fillStyle = '#71717a';
  bCtx.fillRect(8, 9, 4, 3); // Horn
  scene.textures.addCanvas('prop_workbench', benchCanvas);

  // 6. Generate Ore Boulders (Iron, Copper, Gold, Crystal)
  const makeOreSprite = (oreColor, shineColor) => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    // Rock body
    ctx.fillStyle = '#262626';
    ctx.beginPath();
    ctx.moveTo(16, 6);
    ctx.lineTo(28, 14);
    ctx.lineTo(26, 26);
    ctx.lineTo(8, 26);
    ctx.lineTo(4, 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#404040';
    ctx.fillRect(8, 12, 16, 12);
    // Ore Veins
    ctx.fillStyle = oreColor;
    ctx.fillRect(12, 10, 6, 6);
    ctx.fillRect(16, 16, 7, 5);
    ctx.fillRect(9, 18, 5, 4);
    // Mineral Highlights
    ctx.fillStyle = shineColor;
    ctx.fillRect(14, 11, 2, 2);
    ctx.fillRect(18, 17, 2, 2);
    return canvas;
  };

  scene.textures.addCanvas('ore_iron', makeOreSprite('#71717a', '#e4e4e7'));
  scene.textures.addCanvas('ore_copper', makeOreSprite('#b45309', '#f59e0b'));
  scene.textures.addCanvas('ore_gold', makeOreSprite('#d97706', '#fef08a'));
  scene.textures.addCanvas('ore_crystal', makeOreSprite('#9333ea', '#f3e8ff'));

  // 7. Generate Crops Sprites (Turnip, Wheat, Herb, Moonberry, Sunroot)
  const makeCropSprite = (color, foliageColor, stage) => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    if (stage === 1) { // Sprout
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(15, 20, 2, 6);
      ctx.fillRect(13, 18, 2, 2);
      ctx.fillRect(17, 18, 2, 2);
    } else if (stage === 2) { // Seedling
      ctx.fillStyle = foliageColor;
      ctx.fillRect(14, 16, 4, 10);
      ctx.fillRect(11, 14, 3, 3);
      ctx.fillRect(18, 14, 3, 3);
    } else if (stage === 3) { // Growing
      ctx.fillStyle = foliageColor;
      ctx.fillRect(13, 12, 6, 14);
      ctx.fillRect(9, 12, 4, 5);
      ctx.fillRect(19, 12, 4, 5);
    } else { // Mature (Stage 4)
      ctx.fillStyle = foliageColor;
      ctx.fillRect(12, 10, 8, 16);
      ctx.fillRect(8, 10, 4, 6);
      ctx.fillRect(20, 10, 4, 6);
      // Fruit / Root Body
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(16, 18, 6, 0, Math.PI * 2);
      ctx.fill();
      // Glow
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(15, 16, 2, 2);
    }
    return canvas;
  };

  // Register crop stages
  for (let s = 1; s <= 4; s += 1) {
    scene.textures.addCanvas(`crop_turnip_${s}`, makeCropSprite('#e2e8f0', '#16a34a', s));
    scene.textures.addCanvas(`crop_wheat_${s}`, makeCropSprite('#facc15', '#ca8a04', s));
    scene.textures.addCanvas(`crop_herb_${s}`, makeCropSprite('#10b981', '#047857', s));
    scene.textures.addCanvas(`crop_moonberry_${s}`, makeCropSprite('#a855f7', '#6b21a8', s));
    scene.textures.addCanvas(`crop_sunroot_${s}`, makeCropSprite('#ea580c', '#c2410c', s));
  }

  // 8. Generate Procedural Enemy Monster Sprites (Slime, Wolf, Skeleton, Goblin)
  const makeSlimeSprite = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(16, 28, 9, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#059669';
    ctx.fillRect(8, 16, 16, 11);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(9, 14, 14, 12);
    ctx.fillStyle = '#34d399';
    ctx.fillRect(11, 12, 10, 4);

    // Highlight
    ctx.fillStyle = '#a7f3d0';
    ctx.fillRect(11, 14, 3, 2);

    // Eyes
    ctx.fillStyle = '#022c22';
    ctx.fillRect(12, 18, 2, 3);
    ctx.fillRect(18, 18, 2, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, 18, 1, 1);
    ctx.fillRect(18, 18, 1, 1);
    return canvas;
  };

  const makeWolfSprite = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(16, 28, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark fur body
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(12, 15, 14, 9);
    ctx.fillStyle = '#312e81';
    ctx.fillRect(8, 12, 8, 8);
    // Pointed ears
    ctx.fillRect(9, 8, 2, 4);
    ctx.fillRect(13, 8, 2, 4);
    // Snout
    ctx.fillRect(5, 16, 4, 3);
    // Glowing eyes
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(8, 14, 2, 2);
    // Legs
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(7, 24, 2, 5);
    ctx.fillRect(12, 24, 2, 5);
    ctx.fillRect(20, 24, 2, 5);
    ctx.fillRect(24, 24, 2, 5);
    return canvas;
  };

  const makeSkeletonSprite = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(16, 29, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Skull
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(12, 8, 8, 7);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(13, 11, 2, 2);
    ctx.fillRect(17, 11, 2, 2);

    // Ribcage & spine
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(15, 15, 2, 9);
    ctx.fillRect(12, 17, 8, 2);
    ctx.fillRect(13, 20, 6, 2);

    // Legs
    ctx.fillRect(13, 24, 2, 6);
    ctx.fillRect(17, 24, 2, 6);

    // Rusty sword
    ctx.fillStyle = '#78350f';
    ctx.fillRect(22, 19, 2, 4);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(21, 10, 2, 10);
    return canvas;
  };

  const makeGoblinSprite = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(16, 29, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Goblin green skin
    ctx.fillStyle = '#65a30d';
    ctx.fillRect(11, 10, 10, 8);
    // Pointy ears
    ctx.fillRect(7, 12, 4, 3);
    ctx.fillRect(21, 12, 4, 3);
    // Red glowing eyes
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(13, 13, 2, 2);
    ctx.fillRect(17, 13, 2, 2);

    // Leather Jerkin
    ctx.fillStyle = '#78350f';
    ctx.fillRect(12, 18, 8, 7);
    // Legs
    ctx.fillStyle = '#3f6212';
    ctx.fillRect(13, 25, 2, 4);
    ctx.fillRect(17, 25, 2, 4);
    // Bronze dagger
    ctx.fillStyle = '#b45309';
    ctx.fillRect(21, 17, 2, 7);
    return canvas;
  };

  scene.textures.addCanvas('enemy_slime', makeSlimeSprite());
  scene.textures.addCanvas('enemy_wolf', makeWolfSprite());
  scene.textures.addCanvas('enemy_skeleton', makeSkeletonSprite());
  scene.textures.addCanvas('enemy_goblin', makeGoblinSprite());
}
