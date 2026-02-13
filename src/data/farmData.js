export const farmCrops = [
  {
    id: 'turnip',
    name: 'Turnip Patch',
    levelRequired: 1,
    seedName: 'Turnip Seeds',
    seedCost: 12,
    growMs: 8 * 60 * 1000,
    yieldId: 'turnip',
    yieldAmount: 3,
  },
  {
    id: 'wheat',
    name: 'Wheat Rows',
    levelRequired: 3,
    seedName: 'Wheat Seeds',
    seedCost: 24,
    growMs: 16 * 60 * 1000,
    yieldId: 'wheat',
    yieldAmount: 4,
  },
  {
    id: 'herb',
    name: 'Herb Garden',
    levelRequired: 6,
    seedName: 'Herb Seeds',
    seedCost: 50,
    growMs: 25 * 60 * 1000,
    yieldId: 'herb',
    yieldAmount: 4,
  },
  {
    id: 'moonberry',
    name: 'Moonberry Bed',
    levelRequired: 10,
    seedName: 'Moonberry Seeds',
    seedCost: 135,
    growMs: 50 * 60 * 1000,
    yieldId: 'moonberry',
    yieldAmount: 5,
  },
  {
    id: 'sunroot',
    name: 'Sunroot Rows',
    levelRequired: 14,
    seedName: 'Sunroot Seeds',
    seedCost: 210,
    growMs: 70 * 60 * 1000,
    yieldId: 'sunroot',
    yieldAmount: 6,
  },
];

export const farmAnimals = [
  {
    id: 'chicken',
    name: 'Chickens',
    levelRequired: 4,
    price: 600,
    sellPrice: 360,
    produceEveryMs: 6 * 60 * 60 * 1000,
    produceId: 'egg',
    produceAmount: 2,
  },
  {
    id: 'cow',
    name: 'Cows',
    levelRequired: 6,
    price: 1200,
    sellPrice: 720,
    produceEveryMs: 8 * 60 * 60 * 1000,
    produceId: 'milk',
    produceAmount: 1,
  },
  {
    id: 'sheep',
    name: 'Sheep',
    levelRequired: 8,
    price: 1800,
    sellPrice: 1080,
    produceEveryMs: 10 * 60 * 60 * 1000,
    produceId: 'wool',
    produceAmount: 1,
  },
  {
    id: 'goat',
    name: 'Goats',
    levelRequired: 10,
    price: 2200,
    sellPrice: 1320,
    produceEveryMs: 11 * 60 * 60 * 1000,
    produceId: 'cheese',
    produceAmount: 1,
  },
  {
    id: 'pig',
    name: 'Pigs',
    levelRequired: 12,
    price: 2600,
    sellPrice: 1560,
    produceEveryMs: 14 * 60 * 60 * 1000,
    produceId: 'truffle',
    produceAmount: 1,
  },
  {
    id: 'bee',
    name: 'Beehives',
    levelRequired: 14,
    price: 3000,
    sellPrice: 1800,
    produceEveryMs: 7 * 60 * 60 * 1000,
    produceId: 'honey',
    produceAmount: 1,
  },
];

export const getSeedImageSrc = (cropId) => {
  if (!cropId) {
    return '';
  }
  const safeId = String(cropId);
  const fileName = `${safeId.charAt(0).toUpperCase()}${safeId.slice(1)}`;
  return `/farm/seeds/${fileName}.png`;
};

export const farmGoods = [
  { id: 'turnip', name: 'Turnip', sellPrice: 14 },
  { id: 'wheat', name: 'Wheat Bundle', sellPrice: 22 },
  { id: 'herb', name: 'Herb Sprig', sellPrice: 38 },
  { id: 'moonberry', name: 'Moonberry', sellPrice: 52 },
  { id: 'sunroot', name: 'Sunroot', sellPrice: 75 },
  { id: 'egg', name: 'Fresh Egg', sellPrice: 19 },
  { id: 'milk', name: 'Milk Jug', sellPrice: 33 },
  { id: 'wool', name: 'Wool Bundle', sellPrice: 52 },
  { id: 'cheese', name: 'Goat Cheese', sellPrice: 62 },
  { id: 'truffle', name: 'Black Truffle', sellPrice: 85 },
  { id: 'honey', name: 'Wild Honey', sellPrice: 72 },
];

export const farmLevelConfig = {
  baseXp: 120,
  perLevel: 60,
};

export const getFarmXpForLevel = (level) => {
  const safeLevel = Math.max(1, level);
  const earlyLevel = Math.min(10, safeLevel);
  const earlyTarget = 100 + (earlyLevel - 1) * 50;

  if (safeLevel <= 10) {
    return earlyTarget;
  }

  const lateLevels = safeLevel - 10;
  return earlyTarget + lateLevels * 80;
};

