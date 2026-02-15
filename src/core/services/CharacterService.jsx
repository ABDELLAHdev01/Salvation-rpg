import toast from 'react-hot-toast';
import authService from './AuthService';
import { getSeedItemId } from '../data/itemsCatalog';
import { applyInventoryDelta, normalizeInventory } from './inventoryService';

const MOCK_AUTH = true;
const MOCK_CHARACTERS_KEY = 'mockCharacters';
const MOCK_PROFILES_KEY = 'mockProfiles';
const RACE_CHANGE_COST = 500;
const MOCK_CLASS_BY_RACE = {
  human: 'Vanguard',
  elf: 'Arcwarden',
  orc: 'Warbrute',
  dwarf: 'Stoneguard',
  vampire: 'Bloodcaller',
  werewolf: 'Moonfang',
};

const defaultStats = {
  level: 1,
  xp: 0,
  power: 120,
  gold: 350,
  quests: 3,
  victories: 2,
  renown: 48,
  expeditionsCompleted: 0,
};

const buildGeneralMissionsMeta = (profile) => {
  const stats = profile?.stats || {};
  const ownedHouses = Array.isArray(profile?.ownedHouses) ? profile.ownedHouses : ['starter-cottage'];
  return {
    playerLevel: stats.level ?? 1,
    farmLevel: profile?.farmLevel ?? 1,
    miningLevel: profile?.miningLevel ?? 1,
    houseCount: ownedHouses.length,
  };
};

const stripZoneFields = (profile) => {
  if (!profile) {
    return profile;
  }
  const { activeZoneId, unlockedZones, ...rest } = profile;
  return rest;
};

const mergeInventoryMaps = (base, addition) => {
  if (!addition || typeof addition !== 'object') {
    return base;
  }
  return applyInventoryDelta(base, addition);
};

const buildInventoryFromLegacy = (profile) => {
  const safeProfile = profile || {};
  let nextInventory = normalizeInventory(safeProfile.inventory);

  nextInventory = mergeInventoryMaps(nextInventory, safeProfile.miningInventory);
  nextInventory = mergeInventoryMaps(nextInventory, safeProfile.farmInventory);
  nextInventory = mergeInventoryMaps(nextInventory, safeProfile.workshopInventory);
  nextInventory = mergeInventoryMaps(nextInventory, safeProfile.miningBoosters);

  if (safeProfile.farmSeeds && typeof safeProfile.farmSeeds === 'object') {
    const seedMap = Object.entries(safeProfile.farmSeeds).reduce((acc, [cropId, amount]) => {
      const seedId = getSeedItemId(cropId);
      acc[seedId] = (acc[seedId] || 0) + Number(amount || 0);
      return acc;
    }, {});
    nextInventory = mergeInventoryMaps(nextInventory, seedMap);
  }

  if (safeProfile.miningContractTokens) {
    nextInventory = mergeInventoryMaps(nextInventory, {
      'contract-sigil': safeProfile.miningContractTokens,
    });
  }

  return normalizeInventory(nextInventory);
};

