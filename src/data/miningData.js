export const miningOres = [
  { id: 'iron', name: 'Iron', tier: 1, price: 26, image: '/ores/iron.webp' },
  { id: 'copper', name: 'Copper', tier: 1, price: 28, image: '/ores/copper.webp' },
  { id: 'bronze', name: 'Bronze', tier: 1, price: 34, image: '/ores/bronze.webp' },
  { id: 'silver', name: 'Silver', tier: 2, price: 62, image: '/ores/silver.webp' },
  { id: 'electrum', name: 'Electrum', tier: 2, price: 74, image: '/ores/electrum.webp' },
  { id: 'gold', name: 'Gold', tier: 3, price: 96, image: '/ores/gold.webp' },
  { id: 'platinum', name: 'Platinum', tier: 3, price: 132, image: '/ores/platinum.webp' },
  { id: 'mythril', name: 'Mythril', tier: 4, price: 170, image: '/ores/mythril.webp' },
  { id: 'orichalcum', name: 'Orichalcum', tier: 4, price: 205, image: '/ores/orichalcum.webp' },
  { id: 'adamantite', name: 'Adamantite', tier: 5, price: 265, image: '/ores/adamantite.webp' },
  { id: 'voidsteel', name: 'Voidsteel', tier: 5, price: 310, image: '/ores/voidsteel.webp' },
  { id: 'starforge', name: 'Starforge Ore', tier: 6, price: 395, image: '/ores/starforge.webp' },
];

export const miningStoreItems = miningOres.map((ore) => ({
  id: ore.id,
  name: ore.name,
  price: ore.price,
}));

export const miningContractToken = {
  id: 'contract-sigil',
  name: 'Contract Sigil',
  price: 320,
  description: 'Refreshes a mining contract when used.',
};

export const miningHirelings = [
  {
    id: 'pit-runner',
    name: 'Pit Runner',
    price: 400,
    requiredMiningLevel: 2,
    ticksPerHour: 1,
    refundRate: 0.4,
    description: 'Adds 1 passive mining tick per hour.',
  },
  {
    id: 'vein-scout',
    name: 'Vein Scout',
    price: 850,
    requiredMiningLevel: 6,
    ticksPerHour: 2,
    refundRate: 0.45,
    description: 'Adds 2 passive mining ticks per hour.',
  },
  {
    id: 'deep-foreman',
    name: 'Deep Foreman',
    price: 1500,
    requiredMiningLevel: 10,
    ticksPerHour: 4,
    refundRate: 0.5,
    description: 'Adds 4 passive mining ticks per hour.',
  },
  {
    id: 'abyss-hauler',
    name: 'Abyss Hauler',
    price: 2400,
    requiredMiningLevel: 14,
    ticksPerHour: 6,
    refundRate: 0.55,
    description: 'Adds 6 passive mining ticks per hour.',
  },
];

export const miningForgeUpgrades = [
  {
    level: 1,
    name: 'Cracked Smelter',
    price: 0,
    requiredMiningLevel: 1,
    description: 'Basic forge with no modifiers.',
    rareChanceBonus: 0,
    mishapReduction: 0,
  },
  {
    level: 2,
    name: 'Tempered Crucible',
    price: 900,
    requiredMiningLevel: 5,
    description: '+2% rare node chance, -1% mishap chance.',
    rareChanceBonus: 0.02,
    mishapReduction: 0.01,
  },
  {
    level: 3,
    name: 'Runed Kiln',
    price: 1800,
    requiredMiningLevel: 9,
    description: '+4% rare node chance, -2% mishap chance.',
    rareChanceBonus: 0.04,
    mishapReduction: 0.02,
  },
  {
    level: 4,
    name: 'Aether Furnace',
    price: 3200,
    requiredMiningLevel: 13,
    description: '+6% rare node chance, -3% mishap chance.',
    rareChanceBonus: 0.06,
    mishapReduction: 0.03,
  },
  {
    level: 5,
    name: 'Starbound Forge',
    price: 5200,
    requiredMiningLevel: 17,
    description: '+8% rare node chance, -4% mishap chance.',
    rareChanceBonus: 0.08,
    mishapReduction: 0.04,
  },
];

