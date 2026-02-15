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
