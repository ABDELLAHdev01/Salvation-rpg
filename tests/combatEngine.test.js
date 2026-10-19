import { describe, it, expect } from 'vitest';
import {
  WEAPON_TYPES,
  MONSTER_TYPES,
  ENEMY_STATES,
  computePlayerAttackDamage,
  applyDefenseMitigation,
  generateMonsterLoot,
  isTargetInAttackArc,
  updateEnemyAI,
} from '../src/core/combat/combatEngine';

describe('2D Action Combat Domain Engine', () => {
  describe('Weapon Catalogue & Balance', () => {
    it('defines standard fantasy weapons with full combat tuning', () => {
      const weaponKeys = ['iron_pickaxe', 'forged_scythe', 'steel_broadsword', 'oak_staff'];
      weaponKeys.forEach((key) => {
        const weapon = WEAPON_TYPES[key];
        expect(weapon).toBeDefined();
        expect(weapon.id).toBe(key);
        expect(weapon.baseDamage).toBeGreaterThan(0);
        expect(weapon.range).toBeGreaterThanOrEqual(40);
        expect(weapon.cooldownMs).toBeGreaterThanOrEqual(300);
        expect(weapon.swingArcDeg).toBeGreaterThanOrEqual(70);
        expect(weapon.knockback).toBeGreaterThan(0);
        expect(weapon.critChance).toBeGreaterThan(0);
        expect(['physical', 'magic']).toContain(weapon.type);
      });
    });

    it('ranks weapons logically in balance (broadsword highest physical damage)', () => {
      expect(WEAPON_TYPES.steel_broadsword.baseDamage).toBeGreaterThan(WEAPON_TYPES.iron_pickaxe.baseDamage);
      expect(WEAPON_TYPES.forged_scythe.swingArcDeg).toBeGreaterThan(WEAPON_TYPES.oak_staff.swingArcDeg);
    });
  });

  describe('Monster Archetypes & Attributes', () => {
    it('defines distinct forest and cave monster types', () => {
      const monsterKeys = ['slime_forest', 'wolf_shadow', 'skeleton_cavern', 'goblin_raider'];
      monsterKeys.forEach((key) => {
        const monster = MONSTER_TYPES[key];
        expect(monster).toBeDefined();
        expect(monster.maxHp).toBeGreaterThan(0);
        expect(monster.speed).toBeGreaterThan(0);
        expect(monster.damage).toBeGreaterThan(0);
        expect(monster.defense).toBeGreaterThanOrEqual(0);
        expect(monster.aggroRange).toBeGreaterThan(monster.attackRange);
        expect(monster.attackCooldownMs).toBeGreaterThan(500);
        expect(monster.xpReward).toBeGreaterThan(0);
        expect(monster.goldReward.max).toBeGreaterThanOrEqual(monster.goldReward.min);
        expect(Array.isArray(monster.lootTable)).toBe(true);
      });
    });
  });

  describe('Player Attack Damage Formula', () => {
    it('computes baseline damage with power multiplier and random variance', () => {
      // Deterministic randomFn: variance 0 (randomFn returns 0.5), no crit (crit check fails)
      const deterministicRandom = () => 0.5;
      const result = computePlayerAttackDamage({ power: 100 }, 'steel_broadsword', deterministicRandom);

      expect(result.weaponName).toBe(WEAPON_TYPES.steel_broadsword.name);
      expect(result.damage).toBe(22); // 22 baseDamage * 1.0 * (1 + 0)
      expect(result.isCrit).toBe(false);
      expect(result.knockback).toBe(100);
    });

    it('scales damage upward with higher character power', () => {
      const deterministicRandom = () => 0.5;
      const lowPower = computePlayerAttackDamage({ power: 100 }, 'steel_broadsword', deterministicRandom);
      const highPower = computePlayerAttackDamage({ power: 200 }, 'steel_broadsword', deterministicRandom);

      // Power 200: multiplier = 1 + (100 * 0.004) = 1.4x => 22 * 1.4 = 30.8 -> 31
      expect(highPower.damage).toBeGreaterThan(lowPower.damage);
      expect(highPower.damage).toBe(31);
    });

    it('applies critical strike multiplier (1.75x) when crit roll succeeds', () => {
      // randomFn = 0.01 guarantees crit roll succeeds (0.01 < critChance)
      const critRandom = () => 0.01;
      const result = computePlayerAttackDamage({ power: 100 }, 'steel_broadsword', critRandom);

      expect(result.isCrit).toBe(true);
      expect(result.damage).toBeGreaterThan(25);
    });

    it('falls back to default pickaxe when given invalid weapon id', () => {
      const result = computePlayerAttackDamage({ power: 100 }, 'mythical_unknown_laser', () => 0.5);
      expect(result.weaponName).toBe(WEAPON_TYPES.iron_pickaxe.name);
      expect(result.damage).toBe(14);
    });
  });

  describe('Defense Mitigation Formula', () => {
    it('applies diminishing returns armor formula correctly', () => {
      // 0 defense = full damage
      expect(applyDefenseMitigation(50, 0)).toBe(50);

      // 100 defense = 50 * (100 / 200) = 25 (50% reduction)
      expect(applyDefenseMitigation(50, 100)).toBe(25);

      // Higher defense continues diminishing returns
      expect(applyDefenseMitigation(100, 300)).toBe(25); // 100 * 100 / 400 = 25
    });

    it('guards against negative defense and always deals at least 1 damage', () => {
      expect(applyDefenseMitigation(10, -50)).toBe(10);
      expect(applyDefenseMitigation(0, 50)).toBe(1);
    });
  });

  describe('Monster Loot Resolution', () => {
    it('returns empty loot when monster definition is missing', () => {
      const emptyLoot = generateMonsterLoot(null);
      expect(emptyLoot).toEqual({ gold: 0, items: [] });
    });

    it('resolves deterministic drops based on roll chances', () => {
      const mockMonster = {
        goldReward: { min: 10, max: 10 },
        xpReward: 30,
        lootTable: [
          { itemId: 'slime-gel', chance: 0.8, amount: 2 },
          { itemId: 'rare-gem', chance: 0.1, amount: 1 },
        ],
      };

      // Roll of 0.05 drops both
      const luckyRoll = generateMonsterLoot(mockMonster, () => 0.05);
      expect(luckyRoll.gold).toBe(10);
      expect(luckyRoll.xp).toBe(30);
      expect(luckyRoll.items).toHaveLength(2);
      expect(luckyRoll.items[0]).toEqual({ id: 'slime-gel', amount: 2 });
      expect(luckyRoll.items[1]).toEqual({ id: 'rare-gem', amount: 1 });

      // Roll of 0.5 drops only slime-gel (0.5 <= 0.8, but > 0.1)
      const normalRoll = generateMonsterLoot(mockMonster, () => 0.5);
      expect(normalRoll.items).toHaveLength(1);
      expect(normalRoll.items[0].id).toBe('slime-gel');

      // Roll of 0.95 drops nothing from lootTable
      const unluckyRoll = generateMonsterLoot(mockMonster, () => 0.95);
      expect(unluckyRoll.items).toHaveLength(0);
    });
  });

  describe('Directional Attack Arc Hit Detection', () => {
    it('detects hits when target is within distance and facing arc', () => {
      // Player at (100, 100) facing east (0 deg), target at (130, 100), range 50, arc 100 deg
      const inFrontEast = isTargetInAttackArc(100, 100, 'east', 130, 100, 50, 100);
      expect(inFrontEast).toBe(true);

      // Facing south (90 deg), target at (100, 130)
      const inFrontSouth = isTargetInAttackArc(100, 100, 'south', 100, 130, 50, 100);
      expect(inFrontSouth).toBe(true);

      // Facing west (180 deg), target at (70, 100)
      const inFrontWest = isTargetInAttackArc(100, 100, 'west', 70, 100, 50, 100);
      expect(inFrontWest).toBe(true);

      // Facing north (-90 deg), target at (100, 70)
      const inFrontNorth = isTargetInAttackArc(100, 100, 'north', 100, 70, 50, 100);
      expect(inFrontNorth).toBe(true);
    });

    it('rejects targets that are behind the player', () => {
      // Player facing east, target is behind (to the west at 70, 100)
      const behindEast = isTargetInAttackArc(100, 100, 'east', 70, 100, 50, 100);
      expect(behindEast).toBe(false);

      // Player facing north, target is south at (100, 130)
      const behindNorth = isTargetInAttackArc(100, 100, 'north', 100, 130, 50, 100);
      expect(behindNorth).toBe(false);
    });

    it('rejects targets that are out of melee range', () => {
      // Target is directly in front, but distance is 80 (range is 50)
      const outOfRange = isTargetInAttackArc(100, 100, 'east', 180, 100, 50, 100);
      expect(outOfRange).toBe(false);
    });

    it('respects tight swing arcs', () => {
      // 45 degrees diagonal off-center: (100, 100) -> (125, 125) has targetAngle = 45 deg
      // Facing east (0 deg): diff is 45 deg.
      // With arcDeg = 100 (half-arc = 50 deg), 45 <= 50 -> hit!
      expect(isTargetInAttackArc(100, 100, 'east', 125, 125, 50, 100)).toBe(true);

      // With narrow arcDeg = 60 (half-arc = 30 deg), 45 > 30 -> miss!
      expect(isTargetInAttackArc(100, 100, 'east', 125, 125, 50, 60)).toBe(false);
    });
  });

  describe('Enemy AI State Machine Updates', () => {
    const baseEnemy = {
      x: 100,
      y: 100,
      hp: 50,
      speed: 60,
      aggroRange: 150,
      attackRange: 30,
      attackCooldownMs: 1000,
      lastAttackTime: 0,
      staggerUntil: 0,
    };

    it('transitions to DEAD state when hp is zero or negative', () => {
      const deadEnemy = updateEnemyAI({ ...baseEnemy, hp: 0 }, { x: 100, y: 100 }, 16, 1000);
      expect(deadEnemy.state).toBe(ENEMY_STATES.DEAD);
    });

    it('remains in STAGGER state if stagger timer is active', () => {
      const staggered = updateEnemyAI({ ...baseEnemy, staggerUntil: 2500 }, { x: 110, y: 100 }, 16, 2000);
      expect(staggered.state).toBe(ENEMY_STATES.STAGGER);
    });

    it('enters IDLE state when player is beyond aggro range', () => {
      const idle = updateEnemyAI(baseEnemy, { x: 400, y: 400 }, 16, 1000);
      expect(idle.state).toBe(ENEMY_STATES.IDLE);
      expect(idle.vx).toBe(0);
      expect(idle.vy).toBe(0);
      expect(idle.shouldStrike).toBe(false);
    });

    it('enters CHASE state and computes velocity vector toward player when inside aggro range', () => {
      // Player is at (150, 100) -> distance is 50, within aggroRange (150) but > attackRange (30)
      const chase = updateEnemyAI(baseEnemy, { x: 150, y: 100 }, 16, 1000);
      expect(chase.state).toBe(ENEMY_STATES.CHASE);
      expect(chase.vx).toBe(baseEnemy.speed); // Vector pointing right (+x)
      expect(chase.vy).toBe(0);
      expect(chase.shouldStrike).toBe(false);
    });

    it('enters ATTACK state and triggers strike when within attack range and cooldown ready', () => {
      // Distance is 20, attackRange is 30
      const attackReady = updateEnemyAI(baseEnemy, { x: 120, y: 100 }, 16, 2000);
      expect(attackReady.state).toBe(ENEMY_STATES.ATTACK);
      expect(attackReady.shouldStrike).toBe(true);
      expect(attackReady.lastAttackTime).toBe(2000);

      // Next tick 200ms later: cooldown (1000ms) has not elapsed
      const attackCooldown = updateEnemyAI(attackReady, { x: 120, y: 100 }, 16, 2200);
      expect(attackCooldown.state).toBe(ENEMY_STATES.ATTACK);
      expect(attackCooldown.shouldStrike).toBe(false);
    });
  });
});
