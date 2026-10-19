import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../shared/layout/Sidebar';
import authService from '../../core/services/AuthService';
import characterService from '../../core/services/CharacterService';
import {
  getOrCreateHazard,
  getOrCreateOpponent,
  getPlayerStats,
  getRivalRecord,
  getRivalTaunt,
  getCombatStanceById,
  getStoredStance,
  getPlayerEquippedGear,
} from '../../core/data/arenaOpponents';
import { audioManager } from '../../core/audio/AudioManager';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

export default function ArenaOpponent() {
  const [playerAvatar, setPlayerAvatar] = useState('/raceicon/noimage.webp');
  const [opponent, setOpponent] = useState(() => getOrCreateOpponent());
  const [hazard, setHazard] = useState(() => getOrCreateHazard());
  const [taunt, setTaunt] = useState(null);
  const [rivalFights, setRivalFights] = useState(0);
  const [playerStats, setPlayerStats] = useState([]);
  const [equippedGear, setEquippedGear] = useState([]);
  const [activeStanceId] = useState(() => getStoredStance());

  const activeStance = useMemo(
    () => getCombatStanceById(activeStanceId),
    [activeStanceId]
  );

  useEffect(() => {
    if (!MOCK_AUTH) {
      setPlayerStats(getPlayerStats(null, activeStanceId));
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

    const profile = characterService.getMockProfile(username);
    setPlayerStats(getPlayerStats(profile, activeStanceId));
    setEquippedGear(getPlayerEquippedGear(profile));
  }, [activeStanceId]);

  return (
    <section className="min-h-screen bg-page-primary dashboard-shell lg:pl-64">
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
                Your opponent is locked in your tier. Inspect gear matchups and commit to the clash.
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
            {/* Player Card */}
            <div className="court-card rounded-2xl p-6 overflow-hidden">
              <div className="-mx-6 -mt-6 h-80 overflow-hidden border-b border-yellow-700/30 bg-gray-900/70">
                <img
                  src={playerAvatar}
                  alt="Your portrait"
                  className="h-full w-full object-contain"
                  onError={(event) => {
                    event.target.onerror = null;
                    event.target.src = '/raceicon/noimage.webp';
                  }}
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">You</p>
                <span className="rounded-full border border-yellow-700/40 bg-yellow-950/40 px-2.5 py-0.5 text-xs text-yellow-300 font-semibold">
                  {activeStance?.name || 'Blazing Assault'}
                </span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-white">Stormblade Vanguard</p>
              <p className="mt-1 text-sm text-gray-300">Level 22 · Rank IV · Stance: {activeStance?.category}</p>

              <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                <span>Active Battle Gear</span>
                <span className="text-emerald-400">Tactical Loadout</span>
              </div>
              <ul className="mt-2 space-y-2 text-sm text-gray-300">
                {equippedGear.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-yellow-700/20 bg-gray-950/60 px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-yellow-400">
                        {item.slot}
                      </span>
                      <span className="font-medium text-white">{item.name}</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-mono">
                      {item.attack ? `+${item.attack}A ` : ''}
                      {item.defense ? `+${item.defense}D ` : ''}
                      {item.wisdom ? `+${item.wisdom}W` : ''}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Calculated Stats</p>
                <div className="mt-3 space-y-3">
                  {playerStats.map((stat) => (
                    <div key={stat.label}>
                      <div className="flex items-center justify-between text-xs text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <span>{stat.label}</span>
                          {stat.gearBonus > 0 && (
                            <span className="text-emerald-400 text-[10px] font-mono">
                              (+{stat.gearBonus} gear)
                            </span>
                          )}
                        </div>
                        <span className="font-semibold text-white">{stat.value}</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-gray-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-yellow-500 shimmer-bar"
                          style={{ width: `${Math.min(100, stat.value)}%` }}
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

            {/* Opponent Card */}
            <div className="court-card rounded-2xl p-6 overflow-hidden">
              <div className="-mx-6 -mt-6 h-80 overflow-hidden border-b border-yellow-700/30 bg-gray-900/70">
                <img
                  src={opponent.image}
                  alt="Opponent portrait"
                  className="h-full w-full object-contain"
                  onError={(event) => {
                    event.target.onerror = null;
                    event.target.src = '/raceicon/noimage.webp';
                  }}
                />
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-gray-400">Opponent</p>
              <p className="mt-2 text-2xl font-semibold text-white">{opponent.name}</p>
              <p className="mt-1 text-sm text-gray-300">Level {opponent.level} · Rank {opponent.rank}</p>

              <div className="mt-4 text-xs text-gray-400">Observed Equipment</div>
              <ul className="mt-2 space-y-2 text-sm text-gray-300">
                {opponent.gear.map((item) => (
                  <li
                    key={item}
                    className="flex items-center justify-between rounded-lg border border-yellow-700/20 bg-gray-950/60 px-3 py-2 text-xs"
                  >
                    <span className="text-white font-medium">{item}</span>
                    <span className="text-[10px] text-gray-400 uppercase">Equipped</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Rival Stats</p>
                <div className="mt-3 space-y-3">
                  {(opponent.stats || []).map((stat) => (
                    <div key={stat.label}>
                      <div className="flex items-center justify-between text-xs text-gray-300">
                        <span>{stat.label}</span>
                        <span className="font-semibold text-white">{stat.value}</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-gray-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-yellow-500 shimmer-bar"
                          style={{ width: `${Math.min(100, stat.value)}%` }}
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
              onClick={() => audioManager.play('strike')}
              className="inline-flex items-center rounded-lg px-5 py-2.5 text-sm font-bold text-white action-primary shadow-lg"
            >
              Commit to Clash
            </Link>
            <Link
              to="/arena"
              onClick={() => audioManager.play('tap')}
              className="inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-semibold text-yellow-200 action-ghost"
            >
              Run Away
            </Link>
            <Link
              to="/arena/fight"
              onClick={() => audioManager.play('tap')}
              className="inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-semibold text-yellow-200 action-ghost"
            >
              Adjust Stance
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
