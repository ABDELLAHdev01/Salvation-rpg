import React, { useState } from 'react';
import audioManager from '../../core/audio/AudioManager';
import { farmAnimals, farmGoods } from '../../core/data/farmData';
import { formatDuration } from '../../core/data/miningData';
import {
  PixelAnimalSprite,
  PixelBarn,
  PixelTree,
  PixelWell,
  PixelLantern,
} from '../../core/world/pixelAssets';

export default function AnimalPastureWorldView({
  animals = {},
  inventory = {},
  gold = 0,
  farmLevel = 1,
  now = Date.now(),
  onCollect = () => {},
  onFeed = () => {},
  onBuy = () => {},
  className = '',
}) {
  const [selectedAnimalId, setSelectedAnimalId] = useState(null);
  const [pettingEmotes, setPettingEmotes] = useState([]);

  // Spatial layout mapping for the 6 livestock paddocks
  const paddockLayouts = {
    chicken: { x: 22, y: 32, label: 'Hen House', fenceColor: '#78350f' },
    cow: { x: 50, y: 36, label: 'Cattle Meadow', fenceColor: '#78350f' },
    sheep: { x: 78, y: 32, label: 'Wool Pasture', fenceColor: '#78350f' },
    goat: { x: 22, y: 72, label: 'Goat Ridge', fenceColor: '#78350f' },
    bee: { x: 50, y: 76, label: 'Sunforge Apiary', fenceColor: '#78350f' },
    pig: { x: 78, y: 72, label: 'Mud Pen', fenceColor: '#78350f' },
  };

  const handleSelectAnimal = (animalId) => {
    audioManager.play('tap');
    setSelectedAnimalId(animalId);
  };

  const handlePetAnimal = (animalId, e) => {
    e.stopPropagation();
    audioManager.play('tap');
    const id = Date.now() + Math.random();
    setPettingEmotes((prev) => [...prev, { id, animalId }]);
    setTimeout(() => {
      setPettingEmotes((prev) => prev.filter((item) => item.id !== id));
    }, 1200);
  };

  const selectedAnimalData = selectedAnimalId
    ? farmAnimals.find((a) => a.id === selectedAnimalId)
    : null;
  const selectedState = selectedAnimalId ? animals[selectedAnimalId] || { count: 0, lastCollectedAt: 0 } : null;

  return (
    <div className={`relative w-full overflow-hidden rounded-3xl border-2 border-emerald-800/40 bg-[#0f2314] shadow-2xl ${className}`}>
      {/* Pasture Scene Canvas */}
      <div className="relative min-h-[640px] w-full p-4 sm:p-6 select-none bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#1d4323] via-[#133018] to-[#0a1a0d]">
        {/* Grassy Meadow Grid Texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a5c3120_1px,transparent_1px),linear-gradient(to_bottom,#2a5c3120_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />

        {/* Decorative Scenery: Red Timber Barn at Top Center */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none z-10 opacity-95">
          <PixelBarn />
        </div>

        {/* Stone Water Well on Left */}
        <div className="absolute top-4 left-6 pointer-events-none z-10 hidden sm:block">
          <PixelWell />
        </div>

        {/* Pastoral Trees & Lanterns */}
        <div className="absolute top-4 right-6 pointer-events-none z-10 hidden sm:block">
          <PixelTree />
        </div>
        <div className="absolute top-1/2 left-4 -translate-y-1/2 pointer-events-none opacity-60">
          <PixelLantern isFlickering={true} />
        </div>
        <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none opacity-60">
          <PixelLantern isFlickering={true} />
        </div>

        {/* Wildflower Patches */}
        <div className="absolute top-28 left-16 text-xs opacity-70 pointer-events-none">🌼🌸🌼</div>
        <div className="absolute top-28 right-20 text-xs opacity-70 pointer-events-none">🌻🌼🌻</div>
        <div className="absolute bottom-6 left-12 text-xs opacity-60 pointer-events-none">🌾🌾🌼</div>
        <div className="absolute bottom-6 right-16 text-xs opacity-60 pointer-events-none">🌸🌾🌸</div>

        {/* =========================================================================
            6 INTERACTIVE LIVESTOCK PADDOCKS
            ========================================================================= */}
        {farmAnimals.map((animal) => {
          const paddock = paddockLayouts[animal.id] || { x: 50, y: 50, label: animal.name };
          const entry = animals[animal.id] || { count: 0, lastCollectedAt: 0 };
          const owned = entry.count || 0;
          const isSelected = selectedAnimalId === animal.id;

          const last = entry.lastCollectedAt || now;
          const cycleMs = animal.produceEveryMs;
          const remaining = Math.max(0, cycleMs - (now - last));
          const isReady = owned > 0 && remaining <= 0;
          const goodName = farmGoods.find((g) => g.id === animal.produceId)?.name || 'Goods';

          return (
            <div
              key={animal.id}
              onClick={() => handleSelectAnimal(animal.id)}
              className={`absolute cursor-pointer transition-all duration-200 z-20 ${
                isSelected ? 'scale-105' : 'hover:scale-102'
              }`}
              style={{
                left: `${paddock.x}%`,
                top: `${paddock.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Wooden Paddock Pen Boundary */}
              <div
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 p-3 transition-all ${
                  isSelected
                    ? 'border-yellow-400 bg-emerald-950/80 shadow-2xl shadow-yellow-900/40 ring-2 ring-yellow-400/50'
                    : isReady
                    ? 'border-amber-400/70 bg-emerald-950/60 shadow-lg shadow-amber-950/50 animate-pulse'
                    : 'border-yellow-900/50 bg-emerald-950/40 hover:border-yellow-600/60'
                } w-36 h-32 sm:w-44 sm:h-36`}
              >
                {/* Paddock Signpost */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-yellow-700/50 bg-gray-950/90 px-2 py-0.5 shadow-md">
                  <span className="font-serif text-[10px] font-bold text-yellow-300">
                    {paddock.label}
                  </span>
                </div>

                {/* Animals Inside Paddock */}
                {owned > 0 ? (
                  <div className="relative flex flex-col items-center">
                    {/* Animal Sprites Cluster */}
                    <div className="relative flex items-center justify-center gap-1">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 transition-transform hover:scale-110">
                        <PixelAnimalSprite type={animal.id} />
                      </div>
                      {owned > 1 && (
                        <div className="h-8 w-8 sm:h-9 sm:w-9 opacity-90 -ml-2 -mt-2">
                          <PixelAnimalSprite type={animal.id} />
                        </div>
                      )}
                    </div>

                    {/* Pet Heart Emotes Floating */}
                    {pettingEmotes
                      .filter((e) => e.animalId === animal.id)
                      .map((e) => (
                        <span
                          key={e.id}
                          className="absolute -top-6 text-base animate-bounce text-red-400 font-bold pointer-events-none drop-shadow"
                        >
                          ❤️ Happy!
                        </span>
                      ))}

                    {/* Readiness Badge / Timer Badge */}
                    <div className="mt-2 flex items-center gap-1">
                      {isReady ? (
                        <span className="rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-gray-950 shadow-sm animate-pulse">
                          🧺 Ready ({animal.produceAmount * owned} {goodName})
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-950/70 px-2 py-0.5 text-[10px] font-mono text-gray-300">
                          ⏳ {formatDuration(remaining)}
                        </span>
                      )}
                    </div>

                    {/* Count Pill */}
                    <span className="mt-1 text-[9px] font-semibold text-emerald-300">
                      Flock: {owned}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <span className="text-xl opacity-40">🪵</span>
                    <span className="text-[10px] font-semibold text-gray-400 mt-1">
                      Empty Pen
                    </span>
                    <span className="text-[9px] text-yellow-400/80">
                      {animal.price}g · Lvl {animal.levelRequired}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* =========================================================================
            BOTTOM CONTEXTUAL DOCK: SELECTED ANIMAL STATUS & PASTORAL ACTIONS
            ========================================================================= */}
        {selectedAnimalData && (
          <div className="absolute inset-x-4 bottom-4 z-30 rounded-2xl border-2 border-yellow-700/50 bg-gray-950/95 p-4 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-2 duration-200 sm:inset-x-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Left: Animal Details */}
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl border border-yellow-700/40 bg-emerald-950/80 p-1 flex items-center justify-center shrink-0">
                  <PixelAnimalSprite type={selectedAnimalData.id} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-base font-bold text-white sm:text-lg">
                      {selectedAnimalData.name}
                    </h3>
                    <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-[10px] font-bold text-yellow-300">
                      Owned: {selectedState?.count || 0}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300">
                    Yields {selectedAnimalData.produceAmount} {farmGoods.find((g) => g.id === selectedAnimalData.produceId)?.name || 'Goods'} every {formatDuration(selectedAnimalData.produceEveryMs)}.
                  </p>
                </div>
              </div>

              {/* Right: Interactive Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Pet Button */}
                {(selectedState?.count || 0) > 0 && (
                  <button
                    type="button"
                    onClick={(e) => handlePetAnimal(selectedAnimalData.id, e)}
                    className="flex items-center gap-1 rounded-xl border border-pink-700/40 bg-pink-950/40 px-3 py-2 text-xs font-semibold text-pink-300 hover:bg-pink-900/40 transition active:scale-95"
                    title="Pet and nurture your flock"
                  >
                    <span>💛</span>
                    <span>Pet Flock</span>
                  </button>
                )}

                {/* Feed Button (-1 Wheat/Turnip -> cuts remaining timer by 50%) */}
                {(selectedState?.count || 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      audioManager.play('tap');
                      onFeed(selectedAnimalData.id);
                    }}
                    className="flex items-center gap-1 rounded-xl border border-emerald-700/40 bg-emerald-950/60 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50 transition active:scale-95"
                    title="Feed with Wheat or Turnip to accelerate cycle by 50%"
                  >
                    <span>🌾</span>
                    <span>Feed Grain ({(inventory?.wheat || 0) + (inventory?.turnip || 0)} left)</span>
                  </button>
                )}

                {/* Collect Button */}
                {(selectedState?.count || 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      audioManager.play('harvest');
                      onCollect(selectedAnimalData.id);
                    }}
                    disabled={
                      Math.max(
                        0,
                        selectedAnimalData.produceEveryMs -
                          (now - (selectedState.lastCollectedAt || now))
                      ) > 0
                    }
                    className="flex items-center gap-1.5 rounded-xl border border-amber-500 bg-gradient-to-r from-amber-500 to-yellow-600 px-4 py-2 text-xs font-bold text-gray-950 shadow-lg shadow-amber-950/50 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-95"
                  >
                    <span>🧺</span>
                    <span>Collect Produce</span>
                  </button>
                )}

                {/* Buy / Purchase More */}
                <button
                  type="button"
                  onClick={() => {
                    audioManager.play('coin');
                    onBuy(selectedAnimalData.id);
                  }}
                  disabled={farmLevel < selectedAnimalData.levelRequired || gold < selectedAnimalData.price}
                  className="flex items-center gap-1.5 rounded-xl border border-yellow-600/50 bg-gray-900 px-3 py-2 text-xs font-semibold text-yellow-300 hover:border-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <span>🛒</span>
                  <span>Buy (+1) · {selectedAnimalData.price}g</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAnimalId(null)}
                  className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
