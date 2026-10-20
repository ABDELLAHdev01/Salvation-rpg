/**
 * Salvation RPG - The Adventurers' Guild Contract & Progression System
 * 
 * Provides domain logic for Guild Contracts, Main Adventures, and Exploration Discoveries.
 * Pure domain rules: stable IDs, prerequisite validation, repeatable policies,
 * and zero-duplication reward claiming designed for offline play and future server-authoritative online sync.
 */

export const GUILD_RANKS = [
  {
    id: 'recruit',
    name: 'Recruit',
    minRenown: 0,
    perk: 'Allowed entry to Adventurers\' Guild notice boards and basic hunting bounties.',
    badgeColor: '#a3a3a3',
  },
  {
    id: 'bronze',
    name: 'Bronze Adventurer',
    minRenown: 50,
    perk: '+5% combat knockback force and unlocked Cavern Seam exploration bounties.',
    badgeColor: '#cd7f32',
  },
  {
    id: 'silver',
    name: 'Silver Adventurer',
    minRenown: 150,
    perk: '+10% merchant valuation on gathered materials and unlocked Tempered Broadsword recipes.',
    badgeColor: '#c0c0c0',
  },
  {
    id: 'gold',
    name: 'Gold Adventurer',
    minRenown: 300,
    perk: 'Access to Shadowfang Stalker alpha bounties and +15 Max Health bonus.',
    badgeColor: '#ffd700',
  },
  {
    id: 'platinum',
    name: 'Platinum Adventurer',
    minRenown: 500,
    perk: 'Access to Deepforge Vault expeditions and 15% discount on all seeds at the Bazaar.',
    badgeColor: '#e5e4e2',
  },
  {
    id: 'mythic',
    name: 'Mythic Adventurer',
    minRenown: 800,
    perk: 'Honorary Vanguard of Salvation with full realm renown and master artisan blue-ribbon status.',
    badgeColor: '#a855f7',
  },
];

export const CONTRACT_CATEGORIES = {
  MAIN: 'main_adventure',
  GUILD: 'guild_contract',
  DISCOVERY: 'exploration_discovery',
};

