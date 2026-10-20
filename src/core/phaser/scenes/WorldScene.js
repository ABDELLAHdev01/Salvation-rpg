/**
 * WorldScene (Phaser 3)
 * Full 2D Living Fantasy RPG World with player movement, camera follow,
 * collision detection, multi-zone transitions, in-world farming/mining,
 * and real-time action PvE combat with enemy AI.
 */

import Phaser from 'phaser';
import { generateCharacterSpritesheetCanvas } from '../CharacterSpriteGenerator';
import { registerWorldTextures } from '../WorldTileGenerator';
import gameEventBridge, { gameEvents } from '../gameEventBridge';
import { farmCrops } from '../../data/farmData';
import audioManager from '../../audio/AudioManager';
import {
  WEAPON_TYPES,
  MONSTER_TYPES,
  ENEMY_STATES,
  computePlayerAttackDamage,
  applyDefenseMitigation,
  generateMonsterLoot,
  isTargetInAttackArc,
  updateEnemyAI,
} from '../../combat/combatEngine';

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldScene' });
    this.currentZone = 'homestead';
    this.player = null;
    this.playerFacing = 'south';
    this.playerMaxHp = 100;
    this.playerHp = 100;
    this.playerDefense = 6;
    this.attackCooldownUntil = 0;
    this.playerInvulnerableUntil = 0;
    this.isAttacking = false;

    this.cursors = null;
    this.wasd = null;
    this.shiftKey = null;
    this.interactKey = null;
    this.attackKey = null;
    this.healKey = null;

    this.customization = null;
    this.profile = null;
    this.activePrompt = null;
    this.interactiveObjects = [];
    this.controlsLocked = false;
    this.enemies = null;
    this.obstacles = null;
    this.moveTarget = null;
  }

  init(data) {
    if (data.customization) this.customization = data.customization;
    if (data.profile) this.profile = data.profile;
    if (data.zone) this.currentZone = data.zone;

    if (data.spawnX !== undefined && data.spawnY !== undefined) {
      this.customSpawn = { x: data.spawnX, y: data.spawnY };
    } else {
      this.customSpawn = null;
    }

    // Initialize player combat stats from profile
    const lvl = this.profile?.stats?.level || 1;
    this.playerMaxHp = 100 + (lvl - 1) * 15;
    this.playerHp = data.hp !== undefined ? data.hp : this.playerMaxHp;
    this.playerDefense = Math.round((this.profile?.stats?.power || 120) * 0.05);
  }

  preload() {
    // 1. Preload master pixel combat & ambient FX
    try {
      this.load.image('fx_slash', '/assets/fx/slash_01.png');
      this.load.image('fx_spark', '/assets/fx/spark_01.png');
      this.load.image('fx_magic', '/assets/fx/magic_01.png');
      this.load.image('fx_flame', '/assets/fx/flame_01.png');
      this.load.image('fx_smoke', '/assets/fx/smoke_01.png');

      // 2. Preload authentic CC0 terrain assets (normal smooth meadow grass from Kenney RPG assets)
      this.load.image('tile_grass', '/assets/tilesets/tile_grass.png');
      this.load.image('tile_path', '/assets/tilesets/tile_path.png');
      this.load.image('tile_stone', '/assets/tilesets/tile_stone.png');
      this.load.image('tile_soil', '/assets/tilesets/tile_soil.png');
      this.load.image('tile_water', '/assets/tilesets/tile_water.png');

      // 3. Preload master scenery props
      this.load.image('prop_tree', '/assets/tilesets/prop_tree.png');
      this.load.image('prop_house', '/assets/tilesets/prop_house.png');
      this.load.image('prop_chest', '/assets/tilesets/prop_chest.png');
      this.load.image('prop_workbench', '/assets/tilesets/prop_workbench.png');

      // 4. Preload City, Guild & Open-World Master Props
      this.load.image('prop_guild_board', '/assets/tilesets/prop_guild_board.png');
      this.load.image('prop_guild_desk', '/assets/tilesets/prop_guild_desk.png');
      this.load.image('prop_forge_furnace', '/assets/tilesets/prop_forge_furnace.png');
      this.load.image('prop_anvil', '/assets/tilesets/prop_anvil.png');
      this.load.image('prop_market_stand', '/assets/tilesets/prop_market_stand.png');
      this.load.image('prop_inn_bed', '/assets/tilesets/prop_inn_bed.png');
      this.load.image('prop_town_fountain', '/assets/tilesets/prop_town_fountain.png');
      this.load.image('prop_notice_board', '/assets/tilesets/prop_notice_board.png');
      this.load.image('prop_road_sign', '/assets/tilesets/prop_road_sign.png');
    } catch {
      // Safe fallback
    }
  }

  create() {
    // 0. Ensure Camera FX is clean and set mood lighting
    this.cameras.main.resetFX();
    const bgColors = { homestead: '#3c6624', west_road: '#3c6624', forest: '#274b1a', mine: '#181a20', village: '#3a2718' };
    this.cameras.main.setBackgroundColor(bgColors[this.currentZone] || '#3c6624');
    this.cameras.main.fadeIn(250, 0, 0, 0);

    // 1. Register Procedural World Textures
    registerWorldTextures(this);

    // 1b. Setup Enemy Spritesheet Animations
    this.setupEnemyAnimations();

    // 2. Setup Player Dynamic Layered Spritesheet
    this.setupPlayerTexture();

    // 3. Build Zone Environment & Props
    this.buildCurrentZone();

    // 3b. Setup Ambient Atmosphere & Lighting
    this.setupZoneAtmosphere();

    // 4. Setup Input Controls
    this.setupControls();

    // 5. Setup Bridge Listeners
    this.setupBridge();

    // Notify React of initial state & zone start
    gameEventBridge.emit(gameEvents.ZONE_CHANGED, { zone: this.currentZone });
    gameEventBridge.emit(gameEvents.COMBAT_PLAYER_DAMAGED, {
      hp: this.playerHp,
      maxHp: this.playerMaxHp,
      damage: 0,
      attackerName: 'None',
    });
  }

  setupPlayerTexture() {
    const textureKey = 'player_spritesheet';
    if (this.textures.exists(textureKey)) {
      this.textures.remove(textureKey);
    }

    const canvas = generateCharacterSpritesheetCanvas(this.customization);
    let texture = null;
    if (typeof this.textures.addSpriteSheet === 'function') {
      texture = this.textures.addSpriteSheet(textureKey, canvas, {
        frameWidth: 32,
        frameHeight: 32,
      });
    }
    if (!texture) {
      texture = this.textures.addCanvas(textureKey, canvas);
    }

    // Ensure all 40 frames (0 to 39) explicitly exist on texture
    if (texture && typeof texture.add === 'function') {
      for (let row = 0; row < 10; row += 1) {
        for (let col = 0; col < 4; col += 1) {
          const frameIdx = row * 4 + col;
          if (typeof texture.has === 'function') {
            if (!texture.has(frameIdx)) {
              texture.add(frameIdx, 0, col * 32, row * 32, 32, 32);
            }
          } else {
            texture.add(frameIdx, 0, col * 32, row * 32, 32, 32);
          }
        }
      }
    }

    // Setup Animations (4 frames per row)
    const anims = [
      { key: 'player_walk_south', start: 0, end: 3, repeat: -1, rate: 8 },
      { key: 'player_walk_west', start: 4, end: 7, repeat: -1, rate: 8 },
      { key: 'player_walk_east', start: 8, end: 11, repeat: -1, rate: 8 },
      { key: 'player_walk_north', start: 12, end: 15, repeat: -1, rate: 8 },
      { key: 'player_mine_south', start: 16, end: 19, repeat: 0, rate: 8 },
      { key: 'player_mine_east', start: 20, end: 23, repeat: 0, rate: 8 },
      { key: 'player_attack_south', start: 24, end: 27, repeat: 0, rate: 12 },
      { key: 'player_attack_west', start: 28, end: 31, repeat: 0, rate: 12 },
      { key: 'player_attack_east', start: 32, end: 35, repeat: 0, rate: 12 },
      { key: 'player_attack_north', start: 36, end: 39, repeat: 0, rate: 12 },
    ];

    anims.forEach((a) => {
      if (this.anims.exists(a.key)) this.anims.remove(a.key);
      this.anims.create({
        key: a.key,
        frames: this.anims.generateFrameNumbers(textureKey, { start: a.start, end: a.end }),
        frameRate: a.rate,
        repeat: a.repeat,
      });
    });

    // CRITICAL: Re-bind existing player sprite so it never references a destroyed texture
    if (this.player && this.player.active) {
      this.player.setTexture(textureKey, 0);
      const idleFrames = { south: 0, west: 4, east: 8, north: 12 };
      try {
        this.player.setFrame(idleFrames[this.playerFacing] ?? 0);
      } catch {
        // Safe guard
      }
    }
  }

  setupEnemyAnimations() {
    const enemyAnims = [
      { key: 'anim_enemy_slime', sheet: 'enemy_slime', rate: 5 },
      { key: 'anim_enemy_wolf', sheet: 'enemy_wolf', rate: 6 },
      { key: 'anim_enemy_skeleton', sheet: 'enemy_skeleton', rate: 4 },
      { key: 'anim_enemy_goblin', sheet: 'enemy_goblin', rate: 6 },
    ];
    enemyAnims.forEach((ea) => {
      if (this.textures.exists(ea.sheet)) {
        if (this.anims.exists(ea.key)) this.anims.remove(ea.key);
        try {
          this.anims.create({
            key: ea.key,
            frames: this.anims.generateFrameNumbers(ea.sheet, { start: 0, end: 3 }),
            frameRate: ea.rate,
            repeat: -1,
          });
        } catch {
          // Safe fallback for single-frame textures
        }
      }
    });
  }

  setupZoneAtmosphere() {
    try {
      if (this.currentZone === 'homestead') {
        const emitter = this.add.particles(640, 480, 'col_invisible', {
          emitZone: { source: new Phaser.Geom.Rectangle(0, 0, 1280, 960), type: 'random' },
          speedX: { min: -15, max: -5 },
          speedY: { min: -10, max: 10 },
          scale: { start: 1.5, end: 0.5 },
          alpha: { start: 0.6, end: 0 },
          tint: 0xfde047,
          lifespan: 4000,
          frequency: 250,
        });
        emitter.setDepth(28);
      } else if (this.currentZone === 'west_road') {
        const emitter = this.add.particles(640, 480, 'col_invisible', {
          emitZone: { source: new Phaser.Geom.Rectangle(0, 0, 1280, 960), type: 'random' },
          speedX: { min: -15, max: -5 },
          speedY: { min: -8, max: 8 },
          scale: { start: 1.5, end: 0.5 },
          alpha: { start: 0.5, end: 0 },
          tint: 0xfacc15,
          lifespan: 3800,
          frequency: 250,
        });
        emitter.setDepth(28);
      } else if (this.currentZone === 'forest') {
        const emitter = this.add.particles(640, 480, 'col_invisible', {
          emitZone: { source: new Phaser.Geom.Rectangle(0, 0, 1280, 960), type: 'random' },
          speedX: { min: -10, max: 10 },
          speedY: { min: -20, max: -5 },
          scale: { start: 2, end: 0.5 },
          alpha: { start: 0.7, end: 0 },
          tint: 0x34d399,
          lifespan: 3500,
          frequency: 200,
        });
        emitter.setDepth(28);
      } else if (this.currentZone === 'mine') {
        const emitter = this.add.particles(640, 480, 'col_invisible', {
          emitZone: { source: new Phaser.Geom.Rectangle(0, 0, 1280, 960), type: 'random' },
          speedX: { min: -5, max: 5 },
          speedY: { min: 5, max: 15 },
          scale: { start: 1.5, end: 0.5 },
          alpha: { start: 0.5, end: 0 },
          tint: 0x38bdf8,
          lifespan: 3000,
          frequency: 300,
        });
        emitter.setDepth(28);
      } else if (this.currentZone === 'village') {
        const emitter = this.add.particles(640, 480, 'col_invisible', {
          emitZone: { source: new Phaser.Geom.Rectangle(0, 0, 1280, 960), type: 'random' },
          speedX: { min: -8, max: 8 },
          speedY: { min: -15, max: -5 },
          scale: { start: 1.5, end: 0.5 },
          alpha: { start: 0.5, end: 0 },
          tint: 0xfbbf24,
          lifespan: 3500,
          frequency: 350,
        });
        emitter.setDepth(28);
      }
    } catch {
      // Safe fallback
    }
  }

  buildCurrentZone() {
    this.interactiveObjects = [];

    const mapWidth = 40;  // 40 tiles * 32px = 1280px
    const mapHeight = 30; // 30 tiles * 32px = 960px
    const worldW = mapWidth * 32;
    const worldH = mapHeight * 32;

    this.physics.world.setBounds(0, 0, worldW, worldH);

    // Ground Layer
    const baseTile = this.currentZone === 'mine' ? 'tile_stone' : 'tile_grass';
    for (let x = 0; x < mapWidth; x += 1) {
      for (let y = 0; y < mapHeight; y += 1) {
        this.add.image(x * 32 + 16, y * 32 + 16, baseTile);
      }
    }

    // Cobblestone Pathways in Homestead
    if (this.currentZone === 'homestead') {
      for (let y = 6; y < 24; y += 1) {
        this.add.image(14 * 32 + 16, y * 32 + 16, 'tile_path');
        this.add.image(15 * 32 + 16, y * 32 + 16, 'tile_path');
      }
      for (let x = 15; x < 38; x += 1) {
        this.add.image(x * 32 + 16, 12 * 32 + 16, 'tile_path');
      }
      // Paved road leaving left boundary to West Road
      for (let x = 0; x < 15; x += 1) {
        this.add.image(x * 32 + 16, 14 * 32 + 16, 'tile_path');
      }
    }

    // Groups
    this.obstacles = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();

    if (this.currentZone === 'homestead') {
      this.buildHomesteadProps();
    } else if (this.currentZone === 'west_road') {
      this.buildWestRoadProps();
    } else if (this.currentZone === 'mine') {
      this.buildMineProps();
    } else if (this.currentZone === 'forest') {
      this.buildForestProps();
    } else if (this.currentZone === 'village') {
      this.buildVillageProps();
    }

    // Player Spawn
    let spawnX = 15 * 32;
    let spawnY = 14 * 32;
    if (this.customSpawn) {
      spawnX = this.customSpawn.x;
      spawnY = this.customSpawn.y;
    } else if (this.currentZone === 'homestead') {
      spawnX = 15 * 32;
      spawnY = 14 * 32;
    } else if (this.currentZone === 'west_road') {
      spawnX = 36 * 32;
      spawnY = 14 * 32;
    } else if (this.currentZone === 'village') {
      spawnX = 36 * 32;
      spawnY = 15 * 32;
    } else {
      spawnX = 10 * 32;
      spawnY = 12 * 32;
    }

    this.player = this.physics.add.sprite(spawnX, spawnY, 'player_spritesheet', 0);
    this.player.setCollideWorldBounds(true);
    this.player.setSize(18, 14);
    this.player.setOffset(7, 18);
    this.player.setDepth(20);

    // Collisions
    this.physics.add.collider(this.player, this.obstacles);
    this.physics.add.collider(this.enemies, this.obstacles);
    this.physics.add.collider(this.player, this.enemies);

    // Camera follow - immediately center to avoid initial 0,0 black offset
    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.centerOn(spawnX, spawnY);
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);
    this.cameras.main.setZoom(1.5);
  }

  buildHomesteadProps() {
    // 1. Manor House
    const house = this.add.image(14 * 32 + 16, 4 * 32, 'prop_house');
    house.setDepth(15);
    const houseCollider = this.obstacles.create(14 * 32 + 16, 4 * 32 + 10, 'col_invisible');
    houseCollider.setSize(80, 40);
    houseCollider.setVisible(false);

    // 2. Storage Vault Chest (Solid obstacle with collision)
    const chest = this.obstacles.create(18 * 32, 5 * 32 + 16, 'prop_chest');
    chest.setDepth(16);
    chest.setSize(24, 20);
    this.registerInteractive(18 * 32, 5 * 32 + 16, 50, '[E] Open Vault Pouch', () => {
      audioManager.play('tap');
      gameEventBridge.emit(gameEvents.CHEST_OPEN);
    });

    // 3. Crafting Anvil & Workbench (Solid obstacle with collision)
    const bench = this.obstacles.create(10 * 32, 5 * 32 + 16, 'prop_workbench');
    bench.setDepth(16);
    bench.setSize(26, 20);
    this.registerInteractive(10 * 32, 5 * 32 + 16, 50, '[E] Open Workshop Forge', () => {
      audioManager.play('anvil');
      gameEventBridge.emit(gameEvents.WORKBENCH_OPEN);
    });

    // 4. Perimeter Trees
    for (let x = 2; x < 38; x += 3) {
      if (x < 12 || x > 18) {
        const t = this.add.image(x * 32, 2 * 32, 'prop_tree');
        t.setDepth(10);
        const col = this.obstacles.create(x * 32, 2 * 32 + 14, 'col_invisible');
        col.setSize(20, 16);
        col.setVisible(false);
      }
    }

    // 5. Farm Plots Grid
    const plots = this.profile?.farmPlots || [
      { id: 0, cropId: 'turnip', plantedAt: Date.now() - 200000 },
      { id: 1, cropId: 'wheat', plantedAt: Date.now() - 300000 },
      { id: 2, cropId: null, plantedAt: 0 },
      { id: 3, cropId: 'herb', plantedAt: Date.now() - 100000 },
      { id: 4, cropId: 'moonberry', plantedAt: Date.now() - 50000 },
      { id: 5, cropId: null, plantedAt: 0 },
    ];

    plots.forEach((plot, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const px = (6 + col * 2) * 32;
      const py = (18 + row * 2) * 32;

      // Soil Tile
      const soil = this.add.image(px, py, 'tile_soil');
      soil.setDepth(5);

      if (plot.cropId) {
        const cropDef = farmCrops.find((c) => c.id === plot.cropId);
        const growMs = cropDef?.growMs || 180000;
        const elapsed = Date.now() - (plot.plantedAt || 0);
        const progress = Math.min(1.0, elapsed / growMs);
        const stage = progress >= 1.0 ? 4 : progress >= 0.7 ? 3 : progress >= 0.35 ? 2 : 1;
        const isMature = stage === 4;

        const cropSprite = this.add.image(px, py, `crop_${plot.cropId}_${stage}`);
        cropSprite.setDepth(6);

        const promptText = isMature
          ? `[E] Harvest Mature ${cropDef?.name || 'Crop'} (Ready!)`
          : `[E] Inspect ${cropDef?.name} (${Math.round(progress * 100)}% grown)`;

        this.registerInteractive(px, py, 45, promptText, () => {
          audioManager.play(isMature ? 'harvest' : 'tap');
          gameEventBridge.emit(gameEvents.FARM_PLOT_INTERACT, { plot, isMature });
        });
      } else {
        this.registerInteractive(px, py, 45, '[E] Plant Seeds in Empty Plot', () => {
          audioManager.play('tap');
          gameEventBridge.emit(gameEvents.FARM_PLOT_INTERACT, { plot, isMature: false });
        });
      }
    });

    // Road Signs
    const westSign = this.add.image(3 * 32, 12 * 32, 'prop_road_sign');
    westSign.setDepth(11);
    this.registerInteractive(3 * 32, 12 * 32, 50, '[E] Read Road Sign 📜', () => {
      this.showFloatingText(3 * 32, 12 * 32 - 20, '← Sunforge City (West Road) | Homestead Manor →', '#fef08a');
      gameEventBridge.emit(gameEvents.PROP_INTERACT, { propId: 'prop_road_sign' });
    });

    // Exits
    // Physical West Gate connecting to West Road
    this.registerInteractive(2 * 32, 14 * 32, 60, '[E] Walk along West Road to City ←', () => {
      this.switchZone('west_road', { spawnX: 38 * 32, spawnY: this.player.y });
    });
    this.registerInteractive(37 * 32, 12 * 32, 60, '[E] Enter Enchanted Forest →', () => {
      this.switchZone('forest');
    });
    this.registerInteractive(34 * 32, 4 * 32, 60, '[E] Delve into Deepforge Mine ⛏️', () => {
      this.switchZone('mine');
    });
    this.registerInteractive(15 * 32, 28 * 32, 60, '[E] Fast-Travel to Sunforge City Plaza 🏛️', () => {
      this.switchZone('village');
    });
  }

  buildMineProps() {
    // Perimeter Cave Colliders
    for (let x = 0; x < 40; x += 1) {
      const topCol = this.obstacles.create(x * 32, 16, 'col_invisible');
      topCol.setSize(32, 32);
      topCol.setVisible(false);
      const botCol = this.obstacles.create(x * 32, 29 * 32, 'col_invisible');
      botCol.setSize(32, 32);
      botCol.setVisible(false);
    }

    // Mineral Seams (Solid obstacles with collision)
    const oreDeposits = [
      { id: 'iron_1', type: 'iron', name: 'Iron Seam', x: 8, y: 8, texture: 'ore_iron' },
      { id: 'copper_1', type: 'copper', name: 'Copper Vein', x: 18, y: 6, texture: 'ore_copper' },
      { id: 'gold_1', type: 'gold', name: 'Gilded Lode', x: 28, y: 9, texture: 'ore_gold' },
      { id: 'iron_2', type: 'iron', name: 'Deep Iron Bolder', x: 14, y: 18, texture: 'ore_iron' },
      { id: 'crystal_1', type: 'mystery-geode', name: 'Crystal Geode Node', x: 24, y: 20, texture: 'ore_crystal' },
    ];

    oreDeposits.forEach((ore) => {
      const ox = ore.x * 32;
      const oy = ore.y * 32;
      const boulder = this.obstacles.create(ox, oy, ore.texture);
      boulder.setDepth(10);
      boulder.setSize(26, 22);

      this.registerInteractive(ox, oy, 52, `[E] Mine ${ore.name} ⛏️`, () => {
        this.triggerPlayerMining(() => {
          audioManager.play('strike');
          gameEventBridge.emit(gameEvents.MINE_NODE_INTERACT, { ore });
          this.showFloatingText(ox, oy - 20, `+3 ${ore.name}`, '#fef08a');
        });
      });
    });

    // Deepforge Cavern Enemies (Skeletons & Goblins)
    this.spawnEnemy('skeleton_cavern', 16 * 32, 12 * 32);
    this.spawnEnemy('skeleton_cavern', 28 * 32, 16 * 32);
    this.spawnEnemy('goblin_raider', 22 * 32, 24 * 32);
    this.spawnEnemy('goblin_raider', 32 * 32, 22 * 32);

    // Return Exit
    this.registerInteractive(4 * 32, 12 * 32, 60, '[E] Return to Homestead Surface ←', () => {
      this.switchZone('homestead');
    });
  }

  buildForestProps() {
    // Sylvan Shrine (Solid obstacle with collision)
    const shrineTex = this.textures.exists('prop_shrine') ? 'prop_shrine' : 'prop_workbench';
    const shrine = this.obstacles.create(20 * 32, 14 * 32, shrineTex);
    shrine.setDepth(10);
    shrine.setSize(26, 20);
    this.registerInteractive(20 * 32, 14 * 32, 60, '[E] Commune with Sylvan Shrine ✨', () => {
      audioManager.play('levelup');
      this.showFloatingText(20 * 32, 14 * 32 - 20, 'Forest Blessing Granted!', '#a7f3d0');
      gameEventBridge.emit(gameEvents.PROP_INTERACT, { propId: 'prop_shrine' });
    });

    // Trees
    for (let i = 0; i < 22; i += 1) {
      const tx = ((i * 7) % 36 + 2) * 32;
      const ty = (((i * 11) % 24) + 3) * 32;
      if (Math.abs(tx - 20 * 32) > 64 || Math.abs(ty - 14 * 32) > 64) {
        const tree = this.add.image(tx, ty, 'prop_tree');
        tree.setDepth(10);
        const col = this.obstacles.create(tx, ty + 14, 'col_invisible');
        col.setSize(20, 16);
        col.setVisible(false);
      }
    }

    // Hostile Forest Monsters (Emerald Slimes & Shadow Wolves)
    this.spawnEnemy('slime_forest', 12 * 32, 8 * 32);
    this.spawnEnemy('slime_forest', 28 * 32, 10 * 32);
    this.spawnEnemy('slime_forest', 15 * 32, 22 * 32);
    this.spawnEnemy('wolf_shadow', 26 * 32, 22 * 32);
    this.spawnEnemy('wolf_shadow', 32 * 32, 16 * 32);

    // Return Exit
    this.registerInteractive(2 * 32, 12 * 32, 60, '[E] Return to Homestead ←', () => {
      this.switchZone('homestead');
    });
  }

  buildWestRoadProps() {
    const mapWidth = 40;
    // Central cobblestone highway spanning full width
    for (let x = 0; x < mapWidth; x += 1) {
      for (let y = 13; y <= 15; y += 1) {
        this.add.image(x * 32 + 16, y * 32 + 16, 'tile_path');
      }
    }

    // Northern tree barrier with natural depth
    for (let x = 1; x < 39; x += 3) {
      if (x % 4 !== 0) {
        const t = this.add.image(x * 32, 4 * 32, 'prop_tree');
        t.setDepth(10);
        const col = this.obstacles.create(x * 32, 4 * 32 + 14, 'col_invisible');
        col.setSize(22, 16);
        col.setVisible(false);
      }
    }

    // Southern tree barrier with natural depth
    for (let x = 1; x < 39; x += 3) {
      if (x % 5 !== 0) {
        const t = this.add.image(x * 32, 25 * 32, 'prop_tree');
        t.setDepth(10);
        const col = this.obstacles.create(x * 32, 25 * 32 + 14, 'col_invisible');
        col.setSize(22, 16);
        col.setVisible(false);
      }
    }

    // East Road Sign (near Homestead border)
    const eastSign = this.add.image(36 * 32, 11 * 32, 'prop_road_sign');
    eastSign.setDepth(11);
    this.registerInteractive(36 * 32, 11 * 32, 50, '[E] Read Road Sign: "Homestead Frontier Ahead"', () => {
      this.showFloatingText(36 * 32, 11 * 32 - 20, '← City 1 League | Homestead Estate 100 Paces →', '#fef08a');
      gameEventBridge.emit(gameEvents.PROP_INTERACT, { propId: 'prop_road_sign' });
    });

    // Ancient Central Granite Milestone (Discovery Prop)
    const milestone = this.add.image(20 * 32, 11 * 32, 'prop_road_sign');
    milestone.setDepth(11);
    this.registerInteractive(20 * 32, 11 * 32, 55, '[E] Inspect Sunforge West Milestone 📜', () => {
      audioManager.play('tap');
      this.showFloatingText(20 * 32, 11 * 32 - 20, 'Milestone Discovered: Halfway to Sunforge City!', '#a7f3d0');
      gameEventBridge.emit(gameEvents.PROP_INTERACT, { propId: 'prop_road_sign' });
    });

    // West Road Sign (near City Gates)
    const westSign = this.add.image(5 * 32, 11 * 32, 'prop_road_sign');
    westSign.setDepth(11);
    this.registerInteractive(5 * 32, 11 * 32, 50, '[E] Read Road Sign: "Sunforge City Gates Ahead"', () => {
      this.showFloatingText(5 * 32, 11 * 32 - 20, "← Sunforge City Gates | The King's Highway →", '#fef08a');
      gameEventBridge.emit(gameEvents.PROP_INTERACT, { propId: 'prop_road_sign' });
    });

    // Physical Interactive Exits
    this.registerInteractive(2 * 32, 14 * 32, 60, '[E] Enter Sunforge City Gates ←', () => {
      this.switchZone('village', { spawnX: 38 * 32, spawnY: this.player.y });
    });
    this.registerInteractive(38 * 32, 14 * 32, 60, '[E] Return to Sunforge Homestead →', () => {
      this.switchZone('homestead', { spawnX: 3 * 32, spawnY: this.player.y });
    });

    // Roadside Monsters
    this.spawnEnemy('slime_forest', 12 * 32, 9 * 32);
    this.spawnEnemy('wolf_shadow', 28 * 32, 20 * 32);
  }

  buildVillageProps() {
    // Grand Plaza Cobblestone Avenues
    for (let x = 0; x < 40; x += 1) {
      this.add.image(x * 32 + 16, 14 * 32 + 16, 'tile_path');
      this.add.image(x * 32 + 16, 15 * 32 + 16, 'tile_path');
    }
    for (let y = 2; y < 28; y += 1) {
      this.add.image(19 * 32 + 16, y * 32 + 16, 'tile_path');
      this.add.image(20 * 32 + 16, y * 32 + 16, 'tile_path');
    }

    // 1. CENTER PLAZA: Town Fountain & Notice Board
    const fountain = this.obstacles.create(20 * 32, 14 * 32 + 16, 'prop_town_fountain');
    fountain.setDepth(14);
    fountain.setSize(44, 40);
    this.registerInteractive(20 * 32, 14 * 32 + 16, 56, '[E] Toss Lucky Coin into Fountain ✨', () => {
      audioManager.play('coin');
      this.showFloatingText(20 * 32, 14 * 32 - 15, 'Fortune Smiles Upon You! (+1 Renown)', '#fde047');
      gameEventBridge.emit(gameEvents.PROP_INTERACT, { propId: 'prop_town_fountain' });
    });

    const noticeBoard = this.add.image(16 * 32, 12 * 32, 'prop_notice_board');
    noticeBoard.setDepth(14);
    this.registerInteractive(16 * 32, 12 * 32, 50, '[E] Read Town Square Notice Board 📜', () => {
      audioManager.play('tap');
      this.showFloatingText(16 * 32, 12 * 32 - 20, "Notice: Adventurers' Guild awarding bounties at NW Hall!", '#fef08a');
      gameEventBridge.emit(gameEvents.PROP_INTERACT, { propId: 'prop_notice_board' });
    });

    // 2. ADVENTURERS' GUILD (North-West Quarter)
    const guildhall = this.add.image(11 * 32, 5 * 32, 'prop_house');
    guildhall.setDepth(10);
    guildhall.setScale(0.9);
    const guildCol = this.obstacles.create(11 * 32, 5 * 32 + 10, 'col_invisible');
    guildCol.setSize(75, 36);
    guildCol.setVisible(false);

    // Guild Desk & Receptionist Michelle
    const desk = this.obstacles.create(10 * 32, 8 * 32, 'prop_guild_desk');
    desk.setDepth(12);
    desk.setSize(44, 26);
    this.registerInteractive(10 * 32, 8 * 32, 54, '[E] Speak with Guild Warden Michelle ⚔️', () => {
      audioManager.play('coin');
      gameEventBridge.emit(gameEvents.GUILD_VISITED);
      gameEventBridge.emit('OPEN_IN_GAME_GUILD');
    });

    // Guild Bounty Board
    const guildBoard = this.add.image(13 * 32, 7 * 32, 'prop_guild_board');
    guildBoard.setDepth(12);
    this.registerInteractive(13 * 32, 7 * 32, 50, '[E] Inspect Guild Contract Board 📜', () => {
      audioManager.play('tap');
      gameEventBridge.emit(gameEvents.GUILD_VISITED);
      gameEventBridge.emit('OPEN_IN_GAME_GUILD');
    });

    // 3. IRON ANVIL BLACKSMITH (North-East Quarter)
    const forgeKiln = this.obstacles.create(29 * 32, 7 * 32, 'prop_forge_furnace');
    forgeKiln.setDepth(12);
    forgeKiln.setSize(28, 26);

    const anvil = this.obstacles.create(27 * 32, 8 * 32, 'prop_anvil');
    anvil.setDepth(12);
    anvil.setSize(28, 24);
    this.registerInteractive(27 * 32, 8 * 32, 54, '[E] Speak with Blacksmith Elric (Forge & Craft) ⚒️', () => {
      audioManager.play('anvil');
      gameEventBridge.emit('OPEN_IN_GAME_FORGE');
    });

    // 4. THE HEARTH & PINT INN (South-West Quarter)
    const innBuilding = this.add.image(10 * 32, 19 * 32, 'prop_house');
    innBuilding.setDepth(10);
    innBuilding.setScale(0.85);
    const innCol = this.obstacles.create(10 * 32, 19 * 32 + 10, 'col_invisible');
    innCol.setSize(70, 34);
    innCol.setVisible(false);

    const innBed = this.obstacles.create(10 * 32, 22 * 32, 'prop_inn_bed');
    innBed.setDepth(12);
    innBed.setSize(28, 26);
    this.registerInteractive(10 * 32, 22 * 32, 52, '[E] Rest in Cozy Bed (Restore Full Health) 🛏️', () => {
      this.restAtInn();
    });

    // 5. SUNFORGE MARKET BAZAAR (South-East Quarter)
    const marketStand = this.obstacles.create(28 * 32, 22 * 32, 'prop_market_stand');
    marketStand.setDepth(12);
    marketStand.setSize(44, 26);
    this.registerInteractive(28 * 32, 22 * 32, 54, '[E] Trade with Merchant Silas (Bazaar & Seeds) 🪙', () => {
      audioManager.play('coin');
      gameEventBridge.emit('OPEN_IN_GAME_BAZAAR');
    });

    // Exits
    // East Exit to West Road
    this.registerInteractive(38 * 32, 14 * 32, 60, '[E] Leave City via West Road →', () => {
      this.switchZone('west_road', { spawnX: 3 * 32, spawnY: this.player.y });
    });

    // North Exit: Fast-Travel to Homestead Manor
    this.registerInteractive(20 * 32, 2 * 32, 60, '[E] Return to Homestead Manor [Fast-Travel] 🏡', () => {
      this.switchZone('homestead', { spawnX: 15 * 32, spawnY: 14 * 32 });
    });
  }

  registerInteractive(x, y, radius, prompt, onTrigger) {
    this.interactiveObjects.push({ x, y, radius, prompt, onTrigger });
  }

  // Spawns a physical enemy sprite with domain AI state
  spawnEnemy(typeId, x, y) {
    const def = MONSTER_TYPES[typeId];
    if (!def || !this.enemies) return null;

    const sprite = this.enemies.create(x, y, def.texture, 0);
    sprite.setCollideWorldBounds(true);
    sprite.setSize(22, 20);
    sprite.setOffset(5, 10);
    sprite.setDepth(18);

    if (this.anims.exists('anim_' + def.texture)) {
      sprite.play('anim_' + def.texture);
    }

    sprite.monsterDef = def;
    sprite.hp = def.maxHp;
    sprite.maxHp = def.maxHp;
    sprite.defense = def.defense;
    sprite.speed = def.speed;
    sprite.damage = def.damage;
    sprite.aggroRange = def.aggroRange;
    sprite.attackRange = def.attackRange;
    sprite.attackCooldownMs = def.attackCooldownMs;
    sprite.lastAttackTime = 0;
    sprite.staggerUntil = 0;
    sprite.state = ENEMY_STATES.IDLE;

    // Overhead Mini HP Bar
    sprite.hpBar = this.add.graphics();
    sprite.hpBar.setDepth(25);
    this.updateEnemyHpBar(sprite);

    return sprite;
  }

  updateEnemyHpBar(sprite) {
    if (!sprite.hpBar) return;
    sprite.hpBar.clear();
    if (sprite.hp <= 0) return;

    const barW = 24;
    const barH = 3;
    const barX = sprite.x - barW / 2;
    const barY = sprite.y - 18;

    sprite.hpBar.fillStyle(0x000000, 0.7);
    sprite.hpBar.fillRect(barX, barY, barW, barH);

    const pct = Math.max(0, sprite.hp / sprite.maxHp);
    const fillColor = pct > 0.5 ? 0x22c55e : pct > 0.25 ? 0xeab308 : 0xef4444;
    sprite.hpBar.fillStyle(fillColor, 1);
    sprite.hpBar.fillRect(barX, barY, barW * pct, barH);
  }

  // Executes player directional attack
  executePlayerAttack() {
    const now = Date.now();
    if (this.controlsLocked || this.isAttacking || now < this.attackCooldownUntil) return;

    const weaponId = this.customization?.equippedTool || 'steel_broadsword';
    const weapon = WEAPON_TYPES[weaponId] || WEAPON_TYPES.steel_broadsword;

    this.attackCooldownUntil = now + weapon.cooldownMs;
    this.isAttacking = true;

    // Play directional attack animation
    const animKey = 'player_attack_' + this.playerFacing;
    if (this.anims.exists(animKey)) {
      this.player.anims.play(animKey, true);
    }
    this.spawnSlashTrail(this.player.x, this.player.y, this.playerFacing, weapon);
    audioManager.play('strike');

    // Strike impact window at swing peak
    this.time.delayedCall(120, () => {
      if (!this.player || !this.enemies) return;

      const px = this.player.x;
      const py = this.player.y;

      this.enemies.getChildren().forEach((enemy) => {
        if (!enemy.active || enemy.hp <= 0) return;

        const inArc = isTargetInAttackArc(
          px, py, this.playerFacing,
          enemy.x, enemy.y,
          weapon.range, weapon.swingArcDeg
        );

        if (inArc) {
          const dmgResult = computePlayerAttackDamage(this.profile?.stats, weapon.id);
          this.damageEnemy(enemy, dmgResult.damage, dmgResult.isCrit, dmgResult.knockback);
        }
      });
    });

    this.time.delayedCall(weapon.cooldownMs, () => {
      this.isAttacking = false;
      if (this.player && this.player.active) {
        this.player.anims.play('player_walk_' + this.playerFacing, false);
      }
    });
  }

  damageEnemy(enemy, rawDamage, isCrit, knockbackForce) {
    const finalDamage = applyDefenseMitigation(rawDamage, enemy.defense);
    enemy.hp = Math.max(0, enemy.hp - finalDamage);
    this.updateEnemyHpBar(enemy);

    // Floating damage text
    const textStr = (isCrit ? 'CRIT! ' : '') + '-' + finalDamage;
    const textColor = isCrit ? '#ef4444' : '#fef08a';
    this.showFloatingText(enemy.x, enemy.y - 20, textStr, textColor);

    // Impact sparks & audio
    this.spawnHitSparks(enemy.x, enemy.y);
    audioManager.play('strike');

    // Apply knockback vector away from player
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
    enemy.setVelocity(Math.cos(angle) * knockbackForce, Math.sin(angle) * knockbackForce);
    enemy.staggerUntil = Date.now() + 250;
    enemy.setTint(0xff6666);
    this.time.delayedCall(150, () => {
      if (enemy.active) enemy.clearTint();
    });

    gameEventBridge.emit(gameEvents.COMBAT_ENEMY_DAMAGED, {
      monster: enemy.monsterDef,
      damage: finalDamage,
      remainingHp: enemy.hp,
    });

    if (enemy.hp <= 0) {
      this.handleEnemyDeath(enemy);
    }
  }

  handleEnemyDeath(enemy) {
    if (enemy.hpBar) {
      enemy.hpBar.destroy();
      enemy.hpBar = null;
    }
    if (enemy.body) {
      enemy.body.enable = false;
      enemy.setVelocity(0, 0);
    }
    audioManager.play('levelup');
    const loot = generateMonsterLoot(enemy.monsterDef);

    gameEventBridge.emit(gameEvents.COMBAT_ENEMY_DEFEATED, {
      monster: enemy.monsterDef,
      loot,
    });

    this.showFloatingText(enemy.x, enemy.y - 15, `Defeated ${enemy.monsterDef.name}!`, '#86efac');
    this.showFloatingText(enemy.x, enemy.y - 30, `+${loot.gold} Gold · +${loot.xp} XP`, '#fde047');

    this.tweens.add({
      targets: enemy,
      alpha: 0,
      scaleX: 0.1,
      scaleY: 0.1,
      duration: 350,
      onComplete: () => {
        enemy.destroy();
      },
    });
  }

  damagePlayer(amount, attackerName = 'Monster') {
    const now = Date.now();
    if (now < this.playerInvulnerableUntil) return;

    const mitigated = applyDefenseMitigation(amount, this.playerDefense);
    this.playerHp = Math.max(0, this.playerHp - mitigated);
    this.playerInvulnerableUntil = now + 650; // 650ms i-frames

    // Camera shake and flash
    this.cameras.main.shake(120, 0.007);
    this.player.setTint(0xff3333);
    this.time.delayedCall(180, () => {
      if (this.player && this.player.active) this.player.clearTint();
    });

    audioManager.play('tap');
    this.showFloatingText(this.player.x, this.player.y - 20, `-${mitigated} HP`, '#ef4444');

    gameEventBridge.emit(gameEvents.COMBAT_PLAYER_DAMAGED, {
      hp: this.playerHp,
      maxHp: this.playerMaxHp,
      damage: mitigated,
      attackerName,
    });

    if (this.playerHp <= 0) {
      this.handlePlayerDeath();
    }
  }

  handlePlayerDeath() {
    this.controlsLocked = true;
    audioManager.play('tap');
    gameEventBridge.emit(gameEvents.COMBAT_PLAYER_DIED);
    this.showFloatingText(this.player.x, this.player.y - 20, 'Fallen in Battle!', '#ef4444');

    this.cameras.main.fade(800, 0, 0, 0, false, (camera, progress) => {
      if (progress === 1) {
        this.playerHp = this.playerMaxHp;
        this.controlsLocked = false;
        this.switchZone('homestead');
      }
    });
  }

  useHealingPotion() {
    if (this.playerHp >= this.playerMaxHp) {
      this.showFloatingText(this.player.x, this.player.y - 20, 'Health Full!', '#a7f3d0');
      return;
    }
    const healAmount = 45;
    this.playerHp = Math.min(this.playerMaxHp, this.playerHp + healAmount);
    audioManager.play('levelup');
    this.showFloatingText(this.player.x, this.player.y - 20, `+${healAmount} HP`, '#4ade80');
    gameEventBridge.emit(gameEvents.COMBAT_PLAYER_HEAL, {
      hp: this.playerHp,
      maxHp: this.playerMaxHp,
      healed: healAmount,
    });
  }

  spawnSlashTrail(x, y, facing, weapon) {
    const offsets = {
      south: { x: 0, y: 16, angle: 90 },
      north: { x: 0, y: -16, angle: -90 },
      west: { x: -16, y: 0, angle: 180 },
      east: { x: 16, y: 0, angle: 0 },
    };
    const off = offsets[facing] || offsets.south;
    const tex = this.textures.exists('fx_slash') ? 'fx_slash' : 'col_invisible';
    const slash = this.add.image(x + off.x, y + off.y, tex);
    slash.setDepth(22);
    slash.setAngle(off.angle);
    slash.setScale(0.06);
    const colors = {
      steel_broadsword: 0x38bdf8,
      iron_pickaxe: 0xfbbf24,
      forged_scythe: 0x4ade80,
      oak_staff: 0xa855f7,
    };
    slash.setTint(colors[weapon.id] || 0xffffff);
    this.tweens.add({
      targets: slash,
      scaleX: 0.12,
      scaleY: 0.12,
      alpha: 0,
      duration: 180,
      ease: 'Cubic.easeOut',
      onComplete: () => slash.destroy(),
    });
  }

  spawnHitSparks(x, y) {
    const tex = this.textures.exists('fx_spark') ? 'fx_spark' : 'world_tiles';
    const emitter = this.add.particles(x, y, tex, {
      speed: { min: 50, max: 130 },
      scale: { start: tex === 'fx_spark' ? 0.05 : 0.18, end: 0 },
      blendMode: 'ADD',
      lifespan: 250,
      quantity: 10,
    });
    this.time.delayedCall(250, () => emitter.destroy());
  }

  triggerPlayerMining(onComplete) {
    if (!this.player) return;
    this.controlsLocked = true;
    this.player.anims.play('player_mine_south', true);

    this.time.delayedCall(250, () => {
      const emitter = this.add.particles(this.player.x + 8, this.player.y + 4, 'world_tiles', {
        speed: { min: 40, max: 120 },
        scale: { start: 0.15, end: 0 },
        blendMode: 'ADD',
        lifespan: 300,
        quantity: 8,
      });
      this.time.delayedCall(300, () => emitter.destroy());
    });

    this.time.delayedCall(500, () => {
      this.controlsLocked = false;
      this.player.anims.play('player_walk_south', false);
      if (onComplete) onComplete();
    });
  }

  showFloatingText(x, y, text, color = '#ffffff') {
    const txt = this.add.text(x, y, text, {
      fontFamily: 'monospace',
      fontSize: '12px',
      fontWeight: 'bold',
      color: color,
      stroke: '#000000',
      strokeThickness: 3,
    });
    txt.setOrigin(0.5);
    txt.setDepth(100);

    this.tweens.add({
      targets: txt,
      y: y - 25,
      alpha: 0,
      duration: 1200,
      ease: 'Power1',
      onComplete: () => txt.destroy(),
    });
  }

  restAtInn() {
    audioManager.play('levelup');
    this.playerHp = this.playerMaxHp;
    this.cameras.main.flash(400, 255, 255, 255);
    this.showFloatingText(this.player.x, this.player.y - 20, 'Rested & Restored (+Full HP)!', '#4ade80');
    gameEventBridge.emit(gameEvents.COMBAT_PLAYER_HEAL, {
      hp: this.playerHp,
      maxHp: this.playerMaxHp,
      healed: this.playerMaxHp,
    });
    gameEventBridge.emit(gameEvents.INN_REST);
  }

  returnHome() {
    if (this.currentZone === 'homestead') {
      this.showFloatingText(this.player.x, this.player.y - 20, 'Already at Homestead!', '#fde047');
      return;
    }
    const now = Date.now();
    if (now < this.playerInvulnerableUntil) {
      this.showFloatingText(this.player.x, this.player.y - 20, 'Cannot recall during combat!', '#ef4444');
      return;
    }
    audioManager.play('tap');
    this.showFloatingText(this.player.x, this.player.y - 20, 'Returning Home...', '#38bdf8');
    this.switchZone('homestead', { spawnX: 15 * 32, spawnY: 14 * 32 });
  }

  switchZone(newZone, spawnPos = null) {
    audioManager.play('tap');
    this.cameras.main.fade(200, 0, 0, 0, false, (camera, progress) => {
      if (progress === 1) {
        this.scene.restart({
          customization: this.customization,
          profile: this.profile,
          zone: newZone,
          hp: this.playerHp,
          spawnX: spawnPos ? spawnPos.spawnX : undefined,
          spawnY: spawnPos ? spawnPos.spawnY : undefined,
        });
      }
    });
  }

  setupControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.healKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

    // Pointer click: click-to-move, attack enemy, or trigger prompt
    this.input.on('pointerdown', (pointer) => {
      // 1. If clicking when active prompt is open, trigger interaction
      if (this.activePrompt && this.activePrompt.onTrigger) {
        this.activePrompt.onTrigger();
        return;
      }

      // Convert screen pointer coordinates to world coordinates
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);

      // 2. Check if clicking on an active enemy within 36px to attack
      let clickedEnemy = false;
      if (this.enemies) {
        this.enemies.getChildren().forEach((enemy) => {
          if (enemy.active && enemy.hp > 0) {
            const dist = Phaser.Math.Distance.Between(worldPoint.x, worldPoint.y, enemy.x, enemy.y);
            if (dist <= 36) {
              clickedEnemy = true;
              this.executePlayerAttack();
            }
          }
        });
      }

      // 3. Otherwise, set click-to-move destination!
      if (!clickedEnemy) {
        this.moveTarget = { x: worldPoint.x, y: worldPoint.y };
      }
    });
  }

  setupBridge() {
    this.cleanupBridge = [
      gameEventBridge.on(gameEvents.LOCK_CONTROLS, () => {
        this.controlsLocked = true;
      }),
      gameEventBridge.on(gameEvents.UNLOCK_CONTROLS, () => {
        this.controlsLocked = false;
      }),
      gameEventBridge.on(gameEvents.SWITCH_ZONE, ({ zone }) => {
        this.switchZone(zone);
      }),
      gameEventBridge.on(gameEvents.REFRESH_CUSTOMIZATION, ({ customization }) => {
        this.customization = customization;
        this.setupPlayerTexture();
      }),
      gameEventBridge.on(gameEvents.EXECUTE_PLAYER_HEAL, () => {
        this.useHealingPotion();
      }),
      gameEventBridge.on(gameEvents.RETURN_HOME, () => {
        this.returnHome();
      }),
    ];
  }

  update() {
    if (!this.player || this.controlsLocked) {
      if (this.player && this.player.body) {
        this.player.setVelocity(0, 0);
      }
      return;
    }

    // Continuous physical boundary crossings
    if (this.currentZone === 'homestead') {
      if (this.player.x <= 16 && this.player.y >= 10 * 32 && this.player.y <= 18 * 32) {
        this.switchZone('west_road', { spawnX: 38 * 32, spawnY: this.player.y });
        return;
      }
    } else if (this.currentZone === 'west_road') {
      if (this.player.x >= 39 * 32) {
        this.switchZone('homestead', { spawnX: 2 * 32, spawnY: this.player.y });
        return;
      } else if (this.player.x <= 16) {
        this.switchZone('village', { spawnX: 38 * 32, spawnY: this.player.y });
        return;
      }
    } else if (this.currentZone === 'village') {
      if (this.player.x >= 39 * 32 && this.player.y >= 10 * 32 && this.player.y <= 19 * 32) {
        this.switchZone('west_road', { spawnX: 2 * 32, spawnY: this.player.y });
        return;
      }
    }

    // Live player coordinates & facing broadcast for minimap (throttled)
    const curX = Math.round(this.player.x);
    const curY = Math.round(this.player.y);
    if (this._lastEmittedX !== curX || this._lastEmittedY !== curY || this._lastEmittedFacing !== this.playerFacing) {
      const now = Date.now();
      if (!this._lastMoveEmit || now - this._lastMoveEmit > 80) {
        this._lastMoveEmit = now;
        this._lastEmittedX = curX;
        this._lastEmittedY = curY;
        this._lastEmittedFacing = this.playerFacing;
        gameEventBridge.emit(gameEvents.PLAYER_MOVED, {
          x: curX,
          y: curY,
          facing: this.playerFacing,
          zone: this.currentZone,
        });
      }
    }

    // Hotkey attack
    if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
      this.executePlayerAttack();
    }

    // Hotkey heal (routes through React inventory verification)
    if (Phaser.Input.Keyboard.JustDown(this.healKey)) {
      gameEventBridge.emit(gameEvents.USE_HEALING_POTION);
    }

    // Movement calculation
    const isSprinting = this.shiftKey ? Boolean(this.shiftKey.isDown) : false;
    let speed = isSprinting ? 210 : 135;
    if (this.isAttacking) {
      speed *= 0.25; // Controlled momentum during weapon swing commitment
    }

    let vx = 0;
    let vy = 0;

    const left = Boolean(
      (this.cursors && this.cursors.left && this.cursors.left.isDown) ||
      (this.wasd && this.wasd.left && this.wasd.left.isDown)
    );
    const right = Boolean(
      (this.cursors && this.cursors.right && this.cursors.right.isDown) ||
      (this.wasd && this.wasd.right && this.wasd.right.isDown)
    );
    const up = Boolean(
      (this.cursors && this.cursors.up && this.cursors.up.isDown) ||
      (this.wasd && this.wasd.up && this.wasd.up.isDown)
    );
    const down = Boolean(
      (this.cursors && this.cursors.down && this.cursors.down.isDown) ||
      (this.wasd && this.wasd.down && this.wasd.down.isDown)
    );

    if (left) vx -= 1;
    if (right) vx += 1;
    if (up) vy -= 1;
    if (down) vy += 1;

    // Any keyboard input cancels click-to-move destination
    if (vx !== 0 || vy !== 0) {
      this.moveTarget = null;
      if (vx !== 0 && vy !== 0) {
        vx *= 0.7071;
        vy *= 0.7071;
      }
    } else if (this.moveTarget) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.moveTarget.x, this.moveTarget.y);
      if (dist < 8) {
        this.moveTarget = null;
        vx = 0;
        vy = 0;
      } else {
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.moveTarget.x, this.moveTarget.y);
        vx = Math.cos(angle);
        vy = Math.sin(angle);
      }
    }

    this.player.setVelocity(vx * speed, vy * speed);

    // Directional facing & animations
    const isMoving = vx !== 0 || vy !== 0;

    if (vx < -0.1) {
      this.playerFacing = 'west';
      if (!this.isAttacking) this.player.anims.play('player_walk_west', true);
    } else if (vx > 0.1) {
      this.playerFacing = 'east';
      if (!this.isAttacking) this.player.anims.play('player_walk_east', true);
    } else if (vy < -0.1) {
      this.playerFacing = 'north';
      if (!this.isAttacking) this.player.anims.play('player_walk_north', true);
    } else if (vy > 0.1) {
      this.playerFacing = 'south';
      if (!this.isAttacking) this.player.anims.play('player_walk_south', true);
    }

    if (!isMoving && !this.isAttacking) {
      const idleFrames = { south: 0, west: 4, east: 8, north: 12 };
      this.player.anims.stop();
      if (this.player.texture && typeof this.player.setFrame === 'function') {
        try {
          this.player.setFrame(idleFrames[this.playerFacing] ?? 0);
        } catch {
          // Guard against any temporary frame lookup during texture hot reload
        }
      }
    }

    // Proximity check for interactive world props
    let closest = null;
    let minDistance = Infinity;

    this.interactiveObjects.forEach((obj) => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, obj.x, obj.y);
      if (dist <= obj.radius && dist < minDistance) {
        minDistance = dist;
        closest = obj;
      }
    });

    if (closest) {
      if (!this.activePrompt || this.activePrompt.prompt !== closest.prompt) {
        this.activePrompt = closest;
        gameEventBridge.emit(gameEvents.INTERACTION_AVAILABLE, { prompt: closest.prompt });
      }

      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        closest.onTrigger();
      }
    } else {
      if (this.activePrompt) {
        this.activePrompt = null;
        gameEventBridge.emit(gameEvents.INTERACTION_CLEARED);
      }
    }

    // Update active enemy AI state machines
    if (this.enemies) {
      const now = Date.now();
      const playerPos = { x: this.player.x, y: this.player.y };

      this.enemies.getChildren().forEach((enemy) => {
        if (!enemy.active || enemy.hp <= 0) return;

        const nextState = updateEnemyAI(enemy, playerPos, 16, now);
        enemy.state = nextState.state;

        // Apply chase velocity if not staggering
        if (now >= (enemy.staggerUntil || 0)) {
          if (nextState.state === ENEMY_STATES.CHASE) {
            enemy.setVelocity(nextState.vx, nextState.vy);
          } else {
            enemy.setVelocity(0, 0);
          }
        }

        // Enemy melee strike
        if (nextState.shouldStrike) {
          enemy.lastAttackTime = now;
          this.damagePlayer(enemy.damage, enemy.monsterDef?.name || 'Monster');
          this.spawnHitSparks(this.player.x, this.player.y);
        }

        this.updateEnemyHpBar(enemy);
      });
    }
  }

  destroy() {
    if (this.cleanupBridge) {
      this.cleanupBridge.forEach((cleanup) => cleanup());
    }
    if (this.enemies) {
      this.enemies.getChildren().forEach((enemy) => {
        if (enemy.hpBar) enemy.hpBar.destroy();
      });
    }
  }
}
