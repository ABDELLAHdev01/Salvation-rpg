export const workshopStations = [
  {
    id: 'smelter',
    name: 'Smelter',
    unlockLevel: 1,
    description: 'Refine ores into durable bars.',
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    unlockLevel: 2,
    description: 'Turn crops into hearty meals.',
  },
  {
    id: 'loom',
    name: 'Loom',
    unlockLevel: 4,
    description: 'Spin fibers into cloth.',
  },
  {
    id: 'alchemy',
    name: 'Alchemy',
    unlockLevel: 6,
    description: 'Brew potent botanical elixirs.',
  },
];

export const workshopItems = [
  { id: 'iron-bar', name: 'Iron Bar', sellValue: 70 },
  { id: 'copper-bar', name: 'Copper Bar', sellValue: 76 },
  { id: 'silver-ingot', name: 'Silver Ingot', sellValue: 125 },
  { id: 'gold-ingot', name: 'Gold Ingot', sellValue: 175 },
  { id: 'turnip-stew', name: 'Turnip Stew', sellValue: 90 },
  { id: 'herb-tea', name: 'Herb Tea', sellValue: 65 },
  { id: 'hearty-stew', name: 'Hearty Stew', sellValue: 140 },
  { id: 'wool-cloth', name: 'Wool Cloth', sellValue: 95 },
  { id: 'moonweave', name: 'Moonweave', sellValue: 165 },
  { id: 'healing-tonic', name: 'Healing Tonic', sellValue: 120 },
  { id: 'sunroot-elixir', name: 'Sunroot Elixir', sellValue: 190 },
];

const workshopItemValueMap = workshopItems.reduce((acc, item) => {
  acc[item.id] = item.sellValue;
  return acc;
}, {});

const buildRecipe = ({ outputs, ...recipe }) => {
  const sellValue = outputs.reduce((sum, output) => {
    const unitValue = workshopItemValueMap[output.id] || 0;
    return sum + unitValue * (output.amount || 0);
  }, 0);
  return {
    ...recipe,
    outputs,
    sellValue,
  };
};