export const pickaxeUpgrades = [
  {
    level: 1,
    name: 'Rustbound Pickaxe',
    price: 0,
    requiredMiningLevel: 1,
    rarity: 'Common',
    image: '/pickaxe/rustbound.webp',
    visual: 'Iron head with rawhide grip',
  },
  {
    level: 2,
    name: 'Forged Pickaxe',
    price: 320,
    requiredMiningLevel: 2,
    rarity: 'Uncommon',
    image: '/pickaxe/forged.webp',
    visual: 'Brass edges and chain-wrapped haft',
  },
  {
    level: 3,
    name: 'Runed Pickaxe',
    price: 720,
    requiredMiningLevel: 4,
    rarity: 'Rare',
    image: '/pickaxe/runed.webp',
    visual: 'Runed steel with ember inlay',
  },
  {
    level: 4,
    name: 'Gilded Pickaxe',
    price: 1400,
    requiredMiningLevel: 7,
    rarity: 'Epic',
    image: '/pickaxe/gilded.webp',
    visual: 'Gold-flanged head, crimson binding',
  },
  {
    level: 5,
    name: 'Mythril Pickaxe',
    price: 2600,
    requiredMiningLevel: 10,
    rarity: 'Legendary',
    image: '/pickaxe/mythril.webp',
    visual: 'Mythril shimmer and frost-blue core',
  },
  {
    level: 6,
    name: 'Voidsteel Pickaxe',
    price: 4200,
    requiredMiningLevel: 13,
    rarity: 'Mythic',
    image: '/pickaxe/voidsteel.webp',
    visual: 'Voidsteel veins wrapped in obsidian rope',
  },
  {
    level: 7,
    name: 'Starforge Pickaxe',
    price: 6200,
    requiredMiningLevel: 16,
    rarity: 'Relic',
    image: '/pickaxe/starforge.webp',
    visual: 'Celestial core with arcane lattice',
  },
];

export const miningConsumables = [
  {
    id: 'stone-salve',
    name: 'Stone Salve',
    price: 140,
    xpBonus: 60,
    xpMultiplier: 1,
    requiredMiningLevel: 1,
    cooldownMs: 2 * 60 * 60 * 1000,
    icon: 'S',
    description: 'Adds +60 mining XP on your next claim.',
  },
  {
    id: 'focus-ritual',
    name: 'Focus Ritual Kit',
    price: 280,
    xpBonus: 0,
    xpMultiplier: 1.2,
    requiredMiningLevel: 4,
    cooldownMs: 4 * 60 * 60 * 1000,
    icon: 'F',
    description: 'Grants +20% mining XP on your next claim.',
  },
  {
    id: 'ember-tonic',
    name: 'Ember Tonic',
    price: 220,
    xpBonus: 25,
    xpMultiplier: 1.1,
    requiredMiningLevel: 2,
    cooldownMs: 3 * 60 * 60 * 1000,
    icon: 'E',
    description: 'Adds +25 XP and +10% mining XP on your next claim.',
  },
];

export const miningBoosterIcons = {
  'stone-salve': {
    viewBox: '0 0 24 24',
    path: 'M12 2l7 7-7 13-7-13 7-7z',
  },
  'focus-ritual': {
    viewBox: '0 0 24 24',
    path: 'M12 5c5 0 9 7 9 7s-4 7-9 7-9-7-9-7 4-7 9-7zm0 4a3 3 0 100 6 3 3 0 000-6z',
  },
  'ember-tonic': {
    viewBox: '0 0 24 24',
    path: 'M12 3c3 3 5 6 5 9a5 5 0 11-10 0c0-3 2-6 5-9zm0 8c-1.5 1.5-2 2.5-2 4a2 2 0 104 0c0-1.5-.5-2.5-2-4z',
  },
};