export const CONTRACT_REGISTRY = [
  // =========================================================================
  // 1. MAIN ADVENTURES (Story & Realm Introduction)
  // =========================================================================
  {
    id: 'main_01_homestead_foundations',
    category: CONTRACT_CATEGORIES.MAIN,
    title: 'Warden of Sunforge',
    kicker: 'Main Story · Act I',
    summary: 'Tend the soil of your Sunforge Homestead estate. Harvest your first mature crop and deposit tools in the Vault Chest.',
    minRank: 'recruit',
    requiresTurnIn: false,
    objectives: [
      { id: 'harvest_turnip', label: 'Harvest mature farm crops', type: 'harvest_crop', target: 3, current: 0 },
      { id: 'stock_chest', label: 'Store supplies in the Vault Chest', type: 'open_chest', target: 1, current: 0 },
    ],
    rewards: {
      gold: 150,
      xp: 120,
      renown: 25,
      items: { 'seed-turnip': 3, 'health-potion': 1 },
    },
  },
  {
    id: 'main_02_road_to_city',
    category: CONTRACT_CATEGORIES.MAIN,
    title: 'The King\'s Highway',
    kicker: 'Main Story · Act I',
    summary: 'Trek through the left gate of your Homestead onto Sunforge West Road and arrive safely at the gates of Sunforge City.',
    minRank: 'recruit',
    requiresTurnIn: true,
    turnInNpc: 'Guild Warden Michelle',
    objectives: [
      { id: 'exit_left', label: 'Leave Homestead through the physical West Gate', type: 'zone_visit', targetZone: 'west_road', target: 1, current: 0 },
      { id: 'reach_city', label: 'Arrive at Sunforge City Plaza', type: 'zone_visit', targetZone: 'village', target: 1, current: 0 },
      { id: 'visit_guild', label: 'Register with The Adventurers\' Guild', type: 'visit_guild', target: 1, current: 0 },
    ],
    rewards: {
      gold: 250,
      xp: 200,
      renown: 40,
      items: { 'health-potion': 2, 'iron-bar': 2 },
    },
  },
  {
    id: 'main_03_deepforge_investigation',
    category: CONTRACT_CATEGORIES.MAIN,
    title: 'Echoes in the Deep',
    kicker: 'Main Story · Act II',
    summary: 'Delve into the Deepforge Caverns to extract raw iron ore and temper a combat blade at the artisan forge.',
    minRank: 'bronze',
    requiresTurnIn: true,
    turnInNpc: 'Blacksmith Elric',
    objectives: [
      { id: 'mine_iron', label: 'Mine Iron Ore nodes in Caverns', type: 'mine_ore', oreId: 'iron', target: 4, current: 0 },
      { id: 'forge_metal', label: 'Smelt an Iron Ingot at the Forge', type: 'craft_item', itemId: 'iron-bar', target: 2, current: 0 },
    ],
    rewards: {
      gold: 320,
      xp: 280,
      renown: 50,
      items: { 'copper-bar': 3, 'mystery-geode': 1 },
    },
  },

  // =========================================================================
  // 2. GUILD CONTRACTS (Jobs, Bounties, Deliveries)
  // =========================================================================
  {
    id: 'guild_01_slime_cull',
    category: CONTRACT_CATEGORIES.GUILD,
    title: 'Slime Infestation in the Grove',
    kicker: 'Guild Bounty · Whispering Woods',
    summary: 'Local gatherers report aggressive Emerald Slimes invading the berry patches. Cull the slimes and harvest their gel.',
    minRank: 'recruit',
    requiresTurnIn: true,
    turnInNpc: 'Guild Warden Michelle',
    objectives: [
      { id: 'kill_slimes', label: 'Defeat Emerald Slimes', type: 'defeat_enemy', enemyType: 'enemy_slime', target: 4, current: 0 },
    ],
    rewards: {
      gold: 140,
      xp: 110,
      renown: 20,
      items: { 'slime-gel': 2, 'seed-herb': 2 },
    },
  },
  {
    id: 'guild_02_wolf_menace',
    category: CONTRACT_CATEGORIES.GUILD,
    title: 'Shadowfang Stalker Threat',
    kicker: 'Guild Bounty · Forest Frontier',
    summary: 'Fierce Shadowfang Stalkers are prowling near the eastern roadway. Subdue the pack to safeguard trade caravans.',
    minRank: 'bronze',
    requiresTurnIn: true,
    turnInNpc: 'Guild Warden Michelle',
    objectives: [
      { id: 'kill_wolves', label: 'Defeat Shadowfang Stalkers', type: 'defeat_enemy', enemyType: 'enemy_wolf', target: 3, current: 0 },
    ],
    rewards: {
      gold: 220,
      xp: 180,
      renown: 35,
      items: { 'wolf-pelt': 2, 'health-potion': 1 },
    },
  },
  {
    id: 'guild_03_skeleton_guard',
    category: CONTRACT_CATEGORIES.GUILD,
    title: 'Rattling Bones of Drakmor',
    kicker: 'Guild Bounty · Cavern Depths',
    summary: 'Ancient Deepforge Skeletons have awakened inside the lower mineral tunnels. Put them back to eternal rest.',
    minRank: 'silver',
    requiresTurnIn: true,
    turnInNpc: 'Guild Warden Michelle',
    objectives: [
      { id: 'kill_skeletons', label: 'Defeat Deepforge Skeletons', type: 'defeat_enemy', enemyType: 'enemy_skeleton', target: 3, current: 0 },
    ],
    rewards: {
      gold: 340,
      xp: 260,
      renown: 45,
      items: { 'bone-shard': 3, 'iron-bar': 3 },
    },
  },
  {
    id: 'guild_04_goblin_raiders',
    category: CONTRACT_CATEGORIES.GUILD,
    title: 'Wildlands Goblin Outpost',
    kicker: 'Guild Bounty · Deep Caverns',
    summary: 'A band of swift Goblin Raiders is hoarding copper veins and stolen goods in the subterranean shadows. Repel their skirmishers.',
    minRank: 'gold',
    requiresTurnIn: true,
    turnInNpc: 'Guild Warden Michelle',
    objectives: [
      { id: 'kill_goblins', label: 'Defeat Goblin Raiders', type: 'defeat_enemy', enemyType: 'enemy_goblin', target: 3, current: 0 },
    ],
    rewards: {
      gold: 450,
      xp: 350,
      renown: 60,
      items: { 'contract-sigil': 1, 'gold-bar': 2 },
    },
  },
  {
    id: 'guild_05_medicinal_stockpile',
    category: CONTRACT_CATEGORIES.GUILD,
    title: 'Apothecary Supply Requisition',
    kicker: 'Guild Delivery · City Clinic',
    summary: 'The city healers require fresh moonberries and wild herbs to brew tonics for wounded border guards.',
    minRank: 'recruit',
    requiresTurnIn: true,
    turnInNpc: 'Trader Silas',
    objectives: [
      { id: 'gather_moonberries', label: 'Harvest Moonberries from farm plots', type: 'harvest_crop', cropId: 'moonberry', target: 3, current: 0 },
      { id: 'gather_herbs', label: 'Harvest Wild Herbs from farm plots', type: 'harvest_crop', cropId: 'herb', target: 3, current: 0 },
    ],
    rewards: {
      gold: 180,
      xp: 140,
      renown: 25,
      items: { 'health-potion': 2, 'seed-moonberry': 3 },
    },
  },

  // =========================================================================
  // 3. EXPLORATION DISCOVERIES (Hidden Shrines, Vistas, Landmarks)
  // =========================================================================
  {
    id: 'disc_01_sylvan_shrine',
    category: CONTRACT_CATEGORIES.DISCOVERY,
    title: 'The Whispering Runic Shrine',
    kicker: 'Discovery · Enchanted Grove',
    summary: 'Seek out the ancient runic obelisk nestled deep within the Whispering Woods to absorb its lingering arcane blessings.',
    minRank: 'recruit',
    requiresTurnIn: false,
    objectives: [
      { id: 'commune_shrine', label: 'Commune with the Sylvan Runic Shrine', type: 'interact_prop', propId: 'prop_shrine', target: 1, current: 0 },
    ],
    rewards: {
      gold: 100,
      xp: 150,
      renown: 30,
      items: { 'mystery-geode': 1 },
    },
  },
  {
    id: 'disc_02_west_road_milestone',
    category: CONTRACT_CATEGORIES.DISCOVERY,
    title: 'Sunforge West Milestone',
    kicker: 'Discovery · The King\'s Way',
    summary: 'Locate the ancient granite road sign on Sunforge West Road that marks the border between the wilderness and city lands.',
    minRank: 'recruit',
    requiresTurnIn: false,
    objectives: [
      { id: 'inspect_sign', label: 'Read the West Road Boundary Signpost', type: 'interact_prop', propId: 'prop_road_sign', target: 1, current: 0 },
    ],
    rewards: {
      gold: 80,
      xp: 100,
      renown: 20,
      items: { 'seed-wheat': 4 },
    },
  },
  {
    id: 'disc_03_deep_gold_seam',
    category: CONTRACT_CATEGORIES.DISCOVERY,
    title: 'The Mother Lode',
    kicker: 'Discovery · Cavern Seam',
    summary: 'Locate and shatter a glistening vein of raw Gold Ore in the depths of Deepforge Caverns.',
    minRank: 'bronze',
    requiresTurnIn: false,
    objectives: [
      { id: 'strike_gold', label: 'Strike and mine a Gold Ore deposit', type: 'mine_ore', oreId: 'gold', target: 1, current: 0 },
    ],
    rewards: {
      gold: 200,
      xp: 220,
      renown: 35,
      items: { 'gold-ore': 2 },
    },
  },
];

