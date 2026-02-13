import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import XpBar from '../components/XpBar';
import { useRewardFloat } from '../components/RewardFloatProvider';
import authService from '../services/AuthService';
import characterService from '../services/CharacterService';
import {
  buildMiningContract,
  formatDuration,
  getDailyVeinBonus,
  getWeeklySurgeBonus,
  getMiningConsumable,
  getMiningHireling,
  getMiningXpForLevel,
  getTierByMiningLevel,
  getForgeUpgrade,
  getPickaxeUpgrade,
  getNextPickaxeUpgrade,
  getNextForgeUpgrade,
  getDailyKey,
  getWeeklyKey,
  MINING_DURATION_MS,
  MINING_TICK_MS,
  miningBoosterIcons,
  miningConsumables,
  miningContractToken,
  miningHirelings,
  miningOres,
  rollMiningTick,
} from '../data/miningData';
import { getZoneModifiers } from '../data/zonesData';
import { addItems, getItemCount, removeItems } from '../services/inventoryService';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';
const UI_TICK_MS = 3000;

export default function Mining() {
  const [profile, setProfile] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [showStopModal, setShowStopModal] = useState(false);
  const [showDismissModal, setShowDismissModal] = useState(false);
  const [dismissTarget, setDismissTarget] = useState(null);
  const [nextAutoClaimAt, setNextAutoClaimAt] = useState(null);
  const haulRef = useRef(null);
  const pushReward = useRewardFloat();

  useEffect(() => {
    if (!MOCK_AUTH) {
      return undefined;
    }

    const username = authService.getCurrentUsername();
    const nextProfile = characterService.getMockProfile(username);
    setProfile(nextProfile);

    const timer = setInterval(() => setNow(Date.now()), UI_TICK_MS);
    return () => clearInterval(timer);
  }, []);

  const miningSession = profile?.miningSession || null;
  const endAt = miningSession?.endAt || 0;
  const remainingMs = endAt - now;
  const isMining = remainingMs > 0;
  const accruedYield = miningSession?.accruedYield || {};
  const accruedXp = miningSession?.accruedXp || 0;
  const hasAccrued = Object.keys(accruedYield).length > 0 || accruedXp > 0;
  const eventCounts = miningSession?.eventCounts || {};

  const miningLevel = profile?.miningLevel ?? 1;
  const miningXp = profile?.miningXp ?? 0;
  const pickaxeLevel = profile?.pickaxeLevel ?? 1;
  const miningForgeLevel = profile?.miningForgeLevel ?? 1;
  const miningPrestigeLevel = profile?.miningPrestigeLevel ?? 0;
  const inventory = useMemo(() => profile?.inventory || {}, [profile?.inventory]);
  const gold = profile?.stats?.gold ?? 0;
  const activeBoostId = profile?.activeMiningBoost || null;
  const activeBoost = activeBoostId ? getMiningConsumable(activeBoostId) : null;
  const boosterCooldowns = useMemo(() => profile?.miningBoosterCooldowns || {}, [profile?.miningBoosterCooldowns]);
  const miningCooldownUntil = profile?.miningCooldownUntil ?? 0;
  const miningCooldownRemaining = Math.max(0, miningCooldownUntil - now);
  const isMiningCooldown = miningCooldownRemaining > 0;
  const miningContracts = profile?.miningContracts || null;
  const miningContractTokens = getItemCount(inventory, miningContractToken.id);
  const miningHirelingsOwned = useMemo(() => profile?.miningHirelings || [], [profile?.miningHirelings]);
  const miningClickState = profile?.miningClickState || null;
  const momentumValue = miningClickState?.momentum?.value || 0;
  const momentumMultiplier = 1 + Math.min(0.1, momentumValue * 0.001);
  const zoneModifiers = getZoneModifiers(profile);
  const zoneMiningYieldMultiplier = zoneModifiers.miningYieldMultiplier ?? 1;
  const zoneMiningXpMultiplier = zoneModifiers.miningXpMultiplier ?? 1;
  const xpToNext = getMiningXpForLevel(miningLevel);
  const currentPickaxe = getPickaxeUpgrade(pickaxeLevel);
  const nextPickaxe = getNextPickaxeUpgrade(pickaxeLevel);
  const currentForge = getForgeUpgrade(miningForgeLevel);
  const nextForge = getNextForgeUpgrade(miningForgeLevel);
  const miningProgress = Math.max(0, Math.min(100, Math.round((remainingMs / MINING_DURATION_MS) * 100)));
  const dismissHireling = dismissTarget ? getMiningHireling(dismissTarget) : null;
  const hirelingTicksPerHour = miningHirelingsOwned
    .map((id) => getMiningHireling(id))
    .filter(Boolean)
    .reduce((sum, hireling) => sum + hireling.ticksPerHour, 0);

  const dailyVeinBonus = useMemo(() => getDailyVeinBonus(now), [now]);
  const weeklySurgeBonus = useMemo(() => getWeeklySurgeBonus(now), [now]);

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

  const getRandomAutoClaimDelay = () => {
    const minDelay = 30 * 1000;
    const maxDelay = 60 * 1000;
    return Math.floor(minDelay + Math.random() * (maxDelay - minDelay));
  };

  useEffect(() => {
    if (!MOCK_AUTH || !profile) {
      return;
    }

    const dailyKey = getDailyKey(now);
    const weeklyKey = getWeeklyKey(now);
    const currentDaily = miningContracts?.daily;
    const currentWeekly = miningContracts?.weekly;
    const needsDaily = !currentDaily || currentDaily.key !== dailyKey;
    const needsWeekly = !currentWeekly || currentWeekly.key !== weeklyKey;

    if (!needsDaily && !needsWeekly) {
      return;
    }

    const nextContracts = {
      daily: needsDaily ? buildMiningContract({ type: 'daily', miningLevel, timestamp: now }) : currentDaily,
      weekly: needsWeekly ? buildMiningContract({ type: 'weekly', miningLevel, timestamp: now }) : currentWeekly,
    };

    const updated = characterService.updateMockProfile({
      miningContracts: nextContracts,
    });

    setProfile(updated);
  }, [now, profile, miningLevel, miningContracts]);

  useEffect(() => {
    if (!MOCK_AUTH || !profile || !isMining || !profile.miningSession) {
      return;
    }

    const session = profile.miningSession;
    const startAt = session.startAt || now;
    const lastTickAt = session.lastTickAt || startAt;
    const effectiveNow = Math.min(now, session.endAt || now);
    const elapsedMs = Math.max(0, effectiveNow - lastTickAt);
    const ticksToProcess = Math.floor(elapsedMs / MINING_TICK_MS);
    const hirelingRemainder = session.hirelingRemainder || 0;
    const bonusTicksFloat = (elapsedMs / (60 * 60 * 1000)) * hirelingTicksPerHour + hirelingRemainder;
    const bonusTicks = Math.floor(bonusTicksFloat);
    const nextHirelingRemainder = bonusTicksFloat - bonusTicks;

    if (ticksToProcess <= 0 && bonusTicks <= 0) {
      if (hirelingTicksPerHour > 0 && nextHirelingRemainder !== hirelingRemainder) {
        const updated = characterService.updateMockProfile({
          miningSession: {
            ...session,
            hirelingRemainder: nextHirelingRemainder,
          },
        });
        setProfile(updated);
      }
      return;
    }

    let nextAccruedYield = { ...(session.accruedYield || {}) };
    let nextAccruedXp = session.accruedXp || 0;
    let nextAccruedTicks = session.accruedTicks || 0;
    let nextHirelingTicks = session.hirelingTicks || 0;
    let nextHirelingTickMap = { ...(session.hirelingTickMap || {}) };
    let nextHirelingIndex = session.hirelingIndex || 0;
    let nextEventCounts = { ...(session.eventCounts || {}) };
    let nextInventory = { ...inventory };
    let nextCooldowns = { ...boosterCooldowns };
    let nextActiveBoostId = activeBoostId;
    let boostUsed = false;

    const boost = nextActiveBoostId ? getMiningConsumable(nextActiveBoostId) : null;
    const boostReady =
      boost &&
      getItemCount(nextInventory, nextActiveBoostId) > 0 &&
      (nextCooldowns[nextActiveBoostId] || 0) <= now &&
      miningLevel >= boost.requiredMiningLevel;

    const totalTicks = ticksToProcess + bonusTicks;
    const maxTicksPerBatch = 8;
    const ticksThisBatch = Math.min(totalTicks, maxTicksPerBatch);
    const normalTicksThisBatch = Math.min(ticksToProcess, ticksThisBatch);
    const hirelingTicksThisBatch = ticksThisBatch - normalTicksThisBatch;
    const remainingHirelingTicks = Math.max(0, bonusTicks - hirelingTicksThisBatch);
    const hirelingPool = miningHirelingsOwned.length > 0 ? miningHirelingsOwned : [];
    for (let i = 0; i < ticksThisBatch; i += 1) {
      const { yieldMap, tier, xpMultiplier, event } = rollMiningTick({
        miningLevel,
        pickaxeLevel,
        forgeLevel: miningForgeLevel,
        dailyVein: dailyVeinBonus,
        weeklySurge: weeklySurgeBonus,
        prestigeLevel: miningPrestigeLevel,
      });

      const baseTickXp = 3 + tier * 2 + Math.floor(pickaxeLevel * 0.8);
      let tickXp = Math.round(baseTickXp * (xpMultiplier || 1));

      if (i < normalTicksThisBatch && !boostUsed && boostReady) {
        tickXp = Math.round((tickXp + (boost.xpBonus || 0)) * (boost.xpMultiplier || 1));
        boostUsed = true;
        nextInventory = removeItems(nextInventory, { [nextActiveBoostId]: 1 });
        if (boost.cooldownMs) {
          nextCooldowns[nextActiveBoostId] = now + boost.cooldownMs;
        }
        nextActiveBoostId = null;
      }

      const adjustedTickXp = Math.max(1, Math.round(tickXp * zoneMiningXpMultiplier * momentumMultiplier));

      Object.entries(yieldMap).forEach(([oreId, amount]) => {
        const adjustedAmount = Math.max(
          1,
          Math.round(amount * zoneMiningYieldMultiplier * momentumMultiplier)
        );
        nextAccruedYield[oreId] = (nextAccruedYield[oreId] || 0) + adjustedAmount;
      });
      nextAccruedXp += adjustedTickXp;
      nextAccruedTicks += 1;
      if (event) {
        nextEventCounts[event] = (nextEventCounts[event] || 0) + 1;
      }
      if (i >= normalTicksThisBatch) {
        nextHirelingTicks += 1;
        if (hirelingPool.length > 0) {
          const hirelingId = hirelingPool[nextHirelingIndex % hirelingPool.length];
          nextHirelingTickMap[hirelingId] = (nextHirelingTickMap[hirelingId] || 0) + 1;
          nextHirelingIndex += 1;
        }
      }
    }

    const updated = characterService.updateMockProfile({
      miningSession: {
        ...session,
        lastTickAt: lastTickAt + normalTicksThisBatch * MINING_TICK_MS,
        accruedYield: nextAccruedYield,
        accruedXp: nextAccruedXp,
        accruedTicks: nextAccruedTicks,
        hirelingRemainder: nextHirelingRemainder + remainingHirelingTicks,
        hirelingTicks: nextHirelingTicks,
        hirelingTickMap: nextHirelingTickMap,
        hirelingIndex: nextHirelingIndex,
        eventCounts: nextEventCounts,
      },
      inventory: nextInventory,
      miningBoosterCooldowns: nextCooldowns,
      activeMiningBoost: nextActiveBoostId,
    });

    setProfile(updated);
  }, [
    now,
    profile,
    isMining,
    miningLevel,
    pickaxeLevel,
    inventory,
    boosterCooldowns,
    activeBoostId,
    hirelingTicksPerHour,
    miningForgeLevel,
    dailyVeinBonus,
    weeklySurgeBonus,
    miningPrestigeLevel,
    momentumMultiplier,
    miningHirelingsOwned,
    zoneMiningYieldMultiplier,
    zoneMiningXpMultiplier,
  ]);

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

  const handleStartMining = () => {
    if (!MOCK_AUTH || !profile) {
      return;
    }

    if (isMining) {
      toast.error('Mining already in progress.');
      return;
    }

    if (isMiningCooldown) {
      toast.error(`Mining cooldown: ${formatDuration(miningCooldownRemaining)} remaining.`);
      return;
    }

    const sessionTier = getTierByMiningLevel(miningLevel);
    const startAt = Date.now();
    const session = {
      startAt,
      tier: sessionTier,
      endAt: startAt + MINING_DURATION_MS,
      lastTickAt: startAt,
      accruedYield: {},
      accruedXp: 0,
      accruedTicks: 0,
      hirelingRemainder: 0,
      hirelingTicks: 0,
      hirelingTickMap: {},
      hirelingIndex: 0,
      eventCounts: {
        normal: 0,
        rare: 0,
        crit: 0,
        mishap: 0,
      },
      claimed: false,
    };

    const updated = characterService.updateMockProfile({
      miningSession: session,
    });
    setProfile(updated);
    toast.success('You entered the mines. Return in 5 hours.');
  };

  const handleStopMining = () => {
    if (!MOCK_AUTH || !profile || !isMining || !profile.miningSession) {
      return;
    }

    setShowStopModal(true);
  };

  const handleConfirmStopMining = () => {
    if (!MOCK_AUTH || !profile || !isMining || !profile.miningSession) {
      return;
    }

    const stopAt = Date.now();
    const session = {
      ...profile.miningSession,
      endAt: stopAt,
    };
    const sessionYield = session.accruedYield || {};
    const sessionXp = session.accruedXp || 0;
    const hasAccruedNow = Object.keys(sessionYield).length > 0 || sessionXp > 0;

    if (!hasAccruedNow) {
      const updated = characterService.updateMockProfile({
        miningSession: null,
        miningCooldownUntil: stopAt + 4 * 60 * 60 * 1000,
      });
      setProfile(updated);
      setShowStopModal(false);
      toast('Mining stopped. No haul to claim.', { icon: '⛏️' });
      return;
    }

    const updated = characterService.updateMockProfile({
      miningSession: session,
      miningCooldownUntil: stopAt + 4 * 60 * 60 * 1000,
    });

    setProfile(updated);
    setShowStopModal(false);
    toast('Mining stopped. Claiming your haul...', { icon: '⛏️' });
    handleClaim(session);
  };

  const handleCancelStopMining = () => {
    setShowStopModal(false);
  };

  const handleClaim = React.useCallback((sessionOverride = null) => {
    if (!MOCK_AUTH || !profile) {
      return;
    }

    const session = sessionOverride || profile.miningSession;
    if (!session) {
      return;
    }

    const sessionYield = session.accruedYield || {};
    const sessionXp = session.accruedXp || 0;
    const hasAccruedNow = Object.keys(sessionYield).length > 0 || sessionXp > 0;
    if (!hasAccruedNow) {
      const updated = characterService.updateMockProfile({
        miningSession: null,
      });
      setProfile(updated);
      return;
    }

    const xpGain = sessionXp;
    let nextLevel = miningLevel;
    let nextXp = miningXp + xpGain;
    let xpNeeded = getMiningXpForLevel(nextLevel);

    while (nextXp >= xpNeeded) {
      nextXp -= xpNeeded;
      nextLevel += 1;
      xpNeeded = getMiningXpForLevel(nextLevel);
    }

    const nextInventory = addItems(inventory, sessionYield);

    const isSessionComplete = session.endAt && session.endAt <= Date.now();
    const nextSession = isSessionComplete
      ? null
      : {
        ...session,
        eventCounts: {
          normal: 0,
          rare: 0,
          crit: 0,
          mishap: 0,
        },
        accruedYield: {},
        accruedXp: 0,
        accruedTicks: 0,
        hirelingTicks: 0,
        hirelingTickMap: {},
        hirelingIndex: 0,
      };

    const sessionTier = session.tier ?? getTierByMiningLevel(miningLevel);
    const updated = characterService.updateMockProfile({
      inventory: nextInventory,
      miningLevel: nextLevel,
      miningXp: nextXp,
      miningSession: nextSession,
      lastMiningResult: {
        yieldMap: sessionYield,
        tier: sessionTier,
        finishedAt: Date.now(),
        xpGained: xpGain,
        boosterId: activeBoostId,
      },
    });

    setProfile(updated);
    const anchor = haulRef.current;
    if (anchor) {
      const entries = Object.entries(sessionYield || {}).filter(([, amount]) => amount > 0);
      entries.forEach(([oreId, amount], index) => {
        const oreName = miningOres.find((ore) => ore.id === oreId)?.name || 'Ore';
        pushReward(`+${amount} ${oreName}`, { tone: 'item', anchor, delay: index * 120 });
      });
      if (xpGain > 0) {
        pushReward(`+${xpGain} XP`, { tone: 'xp', anchor, delay: entries.length * 120 });
      }
    }
    toast.success('Mining rewards collected.');
  }, [profile, miningLevel, miningXp, inventory, activeBoostId, pushReward]);

  const handleAutoClaimPartial = React.useCallback(() => {
    if (!MOCK_AUTH || !profile || !profile.miningSession) {
      return;
    }

    const session = profile.miningSession;
    const sessionYield = session.accruedYield || {};
    const sessionXp = session.accruedXp || 0;
    const oreIds = Object.keys(sessionYield).filter((oreId) => (sessionYield[oreId] || 0) > 0);

    if (oreIds.length === 0) {
      return;
    }

    const shuffled = [...oreIds].sort(() => Math.random() - 0.5);
    const pickCount = Math.min(oreIds.length, Math.max(1, Math.floor(Math.random() * 3) + 1));
    const picked = shuffled.slice(0, pickCount);
    const claimedYield = {};

    const totalAccrued = Object.values(sessionYield).reduce((sum, amount) => sum + amount, 0);
    let claimedTotal = 0;
    picked.forEach((oreId) => {
      const amount = sessionYield[oreId] || 0;
      if (amount <= 0) {
        return;
      }
      const portion = Math.max(1, Math.floor(amount * (0.2 + Math.random() * 0.4)));
      const claimAmount = Math.min(amount, portion);
      claimedYield[oreId] = claimAmount;
      claimedTotal += claimAmount;
    });

    if (claimedTotal <= 0) {
      return;
    }

    const xpRatio = totalAccrued > 0 ? claimedTotal / totalAccrued : 0;
    const claimedXp = Math.max(0, Math.floor(sessionXp * xpRatio));
    const { nextLevel, nextXp } = applyMiningXp(claimedXp);

    const nextInventory = addItems(inventory, claimedYield);

    const nextAccruedYield = { ...sessionYield };
    Object.entries(claimedYield).forEach(([oreId, amount]) => {
      const remaining = (nextAccruedYield[oreId] || 0) - amount;
      if (remaining > 0) {
        nextAccruedYield[oreId] = remaining;
      } else {
        delete nextAccruedYield[oreId];
      }
    });

    const updated = characterService.updateMockProfile({
      inventory: nextInventory,
      miningLevel: nextLevel,
      miningXp: nextXp,
      miningSession: {
        ...session,
        accruedYield: nextAccruedYield,
        accruedXp: Math.max(0, sessionXp - claimedXp),
      },
      lastMiningResult: {
        yieldMap: claimedYield,
        tier: session.tier ?? getTierByMiningLevel(miningLevel),
        finishedAt: Date.now(),
        xpGained: claimedXp,
        boosterId: activeBoostId,
      },
    });

    setProfile(updated);
    const anchor = haulRef.current;
    if (anchor) {
      const entries = Object.entries(claimedYield || {}).filter(([, amount]) => amount > 0);
      entries.forEach(([oreId, amount], index) => {
        const oreName = miningOres.find((ore) => ore.id === oreId)?.name || 'Ore';
        pushReward(`+${amount} ${oreName}`, { tone: 'item', anchor, delay: index * 120 });
      });
      if (claimedXp > 0) {
        pushReward(`+${claimedXp} XP`, { tone: 'xp', anchor, delay: entries.length * 120 });
      }
    }
  }, [profile, inventory, miningLevel, activeBoostId, pushReward, applyMiningXp]);

  const applyMiningXp = React.useCallback((xpGain) => {
    let nextLevel = miningLevel;
    let nextXp = miningXp + xpGain;
    let xpNeeded = getMiningXpForLevel(nextLevel);

    while (nextXp >= xpNeeded) {
      nextXp -= xpNeeded;
      nextLevel += 1;
      xpNeeded = getMiningXpForLevel(nextLevel);
    }

    return { nextLevel, nextXp };
  }, [miningLevel, miningXp]);

  const handleDeliverContract = (type) => {
    if (!MOCK_AUTH || !profile || !miningContracts?.[type]) {
      return;
    }

    const contract = miningContracts[type];
    if (contract.claimed) {
      return;
    }

    const currentAmount = getItemCount(inventory, contract.oreId);
    if (currentAmount < contract.amount) {
      toast.error('Not enough ore to deliver.');
      return;
    }

    const nextInventory = removeItems(inventory, { [contract.oreId]: contract.amount });

    const { nextLevel, nextXp } = applyMiningXp(contract.rewardXp);
    const updated = characterService.updateMockProfile({
      inventory: nextInventory,
      miningLevel: nextLevel,
      miningXp: nextXp,
      stats: {
        ...profile.stats,
        gold: (profile.stats?.gold ?? 0) + contract.rewardGold,
      },
      miningContracts: {
        ...miningContracts,
        [type]: {
          ...contract,
          claimed: true,
        },
      },
    });

    setProfile(updated);
    toast.success(`${type === 'weekly' ? 'Weekly' : 'Daily'} contract delivered.`);
  };

  const handleRefreshContract = (type) => {
    if (!MOCK_AUTH || !profile || miningContractTokens <= 0) {
      return;
    }

    const nextContracts = {
      ...miningContracts,
      [type]: buildMiningContract({ type, miningLevel, timestamp: now }),
    };

    const updated = characterService.updateMockProfile({
      miningContracts: nextContracts,
      inventory: removeItems(inventory, { [miningContractToken.id]: 1 }),
    });

    setProfile(updated);
    toast.success(`${type === 'weekly' ? 'Weekly' : 'Daily'} contract refreshed.`);
  };

  const handleUpgradePickaxe = () => {
    if (!MOCK_AUTH || !profile || !nextPickaxe) {
      return;
    }

    if (miningLevel < nextPickaxe.requiredMiningLevel) {
      toast.error('Mining level too low for that pickaxe upgrade.');
      return;
    }

    if (gold < nextPickaxe.price) {
      toast.error('Not enough gold for that upgrade.');
      return;
    }

    const updated = characterService.updateMockProfile({
      pickaxeLevel: nextPickaxe.level,
      stats: {
        ...profile.stats,
        gold: gold - nextPickaxe.price,
      },
    });

    setProfile(updated);
    toast.success(`${nextPickaxe.name} unlocked.`);
  };

  const handleUpgradeForge = () => {
    if (!MOCK_AUTH || !profile || !nextForge) {
      return;
    }

    if (miningLevel < nextForge.requiredMiningLevel) {
      toast.error('Mining level too low for that forge upgrade.');
      return;
    }

    if (gold < nextForge.price) {
      toast.error('Not enough gold for that upgrade.');
      return;
    }

    const updated = characterService.updateMockProfile({
      miningForgeLevel: nextForge.level,
      stats: {
        ...profile.stats,
        gold: gold - nextForge.price,
      },
    });

    setProfile(updated);
    toast.success(`${nextForge.name} unlocked.`);
  };

  const handleHirelingPurchase = (hirelingId) => {
    if (!MOCK_AUTH || !profile) {
      return;
    }

    const hireling = getMiningHireling(hirelingId);
    if (!hireling) {
      return;
    }

    if (miningHirelingsOwned.includes(hirelingId)) {
      toast.error('Hireling already hired.');
      return;
    }

    if (miningLevel < hireling.requiredMiningLevel) {
      toast.error('Mining level too low for that hireling.');
      return;
    }

    if (gold < hireling.price) {
      toast.error('Not enough gold for that hireling.');
      return;
    }

    const updated = characterService.updateMockProfile({
      stats: {
        ...profile.stats,
        gold: gold - hireling.price,
      },
      miningHirelings: [...miningHirelingsOwned, hirelingId],
    });

    setProfile(updated);
    toast.success(`${hireling.name} hired.`);
  };

  const handleDismissHireling = (hirelingId) => {
    if (!MOCK_AUTH || !profile) {
      return;
    }

    if (!miningHirelingsOwned.includes(hirelingId)) {
      return;
    }

    const hireling = getMiningHireling(hirelingId);
    if (!hireling) {
      return;
    }

    const refundRate = hireling.refundRate ?? 0.4;
    const refundAmount = Math.max(0, Math.round(hireling.price * refundRate));
    const nextHirelings = miningHirelingsOwned.filter((id) => id !== hirelingId);

    const updated = characterService.updateMockProfile({
      stats: {
        ...profile.stats,
        gold: gold + refundAmount,
      },
      miningHirelings: nextHirelings,
    });

    setProfile(updated);
    toast.success(`${hireling.name} dismissed for ${refundAmount}g.`);
  };

  const handleOpenDismiss = (hirelingId) => {
    setDismissTarget(hirelingId);
    setShowDismissModal(true);
  };

  const handleCancelDismiss = () => {
    setShowDismissModal(false);
    setDismissTarget(null);
  };

  const handleConfirmDismiss = () => {
    if (!dismissTarget) {
      return;
    }

    handleDismissHireling(dismissTarget);
    setShowDismissModal(false);
    setDismissTarget(null);
  };

  useEffect(() => {
    if (!MOCK_AUTH || !profile) {
      return;
    }

    if (!miningSession || !miningSession.endAt) {
      return;
    }

    if (miningSession.endAt <= now && hasAccrued) {
      handleClaim();
    }
  }, [now, miningSession, hasAccrued, profile, handleClaim]);

  useEffect(() => {
    if (!MOCK_AUTH || !profile) {
      return;
    }

    if (!isMining || !miningSession) {
      if (nextAutoClaimAt) {
        setNextAutoClaimAt(null);
      }
      return;
    }

    if (!nextAutoClaimAt) {
      setNextAutoClaimAt(now + getRandomAutoClaimDelay());
      return;
    }

    if (now < nextAutoClaimAt) {
      return;
    }

    handleAutoClaimPartial();
    setNextAutoClaimAt(now + getRandomAutoClaimDelay());
  }, [now, isMining, miningSession, nextAutoClaimAt, profile, handleAutoClaimPartial]);

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

  const handleArmBooster = (boosterId) => {
    if (!MOCK_AUTH || !profile) {
      return;
    }

    if (getItemCount(inventory, boosterId) <= 0) {
      toast.error('You do not own that booster.');
      return;
    }

    const booster = getMiningConsumable(boosterId);
    if (!booster) {
      return;
    }

    if (miningLevel < booster.requiredMiningLevel) {
      toast.error('Mining level too low for that booster.');
      return;
    }

    const cooldownUntil = boosterCooldowns[boosterId] || 0;
    if (cooldownUntil > Date.now()) {
      toast.error('That booster is on cooldown.');
      return;
    }

    const updated = characterService.updateMockProfile({
      activeMiningBoost: boosterId,
    });

    setProfile(updated);
    toast.success('Booster armed for the next claim.');
  };

  const boosterCooldownRows = useMemo(() => {
    return miningConsumables.map((booster) => {
      const endsAt = boosterCooldowns[booster.id] || 0;
      const remaining = Math.max(0, endsAt - now);
      const total = booster.cooldownMs || 0;
      const progress = total > 0 ? Math.max(0, Math.min(100, Math.round((remaining / total) * 100))) : 0;
      return {
        booster,
        remaining,
        progress,
        isActive: remaining > 0,
      };
    });
  }, [boosterCooldowns, now]);

  const renderBoosterIcon = (boosterId) => {
    const icon = miningBoosterIcons[boosterId];
    if (!icon) {
      return null;
    }

    return (
      <svg
        viewBox={icon.viewBox}
        className="h-4 w-4 text-yellow-200"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d={icon.path} />
      </svg>
    );
  };

  const lastResult = profile?.lastMiningResult;
  const lastResultList = useMemo(() => {
    if (!lastResult?.yieldMap) {
      return [];
    }
    return Object.entries(lastResult.yieldMap).map(([oreId, amount]) => {
      const ore = miningOres.find((item) => item.id === oreId);
      return {
        id: oreId,
        name: ore?.name || oreId,
        amount,
      };
    });
  }, [lastResult]);

  const currentHaulList = useMemo(() => {
    if (!miningSession?.accruedYield) {
      return [];
    }
    return Object.entries(miningSession.accruedYield).map(([oreId, amount]) => {
      const ore = miningOres.find((item) => item.id === oreId);
      return {
        id: oreId,
        name: ore?.name || oreId,
        amount,
      };
    });
  }, [miningSession]);

  const hirelingContribution = miningSession?.hirelingTicks
    ? Math.max(0, miningSession.hirelingTicks)
    : 0;

  const hirelingBreakdown = useMemo(() => {
    const map = miningSession?.hirelingTickMap || {};
    return Object.entries(map)
      .map(([id, count]) => ({
        id,
        count,
        name: miningHirelings.find((item) => item.id === id)?.name || id,
      }))
      .filter((entry) => entry.count > 0);
  }, [miningSession]);

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
              <h1 className="mt-3 text-4xl font-extrabold text-white hero-title">Mining Outpost</h1>
              <p className="mt-3 text-base text-gray-300">
                Enter the mines to gather ore. Stopping early applies a 4-hour cooldown.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/mining/click"
                className="inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold text-yellow-200 action-ghost"
              >
                Mine by Clicking
              </Link>
              <Link
                to="/market"
                className="inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold text-yellow-200 action-ghost"
              >
                Global Market
              </Link>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-yellow-700/30 bg-gray-950/70">
            <img
              src="/cave.png"
              alt="Mining cave"
              className="h-48 w-full object-cover sm:h-56"
            />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="court-card rounded-xl p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Mining Level</p>
              <p className="mt-2 text-2xl font-semibold text-white">{miningLevel}</p>
              <div className="mt-3">
                <XpBar current={miningXp} target={xpToNext} label="Mining XP" tone="cyan" />
              </div>
              {hirelingBreakdown.length > 0 && (
                <details
                  className="mt-2 rounded-lg border border-yellow-700/20 bg-gray-950/70 px-3 py-2 text-xs text-gray-400"
                  open={miningHirelingsOwned.length > 0}
                >
                  <summary className="flex cursor-pointer items-center justify-between text-yellow-200">
                    <span>Hireling contributions</span>
                    <span className="text-[10px] text-yellow-200">▾</span>
                  </summary>
                  <div className="mt-2 space-y-1">
                    {hirelingBreakdown.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between">
                        <span>{entry.name}</span>
                        <span className="text-yellow-200">{entry.count} ticks</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
            <div className="court-card rounded-xl p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Pickaxe Level</p>
              <p className="mt-2 text-2xl font-semibold text-white">{pickaxeLevel}</p>
              <p className="mt-2 text-xs text-gray-400">
                {currentPickaxe?.name || 'Pickaxe'} | {currentPickaxe?.rarity || 'Common'}
              </p>
              {currentPickaxe?.visual && (
                <p className="mt-1 text-xs text-gray-500">{currentPickaxe.visual}</p>
              )}
            </div>
            <div className="image-panel image-panel-housing ornament-frame p-4">
              <div className="image-panel-content">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-300">Session</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {isMining ? 'In Progress' : 'Idle'}
                </p>
                <p className="mt-2 text-sm text-gray-300">
                  {isMining
                    ? `Time left: ${formatDuration(remainingMs)}`
                    : isMiningCooldown
                      ? `Cooldown: ${formatDuration(miningCooldownRemaining)}`
                      : 'Start a new mining run.'}
                </p>
                <p className="mt-3 text-xs text-gray-400">Auto-claim active.</p>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/50">
                  <div
                    className="h-full rounded-full bg-yellow-500/70 transition-all"
                    style={{ width: `${miningProgress}%` }}
                  />
                </div>
                {boosterCooldownRows.some((row) => row.isActive) ? (
                  <div className="mt-3 space-y-2 text-xs text-gray-300">
                    {boosterCooldownRows
                      .filter((row) => row.isActive)
                      .map((row) => (
                        <div key={row.booster.id}>
                          <p>
                            Booster cooldown: {row.booster.name} ({formatDuration(row.remaining)})
                          </p>
                          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/50">
                            <div
                              className="h-full rounded-full bg-amber-400/70"
                              style={{ width: `${row.progress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-gray-400">No booster cooldowns active.</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleStartMining}
              disabled={isMining || isMiningCooldown}
              className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold ${isMining || isMiningCooldown ? 'bg-gray-700 text-gray-300' : 'action-primary text-white'
                }`}
            >
              Start Mining
            </button>
            <button
              type="button"
              onClick={handleStopMining}
              disabled={!isMining}
              className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold ${isMining ? 'border border-yellow-600/60 text-yellow-200' : 'bg-gray-700 text-gray-300'
                }`}
            >
              Stop Mining
            </button>
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-yellow-200 action-ghost"
            >
              Back to Dashboard
            </Link>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="court-card rounded-2xl p-6" ref={haulRef}>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Current Haul</p>
              <p className="mt-2 text-sm text-gray-300">
                Ore mined so far. Claim any time while the timer runs.
              </p>
              <p className="mt-2 text-xs text-gray-400">Hireling ticks: {hirelingContribution}</p>
              {hirelingBreakdown.length > 0 && (
                <div className="mt-2 space-y-1 text-xs text-gray-400">
                  {hirelingBreakdown.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between">
                      <span>{entry.name}</span>
                      <span className="text-yellow-200">{entry.count} ticks</span>
                    </div>
                  ))}
                </div>
              )}
              {currentHaulList.length === 0 ? (
                <p className="mt-4 text-sm text-gray-400">No ore mined yet.</p>
              ) : (
                <ul className="mt-4 space-y-2 text-sm text-gray-300">
                  {currentHaulList.map((item) => (
                    <li key={item.id} className="flex items-center justify-between">
                      <span>{item.name}</span>
                      <span className="text-yellow-200">+{item.amount}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="image-panel image-panel-market ornament-frame p-6">
              <div className="image-panel-content">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-300">Accrued XP</p>
                <p className="mt-3 text-2xl font-semibold text-white">{accruedXp}</p>
                {miningSession?.accruedTicks ? (
                  <p className="mt-1 text-xs text-gray-400">Ticks mined: {miningSession.accruedTicks}</p>
                ) : null}
                <div className="mt-3 rounded-lg border border-yellow-700/20 bg-gray-950/60 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-yellow-400">Events This Run</p>
                  <div className="mt-2 grid gap-1 text-xs text-gray-300">
                    <p>Rare Nodes: {eventCounts.rare || 0}</p>
                    <p>Critical Strikes: {eventCounts.crit || 0}</p>
                    <p>Mishaps: {eventCounts.mishap || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="image-panel image-panel-market ornament-frame p-5">
              <div className="image-panel-content">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-300">Pickaxe Portrait</p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {currentPickaxe?.name || 'Pickaxe'}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {currentPickaxe?.rarity || 'Common'} tier
                </p>
                {currentPickaxe?.visual && (
                  <p className="mt-2 text-xs text-gray-400">{currentPickaxe.visual}</p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  {currentPickaxe?.image && (
                    <div className="rounded-xl border border-yellow-700/30 bg-gray-950/70 p-2">
                      <img
                        src={currentPickaxe.image}
                        alt={currentPickaxe.name}
                        className="h-20 w-20 object-contain"
                      />
                      <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-gray-400">Current</p>
                    </div>
                  )}
                  {nextPickaxe?.image && (
                    <div className="rounded-xl border border-yellow-700/30 bg-gray-950/70 p-2">
                      <img
                        src={nextPickaxe.image}
                        alt={nextPickaxe.name}
                        className="h-20 w-20 object-contain"
                      />
                      <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-gray-400">Next</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 rounded-xl border border-yellow-700/30 bg-gray-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Pickaxe Upgrade</p>
                  {nextPickaxe ? (
                    <>
                      <p className="mt-2 text-sm font-semibold text-white">{nextPickaxe.name}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        Requires mining level {nextPickaxe.requiredMiningLevel} · {nextPickaxe.price}g
                      </p>
                      <button
                        type="button"
                        onClick={handleUpgradePickaxe}
                        className={`mt-3 w-full rounded-lg px-3 py-2 text-xs font-semibold ${miningLevel >= nextPickaxe.requiredMiningLevel && gold >= nextPickaxe.price
                          ? 'action-primary text-white'
                          : 'bg-gray-700 text-gray-300'
                          }`}
                        disabled={miningLevel < nextPickaxe.requiredMiningLevel || gold < nextPickaxe.price}
                      >
                        Upgrade Pickaxe
                      </button>
                    </>
                  ) : (
                    <p className="mt-2 text-xs text-gray-400">Pickaxe fully upgraded.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="court-card rounded-xl p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Mining Notes</p>
              <p className="mt-2 text-sm text-gray-300">
                Rare nodes and critical strikes can spike your haul. Mishaps can reduce a tick.
              </p>
              <div className="mt-3 space-y-1 text-xs text-gray-400">
                <p>
                  Daily Vein: +25% {miningOres.find((ore) => ore.id === dailyVeinBonus.oreId)?.name || 'ore'} yield
                </p>
                <p>Weekly Surge: +{Math.round((weeklySurgeBonus.xpMultiplier - 1) * 100)}% XP</p>
                <p>Prestige Rank: {miningPrestigeLevel} (boosts rare + crit rates)</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="court-card rounded-xl p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Forge Tier</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {currentForge?.name || 'Forge'}
              </p>
              {currentForge?.description && (
                <p className="mt-2 text-xs text-gray-400">{currentForge.description}</p>
              )}
              <p className="mt-3 text-xs text-gray-400">Level {miningForgeLevel}</p>
              <div className="mt-4 rounded-xl border border-yellow-700/30 bg-gray-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Forge Upgrade</p>
                {nextForge ? (
                  <>
                    <p className="mt-2 text-sm font-semibold text-white">{nextForge.name}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      Requires mining level {nextForge.requiredMiningLevel} · {nextForge.price}g
                    </p>
                    {nextForge.description && (
                      <p className="mt-2 text-xs text-gray-400">{nextForge.description}</p>
                    )}
                    <button
                      type="button"
                      onClick={handleUpgradeForge}
                      className={`mt-3 w-full rounded-lg px-3 py-2 text-xs font-semibold ${miningLevel >= nextForge.requiredMiningLevel && gold >= nextForge.price
                        ? 'action-primary text-white'
                        : 'bg-gray-700 text-gray-300'
                        }`}
                      disabled={miningLevel < nextForge.requiredMiningLevel || gold < nextForge.price}
                    >
                      Upgrade Forge
                    </button>
                  </>
                ) : (
                  <p className="mt-2 text-xs text-gray-400">Forge fully upgraded.</p>
                )}
              </div>
            </div>
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
                      {getItemCount(inventory, ore.id)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="image-panel image-panel-inventory ornament-frame p-6">
              <div className="image-panel-content">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-300">Last Haul</p>
                {lastResultList.length === 0 ? (
                  <p className="mt-3 text-sm text-gray-300">No mining rewards yet.</p>
                ) : (
                  <>
                    <p className="mt-2 text-xs text-gray-400">Run tier: {lastResult?.tier || 1}</p>
                    <ul className="mt-3 space-y-2 text-sm text-gray-300">
                      {lastResultList.map((item) => (
                        <li key={item.id} className="flex items-center justify-between">
                          <span>{item.name}</span>
                          <span className="text-yellow-200">+{item.amount}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Mining Contracts</p>
              <span
                className={`${miningContractTokens > 0 ? 'token-glow ' : ''
                  }inline-flex items-center gap-2 rounded-full bg-yellow-500/10 px-3 py-1 text-[10px] font-semibold text-yellow-200`}
              >
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500/20 text-[10px] text-yellow-200">
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden="true">
                    <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4zm0 4l-4 2v4c0 3.6 2.2 6.2 4 7 1.8-.8 4-3.4 4-7V8l-4-2z" />
                  </svg>
                </span>
                Tokens: {miningContractTokens}
              </span>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {['daily', 'weekly'].map((type) => {
                const contract = miningContracts?.[type];
                const ore = miningOres.find((item) => item.id === contract?.oreId);
                const owned = contract ? getItemCount(inventory, contract.oreId) : 0;
                const isClaimed = contract?.claimed;
                const canDeliver = contract && owned >= contract.amount && !isClaimed;
                const timeLeft = contract?.expiresAt ? Math.max(0, contract.expiresAt - now) : 0;
                return (
                  <div key={type} className="court-card rounded-2xl p-6">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                      {type === 'weekly' ? 'Weekly Contract' : 'Daily Contract'}
                    </p>
                    {contract ? (
                      <div className="mt-3 space-y-2 text-sm text-gray-300">
                        <p className="text-white font-semibold">Deliver {contract.amount} {ore?.name || 'Ore'}</p>
                        <p>Reward: {contract.rewardGold} gold + {contract.rewardXp} XP</p>
                        <p>Progress: {owned}/{contract.amount}</p>
                        <p>Time left: {formatDuration(timeLeft)}</p>
                        {isClaimed ? (
                          <span className="inline-flex rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-200">
                            Completed
                          </span>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleDeliverContract(type)}
                              className={`rounded-lg px-3 py-2 text-xs font-semibold ${canDeliver ? 'action-primary text-white' : 'bg-gray-700 text-gray-300'
                                }`}
                              disabled={!canDeliver}
                            >
                              Deliver Ore
                            </button>
                            <div className="relative group">
                              <button
                                type="button"
                                onClick={() => handleRefreshContract(type)}
                                className={`rounded-lg px-3 py-2 text-xs font-semibold ${miningContractTokens > 0 ? 'action-ghost text-yellow-200' : 'bg-gray-700 text-gray-300'
                                  }`}
                                disabled={miningContractTokens <= 0}
                              >
                                Refresh ({miningContractTokens})
                              </button>
                              <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-44 -translate-x-1/2 rounded-lg border border-yellow-700/30 bg-gray-950/95 px-3 py-2 text-[10px] text-gray-200 opacity-0 transition duration-200 ease-out group-hover:opacity-100 group-hover:translate-y-0 translate-y-1 group-hover:shadow-[0_0_12px_rgba(250,204,21,0.35)]">
                                <div className="flex items-start gap-2">
                                  <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500/20 text-[10px] text-yellow-200">
                                    i
                                  </span>
                                  <span>Uses one token to reroll this contract.</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-gray-300">Contract parchment is being prepared.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="court-card rounded-2xl p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Worker Hirelings</p>
              <p className="mt-2 text-sm text-gray-300">
                Passive miners add extra ticks while you are away.
              </p>
              <p className="mt-2 text-xs text-gray-400">Total bonus: +{hirelingTicksPerHour} ticks/hour</p>
              {hirelingBreakdown.length > 0 && (
                <details
                  className="mt-2 rounded-lg border border-yellow-700/20 bg-gray-950/70 px-3 py-2 text-xs text-gray-400"
                  open={miningHirelingsOwned.length > 0}
                >
                  <summary className="flex cursor-pointer items-center justify-between text-yellow-200">
                    <span>Hireling contributions</span>
                    <span className="text-[10px] text-yellow-200">▾</span>
                  </summary>
                  <div className="mt-2 space-y-1">
                    {hirelingBreakdown.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between">
                        <span>{entry.name}</span>
                        <span className="text-yellow-200">{entry.count} ticks</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {miningHirelings.map((hireling) => {
                  const owned = miningHirelingsOwned.includes(hireling.id);
                  const meetsLevel = miningLevel >= hireling.requiredMiningLevel;
                  const canHire = !owned && meetsLevel && gold >= hireling.price;
                  const refundRate = hireling.refundRate ?? 0.4;
                  const refundAmount = Math.max(0, Math.round(hireling.price * refundRate));
                  return (
                    <div key={hireling.id} className="rounded-xl border border-yellow-700/20 bg-gray-950/70 p-4">
                      <p className="text-sm font-semibold text-white">{hireling.name}</p>
                      <p className="mt-1 text-xs text-gray-400">{hireling.description}</p>
                      <p className="mt-2 text-xs text-gray-500">+{hireling.ticksPerHour} ticks/hour</p>
                      <p className="mt-2 text-xs text-gray-500">
                        Requires L{hireling.requiredMiningLevel} · {hireling.price}g
                      </p>
                      {owned && (
                        <p className="mt-2 text-xs text-gray-500">Dismiss refund: {refundAmount}g</p>
                      )}
                      <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs ${owned ? 'bg-yellow-500/10 text-yellow-200' : 'bg-gray-800 text-gray-400'
                        }`}>
                        {owned ? 'Hired' : 'Not hired'}
                      </span>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => handleHirelingPurchase(hireling.id)}
                          className={`rounded-lg px-3 py-2 text-xs font-semibold ${canHire ? 'action-primary text-white' : 'bg-gray-700 text-gray-300'
                            }`}
                          disabled={!canHire}
                        >
                          Hire
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDismiss(hireling.id)}
                          className={`rounded-lg px-3 py-2 text-xs font-semibold ${owned ? 'border border-yellow-700/40 text-yellow-200' : 'bg-gray-700 text-gray-300'
                            }`}
                          disabled={!owned}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="image-panel image-panel-market ornament-frame p-6">
              <div className="image-panel-content">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-300">Passive Summary</p>
                <p className="mt-3 text-sm text-gray-300">
                  Hirelings add {hirelingTicksPerHour} extra ticks per hour while mining.
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  Bonuses stack with your pickaxe and boosters.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="court-card rounded-2xl p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Mining Boosters</p>
              <p className="mt-2 text-sm text-gray-300">
                Arm a consumable to increase mining XP on your next claim.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {miningConsumables.map((booster) => {
                  const owned = getItemCount(inventory, booster.id);
                  const isArmed = activeBoostId === booster.id;
                  const cooldownUntil = boosterCooldowns[booster.id] || 0;
                  const isOnCooldown = cooldownUntil > Date.now();
                  const cooldownLabel = isOnCooldown ? formatDuration(cooldownUntil - Date.now()) : 'Ready';
                  const meetsLevel = miningLevel >= booster.requiredMiningLevel;
                  const canArm = owned > 0 && !isArmed && !isOnCooldown && meetsLevel;
                  return (
                    <div key={booster.id} className="rounded-xl border border-yellow-700/20 bg-gray-950/70 p-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-yellow-500/10">
                          {renderBoosterIcon(booster.id)}
                        </span>
                        <p className="text-sm font-semibold text-white">{booster.name}</p>
                      </div>
                      <p className="mt-1 text-xs text-gray-400">{booster.description}</p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300">
                        <span>Owned: {owned}</span>
                        <span>Req L{booster.requiredMiningLevel}</span>
                        <span>Cooldown: {cooldownLabel}</span>
                        {isArmed ? (
                          <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-200">
                            Armed
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleArmBooster(booster.id)}
                            className={`rounded-lg px-3 py-1 text-xs font-semibold ${canArm ? 'action-primary text-white' : 'bg-gray-700 text-gray-300'
                              }`}
                            disabled={!canArm}
                          >
                            Arm
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="image-panel image-panel-market ornament-frame p-6">
              <div className="image-panel-content">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-300">Active Booster</p>
                {activeBoost ? (
                  <div className="mt-3 text-sm text-gray-300">
                    <p className="font-semibold text-white">{activeBoost.name}</p>
                    <p className="mt-1 text-xs text-gray-400">{activeBoost.description}</p>
                    <p className="mt-1 text-xs text-gray-400">Req level {activeBoost.requiredMiningLevel}</p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-gray-300">No booster armed.</p>
                )}
                {lastResult?.boosterId && (
                  <p className="mt-3 text-xs text-gray-400">
                    Last claim used: {getMiningConsumable(lastResult.boosterId)?.name || 'Booster'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showStopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-yellow-700/30 bg-gray-950/95 p-6 shadow-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-400">Stop Mining</p>
            <h2 className="mt-3 text-xl font-semibold text-white">End your mining run early?</h2>
            <p className="mt-2 text-sm text-gray-300">
              Stopping now will apply a 4-hour cooldown. Your current haul will be claimed.
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Cooldown ends at {new Date(Date.now() + 4 * 60 * 60 * 1000).toLocaleString()}.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelStopMining}
                className="rounded-lg border border-yellow-700/40 px-4 py-2 text-xs font-semibold text-yellow-200"
              >
                Keep Mining
              </button>
              <button
                type="button"
                onClick={handleConfirmStopMining}
                className="rounded-lg px-4 py-2 text-xs font-semibold action-primary text-white"
              >
                Stop & Claim
              </button>
            </div>
          </div>
        </div>
      )}
      {showDismissModal && dismissHireling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-yellow-700/30 bg-gray-950/95 p-6 shadow-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-400">Dismiss Hireling</p>
            <h2 className="mt-3 text-xl font-semibold text-white">
              Dismiss {dismissHireling.name}?
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              This hireling will stop providing ticks. You will receive a refund.
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Refund: {Math.max(0, Math.round(dismissHireling.price * (dismissHireling.refundRate ?? 0.4)))}g
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelDismiss}
                className="rounded-lg border border-yellow-700/40 px-4 py-2 text-xs font-semibold text-yellow-200"
              >
                Keep Hireling
              </button>
              <button
                type="button"
                onClick={handleConfirmDismiss}
                className="rounded-lg px-4 py-2 text-xs font-semibold action-primary text-white"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
