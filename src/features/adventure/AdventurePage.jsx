import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../../shared/layout/Sidebar';
import authService from '../../core/services/AuthService';
import characterService from '../../core/services/CharacterService';
import { expeditionLocations, getExpeditionLocation, rollExpeditionRewards } from '../../core/data/expeditionData';
import { formatDuration } from '../../core/data/miningData';
import { getPlayerXpForLevel } from '../../core/data/playerData';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

const getExpeditionKey = (username) => `expeditionSession:${username}`;

export default function Adventure() {
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [now, setNow] = useState(Date.now());
  const navigate = useNavigate();

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
  const playerLevel = profile?.stats?.level ?? 1;
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

  const handleSendExpedition = (locationId) => {
    if (!MOCK_AUTH || !profile) {
      return;
    }

    if (session) {
      toast.error('You already have an expedition in progress.');
      return;
    }

    const location = getExpeditionLocation(locationId);
    if (!location) {
      return;
    }

    if (playerLevel < (location.levelRequired || 1)) {
      toast.error(`Level ${location.levelRequired || 1} required for this expedition.`);
      return;
    }

    const startTime = Date.now();
    const adjustedDuration = Math.max(5 * 60 * 1000, Math.round(location.durationMs));
    const nextSession = {
      locationId,
      startTime,
      endTime: startTime + adjustedDuration,
    };

    const username = authService.getCurrentUsername();
    localStorage.setItem(getExpeditionKey(username), JSON.stringify(nextSession));
    setSession(nextSession);
    toast.success(`${location.name} expedition dispatched.`);
    navigate('/expedition-active');
  };

  const handleClaim = () => {
    if (!MOCK_AUTH || !profile || !session || !activeLocation) {
      return;
    }

    if (!isComplete) {
      toast.error('The expedition has not finished yet.');
      return;
    }

    const reward = rollExpeditionRewards(activeLocation);
    const adjustedGold = Math.max(0, Math.round(reward.gold));
    const adjustedXp = Math.max(0, Math.round(reward.xp));
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
    toast.success(`Expedition claimed +${adjustedGold}g +${adjustedXp} XP.`);
  };

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm.webp')] bg-gray-900 bg-blend-multiply dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 pt-24">
        <div className="rounded-2xl p-8 shadow-xl backdrop-blur reveal glass-panel">
          <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">Expeditions</p>
          <h1 className="mt-3 text-4xl font-extrabold text-white sm:text-5xl hero-title">
            Dispatch Idle Journeys
          </h1>
          <p className="mt-4 text-base text-gray-300">
            Send one expedition at a time. Rewards are rolled when you claim.
          </p>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-yellow-700/30 bg-gradient-to-br from-yellow-500/10 via-gray-950/80 to-gray-950/40 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Current Expedition</p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {activeLocation ? activeLocation.name : 'None in progress'}
                  </p>
                  <p className="mt-1 text-sm text-gray-300">
                    {activeLocation
                      ? activeLocation.summary
                      : 'Choose a location below to begin a new expedition.'}
                  </p>
                </div>
                {session && (
                  <div className="text-right text-sm text-gray-300">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Status</p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {isComplete ? 'Ready to claim' : 'In progress'}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {isComplete ? 'Claim rewards below.' : `Time left: ${formatDuration(remainingMs)}`}
                    </p>
                    <Link
                      to="/expedition-active"
                      className="mt-2 inline-flex items-center text-xs font-semibold text-yellow-200"
                    >
                      View expedition
                    </Link>
                  </div>
                )}
              </div>

              {session && (
                <div className="mt-5">
                  <div className="h-2 rounded-full bg-gray-800">
                    <div
                      className="h-full rounded-full bg-yellow-500 shimmer-bar"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs text-gray-400">
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
                      className={`rounded-lg px-4 py-2 text-xs font-semibold ${isComplete ? 'action-primary text-white' : 'bg-gray-700 text-gray-300'
                        }`}
                      disabled={!isComplete}
                    >
                      Claim Rewards
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-yellow-700/30 bg-gray-950/70 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Operations Ledger</p>
              <div className="mt-4 space-y-3 text-sm text-gray-300">
                <div className="flex items-center justify-between rounded-xl border border-yellow-700/20 bg-gray-900/60 px-3 py-2">
                  <span>Commander Level</span>
                  <span className="text-yellow-200">{playerLevel}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-yellow-700/20 bg-gray-900/60 px-3 py-2">
                  <span>Active Expeditions</span>
                  <span className="text-yellow-200">{session ? '1 / 1' : '0 / 1'}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-yellow-700/20 bg-gray-900/60 px-3 py-2">
                  <span>Threat Profile</span>
                  <span className="text-yellow-200">{activeLocation?.threat || '—'}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-yellow-700/20 bg-gray-900/60 px-3 py-2">
                  <span>Focus</span>
                  <span className="text-yellow-200">{activeLocation?.focus || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4">
            {expeditionLocations.map((location) => (
              <div
                key={location.id}
                className="rounded-2xl border border-yellow-700/30 bg-gray-950/70 p-5 transition hover:border-yellow-500/60 hover:bg-gray-950/80"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-white">{location.name}</p>
                      <span className="rounded-full border border-yellow-700/40 bg-yellow-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] text-yellow-200">
                        {getTierLabel(location.levelRequired || 1)}
                      </span>
                      <span className="rounded-full border border-yellow-700/40 bg-gray-900/70 px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] text-gray-300">
                        Req L{location.levelRequired || 1}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-300">{location.summary}</p>
                    <p className="mt-2 text-xs text-gray-400">{location.scoutNote}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      <span>{location.region}</span>
                      <span>·</span>
                      <span>{location.biome}</span>
                      <span>·</span>
                      <span>Threat: {location.threat}</span>
                      <span>·</span>
                      <span>Focus: {location.focus}</span>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-gray-300 sm:grid-cols-2">
                      <div className="rounded-lg border border-yellow-700/20 bg-gray-900/60 px-3 py-2">
                        Duration: {formatDuration(location.durationMs)}
                      </div>
                      <div className="rounded-lg border border-yellow-700/20 bg-gray-900/60 px-3 py-2">
                        Rewards: {location.minGold}-{location.maxGold}g · {location.minXp}-{location.maxXp} XP
                      </div>
                    </div>
                  </div>
                  {(() => {
                    const meetsLevel = playerLevel >= (location.levelRequired || 1);
                    const canSend = !session && meetsLevel;
                    return (
                      <button
                        type="button"
                        onClick={() => handleSendExpedition(location.id)}
                        className={`rounded-lg px-4 py-2 text-xs font-semibold ${canSend ? 'action-primary text-white' : 'bg-gray-700 text-gray-300'
                          }`}
                        disabled={!canSend}
                        title={!meetsLevel ? `Requires level ${location.levelRequired || 1}` : undefined}
                      >
                        Send Expedition
                      </button>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/dashboard"
            className="mt-8 inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-yellow-200 action-ghost"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
