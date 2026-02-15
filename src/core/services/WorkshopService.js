import authService from './AuthService';
import characterService from './CharacterService';
import {
  getWorkshopRecipe,
  getWorkshopRecipesForStation,
  getWorkshopStationsForLevel,
  getWorkshopXpForLevel,
  getWorkshopUpgrade,
  getNextWorkshopUpgrade,
} from '../data/workshopData';
import { addItems, getItemCount, removeItems } from './inventoryService';

const MOCK_AUTH = true;

const normalizeNumber = (value, fallback = 0) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
};

const normalizeInventory = (inventory) => {
  if (!inventory || typeof inventory !== 'object') {
    return {};
  }
  return Object.entries(inventory).reduce((acc, [key, amount]) => {
    const safeAmount = Math.max(0, Math.floor(normalizeNumber(amount, 0)));
    if (safeAmount > 0) {
      acc[key] = safeAmount;
    }
    return acc;
  }, {});
};

const normalizeQueue = (queue) => {
  if (!Array.isArray(queue)) {
    return [];
  }
  return queue
    .map((job) => {
      if (!job || typeof job !== 'object') {
        console.warn('Workshop queue contains invalid job payload.');
        return null;
      }
      const recipeId = typeof job.recipeId === 'string' ? job.recipeId : null;
      const quantity = Math.max(1, Math.floor(normalizeNumber(job.quantity, 1)));
      const startAt = normalizeNumber(job.startAt, 0);
      const finishAt = normalizeNumber(job.finishAt, 0);
      const zoneId = typeof job.zoneId === 'string' ? job.zoneId : null;
      if (!recipeId || !startAt || !finishAt || finishAt < startAt) {
        console.warn('Workshop queue contains malformed job data.', job);
        return null;
      }
      return {
        id: typeof job.id === 'string' ? job.id : `${recipeId}-${startAt}`,
        recipeId,
        quantity,
        startAt,
        finishAt,
        zoneId,
      };
    })
    .filter(Boolean);
};

const ensureWorkshopState = (profile) => {
  const safeProfile = profile || {};
  return {
    workshopLevel: Math.max(1, Math.floor(normalizeNumber(safeProfile.workshopLevel, 1))),
    workshopXp: Math.max(0, Math.floor(normalizeNumber(safeProfile.workshopXp, 0))),
    workshopUpgradeLevel: Math.max(1, Math.floor(normalizeNumber(safeProfile.workshopUpgradeLevel, 1))),
    workshopQueue: normalizeQueue(safeProfile.workshopQueue),
    workshopInventory: normalizeInventory(safeProfile.workshopInventory),
  };
};

const applyWorkshopXp = (workshopLevel, workshopXp, gain) => {
  let nextLevel = workshopLevel;
  let nextXp = workshopXp + gain;
  let target = getWorkshopXpForLevel(nextLevel);

  while (nextXp >= target) {
    nextXp -= target;
    nextLevel += 1;
    target = getWorkshopXpForLevel(nextLevel);
  }

  return { nextLevel, nextXp };
};

const getInventoryForSource = (profile) => profile.inventory || {};

const updateInventoryForSource = (profile, nextInventory) => ({
  ...profile,
  inventory: nextInventory,
});

const canAffordRecipe = (profile, recipe, quantity) => {
  if (!recipe || !profile) {
    return false;
  }
  const scaled = Math.max(1, Math.floor(quantity || 1));
  return recipe.inputs.every((input) => {
    const inventory = getInventoryForSource(profile);
    const owned = getItemCount(inventory, input.id);
    return owned >= input.amount * scaled;
  });
};

const consumeInputs = (profile, recipe, quantity) => {
  let nextProfile = { ...profile };
  const scaled = Math.max(1, Math.floor(quantity || 1));

  recipe.inputs.forEach((input) => {
    const inventory = getInventoryForSource(nextProfile);
    const cost = input.amount * scaled;
    const nextInventory = removeItems(inventory, { [input.id]: cost });
    nextProfile = updateInventoryForSource(nextProfile, nextInventory);
  });

  return nextProfile;
};

const grantOutputs = (profile, recipe, quantity) => {
  let nextInventory = { ...(profile.inventory || {}) };
  const scaled = Math.max(1, Math.floor(quantity || 1));

  recipe.outputs.forEach((output) => {
    const amount = output.amount * scaled;
    nextInventory = addItems(nextInventory, { [output.id]: amount });
  });

  return { ...profile, inventory: nextInventory };
};

const buildJob = ({ recipeId, quantity, startAt, durationMultiplier }) => {
  const recipe = getWorkshopRecipe(recipeId);
  if (!recipe) {
    return null;
  }
  const scaled = Math.max(1, Math.floor(quantity || 1));
  const duration = Math.max(1000, Math.round(recipe.durationMs * scaled * durationMultiplier));
  return {
    id: `${recipeId}-${startAt}-${Math.random().toString(36).slice(2, 8)}`,
    recipeId,
    quantity: scaled,
    startAt,
    finishAt: startAt + duration,
  };
};

const getUsername = () => (MOCK_AUTH ? authService.getCurrentUsername() : null);

const getProfile = () => {
  const username = getUsername();
  if (!username) {
    return null;
  }
  return characterService.getMockProfile(username);
};