/**
 * Returns the current Guild Rank object based on earned renown score
 */
export function getGuildRank(renown = 0) {
  const safeRenown = Math.max(0, Number(renown) || 0);
  for (let i = GUILD_RANKS.length - 1; i >= 0; i--) {
    if (safeRenown >= GUILD_RANKS[i].minRenown) {
      return GUILD_RANKS[i];
    }
  }
  return GUILD_RANKS[0];
}

/**
 * Returns next rank and progress percent
 */
export function getGuildRankProgress(renown = 0) {
  const safeRenown = Math.max(0, Number(renown) || 0);
  const currentRank = getGuildRank(safeRenown);
  const currentIdx = GUILD_RANKS.findIndex((r) => r.id === currentRank.id);
  const nextRank = GUILD_RANKS[currentIdx + 1] || null;

  if (!nextRank) {
    return {
      currentRank,
      nextRank: null,
      renownNeeded: 0,
      progressPercent: 100,
    };
  }

  const range = nextRank.minRenown - currentRank.minRenown;
  const progressIntoRank = safeRenown - currentRank.minRenown;
  const progressPercent = Math.min(100, Math.max(0, Math.round((progressIntoRank / range) * 100)));

  return {
    currentRank,
    nextRank,
    renownNeeded: Math.max(0, nextRank.minRenown - safeRenown),
    progressPercent,
  };
}

