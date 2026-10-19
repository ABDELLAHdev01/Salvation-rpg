import React, { useState } from 'react';
import audioManager from '../../core/audio/AudioManager';
import { getWorkshopItem } from '../../core/data/workshopData';
import { formatDuration } from '../../core/data/miningData';

export default function WorkshopWorldView({
  stations = [],
  recipes = {},
  jobs = [],
  workshopLevel = 1,
  onQueue = () => {},
  getOwnedForInput = () => 0,
  getInputName = (input) => input.id,
  className = '',
}) {
  const [selectedStationId, setSelectedStationId] = useState('smelter');
  const [craftQuantity, setCraftQuantity] = useState(1);

  // Spatial coordinates for the 5 workstations in the 2D interior hall
  const stationLayouts = {
    smelter: { x: 22, y: 32, label: 'Grand Smelter', icon: '🔥', glow: '#f97316' },
    kitchen: { x: 78, y: 32, label: 'Culinary Hearth', icon: '🍲', glow: '#eab308' },
    scriptorium: { x: 50, y: 52, label: 'Scriptorium & Lapidary', icon: '📜', glow: '#a855f7' },
    loom: { x: 24, y: 74, label: 'Arcane Loom', icon: '🧵', glow: '#06b6d4' },
    alchemy: { x: 76, y: 74, label: 'Alchemy Alembic', icon: '🧪', glow: '#10b981' },
  };

  const handleSelectStation = (stationId) => {
    audioManager.play('tap');
    setSelectedStationId(stationId);
    setCraftQuantity(1);
  };

  const selectedStation = stations.find((s) => s.id === selectedStationId) || stations[0];
  const stationRecipes = recipes[selectedStation?.id] || [];
  const activeStationJob = jobs.find((j) => {
    // Check if recipe belongs to selected station
    return stationRecipes.some((r) => r.id === j.recipeId);
  });

  const canCraftRecipe = (recipe, qty) => {
    return recipe.inputs.every((input) => getOwnedForInput(input) >= input.amount * qty);
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-3xl border-2 border-amber-800/40 bg-[#120f18] shadow-2xl ${className}`}>
      {/* 2D Workshop Interior Hall */}
      <div className="relative min-h-[640px] w-full p-4 sm:p-6 select-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#241c2e] via-[#171220] to-[#0d0914]">
        {/* Stone Masonry Floor Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3d2b5220_1px,transparent_1px),linear-gradient(to_bottom,#3d2b5220_1px,transparent_1px)] bg-[size:38px_38px] pointer-events-none" />

        {/* Interior Lighting & Forge Glow Rays */}
        <div className="absolute top-1/4 left-1/4 h-32 w-32 rounded-full bg-orange-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 h-32 w-32 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

        {/* Ambient Floating Fire Sparks */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute h-1.5 w-1.5 rounded-full bg-amber-400/50 blur-[0.5px] animate-ping" style={{ top: '28%', left: '24%', animationDuration: '3s' }} />
          <div className="absolute h-1.5 w-1.5 rounded-full bg-orange-500/50 blur-[0.5px] animate-pulse" style={{ top: '35%', left: '20%', animationDuration: '2s' }} />
          <div className="absolute h-1.5 w-1.5 rounded-full bg-purple-400/40 blur-[0.5px] animate-pulse" style={{ top: '50%', left: '52%', animationDuration: '4s' }} />
        </div>

        {/* =========================================================================
            5 INTERACTIVE WORKSTATIONS
            ========================================================================= */}
        {stations.map((station) => {
          const layout = stationLayouts[station.id] || { x: 50, y: 50, label: station.name, icon: '⚒️', glow: '#f59e0b' };
          const isSelected = selectedStation?.id === station.id;
          const isUnlocked = workshopLevel >= (station.unlockLevel || 1);
          const hasActiveJob = jobs.some((j) => (recipes[station.id] || []).some((r) => r.id === j.recipeId));

          return (
            <div
              key={station.id}
              onClick={() => handleSelectStation(station.id)}
              className={`absolute cursor-pointer transition-all duration-200 z-20 ${
                isSelected ? 'scale-108' : 'hover:scale-103'
              }`}
              style={{
                left: `${layout.x}%`,
                top: `${layout.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 p-3.5 transition-all ${
                  isSelected
                    ? 'border-yellow-400 bg-gray-900/90 shadow-2xl ring-2 ring-yellow-400/50'
                    : hasActiveJob
                    ? 'border-amber-500/80 bg-gray-950/80 shadow-lg shadow-orange-950/50'
                    : isUnlocked
                    ? 'border-yellow-800/40 bg-gray-950/70 hover:border-yellow-600/60'
                    : 'border-gray-800/60 bg-gray-950/40 opacity-50'
                } w-40 h-34 sm:w-48 sm:h-38`}
                style={{
                  boxShadow: isSelected ? `0 0 25px ${layout.glow}40` : undefined,
                }}
              >
                {/* Station Signpost */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-yellow-700/50 bg-gray-950/90 px-2.5 py-0.5 shadow-md truncate max-w-[140px]">
                  <span className="font-serif text-[10px] font-bold text-yellow-300">
                    {station.name}
                  </span>
                </div>

                {/* Pixel Station Graphic & Animation */}
                <div className="relative flex flex-col items-center">
                  <span className="text-3xl select-none filter drop-shadow">
                    {layout.icon}
                  </span>

                  {/* Active Job Flame or Glow Effect */}
                  {hasActiveJob && (
                    <div className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                      </span>
                    </div>
                  )}

                  {/* Status Indicator */}
                  <div className="mt-2 text-center">
                    {isUnlocked ? (
                      hasActiveJob ? (
                        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30 animate-pulse">
                          ⚡ Crafting
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800/40">
                          Idle / Ready
                        </span>
                      )
                    ) : (
                      <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[9px] font-mono text-gray-500">
                        🔒 Lvl {station.unlockLevel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* =========================================================================
            BOTTOM CONTEXTUAL WORKBENCH DOCK: SELECTED STATION RECIPES & CRAFTING
            ========================================================================= */}
        {selectedStation && (
          <div className="absolute inset-x-4 bottom-4 z-30 max-h-[290px] overflow-y-auto rounded-2xl border-2 border-yellow-700/50 bg-gray-950/95 p-4 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-2 duration-200 sm:inset-x-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{stationLayouts[selectedStation.id]?.icon || '⚒️'}</span>
                <div>
                  <h3 className="font-serif text-base font-bold text-white sm:text-lg">
                    {selectedStation.name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {selectedStation.description}
                  </p>
                </div>
              </div>

              {activeStationJob && (
                <div className="rounded-xl border border-amber-600/40 bg-amber-950/30 px-3 py-1.5 text-xs text-amber-300">
                  <span>⚡ Active: {formatDuration(Math.max(0, activeStationJob.finishAt - Date.now()))}</span>
                </div>
              )}
            </div>

            {/* Recipes Grid for Selected Station */}
            <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {stationRecipes.map((recipe) => {
                const output = recipe.outputs?.[0];
                const outputItem = output ? getWorkshopItem(output.id) : null;
                const canCraft = canCraftRecipe(recipe, craftQuantity);

                return (
                  <div
                    key={recipe.id}
                    className={`rounded-xl border p-3 transition-all ${
                      canCraft
                        ? 'border-yellow-700/30 bg-gray-900/70 hover:border-yellow-500/50'
                        : 'border-gray-800/50 bg-gray-950/50 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">
                        {outputItem?.name || recipe.id}
                      </span>
                      <span className="font-mono text-[10px] text-yellow-400">
                        ⏱ {formatDuration(recipe.craftMs)}
                      </span>
                    </div>

                    {/* Inputs Required */}
                    <div className="mt-2 space-y-0.5 text-[11px] text-gray-300">
                      {recipe.inputs.map((input) => {
                        const needed = input.amount * craftQuantity;
                        const owned = getOwnedForInput(input);
                        const hasEnough = owned >= needed;
                        return (
                          <div key={input.id} className="flex justify-between">
                            <span className="text-gray-400 truncate max-w-[120px]">{getInputName(input)}:</span>
                            <span className={`font-mono ${hasEnough ? 'text-emerald-400' : 'text-red-400'}`}>
                              {owned}/{needed}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Craft Action & Quantity Selector */}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setCraftQuantity((q) => Math.max(1, q - 1))}
                          className="h-6 w-6 rounded bg-gray-800 text-xs font-bold text-gray-300 hover:text-white"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-mono text-xs text-yellow-300">
                          {craftQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCraftQuantity((q) => q + 1)}
                          className="h-6 w-6 rounded bg-gray-800 text-xs font-bold text-gray-300 hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          audioManager.play('craft');
                          onQueue(recipe.id, craftQuantity);
                        }}
                        disabled={!canCraft}
                        className={`rounded-lg px-3 py-1 text-xs font-bold transition active:scale-95 ${
                          canCraft
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-950 shadow-md hover:brightness-110'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        ⚡ Craft
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
