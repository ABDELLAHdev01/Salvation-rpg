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
import { addItems } from '../../core/services/inventoryService';

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
    toast.success(
      `Collected ${totalProduce} ${goodName}${leveledUp ? ' · Farm level up!' : ''}.`
    );

    const anchor = animalRefs.current.get(animalId);
    if (anchor) {
      pushReward(`+${totalProduce} ${goodName}`, { tone: 'item', anchor });
      pushReward(`+${xpGain} XP`, { tone: 'xp', anchor, delay: 120 });
    }
  };

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm2.webp')] bg-gray-900 bg-blend-multiply dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 pt-24">
        <div className="rounded-2xl p-8 shadow-xl backdrop-blur court-reveal glass-panel">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">Harvestlands</p>
              <h1 className="mt-3 text-4xl font-extrabold text-white hero-title">Animal Pens</h1>
              <p className="mt-3 text-base text-gray-300">
                Unlock animals at level 15 and collect resources over time.
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
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Unlock</p>
                <p className="mt-2 text-2xl font-semibold text-white">Farm Levels</p>
                <p className="mt-2 text-xs text-gray-400">Animals produce farm goods over time.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-yellow-700/20 bg-gray-950/70 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Animals</p>
                <p className="mt-2 text-sm text-gray-300">Collect produce from animals you own.</p>
              </div>
              <Link
                to="/market"
                className="inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold text-yellow-200 action-ghost"
              >
                Go to Global Market
              </Link>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {farmAnimals
                .filter((animal) => (animals[animal.id]?.count || 0) > 0)
                .map((animal) => {
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
                          Produces every {formatDuration(adjustedInterval)}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Yield: {animal.produceAmount} {goodName} per animal
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-300">
                          <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-200">
                            Owned: {owned}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCollectAnimals(animal.id)}
                            className={`rounded-lg px-3 py-2 text-xs font-semibold ${ready ? 'action-primary text-white' : 'bg-gray-700 text-gray-300'
                              }`}
                            disabled={!ready}
                          >
                            {ready ? 'Collect' : owned > 0 ? `Ready in ${formatDuration(remaining)}` : 'No animals'}
                          </button>
                        </div>
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
