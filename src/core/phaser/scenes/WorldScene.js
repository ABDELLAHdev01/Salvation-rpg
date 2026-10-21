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

    // Environment, Day/Night & Weather Simulation
    this.gameTime = 8.5 * 3600; // 08:30 AM
    this.weatherState = 'clear';
    this.timeOfDay = 'day';
    this.nextWeatherChange = Date.now() + 90000;
    this.nextLightningTime = 0;
    this.lightSources = [];
    this.ambientDarkGraphics = null;
    this.lightingAddGraphics = null;
    this.rainEmitter = null;

    // Follower Pet Companion
    this.petSprite = null;
    this.equippedPet = 'sheepdog';

    // Boss Encounters
    this.bosses = [];
  }

  init(data) {
    this.controlsLocked = false;
    this.isAttacking = false;
    this.isTransitioning = false;
    this.moveTarget = null;
    this.activePrompt = null;

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

    this.equippedPet = this.profile?.equippedPet || 'sheepdog';
    const initHour = this.profile?.gameTime?.hour ?? 8;
    const initMin = this.profile?.gameTime?.minute ?? 30;
    this.gameTime = initHour * 3600 + initMin * 60;
    this.lightSources = [];
    this.bosses = [];
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
      this.load.image('tile_grass_flowers', '/assets/tilesets/tile_grass_flowers.png');
      this.load.image('tile_grass_clovers', '/assets/tilesets/tile_grass_clovers.png');
      this.load.image('tile_grass_pebbles', '/assets/tilesets/tile_grass_pebbles.png');
      this.load.image('tile_dirt', '/assets/tilesets/tile_dirt.png');
      this.load.image('tile_city_stone', '/assets/tilesets/tile_city_stone.png');
      this.load.image('tile_path', '/assets/tilesets/tile_path.png');
      this.load.image('tile_stone', '/assets/tilesets/tile_stone.png');
      this.load.image('tile_soil', '/assets/tilesets/tile_soil.png');
      this.load.image('tile_water', '/assets/tilesets/tile_water.png');

      // 3. Preload master scenery props
      this.load.image('prop_tree', '/assets/tilesets/prop_tree.png');
      this.load.image('prop_house', '/assets/tilesets/prop_house.png');
      this.load.image('prop_chest', '/assets/tilesets/prop_chest.png');
      this.load.image('prop_workbench', '/assets/tilesets/prop_workbench.png');
      this.load.image('prop_fence_h', '/assets/tilesets/prop_fence_h.png');
      this.load.image('prop_fence_v', '/assets/tilesets/prop_fence_v.png');
      this.load.image('prop_well', '/assets/tilesets/prop_well.png');
      this.load.image('prop_bush', '/assets/tilesets/prop_bush.png');
      this.load.image('prop_berry_bush', '/assets/tilesets/prop_berry_bush.png');
      this.load.image('prop_rock', '/assets/tilesets/prop_rock.png');
      this.load.image('prop_reeds', '/assets/tilesets/prop_reeds.png');
      this.load.image('prop_lilypad', '/assets/tilesets/prop_lilypad.png');
      this.load.image('prop_flowerbed', '/assets/tilesets/prop_flowerbed.png');

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

      // 5. Preload Authenticated CraftPix Purchased RPG Assets
      // Cottage Exterior & Interior
      this.load.image('tile_cottage_floor', '/assets/tilesets/tile_cottage_floor.png');
      this.load.image('tile_cottage_wall', '/assets/tilesets/tile_cottage_wall.png');
      this.load.image('prop_cottage_bed', '/assets/tilesets/prop_cottage_bed.png');
      this.load.image('prop_cottage_single_bed', '/assets/tilesets/prop_cottage_single_bed.png');
      this.load.image('prop_cottage_fireplace', '/assets/tilesets/prop_cottage_fireplace.png');
      this.load.image('prop_cottage_table', '/assets/tilesets/prop_cottage_table.png');
      this.load.image('prop_cottage_bookshelf', '/assets/tilesets/prop_cottage_bookshelf.png');
      this.load.image('prop_cottage_double_bookshelf', '/assets/tilesets/prop_cottage_double_bookshelf.png');
      this.load.image('prop_cottage_rug', '/assets/tilesets/prop_cottage_rug.png');
      this.load.image('prop_cottage_red_rug', '/assets/tilesets/prop_cottage_red_rug.png');
      this.load.image('prop_cottage_cabinet', '/assets/tilesets/prop_cottage_cabinet.png');
      this.load.image('prop_cottage_alchemy', '/assets/tilesets/prop_cottage_alchemy.png');
      this.load.image('prop_cottage_nightstand', '/assets/tilesets/prop_cottage_nightstand.png');
      this.load.image('prop_cottage_plant', '/assets/tilesets/prop_cottage_plant.png');
      this.load.image('prop_cottage_doorway', '/assets/tilesets/prop_cottage_doorway.png');
      this.load.image('prop_manor_house', '/assets/tilesets/prop_manor_house.png');

      // Deepforge Caverns & Dungeon
      this.load.image('tile_dungeon_floor', '/assets/tilesets/tile_dungeon_floor.png');
      this.load.image('tile_dungeon_wall', '/assets/tilesets/tile_dungeon_wall.png');
      this.load.image('prop_dungeon_chest', '/assets/tilesets/prop_dungeon_chest.png');
      this.load.image('prop_dungeon_urn', '/assets/tilesets/prop_dungeon_urn.png');
      this.load.image('prop_dungeon_torch', '/assets/tilesets/prop_dungeon_torch.png');

      // Top-Down Natural Trees & Roads
      this.load.image('prop_tree_oak', '/assets/tilesets/prop_tree_oak.png');
      this.load.image('prop_tree_pine', '/assets/tilesets/prop_tree_pine.png');
      this.load.image('prop_tree_apple', '/assets/tilesets/prop_tree_apple.png');
      this.load.image('prop_tree_stump', '/assets/tilesets/prop_tree_stump.png');
      this.load.image('prop_tree_log', '/assets/tilesets/prop_tree_log.png');
      this.load.image('prop_granite_boulder', '/assets/tilesets/prop_granite_boulder.png');
      this.load.image('tile_cobblestone', '/assets/tilesets/tile_cobblestone.png');

      // Nature & Environmental Props
      this.load.image('prop_natural_pond', '/assets/tilesets/prop_natural_pond.png');
      this.load.image('prop_wood_dock', '/assets/tilesets/prop_wood_dock.png');
      this.load.image('prop_wild_mushrooms', '/assets/tilesets/prop_wild_mushrooms.png');
      this.load.image('prop_wildflowers', '/assets/tilesets/prop_wildflowers.png');
      this.load.image('prop_magic_stones1', '/assets/tilesets/prop_magic_stones1.png');
      this.load.image('prop_magic_stones2', '/assets/tilesets/prop_magic_stones2.png');
      this.load.image('prop_magic_stones3', '/assets/tilesets/prop_magic_stones3.png');
      this.load.image('prop_chest_gold', '/assets/tilesets/prop_chest_gold.png');
      this.load.image('prop_chest_iron', '/assets/tilesets/prop_chest_iron.png');

      // Village Houses & Artisan Workshops
      this.load.image('prop_village_house1', '/assets/tilesets/prop_village_house1.png');
      this.load.image('prop_village_house2', '/assets/tilesets/prop_village_house2.png');
      this.load.image('prop_village_house3', '/assets/tilesets/prop_village_house3.png');
      this.load.image('prop_artisan_forge', '/assets/tilesets/prop_artisan_forge.png');
      this.load.image('npc_blacksmith', '/assets/tilesets/npc_blacksmith.png');
      this.load.image('npc_merchant', '/assets/tilesets/npc_merchant.png');

      // Animated Mobs & Animals (CraftPix 32x32 spritesheets)
      this.load.spritesheet('boar_walk', '/assets/enemies/boar_walk.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('boar_attack', '/assets/enemies/boar_attack.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('boar_death', '/assets/enemies/boar_death.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('fox_walk', '/assets/enemies/fox_walk.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('sheep_walk', '/assets/props/farm_animals/sheep_walk.png', { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('rooster_walk', '/assets/props/farm_animals/rooster_walk.png', { frameWidth: 32, frameHeight: 32 });

      // Tutorial Island & CraftPix Trees from craftpix-net-385863-free-top-down-trees-pixel-art.zip
      this.load.image('tutorial_island_map', '/assets/island/island_Tiled_map.png');
      this.load.image('tree_palm_1', '/assets/trees/Palm_tree1_1.png');
      this.load.image('tree_palm_2', '/assets/trees/Palm_tree2_1.png');
      this.load.image('tree_fruit_1', '/assets/trees/Fruit_tree1.png');
      this.load.image('tree_fruit_2', '/assets/trees/Fruit_tree2.png');
      this.load.image('tree_flower_1', '/assets/trees/Flower_tree1.png');
      this.load.image('tree_moss_1', '/assets/trees/Moss_tree1.png');
      this.load.image('tree_autumn_1', '/assets/trees/Autumn_tree1.png');
      this.load.image('tree_oak_1', '/assets/trees/Tree1.png');
      this.load.image('tree_oak_2', '/assets/trees/Tree2.png');
      this.load.image('prop_sailboat', '/assets/tilesets/prop_sailboat.png');
      this.load.image('prop_road_cobble_h', '/assets/tilesets/prop_road_cobble_h.png');
      this.load.image('prop_road_cobble_v', '/assets/tilesets/prop_road_cobble_v.png');
      this.load.image('prop_scarecrow', '/assets/tilesets/prop_scarecrow.png');
      this.load.image('prop_water_well', '/assets/tilesets/prop_water_well.png');
      this.load.image('prop_red_mushroom', '/assets/tilesets/prop_red_mushroom.png');
      this.load.image('prop_crates', '/assets/tilesets/prop_crates.png');
      this.load.image('prop_stump', '/assets/tilesets/prop_stump.png');
      this.load.image('prop_rock_moss1', '/assets/tilesets/prop_rock_moss1.png');
      this.load.image('prop_rock_moss2', '/assets/tilesets/prop_rock_moss2.png');
      this.load.image('prop_grass_tuft', '/assets/tilesets/prop_grass_tuft.png');
      this.load.image('prop_grass_bush', '/assets/tilesets/prop_grass_bush.png');
      this.load.image('prop_flower_pink', '/assets/tilesets/prop_flower_pink.png');
      this.load.image('prop_flower_yellow', '/assets/tilesets/prop_flower_yellow.png');
      this.load.image('prop_flower_orange', '/assets/tilesets/prop_flower_orange.png');
      this.load.image('npc_elder', '/assets/tilesets/npc_elder.png');
      this.load.image('prop_campfire', '/assets/tilesets/prop_campfire.png');
      this.load.image('tile_cottage_wall_top', '/assets/tilesets/tile_cottage_wall_top.png');
      this.load.image('tile_cottage_window', '/assets/tilesets/tile_cottage_window.png');
      this.load.image('prop_cottage_weapon_rack', '/assets/tilesets/prop_cottage_weapon_rack.png');
    } catch {
      // Safe fallback
    }
  }

  create() {
    // 0. Ensure Camera FX is clean and set mood lighting
    this.cameras.main.resetFX();
    const bgColors = {
      tutorial_island: '#227093',
      homestead: '#1c2e14',
      homestead_interior: '#120a05',
      west_road: '#1a2712',
      forest: '#0f1c0d',
      mine: '#12141a',
      village: '#1c1815',
    };
    this.cameras.main.setBackgroundColor(bgColors[this.currentZone] || '#1c2e14');
    this.cameras.main.fadeIn(250, 0, 0, 0);

    // 0b. Regional BGM & Ambience
    audioManager.playBGM(this.currentZone);

    // 1. Register Procedural World Textures
    registerWorldTextures(this);

    // 1b. Setup Enemy Spritesheet Animations
    this.setupEnemyAnimations();

    // 2. Setup Player Dynamic Layered Spritesheet
    this.setupPlayerTexture();

    // 3. Build Zone Environment & Props
    this.buildCurrentZone();

    // 3b. Setup Follower Pet Companion
    this.setupFollowerPet();

    // 3c. Setup Ambient Atmosphere & Lighting
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
      { key: 'anim_enemy_bat', sheet: 'enemy_bat', rate: 6 },
      { key: 'anim_enemy_spider', sheet: 'enemy_spider', rate: 5 },
      { key: 'anim_enemy_orc', sheet: 'enemy_orc', rate: 5 },
      { key: 'anim_boss_slime_king', sheet: 'boss_slime_king', rate: 4 },
      { key: 'anim_boss_drakmor', sheet: 'boss_drakmor', rate: 4 },
      { key: 'anim_pet_sheepdog', sheet: 'pet_sheepdog', rate: 6 },
      { key: 'anim_pet_wisp', sheet: 'pet_wisp', rate: 5 },
      { key: 'anim_pet_falcon', sheet: 'pet_falcon', rate: 7 },
      // CraftPix Authenticated Animations
      { key: 'anim_boar_walk', sheet: 'boar_walk', rate: 8, end: 5 },
      { key: 'anim_boar_attack', sheet: 'boar_attack', rate: 8, end: 4, repeat: 0 },
      { key: 'anim_fox_walk', sheet: 'fox_walk', rate: 7, end: 5 },
      { key: 'anim_sheep_walk', sheet: 'sheep_walk', rate: 4, end: 3 },
      { key: 'anim_rooster_walk', sheet: 'rooster_walk', rate: 6, end: 3 },
    ];
    enemyAnims.forEach((ea) => {
      if (this.textures.exists(ea.sheet)) {
        if (this.anims.exists(ea.key)) this.anims.remove(ea.key);
        try {
          this.anims.create({
            key: ea.key,
            frames: this.anims.generateFrameNumbers(ea.sheet, { start: 0, end: ea.end ?? 3 }),
            frameRate: ea.rate,
            repeat: ea.repeat !== undefined ? ea.repeat : -1,
          });
        } catch {
          // Safe fallback for single-frame textures
        }
      }
    });
  }

  setupZoneAtmosphere() {
    try {
      // 1. Ambient darkness & dynamic light graphics layers
      if (this.ambientDarkGraphics) this.ambientDarkGraphics.destroy();
      this.ambientDarkGraphics = this.add.graphics();
      this.ambientDarkGraphics.setScrollFactor(0);
      this.ambientDarkGraphics.setDepth(27);

      if (this.lightingAddGraphics) this.lightingAddGraphics.destroy();
      this.lightingAddGraphics = this.add.graphics();
      this.lightingAddGraphics.setScrollFactor(0);
      this.lightingAddGraphics.setDepth(28);
      this.lightingAddGraphics.setBlendMode(Phaser.BlendModes.ADD);

      // 2. Zone atmospheric motes
      const particleTex = this.textures.exists('fx_particle_dot') ? 'fx_particle_dot' : 'col_invisible';
      if (this.currentZone === 'homestead') {
        const emitter = this.add.particles(640, 480, particleTex, {
          emitZone: { source: new Phaser.Geom.Rectangle(0, 0, 1280, 960), type: 'random' },
          speedX: { min: -15, max: -5 },
          speedY: { min: -10, max: 10 },
          scale: { start: 1.5, end: 0.5 },
          alpha: { start: 0.6, end: 0 },
          tint: 0xfde047,
          lifespan: 4000,
          frequency: 250,
        });
        emitter.setDepth(25);
      } else if (this.currentZone === 'west_road') {
        const emitter = this.add.particles(640, 480, particleTex, {
          emitZone: { source: new Phaser.Geom.Rectangle(0, 0, 1280, 960), type: 'random' },
          speedX: { min: -15, max: -5 },
          speedY: { min: -8, max: 8 },
          scale: { start: 1.5, end: 0.5 },
          alpha: { start: 0.5, end: 0 },
          tint: 0xfacc15,
          lifespan: 3800,
          frequency: 250,
        });
        emitter.setDepth(25);
      } else if (this.currentZone === 'forest') {
        const emitter = this.add.particles(640, 480, particleTex, {
          emitZone: { source: new Phaser.Geom.Rectangle(0, 0, 1280, 960), type: 'random' },
          speedX: { min: -10, max: 10 },
          speedY: { min: -20, max: -5 },
          scale: { start: 2, end: 0.5 },
          alpha: { start: 0.7, end: 0 },
          tint: 0x34d399,
          lifespan: 3500,
          frequency: 200,
        });
        emitter.setDepth(25);
      } else if (this.currentZone === 'mine') {
        const emitter = this.add.particles(640, 480, particleTex, {
          emitZone: { source: new Phaser.Geom.Rectangle(0, 0, 1280, 960), type: 'random' },
          speedX: { min: -5, max: 5 },
          speedY: { min: 5, max: 15 },
          scale: { start: 1.5, end: 0.5 },
          alpha: { start: 0.5, end: 0 },
          tint: 0x38bdf8,
          lifespan: 3000,
          frequency: 300,
        });
        emitter.setDepth(25);
      } else if (this.currentZone === 'village') {
        const emitter = this.add.particles(640, 480, particleTex, {
          emitZone: { source: new Phaser.Geom.Rectangle(0, 0, 1280, 960), type: 'random' },
          speedX: { min: -8, max: 8 },
          speedY: { min: -15, max: -5 },
          scale: { start: 1.5, end: 0.5 },
          alpha: { start: 0.5, end: 0 },
          tint: 0xfbbf24,
          lifespan: 3500,
          frequency: 350,
        });
        emitter.setDepth(25);
      }

      // 3. Dynamic Weather (rain / storm / clear)
      this.setupWeatherParticles();
    } catch {
      // Safe fallback
    }
  }

  setupWeatherParticles() {
    if (this.rainEmitter) {
      this.rainEmitter.destroy();
      this.rainEmitter = null;
    }
    if (this.currentZone === 'mine') {
      audioManager.stopRainAmbience();
      return;
    }

    if (this.weatherState === 'rain' || this.weatherState === 'thunderstorm') {
      audioManager.startRainAmbience();
      const pTex = this.textures.exists('fx_particle_dot') ? 'fx_particle_dot' : 'col_invisible';
      this.rainEmitter = this.add.particles(640, 0, pTex, {
        emitZone: { source: new Phaser.Geom.Rectangle(-200, 0, 1680, 20), type: 'random' },
        speedY: { min: 300, max: 460 },
        speedX: { min: -60, max: -30 },
        scaleY: { start: 2.8, end: 1.5 },
        scaleX: { start: 0.6, end: 0.4 },
        alpha: { start: 0.65, end: 0.2 },
        tint: 0x93c5fd,
        lifespan: 1400,
        frequency: this.weatherState === 'thunderstorm' ? 8 : 16,
      });
      this.rainEmitter.setDepth(26);
    } else {
      audioManager.stopRainAmbience();
    }
  }

  setupFollowerPet() {
    this.equippedPet = this.profile?.equippedPet || 'sheepdog';
    if (this.petSprite) {
      this.petSprite.destroy();
      this.petSprite = null;
    }

    const texKey = 'pet_' + this.equippedPet;
    const animKey = 'anim_pet_' + this.equippedPet;

    if (this.textures.exists(texKey)) {
      const px = this.player ? this.player.x - 22 : 15 * 32;
      const py = this.player ? this.player.y + 10 : 14 * 32;
      this.petSprite = this.physics.add.sprite(px, py, texKey, 0);
      this.petSprite.setDepth(17);
      this.petSprite.setSize(18, 16);
      this.petSprite.setCollideWorldBounds(true);
      // Ensure follower pet never intercepts or blocks player clicks
      if (typeof this.petSprite.disableInteractive === 'function') {
        this.petSprite.disableInteractive();
      }
      if (this.anims.exists(animKey)) {
        this.petSprite.play(animKey);
      }
    }
  }

  petCompanion() {
    if (!this.petSprite) return;
    const petSounds = { sheepdog: 'synthBark', wisp: 'synthWisp', falcon: 'synthChirp' };
    const soundKey = petSounds[this.equippedPet] || 'synthBark';
    if (typeof audioManager[soundKey] === 'function') audioManager[soundKey]();

    const names = { sheepdog: 'Barkley', wisp: 'Lumina', falcon: 'Talon' };
    const petName = names[this.equippedPet] || 'Companion';
    this.showFloatingText(this.petSprite.x, this.petSprite.y - 20, `${petName} loves you! ❤️ (+Morale)`, '#f472b6');
    this.spawnHitSparks(this.petSprite.x, this.petSprite.y);
  }

  spawnBoss(typeId, x, y) {
    const boss = this.spawnEnemy(typeId, x, y);
    if (!boss) return null;

    boss.isBoss = true;
    boss.bossPhase = 1;
    boss.nextQuakeSlam = Date.now() + 6000;
    boss.setScale(1.4);
    boss.setSize(38, 34);
    boss.setDepth(19);

    this.bosses.push(boss);
    return boss;
  }

  triggerBossQuakeSlam(boss) {
    if (!this.player || !this.player.active) return;
    const targetX = this.player.x;
    const targetY = this.player.y;

    // 1. Telegraph Warning Decal
    const telegraph = this.add.image(targetX, targetY, 'fx_telegraph_circle');
    telegraph.setDepth(4);
    telegraph.setAlpha(0.75);
    telegraph.setScale(0.8);
    audioManager.synthBossTelegraph();

    this.tweens.add({
      targets: telegraph,
      scaleX: 1.15,
      scaleY: 1.15,
      alpha: 0.95,
      yoyo: true,
      repeat: 3,
      duration: 150,
    });

    // 2. Heavy Ground Slam Impact
    this.time.delayedCall(1200, () => {
      if (!telegraph.active) return;
      audioManager.synthBossSlam();
      this.cameras.main.shake(240, 0.016);
      this.spawnHitSparks(targetX, targetY);

      if (this.player && this.player.active) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, targetX, targetY);
        if (dist <= 48) {
          this.damagePlayer(35, (boss.monsterDef?.name || 'Boss') + ' Quake Slam');
          this.showFloatingText(this.player.x, this.player.y - 25, 'CRUSHED BY SLAM!', '#ef4444');
        } else {
          this.showFloatingText(this.player.x, this.player.y - 20, 'DODGED SLAM! ⚡', '#a7f3d0');
        }
      }

      telegraph.destroy();
    });
  }

  updateEnvironmentSimulation(delta) {
    this.gameTime += (delta / 1000) * 60; // 1 real second = 1 in-game minute
    if (this.gameTime >= 86400) this.gameTime -= 86400;

    const hour = Math.floor(this.gameTime / 3600);
    const minute = Math.floor((this.gameTime % 3600) / 60);

    let timeOfDay = 'day';
    if (hour >= 21 || hour < 5) timeOfDay = 'night';
    else if (hour >= 18) timeOfDay = 'dusk';
    else if (hour >= 5 && hour < 8) timeOfDay = 'dawn';

    this.timeOfDay = timeOfDay;

    // Weather state transitions (clear / rain / storm)
    const now = Date.now();
    if (this.currentZone !== 'mine' && now >= this.nextWeatherChange) {
      this.nextWeatherChange = now + 90000;
      const roll = Math.random();
      const prevWeather = this.weatherState;
      if (roll < 0.60) this.weatherState = 'clear';
      else if (roll < 0.85) this.weatherState = 'rain';
      else this.weatherState = 'thunderstorm';

      if (prevWeather !== this.weatherState) {
        this.setupWeatherParticles();
      }
    }

    // Thunderstorm lightning strikes
    if (this.weatherState === 'thunderstorm' && now >= this.nextLightningTime) {
      this.nextLightningTime = now + Phaser.Math.Between(7000, 14000);
      this.cameras.main.flash(90, 255, 255, 255);
      audioManager.playThunder();
    }

    // Broadcast tick every 1.5s
    if (!this._lastEnvEmit || now - this._lastEnvEmit > 1500) {
      this._lastEnvEmit = now;
      gameEventBridge.emit(gameEvents.ENVIRONMENT_TICK, {
        hour,
        minute,
        timeOfDay: this.timeOfDay,
        weather: this.weatherState,
      });
    }

    this.updateLighting();
  }

  updateLighting() {
    if (!this.ambientDarkGraphics || !this.lightingAddGraphics) return;

    this.ambientDarkGraphics.clear();
    this.lightingAddGraphics.clear();

    let ambientAlpha = 0;
    let ambientColor = 0x090e1a;

    if (this.currentZone === 'mine') {
      ambientAlpha = 0.55;
      ambientColor = 0x030712;
    } else if (this.timeOfDay === 'night') {
      ambientAlpha = 0.65;
      ambientColor = 0x090e1a;
    } else if (this.timeOfDay === 'dusk') {
      ambientAlpha = 0.38;
      ambientColor = 0x2e1065;
    } else if (this.timeOfDay === 'dawn') {
      ambientAlpha = 0.22;
      ambientColor = 0x78350f;
    } else if (this.weatherState === 'rain' || this.weatherState === 'thunderstorm') {
      ambientAlpha = 0.28;
      ambientColor = 0x1e293b;
    }

    if (ambientAlpha > 0) {
      this.ambientDarkGraphics.fillStyle(ambientColor, ambientAlpha);
      this.ambientDarkGraphics.fillRect(0, 0, this.scale.width, this.scale.height);

      // Player radial light
      if (this.player && this.player.active) {
        const playerRadius = this.equippedPet === 'wisp' ? 140 : 100;
        this.drawAdditiveLight(this.player.x, this.player.y, playerRadius, 0xffe082, 0.45);
      }

      // Zone light sources
      this.lightSources.forEach((light) => {
        this.drawAdditiveLight(light.x, light.y, light.radius, light.color, light.intensity, light.flicker);
      });
    }
  }

  drawAdditiveLight(worldX, worldY, radius, color, intensity, flicker = false) {
    const cam = this.cameras.main;
    const screenX = (worldX - cam.worldView.x) * cam.zoom;
    const screenY = (worldY - cam.worldView.y) * cam.zoom;
    const flickerFactor = flicker ? 0.94 + Math.sin(Date.now() * 0.008) * 0.06 : 1.0;
    const screenRadius = radius * cam.zoom * flickerFactor;

    if (
      screenX + screenRadius < 0 ||
      screenX - screenRadius > this.scale.width ||
      screenY + screenRadius < 0 ||
      screenY - screenRadius > this.scale.height
    ) {
      return;
    }

    this.lightingAddGraphics.fillStyle(color, intensity * 0.18);
    this.lightingAddGraphics.fillCircle(screenX, screenY, screenRadius);
    this.lightingAddGraphics.fillStyle(color, intensity * 0.30);
    this.lightingAddGraphics.fillCircle(screenX, screenY, screenRadius * 0.65);
    this.lightingAddGraphics.fillStyle(0xffffff, intensity * 0.38);
    this.lightingAddGraphics.fillCircle(screenX, screenY, screenRadius * 0.3);
  }

  buildCurrentZone() {
    this.interactiveObjects = [];

    let mapWidth = 40;  // 40 tiles * 32px = 1280px
    let mapHeight = 30; // 30 tiles * 32px = 960px
    if (this.currentZone === 'tutorial_island') {
      mapWidth = 25;   // 25 tiles * 32px = 800px
      mapHeight = 20;  // 20 tiles * 32px = 640px
    }
    const worldW = mapWidth * 32;
    const worldH = mapHeight * 32;

    this.physics.world.setBounds(0, 0, worldW, worldH);

    // Ground Layer - Extended border buffer with organic meadow stippling and zone-specific ground
    if (this.currentZone !== 'tutorial_island') {
      for (let x = -15; x < mapWidth + 15; x += 1) {
        for (let y = -15; y < mapHeight + 15; y += 1) {
          let tileKey;
          if (this.currentZone === 'homestead_interior') {
            // Inside cottage manor hall (warm 23x13 room from x=9..31, y=9..21)
            if (x >= 9 && x <= 31 && y >= 9 && y <= 21) {
              const floorTex = this.textures.exists('tile_cottage_floor') ? 'tile_cottage_floor' : 'tile_wood_floor';
              this.add.image(x * 32 + 16, y * 32 + 16, floorTex);
            }
            continue;
          } else if (this.currentZone === 'mine') {
            tileKey = this.textures.exists('tile_dungeon_floor') ? 'tile_dungeon_floor' : 'tile_stone';
          } else if (this.currentZone === 'village') {
            tileKey = 'tile_city_stone';
          } else {
            // Organic meadow variation across terrain (Seamless CraftPix green)
            const hash = Math.abs(x * 31 + y * 47) % 100;
            if (hash < 12) {
              tileKey = 'tile_grass_flowers';
            } else if (hash < 22) {
              tileKey = 'tile_grass_clovers';
            } else if (hash < 30) {
              tileKey = 'tile_grass_pebbles';
            } else {
              tileKey = 'tile_grass';
            }
          }
          this.add.image(x * 32 + 16, y * 32 + 16, tileKey);
        }
      }
    }

    // Cobblestone Pathways in Homestead with feathered grass fringe
    if (this.currentZone === 'homestead') {
      for (let y = 8; y < 24; y += 2) {
        const pv = this.add.image(14 * 32 + 16, y * 32 + 32, 'prop_road_cobble_v');
        pv.setDepth(2);
      }
      for (let x = 0; x < 38; x += 2) {
        const ph = this.add.image(x * 32 + 32, 14 * 32 + 16, 'prop_road_cobble_h');
        ph.setDepth(2);
      }
    }

    // Groups
    this.obstacles = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();

    if (this.currentZone === 'tutorial_island') {
      this.buildTutorialIslandProps();
    } else if (this.currentZone === 'homestead') {
      this.buildHomesteadProps();
    } else if (this.currentZone === 'homestead_interior') {
      this.buildHomesteadInteriorProps();
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
    } else if (this.currentZone === 'tutorial_island') {
      spawnX = 390;
      spawnY = 520;
    } else if (this.currentZone === 'homestead_interior') {
      spawnX = 20 * 32;
      spawnY = 20 * 32;
    } else if (this.currentZone === 'homestead') {
      spawnX = 14 * 32 + 16;
      spawnY = 8 * 32 + 12;
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
    if (this.currentZone === 'homestead_interior') {
      const roomX = 9 * 32;
      const roomY = 9 * 32;
      const roomW = (31 - 9 + 1) * 32;
      const roomH = (21 - 9 + 1) * 32;
      this.cameras.main.setBounds(roomX, roomY, roomW, roomH);
      this.cameras.main.centerOn(20 * 32, 15 * 32);
    } else if (this.currentZone === 'tutorial_island') {
      this.cameras.main.setBounds(0, 0, 800, 640);
      this.cameras.main.centerOn(spawnX, spawnY);
    } else {
      this.cameras.main.setBounds(0, 0, worldW, worldH);
      this.cameras.main.centerOn(spawnX, spawnY);
    }
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);
    this.updateCameraZoom();
    this.scale.off('resize', this.updateCameraZoom, this);
    this.scale.on('resize', this.updateCameraZoom, this);
  }

  updateCameraZoom() {
    if (!this.cameras || !this.cameras.main) return;
    const viewW = this.cameras.main.width || this.scale.width;
    const viewH = this.cameras.main.height || this.scale.height;

    if (this.currentZone === 'homestead_interior') {
      const interiorZoom = Math.min(viewW / (23 * 32), viewH / (13 * 32));
      this.cameras.main.setZoom(Math.max(1.4, Math.min(1.85, interiorZoom)));
      return;
    }

    if (this.currentZone === 'tutorial_island') {
      const islandZoom = Math.max(1.4, Math.min(1.85, viewW / (25 * 32)));
      this.cameras.main.setZoom(islandZoom);
      return;
    }

    const worldW = 40 * 32;
    const worldH = 30 * 32;
    const minZoomW = viewW / worldW;
    const minZoomH = viewH / worldH;
    const targetZoom = Math.max(1.4, Math.max(minZoomW, minZoomH));
    this.cameras.main.setZoom(targetZoom);
  }

  buildTutorialIslandProps() {
    // 1. Island Master Backdrop (800x640 CraftPix Island Art)
    const islandBg = this.add.image(400, 320, 'tutorial_island_map');
    islandBg.setDepth(1);

    // 2. Coastal Ocean Water Ripples
    const ripples = [
      { x: 140, y: 550 },
      { x: 670, y: 510 },
      { x: 400, y: 615 },
      { x: 280, y: 590 },
      { x: 520, y: 590 },
      { x: 740, y: 350 },
      { x: 60, y: 350 },
    ];
    ripples.forEach((r, idx) => {
      const rip = this.add.image(r.x, r.y, 'fx_ripple');
      rip.setDepth(2);
      rip.setAlpha(0.5);
      this.tweens.add({
        targets: rip,
        scaleX: 1.3,
        scaleY: 1.3,
        alpha: 0.2,
        duration: 1500 + idx * 200,
        yoyo: true,
        repeat: -1,
      });
    });

    // 3. Perimeter Deep Sea Blockers
    for (let y = 0; y < 640; y += 32) {
      const colW = this.obstacles.create(20, y + 16, 'col_invisible');
      colW.setSize(40, 32);
      colW.setVisible(false);
      const colE = this.obstacles.create(780, y + 16, 'col_invisible');
      colE.setSize(40, 32);
      colE.setVisible(false);
    }
    for (let x = 0; x < 800; x += 32) {
      const colN = this.obstacles.create(x + 16, 20, 'col_invisible');
      colN.setSize(32, 40);
      colN.setVisible(false);
      if (x < 360 || x > 440) {
        const colS = this.obstacles.create(x + 16, 620, 'col_invisible');
        colS.setSize(32, 40);
        colS.setVisible(false);
      }
    }
    // Northwest Rock Cliff Obstacles
    const cliffNW = this.obstacles.create(110, 160, 'col_invisible');
    cliffNW.setSize(160, 200);
    cliffNW.setVisible(false);
    // Northeast Rock Plateau Obstacles
    const cliffNE = this.obstacles.create(680, 150, 'col_invisible');
    cliffNE.setSize(180, 170);
    cliffNE.setVisible(false);

    // 4. CraftPix Top-Down Trees from craftpix-net-385863-free-top-down-trees-pixel-art.zip
    const islandTrees = [
      { x: 250, y: 480, key: 'tree_palm_1', trunkW: 16, trunkH: 14 },
      { x: 310, y: 530, key: 'tree_palm_2', trunkW: 16, trunkH: 14 },
      { x: 570, y: 470, key: 'tree_palm_1', trunkW: 16, trunkH: 14 },
      { x: 650, y: 420, key: 'tree_palm_2', trunkW: 16, trunkH: 14 },
      { x: 190, y: 510, key: 'tree_palm_1', trunkW: 16, trunkH: 14 },
      { x: 440, y: 330, key: 'tree_fruit_1', trunkW: 18, trunkH: 14 },
      { x: 350, y: 310, key: 'tree_fruit_2', trunkW: 18, trunkH: 14 },
      { x: 510, y: 260, key: 'tree_flower_1', trunkW: 18, trunkH: 14 },
      { x: 230, y: 270, key: 'tree_moss_1', trunkW: 18, trunkH: 14 },
      { x: 370, y: 190, key: 'tree_autumn_1', trunkW: 18, trunkH: 14 },
      { x: 480, y: 190, key: 'tree_oak_1', trunkW: 18, trunkH: 14 },
    ];
    islandTrees.forEach((t) => {
      const tex = this.textures.exists(t.key) ? t.key : 'prop_tree';
      const treeSpr = this.add.image(t.x, t.y, tex);
      treeSpr.setScale(0.55);
      treeSpr.setDepth(14);
      const trunk = this.obstacles.create(t.x, t.y + 22, 'col_invisible');
      trunk.setSize(t.trunkW, t.trunkH);
      trunk.setVisible(false);
    });

    // 5. Awakening Stranded Campfire & Guide NPC
    const campfire = this.add.image(380, 510, 'prop_campfire');
    campfire.setDepth(10);
    this.lightSources.push({
      x: 380,
      y: 510,
      radius: 95,
      color: 0xf97316,
      intensity: 0.6,
      flicker: true,
    });

    // Guide NPC: Warden Eldon
    const elder = this.obstacles.create(355, 510, 'npc_elder');
    elder.setDepth(12);
    elder.setSize(22, 28);
    this.registerInteractive(355, 510, 50, '[E] Speak with Castaway Elder Eldon 💬', () => {
      audioManager.play('tap');
      this.showFloatingText(355, 480, 'Elder Eldon: Open the chest, pick berries, and board the sloop!', '#fde047');
      gameEventBridge.emit('TUTORIAL_GUIDE_TALKED');
    });

    // 6. Interactive Objective 1: Castaway Supply Chest
    const chestTex = this.textures.exists('prop_chest_iron') ? 'prop_chest_iron' : 'prop_chest';
    const chest = this.obstacles.create(310, 475, chestTex);
    chest.setDepth(11);
    chest.setSize(26, 22);
    this.registerInteractive(310, 475, 50, '[E] Salvage Castaway Chest 📦', () => {
      if (this.tutorialChestOpened) {
        this.showFloatingText(310, 455, 'Chest is empty!', '#9ca3af');
        return;
      }
      this.tutorialChestOpened = true;
      audioManager.play('coin');
      this.showFloatingText(310, 455, '+1 Apprentice Blade & 3x Potions! ⚔️', '#34d399');
      gameEventBridge.emit('LOOT_ACQUIRED', { itemId: 'apprentice-sword', amount: 1 });
      gameEventBridge.emit('LOOT_ACQUIRED', { itemId: 'health-potion', amount: 3 });
      gameEventBridge.emit('TUTORIAL_STEP_ADVANCE', { step: 2 });
    });

    // 7. Interactive Objective 2: Forage Sunberries from Fruit Tree
    this.registerInteractive(440, 330, 55, '[E] Forage Sunberries from Fruit Tree 🍎', () => {
      if (this.tutorialForageDone) {
        this.showFloatingText(440, 305, 'Branches are picked clean!', '#9ca3af');
        return;
      }
      this.tutorialForageDone = true;
      audioManager.play('levelup');
      this.showFloatingText(440, 305, '+5 Sweet Sunberries Harvested! 🍎', '#fde047');
      gameEventBridge.emit('LOOT_ACQUIRED', { itemId: 'sunberry', amount: 5 });
      gameEventBridge.emit('TUTORIAL_STEP_ADVANCE', { step: 3 });
    });

    // 8. Interactive Objective 3: Gentle Island Training Slime
    this.spawnEnemy('slime_forest', 520, 370);

    // 9. Interactive Objective 4 & Finale: Departure Pier & Sloop to Mainland
    const dock = this.add.image(400, 580, 'prop_wood_dock');
    dock.setDepth(6);

    const sailboat = this.add.image(400, 608, 'prop_sailboat');
    sailboat.setDepth(7);
    this.tweens.add({
      targets: sailboat,
      y: 612,
      angle: 2,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.registerInteractive(400, 580, 55, '[E] Board Sloop to Sunforge Mainland ⛵', () => {
      audioManager.play('levelup');
      this.showFloatingText(400, 550, 'Setting sail for Sunforge Estate! ⛵', '#38bdf8');
      gameEventBridge.emit('TUTORIAL_COMPLETED_LEAVE_ISLAND');
      try {
        localStorage.setItem('wardenTutorialCompleted', 'true');
        localStorage.setItem('wardenTutorialHidden', 'true');
      } catch {
        // ignore
      }
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.time.delayedCall(850, () => {
        this.switchZone('homestead', { spawnX: 14 * 32 + 16, spawnY: 8 * 32 + 12 });
      });
    });
  }

  buildHomesteadProps() {
    // 0. Courtyard & Terrace in front of Manor House with rounded cobblestone paving
    for (let cx = 11; cx <= 17; cx += 2) {
      const p = this.add.image(cx * 32 + 16, 7 * 32 + 16, 'prop_road_cobble_h');
      p.setDepth(3);
    }

    // 1. Manor House (Authentic CraftPix Character Home - perfectly centered below HUD)
    const houseTex = this.textures.exists('prop_manor_house') ? 'prop_manor_house' : 'prop_house';
    const house = this.add.image(14 * 32 + 16, 6 * 32, houseTex);
    house.setDepth(15);
    const houseCollider = this.obstacles.create(14 * 32 + 16, 6 * 32 + 8, 'col_invisible');
    houseCollider.setSize(88, 44);
    houseCollider.setVisible(false);

    // Flowerbed Planters flanking Manor Porch
    const fbL = this.add.image(11 * 32, 8 * 32 + 16, 'prop_flowerbed');
    fbL.setDepth(14);
    const fbR = this.add.image(17 * 32 + 16, 8 * 32 + 16, 'prop_flowerbed');
    fbR.setDepth(14);

    // Front Door Entrance to Cottage Interior
    this.registerInteractive(14 * 32 + 16, 7 * 32 + 20, 50, '[E] Enter Cottage Home 🏡', () => {
      audioManager.play('tap');
      this.switchZone('homestead_interior', { spawnX: 20 * 32, spawnY: 19 * 32 });
    });

    // 2. Storage Vault Chest (Solid obstacle with collision)
    const chest = this.obstacles.create(18 * 32, 7 * 32 + 16, 'prop_chest');
    chest.setDepth(16);
    chest.setSize(24, 20);
    this.registerInteractive(18 * 32, 7 * 32 + 16, 50, '[E] Open Vault Pouch', () => {
      audioManager.play('tap');
      gameEventBridge.emit(gameEvents.CHEST_OPEN);
    });

    // 3. Crafting Anvil & Workbench (Solid obstacle with collision)
    const bench = this.obstacles.create(10 * 32, 7 * 32 + 16, 'prop_workbench');
    bench.setDepth(16);
    bench.setSize(26, 20);
    this.registerInteractive(10 * 32, 7 * 32 + 16, 50, '[E] Open Workshop Forge', () => {
      audioManager.play('anvil');
      gameEventBridge.emit(gameEvents.WORKBENCH_OPEN);
    });

    // 4. Perimeter Trees & Rustic Timber Fences
    for (let x = 2; x < 38; x += 3) {
      if (x < 12 || x > 18) {
        const tTex = this.textures.exists('prop_tree_oak') ? 'prop_tree_oak' : 'prop_tree';
        const t = this.add.image(x * 32, 2 * 32, tTex);
        if (tTex === 'prop_tree_oak') t.setScale(0.5);
        t.setDepth(10);
        const col = this.obstacles.create(x * 32, 2 * 32 + 14, 'col_invisible');
        col.setSize(20, 16);
        col.setVisible(false);
      }
    }

    // Homestead Apple Orchard Tree
    if (this.textures.exists('prop_tree_apple')) {
      const appleTree = this.obstacles.create(8 * 32, 14 * 32, 'prop_tree_apple');
      appleTree.setScale(0.55);
      appleTree.setDepth(14);
      appleTree.setSize(32, 32);
      this.registerInteractive(8 * 32, 14 * 32, 48, '[E] Pick Ripe Orchard Apple 🍎', () => {
        audioManager.play('harvest');
        this.showFloatingText(8 * 32, 14 * 32 - 18, '+1 Crisp Orchard Apple!', '#fde047');
        gameEventBridge.emit('LOOT_ACQUIRED', { itemId: 'sunroot', amount: 1 });
      });
    }

    // Ambient Farm Livestock (Sheep & Rooster)
    this.spawnAmbientCreature('sheep', 6 * 32, 21 * 32);
    this.spawnAmbientCreature('sheep', 10 * 32, 22 * 32);
    this.spawnAmbientCreature('rooster', 14 * 32, 18 * 32);

    // Rustic Wood Fences around Farmstead Perimeter
    for (let fx = 4; fx <= 12; fx += 1) {
      if (fx !== 10) {
        const fence = this.obstacles.create(fx * 32 + 16, 16 * 32 + 16, 'prop_fence_h');
        fence.setDepth(12);
        fence.setSize(32, 16);
      }
    }
    for (let fy = 17; fy <= 22; fy += 1) {
      const fenceV = this.obstacles.create(4 * 32 + 16, fy * 32 + 16, 'prop_fence_v');
      fenceV.setDepth(12);
      fenceV.setSize(16, 32);
    }

    // Cobblestone access trail connecting Manor Road to Farm Plots with feathered grass fringe
    for (let dx = 6; dx <= 14; dx += 2) {
      const trail = this.add.image(dx * 32 + 16, 17 * 32 + 16, 'prop_road_cobble_h');
      trail.setDepth(2);
    }

    // Authentic CraftPix Pumpkin Scarecrow guarding the farm plots
    const scarecrow = this.obstacles.create(5 * 32, 19 * 32, 'prop_scarecrow');
    scarecrow.setDepth(14);
    scarecrow.setSize(24, 30);
    this.registerInteractive(5 * 32, 19 * 32, 45, '[E] Greet Jack the Scarecrow 🎃', () => {
      audioManager.play('tap');
      this.showFloatingText(5 * 32, 19 * 32 - 18, 'Jack: Crops are safe from mountain crows!', '#fde047');
    });

    // Stone Water Well beside Farm Plots
    const wellTex = this.textures.exists('prop_water_well') ? 'prop_water_well' : 'prop_well';
    const well = this.obstacles.create(12 * 32, 19 * 32 + 16, wellTex);
    well.setDepth(15);
    well.setSize(28, 22);
    this.registerInteractive(12 * 32, 19 * 32 + 16, 48, '[E] Draw Fresh Well Water 🪣', () => {
      audioManager.synthSplash();
      this.showFloatingText(12 * 32, 19 * 32 - 15, '💧 Sweet Spring Water Drawn!', '#38bdf8');
      gameEventBridge.emit(gameEvents.PROP_INTERACT, { propId: 'prop_well' });
    });

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

    // 6. Homestead Pond with Sand Shoreline, Reeds & Water Lily
    // Natural earthen shoreline surrounding pond water
    for (let px = 27; px <= 33; px += 1) {
      for (let py = 19; py <= 24; py += 1) {
        if (px === 27 || px === 33 || py === 19 || py === 24) {
          this.add.image(px * 32 + 16, py * 32 + 16, 'tile_dirt');
        }
      }
    }
    for (let px = 28; px <= 32; px += 1) {
      for (let py = 20; py <= 23; py += 1) {
        this.add.image(px * 32 + 16, py * 32 + 16, 'tile_water');
      }
    }
    const pondRipple = this.add.image(30 * 32, 21 * 32 + 16, 'fx_ripple');
    pondRipple.setDepth(6);
    pondRipple.setAlpha(0.7);
    this.tweens.add({
      targets: pondRipple,
      scaleX: 1.25,
      scaleY: 1.25,
      alpha: 0.35,
      duration: 1500,
      yoyo: true,
      repeat: -1,
    });

    // Pond shoreline reeds & cattails
    const reeds1 = this.add.image(28 * 32 + 4, 20 * 32 + 8, 'prop_reeds');
    reeds1.setDepth(8);
    const reeds2 = this.add.image(32 * 32 + 12, 23 * 32, 'prop_reeds');
    reeds2.setDepth(8);

    // Wooden Pier / Fishing Dock extending into Pond
    if (this.textures.exists('prop_wood_dock')) {
      const dock = this.add.image(28 * 32, 21 * 32, 'prop_wood_dock');
      dock.setDepth(7);
    }

    // Blooming lotus water lilypad
    const lily = this.add.image(31 * 32, 21 * 32, 'prop_lilypad');
    lily.setDepth(7);

    const fishSpot = this.add.image(28 * 32 + 16, 21 * 32 + 16, 'prop_fishing_spot');
    fishSpot.setDepth(8);
    this.registerInteractive(28 * 32 + 16, 21 * 32 + 16, 55, '[E] Cast Fishing Line into Pond 🎣', () => {
      audioManager.synthSplash();
      gameEventBridge.emit('OPEN_IN_GAME_FISHING');
    });

    // 7. Organic Foliage, Sweetberry Shrubs, Wildflowers & Granite Rocks
    const homesteadDecor = [
      { x: 8, y: 9, tex: 'prop_bush' },
      { x: 21, y: 8, tex: 'prop_berry_bush' },
      { x: 25, y: 10, tex: 'prop_granite_boulder' },
      { x: 7, y: 13, tex: 'prop_berry_bush' },
      { x: 22, y: 15, tex: 'prop_bush' },
      { x: 5, y: 24, tex: 'prop_granite_boulder' },
      { x: 26, y: 24, tex: 'prop_berry_bush' },
      { x: 13, y: 17, tex: 'prop_wildflowers' },
      { x: 26, y: 18, tex: 'prop_wild_mushrooms' },
      { x: 16, y: 23, tex: 'prop_wildflowers' },
    ];
    homesteadDecor.forEach((d) => {
      const tex = this.textures.exists(d.tex) ? d.tex : 'prop_bush';
      const sp = this.obstacles.create(d.x * 32 + 16, d.y * 32 + 16, tex);
      sp.setDepth(11);
      sp.setSize(24, 18);
    });

    // 7. Wall Torches on Manor House (positioned beside front door)
    const torchL = this.add.image(12 * 32, 6 * 32, 'prop_torch');
    torchL.setDepth(16);
    const torchR = this.add.image(16 * 32 + 32, 6 * 32, 'prop_torch');
    torchR.setDepth(16);
    this.lightSources.push(
      { x: 12 * 32, y: 6 * 32, radius: 85, color: 0xf97316, intensity: 0.5, flicker: true },
      { x: 16 * 32 + 32, y: 6 * 32, radius: 85, color: 0xf97316, intensity: 0.5, flicker: true }
    );

    // 8. Homestead Orchard & Perimeter Oaks (CraftPix authentic trees)
    const orchardTrees = [
      { x: 7 * 32, y: 5 * 32, key: 'tree_fruit_1' },
      { x: 9 * 32, y: 4 * 32, key: 'tree_fruit_2' },
      { x: 23 * 32, y: 5 * 32, key: 'tree_oak_1' },
      { x: 26 * 32, y: 6 * 32, key: 'tree_oak_2' },
      { x: 34 * 32, y: 16 * 32, key: 'tree_oak_1' },
    ];
    orchardTrees.forEach((t) => {
      const tex = this.textures.exists(t.key) ? t.key : 'prop_tree';
      const tree = this.add.image(t.x, t.y, tex);
      tree.setScale(0.52);
      tree.setDepth(13);
      const col = this.obstacles.create(t.x, t.y + 24, 'col_invisible');
      col.setSize(22, 16);
      col.setVisible(false);
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

  buildHomesteadInteriorProps() {
    // 1. Manor Cottage Perimeter & Walls (Cozy 23x13 Hall from x=9 to 31, y=9 to 21)
    const wallTopTex = this.textures.exists('tile_cottage_wall_top') ? 'tile_cottage_wall_top' : 'tile_cottage_wall';
    const wallMidTex = this.textures.exists('tile_cottage_wall') ? 'tile_cottage_wall' : 'tile_indoor_wall';
    const windowTex = this.textures.exists('tile_cottage_window') ? 'tile_cottage_window' : wallMidTex;

    // North Wall: Row 9 (ceiling timber molding) + Row 10 (slate stone wall with windows)
    for (let x = 9; x <= 31; x += 1) {
      const topWall = this.obstacles.create(x * 32 + 16, 9 * 32 + 16, wallTopTex);
      topWall.setDepth(15);
      topWall.setSize(32, 32);

      // Windows at x=13 and x=27 for natural daylight
      if (x === 13 || x === 27) {
        const win = this.add.image(x * 32 + 16, 10 * 32 + 16, windowTex);
        win.setDepth(14);
      } else if (x < 19 || x > 21) {
        const midWall = this.obstacles.create(x * 32 + 16, 10 * 32 + 16, wallMidTex);
        midWall.setDepth(14);
        midWall.setSize(32, 32);
      }

      // South Wall with center arched doorway at x=20
      if (x === 20) {
        const doorway = this.add.image(x * 32 + 16, 21 * 32 + 16, 'prop_cottage_doorway');
        doorway.setDepth(15);
      } else {
        const btmWall = this.obstacles.create(x * 32 + 16, 21 * 32 + 16, wallMidTex);
        btmWall.setDepth(15);
        btmWall.setSize(32, 32);
      }
    }

    // West and East Stone Wall Columns
    for (let y = 9; y <= 21; y += 1) {
      const leftWall = this.obstacles.create(9 * 32 + 16, y * 32 + 16, wallMidTex);
      leftWall.setDepth(15);
      leftWall.setSize(32, 32);
      const rightWall = this.obstacles.create(31 * 32 + 16, y * 32 + 16, wallMidTex);
      rightWall.setDepth(15);
      rightWall.setSize(32, 32);
    }

    // 2. CENTER LIVING HALL: Stone Fireplace Hearth & Chimney (x=20, y=9..11)
    const fpTex = this.textures.exists('prop_cottage_fireplace') ? 'prop_cottage_fireplace' : 'prop_fireplace';
    const fireplace = this.obstacles.create(20 * 32 + 16, 10 * 32 + 8, fpTex);
    fireplace.setDepth(16);
    fireplace.setSize(56, 40);
    this.lightSources.push({
      x: 20 * 32 + 16,
      y: 10 * 32 + 24,
      radius: 220,
      color: 0xf59e0b,
      intensity: 1.25,
      flickerSpeed: 0.12,
      flickerAmount: 20,
    });

    // Fringed Crimson Velvet Rug in front of Fireplace
    const redRugTex = this.textures.exists('prop_cottage_red_rug') ? 'prop_cottage_red_rug' : 'prop_indoor_rug';
    const hearthRug = this.add.image(20 * 32 + 16, 12 * 32 + 20, redRugTex);
    hearthRug.setDepth(5);

    // Weapon Rack with Gleaming Steel Blades
    if (this.textures.exists('prop_cottage_weapon_rack')) {
      const wRack = this.obstacles.create(17 * 32 + 16, 10 * 32 + 20, 'prop_cottage_weapon_rack');
      wRack.setDepth(16);
      wRack.setSize(44, 38);
    }

    // Center Storage Vault Chest
    const chest = this.obstacles.create(18 * 32, 19 * 32 + 8, 'prop_chest');
    chest.setDepth(16);
    chest.setSize(24, 20);
    this.registerInteractive(18 * 32, 19 * 32 + 8, 45, '[E] Open Storage Vault [I] 📦', () => {
      audioManager.play('tap');
      gameEventBridge.emit(gameEvents.CHEST_OPEN);
    });

    // Welcome Straw Doormat & South Exit to Homestead Yard
    const doormat = this.add.image(20 * 32 + 16, 20 * 32 + 20, 'prop_doormat');
    doormat.setDepth(6);
    this.registerInteractive(20 * 32 + 16, 21 * 32, 45, '[E] Exit to Homestead Yard 🚪', () => {
      audioManager.play('tap');
      this.switchZone('homestead', { spawnX: 14 * 32 + 16, spawnY: 8 * 32 + 12 });
    });

    // 3. WEST WING: Master Bedroom Suite (x=10..15)
    // Cozy Single Bed (Restores 100% Health)
    const bedTex = this.textures.exists('prop_cottage_bed') ? 'prop_cottage_bed' : 'prop_inn_bed';
    const bed = this.obstacles.create(13 * 32 + 16, 11 * 32 + 16, bedTex);
    bed.setDepth(16);
    bed.setSize(30, 44);
    this.registerInteractive(13 * 32 + 16, 11 * 32 + 16, 50, '[E] Sleep in Bed (+Restore Full Health) 🛏️', () => {
      this.restAtInn();
      gameEventBridge.emit('RESTED_IN_BED');
    });

    // Nightstand beside Bed with Warm Candle Light
    if (this.textures.exists('prop_cottage_nightstand')) {
      const stand = this.obstacles.create(12 * 32 + 8, 11 * 32 + 16, 'prop_cottage_nightstand');
      stand.setDepth(16);
      stand.setSize(20, 26);
      this.lightSources.push({
        x: 12 * 32 + 8,
        y: 11 * 32 + 8,
        radius: 70,
        color: 0xfde047,
        intensity: 0.45,
        flicker: true,
      });
    }

    // Wardrobe Harvest Cabinet
    if (this.textures.exists('prop_cottage_cabinet')) {
      const cabinet = this.obstacles.create(11 * 32 + 16, 15 * 32 + 16, 'prop_cottage_cabinet');
      cabinet.setDepth(16);
      cabinet.setSize(52, 54);
      this.registerInteractive(11 * 32 + 16, 15 * 32 + 16, 45, '[E] Search Wooden Wardrobe 🧥', () => {
        audioManager.play('tap');
        this.showFloatingText(11 * 32 + 16, 15 * 32 - 15, 'Found Warm Adventurer Garments!', '#fde047');
      });
    }

    // Houseplant in Bedroom
    if (this.textures.exists('prop_cottage_plant')) {
      this.add.image(11 * 32 + 16, 19 * 32, 'prop_cottage_plant').setDepth(16);
    }

    // 4. EAST WING: Dining & Alchemy Studio (x=25..30)
    // Complete Dining Table with Chairs
    const tblTex = this.textures.exists('prop_cottage_table') ? 'prop_cottage_table' : 'prop_table_chair';
    const diningTable = this.obstacles.create(26 * 32 + 16, 15 * 32 + 16, tblTex);
    diningTable.setDepth(16);
    diningTable.setSize(64, 64);

    // Arcane Bookshelf (Sunforge Chronicles)
    const shelfTex = this.textures.exists('prop_cottage_bookshelf') ? 'prop_cottage_bookshelf' : 'prop_bookshelf';
    const bookshelf = this.obstacles.create(29 * 32 + 16, 11 * 32, shelfTex);
    bookshelf.setDepth(16);
    bookshelf.setSize(30, 56);
    this.registerInteractive(29 * 32 + 16, 11 * 32, 48, '[E] Read Sunforge Chronicles 📜', () => {
      audioManager.play('tap');
      this.showFloatingText(29 * 32 + 16, 11 * 32 - 25, '📜 Ancient Warden Lore recorded!', '#fde047');
      gameEventBridge.emit('PROP_INTERACT', { propId: 'chronicle_lore' });
    });

    // Alchemy Workbench
    if (this.textures.exists('prop_cottage_alchemy')) {
      const alchemy = this.obstacles.create(24 * 32, 19 * 32, 'prop_cottage_alchemy');
      alchemy.setDepth(16);
      alchemy.setSize(40, 38);
      this.registerInteractive(24 * 32, 19 * 32, 45, '[E] Brew Herbal Salve 🧪', () => {
        audioManager.play('coin');
        this.showFloatingText(24 * 32, 19 * 32 - 15, '🧪 Brewing Crafting Alchemy unlocked!', '#a7f3d0');
      });
    }

    // Houseplant in Dining Studio
    if (this.textures.exists('prop_cottage_plant')) {
      this.add.image(30 * 32, 19 * 32, 'prop_cottage_plant').setDepth(16);
    }
  }

  buildMineProps() {
    // Perimeter Cave Walls (Authentic CraftPix Cavern Wall Tiles)
    const dWallTex = this.textures.exists('tile_dungeon_wall') ? 'tile_dungeon_wall' : 'tile_indoor_wall';
    for (let x = 0; x < 40; x += 1) {
      const topWall = this.obstacles.create(x * 32 + 16, 16, dWallTex);
      topWall.setDepth(15);
      topWall.setSize(32, 32);
      const botWall = this.obstacles.create(x * 32 + 16, 29 * 32 + 16, dWallTex);
      botWall.setDepth(15);
      botWall.setSize(32, 32);
    }
    for (let y = 1; y < 29; y += 1) {
      if (y < 10 || y > 14) {
        const leftWall = this.obstacles.create(16, y * 32 + 16, dWallTex);
        leftWall.setDepth(15);
        leftWall.setSize(32, 32);
      }
      const rightWall = this.obstacles.create(39 * 32 + 16, y * 32 + 16, dWallTex);
      rightWall.setDepth(15);
      rightWall.setSize(32, 32);
    }

    // Cavern Wall Torches (CraftPix Animated / Flickering Torches)
    const cavernTorches = [
      { x: 8 * 32, y: 2 * 32 },
      { x: 18 * 32, y: 2 * 32 },
      { x: 28 * 32, y: 2 * 32 },
      { x: 12 * 32, y: 28 * 32 },
      { x: 26 * 32, y: 28 * 32 },
    ];
    cavernTorches.forEach((tp) => {
      const torchTex = this.textures.exists('prop_dungeon_torch') ? 'prop_dungeon_torch' : 'prop_torch';
      const t = this.add.image(tp.x, tp.y, torchTex);
      t.setDepth(16);
      this.lightSources.push({
        x: tp.x,
        y: tp.y,
        radius: 95,
        color: 0xf97316,
        intensity: 0.5,
        flicker: true,
      });
    });

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
          gameEventBridge.emit('mine:shatter', { oreId: ore.type });
          this.showFloatingText(ox, oy - 20, `+3 ${ore.name}`, '#fef08a');
        });
      });
    });

    // Cavern Rock Formations / Boulder Pillars creating natural mining tunnels
    const caveBoulders = [
      { x: 12, y: 6 }, { x: 22, y: 8 }, { x: 16, y: 14 },
      { x: 27, y: 15 }, { x: 8, y: 20 }, { x: 30, y: 20 }
    ];
    caveBoulders.forEach((b) => {
      const tex = this.textures.exists('prop_granite_boulder') ? 'prop_granite_boulder' : 'prop_rock';
      const cb = this.obstacles.create(b.x * 32, b.y * 32, tex);
      cb.setDepth(12);
      cb.setSize(28, 24);
    });

    // Ancient Cavern Relic Chest (Interactive CraftPix Dungeon Golden Chest)
    const chestTex = this.textures.exists('prop_chest_gold')
      ? 'prop_chest_gold'
      : (this.textures.exists('prop_dungeon_chest') ? 'prop_dungeon_chest' : 'prop_chest');
    const dChest = this.obstacles.create(34 * 32, 26 * 32, chestTex);
    dChest.setDepth(16);
    dChest.setSize(28, 24);
    this.registerInteractive(34 * 32, 26 * 32, 50, '[E] Unlock Ancient Cavern Chest 🗝️', () => {
      audioManager.play('coin');
      this.showFloatingText(34 * 32, 26 * 32 - 18, '+1 Lost Dungeon Relic & +150 Gold!', '#fde047');
      gameEventBridge.emit('LOOT_ACQUIRED', { itemId: 'dungeon-relic', amount: 1 });
      gameEventBridge.emit(gameEvents.PROP_INTERACT, { propId: 'prop_dungeon_chest' });
      gameEventBridge.emit('prop:interacted', { propId: 'prop_dungeon_chest' });
    });

    // Secondary Miner's Iron Supply Chest
    if (this.textures.exists('prop_chest_iron')) {
      const ironChest = this.obstacles.create(10 * 32, 22 * 32, 'prop_chest_iron');
      ironChest.setDepth(16);
      ironChest.setSize(24, 20);
      this.registerInteractive(10 * 32, 22 * 32, 45, '[E] Pry Open Miner Supply Chest ⛏️', () => {
        audioManager.play('coin');
        this.showFloatingText(10 * 32, 22 * 32 - 18, '+50 Gold & Iron Ingots!', '#fde047');
        gameEventBridge.emit('LOOT_ACQUIRED', { itemId: 'iron', amount: 3 });
        ironChest.destroy();
      });
    }

    // Ancient Cavern Granite Boulder
    if (this.textures.exists('prop_granite_boulder')) {
      const cavernBoulder = this.obstacles.create(24 * 32, 20 * 32 - 16, 'prop_granite_boulder');
      cavernBoulder.setDepth(13);
      cavernBoulder.setSize(28, 24);
    }

    // Ancient Cavern Urns
    if (this.textures.exists('prop_dungeon_urn')) {
      [
        { x: 12 * 32, y: 10 * 32 },
        { x: 26 * 32, y: 22 * 32 },
      ].forEach((up) => {
        const urn = this.obstacles.create(up.x, up.y, 'prop_dungeon_urn');
        urn.setDepth(16);
        urn.setSize(24, 24);
        this.registerInteractive(up.x, up.y, 45, '[E] Search Ancient Urn 🏺', () => {
          audioManager.play('strike');
          this.showFloatingText(up.x, up.y - 18, '+35 Gold & Gem Shards!', '#a7f3d0');
          gameEventBridge.emit(gameEvents.PROP_INTERACT, { propId: 'prop_dungeon_urn' });
          urn.destroy();
        });
      });
    }

    // Deepforge Cavern Enemies (Skeletons, Goblins, Bats, Spiders)
    this.spawnEnemy('skeleton_cavern', 16 * 32, 12 * 32);
    this.spawnEnemy('skeleton_cavern', 28 * 32, 16 * 32);
    this.spawnEnemy('goblin_raider', 22 * 32, 24 * 32);
    this.spawnEnemy('goblin_raider', 14 * 32, 24 * 32);
    this.spawnEnemy('bat_shadow', 10 * 32, 16 * 32);
    this.spawnEnemy('bat_shadow', 24 * 32, 12 * 32);
    this.spawnEnemy('spider_cavern', 30 * 32, 10 * 32);
    this.spawnEnemy('spider_cavern', 18 * 32, 26 * 32);

    // World Boss Encounter: Drakmor Bone-Lord Sanctum
    this.spawnBoss('boss_drakmor', 32 * 32, 24 * 32);

    // Glowing Azure Cavern Crystals (Dynamic Light Sources)
    this.lightSources.push(
      { x: 8 * 32, y: 8 * 32, radius: 80, color: 0x38bdf8, intensity: 0.45, flicker: false },
      { x: 18 * 32, y: 6 * 32, radius: 80, color: 0xfbbf24, intensity: 0.45, flicker: false },
      { x: 28 * 32, y: 9 * 32, radius: 90, color: 0xfacc15, intensity: 0.5, flicker: false },
      { x: 24 * 32, y: 20 * 32, radius: 95, color: 0xa855f7, intensity: 0.5, flicker: false },
      { x: 32 * 32, y: 24 * 32, radius: 120, color: 0x38bdf8, intensity: 0.55, flicker: true }
    );

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

    // Ancient Moss-Covered Standing Boulders flanking Shrine
    if (this.textures.exists('prop_rock_moss1')) {
      const rockW = this.obstacles.create(18 * 32, 14 * 32, 'prop_rock_moss1');
      rockW.setDepth(11);
      rockW.setSize(22, 18);
    }
    if (this.textures.exists('prop_rock_moss2')) {
      const rockE = this.obstacles.create(22 * 32, 14 * 32, 'prop_rock_moss2');
      rockE.setDepth(11);
      rockE.setSize(22, 18);
    }
    if (this.textures.exists('prop_granite_boulder')) {
      const boulderN = this.obstacles.create(20 * 32, 12 * 32 + 16, 'prop_granite_boulder');
      boulderN.setDepth(9);
      boulderN.setSize(24, 20);
    }

    // Fairy Ring of Wild Mushrooms & Wildflowers around Shrine Clearing
    const fairyRing = [
      { x: 19, y: 13, tex: 'prop_wild_mushrooms' },
      { x: 21, y: 13, tex: 'prop_wildflowers' },
      { x: 18, y: 15, tex: 'prop_wildflowers' },
      { x: 22, y: 15, tex: 'prop_wild_mushrooms' },
      { x: 20, y: 16, tex: 'prop_wildflowers' },
    ];
    fairyRing.forEach((f) => {
      if (this.textures.exists(f.tex)) {
        const item = this.add.image(f.x * 32 + 16, f.y * 32 + 16, f.tex);
        item.setDepth(8);
      }
    });

    // Dense Ancient Trees from CraftPix top-down trees pack
    const forestTreeKeys = ['tree_oak_1', 'tree_oak_2', 'tree_moss_1', 'tree_autumn_1', 'tree_flower_1'];
    for (let i = 0; i < 38; i += 1) {
      const tx = ((i * 7 + 3) % 36 + 2) * 32;
      const ty = (((i * 11 + 5) % 24) + 3) * 32;
      // Keep clearing around Sylvan Shrine (x=17..23, y=11..17) and west entrance (x=1..4, y=11..15)
      const nearShrine = Math.abs(tx - 20 * 32) < 110 && Math.abs(ty - 14 * 32) < 110;
      const nearWestGate = tx < 5 * 32 && ty > 9 * 32 && ty < 16 * 32;
      if (!nearShrine && !nearWestGate) {
        const tKey = forestTreeKeys[i % forestTreeKeys.length];
        const treeTex = this.textures.exists(tKey) ? tKey : 'prop_tree';
        const tree = this.add.image(tx, ty, treeTex);
        tree.setScale(0.52);
        tree.setDepth(12);
        const col = this.obstacles.create(tx, ty + 24, 'col_invisible');
        col.setSize(24, 18);
        col.setVisible(false);
      }
    }

    // Lush Ancient Forest Groves surrounding clearing paths
    const groveTrees = [
      { x: 7 * 32, y: 7 * 32, key: 'tree_moss_1' },
      { x: 10 * 32, y: 5 * 32, key: 'tree_oak_1' },
      { x: 14 * 32, y: 8 * 32, key: 'tree_autumn_1' },
      { x: 8 * 32, y: 16 * 32, key: 'tree_oak_2' },
      { x: 11 * 32, y: 19 * 32, key: 'tree_flower_1' },
      { x: 14 * 32, y: 22 * 32, key: 'tree_moss_1' },
      { x: 26 * 32, y: 6 * 32, key: 'tree_oak_1' },
      { x: 29 * 32, y: 9 * 32, key: 'tree_autumn_1' },
      { x: 27 * 32, y: 18 * 32, key: 'tree_flower_1' },
      { x: 31 * 32, y: 21 * 32, key: 'tree_oak_2' },
    ];
    groveTrees.forEach((gt) => {
      const tex = this.textures.exists(gt.key) ? gt.key : 'prop_tree';
      const tree = this.add.image(gt.x, gt.y, tex);
      tree.setScale(0.55);
      tree.setDepth(12);
      const col = this.obstacles.create(gt.x, gt.y + 24, 'col_invisible');
      col.setSize(24, 18);
      col.setVisible(false);
    });

    // Forest Floor Details (Fallen logs, mossy stumps, boulders)
    const forestDetails = [
      { x: 10, y: 12, tex: 'prop_tree_stump' },
      { x: 14, y: 20, tex: 'prop_tree_log' },
      { x: 28, y: 12, tex: 'prop_tree_log' },
      { x: 30, y: 22, tex: 'prop_tree_stump' },
      { x: 16, y: 6, tex: 'prop_granite_boulder' },
      { x: 25, y: 24, tex: 'prop_granite_boulder' },
    ];
    forestDetails.forEach((fd) => {
      if (this.textures.exists(fd.tex)) {
        const dObj = this.obstacles.create(fd.x * 32 + 16, fd.y * 32 + 16, fd.tex);
        dObj.setDepth(9);
        dObj.setSize(24, 18);
      }
    });

    // Hostile Forest Monsters & Hunt Wildlife (Emerald Slimes, Shadow Wolves, Bristleback Boars, Amber Foxes)
    this.spawnEnemy('slime_forest', 12 * 32, 8 * 32);
    this.spawnEnemy('boar_bristleback', 15 * 32, 16 * 32);
    this.spawnEnemy('fox_amber', 18 * 32, 9 * 32);
    this.spawnEnemy('slime_forest', 26 * 32, 10 * 32);
    this.spawnEnemy('wolf_shadow', 26 * 32, 22 * 32);
    this.spawnEnemy('fox_amber', 30 * 32, 18 * 32);
    this.spawnEnemy('spider_cavern', 8 * 32, 18 * 32);

    // World Boss Encounter: Slime King Colossus
    this.spawnBoss('boss_slime_king', 32 * 32, 8 * 32);

    // Dynamic Sylvan Light Sources
    this.lightSources.push(
      { x: 20 * 32, y: 14 * 32, radius: 100, color: 0x34d399, intensity: 0.55, flicker: false },
      { x: 32 * 32, y: 8 * 32, radius: 115, color: 0x10b981, intensity: 0.5, flicker: true }
    );

    // Return Exit
    this.registerInteractive(2 * 32, 12 * 32, 60, '[E] Return to Homestead ←', () => {
      this.switchZone('homestead');
    });
  }

  buildWestRoadProps() {
    const mapWidth = 40;
    // Central cobblestone highway spanning full width with feathered grass fringe
    const roadTex = this.textures.exists('tile_cobblestone') ? 'tile_cobblestone' : 'tile_path';
    for (let x = 0; x < mapWidth; x += 1) {
      this.add.image(x * 32 + 16, 13 * 32 + 16, roadTex).setDepth(2);
      this.add.image(x * 32 + 16, 14 * 32 + 16, roadTex).setDepth(2);
      this.add.image(x * 32 + 16, 15 * 32 + 16, roadTex).setDepth(2);
    }
    for (let x = 0; x < mapWidth; x += 2) {
      const rTop = this.add.image(x * 32 + 32, 13 * 32 + 8, 'prop_road_cobble_h');
      rTop.setDepth(3);
      const rBtm = this.add.image(x * 32 + 32, 15 * 32 + 24, 'prop_road_cobble_h');
      rBtm.setDepth(3);
    }

    // Natural Country Stream & Sturdy Wooden Highway Bridge
    for (let sy = 2; sy < 28; sy += 1) {
      if (sy < 13 || sy > 15) {
        this.add.image(24 * 32 + 16, sy * 32 + 16, 'tile_water');
        this.add.image(25 * 32 + 16, sy * 32 + 16, 'tile_water');
      }
    }

    // Wooden Bridge Decking Crossing Highway
    for (let by = 13; by <= 15; by += 1) {
      this.add.image(24 * 32 + 16, by * 32 + 16, 'tile_path');
      this.add.image(25 * 32 + 16, by * 32 + 16, 'tile_path');
    }

    // Bridge Guard Rails flanking North and South of the Road
    for (let bx = 23; bx <= 26; bx += 1) {
      const gRailN = this.obstacles.create(bx * 32 + 16, 12 * 32 + 16, 'prop_fence_h');
      gRailN.setDepth(11);
      gRailN.setSize(32, 16);
      const gRailS = this.obstacles.create(bx * 32 + 16, 16 * 32 + 16, 'prop_fence_h');
      gRailS.setDepth(11);
      gRailS.setSize(32, 16);
    }

    // Water Ripple FX North & South of Bridge
    const streamRippleN = this.add.image(24 * 32 + 16, 10 * 32 + 16, 'fx_ripple');
    streamRippleN.setDepth(6);
    streamRippleN.setAlpha(0.65);
    this.tweens.add({
      targets: streamRippleN,
      scaleX: 1.25,
      scaleY: 1.25,
      alpha: 0.3,
      duration: 1400,
      yoyo: true,
      repeat: -1,
    });

    const streamFish = this.add.image(24 * 32 + 16, 11 * 32 + 16, 'prop_fishing_spot');
    streamFish.setDepth(7);
    this.registerInteractive(24 * 32 + 16, 11 * 32 + 16, 52, '[E] Cast Fishing Line into Stream 🎣', () => {
      audioManager.synthSplash();
      gameEventBridge.emit('OPEN_IN_GAME_FISHING');
    });

    // Countryside Foliage, Wildflowers & Granite Boulders
    const roadDetails = [
      { x: 10, y: 11, tex: 'prop_wildflowers' },
      { x: 14, y: 17, tex: 'prop_wild_mushrooms' },
      { x: 28, y: 11, tex: 'prop_granite_boulder' },
      { x: 32, y: 17, tex: 'prop_tree_log' },
      { x: 18, y: 18, tex: 'prop_wildflowers' },
      { x: 7, y: 17, tex: 'prop_tree_stump' },
    ];
    roadDetails.forEach((rd) => {
      if (this.textures.exists(rd.tex)) {
        const item = this.obstacles.create(rd.x * 32 + 16, rd.y * 32 + 16, rd.tex);
        item.setDepth(9);
        item.setSize(22, 18);
      }
    });

    // Northern tree barrier with natural depth (CraftPix Oak & Pine Trees)
    for (let x = 1; x < 39; x += 3) {
      if (x % 4 !== 0) {
        const tTex = x % 2 === 0 && this.textures.exists('prop_tree_pine')
          ? 'prop_tree_pine'
          : (this.textures.exists('prop_tree_oak') ? 'prop_tree_oak' : 'prop_tree');
        const t = this.add.image(x * 32, 4 * 32, tTex);
        if (tTex.startsWith('prop_tree_')) t.setScale(0.5);
        t.setDepth(10);
        const col = this.obstacles.create(x * 32, 4 * 32 + 14, 'col_invisible');
        col.setSize(22, 16);
        col.setVisible(false);
      }
    }

    // Southern tree barrier with natural depth
    for (let x = 1; x < 39; x += 3) {
      if (x % 5 !== 0) {
        const tTex = x % 3 === 0 && this.textures.exists('prop_tree_pine')
          ? 'prop_tree_pine'
          : (this.textures.exists('prop_tree_oak') ? 'prop_tree_oak' : 'prop_tree');
        const t = this.add.image(x * 32, 25 * 32, tTex);
        if (tTex.startsWith('prop_tree_')) t.setScale(0.5);
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

    // Roadside Street Lantern at Milestone
    const roadLantern = this.add.image(20 * 32, 9 * 32 + 16, 'prop_street_lantern');
    roadLantern.setDepth(12);
    this.lightSources.push({
      x: 20 * 32,
      y: 9 * 32 + 16,
      radius: 85,
      color: 0xfbbf24,
      intensity: 0.45,
      flicker: false,
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

    // Roadside Monsters & Hunt Beasts
    this.spawnEnemy('slime_forest', 12 * 32, 9 * 32);
    this.spawnEnemy('boar_bristleback', 16 * 32, 20 * 32);
    this.spawnEnemy('wolf_shadow', 28 * 32, 20 * 32);
    this.spawnEnemy('boar_bristleback', 32 * 32, 8 * 32);
    this.spawnEnemy('orc_marauder', 18 * 32, 22 * 32);
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

    // City Perimeter Wall (North Border)
    for (let wx = 0; wx < 40; wx += 1) {
      const wall = this.obstacles.create(wx * 32 + 16, 16, 'tile_indoor_wall');
      wall.setDepth(16);
      wall.setSize(32, 32);
    }

    // 1. CENTER PLAZA: Town Fountain & Notice Board
    // Decorative Flagstone Plaza surrounding fountain
    for (let px = 17; px <= 23; px += 1) {
      for (let py = 12; py <= 17; py += 1) {
        this.add.image(px * 32 + 16, py * 32 + 16, 'tile_cobblestone').setDepth(3);
      }
    }

    const fountain = this.obstacles.create(20 * 32, 14 * 32 + 16, 'prop_town_fountain');
    fountain.setDepth(14);
    fountain.setSize(44, 40);
    this.registerInteractive(20 * 32, 14 * 32 + 16, 56, '[E] Toss Lucky Coin into Fountain ✨', () => {
      audioManager.play('coin');
      this.showFloatingText(20 * 32, 14 * 32 - 15, 'Fortune Smiles Upon You! (+1 Renown)', '#fde047');
      gameEventBridge.emit(gameEvents.PROP_INTERACT, { propId: 'prop_town_fountain' });
    });

    // Town Plaza Flowerbeds
    const fb1 = this.add.image(18 * 32, 14 * 32 + 16, 'prop_flowerbed');
    fb1.setDepth(15);
    const fb2 = this.add.image(22 * 32, 14 * 32 + 16, 'prop_flowerbed');
    fb2.setDepth(15);
    const fb3 = this.add.image(11 * 32, 9 * 32, 'prop_flowerbed');
    fb3.setDepth(13);

    // Town Fountain Fishing Spot
    const fountainFish = this.add.image(20 * 32, 16 * 32, 'prop_fishing_spot');
    fountainFish.setDepth(15);
    this.registerInteractive(20 * 32, 16 * 32, 50, '[E] Fish in Sunforge Fountain 🎣', () => {
      audioManager.synthSplash();
      gameEventBridge.emit('OPEN_IN_GAME_FISHING');
    });

    // Street Lanterns illuminating Sunforge Plaza Avenues
    const plazaLanterns = [
      { x: 17 * 32, y: 13 * 32 },
      { x: 23 * 32, y: 13 * 32 },
      { x: 17 * 32, y: 16 * 32 + 16 },
      { x: 23 * 32, y: 16 * 32 + 16 },
    ];
    plazaLanterns.forEach((pl) => {
      const lant = this.add.image(pl.x, pl.y, 'prop_street_lantern');
      lant.setDepth(15);
      this.lightSources.push({
        x: pl.x,
        y: pl.y,
        radius: 85,
        color: 0xfbbf24,
        intensity: 0.45,
        flicker: false,
      });
    });

    const noticeBoard = this.add.image(16 * 32, 12 * 32, 'prop_notice_board');
    noticeBoard.setDepth(14);
    this.registerInteractive(16 * 32, 12 * 32, 50, '[E] Read Town Square Notice Board 📜', () => {
      audioManager.play('tap');
      this.showFloatingText(16 * 32, 12 * 32 - 20, "Notice: Adventurers' Guild awarding bounties at NW Hall!", '#fef08a');
      gameEventBridge.emit(gameEvents.PROP_INTERACT, { propId: 'prop_notice_board' });
    });

    // 2. ADVENTURERS' GUILD (North-West Quarter)
    const ghTex = this.textures.exists('prop_village_house2') ? 'prop_village_house2' : 'prop_house';
    const guildhall = this.add.image(10 * 32, 5 * 32, ghTex);
    guildhall.setDepth(10);
    const guildCol = this.obstacles.create(10 * 32, 5 * 32 + 10, 'col_invisible');
    guildCol.setSize(75, 36);
    guildCol.setVisible(false);

    // Wall Torch on Guildhall Entrance
    const guildTorch = this.add.image(10 * 32, 7 * 32, 'prop_torch');
    guildTorch.setDepth(13);
    this.lightSources.push({
      x: 10 * 32,
      y: 7 * 32,
      radius: 75,
      color: 0xf97316,
      intensity: 0.45,
      flicker: true,
    });

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

    // 3. IRON ANVIL BLACKSMITH (North-East Quarter - CraftPix Artisan Workshop)
    const forgeTex = this.textures.exists('prop_artisan_forge') ? 'prop_artisan_forge' : 'prop_forge_furnace';
    const forgeKiln = this.obstacles.create(29 * 32, 6 * 32, forgeTex);
    forgeKiln.setDepth(12);
    forgeKiln.setSize(44, 38);
    this.lightSources.push({
      x: 29 * 32,
      y: 6 * 32,
      radius: 95,
      color: 0xf97316,
      intensity: 0.5,
      flicker: true,
    });

    const anvil = this.obstacles.create(27 * 32, 8 * 32, 'prop_anvil');
    anvil.setDepth(12);
    anvil.setSize(28, 24);

    // Master Blacksmith Elric NPC
    if (this.textures.exists('npc_blacksmith')) {
      const blacksmith = this.obstacles.create(27 * 32, 7 * 32, 'npc_blacksmith');
      blacksmith.setDepth(13);
      blacksmith.setSize(28, 36);
    }

    this.registerInteractive(27 * 32, 8 * 32, 54, '[E] Speak with Master Blacksmith Elric (Forge & Craft) ⚒️', () => {
      audioManager.play('anvil');
      gameEventBridge.emit('OPEN_IN_GAME_FORGE');
    });

    // 4. THE HEARTH & PINT INN (South-West Quarter)
    const innTex = this.textures.exists('prop_village_house3') ? 'prop_village_house3' : 'prop_house';
    const innBuilding = this.add.image(10 * 32, 20 * 32, innTex);
    innBuilding.setDepth(10);
    const innCol = this.obstacles.create(10 * 32, 20 * 32 + 10, 'col_invisible');
    innCol.setSize(70, 34);
    innCol.setVisible(false);

    const innBed = this.obstacles.create(10 * 32, 23 * 32, 'prop_inn_bed');
    innBed.setDepth(12);
    innBed.setSize(28, 26);
    this.registerInteractive(10 * 32, 23 * 32, 52, '[E] Rest in Cozy Bed (Restore Full Health) 🛏️', () => {
      this.restAtInn();
    });

    // 5. SUNFORGE MARKET BAZAAR (South-East Quarter)
    const storeTex = this.textures.exists('prop_village_house1') ? 'prop_village_house1' : 'prop_house';
    const generalStore = this.add.image(28 * 32, 20 * 32, storeTex);
    generalStore.setDepth(10);

    const marketStand = this.obstacles.create(26 * 32, 22 * 32, 'prop_market_stand');
    marketStand.setDepth(12);
    marketStand.setSize(44, 26);

    // Silas's Merchant Coin Vault Chest
    if (this.textures.exists('prop_chest_gold')) {
      const mChest = this.add.image(28 * 32, 22 * 32, 'prop_chest_gold');
      mChest.setDepth(12);
    }

    // Merchant Silas NPC
    if (this.textures.exists('npc_merchant')) {
      const merchant = this.obstacles.create(24 * 32, 22 * 32, 'npc_merchant');
      merchant.setDepth(13);
      merchant.setSize(24, 28);
    }

    this.registerInteractive(26 * 32, 22 * 32, 54, '[E] Trade with Merchant Silas (Bazaar & Seeds) 🪙', () => {
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

    if (sprite.isBoss) {
      const barW = 46;
      const barH = 5;
      const barX = sprite.x - barW / 2;
      const barY = sprite.y - 28;

      // Dark background & Gold frame
      sprite.hpBar.fillStyle(0x000000, 0.85);
      sprite.hpBar.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
      sprite.hpBar.lineStyle(1, 0xfbbf24, 1);
      sprite.hpBar.strokeRect(barX - 1, barY - 1, barW + 2, barH + 2);

      const pct = Math.max(0, sprite.hp / sprite.maxHp);
      const fillColor = sprite.bossPhase === 3 ? 0xef4444 : sprite.bossPhase === 2 ? 0xf59e0b : 0x10b981;
      sprite.hpBar.fillStyle(fillColor, 1);
      sprite.hpBar.fillRect(barX, barY, barW * pct, barH);
      return;
    }

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

  // Spawns ambient farm animals (sheep, roosters) with wandering behavior and interactions
  spawnAmbientCreature(type, x, y) {
    const texKey = type === 'sheep' ? 'sheep_walk' : 'rooster_walk';
    const animKey = type === 'sheep' ? 'anim_sheep_walk' : 'anim_rooster_walk';
    if (!this.textures.exists(texKey)) return null;

    const sprite = this.physics.add.sprite(x, y, texKey, 0);
    sprite.setDepth(14);
    sprite.setSize(20, 16);
    sprite.setCollideWorldBounds(true);
    if (this.anims.exists(animKey)) {
      sprite.play(animKey);
    }

    // Peaceful gentle roaming loop
    this.time.addEvent({
      delay: Phaser.Math.Between(3500, 7500),
      loop: true,
      callback: () => {
        if (!sprite || !sprite.active) return;
        const angle = Phaser.Math.Between(0, 360);
        const rad = Phaser.Math.DegToRad(angle);
        const speed = type === 'sheep' ? 14 : 22;
        sprite.setVelocity(Math.cos(rad) * speed, Math.sin(rad) * speed);
        this.time.delayedCall(Phaser.Math.Between(800, 1600), () => {
          if (sprite && sprite.active && sprite.body) sprite.setVelocity(0, 0);
        });
      },
    });

    if (type === 'sheep') {
      this.registerInteractive(x, y, 48, '[E] Shear Fluffy Sheep (Gather Wool) 🐑', () => {
        audioManager.play('harvest');
        this.showFloatingText(sprite.x, sprite.y - 18, '+1 Wool Bundle! (Baaa~)', '#fef08a');
        gameEventBridge.emit('LOOT_ACQUIRED', { itemId: 'wool', amount: 1 });
        gameEventBridge.emit(gameEvents.PROP_INTERACT, { propId: 'prop_sheep' });
      });
    } else {
      this.registerInteractive(x, y, 48, '[E] Gather Fresh Farm Egg 🐓', () => {
        audioManager.play('tap');
        this.showFloatingText(sprite.x, sprite.y - 18, '+1 Fresh Farm Egg!', '#fde047');
        gameEventBridge.emit('LOOT_ACQUIRED', { itemId: 'egg', amount: 1 });
        gameEventBridge.emit(gameEvents.PROP_INTERACT, { propId: 'prop_rooster' });
      });
    }

    return sprite;
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
          const statsWithFalcon = {
            ...(this.profile?.stats || {}),
            critBonus: this.equippedPet === 'falcon' ? 0.10 : 0,
          };
          const dmgResult = computePlayerAttackDamage(statsWithFalcon, weapon.id);
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

    // Boss Phase Transitions
    if (enemy.isBoss && enemy.hp > 0) {
      const pct = enemy.hp / enemy.maxHp;
      if (enemy.bossPhase === 1 && pct <= 0.6) {
        enemy.bossPhase = 2;
        audioManager.synthBossRoar();
        this.cameras.main.shake(250, 0.012);
        this.showFloatingText(enemy.x, enemy.y - 32, '⚡ PHASE 2: Minions Rise!', '#f59e0b');

        // Spawn 2 Minions
        const minionType = enemy.monsterDef?.id === 'boss_slime_king' ? 'slime_forest' : 'skeleton_cavern';
        this.spawnEnemy(minionType, enemy.x - 36, enemy.y + 20);
        this.spawnEnemy(minionType, enemy.x + 36, enemy.y + 20);
      } else if (enemy.bossPhase === 2 && pct <= 0.3) {
        enemy.bossPhase = 3;
        audioManager.synthBossRoar();
        this.cameras.main.shake(350, 0.018);
        enemy.setTint(0xff4444);
        this.showFloatingText(enemy.x, enemy.y - 32, '💀 PHASE 3: ENRAGED SLAM!', '#dc2626');
      }
    }

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
      enemyType: enemy.monsterDef.id,
      loot,
    });

    this.showFloatingText(enemy.x, enemy.y - 15, `Defeated ${enemy.monsterDef.name}!`, '#86efac');
    this.showFloatingText(enemy.x, enemy.y - 30, `+${loot.gold} Gold · +${loot.xp} XP`, '#fde047');

    if (this.currentZone === 'tutorial_island') {
      gameEventBridge.emit('TUTORIAL_STEP_ADVANCE', { step: 4 });
    }

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
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    audioManager.play('tap');
    gameEventBridge.emit(gameEvents.ZONE_CHANGED, { zone: newZone });
    this.cameras.main.fade(200, 0, 0, 0, false, (camera, progress) => {
      if (progress === 1) {
        this.destroy();
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
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    // AZERTY layout support: Z = Up, Q = Left
    this.keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

    this.keyOne = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.keyNumpadOne = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ONE);
    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Pointer click: click-to-move, attack enemy, or pet companion
    this.input.on('pointerdown', (pointer) => {
      // Ensure canvas has browser focus for immediate keyboard input
      if (this.game && this.game.canvas && typeof this.game.canvas.focus === 'function') {
        this.game.canvas.focus();
      }

      // Convert screen pointer coordinates to world coordinates
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);

      // 1. Check if clicking on an active enemy within 36px to attack
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
      if (clickedEnemy) return;

      // 2. Check if clicking on an interactive prop (ore node, fishing spot, chest, forge, farm plot, NPC, exit)
      let clickedInteractive = false;
      if (this.interactiveObjects && this.player) {
        let targetObj = null;
        let minDist = Infinity;
        for (const obj of this.interactiveObjects) {
          const clickDist = Phaser.Math.Distance.Between(worldPoint.x, worldPoint.y, obj.x, obj.y);
          const effectiveRadius = Math.max(obj.radius || 48, 44);
          if (clickDist <= effectiveRadius && clickDist < minDist) {
            minDist = clickDist;
            targetObj = obj;
          }
        }

        if (targetObj) {
          clickedInteractive = true;
          const playerDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, targetObj.x, targetObj.y);
          // If already in interaction proximity, trigger action immediately!
          if (playerDist <= (targetObj.radius || 48) + 24) {
            if (targetObj.onTrigger) targetObj.onTrigger();
          } else {
            // Otherwise, walk toward the interactive prop
            this.moveTarget = { x: targetObj.x, y: targetObj.y };
          }
        }
      }
      if (clickedInteractive) return;

      // 3. Otherwise, smoothly set click-to-move destination!
      this.moveTarget = { x: worldPoint.x, y: worldPoint.y };
    });
  }

  setupBridge() {
    if (this.cleanupBridge) {
      this.cleanupBridge.forEach((cleanup) => cleanup());
      this.cleanupBridge = [];
    }
    this.cleanupBridge = [
      gameEventBridge.on(gameEvents.LOCK_CONTROLS, () => {
        this.controlsLocked = true;
      }),
      gameEventBridge.on(gameEvents.UNLOCK_CONTROLS, () => {
        this.controlsLocked = false;
      }),
      gameEventBridge.on('TRIGGER_ACTIVE_PROMPT', () => {
        if (this.activePrompt && this.activePrompt.onTrigger) {
          this.activePrompt.onTrigger();
        }
      }),
      gameEventBridge.on('PET_COMPANION', () => {
        this.petCompanion();
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
      gameEventBridge.on(gameEvents.EQUIP_PET, ({ petId }) => {
        this.equippedPet = petId;
        this.setupFollowerPet();
      }),
    ];
  }

  update(time, delta) {
    if (!this.player || this.controlsLocked) {
      if (this.player && this.player.body) {
        this.player.setVelocity(0, 0);
      }
      return;
    }

    // Update Day/Night, Weather & Dynamic Lighting Simulation
    this.updateEnvironmentSimulation(delta || 16.6);

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

    // Hotkey heal (quickslot 1 / numpad 1)
    if (
      (this.keyOne && Phaser.Input.Keyboard.JustDown(this.keyOne)) ||
      (this.keyNumpadOne && Phaser.Input.Keyboard.JustDown(this.keyNumpadOne))
    ) {
      gameEventBridge.emit(gameEvents.USE_HEALING_POTION);
    }

    // Movement calculation
    const isSprinting = this.shiftKey ? Boolean(this.shiftKey.isDown) : false;
    let speed = isSprinting ? (this.equippedPet === 'sheepdog' ? 240 : 210) : 135;
    if (this.isAttacking) {
      speed *= 0.25; // Controlled momentum during weapon swing commitment
    }

    let vx = 0;
    let vy = 0;

    // Support QWERTY (WASD), AZERTY (ZQSD), and Arrow keys
    const left = Boolean(
      (this.cursors && this.cursors.left && this.cursors.left.isDown) ||
      (this.keyA && this.keyA.isDown) ||
      (this.keyQ && this.keyQ.isDown)
    );
    const right = Boolean(
      (this.cursors && this.cursors.right && this.cursors.right.isDown) ||
      (this.keyD && this.keyD.isDown)
    );
    const up = Boolean(
      (this.cursors && this.cursors.up && this.cursors.up.isDown) ||
      (this.keyW && this.keyW.isDown) ||
      (this.keyZ && this.keyZ.isDown)
    );
    const down = Boolean(
      (this.cursors && this.cursors.down && this.cursors.down.isDown) ||
      (this.keyS && this.keyS.isDown)
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

    // Update Follower Pet movement & physics
    if (this.petSprite && this.petSprite.active) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.petSprite.x, this.petSprite.y);
      if (dist > 38) {
        const angle = Phaser.Math.Angle.Between(this.petSprite.x, this.petSprite.y, this.player.x, this.player.y);
        const petSpeed = isSprinting ? 225 : 140;
        this.petSprite.setVelocity(Math.cos(angle) * petSpeed, Math.sin(angle) * petSpeed);
        this.petSprite.setFlipX(this.player.x < this.petSprite.x);
      } else {
        this.petSprite.setVelocity(0, 0);
      }
    }

    // Passive Companion Perks (Wisp regeneration)
    if (this.equippedPet === 'wisp' && this.playerHp < this.playerMaxHp) {
      const now = Date.now();
      if (!this._lastWispRegen || now - this._lastWispRegen > 3000) {
        this._lastWispRegen = now;
        this.playerHp = Math.min(this.playerMaxHp, this.playerHp + 1);
        gameEventBridge.emit(gameEvents.COMBAT_PLAYER_HEAL, {
          hp: this.playerHp,
          maxHp: this.playerMaxHp,
          healed: 1,
        });
      }
    }

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

        // Boss Phase 3 Telegraphed Quake Slam
        if (enemy.isBoss && enemy.bossPhase === 3 && now >= (enemy.nextQuakeSlam || 0)) {
          enemy.nextQuakeSlam = now + 5500;
          this.triggerBossQuakeSlam(enemy);
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
    audioManager.stopRainAmbience();
    if (this.cleanupBridge) {
      this.cleanupBridge.forEach((cleanup) => cleanup());
      this.cleanupBridge = [];
    }
    if (this.enemies) {
      this.enemies.getChildren().forEach((enemy) => {
        if (enemy.hpBar) enemy.hpBar.destroy();
      });
    }
    if (this.ambientDarkGraphics) this.ambientDarkGraphics.destroy();
    if (this.lightingAddGraphics) this.lightingAddGraphics.destroy();
    if (this.rainEmitter) this.rainEmitter.destroy();
  }
}