const getMockCharacters = () => {
  try {
    const raw = localStorage.getItem(MOCK_CHARACTERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const setMockCharacters = (characters) => {
  localStorage.setItem(MOCK_CHARACTERS_KEY, JSON.stringify(characters));
};

const getMockProfiles = () => {
  try {
    const raw = localStorage.getItem(MOCK_PROFILES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const setMockProfiles = (profiles) => {
  localStorage.setItem(MOCK_PROFILES_KEY, JSON.stringify(profiles));
};

class CharacterService {
  async createCharacter(characterData) {
    if (MOCK_AUTH) {
      const username = authService.getCurrentUsername();

      if (!username) {
        const message = 'No mock session found.';
        toast.error(message);
        throw new Error(message);
      }

      const characters = getMockCharacters();
      const raceKey = characterData.raceKey || characterData.race?.toLowerCase() || 'human';
      const imageKey = characterData.imageKey || null;
      const avatarUrl = raceKey && imageKey ? `/raceicon/${raceKey}_${imageKey}.webp` : '/raceicon/noimage.webp';

      characters[username] = {
        ...characterData,
        userId: username,
        className: characterData.className || MOCK_CLASS_BY_RACE[raceKey] || 'Adventurer',
        avatarUrl,
      };
      setMockCharacters(characters);

      const profiles = getMockProfiles();
      if (!profiles[username]) {
        const baseProfile = {
          username,
          stats: { ...defaultStats },
          title: 'Warden Initiate',
          bio: 'A quiet traveler sworn to the Sunforge, seeking relics and renown.',
          houseId: 'starter-cottage',
          ownedHouses: ['starter-cottage'],
          miningLevel: 1,
          miningXp: 0,
          pickaxeLevel: 1,
          miningForgeLevel: 1,
          miningPrestigeLevel: 0,
          activeMiningBoost: null,
          miningBoosterCooldowns: {},
          miningAutoClaim: false,
          miningCooldownUntil: 0,
          miningContracts: null,
          miningHirelings: [],
          inventory: {},
          miningSession: null,
          lastMiningResult: null,
          miningClickState: null,
          farmLandSize: 3,
          farmPlots: [],
          farmAnimals: {},
          farmLevel: 1,
          farmXp: 0,
          farmTasks: null,
          farmWeather: null,
          workshopLevel: 1,
          workshopXp: 0,
          workshopUpgradeLevel: 1,
          workshopQueue: [],
          generalMissions: [],
          createdAt: Date.now(),
        };
        baseProfile.generalMissionsMeta = buildGeneralMissionsMeta(baseProfile);
        profiles[username] = baseProfile;
      } else {
        profiles[username] = {
          ...profiles[username],
          miningSession: null,
          miningCooldownUntil: 0,
          miningAutoClaim: false,
          lastMiningResult: null,
        };
      }
      setMockProfiles(profiles);
      toast.success('Character created successfully!');
      return characters[username];
    }
  }

  async updateCharacter(updateData) {
    if (MOCK_AUTH) {
      const username = authService.getCurrentUsername();

      if (!username) {
        const message = 'No mock session found.';
        toast.error(message);
        throw new Error(message);
      }

      const characters = getMockCharacters();
      const existing = characters[username];

      if (!existing) {
        const message = 'No character found to update.';
        toast.error(message);
        throw new Error(message);
      }

      const profiles = getMockProfiles();
      if (!profiles[username]) {
        const baseProfile = {
          username,
          stats: { ...defaultStats },
          title: 'Warden Initiate',
          bio: 'A quiet traveler sworn to the Sunforge, seeking relics and renown.',
          houseId: 'starter-cottage',
          ownedHouses: ['starter-cottage'],
          miningLevel: 1,
          miningXp: 0,
          pickaxeLevel: 1,
          miningForgeLevel: 1,
          miningPrestigeLevel: 0,
          activeMiningBoost: null,
          miningBoosterCooldowns: {},
          miningAutoClaim: false,
          miningCooldownUntil: 0,
          miningContracts: null,
          miningHirelings: [],
          inventory: {},
          miningSession: null,
          lastMiningResult: null,
          miningClickState: null,
          farmLandSize: 3,
          farmPlots: [],
          farmAnimals: {},
          farmLevel: 1,
          farmXp: 0,
          farmTasks: null,
          farmWeather: null,
          workshopLevel: 1,
          workshopXp: 0,
          workshopUpgradeLevel: 1,
          workshopQueue: [],
          generalMissions: [],
          createdAt: Date.now(),
        };
        baseProfile.generalMissionsMeta = buildGeneralMissionsMeta(baseProfile);
        profiles[username] = baseProfile;
      }

      const previousRaceKey = existing.raceKey || existing.race?.toLowerCase() || null;
      const nextRaceKey = updateData.raceKey || previousRaceKey;
      const isRaceChange = nextRaceKey && previousRaceKey && nextRaceKey !== previousRaceKey;

      if (isRaceChange) {
        const currentGold = profiles[username]?.stats?.gold ?? 0;
        if (currentGold < RACE_CHANGE_COST) {
          const message = `Not enough gold. ${RACE_CHANGE_COST} gold required to change race.`;
          toast.error(message);
          throw new Error(message);
        }
        profiles[username].stats = {
          ...profiles[username].stats,
          gold: currentGold - RACE_CHANGE_COST,
        };
      }

      const nextImageKey = updateData.imageKey || existing.imageKey || null;
      const avatarUrl = nextRaceKey && nextImageKey
        ? `/raceicon/${nextRaceKey}_${nextImageKey}.webp`
        : existing.avatarUrl || '/raceicon/noimage.webp';

      characters[username] = {
        ...existing,
        ...updateData,
        race: updateData.race || (nextRaceKey ? nextRaceKey.toUpperCase() : existing.race),
        raceKey: nextRaceKey,
        imageKey: nextImageKey,
        avatarUrl,
      };

      setMockCharacters(characters);
      setMockProfiles(profiles);
      toast.success('Character updated successfully!');
      return characters[username];
    }

    const message = 'Character editing is not supported yet.';
    toast.error(message);
    throw new Error(message);
  }

  hasMockCharacter(username) {
    if (!MOCK_AUTH || !username) {
      return false;
    }

    const characters = getMockCharacters();
    return !!characters[username];
  }

  getMockCharacter(username) {
    if (!MOCK_AUTH || !username) {
      return null;
    }

    const characters = getMockCharacters();
    return characters[username] || null;
  }

  getMockProfile(username) {
    if (!MOCK_AUTH || !username) {
      return null;
    }

    const profiles = getMockProfiles();
    if (!profiles[username]) {
      profiles[username] = {
        username,
        stats: { ...defaultStats },
        houseId: 'starter-cottage',
        ownedHouses: ['starter-cottage'],
        miningLevel: 1,
        miningXp: 0,
        pickaxeLevel: 1,
        miningForgeLevel: 1,
        miningPrestigeLevel: 0,
        activeMiningBoost: null,
        miningBoosterCooldowns: {},
        miningAutoClaim: false,
        miningCooldownUntil: 0,
        miningContracts: null,
        miningHirelings: [],
        inventory: {},
        miningSession: null,
        lastMiningResult: null,
        farmLandSize: 3,
        farmPlots: [],
        farmAnimals: {},
        farmLevel: 1,
        farmXp: 0,
        workshopLevel: 1,
        workshopXp: 0,
        workshopUpgradeLevel: 1,
        workshopQueue: [],
        createdAt: Date.now(),
      };
      profiles[username] = stripZoneFields(profiles[username]);
      setMockProfiles(profiles);
    } else {
      const current = profiles[username];
      const resetKey = `profileSystemReset:${username}`;
      const shouldResetSystems = !localStorage.getItem(resetKey);

      if (shouldResetSystems) {
        const resetProfile = {
          username,
          stats: { ...defaultStats },
          title: current.title || 'Warden Initiate',
          bio: current.bio || 'A quiet traveler sworn to the Sunforge, seeking relics and renown.',
          houseId: 'starter-cottage',
          ownedHouses: ['starter-cottage'],
          miningLevel: 1,
          miningXp: 0,
          pickaxeLevel: 1,
          miningForgeLevel: 1,
          miningPrestigeLevel: 0,
          activeMiningBoost: null,
          miningBoosterCooldowns: {},
          miningAutoClaim: false,
          miningCooldownUntil: 0,
          miningContracts: null,
          miningHirelings: [],
          inventory: buildInventoryFromLegacy(current),
          miningSession: null,
          lastMiningResult: null,
          farmLandSize: 3,
          farmPlots: [],
          farmAnimals: {},
          farmLevel: 1,
          farmXp: 0,
          farmTasks: null,
          farmWeather: null,
          workshopLevel: 1,
          workshopXp: 0,
          workshopUpgradeLevel: 1,
          workshopQueue: [],
          generalMissions: [],
          createdAt: current.createdAt || Date.now(),
        };
        resetProfile.generalMissionsMeta = buildGeneralMissionsMeta(resetProfile);
        profiles[username] = stripZoneFields(resetProfile);
        localStorage.removeItem(`expeditionSession:${username}`);
        localStorage.setItem(resetKey, 'true');
        setMockProfiles(profiles);
      }

      const needsHouse = !current.houseId || !Array.isArray(current.ownedHouses);
      const needsStats =
        !current.stats ||
        current.stats.level == null ||
        current.stats.gold == null ||
        current.stats.xp == null ||
        current.stats.expeditionsCompleted == null;
      const needsMining =
        current.miningLevel == null ||
        current.miningXp == null ||
        current.pickaxeLevel == null ||
        current.miningForgeLevel == null ||
        current.miningPrestigeLevel == null ||
        current.miningBoosterCooldowns == null ||
        current.miningAutoClaim == null ||
        current.miningCooldownUntil == null ||
        current.miningContracts == null ||
        current.miningHirelings == null;

      const needsFarm =
        current.farmLandSize == null ||
        !Array.isArray(current.farmPlots) ||
        current.farmAnimals == null ||
        current.farmLevel == null ||
        current.farmXp == null ||
        current.farmTasks == null ||
        current.farmWeather == null ||
        current.generalMissions == null ||
        current.generalMissionsMeta == null;

      const needsWorkshop =
        current.workshopLevel == null ||
        current.workshopXp == null ||
        current.workshopUpgradeLevel == null ||
        current.workshopQueue == null;

      const needsInventory = current.inventory == null;

      if (needsHouse || needsMining || needsFarm || needsWorkshop || needsStats || needsInventory) {
        const nextProfile = {
          ...current,
          stats: {
            ...defaultStats,
            ...current.stats,
            xp: current.stats?.xp ?? 0,
            expeditionsCompleted: current.stats?.expeditionsCompleted ?? 0,
          },
          houseId: current.houseId || 'starter-cottage',
          ownedHouses: Array.isArray(current.ownedHouses) ? current.ownedHouses : ['starter-cottage'],
          miningLevel: current.miningLevel ?? 1,
          miningXp: current.miningXp ?? 0,
          pickaxeLevel: current.pickaxeLevel ?? 1,
          miningForgeLevel: current.miningForgeLevel ?? 1,
          miningPrestigeLevel: current.miningPrestigeLevel ?? 0,
          activeMiningBoost: current.activeMiningBoost || null,
          miningBoosterCooldowns: current.miningBoosterCooldowns || {},
          miningAutoClaim: current.miningAutoClaim ?? false,
          miningCooldownUntil: current.miningCooldownUntil ?? 0,
          miningContracts: current.miningContracts || null,
          miningHirelings: current.miningHirelings || [],
          inventory: buildInventoryFromLegacy(current),
          miningSession: current.miningSession || null,
          lastMiningResult: current.lastMiningResult || null,
          farmLandSize: current.farmLandSize ?? 3,
          farmPlots: Array.isArray(current.farmPlots) ? current.farmPlots : [],
          farmAnimals: current.farmAnimals || {},
          farmLevel: current.farmLevel ?? 1,
          farmXp: current.farmXp ?? 0,
          farmTasks: current.farmTasks || null,
          farmWeather: current.farmWeather || null,
          workshopLevel: current.workshopLevel ?? 1,
          workshopXp: current.workshopXp ?? 0,
          workshopUpgradeLevel: current.workshopUpgradeLevel ?? 1,
          workshopQueue: Array.isArray(current.workshopQueue) ? current.workshopQueue : [],
          generalMissions: current.generalMissions || [],
        };
        nextProfile.generalMissionsMeta =
          current.generalMissionsMeta || buildGeneralMissionsMeta(nextProfile);
        profiles[username] = stripZoneFields(nextProfile);
        setMockProfiles(profiles);
      }
    }

    return profiles[username];
  }

  updateMockProfile(profileData) {
    if (!MOCK_AUTH) {
      return null;
    }

    const username = authService.getCurrentUsername();
    if (!username) {
      return null;
    }

    const profiles = getMockProfiles();
    const existing = profiles[username] || {
      username,
      stats: { ...defaultStats },
      title: 'Warden Initiate',
      bio: 'A quiet traveler sworn to the Sunforge, seeking relics and renown.',
      houseId: 'starter-cottage',
      ownedHouses: ['starter-cottage'],
      miningLevel: 1,
      miningXp: 0,
      pickaxeLevel: 1,
      miningForgeLevel: 1,
      miningPrestigeLevel: 0,
      activeMiningBoost: null,
      miningBoosterCooldowns: {},
      miningAutoClaim: false,
      miningCooldownUntil: 0,
      miningContracts: null,
      miningHirelings: [],
      inventory: {},
      miningSession: null,
      lastMiningResult: null,
      farmLandSize: 3,
      farmPlots: [],
      farmAnimals: {},
      farmLevel: 1,
      farmXp: 0,
      farmTasks: null,
      farmWeather: null,
      workshopLevel: 1,
      workshopXp: 0,
      workshopUpgradeLevel: 1,
      workshopQueue: [],
      generalMissions: [],
      createdAt: Date.now(),
    };

    if (!existing.generalMissionsMeta) {
      existing.generalMissionsMeta = buildGeneralMissionsMeta(existing);
    }

    profiles[username] = stripZoneFields({
      ...existing,
      ...profileData,
    });

    if (!profiles[username].inventory) {
      profiles[username].inventory = buildInventoryFromLegacy(profiles[username]);
    }

    profiles[username] = stripZoneFields(profiles[username]);

    if (!profiles[username].generalMissionsMeta) {
      profiles[username].generalMissionsMeta = buildGeneralMissionsMeta(profiles[username]);
    }

    setMockProfiles(profiles);
    return profiles[username];
  }
}

export default new CharacterService();
