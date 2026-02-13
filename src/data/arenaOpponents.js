import { getHousingTierById } from './housingData';

const STORAGE_KEY = 'arenaOpponent';
const RESULT_KEY = 'arenaResult';
const HISTORY_KEY = 'arenaHistory';
const HAZARD_KEY = 'arenaHazard';
const WAGER_KEY = 'arenaWager';
const RIVAL_KEY = 'arenaRivals';

export const basePlayerStats = [
  { label: 'Attack', value: 74 },
  { label: 'Defense', value: 68 },
  { label: 'Wisdom', value: 54 },
];

export const getPlayerStats = (profile) => {
  const house = getHousingTierById(profile?.houseId || 'starter-cottage');
  const effect = house?.effect;
  if (!effect?.stat || !effect?.percent) {
    return basePlayerStats;
  }

  return basePlayerStats.map((stat) => {
    if (stat.label !== effect.stat) {
      return stat;
    }
    return {
      ...stat,
      value: Math.round(stat.value * (1 + effect.percent / 100)),
    };
  });
};

export const opponents = [
  {
    name: 'Nyx the Veiled',
    level: 22,
    rank: 'IV',
    image: '/raceicon/elf_female_2.png',
    gear: ['Shadowleaf Cloak', 'Stormcaller Bow', 'Moonlit Bracers'],
    stats: [
      { label: 'Attack', value: 72 },
      { label: 'Defense', value: 64 },
      { label: 'Wisdom', value: 58 },
    ],
  },
  {
    name: 'Korr the Ironhowl',
    level: 21,
    rank: 'IV',
    image: '/raceicon/orc_male_2.png',
    gear: ['Grimforge Axe', 'Ironhide Pauldrons', 'Bloodbound Greaves'],
    stats: [
      { label: 'Attack', value: 82 },
      { label: 'Defense', value: 70 },
      { label: 'Wisdom', value: 44 },
    ],
  },
  {
    name: 'Seren Ashwind',
    level: 22,
    rank: 'IV',
    image: '/raceicon/human_female_1.png',
    gear: ['Sunforged Saber', 'Dawnward Shield', 'Valorist Boots'],
    stats: [
      { label: 'Attack', value: 68 },
      { label: 'Defense', value: 72 },
      { label: 'Wisdom', value: 60 },
    ],
  },
  {
    name: 'Varek Nightfall',
    level: 23,
    rank: 'V',
    image: '/raceicon/vampire_male_1.png',
    gear: ['Ebonfang Dagger', 'Crimson Mantle', 'Nocturne Signet'],
    stats: [
      { label: 'Attack', value: 78 },
      { label: 'Defense', value: 56 },
      { label: 'Wisdom', value: 66 },
    ],
  },
  {
    name: 'Lyra Dawnveil',
    level: 21,
    rank: 'IV',
    image: '/raceicon/elf_female_1.png',
    gear: ['Silversong Blade', 'Aether Veil', 'Glintstep Boots'],
    stats: [
      { label: 'Attack', value: 65 },
      { label: 'Defense', value: 58 },
      { label: 'Wisdom', value: 74 },
    ],
  },
  {
    name: 'Brann Stonewake',
    level: 22,
    rank: 'IV',
    image: '/raceicon/human_male_2.png',
    gear: ['Bastion Hammer', 'Wardplate', 'Gritstone Greaves'],
    stats: [
      { label: 'Attack', value: 70 },
      { label: 'Defense', value: 78 },
      { label: 'Wisdom', value: 46 },
    ],
  },
  {
    name: 'Brynn Ironroot',
    level: 20,
    rank: 'III',
    image: '/raceicon/dwarf_male_1.png',
    gear: ['Stonebreaker Maul', 'Deepforge Plate', 'Anvilstep Boots'],
    stats: [
      { label: 'Attack', value: 66 },
      { label: 'Defense', value: 80 },
      { label: 'Wisdom', value: 42 },
    ],
  },
  {
    name: 'Mira Embercrown',
    level: 20,
    rank: 'III',
    image: '/raceicon/vampire_female_1.png',
    gear: ['Ashen Scepter', 'Crimson Shawl', 'Duskfire Rings'],
    stats: [
      { label: 'Attack', value: 62 },
      { label: 'Defense', value: 52 },
      { label: 'Wisdom', value: 80 },
    ],
  },
];

export const getStoredOpponent = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredOpponent = (opponent) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(opponent));
  } catch {
    // Ignore storage failures.
  }
};

export const clearStoredOpponent = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
};

export const getOrCreateOpponent = () => {
  const existing = getStoredOpponent();
  if (existing) {
    return existing;
  }
  const random = opponents[Math.floor(Math.random() * opponents.length)];
  setStoredOpponent(random);
  return random;
};

export const arenaHazards = [
  {
    name: 'Searing Wind',
    effect: 'Burning gusts reduce defense by 6%.',
  },
  {
    name: 'Obsidian Fog',
    effect: 'Visibility drops, boosting critical strikes by 8%.',
  },
  {
    name: 'Shock Pillars',
    effect: 'Random pulses slow movement every 20 seconds.',
  },
  {
    name: 'Blood Moon',
    effect: 'Life steal effects increase by 5%.',
  },
];

