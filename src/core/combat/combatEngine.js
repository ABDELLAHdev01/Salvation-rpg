/**
 * Combat Simulation & Domain Engine
 * Pure deterministic combat math, enemy state machine logic, and loot resolution.
 * Decoupled from rendering for complete testability and future server authority.
 */

export const WEAPON_TYPES = {
  iron_pickaxe: {
    id: 'iron_pickaxe',
    name: 'Forged Iron Pickaxe',
    baseDamage: 14,
    range: 46,
    cooldownMs: 400,
    swingArcDeg: 90,
    knockback: 75,
    critChance: 0.08,
    type: 'physical',
  },
  forged_scythe: {
    id: 'forged_scythe',
    name: 'Farmer Harvest Scythe',
    baseDamage: 16,
    range: 52,
    cooldownMs: 450,
    swingArcDeg: 120,
    knockback: 85,
    critChance: 0.12,
    type: 'physical',
  },
  steel_broadsword: {
    id: 'steel_broadsword',
    name: 'Tempered Broadsword',
    baseDamage: 22,
    range: 48,
    cooldownMs: 350,
    swingArcDeg: 100,
    knockback: 100,
    critChance: 0.18,
    type: 'physical',
  },
  oak_staff: {
    id: 'oak_staff',
    name: 'Elder Oak Wand',
    baseDamage: 20,
    range: 56,
    cooldownMs: 480,
    swingArcDeg: 80,
    knockback: 60,
    critChance: 0.15,
    type: 'magic',
  },
};

export const MONSTER_TYPES = {
  slime_forest: {
    id: 'slime_forest',
    name: 'Emerald Slime',
    texture: 'enemy_slime',
    maxHp: 40,
    speed: 50,
    damage: 8,
    defense: 2,
    aggroRange: 150,
    attackRange: 32,
    attackCooldownMs: 1200,
    xpReward: 20,
    goldReward: { min: 4, max: 10 },
    lootTable: [
      { itemId: 'slime-gel', chance: 0.75, amount: 1 },
      { itemId: 'sunroot', chance: 0.35, amount: 1 },
    ],
  },
  wolf_shadow: {
    id: 'wolf_shadow',
    name: 'Shadowfang Stalker',
    texture: 'enemy_wolf',
    maxHp: 65,
    speed: 85,
    damage: 12,
    defense: 4,
    aggroRange: 190,
    attackRange: 36,
    attackCooldownMs: 950,
    xpReward: 35,
    goldReward: { min: 8, max: 18 },
    lootTable: [
      { itemId: 'wolf-pelt', chance: 0.70, amount: 1 },
      { itemId: 'mystery-geode', chance: 0.25, amount: 1 },
    ],
  },
  skeleton_cavern: {
    id: 'skeleton_cavern',
    name: 'Deepforge Skeleton',
    texture: 'enemy_skeleton',
    maxHp: 80,
    speed: 55,
    damage: 15,
    defense: 6,
    aggroRange: 170,
    attackRange: 36,
    attackCooldownMs: 1100,
    xpReward: 45,
    goldReward: { min: 12, max: 25 },
    lootTable: [
      { itemId: 'bone-shard', chance: 0.80, amount: 1 },
      { itemId: 'iron', chance: 0.50, amount: 2 },
    ],
  },
  goblin_raider: {
    id: 'goblin_raider',
    name: 'Wildlands Goblin Raider',
    texture: 'enemy_goblin',
    maxHp: 60,
    speed: 72,
    damage: 13,
    defense: 3,
    aggroRange: 180,
    attackRange: 34,
    attackCooldownMs: 850,
    xpReward: 38,
    goldReward: { min: 10, max: 22 },
    lootTable: [
      { itemId: 'copper', chance: 0.60, amount: 2 },
      { itemId: 'contract-sigil', chance: 0.20, amount: 1 },
    ],
  },
  boss_slime_king: {
    id: 'boss_slime_king',
    name: 'Colossal Slime Sovereign',
    texture: 'boss_slime_king',
    isBoss: true,
    maxHp: 420,
    speed: 40,
    damage: 28,
    defense: 8,
    aggroRange: 260,
    attackRange: 60,
    attackCooldownMs: 1600,
    xpReward: 250,
    goldReward: { min: 120, max: 200 },
    lootTable: [
      { itemId: 'slime-crown', chance: 1.0, amount: 1 },
      { itemId: 'mystery-geode', chance: 0.8, amount: 2 },
      { itemId: 'health-potion', chance: 1.0, amount: 3 },
    ],
  },
  boss_drakmor: {
    id: 'boss_drakmor',
    name: 'Drakmor Bone-Lord',
    texture: 'boss_drakmor',
    isBoss: true,
    maxHp: 580,
    speed: 48,
    damage: 34,
    defense: 12,
    aggroRange: 280,
    attackRange: 55,
    attackCooldownMs: 1400,
    xpReward: 350,
    goldReward: { min: 180, max: 300 },
    lootTable: [
      { itemId: 'drakmor-skull', chance: 1.0, amount: 1 },
      { itemId: 'gold-bar', chance: 0.9, amount: 2 },
      { itemId: 'steel_broadsword', chance: 0.5, amount: 1 },
    ],
  },
};

