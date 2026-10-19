import { housingTiers } from './housingData';

const buildMissionId = (type, targetKey) => `${type}-${targetKey}`;

const getNextHouse = (ownedHouses) =>
  housingTiers.find((house) => !ownedHouses.includes(house.id)) || null;

const getLevelTarget = (level, step) => Math.max(2, level + step);

const getRewardScale = (target) => {
  if (target <= 6) return 1.15;
  if (target <= 10) return 1.05;
  if (target <= 15) return 1.0;
  return 0.9;
};

const getHouseRewardScale = (price) => {
  if (price <= 2000) return 1.1;
  if (price <= 4000) return 1.0;
  return 0.9;
};

const buildMissionMeta = (profile) => {
  const stats = profile?.stats || {};
  const ownedHouses = Array.isArray(profile?.ownedHouses) ? profile.ownedHouses : ['starter-cottage'];
  return {
    playerLevel: Number(stats.level ?? 1),
    farmLevel: Number(profile?.farmLevel ?? 1),
    miningLevel: Number(profile?.miningLevel ?? 1),
    houseCount: ownedHouses.length,
    expeditionsCompleted: Number(stats.expeditionsCompleted ?? 0),
  };
};

const buildMissionForType = (type, profile) => {
  const stats = profile?.stats || {};
  const ownedHouses = Array.isArray(profile?.ownedHouses) ? profile.ownedHouses : ['starter-cottage'];
  const expeditionsCompleted = Number(stats.expeditionsCompleted ?? 0);
  const farmLevel = Number(profile?.farmLevel ?? 1);
  const miningLevel = Number(profile?.miningLevel ?? 1);
  const playerLevel = Number(stats.level ?? 1);

  switch (type) {
    case 'player-level': {
      const target = getLevelTarget(playerLevel, playerLevel < 10 ? 2 : 3);
      const scale = getRewardScale(target);
      return {
        id: buildMissionId(type, target),
        type,
        label: `Reach player level ${target}`,
        target,
        rewardGold: Math.round((150 + target * 25) * scale),
        rewardXp: Math.round((140 + target * 35) * scale),
        rewardLevels: 1,
        claimed: false,
      };
    }
    case 'farm-level': {
      const target = getLevelTarget(farmLevel, farmLevel < 10 ? 1 : 2);
      const scale = getRewardScale(target);
      return {
        id: buildMissionId(type, target),
        type,
        label: `Reach farm level ${target}`,
        target,
        rewardGold: Math.round((120 + target * 20) * scale),
        rewardXp: Math.round((120 + target * 30) * scale),
        rewardLevels: 1,
        claimed: false,
      };
    }
    case 'mining-level': {
      const target = getLevelTarget(miningLevel, miningLevel < 10 ? 1 : 2);
      const scale = getRewardScale(target);
      return {
        id: buildMissionId(type, target),
        type,
        label: `Reach mining level ${target}`,
        target,
        rewardGold: Math.round((120 + target * 20) * scale),
        rewardXp: Math.round((120 + target * 30) * scale),
        rewardLevels: 1,
        claimed: false,
      };
    }
    case 'expeditions': {
      const target = Math.max(1, expeditionsCompleted + (expeditionsCompleted < 5 ? 2 : 3));
      const scale = getRewardScale(target);
      return {
        id: buildMissionId(type, target),
        type,
        label: `Complete ${target} expeditions`,
        target,
        rewardGold: Math.round((140 + target * 45) * scale),
        rewardXp: Math.round((130 + target * 40) * scale),
        rewardLevels: 1,
        claimed: false,
      };
    }
    case 'house': {
      const nextHouse = getNextHouse(ownedHouses);
      if (nextHouse) {
        const scale = getHouseRewardScale(nextHouse.price);
        return {
          id: buildMissionId(type, nextHouse.id),
          type,
          label: `Own the ${nextHouse.name}`,
          target: nextHouse.id,
          rewardGold: Math.round((200 + Math.round(nextHouse.price * 0.35)) * scale),
          rewardXp: Math.round((200 + Math.round(nextHouse.price * 0.2)) * scale),
          rewardLevels: 1,
          claimed: false,
        };
      }
      return {
        id: buildMissionId(type, 'complete'),
        type,
        label: 'Own all available houses',
        target: 'complete',
        rewardGold: 0,
        rewardXp: 0,
        rewardLevels: 0,
        claimed: true,
      };
    }
    default:
      return null;
  }
};

const buildMissions = (profile) => {
  const types = ['player-level', 'farm-level', 'mining-level', 'expeditions', 'house'];
  return types.map((type) => buildMissionForType(type, profile)).filter(Boolean);
};

