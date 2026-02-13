import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import XpBar from '../components/XpBar';
import { useRewardFloat } from '../components/RewardFloatProvider';
import authService from '../services/AuthService';
import characterService from '../services/CharacterService';
import {
  farmCrops,
  farmGoods,
  getFarmXpForLevel,
  ensureFarmWeather,
  getCropSeasonModifiers,
  getCropSeasonBadges,
  getSeedImageSrc,
} from '../data/farmData';
import { getSeedItemId } from '../data/itemsCatalog';
import { formatDuration } from '../data/miningData';
import { getZoneModifiers } from '../data/zonesData';
import { addItems, getItemCount, removeItems } from '../services/inventoryService';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';
const UI_TICK_MS = 3000;
const BASE_LAND_SIZE = 3;
const LAND_EXPAND_SIZE = 2;
const seasonBannerMap = {
  spring: '/farm/seasons/Spring.png',
  summer: '/farm/seasons/Summer.png',
  autumn: '/farm/seasons/Autumnpng.png',
  winter: '/farm/seasons/winterpng.png',
};

const getSeasonBanner = (season) => seasonBannerMap[season] || '/farm.png';

const buildEmptyPlot = (index) => ({
  id: index,
  cropId: null,
  plantedAt: null,
  harvestAt: null,
});

const normalizePlots = (plots, landSize) => {
  const safePlots = Array.isArray(plots) ? plots : [];
  const next = [...safePlots];
  for (let i = next.length; i < landSize; i += 1) {
    next.push(buildEmptyPlot(i));
  }
  return next.slice(0, landSize);
};

