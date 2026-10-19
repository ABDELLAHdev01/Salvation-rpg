import React, { useState, useMemo, useEffect, useRef } from 'react';
import { formatDuration } from '../../core/data/miningData';
import { farmCrops, farmGoods, getCropSeasonModifiers } from '../../core/data/farmData';
import { getSeedItemId } from '../../core/data/itemsCatalog';
import { getItemCount } from '../../core/services/inventoryService';
import audioManager from '../../core/audio/AudioManager';
import {
  PixelPlotSoil,
  PixelCropSprite,
  PixelAnimalSprite,
  PixelBarn,
  PixelWell,
  PixelTree,
  PixelLantern,
} from '../../core/world/pixelAssets';

export default function FarmWorldView({
  plots = [],
  landSize = 3,
  now = Date.now(),
  inventory = {},
  farmLevel = 1,
  farmWeather = null,
  nextExpandCost = 350,
  nextExpandFarmLevel = 2,
  canExpand = false,
  onPlant = () => {},
  onHarvest = () => {},
  onHarvestAll = () => {},
  onExpandLand = () => {},
  onFeedAnimal = () => {},
  pushReward = () => {},
  className = '',
}) {
  const [selectedPlotId, setSelectedPlotId] = useState(null);
  const [selectedAnimalType, setSelectedAnimalType] = useState(null);
  const [harvestingPlotId, setHarvestingPlotId] = useState(null);
  const [plantingPlotId, setPlantingPlotId] = useState(null);
  const plotDomRefs = useRef(new Map());

  // Ambient animal roaming positions
  const [animalOffsets, setAnimalOffsets] = useState([
    { type: 'chicken', x: 25, y: 18, dir: 1 },
    { type: 'chicken', x: 42, y: 22, dir: -1 },
    { type: 'sheep', x: 65, y: 15, dir: 1 },
    { type: 'cow', x: 80, y: 20, dir: -1 },
  ]);

  // Gentle roaming interval
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimalOffsets((prev) =>
        prev.map((animal) => {
          const deltaX = (Math.random() - 0.5) * 4;
          const nextX = Math.max(10, Math.min(88, animal.x + deltaX));
          return {
            ...animal,
            x: nextX,
            dir: deltaX >= 0 ? 1 : -1,
          };
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const season = farmWeather?.season || 'Spring';

  // Seed inventory status
  const seedOptions = useMemo(() => {
    return farmCrops.map((crop) => {
      const seedItemId = getSeedItemId(crop.id);
      const count = getItemCount(inventory, seedItemId);
      const seasonMod = getCropSeasonModifiers(crop.id, season);
      const estGrowMs = Math.round(crop.growMs * (seasonMod.growMultiplier || 1));
      return {
        ...crop,
        seedItemId,
        count,
        estGrowMs,
        isUnlocked: farmLevel >= crop.levelRequired,
      };
    });
  }, [inventory, farmLevel, season]);

  // Selected plot object
  const activePlot = useMemo(() => {
    if (selectedPlotId === null) return null;
    return plots.find((p) => p.id === selectedPlotId) || null;
  }, [plots, selectedPlotId]);

  const activeCrop = useMemo(() => {
    if (!activePlot?.cropId) return null;
    return farmCrops.find((c) => c.id === activePlot.cropId) || null;
  }, [activePlot]);

  // Growth calculations for plots
  const plotStates = useMemo(() => {
    return plots.map((plot) => {
      if (!plot.cropId) {
        return { ...plot, stage: 0, isReady: false, remainingMs: 0, crop: null };
      }
      const crop = farmCrops.find((c) => c.id === plot.cropId);
      const remainingMs = plot.harvestAt ? Math.max(0, plot.harvestAt - now) : 0;
      const isReady = remainingMs <= 0;
      const totalDuration = crop ? crop.growMs : 180000;
      const elapsed = Math.max(0, now - (plot.plantedAt || now));
      const progress = isReady ? 1.0 : Math.min(0.99, elapsed / totalDuration);

      let stage = 1; // Sprout
      if (progress >= 1.0) stage = 4; // Mature
      else if (progress >= 0.7) stage = 3; // Growing plant
      else if (progress >= 0.35) stage = 2; // Seedling

      return {
        ...plot,
        crop,
        stage,
        isReady,
        remainingMs,
        progress,
      };
    });
  }, [plots, now]);

  const readyCount = useMemo(() => plotStates.filter((p) => p.isReady).length, [plotStates]);

  const handlePlotClick = (plot) => {
    audioManager.play('tap');
    setSelectedAnimalType(null);

    // If mature crop, harvest directly!
    if (plot.isReady) {
      triggerHarvest(plot.id);
      return;
    }

    setSelectedPlotId(plot.id);
  };

  const triggerHarvest = (plotId) => {
    setHarvestingPlotId(plotId);
    audioManager.play('harvest');

    const domNode = plotDomRefs.current.get(plotId);
    if (domNode && pushReward) {
      const p = plotStates.find((item) => item.id === plotId);
      const goodName = farmGoods.find((g) => g.id === p?.crop?.yieldId)?.name || 'Crops';
      pushReward(`+${p?.crop?.yieldAmount || 3} ${goodName}`, { tone: 'item', anchor: domNode });
      pushReward(`+24 XP`, { tone: 'xp', anchor: domNode, delay: 120 });
    }

    onHarvest(plotId);

    setTimeout(() => {
      setHarvestingPlotId(null);
    }, 450);
  };

  const handleSelectSeed = (cropId) => {
    if (selectedPlotId === null) return;
    setPlantingPlotId(selectedPlotId);
    audioManager.play('tap');
    onPlant(cropId, selectedPlotId);

    setTimeout(() => {
      setPlantingPlotId(null);
      setSelectedPlotId(null);
    }, 250);
  };

  const handleAnimalClick = (animal) => {
    audioManager.play('tap');
    setSelectedPlotId(null);
    setSelectedAnimalType(animal.type);
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-3xl border-2 border-yellow-700/40 bg-[#162514] shadow-2xl ${className}`}>
      {/* 2D Fantasy World Sky & Landscape Backdrop */}
      <div className="relative min-h-[580px] w-full p-4 sm:p-6 select-none bg-gradient-to-b from-[#1b331a] via-[#1f3d1e] to-[#142613]">
        {/* Distant Trees & Horizon Canopy */}
        <div className="absolute inset-x-0 top-0 h-28 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-800/40 via-transparent to-transparent pointer-events-none" />

        {/* Ambient Floating Dust / Pollen Motes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute h-2 w-2 rounded-full bg-yellow-200/30 blur-[1px] animate-ping" style={{ top: '25%', left: '15%', animationDuration: '6s' }} />
          <div className="absolute h-2 w-2 rounded-full bg-emerald-300/30 blur-[1px] animate-pulse" style={{ top: '65%', left: '75%', animationDuration: '4s' }} />
          <div className="absolute h-1.5 w-1.5 rounded-full bg-yellow-100/40 blur-[1px] animate-ping" style={{ top: '40%', left: '60%', animationDuration: '5s' }} />
        </div>

        {/* =========================================================================
            UPPER ESTATE: TIMBER BARN, WELL, PASTURE & LIVESTOCK
            ========================================================================= */}
        <div className="relative z-10 mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-emerald-900/50 pb-5">
          {/* Barn House & Well */}
          <div className="flex items-end gap-3 sm:gap-6">
            <div className="relative group cursor-pointer" title="Estate Granary & Barn">
              <PixelBarn className="transition-transform group-hover:scale-105" />
              <div className="absolute -top-3 left-10 h-3 w-3 rounded-full bg-gray-400/40 animate-ping" />
            </div>
            <div className="relative group cursor-pointer" title="Estate Spring Well">
              <PixelWell className="transition-transform group-hover:scale-105" />
            </div>
            <div className="hidden sm:block">
              <PixelTree />
            </div>
          </div>

          {/* Pasture: Interactive Roaming Pixel Animals */}
          <div className="relative flex-1 min-w-[260px] h-20 rounded-2xl border border-yellow-800/30 bg-[#122311]/70 p-2 shadow-inner overflow-hidden">
            <p className="absolute top-1.5 left-3 text-[9px] uppercase font-bold tracking-widest text-emerald-400/70">
              Pasture Meadow
            </p>
            {animalOffsets.map((animal, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAnimalClick(animal)}
                className="absolute bottom-2 transition-all duration-700 ease-out hover:scale-125 focus:outline-none"
                style={{
                  left: `${animal.x}%`,
                  transform: `scaleX(${animal.dir})`,
                }}
                title={`Click to feed ${animal.type}`}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10">
                  <PixelAnimalSprite type={animal.type} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* =========================================================================
            MIDDLE ESTATE: SOIL PLOTS GRID
            Direct interactive tile-based cultivation field
            ========================================================================= */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PixelLantern className="hidden sm:block" />
              <h2 className="font-serif text-sm font-bold tracking-wider text-yellow-200 uppercase sm:text-base">
                Cultivation Fields
              </h2>
              <span className="rounded-full bg-emerald-950/80 border border-emerald-700/40 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                {plots.length} / {landSize} Plots
              </span>
            </div>

            {/* Quick Batch Actions */}
            <div className="flex items-center gap-2">
              {readyCount > 0 && (
                <button
                  type="button"
                  onClick={onHarvestAll}
                  className="flex items-center gap-1.5 rounded-xl border border-yellow-500/80 bg-gradient-to-r from-yellow-600 to-amber-500 px-3 py-1.5 text-xs font-bold text-gray-950 shadow-lg shadow-yellow-900/50 hover:brightness-110 active:scale-95 transition"
                >
                  <span>🌾</span>
                  <span>Harvest All ({readyCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Plot Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {plotStates.map((plot) => {
              const isSelected = selectedPlotId === plot.id;
              const isHarvesting = harvestingPlotId === plot.id;
              const isPlanting = plantingPlotId === plot.id;

              return (
                <div
                  key={plot.id}
                  ref={(el) => {
                    if (el) plotDomRefs.current.set(plot.id, el);
                    else plotDomRefs.current.delete(plot.id);
                  }}
                  onClick={() => handlePlotClick(plot)}
                  className={`group relative flex flex-col items-center justify-center rounded-2xl p-2.5 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-yellow-400 bg-yellow-950/30 scale-[1.03] shadow-xl'
                      : 'hover:bg-emerald-900/30 hover:scale-[1.02]'
                  } ${isHarvesting ? 'animate-bounce' : ''} ${isPlanting ? 'animate-pulse' : ''}`}
                >
                  {/* Soil Base with Furrows */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                    <PixelPlotSoil
                      isWatered={plot.stage > 0 && !plot.isReady}
                      isSelected={isSelected}
                    />

                    {/* Growing Crop Sprite Centered on Soil */}
                    {plot.stage > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center p-2 transition-transform duration-300 group-hover:scale-110">
                        <PixelCropSprite
                          cropId={plot.cropId}
                          stage={plot.stage}
                          isReady={plot.isReady}
                        />
                      </div>
                    )}

                    {/* Harvest Aura Beacon */}
                    {plot.isReady && (
                      <div className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-gray-950 text-xs font-black shadow-lg shadow-yellow-500/50 animate-bounce">
                        ✓
                      </div>
                    )}
                  </div>

                  {/* Under-plot Label & Timer */}
                  <div className="mt-1.5 text-center">
                    <p className="text-[10px] font-bold text-gray-300 truncate max-w-[90px]">
                      {plot.crop ? plot.crop.name : 'Empty Soil'}
                    </p>
                    {plot.crop && !plot.isReady && (
                      <span className="font-mono text-[9px] text-cyan-300">
                        {formatDuration(plot.remainingMs)}
                      </span>
                    )}
                    {plot.isReady && (
                      <span className="font-bold text-[9px] text-yellow-300 uppercase tracking-wider">
                        Ready!
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Locked Expansion Plots */}
            {canExpand && (
              <div
                onClick={onExpandLand}
                className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-700/50 p-2.5 hover:border-yellow-500/70 hover:bg-yellow-950/20 transition-all cursor-pointer"
                title={`Expand Land: ${nextExpandCost}g (Requires Farm L${nextExpandFarmLevel})`}
              >
                <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-xl bg-black/30 text-emerald-400/60 group-hover:text-yellow-300">
                  <span className="text-3xl">+</span>
                </div>
                <div className="mt-1 text-center">
                  <p className="text-[10px] font-bold text-yellow-300">Expand Plot</p>
                  <span className="text-[9px] font-mono text-gray-400">{nextExpandCost}g</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            LOWER DOCK: CONTEXTUAL ACTION DRAWER
            Presents actions cleanly for the selected object without covering the world
            ========================================================================= */}
        {activePlot && (
          <div className="mt-6 rounded-2xl border-2 border-yellow-700/40 bg-gray-950/95 p-4 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-yellow-700/20 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                  Selected: Plot #{activePlot.id + 1}
                </span>
                <h3 className="font-serif text-base font-bold text-white">
                  {activeCrop ? activeCrop.name : 'Fallow Earth Ready for Sowing'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlotId(null)}
                className="rounded-lg p-1 text-gray-400 hover:text-white"
                title="Deselect plot"
              >
                ✕
              </button>
            </div>

            {/* If Plot is Empty: Seed Selection Carousel */}
            {!activeCrop ? (
              <div className="mt-3">
                <p className="text-xs text-gray-300 mb-2">Select a seed to sow in this plot:</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                  {seedOptions.map((seed) => {
                    const canAfford = seed.count > 0;
                    return (
                      <button
                        key={seed.id}
                        type="button"
                        disabled={!seed.isUnlocked || !canAfford}
                        onClick={() => handleSelectSeed(seed.id)}
                        className={`flex flex-col items-center rounded-xl border p-2 text-center transition ${
                          seed.isUnlocked && canAfford
                            ? 'border-yellow-700/40 bg-gray-900/80 hover:border-yellow-400 hover:bg-yellow-950/40 text-white'
                            : 'border-gray-800 bg-gray-950/50 opacity-40 cursor-not-allowed text-gray-500'
                        }`}
                      >
                        <span className="font-bold text-xs truncate w-full">{seed.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                          {formatDuration(seed.estGrowMs)}
                        </span>
                        <div className="mt-1 flex items-center gap-1 text-[10px]">
                          <span className={seed.count > 0 ? 'text-amber-300 font-bold' : 'text-rose-400'}>
                            {seed.count} Owned
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* If Plot Has Crop: Status & Harvest Actions */
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-300">
                    Growth Stage: <span className="font-bold text-yellow-300">{activePlot.stage}/4</span> · Yield: <span className="text-emerald-300 font-bold">+{activeCrop.yieldAmount} Crops</span>
                  </p>
                  {!activePlot.isReady && (
                    <p className="text-xs text-cyan-300 font-mono mt-0.5">
                      Ripening in {formatDuration(activePlot.remainingMs)}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {activePlot.isReady ? (
                    <button
                      type="button"
                      onClick={() => triggerHarvest(activePlot.id)}
                      className="rounded-xl border border-yellow-500 bg-yellow-500 px-5 py-2 text-xs font-bold text-gray-950 hover:bg-yellow-400 active:scale-95 shadow-lg shadow-yellow-900/50 transition"
                    >
                      Harvest Crop Now
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-gray-400 italic">
                      Soil is moist and nourished
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Selected Animal Feed Drawer */}
        {selectedAnimalType && (
          <div className="mt-6 rounded-2xl border-2 border-emerald-700/40 bg-gray-950/95 p-4 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between border-b border-emerald-800/30 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌾</span>
                <h3 className="font-serif text-sm font-bold text-white capitalize">
                  {selectedAnimalType} Pasture
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAnimalType(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <p className="text-gray-300">
                Feeding your livestock with harvested Wheat or Turnips boosts production cycles by <span className="text-emerald-300 font-bold">+50%</span>.
              </p>
              <button
                type="button"
                onClick={() => {
                  onFeedAnimal(selectedAnimalType);
                  setSelectedAnimalType(null);
                }}
                className="rounded-xl border border-emerald-500 bg-emerald-600/80 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition"
              >
                Feed with Wheat/Turnip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