export const ensureGeneralMissions = (missions, profile, meta) => {
  const nextMeta = buildMissionMeta(profile);

  if (!Array.isArray(missions) || missions.length === 0) {
    return { nextMissions: buildMissions(profile), nextMeta, changed: true };
  }

  // Sequential progression: Only replace missions that have been CLAIMED.
  // We no longer refresh based on 'progressed' (e.g. leveling up past a goal).
  // The player must click 'Claim' to get the reward and see the next mission.
  let hasClaimed = false;
  const nextMissions = missions.map((mission) => {
    if (mission.claimed) {
      if (mission.type === 'house' && mission.target === 'complete') {
        return mission; // Don't replace the 'all houses owned' state
      }
      hasClaimed = true;
      return buildMissionForType(mission.type, profile);
    }
    return mission;
  });

  if (hasClaimed) {
    return { nextMissions, nextMeta, changed: true };
  }

  if (!meta) {
    return { nextMissions: missions, nextMeta, changed: true };
  }

  return { nextMissions: missions, nextMeta: meta, changed: false };
};

export const getMissionProgress = (mission, profile) => {
  if (!profile) return 0;
  const stats = profile.stats || {};
  const ownedHouses = Array.isArray(profile.ownedHouses) ? profile.ownedHouses : ['starter-cottage'];

  switch (mission.type) {
    case 'player-level':
      return Number(stats.level ?? 1);
    case 'farm-level':
      return Number(profile.farmLevel ?? 1);
    case 'mining-level':
      return Number(profile.miningLevel ?? 1);
    case 'house':
      return ownedHouses.includes(mission.target) ? 1 : 0;
    case 'expeditions':
      return Number(stats.expeditionsCompleted ?? 0);
    default:
      return 0;
  }
};

export const isMissionComplete = (mission, profile) => {
  if (!mission || !profile) return false;

  if (mission.type === 'house') {
    const ownedHouses = Array.isArray(profile.ownedHouses) ? profile.ownedHouses : ['starter-cottage'];
    return ownedHouses.includes(mission.target) || mission.target === 'complete';
  }

  const progress = getMissionProgress(mission, profile);
  const target = Number(mission.target);
  return progress >= target;
};

