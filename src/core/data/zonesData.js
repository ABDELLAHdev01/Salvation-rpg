export const zones = [
  {
    id: 'sunforge-crossing',
    name: 'Sunforge Crossing',
    description: 'Stable ground and balanced resources for steady growth.',
    unlockLevel: 1,
    modifiers: {
      miningYieldMultiplier: 1,
      miningXpMultiplier: 1,
      farmGrowMultiplier: 1,
      farmYieldMultiplier: 1,
      farmAnimalYieldMultiplier: 1,
      farmAnimalSpeedMultiplier: 1,
      expeditionGoldMultiplier: 1,
      expeditionXpMultiplier: 1,
      expeditionDurationMultiplier: 1,
      workshopDurationMultiplier: 1,
      workshopXpMultiplier: 1,
    },
  },
  {
    id: 'verdant-veil',
    name: 'Verdant Veil',
    description: 'Lush soils accelerate crops and livestock yields.',
    unlockLevel: 4,
    modifiers: {
      miningYieldMultiplier: 0.95,
      miningXpMultiplier: 0.98,
      farmGrowMultiplier: 0.9,
      farmYieldMultiplier: 1.15,
      farmAnimalYieldMultiplier: 1.1,
      farmAnimalSpeedMultiplier: 0.9,
      expeditionGoldMultiplier: 0.98,
      expeditionXpMultiplier: 1,
      expeditionDurationMultiplier: 1,
      workshopDurationMultiplier: 1.05,
      workshopXpMultiplier: 1,
    },
  },
  {
    id: 'emberdeep',
    name: 'Emberdeep Caverns',
    description: 'Hot veins boost mining output but slow the fields.',
    unlockLevel: 8,
    modifiers: {
      miningYieldMultiplier: 1.12,
      miningXpMultiplier: 1.08,
      farmGrowMultiplier: 1.06,
      farmYieldMultiplier: 0.95,
      farmAnimalYieldMultiplier: 0.98,
      farmAnimalSpeedMultiplier: 1.05,
      expeditionGoldMultiplier: 1.02,
      expeditionXpMultiplier: 1,
      expeditionDurationMultiplier: 1.02,
      workshopDurationMultiplier: 1.04,
      workshopXpMultiplier: 1.02,
    },
  },
  {
    id: 'skyreach-ridge',
    name: 'Skyreach Ridge',
    description: 'High winds shorten expeditions and improve rewards.',
    unlockLevel: 12,
    modifiers: {
      miningYieldMultiplier: 0.97,
      miningXpMultiplier: 1,
      farmGrowMultiplier: 1.02,
      farmYieldMultiplier: 0.97,
      farmAnimalYieldMultiplier: 1,
      farmAnimalSpeedMultiplier: 1,
      expeditionGoldMultiplier: 1.15,
      expeditionXpMultiplier: 1.12,
      expeditionDurationMultiplier: 0.9,
      workshopDurationMultiplier: 1.02,
      workshopXpMultiplier: 1,
    },
  },
  {
    id: 'aetherworks',
    name: 'Aetherworks Foundry',
    description: 'Arcane rigs speed crafting and raise workshop mastery.',
    unlockLevel: 16,
    modifiers: {
      miningYieldMultiplier: 0.98,
      miningXpMultiplier: 0.97,
      farmGrowMultiplier: 1,
      farmYieldMultiplier: 0.98,
      farmAnimalYieldMultiplier: 1,
      farmAnimalSpeedMultiplier: 1,
      expeditionGoldMultiplier: 1,
      expeditionXpMultiplier: 1.02,
      expeditionDurationMultiplier: 1,
      workshopDurationMultiplier: 0.88,
      workshopXpMultiplier: 1.1,
    },
  },
];

const modifierDefaults = {
  miningYieldMultiplier: 1,
  miningXpMultiplier: 1,
  farmGrowMultiplier: 1,
  farmYieldMultiplier: 1,
  farmAnimalYieldMultiplier: 1,
  farmAnimalSpeedMultiplier: 1,
  expeditionGoldMultiplier: 1,
  expeditionXpMultiplier: 1,
  expeditionDurationMultiplier: 1,
  workshopDurationMultiplier: 1,
  workshopXpMultiplier: 1,
};

export const getZoneById = (zoneId) => zones.find((zone) => zone.id === zoneId) || null;

export const getDefaultZoneId = () => zones[0]?.id || 'sunforge-crossing';

export const getUnlockedZoneIdsByLevel = (level) => {
  const safeLevel = Math.max(1, level || 1);
  return zones.filter((zone) => safeLevel >= (zone.unlockLevel || 1)).map((zone) => zone.id);
};

export const getActiveZone = (profile) => {
  const activeId = profile?.activeZoneId;
  return getZoneById(activeId) || getZoneById(getDefaultZoneId()) || zones[0];
};

export const getZoneModifiersForId = (zoneId) => {
  const zone = getZoneById(zoneId) || getZoneById(getDefaultZoneId());
  const modifiers = zone?.modifiers || {};
  return Object.keys(modifierDefaults).reduce((acc, key) => {
    acc[key] = modifiers[key] ?? modifierDefaults[key];
    return acc;
  }, {});
};

export const getZoneModifiers = (profile) => getZoneModifiersForId(getActiveZone(profile)?.id);
