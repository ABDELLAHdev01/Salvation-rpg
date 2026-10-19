import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../../shared/layout/Sidebar';
import XpBar from '../../shared/ui/XpBar';
import { useRewardFloat } from '../../shared/feedback/RewardFloatProvider';
import authService from '../../core/services/AuthService';
import characterService from '../../core/services/CharacterService';
import { farmAnimals, farmGoods, getFarmXpForLevel } from '../../core/data/farmData';
import { formatDuration } from '../../core/data/miningData';
import { addItems, removeItems } from '../../core/services/inventoryService';
import audioManager from '../../core/audio/AudioManager';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';
const UI_TICK_MS = 3000;

const normalizeAnimals = (animals) => {
  const safe = animals && typeof animals === 'object' ? animals : {};
  return farmAnimals.reduce((acc, animal) => {
    const entry = safe[animal.id] || {};
    acc[animal.id] = {
      count: entry.count || 0,
      lastCollectedAt: entry.lastCollectedAt || 0,
    };
    return acc;
  }, {});
};

export default function FarmAnimals() {
  const [profile, setProfile] = useState(null);
  const [now, setNow] = useState(Date.now());
  const animalRefs = useRef(new Map());
  const pushReward = useRewardFloat();

  useEffect(() => {
    if (!MOCK_AUTH) {
      return;
    }

    const username = authService.getCurrentUsername();
    const nextProfile = characterService.getMockProfile(username);
    setProfile(nextProfile);

    const timer = setInterval(() => setNow(Date.now()), UI_TICK_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!MOCK_AUTH || !profile) {
      return;
    }

    const animals = normalizeAnimals(profile.farmAnimals);
    if (JSON.stringify(animals) !== JSON.stringify(profile.farmAnimals || {})) {
      const updated = characterService.updateMockProfile({
        farmAnimals: animals,
      });
      setProfile(updated);
    }
  }, [profile]);

  const farmLevel = profile?.farmLevel ?? 1;
  const farmXp = profile?.farmXp ?? 0;
  const gold = profile?.stats?.gold ?? 0;
  const animals = useMemo(() => normalizeAnimals(profile?.farmAnimals), [profile]);
  const inventory = profile?.inventory || {};
  const farmXpTarget = getFarmXpForLevel(farmLevel);
  const animalYieldMultiplier = 1;
  const animalSpeedMultiplier = 1;

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

  const handleCollectAnimals = (animalId) => {
    if (!MOCK_AUTH || !profile) {
      return;
    }

    const animal = farmAnimals.find((entry) => entry.id === animalId);
    if (!animal) {
      return;
    }

    const current = animals[animalId] || { count: 0, lastCollectedAt: 0 };
    if (current.count <= 0) {
      return;
    }

    const last = current.lastCollectedAt || now;
    const adjustedInterval = Math.max(60 * 1000, Math.round(animal.produceEveryMs * animalSpeedMultiplier));
    const cycles = Math.floor((now - last) / adjustedInterval);
    if (cycles <= 0) {
      toast.error('No produce ready yet.');
      return;
    }

    const totalProduce = Math.max(
      1,
      Math.round(cycles * current.count * animal.produceAmount * animalYieldMultiplier)
    );
    const nextAnimals = {
      ...animals,
      [animalId]: {
        count: current.count,
        lastCollectedAt: last + cycles * adjustedInterval,
      },
    };

    const nextInventory = addItems(inventory, { [animal.produceId]: totalProduce });

    const goodName = farmGoods.find((good) => good.id === animal.produceId)?.name || 'Goods';

    const xpGain = totalProduce * 4;
    const { nextLevel, nextXp, leveledUp } = applyFarmXp(xpGain);

    const updated = characterService.updateMockProfile({
      farmAnimals: nextAnimals,
      inventory: nextInventory,
      farmLevel: nextLevel,
      farmXp: nextXp,
    });

    setProfile(updated);
    audioManager.play('coin');
    toast.success(
      `Collected ${totalProduce} ${goodName}${leveledUp ? ' · Farm level up!' : ''}.`
    );

    const anchor = animalRefs.current.get(animalId);
    if (anchor) {
      pushReward(`+${totalProduce} ${goodName}`, { tone: 'item', anchor });
      pushReward(`+${xpGain} XP`, { tone: 'xp', anchor, delay: 120 });
    }
  };

  const handleBuyAnimal = (animalId) => {
    if (!MOCK_AUTH || !profile) return;
    const animal = farmAnimals.find((entry) => entry.id === animalId);
    if (!animal) return;
    if (farmLevel < animal.levelRequired) {
      toast.error(`Requires Farm Level ${animal.levelRequired}.`);
      return;
    }
    if (gold < animal.price) {
      toast.error(`Not enough gold. Costs ${animal.price} gold.`);
      return;
    }

    const current = animals[animalId] || { count: 0, lastCollectedAt: 0 };
    const nextAnimals = {
      ...animals,
      [animalId]: {
        count: current.count + 1,
        lastCollectedAt: current.count === 0 ? now : current.lastCollectedAt,
      },
    };

    const nextStats = {
      ...profile.stats,
      gold: gold - animal.price,
    };

    const updated = characterService.updateMockProfile({
      farmAnimals: nextAnimals,
      stats: nextStats,
    });
    setProfile(updated);
    audioManager.play('coin');
    toast.success(`Purchased 1 ${animal.name} for ${animal.price} gold!`);
  };

  const handleFeedAnimal = (animalId) => {
    if (!MOCK_AUTH || !profile) return;
    const animal = farmAnimals.find((entry) => entry.id === animalId);
    if (!animal) return;
    const current = animals[animalId] || { count: 0, lastCollectedAt: 0 };
    if (current.count <= 0) return;

    const feedItem = (inventory.wheat && inventory.wheat >= 1) ? 'wheat' : (inventory.turnip && inventory.turnip >= 1) ? 'turnip' : null;
    if (!feedItem) {
      toast.error('You need at least 1 Wheat or Turnip in your inventory to feed livestock.');
      return;
    }

    const nextInventory = removeItems(inventory, { [feedItem]: 1 });
    const adjustedInterval = Math.max(60 * 1000, Math.round(animal.produceEveryMs * animalSpeedMultiplier));
    const nextLastCollected = Math.max(0, (current.lastCollectedAt || now) - Math.floor(adjustedInterval * 0.5));

    const nextAnimals = {
      ...animals,
      [animalId]: {
        count: current.count,
        lastCollectedAt: nextLastCollected,
      },
    };

    const xpGain = 15;
    const { nextLevel, nextXp, leveledUp } = applyFarmXp(xpGain);

    const updated = characterService.updateMockProfile({
      farmAnimals: nextAnimals,
      inventory: nextInventory,
      farmLevel: nextLevel,
      farmXp: nextXp,
    });
    setProfile(updated);
    audioManager.play('harvest');
    toast.success(`Fed ${animal.name} with 1 ${feedItem}! Fast-forwarded timer by 50% (+15 XP)${leveledUp ? ' · Farm level up!' : ''}.`);
  };

  const ownedAnimalList = farmAnimals.filter((animal) => (animals[animal.id]?.count || 0) > 0);

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('/jbm2.webp')] bg-gray-900 bg-blend-multiply dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 pt-24">
        <div className="rounded-2xl p-8 shadow-xl backdrop-blur court-reveal glass-panel">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">Harvestlands</p>
              <h1 className="mt-3 text-4xl font-extrabold text-white hero-title">Animal Pens & Pasture</h1>
              <p className="mt-3 text-base text-gray-300">
                Raise livestock, feed with crops, and harvest valuable artisan produce over time.
              </p>
            </div>
            <Link
              to="/farm"
              className="inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold text-yellow-200 action-ghost"
            >
              Back to Farm
            </Link>
          </div>

          <div className="mt-6 flex items-center gap-3.5 rounded-xl border border-yellow-700/30 bg-gray-950/70 p-3.5 backdrop-blur text-xs">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-yellow-700/40 bg-gray-900">
              <img src="/raceicon/dwarffemale.webp" alt="Moira Ironhoof" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="font-bold text-yellow-400">Moira Ironhoof <span className="font-normal text-gray-400 text-[11px]">· Mistress of the Pastures</span></p>
              <p className="text-gray-300 italic">"Give a beast warm straw and honest grain, and it'll give you more loyalty than any noble in Valoria. Feed your flock regularly to cut collection cycles in half!"</p>
            </div>
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
              <p className="mt-2 text-2xl font-semibold text-yellow-300 tabular-nums">{gold}g</p>
            </div>
            <div className="image-panel image-panel-housing ornament-frame p-4">
              <div className="image-panel-content">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Feed Feedstock</p>
                <p className="mt-2 text-sm text-gray-200">
                  Wheat: <span className="text-yellow-300 font-semibold">{inventory.wheat || 0}</span> · Turnip: <span className="text-yellow-300 font-semibold">{inventory.turnip || 0}</span>
                </p>
                <p className="mt-2 text-xs text-gray-400">Feeding cuts production cooldown by 50%.</p>
              </div>
            </div>
          </div>

          {/* Active Livestock Pens */}
          <div className="mt-8 rounded-2xl border border-yellow-700/20 bg-gray-950/70 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-yellow-400">Active Livestock</p>
                <p className="mt-2 text-sm text-gray-300">Collect produce and nurture your herds.</p>
              </div>
              <span className="text-xs text-gray-400">
                {ownedAnimalList.length} species in pasture
              </span>
            </div>

            {ownedAnimalList.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-gray-800 p-8 text-center">
                <p className="text-base font-semibold text-gray-300">Your pasture is currently empty.</p>
                <p className="mt-2 text-xs text-gray-500">
                  Purchase livestock from the Pasture Stall below to start producing artisan goods!
                </p>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {ownedAnimalList.map((animal) => {
                  const owned = animals[animal.id]?.count || 0;
                  const last = animals[animal.id]?.lastCollectedAt || now;
                  const adjustedInterval = Math.max(
                    60 * 1000,
                    Math.round(animal.produceEveryMs * animalSpeedMultiplier)
                  );
                  const remaining = Math.max(0, adjustedInterval - (now - last));
                  const ready = owned > 0 && remaining <= 0;
                  const goodName = farmGoods.find((good) => good.id === animal.produceId)?.name || 'Goods';
                  return (
                    <div
                      key={animal.id}
                      ref={(node) => {
                        if (node) {
                          animalRefs.current.set(animal.id, node);
                        } else {
                          animalRefs.current.delete(animal.id);
                        }
                      }}
                      className="animal-card rounded-xl"
                    >
                      <img
                        src={`/farm/${animal.id}.webp`}
                        alt={animal.name}
                        className="animal-card__image"
                      />
                      <div className="animal-card__body">
                        <p className="text-sm font-semibold text-white">{animal.name}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          Cycle: {formatDuration(adjustedInterval)}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Yield: {animal.produceAmount * owned} {goodName}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-300">
                          <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-200">
                            Count: {owned}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCollectAnimals(animal.id)}
                            className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                              ready ? 'action-primary text-white' : 'bg-gray-700 text-gray-300'
                            }`}
                            disabled={!ready}
                          >
                            {ready ? 'Collect' : `Ready in ${formatDuration(remaining)}`}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFeedAnimal(animal.id)}
                            className="rounded-lg px-3 py-2 text-xs font-semibold action-ghost text-emerald-300"
                            title="Feed 1 Wheat or Turnip to accelerate production"
                          >
                            Feed (-1 Feed)
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pasture Stall / Livestock Purchase */}
          <div className="mt-8 rounded-2xl border border-yellow-700/20 bg-gray-950/70 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-yellow-400">Pasture Stall</p>
                <p className="mt-2 text-sm text-gray-300">Acquire new animals to expand your estate production.</p>
              </div>
              <Link
                to="/farm/tasks"
                className="inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold text-yellow-200 action-ghost"
              >
                Farm Delivery Tasks
              </Link>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {farmAnimals.map((animal) => {
                const isUnlocked = farmLevel >= animal.levelRequired;
                const canAfford = gold >= animal.price;
                const goodName = farmGoods.find((good) => good.id === animal.produceId)?.name || 'Goods';
                return (
                  <div
                    key={`stall-${animal.id}`}
                    className={`rounded-xl border p-4 transition-all ${
                      isUnlocked
                        ? 'border-yellow-700/30 bg-gray-900/60'
                        : 'border-gray-800 bg-gray-950/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">{animal.name}</p>
                      <span className="text-xs font-semibold text-yellow-400">{animal.price}g</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      Produces {animal.produceAmount} {goodName} every {formatDuration(animal.produceEveryMs)}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {isUnlocked ? `Req. Farm Lvl ${animal.levelRequired}` : `Locked (Lvl ${animal.levelRequired})`}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleBuyAnimal(animal.id)}
                        disabled={!isUnlocked || !canAfford}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                          isUnlocked && canAfford
                            ? 'action-primary text-white'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isUnlocked ? (canAfford ? 'Purchase' : 'Need Gold') : 'Locked'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
