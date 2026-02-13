import { housingTiers } from './housingData';

const buildMissionId = (type, targetKey) => `${type}-${targetKey}-${Date.now()}`;

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
  const ownedHouses = profile?.ownedHouses || ['starter-cottage'];
  return {
    playerLevel: stats.level ?? 1,
    farmLevel: profile?.farmLevel ?? 1,
    miningLevel: profile?.miningLevel ?? 1,
    houseCount: ownedHouses.length,
    expeditionsCompleted: stats.expeditionsCompleted ?? 0,
  };
};

const buildMissions = (profile) => {
  const stats = profile?.stats || {};
  const ownedHouses = profile?.ownedHouses || ['starter-cottage'];
  const playerLevel = stats.level ?? 1;
  const expeditionsCompleted = stats.expeditionsCompleted ?? 0;
  const farmLevel = profile?.farmLevel ?? 1;
  const miningLevel = profile?.miningLevel ?? 1;
  const nextHouse = getNextHouse(ownedHouses);

  const playerTarget = getLevelTarget(playerLevel, playerLevel < 10 ? 2 : 3);
  const expeditionTarget = Math.max(1, expeditionsCompleted + (expeditionsCompleted < 5 ? 2 : 3));
  const farmTarget = getLevelTarget(farmLevel, farmLevel < 10 ? 1 : 2);
  const miningTarget = getLevelTarget(miningLevel, miningLevel < 10 ? 1 : 2);
  const playerScale = getRewardScale(playerTarget);
  const farmScale = getRewardScale(farmTarget);
  const miningScale = getRewardScale(miningTarget);
  const expeditionScale = getRewardScale(expeditionTarget);

  const missions = [
    {
      id: buildMissionId('player-level', playerTarget),
      type: 'player-level',
      label: `Reach player level ${playerTarget}`,
      target: playerTarget,
      rewardGold: Math.round((150 + playerTarget * 25) * playerScale),
      rewardXp: Math.round((140 + playerTarget * 35) * playerScale),
      rewardLevels: 1,
      claimed: false,
    },
    {
      id: buildMissionId('farm-level', farmTarget),
      type: 'farm-level',
      label: `Reach farm level ${farmTarget}`,
      target: farmTarget,
      rewardGold: Math.round((120 + farmTarget * 20) * farmScale),
      rewardXp: Math.round((120 + farmTarget * 30) * farmScale),
      rewardLevels: 1,
      claimed: false,
    },
    {
      id: buildMissionId('mining-level', miningTarget),
      type: 'mining-level',
      label: `Reach mining level ${miningTarget}`,
      target: miningTarget,
      rewardGold: Math.round((120 + miningTarget * 20) * miningScale),
      rewardXp: Math.round((120 + miningTarget * 30) * miningScale),
      rewardLevels: 1,
      claimed: false,
    },
    {
      id: buildMissionId('expeditions', expeditionTarget),
      type: 'expeditions',
      label: `Complete ${expeditionTarget} expeditions`,
      target: expeditionTarget,
      rewardGold: Math.round((140 + expeditionTarget * 45) * expeditionScale),
      rewardXp: Math.round((130 + expeditionTarget * 40) * expeditionScale),
      rewardLevels: 1,
      claimed: false,
    },
  ];

  if (nextHouse) {
    const houseScale = getHouseRewardScale(nextHouse.price);
    missions.push({
      id: buildMissionId('house', nextHouse.id),
      type: 'house',
      label: `Own the ${nextHouse.name}`,
      target: nextHouse.id,
      rewardGold: Math.round((200 + Math.round(nextHouse.price * 0.35)) * houseScale),
      rewardXp: Math.round((200 + Math.round(nextHouse.price * 0.2)) * houseScale),
      rewardLevels: 1,
      claimed: false,
    });
  } else {
    missions.push({
      id: buildMissionId('house', 'complete'),
      type: 'house',
      label: 'Own all available houses',
      target: 'complete',
      rewardGold: 0,
      rewardXp: 0,
      rewardLevels: 0,
      claimed: true,
    });
  }

  return missions;
};

export const ensureGeneralMissions = (missions, profile, meta) => {
  const nextMeta = buildMissionMeta(profile);

  if (!Array.isArray(missions) || missions.length === 0) {
    return { nextMissions: buildMissions(profile), nextMeta, changed: true };
  }

  const allClaimed = missions.every((mission) => mission.claimed);
  const progressed =
    meta &&
    (nextMeta.playerLevel > meta.playerLevel ||
      nextMeta.farmLevel > meta.farmLevel ||
      nextMeta.miningLevel > meta.miningLevel ||
      nextMeta.houseCount > meta.houseCount ||
      nextMeta.expeditionsCompleted > meta.expeditionsCompleted);

  if (allClaimed || progressed) {
    return { nextMissions: buildMissions(profile), nextMeta, changed: true };
  }

  if (!meta) {
    return { nextMissions: missions, nextMeta, changed: true };
  }

  return { nextMissions: missions, nextMeta: meta, changed: false };
};

export const getMissionProgress = (mission, profile) => {
  const stats = profile?.stats || {};
  const ownedHouses = profile?.ownedHouses || ['starter-cottage'];
  switch (mission.type) {
    case 'player-level':
      return stats.level ?? 1;
    case 'farm-level':
      return profile?.farmLevel ?? 1;
    case 'mining-level':
      return profile?.miningLevel ?? 1;
    case 'house':
      return ownedHouses.includes(mission.target) ? 1 : 0;
    case 'expeditions':
      return stats.expeditionsCompleted ?? 0;
    default:
      return 0;
  }
};

export const isMissionComplete = (mission, profile) => {
  if (mission.type === 'house') {
    return (profile?.ownedHouses || []).includes(mission.target) || mission.target === 'complete';
  }

  const progress = getMissionProgress(mission, profile);
  return progress >= mission.target;
};
