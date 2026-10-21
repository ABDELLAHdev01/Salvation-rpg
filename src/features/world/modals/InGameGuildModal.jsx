import React, { useState } from 'react';
import toast from 'react-hot-toast';
import audioManager from '../../../core/audio/AudioManager';
import { getItemIcon } from '../../../core/data/itemIcons';
import {
  getGuildRankProgress,
  getGuildBoardState,
  acceptGuildContract,
  claimContractReward,
  CONTRACT_CATEGORIES,
} from '../../../core/quests/guildContracts';

export default function InGameGuildModal({
  isOpen,
  onClose,
  profile,
  onProfileUpdate = () => {},
}) {
  const [activeTab, setActiveTab] = useState('available');
  const [categoryFilter, setCategoryFilter] = useState('all');

  if (!isOpen) return null;

  const renown = profile?.stats?.renown || 0;
  const { currentRank, nextRank, renownNeeded, progressPercent } = getGuildRankProgress(renown);
  const boardState = getGuildBoardState(profile);

  const handleAccept = (contractId) => {
    const res = acceptGuildContract(contractId, profile);
    if (!res.success) {
      audioManager.play('tap');
      toast.error(res.reason);
      return;
    }

    audioManager.play('coin');
    toast.success(`Accepted: ${res.contract.title}!`, { icon: '📜' });
    onProfileUpdate({
      ...profile,
      activeContracts: res.updatedActiveContracts,
    });
  };

  const handleClaim = (contractId) => {
    const previousRank = currentRank.id;
    const res = claimContractReward(contractId, profile);
    if (!res.success) {
      audioManager.play('tap');
      toast.error(res.reason);
      return;
    }

    audioManager.play('levelup');
    toast.success(`Contract Completed: ${res.contract.title}! +${res.rewardsGranted.renown} Renown`, { icon: '⭐' });

    // Check for Guild Rank Up
    const newRenown = res.updatedProfile.stats.renown;
    const newRankProgress = getGuildRankProgress(newRenown);
    if (newRankProgress.currentRank.id !== previousRank) {
      setTimeout(() => {
        audioManager.play('levelup');
        toast.success(`🎉 GUILD RANK PROMOTION! You are now a ${newRankProgress.currentRank.name}!`, {
          duration: 5000,
          icon: '👑',
        });
      }, 600);
    }

    onProfileUpdate(res.updatedProfile);
  };

  const filteredAvailable = boardState.available.filter((c) => {
    if (categoryFilter === 'all') return true;
    return c.category === categoryFilter;
  });

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case CONTRACT_CATEGORIES.MAIN:
        return <span className="rounded-lg bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/40">Main Story</span>;
      case CONTRACT_CATEGORIES.GUILD:
        return <span className="rounded-lg bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/40">Guild Bounty</span>;
      case CONTRACT_CATEGORIES.DISCOVERY:
        return <span className="rounded-lg bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/40">Discovery</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn select-none">
      <div className="rpg-panel-brown relative flex flex-col h-[600px] w-full max-w-4xl p-6 shadow-2xl">
        
        {/* Header: Guild Crest & NPC Greeting */}
        <div className="flex items-center justify-between border-b border-amber-900/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-500/50 bg-yellow-500/10 text-2xl shadow-inner">
              ⚔️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-amber-100 tracking-wide sm:text-xl drop-shadow">
                  The Adventurers' Guild
                </h2>
                <span className="rounded-md border border-amber-700/40 bg-amber-950/60 px-2 py-0.5 text-[10px] font-mono text-amber-300">
                  Sunforge Chapter
                </span>
              </div>
              <p className="text-xs text-amber-300/70">
                Guild Warden Michelle: <span className="italic text-amber-100">"Honorable Warden, contract bounties and realm renown await."</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              onClose();
            }}
            className="rpg-btn-square-brown h-8 w-8 text-xs font-bold text-amber-200"
          >
            ✕
          </button>
        </div>

        {/* Guild Rank & Renown Progress Banner */}
        <div className="rpg-slot-inset my-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-stone-950/70">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl font-bold font-mono text-sm border shadow"
              style={{ backgroundColor: `${currentRank.badgeColor}22`, borderColor: currentRank.badgeColor, color: currentRank.badgeColor }}
            >
              ★
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-sm font-bold text-white">
                  {currentRank.name}
                </span>
                <span className="font-mono text-xs text-yellow-400 font-bold">
                  ({renown} Renown)
                </span>
              </div>
              <p className="text-[11px] text-gray-400 line-clamp-1">
                {currentRank.perk}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-56">
            <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
              <span>Next: {nextRank ? nextRank.name : 'Max Rank'}</span>
              <span>{nextRank ? `${renownNeeded} pts left` : '100%'}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800 border border-gray-700">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-amber-900/50 pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                audioManager.play('tap');
                setActiveTab('available');
              }}
              className={`${
                activeTab === 'available' ? 'rpg-btn-beige active' : 'rpg-btn-brown'
              } text-xs py-1 px-3`}
            >
              Contract Board ({boardState.available.length})
            </button>
            <button
              type="button"
              onClick={() => {
                audioManager.play('tap');
                setActiveTab('active');
              }}
              className={`${
                activeTab === 'active' ? 'rpg-btn-beige active' : 'rpg-btn-brown'
              } text-xs py-1 px-3 flex items-center gap-1.5`}
            >
              <span>Active Contracts</span>
              {boardState.active.length > 0 && (
                <span className="rounded-full bg-amber-300 px-1.5 py-0.2 text-[10px] font-mono text-black font-bold">
                  {boardState.active.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                audioManager.play('tap');
                setActiveTab('completed');
              }}
              className={`${
                activeTab === 'completed' ? 'rpg-btn-beige active' : 'rpg-btn-brown'
              } text-xs py-1 px-3`}
            >
              History ({boardState.completed.length})
            </button>
          </div>

          {activeTab === 'available' && (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono">
              <span className="text-amber-300/70">Filter:</span>
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`${categoryFilter === 'all' ? 'rpg-btn-beige active' : 'rpg-btn-brown'} text-[10px] py-0.5 px-2`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter(CONTRACT_CATEGORIES.MAIN)}
                className={`${categoryFilter === CONTRACT_CATEGORIES.MAIN ? 'rpg-btn-beige active' : 'rpg-btn-brown'} text-[10px] py-0.5 px-2`}
              >
                Story
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter(CONTRACT_CATEGORIES.GUILD)}
                className={`${categoryFilter === CONTRACT_CATEGORIES.GUILD ? 'rpg-btn-beige active' : 'rpg-btn-brown'} text-[10px] py-0.5 px-2`}
              >
                Bounties
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter(CONTRACT_CATEGORIES.DISCOVERY)}
                className={`${categoryFilter === CONTRACT_CATEGORIES.DISCOVERY ? 'rpg-btn-beige active' : 'rpg-btn-brown'} text-[10px] py-0.5 px-2`}
              >
                Discoveries
              </button>
            </div>
          )}
        </div>

        {/* Contract List Body */}
        <div className="mt-3 flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
          {/* TAB 1: AVAILABLE CONTRACTS */}
          {activeTab === 'available' && (
            <>
              {filteredAvailable.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-gray-400">
                  <span className="text-3xl mb-2">📜</span>
                  <p className="text-xs">No available contracts matching filter.</p>
                </div>
              ) : (
                filteredAvailable.map((c) => (
                  <div
                    key={c.id}
                    className={`rounded-2xl border p-4 transition ${
                      c.isEligible
                        ? 'border-yellow-700/30 bg-gray-900/60 hover:border-yellow-500/50'
                        : 'border-gray-800/60 bg-gray-950/40 opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {getCategoryBadge(c.category)}
                          <span className="font-mono text-[10px] text-gray-400 uppercase tracking-wider">
                            {c.kicker}
                          </span>
                        </div>
                        <h3 className="font-serif text-sm font-bold text-white sm:text-base">
                          {c.title}
                        </h3>
                        <p className="text-xs text-gray-300 mt-1">
                          {c.summary}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {c.isEligible ? (
                          <button
                            type="button"
                            onClick={() => handleAccept(c.id)}
                            className="rpg-btn-beige text-xs py-1.5 px-4 font-serif font-bold text-amber-950"
                          >
                            Accept Contract ✍️
                          </button>
                        ) : (
                          <span className="rpg-btn-brown opacity-60 text-[11px] py-1 px-3 cursor-not-allowed">
                            🔒 Rank: {c.minRank}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Objectives & Rewards Row */}
                    <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 border-t border-amber-900/40 pt-3 text-xs">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-300">
                          Objectives:
                        </span>
                        <ul className="space-y-0.5">
                          {c.objectives.map((obj) => (
                            <li key={obj.id} className="text-[11px] text-amber-100 flex items-center gap-1.5 font-serif">
                              <span className="text-amber-400">•</span>
                              <span>{obj.label} ({obj.target} required)</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="rpg-slot-inset px-2 py-0.5 flex items-center gap-1 text-amber-300 font-mono font-bold bg-stone-950/80">
                          <img src={getItemIcon('gold-coin')} alt="Gold" className="h-3.5 w-3.5 pixelated" />
                          <span>+{c.rewards.gold}g</span>
                        </div>
                        <div className="rpg-slot-inset px-2 py-0.5 flex items-center gap-1 text-purple-300 font-mono font-bold bg-stone-950/80">
                          <span>⭐</span>
                          <span>+{c.rewards.xp} XP</span>
                        </div>
                        <div className="rpg-slot-inset px-2 py-0.5 flex items-center gap-1 text-amber-200 font-mono font-bold bg-stone-950/80">
                          <span>★</span>
                          <span>+{c.rewards.renown} Renown</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* TAB 2: ACTIVE CONTRACTS */}
          {activeTab === 'active' && (
            <>
              {boardState.active.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-amber-200/60 font-serif">
                  <span className="text-3xl mb-2 drop-shadow">📋</span>
                  <p className="text-xs">No active guild contracts. Pick an open contract from the Board!</p>
                </div>
              ) : (
                boardState.active.map((c) => {
                  const isReady = c.status === 'ready_for_turnin';
                  return (
                    <div
                      key={c.id}
                      className="rpg-slot-inset p-4 transition bg-stone-950/70"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {getCategoryBadge(c.category)}
                            <span className="font-mono text-[10px] text-amber-300 uppercase tracking-wider">
                              {c.kicker}
                            </span>
                            {isReady && (
                              <span className="rounded-md bg-emerald-500/20 border border-emerald-500/50 px-2 py-0.5 text-[10px] font-bold text-emerald-300 animate-pulse">
                                Ready for Turn-In!
                              </span>
                            )}
                          </div>
                          <h3 className="font-serif text-sm font-bold text-amber-100 sm:text-base drop-shadow">
                            {c.title}
                          </h3>
                          <p className="text-xs text-amber-200/70 mt-1">
                            {c.summary}
                          </p>
                        </div>

                        {isReady && (
                          <button
                            type="button"
                            onClick={() => handleClaim(c.id)}
                            className="rpg-btn-beige text-xs py-2 px-4 font-serif font-bold text-amber-950 animate-bounce"
                          >
                            Turn In &amp; Claim 🎁
                          </button>
                        )}
                      </div>

                      {/* Interactive Progress Tracking */}
                      <div className="mt-3.5 space-y-2 border-t border-amber-900/40 pt-3">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-300">
                          Progress Tracker:
                        </span>
                        {c.objectives.map((obj) => (
                          <div key={obj.id} className="space-y-1">
                            <div className="flex justify-between text-xs font-serif">
                              <span className={obj.isFinished ? 'text-emerald-300 font-bold line-through' : 'text-amber-100'}>
                                {obj.label}
                              </span>
                              <span className="font-mono font-bold text-amber-300">
                                {obj.current} / {obj.target}
                              </span>
                            </div>
                            <div className="h-2 w-full rounded bg-black/80 overflow-hidden border border-amber-900/60 p-[1px]">
                              <div
                                className={`h-full rounded-sm transition-all duration-300 ${obj.isFinished ? 'bg-emerald-400' : 'bg-amber-400'}`}
                                style={{ width: `${Math.min(100, Math.round((obj.current / obj.target) * 100))}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* TAB 3: COMPLETED CONTRACT HISTORY */}
          {activeTab === 'completed' && (
            <>
              {boardState.completed.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-amber-200/60 font-serif">
                  <span className="text-3xl mb-2 drop-shadow">🏆</span>
                  <p className="text-xs">No completed contracts in guild records yet.</p>
                </div>
              ) : (
                boardState.completed.map((c) => (
                  <div
                    key={c.id}
                    className="rpg-slot-inset flex items-center justify-between p-3.5 text-xs bg-stone-950/60 opacity-80"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <h4 className="font-serif font-bold text-amber-100">
                          {c.title}
                        </h4>
                        {getCategoryBadge(c.category)}
                      </div>
                      <p className="text-[11px] text-amber-300/70 ml-5">
                        {c.summary}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[11px] text-amber-300">
                      <span>+{c.rewards.gold}g</span>
                      <span>+{c.rewards.renown} Renown</span>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-amber-900/50 pt-3 text-xs">
          <span className="text-amber-200/70 font-serif">
            Accept contracts, fulfill goals in the realm, and return here to claim your bounty.
          </span>
          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              onClose();
            }}
            className="rpg-btn-brown text-xs py-1.5 px-4"
          >
            Leave Guildhall
          </button>
        </div>
      </div>
    </div>
  );
}