/**
 * Verifies if player meets rank requirements for a contract
 */
export function isRankEligible(playerRankId, requiredRankId) {
  const rankOrder = GUILD_RANKS.map((r) => r.id);
  const playerIdx = rankOrder.indexOf(playerRankId);
  const reqIdx = rankOrder.indexOf(requiredRankId);
  return playerIdx >= reqIdx;
}

/**
 * Retrieves all registered contracts grouped by eligibility and status
 */
export function getGuildBoardState(profile = {}) {
  const renown = profile?.stats?.renown || 0;
  const rank = getGuildRank(renown);
  const activeContracts = Array.isArray(profile?.activeContracts) ? profile.activeContracts : [];
  const completedContracts = profile?.completedContracts && typeof profile.completedContracts === 'object'
    ? profile.completedContracts
    : {};

  const activeMap = new Map();
  activeContracts.forEach((c) => activeMap.set(c.id, c));

  const available = [];
  const active = [];
  const completed = [];

  CONTRACT_REGISTRY.forEach((def) => {
    const isCompleted = Boolean(completedContracts[def.id]);
    const activeInstance = activeMap.get(def.id);

    if (isCompleted) {
      completed.push({
        ...def,
        status: 'completed',
        completedAt: completedContracts[def.id],
      });
    } else if (activeInstance) {
      // Merge progress into objectives
      const mergedObjectives = def.objectives.map((obj) => {
        const matchingProgress = activeInstance.objectives?.find((o) => o.id === obj.id);
        const current = matchingProgress?.current || 0;
        return {
          ...obj,
          current,
          isFinished: current >= obj.target,
        };
      });

      const isAllFinished = mergedObjectives.every((o) => o.isFinished);
      active.push({
        ...def,
        status: isAllFinished ? 'ready_for_turnin' : 'in_progress',
        objectives: mergedObjectives,
        acceptedAt: activeInstance.acceptedAt || Date.now(),
      });
    } else {
      const eligible = isRankEligible(rank.id, def.minRank);
      available.push({
        ...def,
        status: eligible ? 'available' : 'locked',
        isEligible: eligible,
      });
    }
  });

  return {
    rank,
    renown,
    available,
    active,
    completed,
  };
}

/**
 * Pure function: Accepts a contract into profile
 */
export function acceptGuildContract(contractId, profile) {
  if (!profile) return { success: false, reason: 'Invalid profile.' };
  const def = CONTRACT_REGISTRY.find((c) => c.id === contractId);
  if (!def) return { success: false, reason: 'Contract not found in registry.' };

  const currentRank = getGuildRank(profile?.stats?.renown || 0);
  if (!isRankEligible(currentRank.id, def.minRank)) {
    return { success: false, reason: `Requires Guild Rank: ${getGuildRank(def.minRank).name}.` };
  }

  const activeContracts = Array.isArray(profile.activeContracts) ? [...profile.activeContracts] : [];
  if (activeContracts.some((c) => c.id === contractId)) {
    return { success: false, reason: 'Contract is already active.' };
  }
  if (profile.completedContracts?.[contractId]) {
    return { success: false, reason: 'Contract has already been completed.' };
  }

  const newActive = {
    id: def.id,
    acceptedAt: Date.now(),
    objectives: def.objectives.map((o) => ({ id: o.id, current: 0 })),
  };

  return {
    success: true,
    contract: def,
    updatedActiveContracts: [...activeContracts, newActive],
  };
}

/**
 * Pure function: Updates progress on active contracts from a gameplay event
 */
