import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../shared/layout/Sidebar';
import { useRewardFloat } from '../shared/feedback/RewardFloatProvider';
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
  miningContractToken,
  rollMiningTick,
  miningOres,
  miningConsumables,
  miningHirelings,
} from '../data/miningData';
import { getZoneModifiers } from '../data/zonesData';
import { addItems, getItemCount, removeItems } from '../services/inventoryService';

import MiningInventory from '../features/mining/MiningInventory';
import MiningBoosters from '../features/mining/MiningBoosters';
import MiningContracts from '../features/mining/MiningContracts';
import MiningHirelings from '../features/mining/MiningHirelings';
import MiningSessionStatus from '../features/mining/MiningSessionStatus';
import MiningLevelCard from '../features/mining/MiningLevelCard';
import MiningPickaxeCard from '../features/mining/MiningPickaxeCard';
import MiningPickaxeDetail from '../features/mining/MiningPickaxeDetail';
import MiningForgeDetail from '../features/mining/MiningForgeDetail';

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

  const accruedXp = miningSession?.accruedXp || 0;
  // hasAccrued removed
  const eventCounts = miningSession?.eventCounts || {};

  const miningLevel = profile?.miningLevel ?? 1;
  const miningXp = profile?.miningXp ?? 0;
  const pickaxeLevel = profile?.pickaxeLevel ?? 1;
  const miningForgeLevel = profile?.miningForgeLevel ?? 1;
  const miningPrestigeLevel = profile?.miningPrestigeLevel ?? 0;
  const inventory = useMemo(() => profile?.inventory || {}, [profile?.inventory]);
  const gold = profile?.stats?.gold ?? 0;
  const activeBoostId = profile?.activeMiningBoost || null;
  // activeBoost removed
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
  // dismissHireling removed
  const hirelingTicksPerHour = miningHirelingsOwned
    .map((id) => getMiningHireling(id))
    .filter(Boolean)
    .reduce((sum, hireling) => sum + hireling.ticksPerHour, 0);

  const dailyVeinBonus = useMemo(() => getDailyVeinBonus(now), [now]);
  const weeklySurgeBonus = useMemo(() => getWeeklySurgeBonus(now), [now]);

  // Moved applyMiningXp up as it is needed by handleAutoClaimPartial
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

  const handleOpenDismiss = (hirelingId) => {
    setDismissTarget(hirelingId);
    setShowDismissModal(true);
  };

  const handleConfirmDismiss = () => {
    if (!MOCK_AUTH || !profile || !dismissTarget) {
      return;
    }

    handleDismissHireling(dismissTarget);
    setShowDismissModal(false);
    setDismissTarget(null);
  };

  const handleCancelDismiss = () => {
    setShowDismissModal(false);
    setDismissTarget(null);
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
        gold: (profile.stats?.gold ?? 0) + refundAmount,
      },
      miningHirelings: nextHirelings,
    });

    setProfile(updated);
    toast.success(`${hireling.name} dismissed.`);
  };

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

  const hirelingContribution = useMemo(() => {
    if (!miningSession?.hirelingTicks) {
      return 0;
    }
    return miningSession.hirelingTicks;
  }, [miningSession]);

  const hirelingBreakdown = useMemo(() => {
    if (!miningSession?.hirelingTickMap) {
      return [];
    }
    return Object.entries(miningSession.hirelingTickMap)
      .map(([id, count]) => {
        const hireling = miningHirelings.find((h) => h.id === id);
        return {
          id,
          name: hireling?.name || 'Unknown',
          count,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [miningSession]);

  useEffect(() => {
    if (!isMining || !nextAutoClaimAt) {
      if (isMining && !nextAutoClaimAt) {
        setNextAutoClaimAt(now + getRandomAutoClaimDelay());
      }
      return;
    }

    if (now >= nextAutoClaimAt) {
      handleAutoClaimPartial();
      setNextAutoClaimAt(now + getRandomAutoClaimDelay());
    }
  }, [now, isMining, nextAutoClaimAt, handleAutoClaimPartial]);

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
            <MiningLevelCard
              miningLevel={miningLevel}
              miningXp={miningXp}
              xpToNext={xpToNext}
              hirelingBreakdown={hirelingBreakdown}
              miningHirelingsOwned={miningHirelingsOwned}
            />
            <MiningPickaxeCard
              pickaxeLevel={pickaxeLevel}
              currentPickaxe={currentPickaxe}
            />
            <MiningSessionStatus
              isMining={isMining}
              remainingMs={remainingMs}
              isMiningCooldown={isMiningCooldown}
              miningCooldownRemaining={miningCooldownRemaining}
              miningProgress={miningProgress}
              boosterCooldownRows={boosterCooldownRows}
            />
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

          {/* Current Haul Panel (kept here as it's specific to the active session) */}
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

          <MiningPickaxeDetail
            currentPickaxe={currentPickaxe}
            nextPickaxe={nextPickaxe}
            miningLevel={miningLevel}
            gold={gold}
            handleUpgradePickaxe={handleUpgradePickaxe}
            dailyVeinBonus={dailyVeinBonus}
            weeklySurgeBonus={weeklySurgeBonus}
            miningPrestigeLevel={miningPrestigeLevel}
          />

          <MiningForgeDetail
            currentForge={currentForge}
            nextForge={nextForge}
            miningForgeLevel={miningForgeLevel}
            miningLevel={miningLevel}
            gold={gold}
            handleUpgradeForge={handleUpgradeForge}
          />

          <MiningInventory
            inventory={inventory}
            lastResultList={lastResultList}
            lastResult={lastResult}
          />

          <MiningContracts
            miningContracts={miningContracts}
            inventory={inventory}
            miningContractTokens={miningContractTokens}
            now={now}
            handleDeliverContract={handleDeliverContract}
            handleRefreshContract={handleRefreshContract}
          />

          <MiningHirelings
            miningHirelingsOwned={miningHirelingsOwned}
            hirelingBreakdown={hirelingBreakdown}
            miningLevel={miningLevel}
            gold={gold}
            hirelingTicksPerHour={hirelingTicksPerHour}
            handleHirelingPurchase={handleHirelingPurchase}
            handleOpenDismiss={handleOpenDismiss}
          />

          <MiningBoosters
            inventory={inventory}
            activeBoostId={activeBoostId}
            boosterCooldowns={boosterCooldowns}
            miningLevel={miningLevel}
            handleArmBooster={handleArmBooster}
          />

        </div>
      </div>

      {/* Dismiss Hireling Modal */}
      {showDismissModal && dismissTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-yellow-700/30 bg-gray-950 p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white">Dismiss Hireling</h3>
            <p className="mt-2 text-sm text-gray-300">
              Are you sure? You will get a partial refund of{' '}
              {Math.max(0, Math.round((getMiningHireling(dismissTarget)?.price || 0) * (getMiningHireling(dismissTarget)?.refundRate || 0.4)))}g.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelDismiss}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDismiss}
                className="rounded-lg bg-red-900/50 px-4 py-2 text-sm font-semibold text-red-200 border border-red-500/20 hover:bg-red-900/70"
              >
                Confirm Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stop Mining Modal */}
      {showStopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-yellow-700/30 bg-gray-950 p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white">Stop Mining?</h3>
            <p className="mt-2 text-sm text-gray-300">
              Stopping early will trigger the 4-hour cooldown immediately. You will
              keep any ore mined so far.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelStopMining}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-white/5"
              >
                Keep Mining
              </button>
              <button
                type="button"
                onClick={handleConfirmStopMining}
                className="rounded-lg bg-red-900/50 px-4 py-2 text-sm font-semibold text-red-200 border border-red-500/20 hover:bg-red-900/70"
              >
                Stop & Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
