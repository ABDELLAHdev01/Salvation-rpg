import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../../shared/layout/Sidebar';
import authService from '../../core/services/AuthService';
import characterService from '../../core/services/CharacterService';
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
} from '../../core/data/miningData';
import { addItems } from '../../core/services/inventoryService';
import audioManager from '../../core/audio/AudioManager';
import { getCityPerk } from '../../core/data/citiesData';

// Extracted Features
import MiningClickNode from './MiningClickNode';
import MiningNodeLoot from './MiningNodeLoot';
import MiningClickInfoPanel from './MiningClickInfoPanel';

// Mining Widgets
import MiningClickHeader from './widgets/MiningClickHeader';
import MiningClickStats from './widgets/MiningClickStats';

// Standard UI Components
import Panel from '../../shared/ui/Panel';
import Button from '../../shared/ui/Button';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

export default function MiningClick() {
  const [profile, setProfile] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!MOCK_AUTH) return;

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

  const zoneMiningXmMods = { xp: 1, break: 1 };

  const cityPerk = useMemo(() => getCityPerk(profile?.city), [profile?.city]);
  const isDrakmor = cityPerk?.type === 'mining-yield' || String(profile?.city || '').toLowerCase() === 'drakmor';
  const factionDamageBonus = isDrakmor ? (cityPerk?.damageBonus || 5) : 0;
  const factionYieldMultiplier = isDrakmor ? (1 + (cityPerk?.value || 0.15)) : 1.0;

  const dailyVeinBonus = useMemo(() => getDailyVeinBonus(now), [now]);
  const weeklySurgeBonus = useMemo(() => getWeeklySurgeBonus(now), [now]);

  const pickaxeUpgrade = getPickaxeUpgrade(pickaxeLevel);
  const forgeUpgrade = getForgeUpgrade(miningForgeLevel);

  const clickDamage = useMemo(() => {
    const base = (pickaxeUpgrade?.damage || 5) + factionDamageBonus;
    const forgeMult = forgeUpgrade?.efficiency || 1;
    let boostMult = 1;
    if (activeBoost?.effect?.type === 'click-damage') {
      boostMult = activeBoost.effect.value;
    }
    return Math.floor(base * forgeMult * boostMult);
  }, [pickaxeUpgrade, forgeUpgrade, activeBoost, factionDamageBonus]);

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

    audioManager.play('mine_strike');

    const damage = clickDamage;
    const newNode = { ...miningClickState.node };
    newNode.currentDurability = Math.max(0, newNode.currentDurability - damage);

    const hitResult = rollMiningTick({
      miningLevel,
      pickaxeLevel,
      forgeLevel: miningForgeLevel,
      dailyVein: dailyVeinBonus,
      weeklySurge: weeklySurgeBonus,
      prestigeLevel: miningPrestigeLevel,
    });

    const hitYieldMap = hitResult.yieldMap || {};
    const newPendingItems = { ...(miningClickState.pendingItems || {}) };
    Object.entries(hitYieldMap).forEach(([oreId, amount]) => {
      const scaledAmount = Math.max(1, Math.round(amount * factionYieldMultiplier));
      newPendingItems[oreId] = (newPendingItems[oreId] || 0) + scaledAmount;
    });

    const isBroke = newNode.currentDurability <= 0;
    const clickXpGain = Math.max(1, Math.floor(clickBaseXp * (hitResult.xpMultiplier || 1)));

    let momentum = (miningClickState.momentum || 0) + 0.05;
    if (momentum > 1.0) momentum = 1.0;

    let finalUpdates = {};

    if (isBroke) {
      audioManager.play('node_shatter');
      const breakPool = miningClickState.breakPool || [];
      const breakLoot = {};
      breakPool.forEach((item) => {
        const count = Math.max(1, Math.round((item.amount || 1) * zoneMiningXmMods.break * factionYieldMultiplier));
        breakLoot[item.id] = (breakLoot[item.id] || 0) + count;
      });

      const totalItemsToSync = { ...newPendingItems };
      Object.entries(breakLoot).forEach(([id, count]) => {
        totalItemsToSync[id] = (totalItemsToSync[id] || 0) + count;
      });

      // 25% chance to discover an Uncracked Geode on shattering a node
      let foundGeode = false;
      if (Math.random() < 0.25) {
        totalItemsToSync['mystery-geode'] = (totalItemsToSync['mystery-geode'] || 0) + 1;
        foundGeode = true;
      }

      const breakXpEarned = clickBaseXp * 10 * zoneMiningXmMods.xp;
      const totalXpGain = clickXpGain + breakXpEarned;

      let nextLevel = miningLevel;
      let nextXp = miningXp + totalXpGain;
      let xpNeeded = getMiningXpForLevel(nextLevel);
      while (nextXp >= xpNeeded) {
        nextXp -= xpNeeded;
        nextLevel += 1;
        xpNeeded = getMiningXpForLevel(nextLevel);
      }

      const nextInventory = addItems(profile.inventory || {}, totalItemsToSync);

      finalUpdates = {
        inventory: nextInventory,
        miningLevel: nextLevel,
        miningXp: nextXp,
        miningClickState: null,
      };

      if (nextLevel > miningLevel) {
        audioManager.play('level_up');
        toast.success(`Mining Level Up! You reached level ${nextLevel}!`);
      }
      toast.success(
        `Node shattered! Earned ${Math.floor(totalXpGain)} XP and harvested deposits.${foundGeode ? ' 💎 Found an Uncracked Geode!' : ''}`
      );
    } else {
      const lastClickFeedback = {
        yieldMap: hitYieldMap,
        event: hitResult.event,
        xpGained: clickXpGain,
        damage,
        brokeNode: false,
        timestamp: Date.now(),
      };

      finalUpdates = {
        miningClickState: {
          ...miningClickState,
          node: newNode,
          pendingItems: newPendingItems,
          lastClickFeedback,
          momentum,
          lastClickAt: Date.now(),
        },
      };
    }

    handleUpdateProfile(finalUpdates);
  };

  const handleSpawnNode = () => {
    const tier = getTierByMiningLevel(miningLevel);
    const possibleOres = getOresForTier(tier);
    const ore = possibleOres[Math.floor(Math.random() * possibleOres.length)] || miningOres[0];

    const node = {
      id: `node-${Date.now()}`,
      oreId: ore.id,
      tier: ore.tier || tier,
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
    const ore = miningOres.find((o) => o.id === miningClickState.node.oreId);
    const forge = forgeUpgrade || { rareChanceBonus: 0, mishapReduction: 0 };
    const prestigeRareBonus = Math.min(0.06, miningPrestigeLevel * 0.01);
    const prestigeCritBonus = Math.min(0.04, miningPrestigeLevel * 0.005);
    const baseRareChance = 0.025 + pickaxeLevel * 0.004 + miningLevel * 0.0016 + (forge.rareChanceBonus || 0);
    const rareChance = Math.min(0.2, baseRareChance + prestigeRareBonus);
    const baseCritChance = 0.06 + pickaxeLevel * 0.008;
    const critChance = Math.min(0.2, baseCritChance + prestigeCritBonus);
    const bonusMultiplier = 1 + Math.min(0.2, pickaxeLevel * 0.015);
    const baseScale = 0.6;
    const minAmount = Math.max(1, Math.round(0.35 * bonusMultiplier * baseScale));
    const maxAmount = Math.max(1, Math.round(1.3 * bonusMultiplier * baseScale));

    return {
      oreName: ore?.name || 'Unknown Vein',
      rarity: ore?.rarity || 'common',
      tier: miningClickState.node.tier || getTierByMiningLevel(miningLevel),
      minAmount,
      maxAmount,
      critChance,
      rareChance,
    };
  }, [miningClickState, forgeUpgrade, miningPrestigeLevel, pickaxeLevel, miningLevel]);

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
        <MiningClickHeader miningLevel={miningLevel} />

        {isDrakmor && (
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-700/50 bg-red-950/70 px-4 py-1.5 text-xs text-red-300">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span><strong>Drakmor Deep Vein Mastery:</strong> +5 pickaxe strike damage & +15% ore harvest yields active</span>
          </div>
        )}

        <div className="mb-6 flex items-center gap-3.5 rounded-xl border border-yellow-700/30 bg-gray-950/70 p-3.5 backdrop-blur text-xs">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-yellow-700/40 bg-gray-900">
            <img src="/raceicon/dwarfmale.webp" alt="Old Bran the Delver" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="font-bold text-yellow-400">Old Bran the Delver <span className="font-normal text-gray-400 text-[11px]">· Scout of the Sunken Shafts</span></p>
            <p className="text-gray-300 italic">"Hear that deep hum beneath the seam? That's not rock settling, lad—that's the mountain breathing. Keep your pickaxe sharp and listen for crystalline geode pockets!"</p>
          </div>
        </div>

        <MiningClickStats
          miningXp={miningXp}
          miningXpTarget={miningXpTarget}
          pickaxeLevel={pickaxeLevel}
          miningForgeLevel={miningForgeLevel}
          miningPrestigeLevel={miningPrestigeLevel}
          dailyVeinBonus={dailyVeinBonus}
          weeklySurgeBonus={weeklySurgeBonus}
          activeBoost={activeBoost}
        />

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