export const getFarmXpProgress = (farmLevel, farmXp) => {
  const target = getFarmXpForLevel(farmLevel);
  return {
    current: farmXp,
    target,
    progress: Math.min(100, Math.round((farmXp / target) * 100)),
  };
};

const cropSeasonModifiers = {
  turnip: {
    spring: { growMultiplier: 0.95, yieldMultiplier: 1.1 },
    winter: { growMultiplier: 1.08, yieldMultiplier: 0.9 },
  },
  wheat: {
    summer: { growMultiplier: 0.92, yieldMultiplier: 1.1 },
    winter: { growMultiplier: 1.1, yieldMultiplier: 0.88 },
  },
  herb: {
    spring: { growMultiplier: 0.9, yieldMultiplier: 1.08 },
    autumn: { growMultiplier: 1.02, yieldMultiplier: 0.95 },
  },
  moonberry: {
    autumn: { growMultiplier: 0.95, yieldMultiplier: 1.12 },
    summer: { growMultiplier: 1.05, yieldMultiplier: 0.93 },
  },
  sunroot: {
    summer: { growMultiplier: 0.9, yieldMultiplier: 1.12 },
    winter: { growMultiplier: 1.15, yieldMultiplier: 0.85 },
  },
};

export const getCropSeasonModifiers = (cropId, season) => {
  if (!cropId || !season) {
    return { growMultiplier: 1, yieldMultiplier: 1 };
  }

  const seasonMods = cropSeasonModifiers[cropId] || {};
  return seasonMods[season] || { growMultiplier: 1, yieldMultiplier: 1 };
};

const seasonNames = {
  spring: 'Spring',
  summer: 'Summer',
  autumn: 'Autumn',
  winter: 'Winter',
};

export const getCropSeasonBadges = (cropId) => {
  const modifiers = cropSeasonModifiers[cropId] || {};
  const badges = [];

  Object.entries(modifiers).forEach(([season, values]) => {
    if (values.yieldMultiplier > 1.05 || values.growMultiplier < 0.95) {
      badges.push({
        season,
        label: `${seasonNames[season] || season} bonus`,
        tone: 'good',
      });
      return;
    }
    if (values.yieldMultiplier < 0.95 || values.growMultiplier > 1.05) {
      badges.push({
        season,
        label: `${seasonNames[season] || season} penalty`,
        tone: 'bad',
      });
    }
  });

  return badges;
};

const farmGoodLevelMap = (() => {
  const levelMap = {};
  farmCrops.forEach((crop) => {
    levelMap[crop.yieldId] = crop.levelRequired;
  });
  farmAnimals.forEach((animal) => {
    levelMap[animal.produceId] = animal.levelRequired;
  });
  return levelMap;
})();

const getFarmGoodsForLevel = (farmLevel) =>
  farmGoods
    .map((good) => ({
      ...good,
      levelRequired: farmGoodLevelMap[good.id] || 1,
    }))
    .filter((good) => good.levelRequired <= farmLevel);

