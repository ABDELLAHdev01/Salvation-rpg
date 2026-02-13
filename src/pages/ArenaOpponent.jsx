import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import authService from '../services/AuthService';
import characterService from '../services/CharacterService';
import {
  getOrCreateHazard,
  getOrCreateOpponent,
  getPlayerStats,
  getRivalRecord,
  getRivalTaunt,
} from '../data/arenaOpponents';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

export default function ArenaOpponent() {
  const [playerAvatar, setPlayerAvatar] = useState('/raceicon/noimage.jpg');
  const [opponent, setOpponent] = useState(() => getOrCreateOpponent());
  const [hazard, setHazard] = useState(() => getOrCreateHazard());
  const [taunt, setTaunt] = useState(null);
  const [rivalFights, setRivalFights] = useState(0);
  const [playerStats, setPlayerStats] = useState([]);

  useEffect(() => {
    if (!MOCK_AUTH) {
      setPlayerStats(getPlayerStats(null));
      return;
    }

    const username = authService.getCurrentUsername();
    const character = characterService.getMockCharacter(username);
    if (character?.avatarUrl) {
      setPlayerAvatar(character.avatarUrl);
    }

    const nextOpponent = getOrCreateOpponent();
    setOpponent(nextOpponent);
    setHazard(getOrCreateHazard());
    setTaunt(getRivalTaunt(nextOpponent.name));
    setRivalFights(getRivalRecord(nextOpponent.name).fights);
    setPlayerStats(getPlayerStats(characterService.getMockProfile(username)));
  }, []);

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
              <h1 className="mt-3 text-4xl font-extrabold text-white hero-title">Opponent Revealed</h1>
              <p className="mt-3 text-base text-gray-300">
                Your opponent is in your level tier. Decide to fight or retreat.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-300">
              <span className="court-chip rounded-full px-3 py-2">Hazard: {hazard?.name || 'Unknown'}</span>
              <span className="court-chip rounded-full px-3 py-2">Rival Duels: {rivalFights}</span>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="image-panel image-panel-arena ornament-frame p-4 text-left">
              <div className="image-panel-content">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Arena Hazard</p>
              <p className="mt-2 text-lg font-semibold text-white">{hazard?.name || 'Unknown'}</p>
              <p className="mt-1 text-sm text-gray-300">{hazard?.effect || 'Hazard effect unknown.'}</p>
              </div>
            </div>
            <div className="court-card rounded-xl p-4 text-left">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Rival Tracker</p>
              <p className="mt-2 text-lg font-semibold text-white">{rivalFights} prior duels</p>
              <p className="mt-1 text-sm text-gray-300">{taunt || 'No taunt yet. Earn a rematch.'}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_auto_1fr]">
            <div className="court-card rounded-2xl p-6 overflow-hidden">
              <div className="-mx-6 -mt-6 h-80 overflow-hidden border-b border-yellow-700/30 bg-gray-900/70">
                <img
                  src={playerAvatar}
                  alt="Your portrait"
                  className="h-full w-full object-contain"
                  onError={(event) => {
                    event.target.onerror = null;
                    event.target.src = '/raceicon/noimage.jpg';
                  }}
                />
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-gray-400">You</p>
              <p className="mt-2 text-2xl font-semibold text-white">Stormblade Vanguard</p>
              <p className="mt-1 text-sm text-gray-300">Level 22 · Rank IV</p>
              <div className="mt-4 text-xs text-gray-400">Gear</div>
              <ul className="mt-2 space-y-2 text-sm text-gray-300">
                <li className="rounded-lg border border-yellow-700/20 bg-gray-950/60 px-3 py-2">Embersteel Blade</li>
                <li className="rounded-lg border border-yellow-700/20 bg-gray-950/60 px-3 py-2">Aegis of Dawn</li>
                <li className="rounded-lg border border-yellow-700/20 bg-gray-950/60 px-3 py-2">Ironfall Greaves</li>
              </ul>
              <div className="mt-5">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Stats</p>
                <div className="mt-3 space-y-3">
                  {playerStats.map((stat) => (
                    <div key={stat.label}>
                      <div className="flex items-center justify-between text-xs text-gray-300">
                        <span>{stat.label}</span>
                        <span>{stat.value}</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-gray-800">
                        <div
                          className="h-full rounded-full bg-yellow-500 shimmer-bar"
                          style={{ width: `${stat.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center text-3xl font-extrabold text-yellow-400">
              VS
            </div>

            <div className="court-card rounded-2xl p-6 overflow-hidden">
              <div className="-mx-6 -mt-6 h-80 overflow-hidden border-b border-yellow-700/30 bg-gray-900/70">
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
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-gray-400">Opponent</p>
              <p className="mt-2 text-2xl font-semibold text-white">{opponent.name}</p>
              <p className="mt-1 text-sm text-gray-300">Level {opponent.level} · Rank {opponent.rank}</p>
              <div className="mt-4 text-xs text-gray-400">Gear</div>
              <ul className="mt-2 space-y-2 text-sm text-gray-300">
                {opponent.gear.map((item) => (
                  <li
                    key={item}
                    className="rounded-lg border border-yellow-700/20 bg-gray-950/60 px-3 py-2"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Stats</p>
                <div className="mt-3 space-y-3">
                  {(opponent.stats || []).map((stat) => (
                    <div key={stat.label}>
                      <div className="flex items-center justify-between text-xs text-gray-300">
                        <span>{stat.label}</span>
                        <span>{stat.value}</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-gray-800">
                        <div
                          className="h-full rounded-full bg-yellow-500 shimmer-bar"
                          style={{ width: `${stat.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/arena/fight/result"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white action-primary"
            >
              Fight
            </Link>
            <Link
              to="/arena"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-yellow-200 action-ghost"
            >
              Run Away
            </Link>
            <Link
              to="/arena/fight"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-yellow-200 action-ghost"
            >
              Back to Lobby
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
