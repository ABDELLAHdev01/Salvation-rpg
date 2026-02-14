import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../shared/layout/Sidebar';
import authService from '../services/AuthService';
import characterService from '../services/CharacterService';
import {
  addArenaHistory,
  clearStoredOpponent,
  clearStoredResult,
  clearStoredWager,
  getOrCreateOpponent,
  getOrCreateResult,
  getPlayerStats,
  getStoredHazard,
  getStoredWager,
  incrementRivalRecord,
} from '../data/arenaOpponents';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

export default function ArenaResult() {
  const [opponent, setOpponent] = useState(() => getOrCreateOpponent());
  const [result, setResult] = useState(() => getOrCreateResult(opponent));
  const [wager] = useState(() => getStoredWager());
  const [hazard] = useState(() => getStoredHazard());
  const [playerStats, setPlayerStats] = useState(() => getPlayerStats(null));
  const hasLogged = useRef(false);
  const hasAppliedWager = useRef(false);

  useEffect(() => {
    const nextOpponent = getOrCreateOpponent();
    setOpponent(nextOpponent);
    setResult(getOrCreateResult(nextOpponent));
    if (MOCK_AUTH) {
      const username = authService.getCurrentUsername();
      const profile = characterService.getMockProfile(username);
      setPlayerStats(getPlayerStats(profile));
    }
  }, []);

  useEffect(() => {
    if (!opponent || !result || hasLogged.current) {
      return;
    }

    addArenaHistory({
      id: Date.now(),
      outcome: result.outcome,
      opponentName: opponent.name,
      opponentRank: opponent.rank,
      opponentLevel: opponent.level,
      rankChange: result.rankChange,
      hazard: hazard?.name || null,
      wager,
      rewards: result.rewards,
      createdAt: new Date().toISOString(),
    });

    incrementRivalRecord(opponent.name);

    hasLogged.current = true;
  }, [hazard, opponent, result, wager]);

  useEffect(() => {
    if (!MOCK_AUTH || hasAppliedWager.current || wager <= 0) {
      return;
    }

    const username = authService.getCurrentUsername();
    const profile = characterService.getMockProfile(username);
    if (!profile?.stats) {
      return;
    }
    const currentGold = profile?.stats?.gold ?? 0;
    const delta = result.outcome === 'Victory' ? wager : -wager;
    const nextGold = Math.max(0, currentGold + delta);
    characterService.updateMockProfile({
      stats: {
        ...profile.stats,
        gold: nextGold,
      },
    });
    clearStoredWager();
    hasAppliedWager.current = true;
  }, [result, wager]);

  const handleRematch = () => {
    clearStoredOpponent();
    clearStoredResult();
  };

  const rewardLines = useMemo(() => {
    const base = [...result.rewards];
    if (wager > 0) {
      const wagerLine = result.outcome === 'Victory' ? `Wager payout +${wager * 2} gold` : `Wager lost -${wager} gold`;
      base.push(wagerLine);
    }
    if (hazard?.name) {
      base.push(`Arena hazard: ${hazard.name}`);
    }
    return base;
  }, [hazard, result.rewards, result.outcome, wager]);

  const highlightReel = useMemo(() => {
    if (!opponent || !result) {
      return null;
    }

    if (result.highlightReel) {
      return result.highlightReel;
    }

    const playerTotal = playerStats.reduce((sum, stat) => sum + stat.value, 0);
    const opponentTotal = opponent.stats.reduce((sum, stat) => sum + stat.value, 0);

    const getTopStat = (stats) => {
      return stats.reduce((best, stat) => (stat.value > best.value ? stat : best), stats[0]);
    };

    const playerTop = getTopStat(playerStats);
    const opponentTop = getTopStat(opponent.stats);
    const mvpName = result.outcome === 'Victory' ? 'You' : opponent.name;
    const mvpStat = result.outcome === 'Victory' ? playerTop : opponentTop;

    return {
      mvpName,
      mvpStat,
      totalScore: result.outcome === 'Victory' ? playerTotal : opponentTotal,
      moments: [
        {
          label: 'Opening Exchange',
          detail: `Attack ${playerStats[0].value} vs Defense ${opponent.stats[1].value}`,
        },
        {
          label: 'Signature Push',
          detail: `${mvpName} led with ${mvpStat.label} ${mvpStat.value}`,
        },
        {
          label: 'Final Swing',
          detail: `Rank impact ${result.rankChange}`,
        },
      ],
    };
  }, [opponent, result, playerStats]);

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
              <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">Arena Verdict</p>
              <h1 className="mt-3 text-4xl font-extrabold text-white hero-title">{result.outcome}</h1>
              <p className="mt-3 text-base text-gray-300">
                The duel against {result.opponentName} has concluded. Review your rewards and rank shift.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-300">
              <span className="court-chip rounded-full px-3 py-2">Wager: {wager || 0}g</span>
              <span className="court-chip rounded-full px-3 py-2">Hazard: {hazard?.name || 'Unknown'}</span>
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="image-panel image-panel-arena ornament-frame p-6">
              <div className="image-panel-content">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Opponent</p>
                <p className="mt-2 text-2xl font-semibold text-white">{opponent.name}</p>
                <p className="mt-1 text-sm text-gray-300">Level {opponent.level} · Rank {opponent.rank}</p>
                <div className="mt-4 h-40 overflow-hidden rounded-xl border border-yellow-700/30 bg-gray-900/70">
                  <img
                    src={opponent.image}
                    alt="Opponent portrait"
                    className="h-full w-full object-contain"
                    onError={(event) => {
                      event.target.onerror = null;
                      event.target.src = '/raceicon/noimage.jpg';
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="court-card rounded-2xl p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Rewards</p>
              <ul className="mt-3 space-y-2 text-sm text-gray-300">
                {rewardLines.map((reward) => (
                  <li key={reward} className="rounded-lg border border-yellow-700/20 bg-gray-950/60 px-3 py-2">
                    {reward}
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl border border-yellow-700/30 bg-gray-950/70 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Rank Change</p>
                <p className="mt-2 text-2xl font-semibold text-yellow-300">{result.rankChange}</p>
              </div>
            </div>
          </div>

          {highlightReel && (
            <div className="mt-6 rounded-2xl border border-yellow-700/30 bg-gray-900/80 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Highlight Reel</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">MVP Recap</h2>
                </div>
                <div className="rounded-full border border-yellow-700/40 bg-gray-950/70 px-3 py-1 text-xs text-yellow-200">
                  MVP: {highlightReel.mvpName}
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-yellow-700/20 bg-gray-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">MVP Stat</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {highlightReel.mvpStat.label} {highlightReel.mvpStat.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">Total score {highlightReel.totalScore}</p>
                </div>
                <div className="rounded-xl border border-yellow-700/20 bg-gray-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Key Moments</p>
                  <ul className="mt-2 space-y-2 text-sm text-gray-300">
                    {highlightReel.moments.map((moment) => (
                      <li key={moment.label} className="flex items-center justify-between gap-2">
                        <span className="text-gray-200">{moment.label}</span>
                        <span className="text-xs text-gray-400">{moment.detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/arena/fight"
              onClick={handleRematch}
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white action-primary"
            >
              Queue Another Fight
            </Link>
            <Link
              to="/arena"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-yellow-200 action-ghost"
            >
              Back to Arena
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
