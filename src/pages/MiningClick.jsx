import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import XpBar from '../components/XpBar';
import authService from '../services/AuthService';
import characterService from '../services/CharacterService';
import {
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

// Standard UI Components
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SectionHeader from '../components/ui/SectionHeader';

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

  const miningLevel = profile?.miningLevel ?? 1;
  const miningXp = profile?.miningXp ?? 0;
  const pickaxeLevel = profile?.pickaxeLevel ?? 1;
  const miningForgeLevel = profile?.miningForgeLevel ?? 1;
  const miningPrestigeLevel = profile?.miningPrestigeLevel ?? 0;
  const miningClickState = profile?.miningClickState || null;
  const activeBoostId = profile?.activeMiningBoost || null;

  const activeBoost = useMemo(() => {
    if (!activeBoostId) return null;
    return getMiningConsumable(activeBoostId);
  }, [activeBoostId]);

  const miningXpTarget = getMiningXpForLevel(miningLevel);

  const zoneMiningXmMods = useMemo(() => {
    const activeZoneId = profile?.activeZoneId;
    if (!activeZoneId) return { xp: 1, break: 1 };
    const mods = getZoneModifiers(activeZoneId);
    return {
      xp: mods.miningXpMultiplier ?? 1,
      break: mods.nodeBreakMultiplier ?? 1,
    };
  }, [profile?.activeZoneId]);

  const dailyVeinBonus = useMemo(() => getDailyVeinBonus(profile), [profile]);
  const weeklySurgeBonus = useMemo(() => getWeeklySurgeBonus(profile), [profile]);

  const pickaxeUpgrade = getPickaxeUpgrade(pickaxeLevel);
  const forgeUpgrade = getForgeUpgrade(miningForgeLevel);

  const clickDamage = useMemo(() => {
    const base = pickaxeUpgrade?.damage || 5;
    const forgeMult = forgeUpgrade?.efficiency || 1;
    let boostMult = 1;
    if (activeBoost?.effect?.type === 'click-damage') {
      boostMult = activeBoost.effect.value;
    }
    return Math.floor(base * forgeMult * boostMult);
  }, [pickaxeUpgrade, forgeUpgrade, activeBoost]);

  const clickCooldownMs = useMemo(() => {
    const base = pickaxeUpgrade?.cooldownMs || 1000;
    let prestigeMod = 1 - miningPrestigeLevel * 0.05;
    return Math.max(100, Math.floor(base * prestigeMod));
  }, [pickaxeUpgrade, miningPrestigeLevel]);

  const clickEfficiency = useMemo(() => {
    const base = pickaxeUpgrade?.efficiency || 1.0;
    const forgeBoost = (miningForgeLevel - 1) * 0.05;
    return base + forgeBoost;
  }, [pickaxeUpgrade, miningForgeLevel]);

  const clickBaseXp = useMemo(() => {
    const tier = getTierByMiningLevel(miningLevel);
    const ores = getOresForTier(tier);
    if (!ores?.length) return 5;
    const avgXp = ores.reduce((sum, o) => sum + (o.xp || 0), 0) / ores.length;
    return Math.floor(avgXp * 0.4);
  }, [miningLevel]);

  const handleUpdateProfile = (updates) => {
    if (!MOCK_AUTH) return;
    const updated = characterService.updateMockProfile(updates);
    setProfile(updated);
  };

  const handleClickMine = () => {
    if (!profile || !miningClickState?.node) return;

    const damage = clickDamage;
    const newNode = { ...miningClickState.node };
    newNode.currentDurability = Math.max(0, newNode.currentDurability - damage);

    const hitResult = rollMiningTick(miningLevel, clickEfficiency);
    const reward = hitResult.reward || null;

    const newPendingItems = { ...(miningClickState.pendingItems || {}) };
    if (reward) {
      newPendingItems[reward.id] = (newPendingItems[reward.id] || 0) + 1;
    }

    const lastClickFeedback = {
      reward,
      damage,
      isCrit: Math.random() < 0.1,
      timestamp: Date.now(),
    };

    let momentum = (miningClickState.momentum || 0) + 0.05;
    if (momentum > 1.0) momentum = 1.0;

    let finalUpdates = {
      miningClickState: {
        ...miningClickState,
        node: newNode,
        pendingItems: newPendingItems,
        lastClickFeedback,
        momentum,
        lastClickAt: Date.now(),
      },
    };

    if (newNode.currentDurability <= 0) {
      const breakPool = miningClickState.breakPool || [];
      const breakLoot = {};
      breakPool.forEach((item) => {
        const count = Math.floor((item.amount || 1) * zoneMiningXmMods.break);
        breakLoot[item.id] = (breakLoot[item.id] || 0) + count;
      });

      const totalItemsToSync = { ...newPendingItems };
      Object.entries(breakLoot).forEach(([id, count]) => {
        totalItemsToSync[id] = (totalItemsToSync[id] || 0) + count;
      });

      const xpEarned = clickBaseXp * 10 * zoneMiningXmMods.xp;
      addItems(totalItemsToSync);

      finalUpdates = {
        miningXp: miningXp + xpEarned,
        miningClickState: null,
      };

      toast.success(
        `Node shattered! Earned ${Math.floor(xpEarned)} XP and ${Object.keys(totalItemsToSync).length} items.`
      );
    }

    handleUpdateProfile(finalUpdates);
  };

  const handleSpawnNode = () => {
    const tier = getTierByMiningLevel(miningLevel);
    const possibleOres = getOresForTier(tier);
    const ore = possibleOres[Math.floor(Math.random() * possibleOres.length)];

    const node = {
      id: `node-${Date.now()}`,
      oreId: ore.id,
      maxDurability: ore.durability || 100,
      currentDurability: ore.durability || 100,
    };

    const breakPool = [{ id: ore.id, amount: Math.floor(Math.random() * 3) + 2 }];

    handleUpdateProfile({
      miningClickState: {
        node,
        pendingItems: {},
        breakPool,
        momentum: 0,
        lastClickAt: 0,
      },
    });
  };

  const clickPreview = useMemo(() => {
    if (!miningClickState?.node) return null;
    const ore = miningOres[miningClickState.node.oreId];
    return {
      oreName: ore?.name || 'Unknown Vein',
      rarity: ore?.rarity || 'common',
    };
  }, [miningClickState]);

  const canClick = useMemo(() => {
    if (!miningClickState?.node) return false;
    const lastClick = miningClickState.lastClickAt || 0;
    return now - lastClick >= clickCooldownMs;
  }, [miningClickState, clickCooldownMs, now]);

  const formattedPendingItems = useMemo(() => {
    if (!miningClickState?.pendingItems) return [];
    return Object.entries(miningClickState.pendingItems).map(([id, amount]) => {
      const ore = miningOres.find(o => o.id === id);
      return {
        id,
        name: ore?.name || id,
        amount
      };
    });
  }, [miningClickState?.pendingItems]);

  return (
    <section className="min-h-screen bg-page-primary lg:pl-64 dashboard-shell">
      <Sidebar />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 pt-24">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-6">
          <SectionHeader
            kicker="Click Mining"
            title="Shatter the Veins"
            description="Active extraction yields high-density rewards. Every strike matters."
          />
          <Panel variant="subtle" className="text-center min-w-[120px]">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">Mining Mastery</p>
            <p className="mt-1 text-3xl font-black text-cyan-400 drop-shadow-sm">Lvl {miningLevel}</p>
          </Panel>
        </div>

        <Panel variant="glass" className="mb-8">
          <XpBar current={miningXp} target={miningXpTarget} label="Skill Progression" tone="cyan" />
          <div className="mt-4 flex flex-wrap gap-3">
            <Badge variant="cyan">Pickaxe T{pickaxeLevel}</Badge>
            <Badge variant="info">Forge Lvl {miningForgeLevel}</Badge>
            {miningPrestigeLevel > 0 && <Badge variant="gold">Prestige {miningPrestigeLevel}</Badge>}
            {dailyVeinBonus > 0 && <Badge variant="gold">Vein Bonus: +{Math.round(dailyVeinBonus * 100)}%</Badge>}
            {weeklySurgeBonus > 0 && <Badge variant="warning">Weekly Surge: +{Math.round(weeklySurgeBonus * 100)}%</Badge>}
            {activeBoost && <Badge variant="success">Active: {activeBoost.name}</Badge>}
          </div>
        </Panel>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div className="space-y-8">
            <Panel variant="card" className="flex flex-col items-center justify-center py-16 min-h-[400px] relative">
              {miningClickState?.node ? (
                <MiningClickNode
                  node={miningClickState.node}
                  momentum={miningClickState.momentum}
                  canClick={canClick}
                  handleClickMine={handleClickMine}
                  lastClickReward={miningClickState.lastClickFeedback}
                />
              ) : (
                <div className="text-center group">
                  <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-gray-700 bg-gray-900/40 text-gray-600 transition-all group-hover:border-cyan-500/50 group-hover:text-cyan-500/50">
                    <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <path d="M12 4v16m8-8H4" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white">No active vein</h3>
                  <p className="mt-2 text-gray-400 max-w-sm">Scout the current layer for a new deposit to exploit.</p>
                  <Button variant="ornate" onClick={handleSpawnNode} className="mt-8">
                    Spawn New Node
                  </Button>
                </div>
              )}
            </Panel>

            {miningClickState?.node && (
              <MiningNodeLoot
                pendingItems={formattedPendingItems}
                breakPool={miningClickState.breakPool}
                nodeBreakMultiplier={zoneMiningXmMods.break}
              />
            )}
          </div>

          <div>
            <MiningClickInfoPanel
              clickPreview={clickPreview}
              momentum={miningClickState?.momentum || 0}
              clickEfficiency={clickEfficiency}
              clickBaseXp={clickBaseXp}
              zoneMiningXpMultiplier={zoneMiningXmMods.xp}
              clickDamage={clickDamage}
              clickCooldownMs={clickCooldownMs}
              nodeBreakMultiplier={zoneMiningXmMods.break}
              dailyVeinBonus={dailyVeinBonus}
              weeklySurgeBonus={weeklySurgeBonus}
              activeBoost={activeBoost}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
