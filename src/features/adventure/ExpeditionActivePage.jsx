import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../../shared/layout/Sidebar';
import { useRewardFloat } from '../../shared/feedback/RewardFloatProvider';
import authService from '../../core/services/AuthService';
import characterService from '../../core/services/CharacterService';
import { getExpeditionLocation, rollExpeditionRewards } from '../../core/data/expeditionData';
import { formatDuration } from '../../core/data/miningData';
import { getPlayerXpForLevel } from '../../core/data/playerData';
import { getZoneModifiersForId } from '../../core/data/zonesData';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

const getExpeditionKey = (username) => `expeditionSession:${username}`;

export default function ExpeditionActive() {
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [now, setNow] = useState(Date.now());
  const claimButtonRef = useRef(null);
  const pushReward = useRewardFloat();

  useEffect(() => {
    if (!MOCK_AUTH) {
      return undefined;
    }

    const username = authService.getCurrentUsername();
    const nextProfile = characterService.getMockProfile(username);
    setProfile(nextProfile);

    const stored = localStorage.getItem(getExpeditionKey(username));
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.locationId && parsed?.startTime && parsed?.endTime) {
          setSession(parsed);
        } else {
          localStorage.removeItem(getExpeditionKey(username));
        }
      } catch {
        localStorage.removeItem(getExpeditionKey(username));
      }
    }

    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeLocation = session ? getExpeditionLocation(session.locationId) : null;
  const remainingMs = session ? Math.max(0, session.endTime - now) : 0;
  const isComplete = !!session && remainingMs === 0;
  const startLabel = session?.startTime ? new Date(session.startTime).toLocaleTimeString() : '—';
  const endLabel = session?.endTime ? new Date(session.endTime).toLocaleTimeString() : '—';
  const progress = useMemo(() => {
    if (!session) {
      return 0;
    }
    const total = Math.max(1, session.endTime - session.startTime);
    const elapsed = Math.min(total, now - session.startTime);
    return Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
  }, [session, now]);

  const applyPlayerXp = (startLevel, startXp, gain) => {
    let nextLevel = startLevel;
    let nextXp = startXp + gain;
    let target = getPlayerXpForLevel(nextLevel);

    while (nextXp >= target) {
      nextXp -= target;
      nextLevel += 1;
      target = getPlayerXpForLevel(nextLevel);
    }

    return { nextLevel, nextXp };
  };

  const getTierLabel = (levelRequired) => {
    if (levelRequired >= 20) return 'Mythic';
    if (levelRequired >= 10) return 'Storm';
    if (levelRequired >= 5) return 'Vanguard';
    return 'Scout';
  };

  const handleClaim = () => {
    if (!MOCK_AUTH || !profile || !session || !activeLocation) {
      return;
    }

    if (!isComplete) {
      toast.error('The expedition has not finished yet.');
      return;
    }

    const zoneModifiers = getZoneModifiersForId(session.zoneId || profile.activeZoneId);
    const reward = rollExpeditionRewards(activeLocation);
    const adjustedGold = Math.max(0, Math.round(reward.gold * (zoneModifiers.expeditionGoldMultiplier || 1)));
    const adjustedXp = Math.max(0, Math.round(reward.xp * (zoneModifiers.expeditionXpMultiplier || 1)));
    const currentLevel = profile.stats?.level ?? 1;
    const currentXp = profile.stats?.xp ?? 0;
    const currentGold = profile.stats?.gold ?? 0;
    const currentExpeditions = profile.stats?.expeditionsCompleted ?? 0;
    const { nextLevel, nextXp } = applyPlayerXp(currentLevel, currentXp, adjustedXp);

    const updated = characterService.updateMockProfile({
      stats: {
        ...profile.stats,
        level: nextLevel,
        xp: nextXp,
        gold: currentGold + adjustedGold,
        expeditionsCompleted: currentExpeditions + 1,
      },
    });

    setProfile(updated);
    const username = authService.getCurrentUsername();
    localStorage.removeItem(getExpeditionKey(username));
    setSession(null);
    const anchor = claimButtonRef.current;
    if (anchor) {
      pushReward(`+${adjustedGold}g`, { tone: 'gold', anchor });
      pushReward(`+${adjustedXp} XP`, { tone: 'xp', anchor, delay: 120 });
    }
    toast.success(`Expedition claimed +${adjustedGold}g +${adjustedXp} XP.`);
  };

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm.jpg')] bg-gray-900 bg-blend-multiply dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-16 pt-24">
        <div className="rounded-2xl p-8 shadow-xl backdrop-blur reveal glass-panel">
          <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">Expedition</p>
          <h1 className="mt-3 text-4xl font-extrabold text-white hero-title">Active Journey</h1>
          <p className="mt-4 text-base text-gray-300">
            Track your current expedition. Rewards are rolled when claimed.
          </p>

          {!session && (
            <div className="mt-8 rounded-2xl border border-yellow-700/30 bg-gray-950/70 p-6 text-sm text-gray-300">
              No expedition in progress. Choose a location to begin.
            </div>
          )}

          {session && (
            <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-yellow-700/30 bg-gradient-to-br from-yellow-500/10 via-gray-950/80 to-gray-950/40 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Expedition Dossier</p>
                    <p className="mt-2 text-xl font-semibold text-white">
                      {activeLocation ? activeLocation.name : 'Unknown location'}
                    </p>
                    <p className="mt-1 text-sm text-gray-300">
                      {activeLocation?.summary || 'Awaiting location details.'}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-300">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Status</p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {isComplete ? 'Ready to claim' : 'In progress'}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {isComplete ? 'Claim rewards below.' : `Time left: ${formatDuration(remainingMs)}`}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="h-2 rounded-full bg-gray-800">
                    <div
                      className="h-full rounded-full bg-yellow-500 shimmer-bar"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-4 grid gap-3 text-xs text-gray-400 sm:grid-cols-3">
                    <div>
                      <p className="uppercase tracking-[0.3em]">Started</p>
                      <p className="mt-1 text-sm text-gray-200">{startLabel}</p>
                    </div>
                    <div>
                      <p className="uppercase tracking-[0.3em]">Return</p>
                      <p className="mt-1 text-sm text-gray-200">{endLabel}</p>
                    </div>
                    <div>
                      <p className="uppercase tracking-[0.3em]">Progress</p>
                      <p className="mt-1 text-sm text-gray-200">{progress}%</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-gray-400">
                      {activeLocation?.region || 'Unknown region'} · {activeLocation?.biome || 'Unknown biome'}
                    </p>
                    <button
                      type="button"
                      onClick={handleClaim}
                      ref={claimButtonRef}
                      className={`rounded-lg px-4 py-2 text-xs font-semibold ${isComplete ? 'action-primary text-white' : 'bg-gray-700 text-gray-300'
                        }`}
                      disabled={!isComplete}
                    >
                      Claim Rewards
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-yellow-700/30 bg-gray-950/70 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Mission Details</p>
                <div className="mt-4 space-y-3 text-sm text-gray-300">
                  <div className="flex items-center justify-between rounded-xl border border-yellow-700/20 bg-gray-900/60 px-3 py-2">
                    <span>Tier</span>
                    <span className="text-yellow-200">
                      {getTierLabel(activeLocation?.levelRequired || 1)} (L{activeLocation?.levelRequired || 1})
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-yellow-700/20 bg-gray-900/60 px-3 py-2">
                    <span>Threat</span>
                    <span className="text-yellow-200">{activeLocation?.threat || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-yellow-700/20 bg-gray-900/60 px-3 py-2">
                    <span>Focus</span>
                    <span className="text-yellow-200">{activeLocation?.focus || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-yellow-700/20 bg-gray-900/60 px-3 py-2">
                    <span>Duration</span>
                    <span className="text-yellow-200">{activeLocation ? formatDuration(activeLocation.durationMs) : '—'}</span>
                  </div>
                  <div className="rounded-xl border border-yellow-700/20 bg-gray-900/60 px-3 py-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Reward Range</p>
                    <p className="mt-1 text-sm text-gray-200">
                      {activeLocation ? `${activeLocation.minGold}-${activeLocation.maxGold}g · ${activeLocation.minXp}-${activeLocation.maxXp} XP` : '—'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-yellow-700/20 bg-gray-900/60 px-3 py-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Scout Note</p>
                    <p className="mt-1 text-sm text-gray-200">{activeLocation?.scoutNote || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/adventure"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-yellow-200 action-ghost"
            >
              Back to Expeditions
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-yellow-200 action-ghost"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
