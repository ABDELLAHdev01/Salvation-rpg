import { getHousingTierById, getActiveEstateBuffs } from './housingData';
import { getPlayerEquippedGear, getGearStatTotals } from './gearData';

const STORAGE_KEY = 'arenaOpponent';
const RESULT_KEY = 'arenaResult';
const HISTORY_KEY = 'arenaHistory';
const HAZARD_KEY = 'arenaHazard';
const WAGER_KEY = 'arenaWager';
const RIVAL_KEY = 'arenaRivals';
const STANCE_KEY = 'arenaStance';

export { getPlayerEquippedGear } from './gearData';

export const combatStances = [
  {
    id: 'blazing-assault',
    name: 'Blazing Assault',
    category: 'Offensive',
    description: 'Aggressive burst strikes with maximum offensive momentum.',
    tagline: '+15% Attack · -5% Defense',
    modifiers: { attack: 1.15, defense: 0.95, wisdom: 1.0 },
    advantageAgainst: 'Arcane Focus',
    moves: ['Crimson Dash', 'Ember Blade Flurry', 'Sunforge Execution'],
  },
  {
    id: 'iron-bastion',
    name: 'Iron Bastion',
    category: 'Defensive',
    description: 'Impenetrable shield discipline, absorbing blows and counter-attacking.',
    tagline: '+20% Defense · -10% Attack',
    modifiers: { attack: 0.90, defense: 1.20, wisdom: 1.0 },
    advantageAgainst: 'Blazing Assault',
    moves: ['Bulwark Stance', 'Shieldbreaker Counter', 'Dawnward Aegis'],
  },
  {
    id: 'arcane-focus',
    name: 'Arcane Focus',
    category: 'Tactical',
    description: 'Runes and tactical foresight to out-maneuver heavy defenses.',
    tagline: '+25% Wisdom · +5% Defense',
    modifiers: { attack: 1.0, defense: 1.05, wisdom: 1.25 },
    advantageAgainst: 'Iron Bastion',
    moves: ['Rune Pulse', 'Aether Surge', 'Starfall Finisher'],
  },
];

export const getCombatStanceById = (stanceId) => {
  return combatStances.find((s) => s.id === stanceId) || combatStances[0];
};

export const getStoredStance = () => {
  try {
    return sessionStorage.getItem(STANCE_KEY) || 'blazing-assault';
  } catch {
    return 'blazing-assault';
  }
};

export const setStoredStance = (stanceId) => {
  try {
    sessionStorage.setItem(STANCE_KEY, stanceId);
  } catch {
    // Ignore storage failures.
  }
};

export const basePlayerStats = [
  { label: 'Attack', value: 74 },
  { label: 'Defense', value: 68 },
  { label: 'Wisdom', value: 54 },
];

export const getPlayerStats = (profile, stanceId = null) => {
  const house = getHousingTierById(profile?.houseId || 'starter-cottage');
  const effect = house?.effect;
  const estateBuffs = getActiveEstateBuffs(profile);
  const gearStats = getGearStatTotals(profile);
  const stance = stanceId ? getCombatStanceById(stanceId) : null;

  return basePlayerStats.map((stat) => {
    let multiplier = 1;
    if (effect?.stat === stat.label && effect?.percent) {
      multiplier += effect.percent / 100;
    }
    if (stat.label === 'Attack' && estateBuffs.attackBonus) {
      multiplier += estateBuffs.attackBonus / 100;
    }
    if (stat.label === 'Defense' && estateBuffs.shieldBonus) {
      multiplier += estateBuffs.shieldBonus / 100;
    }

    if (stance?.modifiers) {
      if (stat.label === 'Attack' && stance.modifiers.attack) {
        multiplier *= stance.modifiers.attack;
      } else if (stat.label === 'Defense' && stance.modifiers.defense) {
        multiplier *= stance.modifiers.defense;
      } else if (stat.label === 'Wisdom' && stance.modifiers.wisdom) {
        multiplier *= stance.modifiers.wisdom;
      }
    }

    const flatValue = Math.round(stat.value * multiplier);
    const gearBonus = gearStats ? (gearStats[stat.label.toLowerCase()] || 0) : 0;

    return {
      ...stat,
      value: flatValue + gearBonus,
      baseValue: stat.value,
      gearBonus,
    };
  });
};

