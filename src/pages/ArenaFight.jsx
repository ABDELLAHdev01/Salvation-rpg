import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import authService from '../services/AuthService';
import characterService from '../services/CharacterService';
import {
  clearStoredHazard,
  clearStoredResult,
  clearStoredWager,
  getOrCreateHazard,
  getOrCreateOpponent,
  getStoredWager,
  getPlayerStats,
  setStoredWager,
} from '../data/arenaOpponents';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

export default function ArenaFight() {
  const [opponent, setOpponent] = useState(null);
  const [hazard, setHazard] = useState(null);
  const [wager, setWager] = useState(0);
  const [availableGold, setAvailableGold] = useState(0);
  const [playerStats, setPlayerStats] = useState([]);

  useEffect(() => {
    const nextOpponent = getOrCreateOpponent();
    setOpponent(nextOpponent);
    clearStoredResult();
    clearStoredHazard();
    clearStoredWager();
    setWager(0);
    setHazard(getOrCreateHazard());
    setStoredWager(0);

    if (MOCK_AUTH) {
      const username = authService.getCurrentUsername();
      const profile = characterService.getMockProfile(username);
      setAvailableGold(profile?.stats?.gold ?? 0);
      setPlayerStats(getPlayerStats(profile));
    } else {
      setPlayerStats(getPlayerStats(null));
    }
  }, []);

  useEffect(() => {
    setWager(getStoredWager());
  }, []);

  const playerPower = useMemo(
    () => playerStats.reduce((total, stat) => total + stat.value, 0),
    [playerStats]
  );

  const opponentPower = useMemo(() => {
    if (!opponent) {
      return 0;
    }
    return opponent.stats.reduce((total, stat) => total + stat.value, 0);
  }, [opponent]);

  const projectedOdds = useMemo(() => {
    if (!opponentPower) {
      return 50;
    }
    const ratio = playerPower / (playerPower + opponentPower);
    return Math.round(ratio * 100);
  }, [playerPower, opponentPower]);

  const handleWagerChange = (value) => {
    const maxGold = availableGold || 0;
    const next = Math.max(0, Math.min(value, maxGold));
    setWager(next);
    setStoredWager(next);
  };

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm.jpg')] bg-gray-900 bg-blend-multiply dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 pt-24">
        <div className="rounded-2xl p-8 shadow-xl backdrop-blur court-reveal glass-panel">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">Arena Clash</p>
              <h1 className="mt-3 text-4xl font-extrabold text-white hero-title">Fight Arena</h1>
              <p className="mt-3 text-base text-gray-300">
                Face your rival, track the duel timer, and unleash your arena skills.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-300">
              <span className="court-chip rounded-full px-3 py-2">Live Match</span>
              <span className="court-chip rounded-full px-3 py-2">Hazard: {hazard?.name || 'Unknown'}</span>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="court-card rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Current Match</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Stormblade Trial</h2>
                </div>
                <span className="rounded-full border border-yellow-700/40 bg-gray-950/70 px-3 py-1 text-xs text-yellow-300">
                  Live
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="court-card rounded-xl p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Match Timer</p>
                  <p className="mt-2 text-2xl font-semibold text-white">04:28</p>
                </div>
                <div className="court-card rounded-xl p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Arena Sigils</p>
                  <p className="mt-2 text-xl font-semibold text-white">3 Available</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-yellow-700/30 bg-gray-950/60 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Matchmaking</p>
                    <p className="mt-2 text-lg font-semibold text-white">Opponent Locked</p>
                  </div>
                  <span className="rounded-full border border-yellow-700/40 bg-gray-900/70 px-3 py-1 text-xs text-yellow-200">
                    Same Level Tier
                  </span>
                </div>
                <p className="mt-4 text-sm text-gray-300">
                  Your opponent is hidden until you commit to the fight.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="image-panel image-panel-arena ornament-frame p-6">
                <div className="image-panel-content">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Arena Hazard</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{hazard?.name || 'Unknown'}</h3>
                <p className="mt-2 text-sm text-gray-300">{hazard?.effect || 'Hazard details unavailable.'}</p>
                </div>
              </div>
              <div className="court-card rounded-2xl p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Combat Preview</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Power Forecast</h3>
                <div className="mt-4 space-y-3 text-sm text-gray-300">
                  <div className="flex items-center justify-between">
                    <span>Your Power</span>
                    <span className="font-semibold text-white">{playerPower}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{opponent ? opponent.name : 'Opponent'} Power</span>
                    <span className="font-semibold text-white">{opponentPower || '???'}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-gray-800">
                    <div
                      className="h-full rounded-full bg-yellow-500 shimmer-bar"
                      style={{ width: `${projectedOdds}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">Projected win odds: {projectedOdds}%</p>
                </div>
              </div>
              <div className="court-card rounded-2xl p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Combat Stance</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Blazing Assault</h3>
                <p className="mt-2 text-sm text-gray-300">
                  Balanced aggression with a focus on burst strikes and arena mobility.
                </p>
              </div>
              <div className="court-card rounded-2xl p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Arena Wager</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Put Gold on the Line</h3>
                <p className="mt-2 text-sm text-gray-300">Available gold: {availableGold}g</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[50, 100, 200].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleWagerChange(amount)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        wager === amount
                          ? 'bg-yellow-400 text-gray-900'
                          : 'border border-yellow-700/40 text-yellow-200'
                      }`}
                    >
                      {amount}g
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max={availableGold}
                    value={wager}
                    onChange={(event) => handleWagerChange(Number(event.target.value || 0))}
                    className="w-28 rounded-lg border border-yellow-700/40 bg-gray-950/70 px-3 py-2 text-sm text-gray-200"
                  />
                  <span className="text-xs text-gray-400">
                    Wager pays {wager > 0 ? `${wager * 2}g` : '0g'} on victory.
                  </span>
                </div>
              </div>
              <div className="court-card rounded-2xl p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Crowd Favor</p>
                <div className="mt-3 h-2 rounded-full bg-gray-800">
                  <div className="h-full w-[68%] rounded-full bg-yellow-500 shimmer-bar" />
                </div>
                <p className="mt-2 text-xs text-gray-400">Favor at 68% — keep the momentum.</p>
              </div>
              <div className="court-card rounded-2xl p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Arena Moves</p>
                <ul className="mt-3 space-y-2 text-sm text-gray-300">
                  <li className="rounded-lg border border-yellow-700/20 bg-gray-950/60 px-3 py-2">Crimson Dash</li>
                  <li className="rounded-lg border border-yellow-700/20 bg-gray-950/60 px-3 py-2">Shieldbreaker Combo</li>
                  <li className="rounded-lg border border-yellow-700/20 bg-gray-950/60 px-3 py-2">Sunforge Ult</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/arena/fight/opponent"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white action-primary"
            >
              Fight Now
            </Link>
            <button className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-yellow-200 action-ghost">
              Spar Practice
            </button>
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
