import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import XpBar from '../components/XpBar';
import authService from '../services/AuthService';
import characterService from '../services/CharacterService';
import WorkshopService from '../services/WorkshopService';
import {
  getWorkshopItem,
  getWorkshopRecipe,
  getWorkshopXpForLevel,
  getWorkshopUpgrade,
  getNextWorkshopUpgrade,
  workshopStations,
  workshopItems,
} from '../data/workshopData';
import { miningOres, formatDuration } from '../data/miningData';
import { farmGoods } from '../data/farmData';
import { getItemCount, removeItems } from '../services/inventoryService';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';
const FILTER_STORAGE_KEY = 'workshopFilters';

const buildNameMap = (items) =>
  items.reduce((acc, item) => {
    acc[item.id] = item.name;
    return acc;
  }, {});

const clampQuantity = (value, fallback = 1) => {
  const next = Number(value);
  if (!Number.isFinite(next)) {
    return fallback;
  }
  return Math.max(1, Math.floor(next));
};

export default function Workshop() {
  const [profile, setProfile] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [quantities, setQuantities] = useState({});
  const [stationFilter, setStationFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [showCraftableOnly, setShowCraftableOnly] = useState(false);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!MOCK_AUTH) {
      return;
    }

    const stored = localStorage.getItem(FILTER_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.stationFilter) {
          setStationFilter(parsed.stationFilter);
        }
        if (parsed?.tagFilter) {
          setTagFilter(parsed.tagFilter);
        }
        if (typeof parsed?.searchTerm === 'string') {
          setSearchTerm(parsed.searchTerm);
        }
        if (typeof parsed?.showCraftableOnly === 'boolean') {
          setShowCraftableOnly(parsed.showCraftableOnly);
        }
      } catch {
        localStorage.removeItem(FILTER_STORAGE_KEY);
      }
    }

    const username = authService.getCurrentUsername();
    if (!username) {
      return;
    }

    const nextProfile = characterService.getMockProfile(username);
    setProfile(nextProfile);

    const processed = WorkshopService.processWorkshopQueue({ now: Date.now() });
    if (processed.profile) {
      setProfile(processed.profile);
    }

    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!hasMountedRef.current) {
      return;
    }
    const payload = {
      stationFilter,
      tagFilter,
      searchTerm,
      showCraftableOnly,
    };
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(payload));
  }, [stationFilter, tagFilter, searchTerm, showCraftableOnly]);

  useEffect(() => {
    if (!profile?.workshopQueue?.length) {
      return;
    }

    const nextFinish = Math.min(...profile.workshopQueue.map((job) => job.finishAt));
    if (nextFinish <= now) {
      const processed = WorkshopService.processWorkshopQueue({ now });
      if (processed.profile) {
        setProfile(processed.profile);
      }
      if (hasMountedRef.current && processed.completedJobs?.length) {
        toast.success(`Workshop complete: ${processed.completedJobs.length} craft(s) ready.`);
      }
    }
  }, [now, profile]);

  useEffect(() => {
    hasMountedRef.current = true;
  }, []);

  const miningNames = useMemo(() => buildNameMap(miningOres), []);
  const farmNames = useMemo(() => buildNameMap(farmGoods), []);

  const uiState = useMemo(() => WorkshopService.getWorkshopUiState({ profile, now }), [profile, now]);
  const workshopLevel = uiState?.workshopLevel ?? 1;
  const workshopXp = uiState?.workshopXp ?? 0;
  const workshopXpTarget = getWorkshopXpForLevel(workshopLevel);

  const upgrade = useMemo(() => getWorkshopUpgrade(uiState?.workshopUpgradeLevel ?? 1), [uiState]);
  const nextUpgrade = useMemo(() => getNextWorkshopUpgrade(uiState?.workshopUpgradeLevel ?? 1), [uiState]);

  const inventory = useMemo(() => profile?.inventory || {}, [profile?.inventory]);
  const workshopInventory = useMemo(() => {
    const craftedIds = new Set(workshopItems.map((item) => item.id));
    return Object.entries(inventory).reduce((acc, [itemId, amount]) => {
      if (craftedIds.has(itemId)) {
        acc[itemId] = amount;
      }
      return acc;
    }, {});
  }, [inventory]);
  const gold = profile?.stats?.gold ?? 0;
  const workshopInventoryTotal = useMemo(
    () => Object.values(workshopInventory).reduce((sum, amount) => sum + (amount || 0), 0),
    [workshopInventory]
  );

  const unlockedStations = useMemo(() => {
    if (!uiState) {
      return [];
    }
    const unlockedIds = new Set(uiState.stations.map((station) => station.id));
    return workshopStations.map((station) => ({
      ...station,
      unlocked: unlockedIds.has(station.id),
    }));
  }, [uiState]);

  const getInputName = (input) => {
    if (input.source === 'mining') {
      return miningNames[input.id] || input.id;
    }
    if (input.source === 'farm') {
      return farmNames[input.id] || input.id;
    }
    return input.id;
  };

  const getOwnedForInput = React.useCallback((input) => {
    return getItemCount(inventory, input.id);
  }, [inventory]);

  const canCraft = React.useCallback((recipe, quantity) => {
    if (!profile) {
      return false;
    }
    const scaled = clampQuantity(quantity, 1);
    return recipe.inputs.every((input) => getOwnedForInput(input) >= input.amount * scaled);
  }, [profile, getOwnedForInput]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const matchesSearch = React.useCallback((recipe) => {
    if (!normalizedSearch) {
      return true;
    }
    const outputName = getOutputName(recipe).toLowerCase();
    const recipeId = recipe.id.toLowerCase();
    return outputName.includes(normalizedSearch) || recipeId.includes(normalizedSearch);
  }, [normalizedSearch]);

  const getOutputName = (recipe) => {
    const output = recipe.outputs?.[0];
    if (!output) {
      return recipe.id;
    }
    return getWorkshopItem(output.id)?.name || output.id;
  };

  const getRecipeOutputName = (recipeId) => {
    const recipe = getWorkshopRecipe(recipeId);
    return recipe ? getOutputName(recipe) : recipeId;
  };

  const getRecipeTags = (recipe) => {
    const tags = new Set();
    recipe.inputs.forEach((input) => {
      if (input.source === 'mining') {
        tags.add('ore');
      }
      if (input.source === 'farm') {
        tags.add('crop');
      }
    });
    return Array.from(tags);
  };

  const filteredRecipePool = useMemo(() => {
    if (!uiState) {
      return [];
    }
    const stationIds = stationFilter === 'all' ? uiState.stations.map((station) => station.id) : [stationFilter];
    return stationIds.flatMap((stationId) => uiState.recipes[stationId] || []);
  }, [uiState, stationFilter]);

  const tagCounts = useMemo(() => {
    const counts = { ore: 0, crop: 0 };
    filteredRecipePool.forEach((recipe) => {
      const tags = getRecipeTags(recipe);
      if (tags.includes('ore')) {
        counts.ore += 1;
      }
      if (tags.includes('crop')) {
        counts.crop += 1;
      }
    });
    return counts;
  }, [filteredRecipePool]);

  const matchesTag = React.useCallback((recipe) => {
    if (tagFilter === 'all') {
      return true;
    }
    return getRecipeTags(recipe).includes(tagFilter);
  }, [tagFilter]);

  const shouldShowRecipe = React.useCallback((recipe, quantity) => {
    if (!matchesSearch(recipe) || !matchesTag(recipe)) {
      return false;
    }
    if (showCraftableOnly && !canCraft(recipe, quantity)) {
      return false;
    }
    return true;
  }, [matchesSearch, matchesTag, showCraftableOnly, canCraft]);

  const filteredRecipeCount = useMemo(() => {
    return filteredRecipePool.filter((recipe) => shouldShowRecipe(recipe, quantities[recipe.id] || 1)).length;
  }, [filteredRecipePool, quantities, shouldShowRecipe]);

  const handleQueue = (recipeId, quantity) => {
    if (!MOCK_AUTH || !profile) {
      return;
    }

    const scaled = clampQuantity(quantity, 1);
    const result = WorkshopService.queueWorkshopJob({ recipeId, quantity: scaled, now: Date.now() });
    if (!result.ok) {
      toast.error(result.reason || 'Unable to queue crafting job.');
      return;
    }

    setProfile(result.profile);
    toast.success('Crafting started.');
  };

  const handleUpgrade = () => {
    if (!MOCK_AUTH || !profile) {
      return;
    }
    const result = WorkshopService.upgradeWorkshop();
    if (!result.ok) {
      toast.error(result.reason || 'Upgrade unavailable.');
      return;
    }
    setProfile(result.profile);
    toast.success('Workshop upgraded.');
  };

  const handleSell = (itemId, quantity) => {
    if (!MOCK_AUTH || !profile) {
      return;
    }

    const item = getWorkshopItem(itemId);
    if (!item) {
      toast.error('Unknown crafted item.');
      return;
    }

    const owned = workshopInventory[itemId] || 0;
    const scaled = Math.min(owned, clampQuantity(quantity, 1));
    if (scaled <= 0) {
      toast.error('Not enough items to sell.');
      return;
    }

    const nextInventory = removeItems(inventory, { [itemId]: scaled });

    const updated = characterService.updateMockProfile({
      inventory: nextInventory,
      stats: {
        ...profile.stats,
        gold: gold + item.sellValue * scaled,
      },
    });

    setProfile(updated);
    toast.success(`Sold ${scaled} ${item.name}.`);
  };

  const handleSellAllCrafted = () => {
    if (!MOCK_AUTH || !profile) {
      return;
    }

    if (workshopInventoryTotal <= 0) {
      toast.error('No crafted items to sell.');
      return;
    }

    const totalValue = Object.entries(workshopInventory).reduce((sum, [itemId, amount]) => {
      const item = getWorkshopItem(itemId);
      if (!item) {
        return sum;
      }
      return sum + item.sellValue * amount;
    }, 0);

    const confirmed = window.confirm(
      `Sell all crafted items for ${totalValue} gold? This cannot be undone.`
    );
    if (!confirmed) {
      return;
    }

    const removalMap = Object.entries(workshopInventory).reduce((acc, [itemId, amount]) => {
      acc[itemId] = amount;
      return acc;
    }, {});

    const updated = characterService.updateMockProfile({
      inventory: removeItems(inventory, removalMap),
      stats: {
        ...profile.stats,
        gold: gold + totalValue,
      },
    });

    setProfile(updated);
    toast.success('All crafted items sold.');
  };

  const handleClearFilters = () => {
    setStationFilter('all');
    setTagFilter('all');
    setSearchTerm('');
    setShowCraftableOnly(false);
  };

  if (!uiState) {
    return (
      <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm.jpg')] bg-gray-900 bg-blend-multiply dashboard-shell lg:pl-64">
        <Sidebar />
        <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 pt-24 text-gray-200">Loading Workshop...</div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm.jpg')] bg-gray-900 bg-blend-multiply dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 pt-24">
        <div className="rounded-2xl p-6 shadow-xl backdrop-blur glass-panel">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">Crafting Hub</p>
              <h1 className="mt-3 text-4xl font-extrabold text-white hero-title">Workshop</h1>
              <p className="mt-3 text-base text-gray-300">
                Convert mined ore and farm goods into crafted wares over time.
              </p>
            </div>
            <div className="rounded-xl border border-yellow-700/30 bg-gray-950/70 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Level</p>
              <p className="mt-1 text-3xl font-semibold text-yellow-300">{workshopLevel}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-yellow-700/30 bg-gray-950/70 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Workshop XP</p>
              <div className="mt-3">
                <XpBar current={workshopXp} target={workshopXpTarget || 1} label="Workshop XP" tone="emerald" />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                <span>Upgrade: {upgrade?.name || 'Basic Tools'}</span>
                <span>·</span>
                <span>Queue: {uiState.jobs.length} jobs</span>
              </div>
            </div>

            <div className="rounded-2xl border border-yellow-700/30 bg-gray-950/70 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Upgrade Tools</p>
              <p className="mt-2 text-xl font-semibold text-white">
                {nextUpgrade ? nextUpgrade.name : 'Maxed Workshop'}
              </p>
              <p className="mt-1 text-sm text-gray-300">
                {nextUpgrade
                  ? `Reduce crafting time to ${(nextUpgrade.durationMultiplier * 100).toFixed(0)}%.`
                  : 'All upgrades unlocked.'}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                <span>Gold: {gold}</span>
                {nextUpgrade ? <span>Cost: {nextUpgrade.cost}</span> : null}
              </div>
              <button
                type="button"
                onClick={handleUpgrade}
                disabled={!nextUpgrade || gold < nextUpgrade.cost}
                className={`mt-4 inline-flex items-center rounded-lg px-4 py-2 text-xs font-semibold ${nextUpgrade && gold >= nextUpgrade.cost
                  ? 'action-primary text-white'
                  : 'bg-gray-700 text-gray-300'
                  }`}
              >
                Upgrade Workshop
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-yellow-700/30 bg-gray-950/70 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={stationFilter}
                    onChange={(event) => setStationFilter(event.target.value)}
                    className="rounded-lg border border-yellow-700/30 bg-gray-950/70 px-3 py-2 text-xs text-gray-100"
                  >
                    <option value="all">All Stations</option>
                    {uiState.stations.map((station) => (
                      <option key={station.id} value={station.id}>
                        {station.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={tagFilter}
                    onChange={(event) => setTagFilter(event.target.value)}
                    className="rounded-lg border border-yellow-700/30 bg-gray-950/70 px-3 py-2 text-xs text-gray-100"
                  >
                    <option value="all">All Tags</option>
                    <option value="ore">Ore</option>
                    <option value="crop">Crop</option>
                  </select>
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search recipe or output"
                    className="min-w-[180px] flex-1 rounded-lg border border-yellow-700/30 bg-gray-950/70 px-3 py-2 text-xs text-gray-100"
                  />
                  <label className="flex items-center gap-2 text-xs text-gray-300">
                    <input
                      type="checkbox"
                      checked={showCraftableOnly}
                      onChange={(event) => setShowCraftableOnly(event.target.checked)}
                      className="h-4 w-4 rounded border border-yellow-700/30 bg-gray-950/70"
                    />
                    Craftable only
                  </label>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="rounded-lg border border-yellow-700/30 px-3 py-2 text-xs font-semibold text-yellow-200"
                  >
                    Clear filters
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setTagFilter('all')}
                    className={`rounded-full border px-3 py-1 uppercase tracking-[0.3em] ${tagFilter === 'all'
                      ? 'border-yellow-500/60 bg-yellow-500/10 text-yellow-200'
                      : 'border-yellow-700/30 text-gray-300'
                      }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setTagFilter('ore')}
                    className={`rounded-full border px-3 py-1 uppercase tracking-[0.3em] ${tagFilter === 'ore'
                      ? 'border-yellow-500/60 bg-yellow-500/10 text-yellow-200'
                      : 'border-yellow-700/30 text-gray-300'
                      }`}
                  >
                    Ore ({tagCounts.ore})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTagFilter('crop')}
                    className={`rounded-full border px-3 py-1 uppercase tracking-[0.3em] ${tagFilter === 'crop'
                      ? 'border-yellow-500/60 bg-yellow-500/10 text-yellow-200'
                      : 'border-yellow-700/30 text-gray-300'
                      }`}
                  >
                    Crop ({tagCounts.crop})
                  </button>
                  <span className="rounded-full border border-yellow-700/30 px-3 py-1 uppercase tracking-[0.3em] text-gray-300">
                    {filteredRecipeCount} shown
                  </span>
                </div>
              </div>
              {unlockedStations.map((station) => (
                stationFilter !== 'all' && stationFilter !== station.id ? null : (
                  <div key={station.id} className="rounded-2xl border border-yellow-700/30 bg-gray-950/70 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{station.name}</p>
                        <p className="mt-2 text-lg font-semibold text-white">{station.description}</p>
                      </div>
                      {!station.unlocked ? (
                        <span className="rounded-full border border-yellow-700/40 bg-gray-900/80 px-3 py-1 text-xs text-yellow-200">
                          Unlocks at level {station.unlockLevel}
                        </span>
                      ) : null}
                    </div>

                    {station.unlocked ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {(uiState.recipes[station.id] || []).map((recipe) => {
                          const quantity = quantities[recipe.id] || 1;
                          if (!shouldShowRecipe(recipe, quantity)) {
                            return null;
                          }
                          const craftable = canCraft(recipe, quantity);
                          const tags = getRecipeTags(recipe);
                          return (
                            <div key={recipe.id} className="rounded-xl border border-yellow-700/20 bg-gray-900/80 p-4">
                              <p className="text-sm font-semibold text-white">{getOutputName(recipe)}</p>
                              <p className="mt-1 text-xs text-gray-400">Requires level {recipe.levelRequired}</p>
                              {tags.length ? (
                                <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.3em] text-yellow-200">
                                  {tags.map((tag) => (
                                    <span key={tag} className="rounded-full border border-yellow-700/30 px-2 py-1">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                              <div className="mt-3 space-y-1 text-xs text-gray-300">
                                {recipe.inputs.map((input) => (
                                  <div key={input.id} className="flex items-center justify-between">
                                    <span>
                                      {input.amount} {getInputName(input)}
                                    </span>
                                    <span className="text-gray-400">Owned: {getOwnedForInput(input)}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                                <span>
                                  Duration:{' '}
                                  {formatDuration(
                                    recipe.durationMs * quantity * (upgrade?.durationMultiplier || 1)
                                  )}
                                </span>
                                <span>·</span>
                                <span>XP: {recipe.xp * quantity}</span>
                              </div>
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={quantity}
                                  onChange={(event) =>
                                    setQuantities((prev) => ({
                                      ...prev,
                                      [recipe.id]: clampQuantity(event.target.value, 1),
                                    }))
                                  }
                                  className="w-20 rounded-lg border border-yellow-700/30 bg-gray-950/70 px-2 py-1 text-xs text-gray-100"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleQueue(recipe.id, quantity)}
                                  disabled={!craftable}
                                  className={`rounded-lg px-3 py-2 text-xs font-semibold ${craftable ? 'action-primary text-white' : 'bg-gray-700 text-gray-300'
                                    }`}
                                >
                                  Craft
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQueue(recipe.id, 5)}
                                  disabled={!canCraft(recipe, 5)}
                                  className={`rounded-lg px-3 py-2 text-xs font-semibold ${canCraft(recipe, 5) ? 'action-ghost text-yellow-200' : 'bg-gray-700 text-gray-300'
                                    }`}
                                >
                                  Craft 5
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-gray-400">Reach workshop level {station.unlockLevel} to unlock.</p>
                    )}
                  </div>
                )
              ))}
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-yellow-700/30 bg-gray-950/70 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Active Queue</p>
                {uiState.jobs.length === 0 ? (
                  <p className="mt-3 text-sm text-gray-300">No crafting jobs queued.</p>
                ) : (
                  <div className="mt-3 space-y-3 text-sm text-gray-300">
                    {uiState.jobs.map((job) => (
                      <div key={job.id} className="rounded-lg border border-yellow-700/20 bg-gray-900/80 p-3">
                        <p className="text-white font-semibold">{getRecipeOutputName(job.recipeId)}</p>
                        <p className="mt-1 text-xs text-gray-400">Quantity: {job.quantity}</p>
                        <p className="mt-2 text-xs text-yellow-200">
                          Ready in {formatDuration(job.remainingMs)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-yellow-700/30 bg-gray-950/70 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Crafted Inventory</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
                  <span>Total items: {workshopInventoryTotal}</span>
                  <button
                    type="button"
                    onClick={handleSellAllCrafted}
                    disabled={workshopInventoryTotal <= 0}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold ${workshopInventoryTotal > 0
                      ? 'action-ghost text-yellow-200'
                      : 'bg-gray-700 text-gray-300'
                      }`}
                  >
                    Sell All
                  </button>
                </div>
                {Object.keys(workshopInventory).length === 0 ? (
                  <p className="mt-3 text-sm text-gray-300">No crafted items yet.</p>
                ) : (
                  <div className="mt-3 space-y-3 text-sm text-gray-300">
                    {Object.entries(workshopInventory).map(([itemId, amount]) => {
                      const item = getWorkshopItem(itemId);
                      return (
                        <div key={itemId} className="rounded-lg border border-yellow-700/20 bg-gray-900/80 p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-white font-semibold">{item?.name || itemId}</p>
                            <span className="text-yellow-200">x{amount}</span>
                          </div>
                          <p className="mt-1 text-xs text-gray-400">Sell value: {item?.sellValue || 0} gold</p>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSell(itemId, 1)}
                              className="rounded-lg px-3 py-2 text-xs font-semibold text-white action-primary"
                            >
                              Sell 1
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSell(itemId, amount)}
                              className="rounded-lg px-3 py-2 text-xs font-semibold text-yellow-200 action-ghost"
                            >
                              Sell All
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Link
            to="/dashboard"
            className="mt-8 inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-yellow-200 action-ghost"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