export const MINING_DURATION_MS = 5 * 60 * 60 * 1000;
export const MINING_TICK_MS = 60 * 1000;

export const getTierByMiningLevel = (level) => {
  if (level >= 20) return 6;
  if (level >= 16) return 5;
  if (level >= 12) return 4;
  if (level >= 8) return 3;
  if (level >= 4) return 2;
  return 1;
};

export const getOresForTier = (tier) => miningOres.filter((ore) => ore.tier <= tier);

const hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 100000;
  }
  return hash;
};

export const getDailyVeinBonus = (timestamp = Date.now()) => {
  const key = getDailyKey(timestamp);
  const index = hashString(key) % miningOres.length;
  const ore = miningOres[index];
  return {
    oreId: ore.id,
    multiplier: 1.2,
  };
};

export const getWeeklySurgeBonus = (timestamp = Date.now()) => {
  const key = getWeeklyKey(timestamp);
  const hash = hashString(key);
  return {
    xpMultiplier: 1.05 + (hash % 6) * 0.01,
  };
};

export const rollMiningYield = ({ miningLevel = 1, pickaxeLevel = 1 } = {}) => {
  const tier = getTierByMiningLevel(miningLevel);
  const diversityTier = Math.min(6, tier + Math.floor(pickaxeLevel / 2));
  const available = getOresForTier(diversityTier);
  const baseCount = Math.max(1, Math.floor(miningLevel / 3));
  const rolls = Math.min(6, baseCount + 1);
  const bonusMultiplier = 1 + Math.min(0.2, pickaxeLevel * 0.015);

  const yieldMap = {};
  for (let i = 0; i < rolls; i += 1) {
    const ore = available[Math.floor(Math.random() * available.length)];
    const amount = Math.max(1, Math.round((0.6 + Math.random() * 1.6) * bonusMultiplier));
    yieldMap[ore.id] = (yieldMap[ore.id] || 0) + amount;
  }

  return {
    tier,
    yieldMap,
  };
};

export const rollMiningTick = ({
  miningLevel = 1,
  pickaxeLevel = 1,
  forgeLevel = 1,
  dailyVein = null,
  weeklySurge = null,
  prestigeLevel = 0,
} = {}) => {
  const tier = getTierByMiningLevel(miningLevel);
  const diversityTier = Math.min(6, tier + Math.floor(pickaxeLevel / 2));
  const available = getOresForTier(diversityTier);
  const forge = miningForgeUpgrades.find((item) => item.level === forgeLevel) || miningForgeUpgrades[0];
  const prestigeRareBonus = Math.min(0.06, prestigeLevel * 0.01);
  const prestigeCritBonus = Math.min(0.04, prestigeLevel * 0.005);
  const prestigeMishapReduction = Math.min(0.03, prestigeLevel * 0.003);
  const baseRareChance = 0.025 + pickaxeLevel * 0.004 + miningLevel * 0.0016 + (forge.rareChanceBonus || 0);
  const rareChance = Math.min(0.2, baseRareChance + prestigeRareBonus);
  const baseCritChance = 0.06 + pickaxeLevel * 0.008;
  const critChance = Math.min(0.2, baseCritChance + prestigeCritBonus);
  const baseMishapChance = 0.06 - (forge.mishapReduction || 0) - prestigeMishapReduction;
  const mishapChance = Math.max(0.008, baseMishapChance);
  const eventRoll = Math.random();
  let event = 'normal';
  let amountMultiplier = 1;
  let xpMultiplier = 1;
  let orePool = available;

  if (eventRoll < mishapChance) {
    event = 'mishap';
    amountMultiplier = 0.6;
    xpMultiplier = 0.65;
  } else if (eventRoll < mishapChance + rareChance) {
    event = 'rare';
    amountMultiplier = 1.55;
    xpMultiplier = 1.25;
    const bonusPool = getOresForTier(Math.min(6, diversityTier + 1)).filter(
      (oreItem) => oreItem.tier > diversityTier
    );
    orePool = bonusPool.length > 0 ? bonusPool : available;
  } else if (eventRoll < mishapChance + rareChance + critChance) {
    event = 'crit';
    amountMultiplier = 1.35;
    xpMultiplier = 1.1;
  }

  const bonusMultiplier = 1 + Math.min(0.2, pickaxeLevel * 0.015);
  const ore = orePool[Math.floor(Math.random() * orePool.length)];
  if (dailyVein?.oreId === ore.id) {
    amountMultiplier *= dailyVein.multiplier || 1;
  }
  if (weeklySurge?.xpMultiplier) {
    xpMultiplier *= weeklySurge.xpMultiplier;
  }
  const amount = Math.max(1, Math.round((0.35 + Math.random() * 0.95) * bonusMultiplier * amountMultiplier));

  return {
    tier,
    yieldMap: {
      [ore.id]: amount,
    },
    xpMultiplier,
    event,
  };
};