export default function FarmPlots() {
  const [profile, setProfile] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [activePlotId, setActivePlotId] = useState(null);
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [plantMode, setPlantMode] = useState('single');
  const plotRefs = useRef(new Map());
  const harvestAllRef = useRef(null);
  const pushReward = useRewardFloat();

  useEffect(() => {
    if (!MOCK_AUTH) {
      return;
    }

    const username = authService.getCurrentUsername();
    const nextProfile = characterService.getMockProfile(username);
    const { nextWeather, changed } = ensureFarmWeather({
      weather: nextProfile?.farmWeather,
    });

    if (changed) {
      const updated = characterService.updateMockProfile({ farmWeather: nextWeather });
      setProfile(updated);
    } else {
      setProfile(nextProfile);
    }

    const timer = setInterval(() => setNow(Date.now()), UI_TICK_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!MOCK_AUTH || !profile) {
      return;
    }

    const landSize = profile.farmLandSize ?? BASE_LAND_SIZE;
    const plots = normalizePlots(profile.farmPlots, landSize);

    if (plots.length !== (profile.farmPlots || []).length) {
      const updated = characterService.updateMockProfile({
        farmLandSize: landSize,
        farmPlots: plots,
      });
      setProfile(updated);
    }
  }, [profile]);

  const farmLevel = profile?.farmLevel ?? 1;
  const farmXp = profile?.farmXp ?? 0;
  const gold = profile?.stats?.gold ?? 0;
  const landSize = profile?.farmLandSize ?? BASE_LAND_SIZE;
  const plots = useMemo(() => normalizePlots(profile?.farmPlots, landSize), [profile, landSize]);
  const inventory = profile?.inventory || {};
  const farmWeather = profile?.farmWeather;
  const growMultiplier = farmWeather?.growMultiplier ?? 1;
  const yieldMultiplier = farmWeather?.yieldMultiplier ?? 1;
  const season = farmWeather?.season;
  const zoneModifiers = getZoneModifiers(profile);
  const zoneGrowMultiplier = zoneModifiers.farmGrowMultiplier ?? 1;
  const zoneYieldMultiplier = zoneModifiers.farmYieldMultiplier ?? 1;

  const expansionLevel = Math.max(0, Math.floor((landSize - BASE_LAND_SIZE) / LAND_EXPAND_SIZE));
  const nextExpandCost = 350 + expansionLevel * 250;
  const nextExpandFarmLevel = 2 + expansionLevel * 2;
  const farmXpTarget = getFarmXpForLevel(farmLevel);

  const applyFarmXp = (xpGain) => {
    let nextLevel = farmLevel;
    let nextXp = farmXp + xpGain;
    let target = getFarmXpForLevel(nextLevel);
    let leveledUp = false;

    while (nextXp >= target) {
      nextXp -= target;
      nextLevel += 1;
      target = getFarmXpForLevel(nextLevel);
      leveledUp = true;
    }

    return { nextLevel, nextXp, leveledUp };
  };

  const handleExpandLand = () => {
    if (!MOCK_AUTH || !profile) {
      return;
    }

    if (gold < nextExpandCost) {
      toast.error('Not enough gold to expand the land.');
      return;
    }

    if (farmLevel < nextExpandFarmLevel) {
      toast.error(`Farm level ${nextExpandFarmLevel} required to expand the land.`);
      return;
    }

    const nextLandSize = landSize + LAND_EXPAND_SIZE;
    const nextPlots = normalizePlots(plots, nextLandSize);

    const updated = characterService.updateMockProfile({
      farmLandSize: nextLandSize,
      farmPlots: nextPlots,
      stats: {
        ...profile.stats,
        gold: gold - nextExpandCost,
      },
    });

    setProfile(updated);
    toast.success('Land expanded. New plots unlocked.');
  };

  const openPlantModal = (plotId, mode = 'single') => {
    setActivePlotId(plotId);
    setPlantMode(mode);
    setShowPlantModal(true);
  };

  const closePlantModal = () => {
    setShowPlantModal(false);
    setActivePlotId(null);
    setPlantMode('single');
  };

  const handlePlant = (cropId) => {
    if (!MOCK_AUTH || !profile) {
      return;
    }

    if (plantMode === 'bulk' && farmLevel < 10) {
      toast.error('Farm level 10 required for bulk planting.');
      return;
    }

    const crop = farmCrops.find((entry) => entry.id === cropId);
    if (!crop) {
      return;
    }

    if (farmLevel < crop.levelRequired) {
      toast.error(`Farm level ${crop.levelRequired} required to plant this crop.`);
      return;
    }

    const seedItemId = getSeedItemId(crop.id);
    const ownedSeeds = getItemCount(inventory, seedItemId);
    const seasonModifiers = getCropSeasonModifiers(crop.id, season);
    const totalGrowMultiplier = growMultiplier * seasonModifiers.growMultiplier * zoneGrowMultiplier;
    if (ownedSeeds <= 0) {
      toast.error('You need seeds for this crop.');
      return;
    }

    const emptyPlots = plots.filter((plot) => !plot.cropId);
    const plantCount = plantMode === 'bulk' ? Math.min(emptyPlots.length, ownedSeeds) : 1;
    if (plantCount <= 0) {
      toast.error('No empty plots available.');
      return;
    }

    let planted = 0;
    const nextPlots = plots.map((plot) => {
      if (plot.cropId) {
        return plot;
      }

      if (plantMode === 'single' && plot.id !== activePlotId) {
        return plot;
      }

      if (planted >= plantCount) {
        return plot;
      }

      planted += 1;
      const plantedAt = Date.now();
      return {
        ...plot,
        cropId: crop.id,
        plantedAt,
        harvestAt: plantedAt + Math.round(crop.growMs * totalGrowMultiplier),
      };
    });

    const nextInventory = removeItems(inventory, { [seedItemId]: plantCount });

    const updated = characterService.updateMockProfile({
      farmPlots: nextPlots,
      inventory: nextInventory,
    });

    setProfile(updated);
    toast.success(
      plantMode === 'bulk'
        ? `${crop.name} planted in ${plantCount} plots.`
        : `${crop.name} planted.`
    );
    closePlantModal();
  };

  const handleHarvest = (plotId) => {
    if (!MOCK_AUTH || !profile) {
      return;
    }

    const plot = plots.find((entry) => entry.id === plotId);
    if (!plot?.cropId) {
      return;
    }

    if (!plot.harvestAt || plot.harvestAt > now) {
      toast.error('Crop is not ready yet.');
      return;
    }

    const crop = farmCrops.find((entry) => entry.id === plot.cropId);
    if (!crop) {
      return;
    }

    const nextPlots = plots.map((entry) =>
      entry.id === plotId ? buildEmptyPlot(entry.id) : entry
    );

    const seasonModifiers = getCropSeasonModifiers(crop.id, season);
    const totalYieldMultiplier = yieldMultiplier * seasonModifiers.yieldMultiplier * zoneYieldMultiplier;
    const adjustedYield = Math.max(1, Math.round(crop.yieldAmount * totalYieldMultiplier));
    const nextInventory = addItems(inventory, { [crop.yieldId]: adjustedYield });

    const goodName = farmGoods.find((good) => good.id === crop.yieldId)?.name || 'Goods';

    const xpGain = Math.max(5, adjustedYield * 8);
    const { nextLevel, nextXp, leveledUp } = applyFarmXp(xpGain);

    const updated = characterService.updateMockProfile({
      farmPlots: nextPlots,
      inventory: nextInventory,
      farmLevel: nextLevel,
      farmXp: nextXp,
    });

    setProfile(updated);
    toast.success(
      `Harvested ${crop.name} +${adjustedYield} ${goodName}${leveledUp ? ' · Farm level up!' : ''}.`
    );

    const anchor = plotRefs.current.get(plotId);
    if (anchor) {
      pushReward(`+${adjustedYield} ${goodName}`, { tone: 'item', anchor });
      pushReward(`+${xpGain} XP`, { tone: 'xp', anchor, delay: 120 });
    }
  };

  const handleHarvestAll = () => {
    if (!MOCK_AUTH || !profile) {
      return;
    }

    if (farmLevel < 20) {
      toast.error('Farm level 20 required for bulk harvesting.');
      return;
    }

    const readyPlots = plots.filter((plot) => plot.harvestAt && plot.harvestAt <= now && plot.cropId);
    if (readyPlots.length === 0) {
      toast.error('No crops ready to harvest.');
      return;
    }

    let totalXp = 0;
    const yieldTotals = {};
    let nextInventory = { ...inventory };
    const readyIds = new Set(readyPlots.map((plot) => plot.id));

    readyPlots.forEach((plot) => {
      const crop = farmCrops.find((entry) => entry.id === plot.cropId);
      if (!crop) {
        return;
      }
      const seasonModifiers = getCropSeasonModifiers(crop.id, season);
      const totalYieldMultiplier = yieldMultiplier * seasonModifiers.yieldMultiplier * zoneYieldMultiplier;
      const adjustedYield = Math.max(1, Math.round(crop.yieldAmount * totalYieldMultiplier));
      nextInventory = addItems(nextInventory, { [crop.yieldId]: adjustedYield });
      totalXp += Math.max(5, adjustedYield * 8);
      yieldTotals[crop.yieldId] = (yieldTotals[crop.yieldId] || 0) + adjustedYield;
    });

    const nextPlots = plots.map((plot) =>
      readyIds.has(plot.id) ? buildEmptyPlot(plot.id) : plot
    );

    const { nextLevel, nextXp, leveledUp } = applyFarmXp(totalXp);

    const updated = characterService.updateMockProfile({
      farmPlots: nextPlots,
      inventory: nextInventory,
      farmLevel: nextLevel,
      farmXp: nextXp,
    });

    setProfile(updated);
    toast.success(`Harvested ${readyPlots.length} plots${leveledUp ? ' · Farm level up!' : ''}.`);

    const anchor = harvestAllRef.current;
    if (anchor) {
      const yieldEntries = Object.entries(yieldTotals);
      yieldEntries.forEach(([yieldId, amount], index) => {
        const goodName = farmGoods.find((good) => good.id === yieldId)?.name || 'Goods';
        pushReward(`+${amount} ${goodName}`, { tone: 'item', anchor, delay: index * 120 });
      });
      if (totalXp > 0) {
        const delay = yieldEntries.length * 120;
        pushReward(`+${totalXp} XP`, { tone: 'xp', anchor, delay });
      }
    }
  };

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm2.jpg')] bg-gray-900 bg-blend-multiply dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 pt-24">
        <div className="rounded-2xl p-8 shadow-xl backdrop-blur court-reveal glass-panel">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">Harvestlands</p>
              <h1 className="mt-3 text-4xl font-extrabold text-white hero-title">Farm Plots</h1>
              <p className="mt-3 text-base text-gray-300">
                Expand your land and plant crops. Harvests become farm goods you can sell.
              </p>
            </div>
            <Link
              to="/farm"
              className="inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold text-yellow-200 action-ghost"
            >
              Back to Farm
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="court-card rounded-xl p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Farm Level</p>
              <p className="mt-2 text-2xl font-semibold text-white">{farmLevel}</p>
              <div className="mt-3">
                <XpBar current={farmXp} target={farmXpTarget} label="Farm XP" tone="emerald" />
              </div>
            </div>
            <div className="court-card rounded-xl p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Gold</p>
              <p className="mt-2 text-2xl font-semibold text-yellow-300">{gold}</p>
            </div>
            <div className="image-panel image-panel-housing ornament-frame p-4">
              <div className="image-panel-content">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-300">Land Size</p>
                <p className="mt-2 text-2xl font-semibold text-white">{landSize} plots</p>
                <p className="mt-2 text-xs text-gray-400">
                  Next expansion: {nextExpandCost}g · Requires farm level {nextExpandFarmLevel}
                </p>
                <button
                  type="button"
                  onClick={handleExpandLand}
                  className={`mt-3 w-full rounded-lg px-3 py-2 text-xs font-semibold ${
                    gold >= nextExpandCost && farmLevel >= nextExpandFarmLevel
                      ? 'action-primary text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                  disabled={gold < nextExpandCost || farmLevel < nextExpandFarmLevel}
                >
                  Expand Land (+{LAND_EXPAND_SIZE} plots)
                </button>
              </div>
            </div>
          </div>

          {farmWeather && (
            <div className="mt-4 rounded-2xl border border-yellow-700/20 bg-gray-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Today</p>
              <img
                src={getSeasonBanner(farmWeather.season)}
                alt={`${farmWeather.season} banner`}
                className="mt-3 h-32 w-full rounded-lg object-contain bg-gray-950/70"
              />
              <p className="mt-2 text-sm font-semibold text-white">
                {farmWeather.label} · {farmWeather.season}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Grow time x{farmWeather.growMultiplier} · Yield x{farmWeather.yieldMultiplier}
              </p>
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-yellow-700/20 bg-gray-950/70 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Plots</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => openPlantModal(null, 'bulk')}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                    farmLevel >= 10
                      ? 'border-yellow-700/40 text-yellow-200'
                      : 'border-gray-700/60 text-gray-500'
                  }`}
                  disabled={farmLevel < 10}
                  title={farmLevel < 10 ? 'Bulk plant unlocks at L10' : undefined}
                >
                  Plant All (L10)
                </button>
                <button
                  type="button"
                  onClick={handleHarvestAll}
                  ref={harvestAllRef}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                    farmLevel >= 20
                      ? 'border-emerald-500/40 text-emerald-200'
                      : 'border-gray-700/60 text-gray-500'
                  }`}
                  disabled={farmLevel < 20}
                  title={farmLevel < 20 ? 'Bulk harvest unlocks at L20' : undefined}
                >
                  Harvest All (L20)
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {plots.map((plot) => {
                const crop = plot.cropId ? farmCrops.find((entry) => entry.id === plot.cropId) : null;
                const remaining = plot.harvestAt ? Math.max(0, plot.harvestAt - now) : 0;
                const isReady = !!plot.harvestAt && remaining <= 0;
                const plotState = crop ? (isReady ? 'ready' : 'planted') : 'empty';
                const frameOffset = plotState === 'empty' ? 0 : plotState === 'planted' ? 33.333 : 66.666;
                const frameOffsetY = 0;
                const frameScaleY = 1;
                const isActionable = plotState === 'empty' || plotState === 'ready';
                const handlePlotClick = () => {
                  if (plotState === 'empty') {
                    openPlantModal(plot.id, 'single');
                    return;
                  }
                  if (plotState === 'ready') {
                    handleHarvest(plot.id);
                  }
                };

                return (
                  <div
                    key={plot.id}
                    ref={(node) => {
                      if (node) {
                        plotRefs.current.set(plot.id, node);
                      } else {
                        plotRefs.current.delete(plot.id);
                      }
                    }}
                    className={`relative mx-auto w-full max-w-[320px] overflow-hidden rounded-xl transition-transform duration-200 ${
                      isActionable ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl' : ''
                    }`}
                    onClick={isActionable ? handlePlotClick : undefined}
                    role={isActionable ? 'button' : undefined}
                    tabIndex={isActionable ? 0 : undefined}
                    onKeyDown={
                      isActionable
                        ? (event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              handlePlotClick();
                            }
                          }
                        : undefined
                    }
                  >
                    <div className="w-full overflow-hidden leading-none text-[0px]">
                      <img
                        src="/plot/plotcCasesV2.png"
                        alt="Plot state"
                        className="block w-[300%] max-w-none align-top"
                        style={{
                          transform: `translate(-${frameOffset}%, ${frameOffsetY}%) scale(1, ${frameScaleY})`,
                          transformOrigin: 'center',
                        }}
                      />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-950/90 via-gray-950/70 to-transparent p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Plot {plot.id + 1}</p>
                      {crop ? (
                        <>
                          <p className="mt-2 text-sm font-semibold text-white">{crop.name}</p>
                          <p className="mt-1 text-xs text-gray-400">
                            {isReady ? 'Ready to harvest' : `Ready in ${formatDuration(remaining)}`}
                          </p>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleHarvest(plot.id);
                            }}
                            className={`mt-3 rounded-lg px-3 py-2 text-xs font-semibold ${
                              isReady ? 'action-primary text-white' : 'bg-gray-700 text-gray-300'
                            }`}
                            disabled={!isReady}
                          >
                            Harvest
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="mt-2 text-sm text-gray-300">Empty plot</p>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openPlantModal(plot.id, 'single');
                            }}
                            className="mt-3 rounded-lg px-3 py-2 text-xs font-semibold action-primary text-white"
                          >
                            Plant
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showPlantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-yellow-700/30 bg-gray-950/95 p-6 shadow-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-400">Choose Crop</p>
            <h2 className="mt-3 text-xl font-semibold text-white">What do you want to plant?</h2>
            {plantMode === 'bulk' && (
              <p className="mt-2 text-xs text-gray-300">This will plant all empty plots with the selected seed.</p>
            )}
            <div className="mt-4 space-y-3">
              {farmCrops.map((crop) => {
                const seedItemId = getSeedItemId(crop.id);
                const ownedSeeds = getItemCount(inventory, seedItemId);
                const meetsLevel = farmLevel >= crop.levelRequired;
                const disabled = !meetsLevel || ownedSeeds <= 0;
                const badges = getCropSeasonBadges(crop.id);
                return (
                  <div
                    key={crop.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-yellow-700/20 bg-gray-950/70 p-3"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <img
                        src={getSeedImageSrc(crop.id)}
                        alt={crop.seedName}
                        className="seed-thumb"
                      />
                      <div>
                        <p className="text-sm font-semibold text-white">{crop.name}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          Farm L{crop.levelRequired} · {crop.seedName} · {formatDuration(crop.growMs)}
                        </p>
                        {badges.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {badges.map((badge) => (
                              <span
                                key={`${crop.id}-${badge.season}`}
                                className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${
                                  badge.tone === 'good'
                                    ? badge.season === season
                                      ? 'bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-400/50'
                                      : 'bg-emerald-500/10 text-emerald-200'
                                    : badge.season === season
                                    ? 'bg-rose-400/20 text-rose-100 ring-1 ring-rose-400/50'
                                    : 'bg-rose-500/10 text-rose-200'
                                }`}
                              >
                                {badge.label}{badge.season === season ? ' · Today' : ''}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="mt-1 text-xs text-gray-400">
                          Yield: {crop.yieldAmount} {farmGoods.find((good) => good.id === crop.yieldId)?.name || 'Goods'}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">Seeds owned: {ownedSeeds}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePlant(crop.id)}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                        disabled ? 'bg-gray-700 text-gray-300' : 'action-primary text-white'
                      }`}
                      disabled={disabled}
                    >
                      Plant
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex items-center justify-end">
              <button
                type="button"
                onClick={closePlantModal}
                className="rounded-lg border border-yellow-700/40 px-4 py-2 text-xs font-semibold text-yellow-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