export const ENEMY_STATES = {
  IDLE: 'idle',
  PATROL: 'patrol',
  CHASE: 'chase',
  ATTACK: 'attack',
  STAGGER: 'stagger',
  DEAD: 'dead',
};

/**
 * Calculates raw and mitigated damage from player attack
 */
export function computePlayerAttackDamage(playerStats = {}, weaponId = 'iron_pickaxe', randomFn = Math.random) {
  const weapon = WEAPON_TYPES[weaponId] || WEAPON_TYPES.iron_pickaxe;
  const power = Number(playerStats.power || 100);

  // Power bonus factor: 100 power = 1.0x, 200 power = 1.4x
  const powerMultiplier = 1 + (power - 100) * 0.004;
  const baseHit = weapon.baseDamage * Math.max(0.5, powerMultiplier);

  // Variance: ±15%
  const variance = (randomFn() * 0.3) - 0.15;
  const isCrit = randomFn() < weapon.critChance;
  const critMultiplier = isCrit ? 1.75 : 1.0;

  const rawDamage = Math.max(1, Math.round(baseHit * (1 + variance) * critMultiplier));

  return {
    damage: rawDamage,
    isCrit,
    weaponName: weapon.name,
    knockback: weapon.knockback,
  };
}

/**
 * Calculates damage received by entity after defense reduction
 */
export function applyDefenseMitigation(rawDamage, defense = 0) {
  const safeDefense = Math.max(0, defense);
  // Diminishing returns defense curve: damage * 100 / (100 + def)
  const reductionFactor = 100 / (100 + safeDefense);
  const finalDamage = Math.max(1, Math.round(rawDamage * reductionFactor));
  return finalDamage;
}

/**
 * Determines loot dropped upon enemy defeat
 */
export function generateMonsterLoot(monsterDef, randomFn = Math.random) {
  if (!monsterDef) return { gold: 0, items: [] };

  const goldMin = monsterDef.goldReward?.min || 5;
  const goldMax = monsterDef.goldReward?.max || 10;
  const gold = Math.floor(randomFn() * (goldMax - goldMin + 1)) + goldMin;

  const items = [];
  (monsterDef.lootTable || []).forEach((entry) => {
    if (randomFn() <= entry.chance) {
      items.push({
        id: entry.itemId,
        amount: entry.amount || 1,
      });
    }
  });

  return { gold, items, xp: monsterDef.xpReward || 15 };
}

/**
 * Evaluates directional hit detection between player and enemy
 * Checks if target is within attack range and within the attack cone
 */
export function isTargetInAttackArc(px, py, facingDirection, tx, ty, range, arcDeg = 100) {
  const dx = tx - px;
  const dy = ty - py;
  const dist = Math.hypot(dx, dy);

  if (dist > range) return false;

  // Compute angle to target in degrees
  const targetAngle = (Math.atan2(dy, dx) * 180) / Math.PI;

  // Direction central angles: East = 0, South = 90, West = 180, North = -90
  const dirAngles = {
    east: 0,
    south: 90,
    west: 180,
    north: -90,
  };

  const centerAngle = dirAngles[facingDirection] ?? 90;
  let diff = Math.abs(targetAngle - centerAngle);
  if (diff > 180) diff = 360 - diff;

  return diff <= (arcDeg / 2);
}

/**
 * Pure state machine update step for an enemy AI entity
 */
export function updateEnemyAI(enemy, playerPos, deltaMs, now = Date.now()) {
  if (enemy.hp <= 0) {
    return { ...enemy, state: ENEMY_STATES.DEAD };
  }

  const dx = playerPos.x - enemy.x;
  const dy = playerPos.y - enemy.y;
  const dist = Math.hypot(dx, dy);

  // Stagger state (taking knockback)
  if (enemy.staggerUntil && now < enemy.staggerUntil) {
    return { ...enemy, state: ENEMY_STATES.STAGGER };
  }

  // Attack state
  if (dist <= enemy.attackRange) {
    const canAttack = !enemy.lastAttackTime || (now - enemy.lastAttackTime >= enemy.attackCooldownMs);
    if (canAttack) {
      return {
        ...enemy,
        state: ENEMY_STATES.ATTACK,
        lastAttackTime: now,
        shouldStrike: true,
      };
    }
    return { ...enemy, state: ENEMY_STATES.ATTACK, shouldStrike: false };
  }

  // Chase state
  if (dist <= enemy.aggroRange) {
    const dirX = dist > 0 ? dx / dist : 0;
    const dirY = dist > 0 ? dy / dist : 0;
    return {
      ...enemy,
      state: ENEMY_STATES.CHASE,
      vx: dirX * enemy.speed,
      vy: dirY * enemy.speed,
      shouldStrike: false,
    };
  }

  // Idle state
  return {
    ...enemy,
    state: ENEMY_STATES.IDLE,
    vx: 0,
    vy: 0,
    shouldStrike: false,
  };
}
