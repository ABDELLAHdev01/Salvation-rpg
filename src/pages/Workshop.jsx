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

// Standard UI Components
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SectionHeader from '../components/ui/SectionHeader';

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

  const matchesSearch = React.useCallback((recipe) => {
    if (!searchTerm.trim()) {
      return true;
    }
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const outputName = getOutputName(recipe).toLowerCase();
    const recipeId = recipe.id.toLowerCase();
    return outputName.includes(normalizedSearch) || recipeId.includes(normalizedSearch);
  }, [searchTerm]);

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
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 pt-24 text-gray-200">
          <Panel variant="glass" className="text-center py-20">
            <h2 className="text-2xl font-bold">Initializing Workshop...</h2>
            <p className="mt-2 text-gray-400">Consulting the artisans.</p>
          </Panel>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm.jpg')] bg-gray-900 bg-blend-multiply dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 pt-24">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <SectionHeader
            kicker="Crafting Hub"
            title="The Grand Workshop"
            description="Refine raw resources into legendary artifacts. Precision is the path to power."
          />
          <Panel variant="subtle" className="text-center w-full sm:w-auto sm:min-w-[120px]">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">Forge Mastery</p>
            <p className="mt-1 text-3xl font-black text-amber-500 drop-shadow-sm">Lvl {workshopLevel}</p>
          </Panel>
        </div>

        <div className="mb-8 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-8">
            <Panel variant="glass">
              <XpBar current={workshopXp} target={workshopXpTarget || 1} label="Workshop Progression" tone="gold" />
              <div className="mt-4 flex flex-wrap gap-3">
                <Badge variant="gold">Active Jobs: {uiState.jobs.length}</Badge>
                <Badge variant="cyan">Gold: {gold}</Badge>
                <Badge variant="info">Tools: {upgrade?.name || 'Basic'}</Badge>
              </div>
            </Panel>

            <Panel variant="card">
              <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <select
                    value={stationFilter}
                    onChange={(event) => setStationFilter(event.target.value)}
                    className="h-10 w-full sm:w-auto rounded-xl border border-yellow-700/20 bg-gray-950/70 px-4 text-xs text-gray-100 focus:border-yellow-500/50 outline-none transition-all"
                  >
                    <option value="all">All Stations</option>
                    {uiState.stations.map((station) => (
                      <option key={station.id} value={station.id}>
                        {station.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search blueprints..."
                    className="h-10 w-full sm:flex-1 rounded-xl border border-yellow-700/20 bg-gray-950/70 px-4 text-xs text-gray-100 focus:border-yellow-500/50 outline-none transition-all"
                  />
                  <Button variant="ghost" size="sm" onClick={handleClearFilters} className="w-full sm:w-auto">
                    Reset
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant={tagFilter === 'all' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setTagFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={tagFilter === 'ore' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setTagFilter('ore')}
                  >
                    Ore ({tagCounts.ore})
                  </Button>
                  <Button
                    variant={tagFilter === 'crop' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setTagFilter('crop')}
                  >
                    Crop ({tagCounts.crop})
                  </Button>
                  <div className="ml-auto flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="craftableOnly"
                      checked={showCraftableOnly}
                      onChange={(event) => setShowCraftableOnly(event.target.checked)}
                      className="h-4 w-4 rounded border-yellow-700/30 bg-gray-950/70 text-yellow-500"
                    />
                    <label htmlFor="craftableOnly" className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                      Craftable Only
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-12">
                {unlockedStations.map((station) => (
                  stationFilter !== 'all' && stationFilter !== station.id ? null : (
                    <div key={station.id} className="space-y-4">
                      <div className="flex items-center justify-between border-b border-yellow-700/10 pb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white uppercase tracking-wider">{station.name}</h3>
                          <p className="mt-1 text-sm text-gray-400">{station.description}</p>
                        </div>
                        {!station.unlocked && (
                          <Badge variant="danger">Locked (Lvl {station.unlockLevel})</Badge>
                        )}
                      </div>

                      {station.unlocked ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {(uiState.recipes[station.id] || []).map((recipe) => {
                            const q = quantities[recipe.id] || 1;
                            if (!shouldShowRecipe(recipe, q)) return null;
                            const craftable = canCraft(recipe, q);
                            const tags = getRecipeTags(recipe);
                            return (
                              <Panel key={recipe.id} variant="subtle" className="hover:border-yellow-500/30 transition-all p-5">
                                <div className="flex justify-between items-start mb-3">
                                  <h4 className="font-bold text-white">{getOutputName(recipe)}</h4>
                                  <Badge variant="ghost">Lvl {recipe.levelRequired}</Badge>
                                </div>

                                {tags.length > 0 && (
                                  <div className="flex gap-2 mb-4">
                                    {tags.map(t => <Badge key={t} variant="info" className="lowercase">{t}</Badge>)}
                                  </div>
                                )}

                                <div className="space-y-2 mb-4">
                                  {recipe.inputs.map((input) => {
                                    const owned = getOwnedForInput(input);
                                    const req = input.amount * q;
                                    return (
                                      <div key={input.id} className="flex items-center justify-between text-xs">
                                        <span className="text-gray-400">{getInputName(input)}</span>
                                        <span className={owned >= req ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                          {owned}/{req}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>

                                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-gray-500 mb-4 font-bold border-t border-yellow-700/5 pt-3">
                                  <span>{formatDuration(recipe.durationMs * q * (upgrade?.durationMultiplier || 1))}</span>
                                  <span className="text-yellow-500">+{recipe.xp * q} XP</span>
                                </div>

                                <div className="flex gap-2">
                                  <input
                                    type="number"
                                    min="1"
                                    value={q}
                                    onChange={(e) =>
                                      setQuantities((prev) => ({
                                        ...prev,
                                        [recipe.id]: clampQuantity(e.target.value, 1),
                                      }))
                                    }
                                    className="w-16 rounded-xl border border-yellow-700/20 bg-gray-950/70 px-3 py-2 text-xs text-white focus:border-yellow-500/50 outline-none"
                                  />
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleQueue(recipe.id, q)}
                                    disabled={!craftable}
                                  >
                                    Craft {q > 1 ? `x${q}` : ''}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleQueue(recipe.id, 5)}
                                    disabled={!canCraft(recipe, 5)}
                                  >
                                    5
                                  </Button>
                                </div>
                              </Panel>
                            );
                          })}
                        </div>
                      ) : (
                        <Panel variant="subtle" className="py-10 text-center text-gray-500 italic">
                          Master the workshop to unlock this station at Level {station.unlockLevel}.
                        </Panel>
                      )}
                    </div>
                  )
                ))}
              </div>
            </Panel>
          </div>

          <div className="space-y-8">
            <Panel variant="ornament">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-300 font-bold mb-4">Artisan Gear</p>
              <h4 className="text-xl font-bold text-white">{nextUpgrade ? nextUpgrade.name : 'Masterwork Forge'}</h4>
              <p className="mt-2 text-sm text-gray-400">
                {nextUpgrade
                  ? `Reduces crafting duration to ${(nextUpgrade.durationMultiplier * 100).toFixed(0)}%.`
                  : 'Your tools are the pinnacle of mortal craftsmanship.'}
              </p>
              <div className="mt-4 p-4 rounded-xl bg-gray-950/50 border border-yellow-700/10">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-gray-500">Current Efficiency</span>
                  <span className="text-yellow-500 font-bold">{(upgrade?.durationMultiplier * 100 || 100).toFixed(0)}%</span>
                </div>
                {nextUpgrade && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Upgrade Cost</span>
                    <span className={`font-bold ${gold >= nextUpgrade.cost ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {nextUpgrade.cost} Gold
                    </span>
                  </div>
                )}
              </div>
              <Button
                variant="ornate"
                className="mt-6 w-full"
                onClick={handleUpgrade}
                disabled={!nextUpgrade || gold < nextUpgrade.cost}
              >
                Reforge Tools
              </Button>
            </Panel>

            <Panel variant="card">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold mb-4">Production Queue</p>
              {uiState.jobs.length === 0 ? (
                <p className="text-sm text-gray-500 italic py-4">No active commissions.</p>
              ) : (
                <div className="space-y-4">
                  {uiState.jobs.map((job) => (
                    <div key={job.id} className="group rounded-xl border border-yellow-700/10 bg-gray-950/40 p-4 transition-all hover:bg-gray-950/60">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-white">{getRecipeOutputName(job.recipeId)}</p>
                        <Badge variant="cyan">x{job.quantity}</Badge>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">
                          <span>Progress</span>
                          <span className="text-cyan-400">{formatDuration(job.remainingMs)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-1000"
                            style={{ width: `${Math.max(5, 100 - (job.remainingMs / (getWorkshopRecipe(job.recipeId)?.durationMs * job.quantity * (upgrade?.durationMultiplier || 1))) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel variant="card">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">Finished Wares</p>
                <Button variant="ghost" size="sm" onClick={handleSellAllCrafted} disabled={workshopInventoryTotal <= 0}>
                  Sell All
                </Button>
              </div>
              {Object.keys(workshopInventory).length === 0 ? (
                <p className="text-sm text-gray-500 italic py-4">Vault is empty.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(workshopInventory).map(([itemId, amount]) => {
                    const item = getWorkshopItem(itemId);
                    return (
                      <div key={itemId} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-gray-950/40 border border-yellow-700/5 hover:bg-gray-950/60 transition-all">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{item?.name || itemId}</p>
                          <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest mt-0.5">{item?.sellValue || 0} Gold</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="gold">x{amount}</Badge>
                          <Button variant="secondary" size="sm" className="h-7 w-7 !p-0" onClick={() => handleSell(itemId, 1)}>
                            $
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Button variant="ornate" to="/dashboard">
            Return to Command Deck
          </Button>
        </div>
      </div>
    </section>
  );
}
