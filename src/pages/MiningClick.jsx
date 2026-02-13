import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import XpBar from '../components/XpBar';
import authService from '../services/AuthService';
import characterService from '../services/CharacterService';
import {
  formatDuration,
  getDailyVeinBonus,
  getWeeklySurgeBonus,
  getMiningConsumable,
  miningOres,
  getMiningXpForLevel,
  getTierByMiningLevel,
  getPickaxeUpgrade,
  getForgeUpgrade,
  getOresForTier,
  rollMiningTick,
} from '../data/miningData';
import { getZoneModifiers } from '../data/zonesData';
import { addItems } from '../services/inventoryService';

// Extracted Features
import MiningClickNode from '../features/mining/MiningClickNode';
import MiningNodeLoot from '../features/mining/MiningNodeLoot';
import MiningClickInfoPanel from '../features/mining/MiningClickInfoPanel';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

export default function MiningClick() {
  const [profile, setProfile] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!MOCK_AUTH) {
      return undefined;
    }

    const username = authService.getCurrentUsername();
    const nextProfile = characterService.getMockProfile(username);
    setProfile(nextProfile);

    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const miningSession = profile?.miningSession || null;
  const endAt = miningSession?.endAt || 0;
  const remainingMs = endAt - now;
  const isMining = remainingMs > 0;

  const miningLevel = profile?.miningLevel ?? 1;
  const miningXp = profile?.miningXp ?? 0;
  const pickaxeLevel = profile?.pickaxeLevel ?? 1;
  const miningForgeLevel = profile?.miningForgeLevel ?? 1;
  const miningPrestigeLevel = profile?.miningPrestigeLevel ?? 0;
  const inventory = profile?.inventory || {};
  const miningHirelingsOwned = profile?.miningHirelings || [];
  const miningClickState = profile?.miningClickState || null;
  const activeBoostId = profile?.activeMiningBoost || null;
  const activeBoost = activeBoostId ? getMiningConsumable(activeBoostId) : null;
  const currentPickaxe = getPickaxeUpgrade(pickaxeLevel);
  const zoneModifiers = getZoneModifiers(profile);
  const zoneMiningYieldMultiplier = zoneModifiers.miningYieldMultiplier ?? 1;
  const zoneMiningXpMultiplier = zoneModifiers.miningXpMultiplier ?? 1;
  const dailyVeinBonus = useMemo(() => getDailyVeinBonus(now), [now]);
  const weeklySurgeBonus = useMemo(() => getWeeklySurgeBonus(now), [now]);

  const clickNode = miningClickState?.node || null;
  const clickPreview = miningClickState?.preview || null;
  const lastClickReward = miningClickState?.lastClickReward || null;
  const pendingYield = miningClickState?.pendingYield || {};
  const nodeTier = clickNode?.tier || getTierByMiningLevel(miningLevel);

  const momentumValue = miningClickState?.momentum?.value || 0;
  const momentumMax = miningClickState?.momentum?.max || 100;
  const momentumPct = momentumMax > 0
    ? Math.max(0, Math.min(100, Math.round((momentumValue / momentumMax) * 100)))
    : 0;
  const momentumMultiplier = 1 + Math.min(0.1, momentumValue * 0.001);

  const titleBonus = profile?.title ? 1.03 : 1;
  const hirelingBonus = 1 + Math.min(0.12, miningHirelingsOwned.length * 0.01);
  const progressBonus = 1 + Math.min(0.6, miningLevel * 0.01 + pickaxeLevel * 0.02 + miningPrestigeLevel * 0.01);
  const clickEfficiency = Math.min(
    1.6,
    0.6 * progressBonus * titleBonus * hirelingBonus * momentumMultiplier * zoneMiningYieldMultiplier
  );
  const clickBaseXp = 1 + Math.floor(miningLevel / 3) + Math.floor(pickaxeLevel / 2);
  const clickDamage = Math.max(
    1,
    Math.round((1 + Math.floor(miningLevel / 5) + Math.floor(pickaxeLevel / 2)) * (1 + miningPrestigeLevel * 0.02))
  );
  const nodeBreakMultiplier = 1.4;
  const clickCooldownMs = 250;

  const diversityTier = Math.min(6, nodeTier + Math.floor(pickaxeLevel / 2));
  const basePool = getOresForTier(diversityTier);
  const rarePool = getOresForTier(Math.min(6, diversityTier + 1)).filter(
    (ore) => ore.tier > diversityTier
  );
  const breakPool = rarePool.length > 0 ? rarePool : basePool;

  const xpToNext = getMiningXpForLevel(miningLevel);

  const getClickPreview = React.useCallback((nodeTier) => {
    const tier = nodeTier || getTierByMiningLevel(miningLevel);
    const forge = getForgeUpgrade(miningForgeLevel) || { rareChanceBonus: 0, mishapReduction: 0 };
    const prestigeRareBonus = Math.min(0.06, miningPrestigeLevel * 0.01);
    const prestigeCritBonus = Math.min(0.04, miningPrestigeLevel * 0.005);
    const baseRareChance = 0.02 + pickaxeLevel * 0.003 + miningLevel * 0.0012 + (forge.rareChanceBonus || 0);
    const rareChance = Math.min(0.18, baseRareChance + prestigeRareBonus);
    const baseCritChance = 0.05 + pickaxeLevel * 0.007;
    const critChance = Math.min(0.18, baseCritChance + prestigeCritBonus);
    const bonusMultiplier = 1 + Math.min(0.2, pickaxeLevel * 0.015);
    const baseScale = 0.6;
    const minAmount = Math.max(1, Math.round(0.35 * bonusMultiplier * baseScale));
    const maxAmount = Math.max(1, Math.round(1.3 * bonusMultiplier * baseScale));
    return {
      tier,
      minAmount,
      maxAmount,
      critChance,
      rareChance,
    };
  }, [miningLevel, miningForgeLevel, miningPrestigeLevel, pickaxeLevel]);

  const buildClickNode = React.useCallback((tierOverride = null) => {
    const tier = tierOverride || getTierByMiningLevel(miningLevel);
    const baseDurability = 10 + tier * 6;
    const pickaxeBoost = Math.floor(pickaxeLevel * 1.5);
    const maxDurability = baseDurability + pickaxeBoost;
    return {
      id: `node-${Date.now()}`,
      tier,
      maxDurability,
      durability: maxDurability,
      createdAt: Date.now(),
    };
  }, [miningLevel, pickaxeLevel]);

  const ensureClickState = React.useCallback(() => {
    const nextState = miningClickState ? { ...miningClickState } : {};
    const nodeTier = nextState.node?.tier || getTierByMiningLevel(miningLevel);
    let changed = false;

    if (!nextState.node || nextState.node.durability == null) {
      nextState.node = buildClickNode(nodeTier);
      changed = true;
    }

    if (!nextState.momentum) {
      nextState.momentum = { value: 0, max: 100, updatedAt: Date.now() };
      changed = true;
    }

    if (!nextState.pendingYield) {
      nextState.pendingYield = {};
      changed = true;
    }

    if (!nextState.preview) {
      nextState.preview = getClickPreview(nextState.node.tier);
      changed = true;
    }

    if (nextState.preview && nextState.preview.tier !== nextState.node.tier) {
      nextState.preview = getClickPreview(nextState.node.tier);
      changed = true;
    }

    return { nextState, changed };
  }, [miningClickState, miningLevel, buildClickNode, getClickPreview]);

  useEffect(() => {
    if (!MOCK_AUTH || !profile) {
      return;
    }

    const { nextState, changed } = ensureClickState();
    if (!changed) {
      return;
    }

    const updated = characterService.updateMockProfile({
      miningClickState: nextState,
    });
    setProfile(updated);
  }, [profile, miningLevel, pickaxeLevel, ensureClickState]);

  const applyMiningXp = (xpGain) => {
    let nextLevel = miningLevel;
    let nextXp = miningXp + xpGain;
    let xpNeeded = getMiningXpForLevel(nextLevel);

    while (nextXp >= xpNeeded) {
      nextXp -= xpNeeded;
      nextLevel += 1;
      xpNeeded = getMiningXpForLevel(nextLevel);
    }

    return { nextLevel, nextXp };
  };

  const handleClickMine = () => {
    if (!MOCK_AUTH || !profile || !miningSession || !isMining) {
      return;
    }

    const { nextState } = ensureClickState();
    const lastClickAt = nextState.lastClickAt || 0;
    const clickCooldownMs = 250;
    if (now - lastClickAt < clickCooldownMs) {
      return;
    }

    const tier = nextState.node?.tier || getTierByMiningLevel(miningLevel);
    const available = getOresForTier(Math.min(6, tier + Math.floor(pickaxeLevel / 2)));
    if (available.length === 0) {
      return;
    }

    const titleBonus = profile.title ? 1.03 : 1;
    const hirelingBonus = 1 + Math.min(0.12, miningHirelingsOwned.length * 0.01);
    const progressBonus = 1 + Math.min(0.6, miningLevel * 0.01 + pickaxeLevel * 0.02 + miningPrestigeLevel * 0.01);
    const clickEfficiency = Math.min(
      1.6,
      0.6 * progressBonus * titleBonus * hirelingBonus * momentumMultiplier * zoneMiningYieldMultiplier
    );

    const { yieldMap, xpMultiplier, event } = rollMiningTick({
      miningLevel,
      pickaxeLevel,
      forgeLevel: miningForgeLevel,
      dailyVein: dailyVeinBonus,
      weeklySurge: weeklySurgeBonus,
      prestigeLevel: miningPrestigeLevel,
    });

    const claimedYield = {};
    Object.entries(yieldMap).forEach(([oreId, amount]) => {
      const adjustedAmount = Math.max(1, Math.round(amount * clickEfficiency));
      claimedYield[oreId] = (claimedYield[oreId] || 0) + adjustedAmount;
    });

    const clickBaseXp = 1 + Math.floor(miningLevel / 3) + Math.floor(pickaxeLevel / 2);
    const clickXp = Math.max(1, Math.round(clickBaseXp * (xpMultiplier || 1) * zoneMiningXpMultiplier));

    let nextInventory = { ...inventory };
    const nextPendingYield = { ...(nextState.pendingYield || {}) };
    Object.entries(claimedYield).forEach(([oreId, amount]) => {
      nextPendingYield[oreId] = (nextPendingYield[oreId] || 0) + amount;
    });

    const baseDamage = 1 + Math.floor(miningLevel / 5) + Math.floor(pickaxeLevel / 2);
    const damage = Math.max(1, Math.round(baseDamage * (1 + miningPrestigeLevel * 0.02)));
    const remainingDurability = Math.max(0, (nextState.node?.durability || 0) - damage);
    let nextNode = { ...nextState.node, durability: remainingDurability };
    const burstReward = {};
    let burstXp = 0;

    if (remainingDurability <= 0) {
      const burst = rollMiningTick({
        miningLevel,
        pickaxeLevel,
        forgeLevel: miningForgeLevel,
        dailyVein: dailyVeinBonus,
        weeklySurge: weeklySurgeBonus,
        prestigeLevel: miningPrestigeLevel,
      });
      Object.entries(burst.yieldMap).forEach(([oreId, amount]) => {
        const adjustedAmount = Math.max(1, Math.round(amount * clickEfficiency * 1.4));
        burstReward[oreId] = (burstReward[oreId] || 0) + adjustedAmount;
      });
      burstXp = Math.max(1, Math.round(clickBaseXp * 1.4 * (burst.xpMultiplier || 1)));
      nextNode = buildClickNode(tier);
    }

    const totalXp = clickXp + burstXp;
    const { nextLevel: finalLevel, nextXp: finalXp } = applyMiningXp(totalXp);

    const totalYieldOnBreak = remainingDurability <= 0
      ? Object.entries({ ...nextPendingYield, ...burstReward }).reduce((acc, [oreId, amount]) => {
        acc[oreId] = (acc[oreId] || 0) + amount;
        return acc;
      }, {})
      : {};

    if (remainingDurability <= 0) {
      nextInventory = addItems(nextInventory, totalYieldOnBreak);
    }

    const nextMomentumValue = Math.min(
      nextState.momentum?.max || 100,
      (nextState.momentum?.value || 0) + 6
    );

    const nextClickState = {
      ...nextState,
      node: nextNode,
      lastClickAt: now,
      pendingYield: remainingDurability <= 0 ? {} : nextPendingYield,
      momentum: {
        value: nextMomentumValue,
        max: nextState.momentum?.max || 100,
        updatedAt: now,
      },
      lastClickReward: {
        yieldMap: totalYieldOnBreak,
        burstYield: burstReward,
        xpGained: totalXp,
        event,
        brokeNode: remainingDurability <= 0,
        timestamp: now,
      },
      preview: getClickPreview(nextNode.tier),
    };

    const updated = characterService.updateMockProfile({
      inventory: nextInventory,
      miningLevel: finalLevel,
      miningXp: finalXp,
      miningClickState: nextClickState,
    });

    setProfile(updated);
  };

  useEffect(() => {
    if (!MOCK_AUTH || !profile || !miningClickState?.momentum) {
      return;
    }

    const { value, updatedAt, max } = miningClickState.momentum;
    if (!value || !updatedAt) {
      return;
    }

    const elapsedSeconds = Math.floor((now - updatedAt) / 1000);
    if (elapsedSeconds <= 0) {
      return;
    }

    const decayRate = 3;
    const nextValue = Math.max(0, value - elapsedSeconds * decayRate);
    if (nextValue === value) {
      return;
    }

    const nextClickState = {
      ...miningClickState,
      momentum: {
        value: nextValue,
        max: max || 100,
        updatedAt: now,
      },
    };

    const updated = characterService.updateMockProfile({
      miningClickState: nextClickState,
    });

    setProfile(updated);
  }, [now, profile, miningClickState]);

  const canClick = isMining;
  const pendingItems = Object.entries(pendingYield).map(([oreId, amount]) => ({
    id: oreId,
    amount,
    name: (miningOres.find((ore) => ore.id === oreId) || {}).name || oreId,
  }));

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm.jpg')] bg-gray-900 bg-blend-multiply dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 pt-24">
        <div className="rounded-2xl p-8 shadow-xl backdrop-blur court-reveal glass-panel">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">Deepforge</p>
              <h1 className="mt-3 text-4xl font-extrabold text-white hero-title">Click Mining</h1>
              <p className="mt-3 text-base text-gray-300">
                Strike active nodes to build up a stash that drops when the node breaks.
              </p>
            </div>
            <Link
              to="/mining"
              className="inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold text-yellow-200 action-ghost"
            >
              Back to Mining
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="court-card rounded-xl p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Mining Level</p>
              <p className="mt-2 text-2xl font-semibold text-white">{miningLevel}</p>
              <div className="mt-3">
                <XpBar current={miningXp} target={xpToNext} label="Mining XP" tone="cyan" />
              </div>
            </div>
            <div className="court-card rounded-xl p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Session</p>
              <p className="mt-2 text-2xl font-semibold text-white">{isMining ? 'In Progress' : 'Idle'}</p>
              <p className="mt-2 text-sm text-gray-300">
                {isMining
                  ? `Time left: ${formatDuration(remainingMs)}`
                  : 'Start a run on the main mining page.'}
              </p>
            </div>
            <div className="image-panel image-panel-housing ornament-frame p-4">
              <div className="image-panel-content">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-300">Pickaxe</p>
                <p className="mt-2 text-2xl font-semibold text-white">{currentPickaxe?.name || 'Pickaxe'}</p>
                <p className="mt-2 text-xs text-gray-400">{currentPickaxe?.rarity || 'Common'}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <MiningClickNode
                node={clickNode}
                momentum={miningClickState?.momentum}
                canClick={canClick}
                handleClickMine={handleClickMine}
                lastClickReward={lastClickReward}
              />
              <MiningNodeLoot
                pendingItems={pendingItems}
                breakPool={breakPool}
                nodeBreakMultiplier={nodeBreakMultiplier}
              />
            </div>

            <MiningClickInfoPanel
              clickPreview={clickPreview}
              momentum={miningClickState?.momentum}
              clickEfficiency={clickEfficiency}
              clickBaseXp={clickBaseXp}
              zoneMiningXpMultiplier={zoneMiningXpMultiplier}
              clickDamage={clickDamage}
              clickCooldownMs={clickCooldownMs}
              nodeBreakMultiplier={nodeBreakMultiplier}
              dailyVeinBonus={dailyVeinBonus}
              weeklySurgeBonus={weeklySurgeBonus}
              activeBoost={activeBoost}
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="court-card rounded-2xl p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Ore Inventory</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {miningOres.map((ore) => (
                  <div key={ore.id} className="rounded-xl border border-yellow-700/20 bg-gray-950/70 p-4">
                    <div className="flex items-center gap-3">
                      {ore.image && (
                        <img
                          src={ore.image}
                          alt={ore.name}
                          className="h-10 w-10 rounded-lg object-contain"
                        />
                      )}
                      <p className="text-sm font-semibold text-white">{ore.name}</p>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">Stored</p>
                    <p className="mt-1 text-xl font-semibold text-yellow-300">
                      {inventory[ore.id] || 0}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="image-panel image-panel-inventory ornament-frame p-6">
              <div className="image-panel-content">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-300">Mining Momentum</p>
                <p className="mt-3 text-sm text-gray-300">
                  Momentum boosts passive mining while you actively click.
                </p>
                <div className="mt-4 rounded-xl border border-yellow-700/30 bg-gray-950/70 p-4">
                  <div className="flex items-center justify-between text-xs text-gray-300">
                    <span>Momentum</span>
                    <span className="text-yellow-200">{momentumValue}/{momentumMax}</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/50">
                    <div
                      className="h-full rounded-full bg-cyan-400/70 transition-all"
                      style={{ width: `${momentumPct}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs text-gray-400">
                    Passive bonus: +{Math.round((momentumMultiplier - 1) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
