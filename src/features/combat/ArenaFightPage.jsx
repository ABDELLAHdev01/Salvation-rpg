import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../shared/layout/Sidebar';
import authService from '../../core/services/AuthService';
import characterService from '../../core/services/CharacterService';
import {
  clearStoredHazard,
  clearStoredResult,
  clearStoredWager,
  getOrCreateHazard,
  getOrCreateOpponent,
  getStoredWager,
  getPlayerStats,
  setStoredWager,
  combatStances,
  getCombatStanceById,
  getStoredStance,
  setStoredStance,
  getPlayerEquippedGear,
} from '../../core/data/arenaOpponents';
import { audioManager } from '../../core/audio/AudioManager';
import SparringModal from './widgets/SparringModal';
import WorldHUD from '../../core/world/WorldHUD';
import ArenaWorldView from './ArenaWorldView';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

export default function ArenaFight() {
  const [opponent, setOpponent] = useState(null);
  const [hazard, setHazard] = useState(null);
  const [wager, setWager] = useState(0);
  const [availableGold, setAvailableGold] = useState(0);
  const [playerStats, setPlayerStats] = useState([]);
  const [activeStance, setActiveStance] = useState(() => getStoredStance());
  const [equippedGear, setEquippedGear] = useState([]);
  const [showSparModal, setShowSparModal] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(268);
  const [viewMode, setViewMode] = useState('world');

  useEffect(() => {
    const nextOpponent = getOrCreateOpponent();
    setOpponent(nextOpponent);
    clearStoredResult();
    clearStoredHazard();
    clearStoredWager();
    setWager(0);
    setHazard(getOrCreateHazard());
    setStoredWager(0);

    const initialStance = getStoredStance();
    setActiveStance(initialStance);

    if (MOCK_AUTH) {
      const username = authService.getCurrentUsername();
      const profile = characterService.getMockProfile(username);
      setAvailableGold(profile?.stats?.gold ?? 0);
      setPlayerStats(getPlayerStats(profile, initialStance));
      setEquippedGear(getPlayerEquippedGear(profile));
    } else {
      setPlayerStats(getPlayerStats(null, initialStance));
    }
  }, []);

  useEffect(() => {
    setWager(getStoredWager());
  }, []);

  // Live match countdown timer simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStanceChange = (stanceId) => {
    setActiveStance(stanceId);
    setStoredStance(stanceId);
    audioManager.play('tap');

    if (MOCK_AUTH) {
      const username = authService.getCurrentUsername();
      const profile = characterService.getMockProfile(username);
      setPlayerStats(getPlayerStats(profile, stanceId));
    } else {
      setPlayerStats(getPlayerStats(null, stanceId));
    }
  };

  const currentStanceObj = useMemo(
    () => getCombatStanceById(activeStance),
    [activeStance]
  );

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
    if (next > 0) {
      audioManager.play('coin');
    }
  };

  const formattedTimer = useMemo(() => {
    const mins = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
    const secs = String(timerSeconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  }, [timerSeconds]);

  return (
    <section className="min-h-screen bg-page-primary dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 pt-20 sm:px-6">
        {/* Fantasy RPG World HUD */}
        <WorldHUD
          title="Colosseum of Valoria"
          zoneKicker="Rank IV Arena"
          levelLabel="Trial Rank"
          level={4}
          currentXp={projectedOdds}
          targetXp={100}
          gold={availableGold}
          tool={{ name: currentStanceObj?.name || 'Assault Stance', icon: '⚔️' }}
          viewMode={viewMode}
          onToggleViewMode={() => setViewMode(viewMode === 'world' ? 'ledger' : 'world')}
          className="mb-6"
        />

        {viewMode === 'world' ? (
          <div className="space-y-6">
            <ArenaWorldView
              opponent={opponent}
              hazard={hazard}
              activeStance={activeStance}
              playerPower={playerPower}
              opponentPower={opponentPower}
              projectedOdds={projectedOdds}
              wager={wager}
              availableGold={availableGold}
              onStanceChange={handleStanceChange}
              onWagerChange={handleWagerChange}
            />

            {/* Tactical Loadout and Stance Moves Deck */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-yellow-700/30 bg-gray-950/80 p-5 backdrop-blur shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-yellow-400 font-bold">Equipped Vault Loadout</p>
                  <Link to="/inventory" className="text-xs text-yellow-400 underline font-semibold">Vault</Link>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {equippedGear.map((item) => (
                    <span key={item.id} className="rounded-lg border border-yellow-700/40 bg-gray-900 px-2.5 py-1 text-xs text-gray-200">
                      <span className="text-yellow-400 font-bold text-[10px] uppercase mr-1">{item.slot}:</span>
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-yellow-700/30 bg-gray-950/80 p-5 backdrop-blur shadow-xl">
                <p className="text-xs uppercase tracking-wider text-yellow-400 font-bold">Active Discipline Moves</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentStanceObj?.moves.map((move) => (
                    <span key={move} className="rounded-lg border border-yellow-600/30 bg-yellow-950/40 px-3 py-1 text-xs font-semibold text-yellow-200">
                      ⚔️ {move}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-8 shadow-xl backdrop-blur court-reveal glass-panel">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">Arena Clash</p>
                <h1 className="mt-3 text-4xl font-extrabold text-white hero-title">Colosseum Duel Deck</h1>
                <p className="mt-3 text-base text-gray-300">
                  Tune your battle stance, equip vault gear, and challenge the weekly champions.
                </p>
              </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-300">
              <span className="court-chip rounded-full px-3 py-2">Rank IV Trials</span>
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
                <span className="rounded-full border border-yellow-700/40 bg-gray-950/70 px-3 py-1 text-xs text-yellow-300 animate-pulse">
                  Ready to Clash
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="court-card rounded-xl p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Match Timer</p>
                  <p className="mt-2 text-2xl font-mono font-semibold text-yellow-300">{formattedTimer}</p>
                  <p className="text-xs text-gray-400 mt-1">Live queue rotation</p>
                </div>
                <div className="court-card rounded-xl p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Arena Sigils</p>
                  <p className="mt-2 text-xl font-semibold text-white">3 Available</p>
                  <p className="text-xs text-gray-400 mt-1">+1 sigil awarded on win</p>
                </div>
              </div>

              {/* Equipped Gear Overview */}
              <div className="mt-6 rounded-2xl border border-yellow-700/30 bg-gray-950/60 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Equipped Gear</p>
                    <p className="mt-1 text-base font-semibold text-white">Active Combat Loadout</p>
                  </div>
                  <Link
                    to="/inventory"
                    className="text-xs font-semibold text-yellow-400 hover:text-yellow-300 underline"
                  >
                    Open Vault
                  </Link>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {equippedGear.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-yellow-700/30 bg-gray-900/80 px-3 py-1.5 text-xs text-gray-200 flex items-center gap-2"
                    >
                      <span className="font-semibold text-yellow-400 uppercase text-[10px]">
                        {item.slot}
                      </span>
                      <span>{item.name}</span>
                      <span className="text-emerald-400 text-[10px] font-mono">
                        {item.attack ? `+${item.attack}A ` : ''}
                        {item.defense ? `+${item.defense}D ` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Combat Stance Selector */}
              <div className="mt-6 rounded-2xl border border-yellow-700/30 bg-gray-950/60 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Combat Stance</p>
                <h3 className="mt-1 text-lg font-semibold text-white">Select Fighting Discipline</h3>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                  {combatStances.map((stance) => {
                    const isSelected = activeStance === stance.id;
                    return (
                      <button
                        key={stance.id}
                        type="button"
                        onClick={() => handleStanceChange(stance.id)}
                        className={`rounded-xl p-3 text-left transition-all ${
                          isSelected
                            ? 'border-2 border-yellow-400 bg-yellow-950/40 shadow-lg'
                            : 'border border-yellow-700/30 bg-gray-900/60 hover:bg-gray-800/80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold uppercase ${isSelected ? 'text-yellow-300' : 'text-gray-300'}`}>
                            {stance.category}
                          </span>
                          {isSelected && <span className="h-2 w-2 rounded-full bg-yellow-400 animate-ping" />}
                        </div>
                        <p className="mt-1 text-sm font-bold text-white">{stance.name}</p>
                        <p className="mt-1 text-[11px] text-yellow-200/80 font-mono">{stance.tagline}</p>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-gray-400">
                  {currentStanceObj?.description} (Counters {currentStanceObj?.advantageAgainst}).
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
                    <span>Your Power ({currentStanceObj?.name})</span>
                    <span className="font-semibold text-yellow-300 text-base">{playerPower}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{opponent ? opponent.name : 'Opponent'} Power</span>
                    <span className="font-semibold text-white">{opponentPower || '???'}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-yellow-500 shimmer-bar transition-all duration-500"
                      style={{ width: `${projectedOdds}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">Projected win odds: {projectedOdds}%</p>
                </div>
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
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Active Stance Moves</p>
                <ul className="mt-3 space-y-2 text-sm text-gray-300">
                  {currentStanceObj?.moves.map((move) => (
                    <li
                      key={move}
                      className="rounded-lg border border-yellow-700/20 bg-gray-950/60 px-3 py-2 text-xs flex items-center justify-between"
                    >
                      <span className="font-semibold text-white">{move}</span>
                      <span className="text-yellow-400 text-[10px] uppercase font-mono">
                        {currentStanceObj.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/arena/fight/opponent"
              onClick={() => audioManager.play('strike')}
              className="inline-flex items-center rounded-lg px-5 py-2.5 text-sm font-bold text-white action-primary shadow-lg"
            >
              Fight Now
            </Link>
            <button
              type="button"
              onClick={() => {
                audioManager.play('tap');
                setShowSparModal(true);
              }}
              className="inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-semibold text-yellow-200 action-ghost"
            >
              Spar Practice
            </button>
            <Link
              to="/arena"
              onClick={() => audioManager.play('tap')}
              className="inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-semibold text-yellow-200 action-ghost"
            >
              Back to Arena
            </Link>
          </div>
        </div>
      )}
      </div>

      <SparringModal
        isOpen={showSparModal}
        onClose={() => setShowSparModal(false)}
        playerPower={playerPower}
        opponentPower={opponentPower}
        stance={currentStanceObj}
        equippedGear={equippedGear}
        hazard={hazard}
      />
    </section>
  );
}
