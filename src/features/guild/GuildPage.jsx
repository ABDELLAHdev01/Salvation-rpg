import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../../shared/layout/Sidebar';
import authService from '../../core/services/AuthService';
import characterService from '../../core/services/CharacterService';
import { getGuildOrder, calculateGuildRank, guildTithes } from '../../core/data/guildData';
import { audioManager } from '../../core/audio/AudioManager';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

export default function Guild() {
  const [profile, setProfile] = useState(null);
  const [character, setCharacter] = useState(null);

  useEffect(() => {
    if (!MOCK_AUTH) return;
    const username = authService.getCurrentUsername();
    const currentProfile = characterService.getMockProfile(username);
    const currentCharacter = characterService.getMockCharacter(username);
    setProfile(currentProfile);
    setCharacter(currentCharacter);
  }, []);

  const cityId = character?.city || profile?.city || 'valoria';
  const order = useMemo(() => getGuildOrder(cityId), [cityId]);
  const renown = profile?.stats?.renown ?? 0;
  const currentRank = useMemo(() => calculateGuildRank(renown, order), [renown, order]);

  // Find next rank progress
  const nextRank = useMemo(() => {
    const list = order.rankThresholds;
    return list.find((t) => t.minRenown > renown) || null;
  }, [order, renown]);

  const rankPercent = useMemo(() => {
    if (!nextRank) return 100;
    const prevMin = order.rankThresholds
      .filter((t) => t.minRenown <= renown)
      .slice(-1)[0]?.minRenown || 0;
    const span = nextRank.minRenown - prevMin;
    const current = renown - prevMin;
    return Math.min(100, Math.max(5, Math.round((current / span) * 100)));
  }, [nextRank, order, renown]);

  const handleMakeTithe = (tithe) => {
    if (!profile) return;

    const currentGold = profile?.stats?.gold ?? 0;
    const inventory = profile?.inventory || {};

    if (tithe.cost.type === 'gold') {
      if (currentGold < tithe.cost.amount) {
        audioManager.play('error');
        toast.error(`Requires ${tithe.cost.amount} gold for this offering.`);
        return;
      }

      const nextGold = currentGold - tithe.cost.amount;
      const nextRenown = renown + tithe.rewardRenown;
      const nextInventory = { ...inventory };
      nextInventory['contract-sigil'] = (nextInventory['contract-sigil'] || 0) + tithe.rewardSigils;

      const updated = characterService.updateMockProfile({
        stats: {
          ...profile.stats,
          gold: nextGold,
          renown: nextRenown,
        },
        inventory: nextInventory,
      });

      setProfile(updated);
      audioManager.play('coin');
      setTimeout(() => audioManager.play('levelup'), 220);
      toast.success(`Offering accepted by the Order! +${tithe.rewardRenown} Renown & +${tithe.rewardSigils} Sigil.`);
    } else if (tithe.cost.type === 'item') {
      const ownedAmount = inventory[tithe.cost.itemId] || 0;
      if (ownedAmount < tithe.cost.amount) {
        audioManager.play('error');
        toast.error(`Requires ${tithe.cost.amount} ${tithe.cost.itemId.replace('-', ' ')} in inventory.`);
        return;
      }

      const nextRenown = renown + tithe.rewardRenown;
      const nextInventory = { ...inventory };
      nextInventory[tithe.cost.itemId] -= tithe.cost.amount;
      if (nextInventory[tithe.cost.itemId] <= 0) {
        delete nextInventory[tithe.cost.itemId];
      }
      nextInventory['contract-sigil'] = (nextInventory['contract-sigil'] || 0) + tithe.rewardSigils;

      const updated = characterService.updateMockProfile({
        stats: {
          ...profile.stats,
          renown: nextRenown,
        },
        inventory: nextInventory,
      });

      setProfile(updated);
      audioManager.play('craft');
      setTimeout(() => audioManager.play('levelup'), 220);
      toast.success(`Provisions pledged! +${tithe.rewardRenown} Renown & +${tithe.rewardSigils} Sigil.`);
    }
  };

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('/jbm.webp')] bg-gray-900 bg-blend-multiply dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 pt-24">
        <div className="rounded-2xl p-8 shadow-xl backdrop-blur court-reveal glass-panel">
          {/* Header Banner */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-yellow-700/20 pb-8">
            <div className="flex items-center gap-5">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-yellow-700/50 bg-gray-950/80 p-2 shadow-2xl">
                <img
                  src={order.crest}
                  alt={order.orderName}
                  className="h-full w-full object-contain drop-shadow-[0_0_12px_rgba(234,179,8,0.3)]"
                />
              </div>
              <div>
                <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">{order.bastion}</p>
                <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold text-white hero-title">{order.orderName}</h1>
                <p className="mt-1 text-sm text-yellow-200/90 italic font-serif">"{order.motto}"</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3 py-0.5 text-xs font-bold text-yellow-300">
                    Order Rank: {currentRank}
                  </span>
                  <span className="rounded-full border border-yellow-700/40 bg-gray-950/70 px-3 py-0.5 text-xs text-gray-300">
                    {order.bannerPerk}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-yellow-700/30 bg-gray-950/70 p-4 text-center sm:min-w-[160px]">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold">Order Renown</p>
              <p className="mt-1 text-3xl font-black text-yellow-400">{renown}</p>
              {nextRank && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                    <span>Next: {nextRank.title}</span>
                    <span>{rankPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-yellow-500 shimmer-bar"
                      style={{ width: `${rankPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Fellowship Companions */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Fellowship Roster</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">Order Lieutenants & Companions</h2>
              </div>
              <span className="rounded-full border border-yellow-700/40 bg-gray-950/70 px-3 py-1 text-xs text-yellow-200">
                3 Active Guardians
              </span>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {order.companions.map((companion) => (
                <div
                  key={companion.name}
                  className="rounded-xl border border-yellow-700/30 bg-gray-900/80 p-5 hover-lift transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={companion.avatar}
                      alt={companion.name}
                      className="h-14 w-14 rounded-xl border border-yellow-700/40 object-cover bg-gray-950"
                    />
                    <div>
                      <h3 className="text-base font-bold text-white">{companion.name}</h3>
                      <p className="text-xs text-yellow-400 font-semibold">{companion.title}</p>
                      <p className="text-[11px] text-gray-400">{companion.role}</p>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-yellow-700/10 pt-3">
                    <p className="text-[11px] text-gray-300 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse inline-block" />
                      <span>{companion.status}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Tithes and Offerings */}
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-yellow-500">Order Altar</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">Pledge Tithe & Offerings</h2>
                <p className="mt-1 text-sm text-gray-300">
                  Support your order with coin or supplies to earn Order Renown and Imperial Sigils.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {guildTithes.map((tithe) => {
                const currentGold = profile?.stats?.gold ?? 0;
                const inv = profile?.inventory || {};
                const canAfford =
                  tithe.cost.type === 'gold'
                    ? currentGold >= tithe.cost.amount
                    : (inv[tithe.cost.itemId] || 0) >= tithe.cost.amount;

                return (
                  <div
                    key={tithe.id}
                    className="flex flex-col justify-between rounded-xl border border-yellow-700/30 bg-gray-950/60 p-5"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {tithe.cost.type === 'gold' ? `${tithe.cost.amount} Gold` : `${tithe.cost.amount}x ${tithe.cost.itemId.replace('-', ' ')}`}
                        </span>
                        <span className="text-[10px] font-bold text-yellow-400">
                          +{tithe.rewardRenown} Renown · +{tithe.rewardSigils} Sigil
                        </span>
                      </div>
                      <h3 className="mt-2 text-lg font-bold text-white">{tithe.label}</h3>
                      <p className="mt-2 text-xs text-gray-300 leading-relaxed">{tithe.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleMakeTithe(tithe)}
                      disabled={!canAfford}
                      className={`mt-5 w-full rounded-lg py-2 text-xs font-bold transition-all ${
                        canAfford
                          ? 'bg-yellow-400 text-gray-950 hover:bg-yellow-300 active:scale-95'
                          : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700/50'
                      }`}
                    >
                      {canAfford ? 'Pledge Offering' : 'Insufficient Resources'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-10 flex flex-wrap gap-3 border-t border-yellow-700/20 pt-6">
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white action-primary"
            >
              Back to Dashboard
            </Link>
            <Link
              to="/arena"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-yellow-200 action-ghost"
            >
              Enter Colosseum
            </Link>
            <Link
              to="/lore"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-yellow-200 action-ghost"
            >
              Order Chronicles
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