export const chronicleChapters = [
  {
    id: 'chapter-1',
    chapterNumber: 1,
    title: 'Dawn of the Warden',
    subtitle: 'Awakening in the Shattered Realm',
    lore: 'You emerge from the borderlands without banner or acclaim. Survey the territory, secure your lodgings, and prove your mettle upon the frontier paths.',
    badge: 'Initiate Crest',
    rewardGold: 350,
    rewardXp: 300,
    titleReward: 'Warden Initiate',
    objectives: [
      {
        id: 'c1-level',
        label: 'Reach Player Level 2',
        target: 2,
        getProgress: (p) => Number(p?.stats?.level ?? 1),
        isDone: (p) => Number(p?.stats?.level ?? 1) >= 2,
      },
      {
        id: 'c1-residence',
        label: 'Settle into a Residence',
        target: 1,
        getProgress: (p) => (p?.ownedHouses?.length ? 1 : 0),
        isDone: (p) => (p?.ownedHouses?.length ?? 0) >= 1,
      },
      {
        id: 'c1-expedition',
        label: 'Undertake a Frontier Expedition',
        target: 1,
        getProgress: (p) => Number(p?.stats?.expeditionsCompleted ?? 0),
        isDone: (p) => Number(p?.stats?.expeditionsCompleted ?? 0) >= 1,
      },
    ],
  },
  {
    id: 'chapter-2',
    chapterNumber: 2,
    title: 'The Sustained Hearth',
    subtitle: 'Cultivating the Borderlands',
    lore: 'An order cannot march on hollow bellies. Cultivate the rich loam of your estate, harvest fresh crops, and bring livestock into your pastures.',
    badge: 'Verdant Sickle',
    rewardGold: 700,
    rewardXp: 550,
    titleReward: 'Hearthkeeper',
    objectives: [
      {
        id: 'c2-farm',
        label: 'Reach Farm Level 3',
        target: 3,
        getProgress: (p) => Number(p?.farmLevel ?? 1),
        isDone: (p) => Number(p?.farmLevel ?? 1) >= 3,
      },
      {
        id: 'c2-gold',
        label: 'Accumulate 200 Gold from Trades',
        target: 200,
        getProgress: (p) => Number(p?.stats?.gold ?? 0),
        isDone: (p) => Number(p?.stats?.gold ?? 0) >= 200,
      },
      {
        id: 'c2-house',
        label: 'Acquire Modest House (or 2 Residences)',
        target: 1,
        getProgress: (p) => ((p?.ownedHouses || []).includes('modest-house') || (p?.ownedHouses || []).length >= 2 ? 1 : 0),
        isDone: (p) => (p?.ownedHouses || []).includes('modest-house') || (p?.ownedHouses || []).length >= 2,
      },
    ],
  },
  {
    id: 'chapter-3',
    chapterNumber: 3,
    title: 'Veins of the Earth',
    subtitle: 'Secrets of the Deep Caverns',
    lore: 'The mountain roots are lined with mythril and obsidian. Delve into the deep caverns, upgrade your pickaxe, and forge resilient gear.',
    badge: 'Iron Delver',
    rewardGold: 1200,
    rewardXp: 900,
    titleReward: 'Deep Delver',
    objectives: [
      {
        id: 'c3-mine',
        label: 'Reach Mining Level 3',
        target: 3,
        getProgress: (p) => Number(p?.miningLevel ?? 1),
        isDone: (p) => Number(p?.miningLevel ?? 1) >= 3,
      },
      {
        id: 'c3-pickaxe',
        label: 'Upgrade to Copper Pickaxe or higher',
        target: 2,
        getProgress: (p) => Number(p?.pickaxeLevel ?? 1),
        isDone: (p) => Number(p?.pickaxeLevel ?? 1) >= 2,
      },
      {
        id: 'c3-player',
        label: 'Reach Player Level 4',
        target: 4,
        getProgress: (p) => Number(p?.stats?.level ?? 1),
        isDone: (p) => Number(p?.stats?.level ?? 1) >= 4,
      },
    ],
  },
  {
    id: 'chapter-4',
    chapterNumber: 4,
    title: 'Trial of the Arena',
    subtitle: 'Honor & Martial Renown',
    lore: 'Glory is forged upon bloody sands. Enter the Colosseum, face rival champions, and pledge tithes to the Order Hall of your city.',
    badge: 'Gladiator Crest',
    rewardGold: 2000,
    rewardXp: 1500,
    titleReward: 'Champion of the Realm',
    objectives: [
      {
        id: 'c4-arena',
        label: 'Win at least 1 Colosseum Duel',
        target: 1,
        getProgress: (p) => {
          const wins = (p?.arenaHistory || []).filter((h) => h.result === 'Victory').length;
          return Math.max(wins, Number(p?.stats?.arenaWins ?? 0));
        },
        isDone: (p) => {
          const wins = (p?.arenaHistory || []).filter((h) => h.result === 'Victory').length;
          return Math.max(wins, Number(p?.stats?.arenaWins ?? 0)) >= 1;
        },
      },
      {
        id: 'c4-renown',
        label: 'Gain Order Renown with your Fellowship',
        target: 25,
        getProgress: (p) => Number(p?.guildRenown ?? 0),
        isDone: (p) => Number(p?.guildRenown ?? 0) >= 25,
      },
      {
        id: 'c4-level',
        label: 'Reach Player Level 6',
        target: 6,
        getProgress: (p) => Number(p?.stats?.level ?? 1),
        isDone: (p) => Number(p?.stats?.level ?? 1) >= 6,
      },
    ],
  },
  {
    id: 'chapter-5',
    chapterNumber: 5,
    title: 'Sovereign of the Estate',
    subtitle: 'Master of the Realm',
    lore: 'Your name echoes through tavern halls and regal council chambers. Upgrade your residence to an estate of grandeur and command seasoned expeditions.',
    badge: 'Imperial Sovereign',
    rewardGold: 4000,
    rewardXp: 3000,
    titleReward: 'Estate Sovereign',
    objectives: [
      {
        id: 'c5-expeditions',
        label: 'Complete 5 Frontier Expeditions',
        target: 5,
        getProgress: (p) => Number(p?.stats?.expeditionsCompleted ?? 0),
        isDone: (p) => Number(p?.stats?.expeditionsCompleted ?? 0) >= 5,
      },
      {
        id: 'c5-estate',
        label: 'Own Comfortable House (or 3 Residences)',
        target: 1,
        getProgress: (p) => ((p?.ownedHouses || []).includes('comfortable-house') || (p?.ownedHouses || []).length >= 3 ? 1 : 0),
        isDone: (p) => (p?.ownedHouses || []).includes('comfortable-house') || (p?.ownedHouses || []).length >= 3,
      },
      {
        id: 'c5-level',
        label: 'Reach Player Level 8',
        target: 8,
        getProgress: (p) => Number(p?.stats?.level ?? 1),
        isDone: (p) => Number(p?.stats?.level ?? 1) >= 8,
      },
    ],
  },
];

export const getChapterProgress = (chapter, profile) => {
  if (!chapter || !profile) return { completed: false, claimed: false, percent: 0, completedCount: 0, total: 0 };
  const total = chapter.objectives.length;
  let completedCount = 0;
  chapter.objectives.forEach((obj) => {
    if (obj.isDone(profile)) completedCount += 1;
  });
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const isClaimed = Array.isArray(profile?.claimedChapters) && profile.claimedChapters.includes(chapter.id);
  return {
    completed: completedCount === total,
    claimed: isClaimed,
    percent,
    completedCount,
    total,
  };
};