export const workshopRecipes = [
  buildRecipe({
    id: 'smelt-iron-bar',
    station: 'smelter',
    levelRequired: 1,
    durationMs: 14 * 60 * 1000,
    inputs: [
      { source: 'mining', id: 'iron', amount: 4 },
    ],
    outputs: [{ id: 'iron-bar', amount: 1 }],
    xp: 16,
  }),
  buildRecipe({
    id: 'smelt-copper-bar',
    station: 'smelter',
    levelRequired: 2,
    durationMs: 18 * 60 * 1000,
    inputs: [
      { source: 'mining', id: 'copper', amount: 4 },
    ],
    outputs: [{ id: 'copper-bar', amount: 1 }],
    xp: 18,
  }),
  buildRecipe({
    id: 'smelt-silver-ingot',
    station: 'smelter',
    levelRequired: 4,
    durationMs: 30 * 60 * 1000,
    inputs: [
      { source: 'mining', id: 'silver', amount: 3 },
    ],
    outputs: [{ id: 'silver-ingot', amount: 1 }],
    xp: 26,
  }),
  buildRecipe({
    id: 'smelt-gold-ingot',
    station: 'smelter',
    levelRequired: 6,
    durationMs: 36 * 60 * 1000,
    inputs: [
      { source: 'mining', id: 'gold', amount: 3 },
    ],
    outputs: [{ id: 'gold-ingot', amount: 1 }],
    xp: 34,
  }),
  buildRecipe({
    id: 'cook-herb-tea',
    station: 'kitchen',
    levelRequired: 2,
    durationMs: 12 * 60 * 1000,
    inputs: [
      { source: 'farm', id: 'herb', amount: 2 },
      { source: 'farm', id: 'honey', amount: 1 },
    ],
    outputs: [{ id: 'herb-tea', amount: 2 }],
    xp: 14,
  }),
  buildRecipe({
    id: 'cook-turnip-stew',
    station: 'kitchen',
    levelRequired: 3,
    durationMs: 18 * 60 * 1000,
    inputs: [
      { source: 'farm', id: 'turnip', amount: 4 },
      { source: 'farm', id: 'milk', amount: 1 },
    ],
    outputs: [{ id: 'turnip-stew', amount: 1 }],
    xp: 18,
  }),
  buildRecipe({
    id: 'cook-hearty-stew',
    station: 'kitchen',
    levelRequired: 5,
    durationMs: 30 * 60 * 1000,
    inputs: [
      { source: 'farm', id: 'wheat', amount: 4 },
      { source: 'farm', id: 'cheese', amount: 1 },
    ],
    outputs: [{ id: 'hearty-stew', amount: 1 }],
    xp: 24,
  }),
  buildRecipe({
    id: 'loom-wool-cloth',
    station: 'loom',
    levelRequired: 4,
    durationMs: 20 * 60 * 1000,
    inputs: [
      { source: 'farm', id: 'wool', amount: 2 },
    ],
    outputs: [{ id: 'wool-cloth', amount: 1 }],
    xp: 22,
  }),
  buildRecipe({
    id: 'loom-moonweave',
    station: 'loom',
    levelRequired: 6,
    durationMs: 34 * 60 * 1000,
    inputs: [
      { source: 'farm', id: 'wool', amount: 2 },
      { source: 'farm', id: 'moonberry', amount: 2 },
    ],
    outputs: [{ id: 'moonweave', amount: 1 }],
    xp: 32,
  }),
  buildRecipe({
    id: 'brew-healing-tonic',
    station: 'alchemy',
    levelRequired: 6,
    durationMs: 30 * 60 * 1000,
    inputs: [
      { source: 'farm', id: 'herb', amount: 2 },
      { source: 'farm', id: 'honey', amount: 1 },
    ],
    outputs: [{ id: 'healing-tonic', amount: 1 }],
    xp: 28,
  }),
  buildRecipe({
    id: 'brew-sunroot-elixir',
    station: 'alchemy',
    levelRequired: 8,
    durationMs: 40 * 60 * 1000,
    inputs: [
      { source: 'farm', id: 'sunroot', amount: 2 },
      { source: 'farm', id: 'moonberry', amount: 1 },
    ],
    outputs: [{ id: 'sunroot-elixir', amount: 1 }],
    xp: 40,
  }),
];

export const workshopLevelConfig = {
  baseXp: 140,
  perLevel: 80,
};

export const getWorkshopXpForLevel = (level) => {
  const safeLevel = Math.max(1, level);
  const earlyLevel = Math.min(10, safeLevel);
  const earlyTarget = 120 + (earlyLevel - 1) * 70;

  if (safeLevel <= 10) {
    return earlyTarget;
  }

  const lateLevels = safeLevel - 10;
  return earlyTarget + lateLevels * 110;
};

export const workshopUpgrades = [
  { level: 1, name: 'Basic Tools', cost: 0, durationMultiplier: 1 },
  { level: 2, name: 'Sharpened Tools', cost: 800, durationMultiplier: 0.92 },
  { level: 3, name: 'Steam Rig', cost: 1800, durationMultiplier: 0.85 },
  { level: 4, name: 'Arcane Looms', cost: 3600, durationMultiplier: 0.78 },
  { level: 5, name: 'Astral Workshop', cost: 6200, durationMultiplier: 0.7 },
];

export const getWorkshopUpgrade = (level) =>
  workshopUpgrades.find((upgrade) => upgrade.level === level) || workshopUpgrades[0];

export const getNextWorkshopUpgrade = (level) =>
  workshopUpgrades.find((upgrade) => upgrade.level === level + 1) || null;

export const getWorkshopStationsForLevel = (level) =>
  workshopStations.filter((station) => (station.unlockLevel || 1) <= level);

export const getWorkshopRecipe = (recipeId) =>
  workshopRecipes.find((recipe) => recipe.id === recipeId) || null;

export const getWorkshopRecipesForLevel = (level) =>
  workshopRecipes.filter((recipe) => (recipe.levelRequired || 1) <= level);

export const getWorkshopRecipesForStation = (stationId, level) =>
  getWorkshopRecipesForLevel(level).filter((recipe) => recipe.station === stationId);

export const getWorkshopItem = (itemId) => workshopItems.find((item) => item.id === itemId) || null;
