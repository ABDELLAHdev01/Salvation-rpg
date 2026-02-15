import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../shared/layout/Sidebar';
import { clearArenaHistory, getArenaHistory } from '../../core/data/arenaOpponents';

export default function Arena() {
  const [history, setHistory] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('All');
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    setHistory(getArenaHistory());
  }, []);

  const handleClearHistory = () => {
    clearArenaHistory();
    setHistory([]);
  };

  const filteredHistory = useMemo(() => {
    const now = Date.now();
    const rangeMs =
      timeRange === '24h' ? 24 * 60 * 60 * 1000 : timeRange === '7d' ? 7 * 24 * 60 * 60 * 1000 : null;

    const timeFiltered = history.filter((entry) => {
      if (!entry.createdAt) {
        return false;
      }
      const createdAtMs = Date.parse(entry.createdAt);
      if (Number.isNaN(createdAtMs)) {
        return false;
      }
      return rangeMs === null ? true : now - createdAtMs <= rangeMs;
    });

    if (historyFilter === 'All') {
      return timeFiltered;
    }
    return timeFiltered.filter((entry) => entry.outcome === historyFilter);
  }, [history, historyFilter, timeRange]);

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm.webp')] bg-gray-900 bg-blend-multiply dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 pt-24">
        <div className="rounded-2xl p-8 shadow-xl backdrop-blur court-reveal glass-panel">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">Colosseum</p>
              <h1 className="mt-3 text-4xl font-extrabold text-white hero-title">Arena</h1>
              <p className="mt-3 max-w-2xl text-base text-gray-300">
                Challenge rivals, earn ranks, and claim your sigil in the weekly trials.
              </p>
            </div>
            <Link
              to="/arena/fight"
              className="inline-flex items-center rounded-full px-5 py-3 text-xs font-semibold text-white action-primary"
            >
              Enter Arena
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="court-card rounded-xl p-4 text-left hover-lift">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Rank</p>
              <p className="mt-2 text-2xl font-semibold text-white">IV - Stormblade</p>
            </div>
            <div className="court-card rounded-xl p-4 text-left hover-lift">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Next Match</p>
              <p className="mt-2 text-2xl font-semibold text-white">Tonight · 20:00</p>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-yellow-700/30 bg-gray-900/80 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Season 7</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Emberfall Circuit</h2>
            <p className="mt-2 text-sm text-gray-300">Climb the ladder to earn banners and profile frames.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="court-card rounded-xl p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Unlocked Banner</p>
                <p className="mt-2 text-lg font-semibold text-white">Stormblade Crest</p>
                <p className="mt-1 text-xs text-gray-400">Show it on your profile header.</p>
              </div>
              <div className="image-panel image-panel-arena ornament-frame p-4">
                <div className="image-panel-content">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-300">Arena Frame</p>
                  <p className="mt-2 text-lg font-semibold text-white">Embercrest Frame</p>
                  <p className="mt-1 text-xs text-gray-300">Unlock at Rank III or higher.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-yellow-700/30 bg-gray-900/80 p-6 text-left">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Match History</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Recent Duels</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={timeRange}
                  onChange={(event) => setTimeRange(event.target.value)}
                  className="rounded-full border border-yellow-700/40 bg-gray-950/70 px-3 py-2 text-xs text-gray-200"
                >
                  <option value="all" className="text-gray-900">
                    All Time
                  </option>
                  <option value="24h" className="text-gray-900">
                    Last 24h
                  </option>
                  <option value="7d" className="text-gray-900">
                    Last 7d
                  </option>
                </select>
                <select
                  value={historyFilter}
                  onChange={(event) => setHistoryFilter(event.target.value)}
                  className="rounded-full border border-yellow-700/40 bg-gray-950/70 px-3 py-2 text-xs text-gray-200"
                >
                  <option value="All" className="text-gray-900">
                    All Results
                  </option>
                  <option value="Victory" className="text-gray-900">
                    Victories
                  </option>
                  <option value="Defeat" className="text-gray-900">
                    Defeats
                  </option>
                </select>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  disabled={history.length === 0}
                  className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] ${history.length === 0
                    ? 'bg-gray-700 text-gray-400'
                    : 'border border-yellow-700/40 text-yellow-200'
                    }`}
                >
                  Clear History
                </button>
              </div>
            </div>
            {filteredHistory.length === 0 ? (
              <p className="mt-3 text-sm text-gray-300">
                {historyFilter === 'Victory'
                  ? 'No victories logged yet.'
                  : historyFilter === 'Defeat'
                    ? 'No defeats logged yet.'
                    : 'No arena matches logged yet.'}
              </p>
            ) : (
              <ul className="mt-4 space-y-2 text-sm text-gray-300">
                {filteredHistory.slice(0, 4).map((entry) => (
                  <li
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-yellow-700/20 bg-gray-950/60 px-3 py-2"
                  >
                    <span className="font-semibold text-white">{entry.outcome}</span>
                    <span className="text-xs text-gray-400">
                      vs {entry.opponentName} · Lv {entry.opponentLevel} · Rank {entry.opponentRank}
                    </span>
                    <span className="text-xs text-yellow-300">Rank {entry.rankChange}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/arena/fight"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white action-primary"
            >
              Enter Arena
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