export const opponents = [
  {
    name: 'Nyx the Veiled',
    level: 22,
    rank: 'IV',
    image: '/raceicon/elf_female_2.webp',
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
    image: '/raceicon/orc_male_2.webp',
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
    image: '/raceicon/human_female_1.webp',
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
    image: '/raceicon/vampire_male_1.webp',
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
    image: '/raceicon/elf_female_1.webp',
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
    image: '/raceicon/human_male_2.webp',
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
    image: '/raceicon/dwarf_male_1.webp',
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
    image: '/raceicon/vampire_female_1.webp',
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

export const getOrCreateResult = (opponent, options = {}) => {
  const existing = getStoredResult();
  if (existing) {
    return existing;
  }

  const profile = options.profile || null;
  const stanceId = options.stanceId || getStoredStance();
  const hazard = options.hazard || getStoredHazard();
  const stance = getCombatStanceById(stanceId);
  const playerStats = getPlayerStats(profile, stanceId);
  const equippedGear = getPlayerEquippedGear(profile);

  const pAtk = playerStats.find((s) => s.label === 'Attack')?.value ?? 74;
  const pDef = playerStats.find((s) => s.label === 'Defense')?.value ?? 68;
  const pWis = playerStats.find((s) => s.label === 'Wisdom')?.value ?? 54;

  const oStats = opponent?.stats || basePlayerStats;
  const oAtk = oStats.find((s) => s.label === 'Attack')?.value ?? 70;
  const oDef = oStats.find((s) => s.label === 'Defense')?.value ?? 65;
  const oWis = oStats.find((s) => s.label === 'Wisdom')?.value ?? 50;

  // Hazard environmental modifications
  let pDefMod = 1.0;
  let oDefMod = 1.0;
  let critBonus = 0;
  if (hazard?.name === 'Searing Wind') {
    pDefMod = 0.94;
    oDefMod = 0.94;
  } else if (hazard?.name === 'Obsidian Fog') {
    critBonus = 8;
  }

  // Tactical power calculation
  const playerPower = Math.round(pAtk * 1.25 + (pDef * pDefMod) * 1.1 + pWis * 0.9 + critBonus);
  const opponentPower = Math.round(oAtk * 1.25 + (oDef * oDefMod) * 1.1 + oWis * 0.9);

  // Stance tactical advantage vs Opponent profile
  let tacticalAdvantage = 0;
  if (oDef >= oAtk && oDef >= oWis && stance?.id === 'arcane-focus') {
    tacticalAdvantage = 0.08;
  } else if (oWis >= oAtk && oWis >= oDef && stance?.id === 'blazing-assault') {
    tacticalAdvantage = 0.08;
  } else if (oAtk >= oDef && oAtk >= oWis && stance?.id === 'iron-bastion') {
    tacticalAdvantage = 0.08;
  }

  const baseRatio = playerPower / (playerPower + opponentPower);
  const winProbability = Math.max(0.15, Math.min(0.88, baseRatio + tacticalAdvantage));

  const roll = Math.random();
  const isWin = roll < winProbability;

  const weapon = equippedGear.find((g) => g.slot === 'weapon')?.name || 'weapon';
  const opponentGear = opponent?.gear?.length ? opponent.gear[0] : 'armor';

  const round1 = isWin
    ? `You advanced in ${stance.name}, your ${weapon} finding an early gap against ${opponent?.name || 'Rival'}.`
    : `${opponent?.name || 'Rival'} turned aside your ${weapon} strike with their ${opponentGear}.`;

  const round2 = hazard?.name
    ? `Under the ${hazard.name}, ${isWin ? 'you capitalized on tactical positioning' : opponent?.name + ' adapted swiftly to arena hazards'}.`
    : `Both combatants traded heavy blows, testing defensive limits.`;

  const round3 = isWin
    ? `With a decisive tactical surge, you shattered your opponent's guard! The Colosseum crowd roars in approval!`
    : `${opponent?.name || 'Rival'} landed a punishing counter-thrust, securing victory before the sands.`;

  const result = {
    outcome: isWin ? 'Victory' : 'Defeat',
    opponentName: opponent?.name || 'Unknown Rival',
    rewards: isWin ? ['240 gold', 'Arena Sigil', 'Renown +6'] : ['Consolation Chest', 'Renown +1'],
    rankChange: isWin ? '+1' : '-1',
    combatStats: {
      playerPower,
      opponentPower,
      winOdds: Math.round(winProbability * 100),
      stanceUsed: stance.name,
    },
    highlightReel: {
      mvpName: isWin ? 'You' : opponent?.name || 'Rival',
      mvpStat: isWin
        ? (pAtk >= pDef ? { label: 'Attack', value: pAtk } : { label: 'Defense', value: pDef })
        : (oAtk >= oDef ? { label: 'Attack', value: oAtk } : { label: 'Defense', value: oDef }),
      totalScore: isWin ? playerPower : opponentPower,
      moments: [
        {
          label: 'Opening Exchange',
          detail: round1,
        },
        {
          label: 'Signature Push',
          detail: round2,
        },
        {
          label: 'Final Swing',
          detail: round3,
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
