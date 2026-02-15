import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../../shared/layout/Sidebar';
import authService from '../../core/services/AuthService';
import characterService from '../../core/services/CharacterService';
import WorkshopService from '../../core/services/WorkshopService';
import {
  getWorkshopItem,
  getWorkshopRecipe,
  getWorkshopXpForLevel,
  getWorkshopUpgrade,
  getNextWorkshopUpgrade,
  workshopStations,
  workshopItems,
} from '../../core/data/workshopData';
import { miningOres, formatDuration } from '../../core/data/miningData';
import { farmGoods } from '../../core/data/farmData';
import { getItemCount, removeItems } from '../../core/services/inventoryService';

// Standard UI Components
import Panel from '../../shared/ui/Panel';
import Button from '../../shared/ui/Button';
import Badge from '../../shared/ui/Badge';

// Workshop Widgets
import WorkshopHeader from './widgets/WorkshopHeader';
import WorkshopFilters from './widgets/WorkshopFilters';
import WorkshopRecipeCard from './widgets/WorkshopRecipeCard';
import WorkshopQueue from './widgets/WorkshopQueue';
import WorkshopInventory from './widgets/WorkshopInventory';
import WorkshopUpgradePanel from './widgets/WorkshopUpgradePanel';

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
    if (!MOCK_AUTH) return;

    const stored = localStorage.getItem(FILTER_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.stationFilter) setStationFilter(parsed.stationFilter);
        if (parsed?.tagFilter) setTagFilter(parsed.tagFilter);
        if (typeof parsed?.searchTerm === 'string') setSearchTerm(parsed.searchTerm);
        if (typeof parsed?.showCraftableOnly === 'boolean') setShowCraftableOnly(parsed.showCraftableOnly);
      } catch {
        localStorage.removeItem(FILTER_STORAGE_KEY);
      }
    }

    const username = authService.getCurrentUsername();
    if (!username) return;

    const nextProfile = characterService.getMockProfile(username);
    setProfile(nextProfile);

    const processed = WorkshopService.processWorkshopQueue({ now: Date.now() });
    if (processed.profile) setProfile(processed.profile);

    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!hasMountedRef.current) return;
    const payload = { stationFilter, tagFilter, searchTerm, showCraftableOnly };
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(payload));
  }, [stationFilter, tagFilter, searchTerm, showCraftableOnly]);

  useEffect(() => {
    if (!profile?.workshopQueue?.length) return;

    const nextFinish = Math.min(...profile.workshopQueue.map((job) => job.finishAt));
    if (nextFinish <= now) {
      const processed = WorkshopService.processWorkshopQueue({ now });
      if (processed.profile) setProfile(processed.profile);
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
      if (craftedIds.has(itemId)) acc[itemId] = amount;
      return acc;
    }, {});
  }, [inventory]);

  const gold = profile?.stats?.gold ?? 0;
  const workshopInventoryTotal = useMemo(
    () => Object.values(workshopInventory).reduce((sum, amount) => sum + (amount || 0), 0),
    [workshopInventory]
  );

  const unlockedStations = useMemo(() => {
    if (!uiState) return [];
    const unlockedIds = new Set(uiState.stations.map((station) => station.id));
    return workshopStations.map((station) => ({
      ...station,
      unlocked: unlockedIds.has(station.id),
    }));
  }, [uiState]);

  const getInputName = (input) => {
    if (input.source === 'mining') return miningNames[input.id] || input.id;
    if (input.source === 'farm') return farmNames[input.id] || input.id;
    return input.id;
  };

  const getOwnedForInput = React.useCallback((input) => getItemCount(inventory, input.id), [inventory]);

  const canCraft = React.useCallback((recipe, quantity) => {
    if (!profile) return false;
    const scaled = clampQuantity(quantity, 1);
    return recipe.inputs.every((input) => getOwnedForInput(input) >= input.amount * scaled);
  }, [profile, getOwnedForInput]);

  const getOutputName = (recipe) => {
    const output = recipe.outputs?.[0];
    if (!output) return recipe.id;
    return getWorkshopItem(output.id)?.name || output.id;
  };

  const getRecipeOutputName = (recipeId) => {
    const recipe = getWorkshopRecipe(recipeId);
    return recipe ? getOutputName(recipe) : recipeId;
  };

  const getRecipeTags = (recipe) => {
    const tags = new Set();
    recipe.inputs.forEach((input) => {
      if (input.source === 'mining') tags.add('ore');
      if (input.source === 'farm') tags.add('crop');
    });
    return Array.from(tags);
  };

  const filteredRecipePool = useMemo(() => {
    if (!uiState) return [];
    const stationIds = stationFilter === 'all' ? uiState.stations.map((station) => station.id) : [stationFilter];
    return stationIds.flatMap((stationId) => uiState.recipes[stationId] || []);
  }, [uiState, stationFilter]);

  const tagCounts = useMemo(() => {
    const counts = { ore: 0, crop: 0 };
    filteredRecipePool.forEach((recipe) => {
      const tags = getRecipeTags(recipe);
      if (tags.includes('ore')) counts.ore += 1;
      if (tags.includes('crop')) counts.crop += 1;
    });
    return counts;
  }, [filteredRecipePool]);

  const shouldShowRecipe = React.useCallback((recipe, quantity) => {
    if (searchTerm.trim()) {
      const norm = searchTerm.trim().toLowerCase();
      if (!getOutputName(recipe).toLowerCase().includes(norm) && !recipe.id.toLowerCase().includes(norm)) return false;
    }
    if (tagFilter !== 'all' && !getRecipeTags(recipe).includes(tagFilter)) return false;
    if (showCraftableOnly && !canCraft(recipe, quantity)) return false;
    return true;
  }, [searchTerm, tagFilter, showCraftableOnly, canCraft]);

  const handleQueue = (recipeId, quantity) => {
    if (!MOCK_AUTH || !profile) return;
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
    if (!MOCK_AUTH || !profile) return;
    const result = WorkshopService.upgradeWorkshop();
    if (!result.ok) {
      toast.error(result.reason || 'Upgrade unavailable.');
      return;
    }
    setProfile(result.profile);
    toast.success('Workshop upgraded.');
  };

  const handleSell = (itemId, quantity) => {
    if (!MOCK_AUTH || !profile) return;
    const item = getWorkshopItem(itemId);
    if (!item) return;
    const owned = workshopInventory[itemId] || 0;
    const scaled = Math.min(owned, clampQuantity(quantity, 1));
    if (scaled <= 0) return;

    const nextInventory = removeItems(inventory, { [itemId]: scaled });
    const updated = characterService.updateMockProfile({
      inventory: nextInventory,
      stats: { ...profile.stats, gold: gold + item.sellValue * scaled },
    });

    setProfile(updated);
    toast.success(`Sold ${scaled} ${item.name}.`);
  };

  const handleSellAllCrafted = () => {
    if (!MOCK_AUTH || !profile || workshopInventoryTotal <= 0) return;

    const totalValue = Object.entries(workshopInventory).reduce((sum, [itemId, amount]) => {
      const item = getWorkshopItem(itemId);
      return sum + (item?.sellValue || 0) * amount;
    }, 0);

    const confirmed = window.confirm(`Sell all crafted items for ${totalValue} gold? This cannot be undone.`);
    if (!confirmed) return;

    const removalMap = { ...workshopInventory };
    const updated = characterService.updateMockProfile({
      inventory: removeItems(inventory, removalMap),
      stats: { ...profile.stats, gold: gold + totalValue },
    });

    setProfile(updated);
    toast.success('All crafted items sold.');
  };

  const setQuantity = (recipeId, value) => {
    setQuantities((prev) => ({ ...prev, [recipeId]: clampQuantity(value, 1) }));
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
        <WorkshopHeader
          workshopLevel={workshopLevel}
          workshopXp={workshopXp}
          workshopXpTarget={workshopXpTarget}
          activeJobsCount={uiState.jobs.length}
          gold={gold}
          upgradeName={upgrade?.name}
        />

        <div className="mb-8 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-8">
            <Panel variant="card">
              <WorkshopFilters
                stationFilter={stationFilter} setStationFilter={setStationFilter} stations={uiState.stations}
                searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                tagFilter={tagFilter} setTagFilter={setTagFilter} tagCounts={tagCounts}
                showCraftableOnly={showCraftableOnly} setShowCraftableOnly={setShowCraftableOnly}
                handleClearFilters={() => {
                  setStationFilter('all'); setTagFilter('all'); setSearchTerm(''); setShowCraftableOnly(false);
                }}
              />

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
                            return (
                              <WorkshopRecipeCard
                                key={recipe.id}
                                recipe={recipe}
                                quantity={q}
                                setQuantity={setQuantity}
                                craftable={canCraft(recipe, q)}
                                getOutputName={getOutputName}
                                getRecipeTags={getRecipeTags}
                                getOwnedForInput={getOwnedForInput}
                                getInputName={getInputName}
                                formatDuration={formatDuration}
                                upgrade={upgrade}
                                handleQueue={handleQueue}
                                canCraft={canCraft}
                              />
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
            <WorkshopUpgradePanel
              upgrade={upgrade}
              nextUpgrade={nextUpgrade}
              gold={gold}
              handleUpgrade={handleUpgrade}
            />
            <WorkshopQueue
              jobs={uiState.jobs}
              getRecipeOutputName={getRecipeOutputName}
              formatDuration={formatDuration}
              upgrade={upgrade}
              getWorkshopRecipe={getWorkshopRecipe}
            />
            <WorkshopInventory
              workshopInventory={workshopInventory}
              workshopInventoryTotal={workshopInventoryTotal}
              getWorkshopItem={getWorkshopItem}
              handleSell={handleSell}
              handleSellAllCrafted={handleSellAllCrafted}
            />
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