export const getStoredHazard = () => {
  try {
    const raw = sessionStorage.getItem(HAZARD_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredHazard = (hazard) => {
  try {
    sessionStorage.setItem(HAZARD_KEY, JSON.stringify(hazard));
  } catch {
    // Ignore storage failures.
  }
};

export const clearStoredHazard = () => {
  try {
    sessionStorage.removeItem(HAZARD_KEY);
  } catch {
    // Ignore storage failures.
  }
};

export const getOrCreateHazard = () => {
  const existing = getStoredHazard();
  if (existing) {
    return existing;
  }
  const random = arenaHazards[Math.floor(Math.random() * arenaHazards.length)];
  setStoredHazard(random);
  return random;
};

export const getStoredResult = () => {
  try {
    const raw = sessionStorage.getItem(RESULT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredResult = (result) => {
  try {
    sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
  } catch {
    // Ignore storage failures.
  }
};

export const clearStoredResult = () => {
  try {
    sessionStorage.removeItem(RESULT_KEY);
  } catch {
    // Ignore storage failures.
  }
};

export const getStoredWager = () => {
  try {
    const raw = sessionStorage.getItem(WAGER_KEY);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
};

export const setStoredWager = (amount) => {
  try {
    sessionStorage.setItem(WAGER_KEY, String(amount));
  } catch {
    // Ignore storage failures.
  }
};

export const clearStoredWager = () => {
  try {
    sessionStorage.removeItem(WAGER_KEY);
  } catch {
    // Ignore storage failures.
  }
};

export const getOrCreateResult = (opponent) => {
  const existing = getStoredResult();
  if (existing) {
    return existing;
  }

  const getRandomItem = (list) => list[Math.floor(Math.random() * list.length)];
  const getTopStat = (stats) => {
    return stats.reduce((best, stat) => (stat.value > best.value ? stat : best), stats[0]);
  };
  const getRandomStat = (stats) => getRandomItem(stats);
  const playerTotal = basePlayerStats.reduce((sum, stat) => sum + stat.value, 0);
  const opponentTotal = opponent?.stats
    ? opponent.stats.reduce((sum, stat) => sum + stat.value, 0)
    : 0;
  const mvpIsPlayer = Math.random() > 0.5;
  const mvpName = mvpIsPlayer ? 'You' : opponent?.name || 'Rival';
  const mvpStat = mvpIsPlayer
    ? getRandomStat(basePlayerStats)
    : getRandomStat(opponent?.stats || basePlayerStats);
  const openerLines = [
    `Opening volley shook the arena gates.`,
    `First strike landed with a roar from the crowd.`,
    `Both fighters traded fast counters in the opening.`,
  ];
  const swingLines = [
    `${mvpName} surged with ${mvpStat.label} ${mvpStat.value}.`,
    `${mvpName} chained a combo fueled by ${mvpStat.label}.`,
    `${mvpName} seized momentum with ${mvpStat.label} pressure.`,
  ];
  const finisherLines = [
    `A final push sealed the exchange.`,
    `The crowd erupted at the finishing blow.`,
    `A decisive feint ended the duel.`,
  ];
  const gearLine = opponent?.gear?.length
    ? `Opponent gear spotted: ${getRandomItem(opponent.gear)}.`
    : `Arena runes surged as the duel peaked.`;

  const isWin = Math.random() > 0.45;
  const result = {
    outcome: isWin ? 'Victory' : 'Defeat',
    opponentName: opponent?.name || 'Unknown Rival',
    rewards: isWin ? ['240 gold', 'Arena Sigil', 'Renown +6'] : ['Consolation Chest', 'Renown +1'],
    rankChange: isWin ? '+1' : '-1',
    highlightReel: {
      mvpName: isWin ? 'You' : opponent?.name || mvpName,
      mvpStat: isWin ? getTopStat(basePlayerStats) : getTopStat(opponent?.stats || basePlayerStats),
      totalScore: isWin ? playerTotal : opponentTotal,
      moments: [
        {
          label: 'Opening Exchange',
          detail: getRandomItem(openerLines),
        },
        {
          label: 'Signature Push',
          detail: getRandomItem(swingLines),
        },
        {
          label: 'Final Swing',
          detail: getRandomItem([gearLine, `Rank impact ${isWin ? '+1' : '-1'}.`, ...finisherLines]),
        },
      ],
    },
  };

  setStoredResult(result);
  return result;
};

export const getArenaHistory = () => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addArenaHistory = (entry) => {
  try {
    const current = getArenaHistory();
    const next = [entry, ...current].slice(0, 10);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    return next;
  } catch {
    return getArenaHistory();
  }
};

export const clearArenaHistory = () => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // Ignore storage failures.
  }
};

export const getRivalRecords = () => {
  try {
    const raw = localStorage.getItem(RIVAL_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const getRivalRecord = (name) => {
  const records = getRivalRecords();
  return records[name] || { name, fights: 0, lastTauntAt: 0 };
};

export const incrementRivalRecord = (name) => {
  const records = getRivalRecords();
  const current = records[name] || { name, fights: 0, lastTauntAt: 0 };
  const next = {
    ...current,
    fights: current.fights + 1,
  };
  records[name] = next;
  try {
    localStorage.setItem(RIVAL_KEY, JSON.stringify(records));
  } catch {
    // Ignore storage failures.
  }
  return next;
};

export const getRivalTaunt = (name) => {
  const taunts = [
    `Back again, challenger?`,
    `I remember your stance.`,
    `The crowd craves our rematch.`,
    `Your last duel still echoes.`,
  ];
  const record = getRivalRecord(name);
  if (record.fights < 2) {
    return null;
  }
  return taunts[record.fights % taunts.length];
};