export const getMiningXpForLevel = (level) => {
  const safeLevel = Math.max(1, level);
  const earlyLevel = Math.min(10, safeLevel);
  const earlyTarget = Math.floor(220 + Math.pow(earlyLevel, 1.5) * 90);

  if (safeLevel <= 10) {
    return earlyTarget;
  }

  const lateLevels = safeLevel - 10;
  return Math.floor(earlyTarget + Math.pow(lateLevels, 1.65) * 220);
};

export const getPickaxeUpgrade = (level) => pickaxeUpgrades.find((upgrade) => upgrade.level === level) || null;

export const getNextPickaxeUpgrade = (level) =>
  pickaxeUpgrades.find((upgrade) => upgrade.level === level + 1) || null;

export const getForgeUpgrade = (level) => miningForgeUpgrades.find((upgrade) => upgrade.level === level) || null;

export const getNextForgeUpgrade = (level) =>
  miningForgeUpgrades.find((upgrade) => upgrade.level === level + 1) || null;

export const getMiningConsumable = (id) => miningConsumables.find((item) => item.id === id) || null;

export const getMiningHireling = (id) => miningHirelings.find((item) => item.id === id) || null;

export const getDailyKey = (timestamp = Date.now()) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getWeeklyKey = (timestamp = Date.now()) => {
  const date = new Date(timestamp);
  const oneJan = new Date(date.getFullYear(), 0, 1);
  const dayOffset = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
  const week = Math.floor((dayOffset + oneJan.getDay()) / 7) + 1;
  return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
};

export const buildMiningContract = ({ type = 'daily', miningLevel = 1, timestamp = Date.now() } = {}) => {
  const tier = getTierByMiningLevel(miningLevel);
  const selectionTier = Math.min(6, tier + 1);
  const available = getOresForTier(selectionTier);
  const ore = available[Math.floor(Math.random() * available.length)];
  const amountBase = type === 'weekly' ? 20 : 7;
  const amountScale = type === 'weekly' ? 8 : 4;
  const amount = amountBase + tier * amountScale;
  const goldMultiplier = type === 'weekly' ? 1.08 : 1.03;
  const rewardGold = Math.round(amount * ore.price * goldMultiplier);
  const rewardXp = Math.round(amount * (type === 'weekly' ? 2.4 : 1.2));
  const key = type === 'weekly' ? getWeeklyKey(timestamp) : getDailyKey(timestamp);
  const expiresAt = type === 'weekly'
    ? timestamp + 7 * 24 * 60 * 60 * 1000
    : timestamp + 24 * 60 * 60 * 1000;

  return {
    id: `${type}-${key}`,
    type,
    key,
    oreId: ore.id,
    amount,
    rewardGold,
    rewardXp,
    createdAt: timestamp,
    expiresAt,
    claimed: false,
  };
};

export const formatDuration = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value) => String(value).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};
