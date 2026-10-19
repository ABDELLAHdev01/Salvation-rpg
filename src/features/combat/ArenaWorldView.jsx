import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import audioManager from '../../core/audio/AudioManager';
import { combatStances } from '../../core/data/arenaOpponents';
import { PixelPlayerAvatar } from '../../core/world/pixelAssets';

export default function ArenaWorldView({
  opponent = null,
  hazard = null,
  activeStance = 'assault',
  playerPower = 100,
  opponentPower = 90,
  projectedOdds = 52,
  wager = 0,
  availableGold = 0,
  onStanceChange = () => {},
  onWagerChange = () => {},
  className = '',
}) {
  const navigate = useNavigate();
  const [clashAnimation, setClashAnimation] = useState(false);
  const [combatText, setCombatText] = useState(null);

  const currentStance = combatStances.find((s) => s.id === activeStance) || combatStances[0];

  const handleTriggerSpar = () => {
    audioManager.play('strike');
    setClashAnimation(true);
    const dmg = Math.floor(playerPower * (0.8 + Math.random() * 0.4));
    setCombatText(`⚔️ CRIT -${dmg}!`);

    setTimeout(() => {
      audioManager.play('anvil');
    }, 200);

    setTimeout(() => {
      setClashAnimation(false);
      setCombatText(null);
    }, 1500);
  };

  const stanceAuras = {
    assault: 'from-orange-500/30 via-red-500/20 to-transparent border-red-500/60 shadow-red-950/50',
    bastion: 'from-amber-400/30 via-yellow-600/20 to-transparent border-yellow-500/60 shadow-yellow-950/50',
    focus: 'from-cyan-400/30 via-purple-600/20 to-transparent border-cyan-400/60 shadow-cyan-950/50',
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-3xl border-2 border-amber-800/50 bg-[#16100c] shadow-2xl ${className}`}>
      {/* 2D Colosseum Sand Pit Arena */}
      <div className="relative min-h-[640px] w-full p-4 sm:p-6 select-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#382312] via-[#211409] to-[#0e0703]">
        {/* Arena Sand & Cobblestone Floor */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#5e3a1920_1px,transparent_1px),linear-gradient(to_bottom,#5e3a1920_1px,transparent_1px)] bg-[size:34px_34px] pointer-events-none" />

        {/* Outer Arena Stone Wall & Cheering Crowds Silhouette */}
        <div className="absolute top-0 inset-x-0 h-16 border-b border-yellow-900/40 bg-gradient-to-b from-gray-950/90 to-transparent flex items-center justify-between px-6 pointer-events-none">
          <div className="text-[11px] font-mono text-yellow-500/70 uppercase tracking-widest">
            👑 Imperial Colosseum · Rank IV Trials
          </div>
          {hazard && (
            <div className="rounded-full border border-red-700/50 bg-red-950/60 px-3 py-0.5 text-[10px] font-bold text-red-300">
              Hazard: {hazard.name}
            </div>
          )}
        </div>

        {/* Flickering Torches along the Arena Walls */}
        <div className="absolute top-20 left-6 flex items-center gap-1.5 pointer-events-none">
          <span className="text-xl animate-pulse">🔥</span>
          <div className="h-10 w-2 bg-stone-700 rounded" />
        </div>
        <div className="absolute top-20 right-6 flex items-center gap-1.5 pointer-events-none">
          <span className="text-xl animate-pulse">🔥</span>
          <div className="h-10 w-2 bg-stone-700 rounded" />
        </div>

        {/* Ambient Sand Dust Drift */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute h-1 w-1 rounded-full bg-amber-400/40 blur-[0.5px] animate-ping" style={{ top: '65%', left: '42%', animationDuration: '3s' }} />
          <div className="absolute h-1 w-1 rounded-full bg-orange-400/40 blur-[0.5px] animate-pulse" style={{ top: '55%', left: '58%', animationDuration: '2.5s' }} />
        </div>

        {/* =========================================================================
            CENTER ARENA PIT: PLAYER GLADIATOR VS OPPONENT CHAMPION
            ========================================================================= */}
        <div className="relative min-h-[380px] w-full flex items-center justify-around px-4 sm:px-16 pt-16">
          {/* LEFT: PLAYER GLADIATOR */}
          <div
            onClick={() => {
              // Cycle to next stance
              const curIdx = combatStances.findIndex((s) => s.id === activeStance);
              const nextIdx = (curIdx + 1) % combatStances.length;
              onStanceChange(combatStances[nextIdx].id);
            }}
            className={`group relative flex flex-col items-center cursor-pointer transition-transform duration-300 ${
              clashAnimation ? 'translate-x-12 scale-110' : 'hover:scale-105'
            }`}
            title="Click to cycle combat stance"
          >
            {/* Stance Aura Ring */}
            <div
              className={`absolute -inset-4 rounded-full bg-gradient-to-t border-2 animate-pulse ${
                stanceAuras[activeStance] || stanceAuras.assault
              }`}
            />

            {/* Player Avatar */}
            <div className="relative z-10 scale-125">
              <PixelPlayerAvatar />
            </div>

            {/* Combat Power & Stance Badge */}
            <div className="relative z-10 mt-6 flex flex-col items-center">
              <span className="rounded-full border border-yellow-500/50 bg-gray-950/90 px-3 py-0.5 text-xs font-bold text-yellow-300 shadow-md">
                You ({currentStance.name})
              </span>
              <span className="font-mono text-xs font-bold text-emerald-400 mt-1">
                ⚔️ {playerPower} Power
              </span>
              <span className="text-[10px] text-gray-400 group-hover:text-yellow-300 transition-colors mt-0.5">
                Click to switch stance
              </span>
            </div>
          </div>

          {/* CENTER: CLASH INDICATOR & FLOATING DAMAGE TEXT */}
          <div className="flex flex-col items-center justify-center z-20">
            {combatText ? (
              <div className="text-xl sm:text-2xl font-black text-amber-400 animate-bounce drop-shadow-[0_2px_10px_rgba(245,158,11,0.8)]">
                {combatText}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-yellow-500/80 drop-shadow">
                  VS
                </span>
                <span className="text-[10px] font-mono text-gray-400 mt-1">
                  Win Odds: {projectedOdds}%
                </span>
                <div className="mt-1 h-1.5 w-24 rounded-full bg-gray-900 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-300"
                    style={{ width: `${projectedOdds}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: OPPONENT CHAMPION */}
          <div
            className={`relative flex flex-col items-center transition-transform duration-300 ${
              clashAnimation ? '-translate-x-12' : ''
            }`}
          >
            {/* Opponent Red Menace Aura */}
            <div className="absolute -inset-4 rounded-full bg-gradient-to-t from-red-600/30 via-transparent to-transparent border-2 border-red-700/40 shadow-xl shadow-red-950/40" />

            {/* Opponent Sprite Container */}
            <div className="relative z-10 h-24 w-24 sm:h-28 sm:w-28 rounded-2xl border-2 border-red-700/50 bg-gray-950/80 p-2 overflow-hidden shadow-2xl flex items-center justify-center">
              {opponent?.image ? (
                <img
                  src={opponent.image}
                  alt={opponent.name}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/raceicon/noimage.webp';
                  }}
                />
              ) : (
                <span className="text-4xl">⚔️</span>
              )}
            </div>

            {/* Opponent Stats */}
            <div className="relative z-10 mt-4 flex flex-col items-center">
              <span className="rounded-full border border-red-600/50 bg-gray-950/90 px-3 py-0.5 text-xs font-bold text-white shadow-md">
                {opponent?.name || 'Arena Champion'}
              </span>
              <span className="font-mono text-xs font-bold text-red-400 mt-1">
                🛡️ {opponentPower} Power
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5">
                Level {opponent?.level || 20} · Rank {opponent?.rank || 'IV'}
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            BOTTOM CONTEXTUAL DOCK: STANCE SWITCHER, WAGER, SPAR & COMMIT ACTIONS
            ========================================================================= */}
        <div className="absolute inset-x-4 bottom-4 z-30 rounded-2xl border-2 border-yellow-700/50 bg-gray-950/95 p-4 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-2 duration-200 sm:inset-x-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left: Quick Stance Discipline Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 hidden sm:inline">
                Stance:
              </span>
              <div className="flex items-center gap-1.5">
                {combatStances.map((stance) => {
                  const isSelected = activeStance === stance.id;
                  return (
                    <button
                      key={stance.id}
                      type="button"
                      onClick={() => onStanceChange(stance.id)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                        isSelected
                          ? 'border border-yellow-400 bg-yellow-500/20 text-yellow-300 shadow-md'
                          : 'border border-gray-800 bg-gray-900 text-gray-400 hover:text-white'
                      }`}
                    >
                      {stance.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Center: Wager Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-semibold hidden md:inline">
                Wager:
              </span>
              {[0, 50, 100, 200].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => onWagerChange(amt)}
                  disabled={amt > availableGold}
                  className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition ${
                    wager === amt
                      ? 'border border-amber-400 bg-amber-400/20 text-yellow-300'
                      : 'border border-gray-800 bg-gray-900 text-gray-400 hover:text-white disabled:opacity-30'
                  }`}
                >
                  {amt === 0 ? 'No Bet' : `${amt}g`}
                </button>
              ))}
            </div>

            {/* Right: Spar Practice & Fight Now CTA */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTriggerSpar}
                className="flex items-center gap-1.5 rounded-xl border border-yellow-600/40 bg-gray-900 px-3.5 py-2 text-xs font-bold text-yellow-300 hover:border-yellow-400 transition active:scale-95"
                title="Perform in-world sparring strike"
              >
                <span>⚔️</span>
                <span>Spar Clash</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  audioManager.play('strike');
                  navigate('/arena/fight/opponent');
                }}
                className="flex items-center gap-1.5 rounded-xl border border-yellow-500 bg-gradient-to-r from-yellow-500 to-amber-600 px-5 py-2 text-xs font-black text-gray-950 shadow-lg shadow-yellow-900/50 hover:brightness-110 active:scale-95 transition"
              >
                <span>Enter Duel</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
