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

    // Initialize player combat stats from profile
    const lvl = this.profile?.stats?.level || 1;
    this.playerMaxHp = 100 + (lvl - 1) * 15;
    this.playerHp = data.hp !== undefined ? data.hp : this.playerMaxHp;
    this.playerDefense = Math.round((this.profile?.stats?.power || 120) * 0.05);
  }

  create() {
    // 1. Register Procedural World Textures
    registerWorldTextures(this);

    // 2. Setup Player Dynamic Layered Spritesheet
    this.setupPlayerTexture();

    // 3. Build Zone Environment & Props
    this.buildCurrentZone();

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
    }

    // Groups
    this.obstacles = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();

    if (this.currentZone === 'homestead') {
      this.buildHomesteadProps();
    } else if (this.currentZone === 'mine') {
      this.buildMineProps();
    } else if (this.currentZone === 'forest') {
      this.buildForestProps();
    } else if (this.currentZone === 'village') {
      this.buildVillageProps();
    }

    // Player Spawn
    const spawnX = this.currentZone === 'homestead' ? 15 * 32 : 10 * 32;
    const spawnY = this.currentZone === 'homestead' ? 14 * 32 : 12 * 32;

    this.player = this.physics.add.sprite(spawnX, spawnY, 'player_spritesheet', 0);
    this.player.setCollideWorldBounds(true);
    this.player.setSize(18, 14);
    this.player.setOffset(7, 18);
    this.player.setDepth(20);

    // Collisions
    this.physics.add.collider(this.player, this.obstacles);
    this.physics.add.collider(this.enemies, this.obstacles);
    this.physics.add.collider(this.player, this.enemies);

    // Camera follow
    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.5);
  }

  buildHomesteadProps() {
    // 1. Manor House
    const house = this.add.image(14 * 32 + 16, 4 * 32, 'prop_house');
    house.setDepth(15);
    const houseCollider = this.obstacles.create(14 * 32 + 16, 4 * 32 + 10, null);
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
        const col = this.obstacles.create(x * 32, 2 * 32 + 14, null);
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

    // Exits
    this.registerInteractive(37 * 32, 12 * 32, 60, '[E] Enter Enchanted Forest →', () => {
      this.switchZone('forest');
    });
    this.registerInteractive(34 * 32, 4 * 32, 60, '[E] Delve into Deepforge Mine ⛏️', () => {
      this.switchZone('mine');
    });
    this.registerInteractive(15 * 32, 28 * 32, 60, '[E] Travel to Valorian Bazaar 🪙', () => {
      this.switchZone('village');
    });
  }

  buildMineProps() {
    // Perimeter Cave Colliders
    for (let x = 0; x < 40; x += 1) {
      const topCol = this.obstacles.create(x * 32, 16, null);
      topCol.setSize(32, 32);
      topCol.setVisible(false);
      const botCol = this.obstacles.create(x * 32, 29 * 32, null);
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
    const shrine = this.obstacles.create(20 * 32, 14 * 32, 'prop_workbench');
    shrine.setDepth(10);
    shrine.setSize(26, 20);
    this.registerInteractive(20 * 32, 14 * 32, 60, '[E] Commune with Sylvan Shrine ✨', () => {
      audioManager.play('levelup');
      this.showFloatingText(20 * 32, 14 * 32 - 20, 'Forest Blessing Granted!', '#a7f3d0');
    });

    // Trees
    for (let i = 0; i < 22; i += 1) {
      const tx = ((i * 7) % 36 + 2) * 32;
      const ty = (((i * 11) % 24) + 3) * 32;
      if (Math.abs(tx - 20 * 32) > 64 || Math.abs(ty - 14 * 32) > 64) {
        const tree = this.add.image(tx, ty, 'prop_tree');
        tree.setDepth(10);
        const col = this.obstacles.create(tx, ty + 14, null);
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

  buildVillageProps() {
    const stalls = [
      { name: "Old Barnaby's Seeds", x: 10, y: 10, action: 'seed_cart' },
      { name: "Torvald's Ore Exchange", x: 26, y: 10, action: 'ore_exchange' },
      { name: "Linnea's Produce Stand", x: 10, y: 20, action: 'produce_stand' },
      { name: "Garrison's Armory", x: 26, y: 20, action: 'armory' },
    ];

    stalls.forEach((stall) => {
      const sx = stall.x * 32;
      const sy = stall.y * 32;
      const b = this.add.image(sx, sy, 'prop_house');
      b.setScale(0.7);
      b.setDepth(10);
      const col = this.obstacles.create(sx, sy + 5, null);
      col.setSize(50, 24);
      col.setVisible(false);

      this.registerInteractive(sx, sy, 60, `[E] Trade at ${stall.name} 🪙`, () => {
        audioManager.play('coin');
        gameEventBridge.emit(gameEvents.NPC_TALK, { stall });
      });
    });

    // Return Exit
    this.registerInteractive(20 * 32, 2 * 32, 60, '[E] Return to Homestead Manor ↑', () => {
      this.switchZone('homestead');
    });
  }

  registerInteractive(x, y, radius, prompt, onTrigger) {
    this.interactiveObjects.push({ x, y, radius, prompt, onTrigger });
  }

  // Spawns a physical enemy sprite with domain AI state
  spawnEnemy(typeId, x, y) {
    const def = MONSTER_TYPES[typeId];
    if (!def || !this.enemies) return null;

    const sprite = this.enemies.create(x, y, def.texture);
    sprite.setCollideWorldBounds(true);
    sprite.setSize(22, 20);
    sprite.setOffset(5, 10);
    sprite.setDepth(18);

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

  spawnHitSparks(x, y) {
    const emitter = this.add.particles(x, y, 'world_tiles', {
      speed: { min: 50, max: 130 },
      scale: { start: 0.18, end: 0 },
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

  switchZone(newZone) {
    audioManager.play('tap');
    this.cameras.main.fade(200, 0, 0, 0, false, (camera, progress) => {
      if (progress === 1) {
        this.scene.restart({
          customization: this.customization,
          profile: this.profile,
          zone: newZone,
          hp: this.playerHp,
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
    ];
  }

  update() {
    if (!this.player || this.controlsLocked) {
      if (this.player && this.player.body) {
        this.player.setVelocity(0, 0);
      }
      return;
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
