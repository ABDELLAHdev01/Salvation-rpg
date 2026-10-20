/**
 * WorldTileGenerator.js
 * Master 2D Pixel-Art Texture & Environmental Props Generator for Phaser 3.
 * Generates production-ready, pixel-perfect tiles, props, crops, ores, and
 * animated enemy spritesheets dynamically on HTML5 Canvas.
 * Ensures zero missing textures, 100% offline reliability, and crisp nearest-neighbor rendering.
 */

export function registerWorldTextures(scene) {
  if (scene.textures.exists('world_tiles')) return;

  const TILE_SIZE = 32;

  // 0. Transparent Invisible Collision Texture
  const colCanvas = document.createElement('canvas');
  colCanvas.width = 4;
  colCanvas.height = 4;
  scene.textures.addCanvas('col_invisible', colCanvas);

  const createTileCanvas = (width, height, drawFn) => {
    const c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    drawFn(ctx);
    return c;
  };

  // =========================================================================
  // 1. TERRAIN TILES (32x32)
  // =========================================================================

  // Tile: Natural Velvet Meadow Grass (Kenney RPG style)
  const grassCanvas = createTileCanvas(TILE_SIZE, TILE_SIZE, (ctx) => {
    ctx.fillStyle = '#709c29'; // Natural warm meadow green base
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#679224'; // Subtle organic shading
    ctx.fillRect(6, 8, 3, 2);
    ctx.fillRect(20, 16, 3, 2);
    ctx.fillStyle = '#7ba930'; // Soft sunlit blade glints
    ctx.fillRect(7, 7, 2, 1);
    ctx.fillRect(21, 15, 2, 1);
  });
  if (!scene.textures.exists('tile_grass')) {
    scene.textures.addCanvas('tile_grass', grassCanvas);
  }

  // Tile: Sun-Worn Cobblestone Dirt Path
  const pathCanvas = createTileCanvas(TILE_SIZE, TILE_SIZE, (ctx) => {
    ctx.fillStyle = '#6e4624'; // Earth grout
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

    const pavers = [
      { x: 2, y: 2, w: 12, h: 8, fill: '#a87344', hi: '#c7925e', sh: '#85562c' },
      { x: 16, y: 2, w: 14, h: 8, fill: '#9a663a', hi: '#b8814d', sh: '#784a24' },
      { x: 2, y: 12, w: 8, h: 8, fill: '#9a663a', hi: '#b8814d', sh: '#784a24' },
      { x: 12, y: 12, w: 12, h: 8, fill: '#b47e4c', hi: '#d19965', sh: '#915f32' },
      { x: 26, y: 12, w: 4, h: 8, fill: '#9a663a', hi: '#b8814d', sh: '#784a24' },
      { x: 2, y: 22, w: 14, h: 8, fill: '#b47e4c', hi: '#d19965', sh: '#915f32' },
      { x: 18, y: 22, w: 12, h: 8, fill: '#a87344', hi: '#c7925e', sh: '#85562c' },
    ];

    pavers.forEach((p) => {
      ctx.fillStyle = p.fill;
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = p.hi;
      ctx.fillRect(p.x, p.y, p.w, 1);
      ctx.fillRect(p.x, p.y, 1, p.h);
      ctx.fillStyle = p.sh;
      ctx.fillRect(p.x, p.y + p.h - 1, p.w, 1);
      ctx.fillRect(p.x + p.w - 1, p.y, 1, p.h);
    });
  });
  if (!scene.textures.exists('tile_path')) {
    scene.textures.addCanvas('tile_path', pathCanvas);
  }

  // Tile: Deep Cavern Mineral Stone
  const stoneCanvas = createTileCanvas(TILE_SIZE, TILE_SIZE, (ctx) => {
    ctx.fillStyle = '#1c1e28'; // Deep slate
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#2d3244';
    ctx.fillRect(2, 2, 13, 12);
    ctx.fillRect(17, 2, 13, 12);
    ctx.fillRect(2, 16, 13, 14);
    ctx.fillRect(17, 16, 13, 14);
    // Stone Facet Highlights
    ctx.fillStyle = '#4b5472';
    ctx.fillRect(2, 2, 13, 1);
    ctx.fillRect(17, 2, 13, 1);
    ctx.fillRect(2, 16, 13, 1);
    ctx.fillRect(17, 16, 13, 1);
    // Mineral Vein Inclusions
    ctx.fillStyle = '#38bdf8'; // Glowing azure crystal speck
    ctx.fillRect(8, 22, 2, 2);
    ctx.fillStyle = '#facc15'; // Golden pyrite speck
    ctx.fillRect(24, 7, 2, 2);
  });
  if (!scene.textures.exists('tile_stone')) {
    scene.textures.addCanvas('tile_stone', stoneCanvas);
  }

  // Tile: Rich Moist Farm Soil
  const soilCanvas = createTileCanvas(TILE_SIZE, TILE_SIZE, (ctx) => {
    ctx.fillStyle = '#3c200e'; // Moist humus
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    for (let y = 3; y < 30; y += 7) {
      ctx.fillStyle = '#6c3a1a'; // Ridge
      ctx.fillRect(2, y, 28, 4);
      ctx.fillStyle = '#874b23'; // Sun-warmed crest
      ctx.fillRect(2, y, 28, 1);
      ctx.fillStyle = '#2c1609'; // Shadow furrow
      ctx.fillRect(2, y + 4, 28, 2);
      ctx.fillRect(6, y + 2, 2, 2);
      ctx.fillRect(20, y + 1, 2, 2);
    }
  });
  if (!scene.textures.exists('tile_soil')) {
    scene.textures.addCanvas('tile_soil', soilCanvas);
  }

  // Tile: Shimmering Sylvan Water
  const waterCanvas = createTileCanvas(TILE_SIZE, TILE_SIZE, (ctx) => {
    ctx.fillStyle = '#026090'; // Deep blue
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#0885c2';
    ctx.fillRect(1, 1, 30, 30);
    ctx.fillStyle = '#38bdf8'; // Ripples
    ctx.fillRect(4, 7, 12, 2);
    ctx.fillRect(18, 17, 10, 2);
    ctx.fillRect(6, 23, 14, 2);
    ctx.fillStyle = '#bae6fd'; // Sunlight glints
    ctx.fillRect(8, 8, 3, 1);
    ctx.fillRect(22, 18, 3, 1);
  });
  if (!scene.textures.exists('tile_water')) {
    scene.textures.addCanvas('tile_water', waterCanvas);
  }

  // Composite Master Tileset
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

  // =========================================================================
  // 2. DETAILED ENVIRONMENTAL PROPS
  // =========================================================================

  // Gabled Timber Manor House (96x80)
  const houseCanvas = createTileCanvas(96, 80, (ctx) => {
    // Ground Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(48, 76, 44, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Stone Foundation
    ctx.fillStyle = '#4b5563';
    ctx.fillRect(10, 68, 76, 8);
    ctx.fillStyle = '#6b7280';
    ctx.fillRect(10, 68, 76, 1);
    // Timber Walls
    ctx.fillStyle = '#92400e';
    ctx.fillRect(12, 32, 72, 36);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(14, 34, 68, 32);
    // Vertical Timber Studs
    ctx.fillStyle = '#5c2b05';
    for (let x = 14; x <= 80; x += 16) {
      ctx.fillRect(x, 32, 3, 36);
    }
    // Gabled Shingled Red Roof
    for (let i = 0; i < 32; i += 1) {
      const w = 92 - i * 2.8;
      const x = 48 - w / 2;
      const y = 32 - i;
      if (y >= 4) {
        ctx.fillStyle = (i % 3 === 0) ? '#b91c1c' : '#991b1b';
        ctx.fillRect(Math.round(x), y, Math.round(w), 1);
      }
    }
    // Roof Overhang Eaves Trim
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(2, 31, 92, 3);
    // Brick Chimney
    ctx.fillStyle = '#78350f';
    ctx.fillRect(70, 6, 10, 18);
    ctx.fillStyle = '#4b5563';
    ctx.fillRect(69, 5, 12, 3);
    // Arched Oak Door
    ctx.fillStyle = '#451a03';
    ctx.fillRect(40, 46, 16, 22);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(42, 48, 12, 20);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(51, 58, 2, 2); // Brass knob
    // Leaded Windows with Warm Golden Interior Glow
    const drawWin = (wx, wy) => {
      ctx.fillStyle = '#451a03';
      ctx.fillRect(wx, wy, 14, 14);
      ctx.fillStyle = '#fef08a'; // Amber radiance
      ctx.fillRect(wx + 1, wy + 1, 12, 12);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(wx + 2, wy + 2, 10, 10);
      ctx.fillStyle = '#78350f'; // Mullion cross
      ctx.fillRect(wx + 6, wy + 1, 2, 12);
      ctx.fillRect(wx + 1, wy + 6, 12, 2);
    };
    drawWin(18, 44);
    drawWin(64, 44);
  });
  scene.textures.addCanvas('prop_house', houseCanvas);

  // Layered Pine Tree (48x64)
  const treeCanvas = createTileCanvas(48, 64, (ctx) => {
    // Ground Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(24, 60, 18, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Sturdy Trunk
    ctx.fillStyle = '#451a03';
    ctx.fillRect(20, 40, 8, 20);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(22, 42, 4, 18);
    // Layered Fir Foliage
    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.ellipse(24, 40, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.ellipse(24, 38, 17, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(24, 27, 15, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(24, 25, 14, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(24, 15, 11, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.ellipse(24, 13, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  scene.textures.addCanvas('prop_tree', treeCanvas);

  // Storage Vault Chest (32x32)
  const chestCanvas = createTileCanvas(32, 32, (ctx) => {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(16, 29, 12, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5c2b05';
    ctx.fillRect(5, 10, 22, 18);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(6, 11, 20, 16);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(7, 12, 18, 14);
    // Iron Strapping
    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(5, 10, 3, 18);
    ctx.fillRect(24, 10, 3, 18);
    ctx.fillRect(5, 17, 22, 2);
    // Gold Padlock
    ctx.fillStyle = '#eab308';
    ctx.fillRect(13, 15, 6, 6);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(14, 16, 4, 4);
    ctx.fillStyle = '#18181b';
    ctx.fillRect(15, 18, 2, 2);
  });
  scene.textures.addCanvas('prop_chest', chestCanvas);

  // Blacksmith Forge Anvil & Workbench (32x32)
  const benchCanvas = createTileCanvas(32, 32, (ctx) => {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(16, 29, 12, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.fillRect(4, 14, 24, 5);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(4, 14, 24, 1);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(6, 19, 3, 10);
    ctx.fillRect(23, 19, 3, 10);
    // Solid Steel Anvil
    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(10, 7, 12, 7);
    ctx.fillStyle = '#71717a';
    ctx.fillRect(10, 7, 12, 1);
    ctx.fillRect(7, 8, 4, 3); // Horn
    ctx.fillStyle = '#27272a';
    ctx.fillRect(13, 14, 6, 2);
    // Hammer on table
    ctx.fillStyle = '#78350f';
    ctx.fillRect(22, 8, 2, 7);
    ctx.fillStyle = '#71717a';
    ctx.fillRect(21, 7, 4, 2);
  });
  scene.textures.addCanvas('prop_workbench', benchCanvas);

  // Sylvan Carved Monolith Shrine (32x32)
  const shrineCanvas = createTileCanvas(32, 32, (ctx) => {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(16, 29, 11, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Ancient Monolith Stone
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(8, 6, 16, 22);
    ctx.fillStyle = '#334155';
    ctx.fillRect(9, 7, 14, 20);
    ctx.fillStyle = '#475569';
    ctx.fillRect(9, 7, 14, 2);
    // Moss patches
    ctx.fillStyle = '#15803d';
    ctx.fillRect(8, 22, 5, 4);
    ctx.fillRect(19, 18, 5, 4);
    // Glowing Sylvan Runes
    ctx.fillStyle = '#34d399';
    ctx.fillRect(15, 10, 2, 10);
    ctx.fillRect(12, 14, 8, 2);
    ctx.fillRect(13, 11, 2, 2);
    ctx.fillRect(17, 17, 2, 2);
    ctx.fillStyle = '#a7f3d0';
    ctx.fillRect(15, 14, 2, 2); // Center gleam
  });
  scene.textures.addCanvas('prop_shrine', shrineCanvas);

  // =========================================================================
  // 3. MINING ORE BOULDERS
  // =========================================================================
  const makeOreSprite = (oreColor, shineColor) => createTileCanvas(32, 32, (ctx) => {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(16, 28, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Faceted Granite Boulder
    ctx.fillStyle = '#27272a';
    ctx.fillRect(6, 10, 20, 16);
    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(7, 8, 18, 18);
    ctx.fillStyle = '#52525b';
    ctx.fillRect(9, 10, 14, 14);
    ctx.fillStyle = '#71717a';
    ctx.fillRect(7, 8, 10, 2);
    ctx.fillRect(7, 8, 2, 10);
    // Veins
    ctx.fillStyle = oreColor;
    ctx.fillRect(11, 11, 6, 5);
    ctx.fillRect(18, 16, 6, 6);
    ctx.fillRect(10, 18, 5, 5);
    // Shimmer
    ctx.fillStyle = shineColor;
    ctx.fillRect(12, 12, 3, 2);
    ctx.fillRect(19, 17, 3, 2);
    ctx.fillRect(11, 19, 2, 2);
  });

  scene.textures.addCanvas('ore_iron', makeOreSprite('#a1a1aa', '#f4f4f5'));
  scene.textures.addCanvas('ore_copper', makeOreSprite('#d97706', '#fbbf24'));
  scene.textures.addCanvas('ore_gold', makeOreSprite('#eab308', '#fef08a'));
  scene.textures.addCanvas('ore_crystal', makeOreSprite('#a855f7', '#f5d0fe'));

  // =========================================================================
  // 4. 4-STAGE FARMING CROPS
  // =========================================================================
  const makeCropSprite = (fruitColor, topColor, leafColor, stage) => createTileCanvas(32, 32, (ctx) => {
    if (stage === 1) { // Sprout
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(15, 20, 2, 7);
      ctx.fillRect(13, 18, 2, 2);
      ctx.fillRect(17, 18, 2, 2);
    } else if (stage === 2) { // Seedling
      ctx.fillStyle = leafColor;
      ctx.fillRect(14, 16, 4, 11);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(11, 14, 3, 4);
      ctx.fillRect(18, 14, 3, 4);
    } else if (stage === 3) { // Growing plant
      ctx.fillStyle = leafColor;
      ctx.fillRect(13, 12, 6, 15);
      ctx.fillRect(9, 12, 4, 6);
      ctx.fillRect(19, 12, 4, 6);
      ctx.fillStyle = topColor;
      ctx.fillRect(14, 17, 4, 4);
    } else { // Mature harvestable crop
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(16, 27, 7, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = leafColor;
      ctx.fillRect(12, 8, 8, 14);
      ctx.fillRect(7, 9, 5, 7);
      ctx.fillRect(20, 9, 5, 7);
      // Ripened fruit/root body
      ctx.fillStyle = fruitColor;
      ctx.beginPath();
      ctx.ellipse(16, 20, 6, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = topColor;
      ctx.beginPath();
      ctx.ellipse(16, 17, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(14, 18, 2, 2);
    }
  });

  const crops = [
    { id: 'turnip', fruit: '#f1f5f9', top: '#a855f7', leaf: '#16a34a' },
    { id: 'wheat', fruit: '#eab308', top: '#facc15', leaf: '#ca8a04' },
    { id: 'herb', fruit: '#34d399', top: '#10b981', leaf: '#059669' },
    { id: 'moonberry', fruit: '#c084fc', top: '#9333ea', leaf: '#6b21a8' },
    { id: 'sunroot', fruit: '#f97316', top: '#ea580c', leaf: '#c2410c' },
  ];

  crops.forEach((crop) => {
    for (let s = 1; s <= 4; s += 1) {
      scene.textures.addCanvas(
        `crop_${crop.id}_${s}`,
        makeCropSprite(crop.fruit, crop.top, crop.leaf, s)
      );
    }
  });

  // =========================================================================
  // 5. ANIMATED ENEMY SPRITESHEETS (128x32, 4 frames of 32x32)
  // =========================================================================

  // Helper to register 4-frame animated spritesheet
  const createEnemySheetCanvas = (drawFn) => {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 32;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    for (let f = 0; f < 4; f += 1) {
      drawFn(ctx, f * 32, f);
    }
    return c;
  };

  // 1. Slime (Bouncing Jelly)
  const slimeCanvas = createEnemySheetCanvas((ctx, ox, f) => {
    const squish = (f === 1) ? 2 : (f === 2) ? -2 : 0;
    const yOff = (f === 2) ? -3 : 0;
    const shadowW = (f === 1) ? 12 : (f === 2) ? 6 : 9;

    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(ox + 16, 29, shadowW, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.ellipse(ox + 16, 21 + yOff + squish / 2, 8 + (f === 1 ? 2 : 0), 7 - squish, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.ellipse(ox + 16, 20 + yOff + squish / 2, 7 + (f === 1 ? 2 : 0), 6 - squish, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner nucleus
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.ellipse(ox + 16, 20 + yOff, 4, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#022c22';
    ctx.fillRect(ox + 13, 18 + yOff, 2, 3);
    ctx.fillRect(ox + 18, 18 + yOff, 2, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ox + 13, 18 + yOff, 1, 1);
    ctx.fillRect(ox + 18, 18 + yOff, 1, 1);
  });
  scene.textures.addSpriteSheet('enemy_slime', slimeCanvas, { frameWidth: 32, frameHeight: 32 });

  // 2. Shadow Wolf
  const wolfCanvas = createEnemySheetCanvas((ctx, ox, f) => {
    const step = (f === 1) ? 2 : (f === 3) ? -2 : 0;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(ox + 16, 29, 11, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(ox + 10, 14, 15, 9);
    ctx.fillStyle = '#312e81';
    ctx.fillRect(ox + 11, 15, 13, 7);

    ctx.fillRect(ox + 6, 11, 8, 8);
    ctx.fillRect(ox + 3, 15, 4, 3);
    ctx.fillRect(ox + 7, 7, 2, 4);
    ctx.fillRect(ox + 11, 7, 2, 4);

    // Glowing red eyes
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(ox + 6, 13, 2, 2);

    // Prowling legs
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(ox + 6 + step, 23, 3, 6);
    ctx.fillRect(ox + 12 - step, 23, 3, 6);
    ctx.fillRect(ox + 18 + step, 23, 3, 6);
    ctx.fillRect(ox + 22 - step, 23, 3, 6);
  });
  scene.textures.addSpriteSheet('enemy_wolf', wolfCanvas, { frameWidth: 32, frameHeight: 32 });

  // 3. Deepforge Skeleton Warrior
  const skeletonCanvas = createEnemySheetCanvas((ctx, ox, f) => {
    const bob = (f === 1 || f === 3) ? -1 : 0;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(ox + 16, 29, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Skull
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(ox + 12, 7 + bob, 8, 7);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(ox + 13, 9 + bob, 2, 2);
    ctx.fillRect(ox + 17, 9 + bob, 2, 2);
    ctx.fillStyle = '#38bdf8'; // Cyan socket flame
    ctx.fillRect(ox + 13, 9 + bob, 1, 1);
    ctx.fillRect(ox + 17, 9 + bob, 1, 1);

    // Ribcage & spine
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(ox + 15, 14 + bob, 2, 9);
    ctx.fillRect(ox + 12, 16 + bob, 8, 2);
    ctx.fillRect(ox + 13, 19 + bob, 6, 2);

    // Iron Helmet
    ctx.fillStyle = '#475569';
    ctx.fillRect(ox + 11, 6 + bob, 10, 3);

    // Rusty broadsword held at side
    const bladeY = (f === 2) ? 6 : 10;
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(ox + 22, bladeY + bob, 2, 14);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(ox + 21, bladeY + 10 + bob, 4, 2);

    // Legs
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(ox + 13, 23 + bob, 2, 6);
    ctx.fillRect(ox + 17, 23 + bob, 2, 6);
  });
  scene.textures.addSpriteSheet('enemy_skeleton', skeletonCanvas, { frameWidth: 32, frameHeight: 32 });

  // 4. Wildlands Goblin Raider
  const goblinCanvas = createEnemySheetCanvas((ctx, ox, f) => {
    const bob = (f === 1 || f === 3) ? -1 : 0;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(ox + 16, 29, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Goblin green skin
    ctx.fillStyle = '#65a30d';
    ctx.fillRect(ox + 11, 9 + bob, 10, 8);
    ctx.fillRect(ox + 7, 11 + bob, 4, 3); // Pointy ears
    ctx.fillRect(ox + 21, 11 + bob, 4, 3);

    ctx.fillStyle = '#dc2626'; // Red eyes
    ctx.fillRect(ox + 13, 12 + bob, 2, 2);
    ctx.fillRect(ox + 17, 12 + bob, 2, 2);

    ctx.fillStyle = '#78350f'; // Leather Hood & Jerkin
    ctx.fillRect(ox + 10, 7 + bob, 12, 3);
    ctx.fillRect(ox + 12, 17 + bob, 8, 7);

    // Bronze Daggers
    ctx.fillStyle = '#b45309';
    ctx.fillRect(ox + 21, 16 + bob, 2, 7);
    ctx.fillRect(ox + 9, 16 + bob, 2, 7);

    // Boots
    ctx.fillStyle = '#3f6212';
    ctx.fillRect(ox + 13, 24 + bob, 2, 5);
    ctx.fillRect(ox + 17, 24 + bob, 2, 5);
  });
  scene.textures.addSpriteSheet('enemy_goblin', goblinCanvas, { frameWidth: 32, frameHeight: 32 });
}