export function recordContractProgress(eventType, payload, activeContracts = []) {
  if (!Array.isArray(activeContracts) || activeContracts.length === 0) {
    return { updated: false, activeContracts, autoCompleted: [] };
  }

  let hasChanged = false;
  const nextActive = [];
  const autoCompleted = [];

  activeContracts.forEach((contract) => {
    const def = CONTRACT_REGISTRY.find((d) => d.id === contract.id);
    if (!def) {
      nextActive.push(contract);
      return;
    }

    let contractChanged = false;
    const nextObjectives = (contract.objectives || []).map((prog) => {
      const objDef = def.objectives.find((o) => o.id === prog.id);
      if (!objDef) return prog;
      if (prog.current >= objDef.target) return prog; // Already met

      let increment = 0;
      switch (objDef.type) {
        case 'defeat_enemy':
          if (eventType === 'combat:enemy_defeated' && payload?.enemyType === objDef.enemyType) {
            increment = 1;
          }
          break;
        case 'harvest_crop':
          if (eventType === 'farm:harvest' && (!objDef.cropId || payload?.cropId === objDef.cropId)) {
            increment = 1;
          }
          break;
        case 'mine_ore':
          if (eventType === 'mine:shatter' && (!objDef.oreId || payload?.oreId === objDef.oreId)) {
            increment = 1;
          }
          break;
        case 'craft_item':
          if (eventType === 'forge:crafted' && (!objDef.itemId || payload?.itemId === objDef.itemId)) {
            increment = payload?.count || 1;
          }
          break;
        case 'zone_visit':
          if (eventType === 'zone:changed' && payload?.zone === objDef.targetZone) {
            increment = 1;
          }
          break;
        case 'visit_guild':
          if (eventType === 'guild:visited') {
            increment = 1;
          }
          break;
        case 'open_chest':
          if (eventType === 'chest:open') {
            increment = 1;
          }
          break;
        case 'interact_prop':
          if (eventType === 'prop:interacted' && payload?.propId === objDef.propId) {
            increment = 1;
          }
          break;
        default:
          break;
      }

      if (increment > 0) {
        contractChanged = true;
        hasChanged = true;
        return {
          ...prog,
          current: Math.min(objDef.target, prog.current + increment),
        };
      }
      return prog;
    });

    const updatedContract = contractChanged
      ? { ...contract, objectives: nextObjectives }
      : contract;

    // Check if contract has just become fully finished
    const allFinished = def.objectives.every((objDef) => {
      const p = nextObjectives.find((o) => o.id === objDef.id);
      return (p?.current || 0) >= objDef.target;
    });

    if (allFinished && !def.requiresTurnIn) {
      autoCompleted.push(def.id);
    } else {
      nextActive.push(updatedContract);
    }
  });

  return {
    updated: hasChanged || autoCompleted.length > 0,
    activeContracts: nextActive,
    autoCompleted,
  };
}

/**
 * Pure function: Claims a completed contract reward safely
 */
export function claimContractReward(contractId, profile) {
  if (!profile) return { success: false, reason: 'Invalid profile.' };
  const def = CONTRACT_REGISTRY.find((c) => c.id === contractId);
  if (!def) return { success: false, reason: 'Contract definition not found.' };

  const completedMap = profile.completedContracts || {};
  if (completedMap[contractId]) {
    return { success: false, reason: 'Reward has already been claimed.' };
  }

  const activeList = Array.isArray(profile.activeContracts) ? profile.activeContracts : [];
  const activeInstance = activeList.find((c) => c.id === contractId);

  // Validate all objectives met
  const isSatisfied = def.objectives.every((obj) => {
    const prog = activeInstance?.objectives?.find((o) => o.id === obj.id);
    return (prog?.current || 0) >= obj.target;
  });

  if (!isSatisfied) {
    return { success: false, reason: 'Contract objectives have not been completed yet.' };
  }

  // Calculate updated stats
  const nextGold = (profile.stats?.gold || 0) + (def.rewards.gold || 0);
  const nextXp = (profile.stats?.xp || 0) + (def.rewards.xp || 0);
  const nextRenown = (profile.stats?.renown || 0) + (def.rewards.renown || 0);
  const nextQuests = (profile.stats?.quests || 0) + 1;

  // Add reward items into inventory
  const nextInventory = { ...(profile.inventory || {}) };
  if (def.rewards.items) {
    Object.entries(def.rewards.items).forEach(([itemId, qty]) => {
      nextInventory[itemId] = (nextInventory[itemId] || 0) + qty;
    });
  }

  const nextActive = activeList.filter((c) => c.id !== contractId);
  const nextCompleted = {
    ...completedMap,
    [contractId]: Date.now(),
  };

  return {
    success: true,
    contract: def,
    rewardsGranted: def.rewards,
    updatedProfile: {
      ...profile,
      stats: {
        ...profile.stats,
        gold: nextGold,
        xp: nextXp,
        renown: nextRenown,
        quests: nextQuests,
      },
      inventory: nextInventory,
      activeContracts: nextActive,
      completedContracts: nextCompleted,
    },
  };
}

export default {
  GUILD_RANKS,
  CONTRACT_CATEGORIES,
  CONTRACT_REGISTRY,
  getGuildRank,
  getGuildRankProgress,
  getGuildBoardState,
  acceptGuildContract,
  recordContractProgress,
  claimContractReward,
};
