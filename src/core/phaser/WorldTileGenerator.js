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

  // 0. Transparent Invisible Collision Texture & Soft Particle Dot Texture
  const colCanvas = document.createElement('canvas');
  colCanvas.width = 4;
  colCanvas.height = 4;
  if (!scene.textures.exists('col_invisible')) {
    scene.textures.addCanvas('col_invisible', colCanvas);
  }
  const dotCanvas = document.createElement('canvas');
  dotCanvas.width = 4;
  dotCanvas.height = 4;
  const dotCtx = dotCanvas.getContext('2d');
  dotCtx.fillStyle = '#ffffff';
  dotCtx.beginPath();
  dotCtx.arc(2, 2, 1.8, 0, Math.PI * 2);
  dotCtx.fill();
  if (!scene.textures.exists('fx_particle_dot')) {
    scene.textures.addCanvas('fx_particle_dot', dotCanvas);
  }

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

  // Tile: Rich Textured Classic RPG Earth Meadow Grass
  const grassCanvas = createTileCanvas(TILE_SIZE, TILE_SIZE, (ctx) => {
    ctx.fillStyle = '#3a6c36'; // Soothing earthy natural meadow base
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

    // Organic stippled blade texture across tile
    for (let y = 0; y < TILE_SIZE; y += 1) {
      for (let x = 0; x < TILE_SIZE; x += 1) {
        const n = (x * 17 + y * 23) % 7;
        if (n === 0) {
          ctx.fillStyle = '#305c2c';
          ctx.fillRect(x, y, 1, 1);
        } else if (n === 1) {
          ctx.fillStyle = '#447a3e';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    // Pixel grass blade clusters with root shadows
    const blades = [
      { x: 4, y: 6 }, { x: 18, y: 4 }, { x: 12, y: 16 }, { x: 26, y: 14 },
      { x: 6, y: 24 }, { x: 22, y: 26 },
    ];
    blades.forEach((b) => {
      ctx.fillStyle = '#244420'; // Root shadow
      ctx.fillRect(b.x, b.y + 2, 3, 1);
      ctx.fillStyle = '#4e8a46'; // Left blade
      ctx.fillRect(b.x, b.y, 1, 2);
      ctx.fillStyle = '#5c9e52'; // Tall center highlight blade
      ctx.fillRect(b.x + 1, b.y - 1, 1, 3);
      ctx.fillStyle = '#488240'; // Right blade
      ctx.fillRect(b.x + 2, b.y, 1, 2);
    });
  });
  if (!scene.textures.exists('tile_grass')) {
    scene.textures.addCanvas('tile_grass', grassCanvas);
  }

  // Tile: Meadow Grass with Golden Buttercups & Daisies
  const grassFlowersCanvas = createTileCanvas(TILE_SIZE, TILE_SIZE, (ctx) => {
    ctx.drawImage(grassCanvas, 0, 0);
    // Daisy at (8, 8)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, 7, 1, 3);
    ctx.fillRect(7, 8, 3, 1);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(8, 8, 1, 1);
    // Buttercup at (24, 12)
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(23, 11, 3, 3);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(24, 12, 1, 1);
    // Bluebell at (14, 22)
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(13, 21, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(14, 22, 1, 1);
  });
  if (!scene.textures.exists('tile_grass_flowers')) {
    scene.textures.addCanvas('tile_grass_flowers', grassFlowersCanvas);
  }

  // Tile: Meadow Grass with Emerald Clover Patches
  const grassCloversCanvas = createTileCanvas(TILE_SIZE, TILE_SIZE, (ctx) => {
    ctx.drawImage(grassCanvas, 0, 0);
    // Clover 1
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(10, 13, 1, 1);
    ctx.fillRect(9, 14, 1, 1);
    ctx.fillRect(11, 14, 1, 1);
    ctx.fillStyle = '#15803d';
    ctx.fillRect(10, 15, 1, 1);
    // Clover 2
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(22, 7, 1, 1);
    ctx.fillRect(21, 8, 1, 1);
    ctx.fillRect(23, 8, 1, 1);
    ctx.fillStyle = '#15803d';
    ctx.fillRect(22, 9, 1, 1);
  });
  if (!scene.textures.exists('tile_grass_clovers')) {
    scene.textures.addCanvas('tile_grass_clovers', grassCloversCanvas);
  }

  // Tile: Meadow Grass with Stepping Pebbles
  const grassPebblesCanvas = createTileCanvas(TILE_SIZE, TILE_SIZE, (ctx) => {
    ctx.drawImage(grassCanvas, 0, 0);
    // River pebble 1
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(15, 12, 3, 2);
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(15, 11, 2, 1);
    ctx.fillStyle = '#4b5563';
    ctx.fillRect(15, 14, 3, 1);
    // Pebble 2
    ctx.fillStyle = '#a8a29e';
    ctx.fillRect(8, 20, 2, 2);
    ctx.fillStyle = '#57534e';
    ctx.fillRect(8, 22, 2, 1);
  });
  if (!scene.textures.exists('tile_grass_pebbles')) {
    scene.textures.addCanvas('tile_grass_pebbles', grassPebblesCanvas);
  }

  // Tile: Rich Loam & Dirt Pathway
  const dirtCanvas = createTileCanvas(TILE_SIZE, TILE_SIZE, (ctx) => {
    ctx.fillStyle = '#966035'; // Rich earth base
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    for (let y = 0; y < TILE_SIZE; y += 1) {
      for (let x = 0; x < TILE_SIZE; x += 1) {
        const v = (x * 19 + y * 31) % 5;
        if (v === 0) {
          ctx.fillStyle = '#7e4d26';
          ctx.fillRect(x, y, 1, 1);
        } else if (v === 1) {
          ctx.fillStyle = '#ae7544';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    // Soil pebbles
    ctx.fillStyle = '#d6b38c';
    ctx.fillRect(6, 10, 2, 1);
    ctx.fillStyle = '#5a3517';
    ctx.fillRect(20, 18, 2, 1);
    ctx.fillStyle = '#c79d72';
    ctx.fillRect(14, 26, 2, 2);
  });
  if (!scene.textures.exists('tile_dirt')) {
    scene.textures.addCanvas('tile_dirt', dirtCanvas);
  }

  // Tile: City Plaza Flagstone Pavers
  const cityStoneCanvas = createTileCanvas(TILE_SIZE, TILE_SIZE, (ctx) => {
    ctx.fillStyle = '#4e443c'; // Dark mortar grout
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    const pavers = [
      { x: 1, y: 1, w: 14, h: 8, fill: '#9b948c', hi: '#b8b1a8', sh: '#736c64' },
      { x: 17, y: 1, w: 14, h: 8, fill: '#8c847d', hi: '#a8a098', sh: '#686058' },
      { x: 1, y: 11, w: 7, h: 9, fill: '#8f8880', hi: '#aaa299', sh: '#6b645c' },
      { x: 10, y: 11, w: 13, h: 9, fill: '#a59e96', hi: '#c2bbb2', sh: '#7e7770' },
      { x: 25, y: 11, w: 6, h: 9, fill: '#948c85', hi: '#b0a8a0', sh: '#706861' },
      { x: 1, y: 22, w: 13, h: 9, fill: '#918a82', hi: '#ada59d', sh: '#6d665f' },
      { x: 16, y: 22, w: 15, h: 9, fill: '#a09890', hi: '#bcb4ac', sh: '#79726a' },
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
  if (!scene.textures.exists('tile_city_stone')) {
    scene.textures.addCanvas('tile_city_stone', cityStoneCanvas);
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

  // Tile: Polished Oak Interior Floorboards
  const woodFloorCanvas = createTileCanvas(TILE_SIZE, TILE_SIZE, (ctx) => {
    ctx.fillStyle = '#784318'; // Oak wood base
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    // 4 horizontal floor planks
    for (let p = 0; p < 4; p += 1) {
      const py = p * 8;
      ctx.fillStyle = p % 2 === 0 ? '#8c5222' : '#965a28';
      ctx.fillRect(0, py + 1, TILE_SIZE, 6);
      ctx.fillStyle = '#a66833'; // Highlight top of plank
      ctx.fillRect(0, py + 1, TILE_SIZE, 1);
      ctx.fillStyle = '#542c0c'; // Shadow seam between planks
      ctx.fillRect(0, py + 7, TILE_SIZE, 1);
      // Nail heads
      ctx.fillStyle = '#331a06';
      ctx.fillRect(3, py + 3, 1, 1);
      ctx.fillRect(28, py + 3, 1, 1);
    }
  });
  if (!scene.textures.exists('tile_wood_floor')) {
    scene.textures.addCanvas('tile_wood_floor', woodFloorCanvas);
  }

  // Tile: Cozy Cottage Timber Wall
  const indoorWallCanvas = createTileCanvas(TILE_SIZE, TILE_SIZE, (ctx) => {
    ctx.fillStyle = '#4a2810'; // Dark timber framing
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    // Warm plaster / brick infill
    ctx.fillStyle = '#c7b08b';
    ctx.fillRect(2, 4, 12, 24);
    ctx.fillRect(18, 4, 12, 24);
    // Wood grain studs
    ctx.fillStyle = '#5a3315';
    ctx.fillRect(0, 0, TILE_SIZE, 4); // Top moulding
    ctx.fillRect(0, 28, TILE_SIZE, 4); // Baseboard moulding
    ctx.fillRect(14, 0, 4, TILE_SIZE); // Center vertical beam
  });
  if (!scene.textures.exists('tile_indoor_wall')) {
    scene.textures.addCanvas('tile_indoor_wall', indoorWallCanvas);
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
  if (!scene.textures.exists('world_tiles')) {
    scene.textures.addCanvas('world_tiles', terrainCanvas);
  }

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
  if (!scene.textures.exists('prop_house')) {
    scene.textures.addCanvas('prop_house', houseCanvas);
  }

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
  if (!scene.textures.exists('prop_tree')) {
    scene.textures.addCanvas('prop_tree', treeCanvas);
  }

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
  if (!scene.textures.exists('prop_chest')) {
    scene.textures.addCanvas('prop_chest', chestCanvas);
  }

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
  if (!scene.textures.exists('prop_workbench')) {
    scene.textures.addCanvas('prop_workbench', benchCanvas);
  }

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
  if (!scene.textures.exists('prop_shrine')) {
    scene.textures.addCanvas('prop_shrine', shrineCanvas);
  }

  // =========================================================================
  // 2b. CITY & ADVENTURERS' GUILD MASTER PROPS (Canvas Fallbacks)
  // =========================================================================

  // 1. prop_guild_board (32x32)
  if (!scene.textures.exists('prop_guild_board')) {
    const guildBoardCanvas = createTileCanvas(32, 32, (ctx) => {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(16, 29, 12, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wooden board frame
      ctx.fillStyle = '#451a03';
      ctx.fillRect(4, 4, 24, 20);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(6, 6, 20, 16);
      // Posts
      ctx.fillStyle = '#451a03';
      ctx.fillRect(6, 24, 3, 7);
      ctx.fillRect(23, 24, 3, 7);
      // Pinned notices
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(8, 8, 7, 6);
      ctx.fillRect(17, 9, 7, 6);
      ctx.fillRect(9, 15, 6, 5);
      ctx.fillRect(17, 16, 6, 5);
      // Red wax seals
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(11, 7, 2, 2);
      ctx.fillRect(20, 8, 2, 2);
    });
    scene.textures.addCanvas('prop_guild_board', guildBoardCanvas);
  }

  // 2. prop_guild_desk (48x32)
  if (!scene.textures.exists('prop_guild_desk')) {
    const guildDeskCanvas = createTileCanvas(48, 32, (ctx) => {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(24, 28, 20, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Desk counter
      ctx.fillStyle = '#451a03';
      ctx.fillRect(4, 10, 40, 18);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(6, 12, 36, 14);
      // Counter top
      ctx.fillStyle = '#92400e';
      ctx.fillRect(2, 8, 44, 4);
      // Open ledger & quill
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(18, 6, 10, 5);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(22, 6, 1, 5);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(30, 4, 2, 6); // Golden candle/quill
    });
    scene.textures.addCanvas('prop_guild_desk', guildDeskCanvas);
  }

  // 3. prop_forge_furnace (32x32)
  if (!scene.textures.exists('prop_forge_furnace')) {
    const furnaceCanvas = createTileCanvas(32, 32, (ctx) => {
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(16, 29, 14, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Stone chimney & kiln
      ctx.fillStyle = '#374151';
      ctx.fillRect(6, 4, 20, 24);
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(8, 6, 16, 20);
      // Kiln opening & glowing coals
      ctx.fillStyle = '#111827';
      ctx.fillRect(10, 14, 12, 12);
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(11, 16, 10, 9);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(12, 19, 8, 5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(14, 21, 4, 2);
    });
    scene.textures.addCanvas('prop_forge_furnace', furnaceCanvas);
  }

  // 4. prop_anvil (32x32)
  if (!scene.textures.exists('prop_anvil')) {
    const anvilCanvas = createTileCanvas(32, 32, (ctx) => {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(16, 28, 11, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Oak stump base
      ctx.fillStyle = '#451a03';
      ctx.fillRect(10, 16, 12, 12);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(11, 17, 10, 10);
      // Iron horn anvil
      ctx.fillStyle = '#374151';
      ctx.fillRect(8, 9, 16, 8);
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(8, 9, 16, 2);
      ctx.fillRect(5, 10, 4, 4); // Horn
    });
    scene.textures.addCanvas('prop_anvil', anvilCanvas);
  }

  // 5. prop_market_stand (48x32)
  if (!scene.textures.exists('prop_market_stand')) {
    const marketCanvas = createTileCanvas(48, 32, (ctx) => {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(24, 28, 20, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Counter
      ctx.fillStyle = '#78350f';
      ctx.fillRect(6, 14, 36, 14);
      // Striped awning
      for (let i = 0; i < 44; i += 8) {
        ctx.fillStyle = (i % 16 === 0) ? '#dc2626' : '#fef3c7';
        ctx.fillRect(2 + i, 2, 8, 8);
      }
      // Awning posts
      ctx.fillStyle = '#451a03';
      ctx.fillRect(4, 8, 2, 18);
      ctx.fillRect(42, 8, 2, 18);
      // Produce in crates
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(10, 14, 6, 4);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(18, 14, 6, 4);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(26, 14, 6, 4);
    });
    scene.textures.addCanvas('prop_market_stand', marketCanvas);
  }

  // 6. prop_inn_bed (32x32)
  if (!scene.textures.exists('prop_inn_bed')) {
    const innBedCanvas = createTileCanvas(32, 32, (ctx) => {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(16, 28, 12, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Bed frame
      ctx.fillStyle = '#5c2b05';
      ctx.fillRect(6, 6, 20, 22);
      // White pillow
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(8, 8, 16, 6);
      // Cozy blue quilt blanket
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(8, 14, 16, 12);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(8, 14, 16, 2);
    });
    scene.textures.addCanvas('prop_inn_bed', innBedCanvas);
  }

  // 7. prop_town_fountain (48x48)
  if (!scene.textures.exists('prop_town_fountain')) {
    const fountainCanvas = createTileCanvas(48, 48, (ctx) => {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(24, 42, 20, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Stone basin
      ctx.fillStyle = '#4b5563';
      ctx.beginPath();
      ctx.ellipse(24, 28, 20, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      // Clear pool water
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.ellipse(24, 28, 16, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.ellipse(24, 27, 12, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Center pedestal & water jet
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(22, 14, 4, 14);
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(23, 8, 2, 8);
      ctx.fillRect(21, 10, 6, 2);
    });
    scene.textures.addCanvas('prop_town_fountain', fountainCanvas);
  }

  // 8. prop_notice_board (32x32)
  if (!scene.textures.exists('prop_notice_board')) {
    const noticeBoardCanvas = createTileCanvas(32, 32, (ctx) => {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(16, 28, 9, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Post
      ctx.fillStyle = '#451a03';
      ctx.fillRect(15, 16, 3, 13);
      // Board
      ctx.fillStyle = '#78350f';
      ctx.fillRect(5, 5, 22, 14);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(6, 6, 20, 12);
      // Pinned notices
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(8, 8, 6, 5);
      ctx.fillRect(16, 9, 7, 6);
    });
    scene.textures.addCanvas('prop_notice_board', noticeBoardCanvas);
  }

  // 9. prop_road_sign (32x32)
  if (!scene.textures.exists('prop_road_sign')) {
    const roadSignCanvas = createTileCanvas(32, 32, (ctx) => {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(16, 29, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Post
      ctx.fillStyle = '#451a03';
      ctx.fillRect(15, 10, 3, 19);
      // Signboards
      ctx.fillStyle = '#78350f';
      ctx.fillRect(6, 6, 18, 5);
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(7, 7, 16, 3);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(8, 13, 18, 5);
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(9, 14, 16, 3);
    });
    scene.textures.addCanvas('prop_road_sign', roadSignCanvas);
  }

  // 10. prop_fireplace (48x48) - Cozy stone hearth with burning logs
  if (!scene.textures.exists('prop_fireplace')) {
    const fireplaceCanvas = createTileCanvas(48, 48, (ctx) => {
      // Hearth stone base
      ctx.fillStyle = '#334155';
      ctx.fillRect(4, 8, 40, 36);
      ctx.fillStyle = '#475569';
      ctx.fillRect(6, 10, 36, 32);
      ctx.fillStyle = '#1e293b'; // Firebox arch interior
      ctx.fillRect(12, 18, 24, 24);
      // Burning logs
      ctx.fillStyle = '#78350f';
      ctx.fillRect(14, 34, 20, 6);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(16, 30, 16, 5);
      // Glowing embers
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(16, 32, 16, 4);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(18, 28, 12, 5);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(20, 24, 8, 5);
      // Stone mantle shelf
      ctx.fillStyle = '#64748b';
      ctx.fillRect(2, 6, 44, 4);
    });
    scene.textures.addCanvas('prop_fireplace', fireplaceCanvas);
  }

  // 11. prop_bookshelf (32x48) - Carved wooden bookcase packed with tomes
  if (!scene.textures.exists('prop_bookshelf')) {
    const bookshelfCanvas = createTileCanvas(32, 48, (ctx) => {
      // Wood frame
      ctx.fillStyle = '#451a03';
      ctx.fillRect(2, 4, 28, 42);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(4, 6, 24, 38);
      // 3 shelves of books
      const shelvesY = [14, 26, 38];
      const colors = ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#9333ea', '#0284c7'];
      shelvesY.forEach((sy, sIdx) => {
        ctx.fillStyle = '#451a03';
        ctx.fillRect(4, sy, 24, 2); // shelf wood plank
        for (let b = 0; b < 5; b += 1) {
          ctx.fillStyle = colors[(sIdx * 3 + b) % colors.length];
          ctx.fillRect(6 + b * 4, sy - 7, 3, 7);
          ctx.fillStyle = '#fef08a'; // gold foil spine
          ctx.fillRect(6 + b * 4, sy - 5, 3, 1);
        }
      });
    });
    scene.textures.addCanvas('prop_bookshelf', bookshelfCanvas);
  }

  // 12. prop_table_chair (48x32) - Dining table with stool and plate
  if (!scene.textures.exists('prop_table_chair')) {
    const tableCanvas = createTileCanvas(48, 32, (ctx) => {
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(24, 26, 20, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Table top
      ctx.fillStyle = '#5c2b05';
      ctx.fillRect(10, 10, 28, 14);
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(11, 11, 26, 12);
      // Legs
      ctx.fillStyle = '#451a03';
      ctx.fillRect(12, 22, 3, 6);
      ctx.fillRect(33, 22, 3, 6);
      // Food plate & candle
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(20, 13, 6, 6);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(22, 15, 2, 2);
      // Chair stool
      ctx.fillStyle = '#78350f';
      ctx.fillRect(4, 14, 6, 10);
      ctx.fillRect(38, 14, 6, 10);
    });
    scene.textures.addCanvas('prop_table_chair', tableCanvas);
  }

  // 13. prop_indoor_rug (64x40) - Ornate crimson velvet rug
  if (!scene.textures.exists('prop_indoor_rug')) {
    const rugCanvas = createTileCanvas(64, 40, (ctx) => {
      // Crimson base
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(2, 2, 60, 36);
      // Gold fringe border
      ctx.fillStyle = '#eab308';
      ctx.strokeRect(4, 4, 56, 32);
      // Inner pattern
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(8, 8, 48, 24);
      // Center gold medallion
      ctx.fillStyle = '#fde047';
      ctx.fillRect(28, 16, 8, 8);
    });
    scene.textures.addCanvas('prop_indoor_rug', rugCanvas);
  }

  // 14. prop_doormat (32x20) - Welcome straw mat
  if (!scene.textures.exists('prop_doormat')) {
    const doormatCanvas = createTileCanvas(32, 20, (ctx) => {
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(2, 2, 28, 16);
      ctx.fillStyle = '#a16207';
      ctx.fillRect(4, 4, 24, 12);
      // Straw weave lines
      ctx.fillStyle = '#713f12';
      ctx.fillRect(6, 7, 20, 1);
      ctx.fillRect(6, 12, 20, 1);
    });
    scene.textures.addCanvas('prop_doormat', doormatCanvas);
  }

  // Horizontal Timber Post & Rail Fence (32x32)
  if (!scene.textures.exists('prop_fence_h')) {
    const fenceHCanvas = createTileCanvas(32, 32, (ctx) => {
      // Left Post
      ctx.fillStyle = '#78350f';
      ctx.fillRect(2, 6, 4, 24);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(2, 6, 1, 24);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(5, 6, 1, 24);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(1, 4, 6, 3);
      // Right Post
      ctx.fillStyle = '#78350f';
      ctx.fillRect(26, 6, 4, 24);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(26, 6, 1, 24);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(29, 6, 1, 24);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(25, 4, 6, 3);
      // Top Rail
      ctx.fillStyle = '#92400e';
      ctx.fillRect(0, 12, 32, 3);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(0, 12, 32, 1);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(0, 14, 32, 1);
      // Bottom Rail
      ctx.fillStyle = '#92400e';
      ctx.fillRect(0, 20, 32, 3);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(0, 20, 32, 1);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(0, 22, 32, 1);
      // Nails
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(4, 13, 1, 1);
      ctx.fillRect(4, 21, 1, 1);
      ctx.fillRect(28, 13, 1, 1);
      ctx.fillRect(28, 21, 1, 1);
    });
    scene.textures.addCanvas('prop_fence_h', fenceHCanvas);
  }

  // Vertical Timber Fence (32x32)
  if (!scene.textures.exists('prop_fence_v')) {
    const fenceVCanvas = createTileCanvas(32, 32, (ctx) => {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(14, 0, 4, 32);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(14, 0, 1, 32);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(17, 0, 1, 32);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(11, 6, 10, 3);
      ctx.fillRect(11, 22, 10, 3);
    });
    scene.textures.addCanvas('prop_fence_v', fenceVCanvas);
  }

  // Stone Water Well (32x32)
  if (!scene.textures.exists('prop_well')) {
    const wellCanvas = createTileCanvas(32, 32, (ctx) => {
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(16, 26, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Stone Basin
      ctx.fillStyle = '#6b7280';
      ctx.beginPath();
      ctx.ellipse(16, 22, 11, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9ca3af';
      ctx.beginPath();
      ctx.ellipse(16, 21, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Water center
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.ellipse(16, 21, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7dd3fc';
      ctx.fillRect(14, 20, 4, 1);
      // Posts
      ctx.fillStyle = '#78350f';
      ctx.fillRect(6, 8, 2, 14);
      ctx.fillRect(24, 8, 2, 14);
      // Winch & bucket
      ctx.fillStyle = '#92400e';
      ctx.fillRect(8, 12, 16, 2);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(15, 12, 2, 7);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(14, 18, 4, 3);
      // Pitched Roof
      for (let r = 0; r < 7; r += 1) {
        const w = 24 - r * 2;
        const x = 16 - Math.floor(w / 2);
        ctx.fillStyle = r % 2 === 0 ? '#b91c1c' : '#991b1b';
        ctx.fillRect(x, 7 - r, w, 1);
      }
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(4, 7, 24, 1);
    });
    scene.textures.addCanvas('prop_well', wellCanvas);
  }

  // Lush Leafy Green Bush (32x32)
  if (!scene.textures.exists('prop_bush')) {
    const bushCanvas = createTileCanvas(32, 32, (ctx) => {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(16, 25, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(16, 18, 11, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.ellipse(11, 15, 7, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(21, 15, 7, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(16, 13, 8, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.ellipse(16, 11, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    scene.textures.addCanvas('prop_bush', bushCanvas);
  }

  // Sweetberry Bush with Red Berries (32x32)
  if (!scene.textures.exists('prop_berry_bush')) {
    const berryBushCanvas = createTileCanvas(32, 32, (ctx) => {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(16, 25, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(16, 18, 11, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.ellipse(11, 15, 7, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(21, 15, 7, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(16, 13, 8, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      // Red sweetberries
      const bSpots = [
        { x: 10, y: 15 }, { x: 15, y: 12 }, { x: 21, y: 14 },
        { x: 13, y: 19 }, { x: 19, y: 18 },
      ];
      bSpots.forEach((pt) => {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(pt.x, pt.y, 2, 2);
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(pt.x, pt.y, 1, 1);
      });
    });
    scene.textures.addCanvas('prop_berry_bush', berryBushCanvas);
  }

  // Mossy Granite Boulder (32x32)
  if (!scene.textures.exists('prop_rock')) {
    const rockCanvas = createTileCanvas(32, 32, (ctx) => {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(16, 24, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4b5563';
      ctx.beginPath();
      ctx.ellipse(16, 19, 9, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6b7280';
      ctx.beginPath();
      ctx.ellipse(15, 17, 7, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9ca3af';
      ctx.beginPath();
      ctx.ellipse(13, 15, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Green moss cap
      ctx.fillStyle = '#65a30d';
      ctx.beginPath();
      ctx.ellipse(17, 14, 5, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    scene.textures.addCanvas('prop_rock', rockCanvas);
  }

  // Pond Reeds & Cattails (32x32)
  if (!scene.textures.exists('prop_reeds')) {
    const reedsCanvas = createTileCanvas(32, 32, (ctx) => {
      ctx.fillStyle = '#15803d';
      ctx.fillRect(8, 8, 1, 20);
      ctx.fillRect(14, 4, 1, 24);
      ctx.fillRect(20, 6, 1, 22);
      ctx.fillRect(25, 10, 1, 18);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(7, 8, 3, 8);
      ctx.fillRect(13, 4, 3, 9);
      ctx.fillRect(19, 6, 3, 8);
      ctx.fillRect(24, 10, 3, 7);
    });
    scene.textures.addCanvas('prop_reeds', reedsCanvas);
  }

  // Water Lilypad with Lotus (32x32)
  if (!scene.textures.exists('prop_lilypad')) {
    const lilyCanvas = createTileCanvas(32, 32, (ctx) => {
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.ellipse(16, 17, 9, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.clearRect(16, 11, 4, 6);
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(15, 14, 3, 3);
      ctx.fillStyle = '#fdf2f8';
      ctx.fillRect(15, 13, 1, 1);
      ctx.fillRect(17, 13, 1, 1);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(16, 15, 1, 1);
    });
    scene.textures.addCanvas('prop_lilypad', lilyCanvas);
  }

  // Wooden Garden Planter Flowerbox (32x32)
  if (!scene.textures.exists('prop_flowerbed')) {
    const flowerbedCanvas = createTileCanvas(32, 32, (ctx) => {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(16, 26, 12, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.fillRect(3, 16, 26, 10);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(3, 16, 26, 1);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(3, 25, 26, 1);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(5, 14, 22, 3);
      const cols = ['#ef4444', '#f59e0b', '#ec4899', '#3b82f6', '#ffffff'];
      for (let i = 0; i < 5; i += 1) {
        const fx = 6 + i * 4;
        ctx.fillStyle = cols[i];
        ctx.fillRect(fx, 11, 3, 3);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(fx + 1, 12, 1, 1);
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(fx + 1, 14, 1, 2);
      }
    });
    scene.textures.addCanvas('prop_flowerbed', flowerbedCanvas);
  }

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

  if (!scene.textures.exists('ore_iron')) scene.textures.addCanvas('ore_iron', makeOreSprite('#a1a1aa', '#f4f4f5'));
  if (!scene.textures.exists('ore_copper')) scene.textures.addCanvas('ore_copper', makeOreSprite('#d97706', '#fbbf24'));
  if (!scene.textures.exists('ore_gold')) scene.textures.addCanvas('ore_gold', makeOreSprite('#eab308', '#fef08a'));
  if (!scene.textures.exists('ore_crystal')) scene.textures.addCanvas('ore_crystal', makeOreSprite('#a855f7', '#f5d0fe'));

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

  // 5. Cavern Shadow Bat (enemy_bat)
  const batCanvas = createEnemySheetCanvas((ctx, ox, f) => {
    const wingY = (f === 0) ? -4 : (f === 2) ? 4 : 0;
    // Ambient shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(ox + 16, 28, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body & Head
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(ox + 13, 12, 6, 8);
    // Ears
    ctx.fillRect(ox + 12, 9, 2, 4);
    ctx.fillRect(ox + 18, 9, 2, 4);
    // Red glowing eyes
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(ox + 14, 14, 1, 1);
    ctx.fillRect(ox + 17, 14, 1, 1);
    // Tiny fangs
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ox + 14, 18, 1, 1);
    ctx.fillRect(ox + 17, 18, 1, 1);

    // Left Wing
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(ox + 13, 14);
    ctx.lineTo(ox + 4, 10 + wingY);
    ctx.lineTo(ox + 2, 16 + wingY);
    ctx.lineTo(ox + 8, 18);
    ctx.closePath();
    ctx.fill();

    // Right Wing
    ctx.beginPath();
    ctx.moveTo(ox + 19, 14);
    ctx.lineTo(ox + 28, 10 + wingY);
    ctx.lineTo(ox + 30, 16 + wingY);
    ctx.lineTo(ox + 24, 18);
    ctx.closePath();
    ctx.fill();
  });
  scene.textures.addSpriteSheet('enemy_bat', batCanvas, { frameWidth: 32, frameHeight: 32 });

  // 6. Cavern Webspinner Spider (enemy_spider)
  const spiderCanvas = createEnemySheetCanvas((ctx, ox, f) => {
    const step = (f % 2 === 0) ? 2 : -2;
    // Ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(ox + 16, 27, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 8 Spidery Legs
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(ox + 5, 14 + step, 6, 2);
    ctx.fillRect(ox + 5, 20 - step, 6, 2);
    ctx.fillRect(ox + 21, 14 - step, 6, 2);
    ctx.fillRect(ox + 21, 20 + step, 6, 2);

    ctx.fillRect(ox + 7, 11 + step, 5, 2);
    ctx.fillRect(ox + 7, 23 - step, 5, 2);
    ctx.fillRect(ox + 20, 11 - step, 5, 2);
    ctx.fillRect(ox + 20, 23 + step, 5, 2);

    // Bulbous Abdomen
    ctx.fillStyle = '#292524';
    ctx.fillRect(ox + 11, 11, 10, 12);
    ctx.fillStyle = '#44403c';
    ctx.fillRect(ox + 13, 12, 6, 10);
    // Yellow venom hourglass marking
    ctx.fillStyle = '#eab308';
    ctx.fillRect(ox + 15, 15, 2, 4);

    // Head & Fangs
    ctx.fillStyle = '#0c0a09';
    ctx.fillRect(ox + 13, 22, 6, 4);
    // Cluster red eyes
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(ox + 14, 23, 1, 1);
    ctx.fillRect(ox + 17, 23, 1, 1);
  });
  scene.textures.addSpriteSheet('enemy_spider', spiderCanvas, { frameWidth: 32, frameHeight: 32 });

  // 7. Savage Orc Marauder (enemy_orc)
  const orcCanvas = createEnemySheetCanvas((ctx, ox, f) => {
    const bob = (f === 1 || f === 3) ? -1 : 0;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(ox + 16, 29, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Muscle Orc Green Flesh
    ctx.fillStyle = '#3f6212';
    ctx.fillRect(ox + 10, 9 + bob, 12, 9);
    ctx.fillRect(ox + 8, 17 + bob, 16, 8); // Wide chest

    // Red ferocious eyes & tusks
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(ox + 12, 12 + bob, 2, 2);
    ctx.fillRect(ox + 18, 12 + bob, 2, 2);
    ctx.fillStyle = '#f8fafc'; // White tusks
    ctx.fillRect(ox + 12, 16 + bob, 2, 3);
    ctx.fillRect(ox + 18, 16 + bob, 2, 3);

    // Spiked Iron Pauldrons & Belt
    ctx.fillStyle = '#475569';
    ctx.fillRect(ox + 6, 16 + bob, 4, 5);
    ctx.fillRect(ox + 22, 16 + bob, 4, 5);
    ctx.fillStyle = '#78350f'; // Leather loincloth
    ctx.fillRect(ox + 11, 23 + bob, 10, 3);

    // Heavy Battleaxe
    const axeY = (f === 2) ? 6 : 9;
    ctx.fillStyle = '#5c2b05'; // Handle
    ctx.fillRect(ox + 24, axeY + bob, 2, 16);
    ctx.fillStyle = '#94a3b8'; // Steel blade
    ctx.fillRect(ox + 22, axeY + bob, 6, 6);

    // Heavy Boots
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(ox + 11, 25 + bob, 4, 5);
    ctx.fillRect(ox + 17, 25 + bob, 4, 5);
  });
  scene.textures.addSpriteSheet('enemy_orc', orcCanvas, { frameWidth: 32, frameHeight: 32 });

  // =========================================================================
  // 6. WORLD BOSS ANIMATED SPRITESHEETS (256x64, 4 frames of 64x64)
  // =========================================================================

  // 1. Slime King Colossus (boss_slime_king)
  const slimeKingCanvas = document.createElement('canvas');
  slimeKingCanvas.width = 256;
  slimeKingCanvas.height = 64;
  const skCtx = slimeKingCanvas.getContext('2d');
  skCtx.imageSmoothingEnabled = false;

  for (let f = 0; f < 4; f += 1) {
    const ox = f * 64;
    const squish = (f === 1) ? 4 : (f === 2) ? -4 : 0;
    const yOff = (f === 2) ? -6 : 0;

    // Ground Shadow
    skCtx.fillStyle = 'rgba(0,0,0,0.45)';
    skCtx.beginPath();
    skCtx.ellipse(ox + 32, 58, 26 + (f === 1 ? 4 : 0), 6, 0, 0, Math.PI * 2);
    skCtx.fill();

    // Outer Translucent Slime Membrane
    skCtx.fillStyle = '#047857';
    skCtx.beginPath();
    skCtx.ellipse(ox + 32, 42 + yOff + squish / 2, 22 + (f === 1 ? 4 : 0), 16 - squish, 0, 0, Math.PI * 2);
    skCtx.fill();

    // Luminous Emerald Flesh
    skCtx.fillStyle = '#10b981';
    skCtx.beginPath();
    skCtx.ellipse(ox + 32, 41 + yOff + squish / 2, 20 + (f === 1 ? 4 : 0), 14 - squish, 0, 0, Math.PI * 2);
    skCtx.fill();

    // Core Nucleus
    skCtx.fillStyle = '#34d399';
    skCtx.beginPath();
    skCtx.ellipse(ox + 32, 40 + yOff, 10, 8, 0, 0, Math.PI * 2);
    skCtx.fill();

    // Slime King Fiery Amber Eyes
    skCtx.fillStyle = '#f59e0b';
    skCtx.fillRect(ox + 25, 34 + yOff, 4, 5);
    skCtx.fillRect(ox + 35, 34 + yOff, 4, 5);
    skCtx.fillStyle = '#ffffff';
    skCtx.fillRect(ox + 26, 35 + yOff, 2, 2);
    skCtx.fillRect(ox + 36, 35 + yOff, 2, 2);

    // Ornate Golden Crown
    const crownY = 22 + yOff + squish / 2;
    skCtx.fillStyle = '#eab308';
    skCtx.fillRect(ox + 22, crownY + 4, 20, 6);
    // Spikes
    skCtx.beginPath();
    skCtx.moveTo(ox + 22, crownY + 4);
    skCtx.lineTo(ox + 22, crownY - 2);
    skCtx.lineTo(ox + 26, crownY + 4);
    skCtx.lineTo(ox + 32, crownY - 6); // Tall center spike
    skCtx.lineTo(ox + 38, crownY + 4);
    skCtx.lineTo(ox + 42, crownY - 2);
    skCtx.lineTo(ox + 42, crownY + 4);
    skCtx.fill();

    // Center Ruby Gemstone
    skCtx.fillStyle = '#ef4444';
    skCtx.fillRect(ox + 30, crownY + 5, 4, 4);
    skCtx.fillStyle = '#fca5a5';
    skCtx.fillRect(ox + 31, crownY + 5, 2, 2);
  }
  scene.textures.addSpriteSheet('boss_slime_king', slimeKingCanvas, { frameWidth: 64, frameHeight: 64 });

  // 2. Drakmor Bone-Lord (boss_drakmor)
  const drakmorCanvas = document.createElement('canvas');
  drakmorCanvas.width = 256;
  drakmorCanvas.height = 64;
  const dkCtx = drakmorCanvas.getContext('2d');
  dkCtx.imageSmoothingEnabled = false;

  for (let f = 0; f < 4; f += 1) {
    const ox = f * 64;
    const bob = (f === 1 || f === 3) ? -2 : 0;

    // Ground Shadow
    dkCtx.fillStyle = 'rgba(0,0,0,0.45)';
    dkCtx.beginPath();
    dkCtx.ellipse(ox + 32, 58, 20, 5, 0, 0, Math.PI * 2);
    dkCtx.fill();

    // Dark Royal Cloak
    dkCtx.fillStyle = '#1e1b4b';
    dkCtx.fillRect(ox + 20, 24 + bob, 24, 30);
    dkCtx.fillStyle = '#312e81';
    dkCtx.fillRect(ox + 22, 26 + bob, 20, 28);

    // Spiked Armored Pauldrons
    dkCtx.fillStyle = '#475569';
    dkCtx.fillRect(ox + 16, 22 + bob, 10, 8);
    dkCtx.fillRect(ox + 38, 22 + bob, 10, 8);
    dkCtx.fillStyle = '#64748b';
    dkCtx.fillRect(ox + 18, 20 + bob, 3, 4);
    dkCtx.fillRect(ox + 43, 20 + bob, 3, 4);

    // Bone Skull & Spiked Crown
    dkCtx.fillStyle = '#f1f5f9';
    dkCtx.fillRect(ox + 26, 12 + bob, 12, 12);
    // Horned Iron Helm
    dkCtx.fillStyle = '#334155';
    dkCtx.fillRect(ox + 24, 10 + bob, 16, 4);
    dkCtx.fillRect(ox + 23, 6 + bob, 3, 6);
    dkCtx.fillRect(ox + 38, 6 + bob, 3, 6);

    // Flaming Cyan Eye Sockets
    dkCtx.fillStyle = '#0f172a';
    dkCtx.fillRect(ox + 28, 16 + bob, 3, 3);
    dkCtx.fillRect(ox + 33, 16 + bob, 3, 3);
    dkCtx.fillStyle = '#38bdf8';
    dkCtx.fillRect(ox + 29, 16 + bob, 2, 2);
    dkCtx.fillRect(ox + 34, 16 + bob, 2, 2);

    // Skeletal Ribcage & Glowing Soul Core
    dkCtx.fillStyle = '#cbd5e1';
    dkCtx.fillRect(ox + 28, 26 + bob, 8, 14);
    dkCtx.fillStyle = '#06b6d4'; // Cyan core
    dkCtx.fillRect(ox + 30, 30 + bob, 4, 6);

    // Obsidian Greatsword with Runic Edge
    const swordBob = (f === 2) ? -4 : 0;
    dkCtx.fillStyle = '#1e293b';
    dkCtx.fillRect(ox + 46, 10 + bob + swordBob, 4, 38);
    dkCtx.fillStyle = '#38bdf8'; // Glowing rune fuller
    dkCtx.fillRect(ox + 47, 14 + bob + swordBob, 2, 28);
    dkCtx.fillStyle = '#f59e0b'; // Gold crossguard
    dkCtx.fillRect(ox + 43, 36 + bob + swordBob, 10, 3);
  }
  scene.textures.addSpriteSheet('boss_drakmor', drakmorCanvas, { frameWidth: 64, frameHeight: 64 });

  // =========================================================================
  // 7. COMPANION ANIMATED SPRITESHEETS (128x32, 4 frames of 32x32)
  // =========================================================================

  // 1. Barkley the Loyal Sheepdog
  const dogCanvas = createEnemySheetCanvas((ctx, ox, f) => {
    const bob = (f === 1 || f === 3) ? -1 : 0;
    const step = (f === 1) ? 2 : (f === 3) ? -2 : 0;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(ox + 16, 28, 9, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#d97706'; // Warm golden-tan coat
    ctx.fillRect(ox + 10, 16 + bob, 13, 8);
    ctx.fillStyle = '#fef3c7'; // White chest
    ctx.fillRect(ox + 16, 17 + bob, 6, 6);

    // Head & Floppy Ears
    ctx.fillStyle = '#b45309';
    ctx.fillRect(ox + 18, 12 + bob, 8, 7);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(ox + 23, 13 + bob, 3, 6); // Floppy ear

    // Snout & Eyes
    ctx.fillStyle = '#18181b';
    ctx.fillRect(ox + 25, 16 + bob, 2, 2);
    ctx.fillRect(ox + 20, 14 + bob, 2, 2);

    // Wagging Tail
    const tailY = (f % 2 === 0) ? 14 : 11;
    ctx.fillStyle = '#b45309';
    ctx.fillRect(ox + 7, tailY + bob, 3, 5);

    // Paws
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(ox + 11 + step, 24, 2, 4);
    ctx.fillRect(ox + 15 - step, 24, 2, 4);
    ctx.fillRect(ox + 19 + step, 24, 2, 4);
  });
  scene.textures.addSpriteSheet('pet_sheepdog', dogCanvas, { frameWidth: 32, frameHeight: 32 });

  // 2. Lumina the Sylvan Wisp
  const wispCanvas = createEnemySheetCanvas((ctx, ox, f) => {
    const floatY = (f === 0) ? 0 : (f === 1) ? -2 : (f === 2) ? -3 : -1;

    // Soft ground glow
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.beginPath();
    ctx.ellipse(ox + 16, 28, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Outer Aura
    ctx.fillStyle = 'rgba(167, 243, 208, 0.4)';
    ctx.beginPath();
    ctx.ellipse(ox + 16, 16 + floatY, 9, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Luminous Core
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.ellipse(ox + 16, 16 + floatY, 5, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pure White Sparkle Center
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ox + 15, 15 + floatY, 2, 2);

    // Trailing sparks
    ctx.fillStyle = '#6ee7b7';
    ctx.fillRect(ox + 13, 21 + floatY, 2, 2);
    ctx.fillRect(ox + 17, 22 + floatY, 1, 2);
  });
  scene.textures.addSpriteSheet('pet_wisp', wispCanvas, { frameWidth: 32, frameHeight: 32 });

  // 3. Talon the Forest Falcon
  const falconCanvas = createEnemySheetCanvas((ctx, ox, f) => {
    const flap = (f === 1) ? -3 : (f === 3) ? 3 : 0;
    const bob = (f % 2 === 1) ? -1 : 0;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(ox + 16, 28, 7, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#78350f'; // Dark plumage
    ctx.fillRect(ox + 13, 14 + bob, 7, 9);
    ctx.fillStyle = '#fef3c7'; // Barred chest
    ctx.fillRect(ox + 15, 16 + bob, 4, 5);

    // Head & Sharp Hook Beak
    ctx.fillStyle = '#451a03';
    ctx.fillRect(ox + 17, 10 + bob, 5, 5);
    ctx.fillStyle = '#facc15'; // Golden beak
    ctx.fillRect(ox + 21, 12 + bob, 3, 2);
    ctx.fillStyle = '#18181b'; // Eye
    ctx.fillRect(ox + 18, 11 + bob, 1, 1);

    // Flapping Wings
    ctx.fillStyle = '#92400e';
    ctx.fillRect(ox + 9, 13 + bob + flap, 5, 6);
    ctx.fillRect(ox + 19, 13 + bob - flap, 5, 6);

    // Tail
    ctx.fillStyle = '#451a03';
    ctx.fillRect(ox + 11, 21 + bob, 4, 4);
  });
  scene.textures.addSpriteSheet('pet_falcon', falconCanvas, { frameWidth: 32, frameHeight: 32 });

  // =========================================================================
  // 8. VISUAL UPGRADE MASTER PROPS (Streetlamps, Torches, Telegraphs, Fishing)
  // =========================================================================

  // Streetlamp with warm lantern glow (32x48)
  if (!scene.textures.exists('prop_street_lantern')) {
    const lampCanvas = createTileCanvas(32, 48, (ctx) => {
      // Ground Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(16, 45, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Iron Post
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(15, 16, 3, 30);
      ctx.fillRect(13, 44, 7, 2); // Base
      // Lamp bracket
      ctx.fillRect(11, 14, 11, 2);
      // Glass Lantern
      ctx.fillStyle = '#334155';
      ctx.fillRect(11, 8, 11, 8);
      // Warm Amber Radiance
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(12, 9, 9, 6);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(14, 11, 5, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(15, 11, 2, 2);
    });
    scene.textures.addCanvas('prop_street_lantern', lampCanvas);
  }

  // Wall-mounted Iron Torch (16x32)
  if (!scene.textures.exists('prop_torch')) {
    const torchCanvas = createTileCanvas(16, 32, (ctx) => {
      ctx.fillStyle = '#451a03';
      ctx.fillRect(7, 14, 3, 14);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(5, 13, 7, 3); // Sconce
      // Flame
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.ellipse(8, 9, 4, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.ellipse(8, 10, 2, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(7, 9, 2, 2);
    });
    scene.textures.addCanvas('prop_torch', torchCanvas);
  }

  // Water Ripple Circle FX (32x32)
  if (!scene.textures.exists('fx_ripple')) {
    const ripCanvas = createTileCanvas(32, 32, (ctx) => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(16, 16, 12, 6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.beginPath();
      ctx.ellipse(16, 16, 6, 3, 0, 0, Math.PI * 2);
      ctx.stroke();
    });
    scene.textures.addCanvas('fx_ripple', ripCanvas);
  }

  // Boss Attack Telegraph Decal (96x96)
  if (!scene.textures.exists('fx_telegraph_circle')) {
    const teleCanvas = createTileCanvas(96, 96, (ctx) => {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.28)';
      ctx.beginPath();
      ctx.ellipse(48, 48, 42, 42, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.ellipse(48, 48, 42, 42, 0, 0, Math.PI * 2);
      ctx.stroke();
    });
    scene.textures.addCanvas('fx_telegraph_circle', teleCanvas);
  }

  // Water Fishing Spot Ripple & Shadow (32x32)
  if (!scene.textures.exists('prop_fishing_spot')) {
    const fishSpotCanvas = createTileCanvas(32, 32, (ctx) => {
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(16, 16, 12, 6, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Fish shadow underneath
      ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
      ctx.beginPath();
      ctx.ellipse(16, 16, 6, 2, 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Subtle sparkle
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(18, 14, 2, 2);
    });
    scene.textures.addCanvas('prop_fishing_spot', fishSpotCanvas);
  }
}
