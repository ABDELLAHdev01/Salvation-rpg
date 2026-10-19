import React from 'react';
import { Link } from 'react-router-dom';
import audioManager from '../audio/AudioManager';

export default function WorldHUD({
  title = 'Sunforge Farmstead',
  zoneKicker = 'Estate Domain',
  levelLabel = 'Farm Level',
  level = 1,
  currentXp = 0,
  targetXp = 100,
  gold = 0,
  weather = null,
  tool = null,
  viewMode = 'world',
  onToggleViewMode = null,
  onOpenInventory = null,
  className = '',
  children,
}) {
  const xpPct = targetXp > 0 ? Math.min(100, Math.round((currentXp / targetXp) * 100)) : 0;

  return (
    <header className={`relative z-30 select-none ${className}`}>
      {/* Top Banner Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-yellow-700/30 bg-gray-950/85 px-4 py-3 shadow-2xl backdrop-blur-md">
        {/* Left: Zone & Title */}
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            onClick={() => audioManager.play('tap')}
            className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-yellow-600/40 bg-gray-900/80 text-yellow-300 transition-all hover:border-yellow-400 hover:bg-yellow-500/20 active:scale-95"
            title="Return to Citadel Dashboard"
          >
            <span className="text-base transition-transform group-hover:-translate-x-0.5">←</span>
          </Link>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-yellow-400/80">
              {zoneKicker}
            </p>
            <h1 className="font-serif text-lg font-bold text-white tracking-wide sm:text-xl">
              {title}
            </h1>
          </div>
        </div>

        {/* Center: Progression & Weather */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Level & XP Gauge */}
          <div className="flex items-center gap-2.5 rounded-xl border border-yellow-700/20 bg-gray-900/80 px-3 py-1.5 shadow-inner">
            <span className="text-xs font-bold text-amber-300 font-mono">
              {levelLabel} {level}
            </span>
            <div className="h-2 w-20 overflow-hidden rounded-full bg-black/60 sm:w-28">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-300"
                style={{ width: `${xpPct}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-gray-400">
              {xpPct}%
            </span>
          </div>

          {/* Weather / Season if present */}
          {weather && (
            <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-sky-800/30 bg-sky-950/40 px-3 py-1.5 text-xs text-sky-200">
              <span>{weather.season === 'Spring' ? '🌸' : weather.season === 'Summer' ? '☀️' : weather.season === 'Autumn' ? '🍂' : '❄️'}</span>
              <span className="font-medium text-[11px]">{weather.label}</span>
            </div>
          )}

          {/* Active Tool Badge if present */}
          {tool && (
            <div className="hidden lg:flex items-center gap-1.5 rounded-xl border border-yellow-700/20 bg-gray-900/70 px-2.5 py-1.5 text-xs text-yellow-200">
              <span className="text-sm">{tool.icon || '⚒️'}</span>
              <span className="text-[11px] font-semibold">{tool.name}</span>
            </div>
          )}
        </div>

        {/* Right: Currency & View Controls */}
        <div className="flex items-center gap-2.5">
          {/* Gold Pouch */}
          <div className="flex items-center gap-1.5 rounded-xl border border-amber-600/30 bg-amber-950/30 px-3 py-1.5 shadow-sm">
            <span className="text-sm">🪙</span>
            <span className="font-mono text-sm font-bold text-yellow-300 tabular-nums">
              {gold.toLocaleString()}g
            </span>
          </div>

          {/* Quick Vault / Inventory Drawer Button */}
          {onOpenInventory && (
            <button
              type="button"
              onClick={() => {
                audioManager.play('tap');
                onOpenInventory();
              }}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-yellow-700/30 bg-gray-900 px-3 text-xs font-semibold text-gray-300 hover:border-yellow-500 hover:text-yellow-200 transition"
              title="Open Vault"
            >
              <span>🎒</span>
              <span className="hidden sm:inline">Pouch</span>
            </button>
          )}

          {/* 2D World ⇄ Table Ledger View Mode Toggle */}
          {onToggleViewMode && (
            <button
              type="button"
              onClick={() => {
                audioManager.play('tap');
                onToggleViewMode();
              }}
              className={`flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition ${
                viewMode === 'world'
                  ? 'border-yellow-500 bg-yellow-500/20 text-yellow-300 shadow-lg shadow-yellow-950/50'
                  : 'border-gray-700 bg-gray-900 text-gray-400 hover:text-white'
              }`}
              title={viewMode === 'world' ? 'Switch to Table Ledger' : 'Switch to 2D World View'}
            >
              <span>{viewMode === 'world' ? '🗺️' : '📋'}</span>
              <span className="hidden md:inline">
                {viewMode === 'world' ? '2D World' : 'Ledger'}
              </span>
            </button>
          )}
        </div>
      </div>

      {children}
    </header>
  );
}