const persistProfile = (profile) => {
  if (!profile) {
    return null;
  }
  return characterService.updateMockProfile(profile);
};

const processWorkshopQueue = ({ now = Date.now() } = {}) => {
  const profile = getProfile();
  if (!profile) {
    return { profile: null, completedJobs: [] };
  }

  const workshopState = ensureWorkshopState(profile);
  let queue = [...workshopState.workshopQueue].sort((a, b) => a.startAt - b.startAt);
  if (queue.length === 0) {
    return { profile, completedJobs: [] };
  }

  let nextProfile = { ...profile, ...workshopState };
  const completedJobs = [];

  queue.forEach((job) => {
    if (job.finishAt > now) {
      return;
    }
    const recipe = getWorkshopRecipe(job.recipeId);
    if (!recipe) {
      console.warn('Workshop recipe missing for queued job:', job.recipeId);
      completedJobs.push(job);
      return;
    }

    const xpGain = Math.max(1, Math.round(recipe.xp * job.quantity));
    nextProfile = grantOutputs(nextProfile, recipe, job.quantity);
    const { nextLevel, nextXp } = applyWorkshopXp(
      nextProfile.workshopLevel,
      nextProfile.workshopXp,
      xpGain
    );
    nextProfile = {
      ...nextProfile,
      workshopLevel: nextLevel,
      workshopXp: nextXp,
    };
    completedJobs.push(job);
  });

  if (completedJobs.length === 0) {
    return { profile, completedJobs: [] };
  }

  const remainingQueue = queue.filter((job) => !completedJobs.find((done) => done.id === job.id));
  const updated = persistProfile({
    ...nextProfile,
    workshopQueue: remainingQueue,
  });

  return { profile: updated, completedJobs };
};

const queueWorkshopJob = ({ recipeId, quantity = 1, now = Date.now() } = {}) => {
  const profile = getProfile();
  if (!profile) {
    return { ok: false, reason: 'No profile found.' };
  }

  const workshopState = ensureWorkshopState(profile);
  const recipe = getWorkshopRecipe(recipeId);
  if (!recipe) {
    return { ok: false, reason: 'Recipe not found.' };
  }
  if (workshopState.workshopLevel < (recipe.levelRequired || 1)) {
    return { ok: false, reason: 'Workshop level too low.' };
  }
  const stations = getWorkshopStationsForLevel(workshopState.workshopLevel);
  if (!stations.find((station) => station.id === recipe.station)) {
    return { ok: false, reason: 'Station not unlocked.' };
  }
  if (!canAffordRecipe(profile, recipe, quantity)) {
    return { ok: false, reason: 'Not enough resources.' };
  }

  const upgrade = getWorkshopUpgrade(workshopState.workshopUpgradeLevel);
  const queue = [...workshopState.workshopQueue].sort((a, b) => a.finishAt - b.finishAt);
  const lastFinishAt = queue.length > 0 ? queue[queue.length - 1].finishAt : now;
  const startAt = Math.max(now, lastFinishAt);
  const totalDurationMultiplier = upgrade.durationMultiplier || 1;
  const job = buildJob({
    recipeId,
    quantity,
    startAt,
    durationMultiplier: totalDurationMultiplier,
  });

  if (!job) {
    return { ok: false, reason: 'Failed to build job.' };
  }

  let nextProfile = consumeInputs(profile, recipe, quantity);
  nextProfile = {
    ...nextProfile,
    ...workshopState,
    workshopQueue: [...queue, job],
  };

  const updated = persistProfile(nextProfile);
  return { ok: true, profile: updated, job };
};

const upgradeWorkshop = () => {
  const profile = getProfile();
  if (!profile) {
    return { ok: false, reason: 'No profile found.' };
  }

  const workshopState = ensureWorkshopState(profile);
  const nextUpgrade = getNextWorkshopUpgrade(workshopState.workshopUpgradeLevel);
  if (!nextUpgrade) {
    return { ok: false, reason: 'Max upgrade reached.' };
  }

  const currentGold = profile.stats?.gold ?? 0;
  if (currentGold < nextUpgrade.cost) {
    return { ok: false, reason: 'Not enough gold.' };
  }

  const updated = persistProfile({
    ...profile,
    ...workshopState,
    workshopUpgradeLevel: nextUpgrade.level,
    stats: {
      ...profile.stats,
      gold: currentGold - nextUpgrade.cost,
    },
  });

  return { ok: true, profile: updated, upgrade: nextUpgrade };
};

const getWorkshopUiState = ({ profile, now = Date.now() } = {}) => {
  const currentProfile = profile || getProfile();
  if (!currentProfile) {
    return null;
  }

  const state = ensureWorkshopState(currentProfile);
  const stations = getWorkshopStationsForLevel(state.workshopLevel);
  const recipes = stations.reduce((acc, station) => {
    acc[station.id] = getWorkshopRecipesForStation(station.id, state.workshopLevel);
    return acc;
  }, {});

  const jobs = state.workshopQueue.map((job) => {
    const remainingMs = Math.max(0, job.finishAt - now);
    return { ...job, remainingMs };
  });

  return {
    ...state,
    stations,
    recipes,
    jobs,
  };
};

export default {
  ensureWorkshopState,
  processWorkshopQueue,
  queueWorkshopJob,
  upgradeWorkshop,
  getWorkshopUiState,
};