const shuffle = (items) => {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

const farmTaskAmounts = {
  daily: 4,
  weekly: 12,
  monthly: 30,
};

const farmTaskRewards = {
  daily: { xpPerItem: 8, goldPerItem: 5 },
  weekly: { xpPerItem: 12, goldPerItem: 8 },
  monthly: { xpPerItem: 16, goldPerItem: 12 },
};

export const getFarmTaskResetKeys = (date = new Date()) => {
  const dayKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  const tmp = new Date(date.getTime());
  tmp.setHours(0, 0, 0, 0);
  const day = (tmp.getDay() + 6) % 7;
  tmp.setDate(tmp.getDate() - day + 3);
  const firstThursday = new Date(tmp.getFullYear(), 0, 4);
  const weekNumber =
    1 + Math.round((tmp.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000));
  const weekKey = `${tmp.getFullYear()}-W${weekNumber}`;
  const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
  return { dayKey, weekKey, monthKey };
};

const buildFarmTask = (period, farmLevel, good, index) => {
  const baseAmount = farmTaskAmounts[period] || 6;
  const levelBoost = 1 + Math.floor(Math.max(0, farmLevel - 1) / 5) * 0.25;
  const target = Math.max(1, Math.round(baseAmount * levelBoost));
  const rewards = farmTaskRewards[period] || farmTaskRewards.daily;
  return {
    id: `${period}-${good.id}-${Date.now()}-${index}`,
    type: 'deliver',
    goodId: good.id,
    label: `Deliver ${target} ${good.name}`,
    progress: 0,
    target,
    rewardXp: target * rewards.xpPerItem,
    rewardGold: target * rewards.goldPerItem,
    completed: false,
    claimed: false,
  };
};

const createFarmTasks = (period, farmLevel, count) => {
  const availableGoods = getFarmGoodsForLevel(farmLevel);
  if (availableGoods.length === 0) {
    return [];
  }
  const picks = shuffle(availableGoods).slice(0, Math.max(1, count));
  return picks.map((good, index) => buildFarmTask(period, farmLevel, good, index));
};

export const ensureFarmTasks = ({ tasks, farmLevel, now = new Date() }) => {
  const nextTasks = tasks && typeof tasks === 'object' ? { ...tasks } : {};
  let changed = false;
  const { dayKey, weekKey, monthKey } = getFarmTaskResetKeys(now);
  const shouldRefreshForLevel = nextTasks.level == null || farmLevel > nextTasks.level;

  if (shouldRefreshForLevel || !nextTasks.daily || nextTasks.daily.key !== dayKey) {
    nextTasks.daily = { key: dayKey, tasks: createFarmTasks('daily', farmLevel, 3) };
    changed = true;
  }

  if (shouldRefreshForLevel || !nextTasks.weekly || nextTasks.weekly.key !== weekKey) {
    nextTasks.weekly = { key: weekKey, tasks: createFarmTasks('weekly', farmLevel, 2) };
    changed = true;
  }

  if (shouldRefreshForLevel || !nextTasks.monthly || nextTasks.monthly.key !== monthKey) {
    nextTasks.monthly = { key: monthKey, tasks: createFarmTasks('monthly', farmLevel, 1) };
    changed = true;
  }

  if (shouldRefreshForLevel) {
    nextTasks.level = farmLevel;
  } else if (nextTasks.level == null) {
    nextTasks.level = farmLevel;
    changed = true;
  }

  return { nextTasks, changed };
};

const seasonByMonth = [
  'winter',
  'winter',
  'spring',
  'spring',
  'spring',
  'summer',
  'summer',
  'summer',
  'autumn',
  'autumn',
  'autumn',
  'winter',
];

export const getFarmSeason = (date = new Date()) => seasonByMonth[date.getMonth()];

const farmWeatherBySeason = {
  spring: [
    { id: 'spring-breeze', label: 'Spring Breeze', growMultiplier: 0.95, yieldMultiplier: 1.05 },
    { id: 'spring-showers', label: 'Gentle Showers', growMultiplier: 0.9, yieldMultiplier: 1 },
    { id: 'spring-fog', label: 'Morning Fog', growMultiplier: 1.05, yieldMultiplier: 0.95 },
  ],
  summer: [
    { id: 'summer-sun', label: 'Bright Sun', growMultiplier: 0.9, yieldMultiplier: 1.05 },
    { id: 'summer-heat', label: 'Heatwave', growMultiplier: 1.1, yieldMultiplier: 0.9 },
    { id: 'summer-storm', label: 'Summer Storm', growMultiplier: 1.05, yieldMultiplier: 0.95 },
  ],
  autumn: [
    { id: 'autumn-gold', label: 'Golden Harvest', growMultiplier: 0.95, yieldMultiplier: 1.1 },
    { id: 'autumn-wind', label: 'Rustling Wind', growMultiplier: 1.05, yieldMultiplier: 0.95 },
    { id: 'autumn-rain', label: 'Chill Rain', growMultiplier: 1, yieldMultiplier: 0.98 },
  ],
  winter: [
    { id: 'winter-frost', label: 'Frosty Mornings', growMultiplier: 1.15, yieldMultiplier: 0.9 },
    { id: 'winter-clear', label: 'Clear Cold', growMultiplier: 1.05, yieldMultiplier: 0.95 },
    { id: 'winter-thaw', label: 'Sudden Thaw', growMultiplier: 0.95, yieldMultiplier: 1 },
  ],
};

const pickWeatherForSeason = (season) => {
  const options = farmWeatherBySeason[season] || farmWeatherBySeason.spring;
  const index = Math.floor(Math.random() * options.length);
  return options[index];
};

export const ensureFarmWeather = ({ weather, now = new Date() }) => {
  const { dayKey } = getFarmTaskResetKeys(now);
  if (weather && weather.dayKey === dayKey) {
    return { nextWeather: weather, changed: false };
  }

  const season = getFarmSeason(now);
  const selected = pickWeatherForSeason(season);
  const nextWeather = {
    dayKey,
    season,
    ...selected,
  };

  return { nextWeather, changed: true };
};
