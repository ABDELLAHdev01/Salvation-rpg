import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../../shared/layout/Sidebar';
import { useRewardFloat } from '../../shared/feedback/RewardFloatProvider';
import authService from '../../core/services/AuthService';
import characterService from '../../core/services/CharacterService';
import {
  farmCrops,
  farmGoods,
  getFarmXpForLevel,
  ensureFarmWeather,
  getCropSeasonModifiers,
} from '../../core/data/farmData';
import { getSeedItemId } from '../../core/data/itemsCatalog';
import { addItems, getItemCount, removeItems } from '../../core/services/inventoryService';

import FarmUpgradePanel from './FarmUpgradePanel';
import PlotCard from './PlotCard';
import SeedSelector from './SeedSelector';

// Farm Widgets
import FarmHeader from './widgets/FarmHeader';
import FarmStats from './widgets/FarmStats';
import FarmWeatherPanel from './widgets/FarmWeatherPanel';

// Standard UI Components
import Panel from '../../shared/ui/Panel';
import Button from '../../shared/ui/Button';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';
const UI_TICK_MS = 3000;
const BASE_LAND_SIZE = 3;
const LAND_EXPAND_SIZE = 2;

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
    if (!MOCK_AUTH) return;

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
    if (!MOCK_AUTH || !profile) return;

    const currentLandSize = profile.farmLandSize ?? BASE_LAND_SIZE;
    const currentPlots = normalizePlots(profile.farmPlots, currentLandSize);

    if (currentPlots.length !== (profile.farmPlots || []).length) {
      const updated = characterService.updateMockProfile({
        farmLandSize: currentLandSize,
        farmPlots: currentPlots,
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

  const zoneModifiers = { grow: 1, yield: 1 };

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
    if (!MOCK_AUTH || !profile) return;

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
      stats: { ...profile.stats, gold: gold - nextExpandCost },
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
    if (!MOCK_AUTH || !profile) return;

    if (plantMode === 'bulk' && farmLevel < 10) {
      toast.error('Farm level 10 required for bulk planting.');
      return;
    }

    const crop = farmCrops.find((entry) => entry.id === cropId);
    if (!crop) return;

    if (farmLevel < crop.levelRequired) {
      toast.error(`Farm level ${crop.levelRequired} required to plant this crop.`);
      return;
    }

    const seedItemId = getSeedItemId(crop.id);
    const ownedSeeds = getItemCount(inventory, seedItemId);
    const seasonModifiers = getCropSeasonModifiers(crop.id, season);
    const totalGrowMultiplier = growMultiplier * seasonModifiers.growMultiplier * zoneModifiers.grow;

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
      if (plot.cropId || (plantMode === 'single' && plot.id !== activePlotId) || planted >= plantCount) {
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
    toast.success(plantMode === 'bulk' ? `${crop.name} planted in ${plantCount} plots.` : `${crop.name} planted.`);
    closePlantModal();
  };

  const handleHarvest = (plotId) => {
    if (!MOCK_AUTH || !profile) return;

    const plot = plots.find((entry) => entry.id === plotId);
    if (!plot?.cropId || !plot.harvestAt || plot.harvestAt > now) {
      if (plot?.cropId) toast.error('Crop is not ready yet.');
      return;
    }

    const crop = farmCrops.find((entry) => entry.id === plot.cropId);
    if (!crop) return;

    const nextPlots = plots.map((entry) => (entry.id === plotId ? buildEmptyPlot(entry.id) : entry));

    const seasonModifiers = getCropSeasonModifiers(crop.id, season);
    const totalYieldMultiplier = yieldMultiplier * seasonModifiers.yieldMultiplier * zoneModifiers.yield;
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
    toast.success(`Harvested ${crop.name} +${adjustedYield} ${goodName}${leveledUp ? ' · Farm level up!' : ''}.`);

    const anchor = plotRefs.current.get(plotId);
    if (anchor) {
      pushReward(`+${adjustedYield} ${goodName}`, { tone: 'item', anchor });
      pushReward(`+${xpGain} XP`, { tone: 'xp', anchor, delay: 120 });
    }
  };

  const handleHarvestAll = () => {
    if (!MOCK_AUTH || !profile) return;
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
      if (!crop) return;
      const seasonModifiers = getCropSeasonModifiers(crop.id, season);
      const totalYieldMultiplier = yieldMultiplier * seasonModifiers.yieldMultiplier * zoneModifiers.yield;
      const adjustedYield = Math.max(1, Math.round(crop.yieldAmount * totalYieldMultiplier));
      nextInventory = addItems(nextInventory, { [crop.yieldId]: adjustedYield });
      totalXp += Math.max(5, adjustedYield * 8);
      yieldTotals[crop.yieldId] = (yieldTotals[crop.yieldId] || 0) + adjustedYield;
    });

    const nextPlotsArr = plots.map((plot) => (readyIds.has(plot.id) ? buildEmptyPlot(plot.id) : plot));

    const { nextLevel, nextXp, leveledUp } = applyFarmXp(totalXp);
    const updated = characterService.updateMockProfile({
      farmPlots: nextPlotsArr,
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
      if (totalXp > 0) pushReward(`+${totalXp} XP`, { tone: 'xp', anchor, delay: yieldEntries.length * 120 });
    }
  };

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm2.webp')] bg-gray-900 bg-blend-multiply lg:pl-64 dashboard-shell">
      <Sidebar />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 pt-24">
        <FarmHeader farmLevel={farmLevel} />

        <div className="mb-8 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-8">
            <FarmStats
              farmXp={farmXp} farmXpTarget={farmXpTarget}
              landSize={landSize} gold={gold} farmWeather={farmWeather}
            />

            <Panel variant="card">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500 font-bold">Active Soil</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="secondary" size="sm" onClick={() => openPlantModal(null, 'bulk')} disabled={farmLevel < 10}>
                    Bulk Plant {farmLevel < 10 && '(L10)'}
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleHarvestAll} ref={harvestAllRef} disabled={farmLevel < 20}>
                    Harvest All {farmLevel < 20 && '(L20)'}
                  </Button>
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {plots.map((plot) => (
                  <PlotCard
                    key={plot.id} plot={plot} now={now}
                    openPlantModal={openPlantModal} handleHarvest={handleHarvest} plotRefs={plotRefs}
                  />
                ))}
              </div>
            </Panel>
          </div>

          <div className="space-y-8">
            <FarmUpgradePanel
              farmLevel={farmLevel} farmXp={farmXp} farmXpTarget={farmXpTarget}
              gold={gold} landSize={landSize} nextExpandCost={nextExpandCost}
              nextExpandFarmLevel={nextExpandFarmLevel} handleExpandLand={handleExpandLand}
              LAND_EXPAND_SIZE={LAND_EXPAND_SIZE}
            />
            <FarmWeatherPanel farmWeather={farmWeather} />
          </div>
        </div>
      </div>

      <SeedSelector
        isOpen={showPlantModal} plantMode={plantMode} farmLevel={farmLevel}
        season={season} inventory={inventory} handlePlant={handlePlant} onClose={closePlantModal}
      />
    </section>
  );
}
