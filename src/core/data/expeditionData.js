export const expeditionLocations = [
  {
    id: 'sunken-ridge',
    name: 'Sunken Ridge',
    summary: 'A quick sweep through misty gullies for relic shards.',
    region: 'Northwall Vale',
    biome: 'Mistridge gullies',
    threat: 'Low',
    focus: 'Relics',
    scoutNote: 'Light fog, stable paths, perfect for quick sorties.',
    levelRequired: 1,
    durationMs: 15 * 60 * 1000,
    minGold: 140,
    maxGold: 260,
    minXp: 90,
    maxXp: 170,
  },
  {
    id: 'luminous-fen',
    name: 'Luminous Fen',
    summary: 'Glowcap trails that hide lost satchels and charms.',
    region: 'Glowfen Basin',
    biome: 'Biolum marsh',
    threat: 'Low',
    focus: 'Supplies',
    scoutNote: 'Soft ground slows pace but caches are plentiful.',
    levelRequired: 1,
    durationMs: 15 * 60 * 1000,
    minGold: 160,
    maxGold: 290,
    minXp: 100,
    maxXp: 190,
  },
  {
    id: 'ember-hollows',
    name: 'Ember Hollows',
    summary: 'Hot caverns filled with ember bloom and stubborn drakes.',
    region: 'Cinder Belt',
    biome: 'Sulfur caverns',
    threat: 'Moderate',
    focus: 'Ember cores',
    scoutNote: 'Heat pockets accelerate travel, but keep a cool head.',
    levelRequired: 5,
    durationMs: 45 * 60 * 1000,
    minGold: 320,
    maxGold: 560,
    minXp: 210,
    maxXp: 360,
  },
  {
    id: 'gilded-morass',
    name: 'Gilded Morass',
    summary: 'Boglands where sunken caches glitter beneath murk.',
    region: 'Mire Coast',
    biome: 'Gold-leaf bogs',
    threat: 'Moderate',
    focus: 'Coins & salvage',
    scoutNote: 'Pack rope. Some chests are half-submerged.',
    levelRequired: 5,
    durationMs: 45 * 60 * 1000,
    minGold: 360,
    maxGold: 620,
    minXp: 230,
    maxXp: 390,
  },
  {
    id: 'stormwatch-cliffs',
    name: 'Stormwatch Cliffs',
    summary: 'Cliffside routes where the winds carry rare caches.',
    region: 'Stormwatch Rim',
    biome: 'Cliff passes',
    threat: 'High',
    focus: 'Storm sigils',
    scoutNote: 'Expect sudden gusts. Harness lines are mandatory.',
    levelRequired: 10,
    durationMs: 90 * 60 * 1000,
    minGold: 560,
    maxGold: 920,
    minXp: 360,
    maxXp: 560,
  },
  {
    id: 'blackwind-span',
    name: 'Blackwind Span',
    summary: 'Lightning-charged bridges with high-risk salvage.',
    region: 'Warden Heights',
    biome: 'Sky bridges',
    threat: 'High',
    focus: 'Arc tech',
    scoutNote: 'Shielded packs recommended. Lightning is frequent.',
    levelRequired: 10,
    durationMs: 90 * 60 * 1000,
    minGold: 620,
    maxGold: 990,
    minXp: 390,
    maxXp: 600,
  },
  {
    id: 'ashen-frontier',
    name: 'Ashen Frontier',
    summary: 'A long haul through ash fields for elite salvage.',
    region: 'Ashen Wilds',
    biome: 'Ash dunes',
    threat: 'Severe',
    focus: 'Elite salvage',
    scoutNote: 'Visibility drops fast. Crews must stay in formation.',
    levelRequired: 20,
    durationMs: 3 * 60 * 60 * 1000,
    minGold: 1300,
    maxGold: 2000,
    minXp: 820,
    maxXp: 1300,
  },
  {
    id: 'celestine-rift',
    name: 'Celestine Rift',
    summary: 'Starfall debris fields packed with legendary finds.',
    region: 'Celestine Expanse',
    biome: 'Starfall craters',
    threat: 'Severe',
    focus: 'Legendary relics',
    scoutNote: 'Anomalies spike near dusk. Plan your route.',
    levelRequired: 20,
    durationMs: 3 * 60 * 60 * 1000,
    minGold: 1450,
    maxGold: 2250,
    minXp: 900,
    maxXp: 1450,
  },
];

export const getExpeditionLocation = (locationId) =>
  expeditionLocations.find((location) => location.id === locationId) || null;

export const rollExpeditionRewards = (location) => {
  if (!location) {
    return { gold: 0, xp: 0, items: {} };
  }

  const roll = (min, max) => Math.floor(min + Math.random() * (max - min + 1));
  const items = {};

  // 35% chance to discover an Uncracked Geode on expeditions
  if (Math.random() < 0.35) {
    items['mystery-geode'] = 1;
  }

  // Biome-specific relic and mineral salvage
  if (location.id === 'sunken-ridge') {
    items['silver'] = roll(1, 3);
  } else if (location.id === 'luminous-fen') {
    items['turnip-stew'] = 1;
  } else if (location.id === 'ember-hollows') {
    items['gold'] = roll(1, 2);
  } else if (location.id === 'gilded-morass') {
    items['gold'] = roll(2, 4);
    if (Math.random() < 0.25) items['contract-sigil'] = 1;
  } else if (location.id === 'stormwatch-cliffs' || location.id === 'blackwind-span') {
    items['mythril'] = roll(1, 2);
    if (Math.random() < 0.35) items['contract-sigil'] = 1;
  } else if (location.levelRequired >= 20) {
    items['starforge'] = 1;
    if (Math.random() < 0.5) items['contract-sigil'] = 1;
  }

  return {
    gold: roll(location.minGold, location.maxGold),
    xp: roll(location.minXp, location.maxXp),
    items,
  };
};
