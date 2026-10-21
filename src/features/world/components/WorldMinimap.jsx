import React, { useState, useEffect } from 'react';
import audioManager from '../../../core/audio/AudioManager';
import gameEventBridge from '../../../core/phaser/gameEventBridge';

const WORLD_REGIONS = [
  {
    id: 'homestead',
    name: 'Sunforge Homestead',
    shortName: 'Home',
    x: 68,
    y: 52,
    icon: '🏡',
    color: '#4ade80',
    description: 'Personal estate, cottage, tilled farm plots, well, and storage chest.',
  },
  {
    id: 'homestead_interior',
    name: 'Cottage Home',
    shortName: 'Cottage',
    x: 68,
    y: 58,
    icon: '🛋️',
    color: '#f59e0b',
    description: 'Cozy manor interior with restorative bed, warm fireplace, and vault chest.',
  },
  {
    id: 'west_road',
    name: 'Sunforge West Road',
    shortName: 'West Road',
    x: 48,
    y: 52,
    icon: '🛣️',
    color: '#fbbf24',
    description: 'Walkable open-world highway linking Homestead to Sunforge City.',
  },
  {
    id: 'village',
    name: 'Sunforge City Plaza',
    shortName: 'City',
    x: 24,
    y: 52,
    icon: '🏛️',
    color: '#60a5fa',
    description: 'Vibrant capital hub: Adventurers\' Guild, Blacksmith, Market Bazaar, and Inn.',
    landmarks: [
      { name: "Adventurers' Guild", icon: '⚔️', x: 20, y: 44 },
      { name: 'Iron Anvil Blacksmith', icon: '⚒️', x: 28, y: 44 },
      { name: 'Sunforge Market Bazaar', icon: '🪙', x: 28, y: 60 },
      { name: 'The Hearth & Pint Inn', icon: '🍺', x: 20, y: 60 },
    ],
  },
  {
    id: 'forest',
    name: 'Whispering Woods',
    shortName: 'Forest',
    x: 88,
    y: 52,
    icon: '🌲',
    color: '#34d399',
    description: 'Wild enchanted forest with Sylvan Shrine, herbs, and hostile beasts.',
  },
  {
    id: 'mine',
    name: 'Deepforge Caverns',
    shortName: 'Caverns',
    x: 68,
    y: 24,
    icon: '⛏️',
    color: '#94a3b8',
    description: 'Subterranean mineral veins (Iron, Copper, Gold), Skeletons, and Goblins.',
  },
];

export default function WorldMinimap({
  currentZone = 'homestead',
  playerPosition = { x: 480, y: 448 },
  playerFacing = 'south',
  discoveredRegions = ['homestead'],
  activeContracts = [],
  onReturnHome = () => {},
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Broadcast atlas opened event when expanded
  useEffect(() => {
    if (isExpanded) {
      gameEventBridge.emit('WORLD_ATLAS_OPENED');
    }
  }, [isExpanded]);

  // Listen to external request to open atlas
  useEffect(() => {
    const unsub = gameEventBridge.on('OPEN_IN_GAME_ATLAS', () => {
      setIsExpanded(true);
    });
    return () => unsub();
  }, []);

  // Keyboard shortcut [M] toggles expanded realm atlas
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'm' || e.key === 'M') {
        audioManager.play('tap');
        setIsExpanded((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeZoneMeta = WORLD_REGIONS.find((r) => r.id === currentZone) || WORLD_REGIONS[0];

  // Map facing direction to rotation angle
  const getFacingAngle = () => {
    switch (playerFacing) {
      case 'north': return -90;
      case 'east': return 0;
      case 'south': return 90;
      case 'west': return 180;
      default: return 90;
    }
  };

  return (
    <>
      {/* =====================================================================
          1. PERMANENT COMPACT MINIMAP (Anchored Bottom-Right)
          ===================================================================== */}
      <aside
        className="pointer-events-auto fixed bottom-3 right-4 z-20 flex flex-col items-end gap-1.5 select-none"
        aria-label="Realm Minimap"
      >
        {/* Quick Return Home Action Button */}
        <button
          type="button"
          onClick={() => {
            audioManager.play('tap');
            onReturnHome();
          }}
          className="rpg-btn-beige text-xs py-1 px-3 shadow-xl"
          title="Recall Home to Homestead Cottage [H]"
        >
          <span>🏡</span>
          <span>Return Home</span>
          <kbd className="rounded border border-amber-900/60 bg-amber-950/80 px-1 font-mono text-[9px] text-amber-200 ml-1">
            H
          </kbd>
        </button>

        {/* Circular Radar / Minimap Frame */}
        <div
          onClick={() => {
            audioManager.play('tap');
            setIsExpanded(true);
          }}
          className="rpg-panel-brown group relative h-36 w-36 sm:h-40 sm:w-40 cursor-pointer overflow-hidden p-1.5 shadow-2xl backdrop-blur-md hover:brightness-105"
          title="Click or press [M] to open World Atlas"
        >
          {/* Compass Rose Ring */}
          <div className="absolute inset-1 rounded border border-amber-700/30 pointer-events-none" />
          <span className="absolute top-1 left-1/2 -translate-x-1/2 font-mono text-[8px] font-bold text-amber-300">
            N
          </span>
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 font-mono text-[8px] font-bold text-amber-300">
            S
          </span>
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 font-mono text-[8px] font-bold text-amber-300">
            E
          </span>
          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 font-mono text-[8px] font-bold text-amber-300">
            W
          </span>

          {/* Connected Region Geography Diagram */}
          <div className="relative h-full w-full rounded bg-stone-950/70 p-2 overflow-hidden border border-amber-900/40">
            {/* Walkway lines */}
            <svg className="absolute inset-0 h-full w-full pointer-events-none opacity-40" viewBox="0 0 100 100">
              {/* West Road highway connecting City, Road, Homestead */}
              <line x1="24" y1="52" x2="88" y2="52" stroke="#d97706" strokeWidth="4" strokeDasharray="2 2" />
              {/* Caverns access fork */}
              <line x1="68" y1="24" x2="68" y2="52" stroke="#94a3b8" strokeWidth="3" strokeDasharray="2 2" />
            </svg>

            {/* Region Nodes */}
            {WORLD_REGIONS.map((region) => {
              const isCurrent = currentZone === region.id;
              const isDiscovered = discoveredRegions.includes(region.id) || isCurrent;
              return (
                <div
                  key={region.id}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all ${
                    isDiscovered ? 'opacity-100' : 'opacity-25 blur-[1px]'
                  }`}
                  style={{ left: `${region.x}%`, top: `${region.y}%` }}
                >
                  <div
                    className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-xs shadow ${
                      isCurrent
                        ? 'border-2 border-yellow-300 bg-yellow-500/30 ring-2 ring-yellow-400/50 animate-pulse'
                        : 'border border-gray-600 bg-gray-900/80'
                    }`}
                  >
                    <span>{isDiscovered ? region.icon : '❓'}</span>
                  </div>
                  <span className={`text-[8px] font-mono leading-none mt-0.5 ${isCurrent ? 'text-yellow-300 font-bold' : 'text-gray-400'}`}>
                    {region.shortName}
                  </span>
                </div>
              );
            })}

            {/* Player World Cursor (Pin + Facing Arrow) */}
            <div
              className="absolute pointer-events-none z-10 -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${activeZoneMeta.x + ((playerPosition.x / 1280) - 0.5) * 16}%`,
                top: `${activeZoneMeta.y + ((playerPosition.y / 960) - 0.5) * 16}%`,
              }}
            >
              <div
                className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-cyan-400 text-black shadow-lg shadow-cyan-400/80 ring-2 ring-white transition-transform duration-100"
                style={{ transform: `rotate(${getFacingAngle()}deg)` }}
              >
                <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[5px] border-l-black ml-0.5" />
              </div>
            </div>
          </div>

          {/* Coordinate & Region Tooltip Label */}
          <div className="absolute bottom-1 inset-x-2 flex items-center justify-between rounded-lg bg-gray-950/80 px-1.5 py-0.5 text-[9px] font-mono backdrop-blur-md">
            <span className="truncate text-yellow-300 font-bold max-w-[70px]">
              {activeZoneMeta.shortName}
            </span>
            <span className="text-gray-400 text-[8px]">
              {Math.round(playerPosition.x)},{Math.round(playerPosition.y)}
            </span>
          </div>

          {/* Expand Hint Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition rounded-3xl backdrop-blur-[2px]">
            <span className="font-serif text-xs font-bold text-yellow-300 tracking-wide">
              Atlas [M] 🗺️
            </span>
          </div>
        </div>
      </aside>

      {/* =====================================================================
          2. EXPANDED FULL-PAGE WORLD ATLAS MODAL (Hotkey [M] or Click Minimap)
          ===================================================================== */}
      {isExpanded && (
        <div className="fixed inset-2 sm:inset-4 z-50 flex items-center justify-center select-none animate-fadeIn">
          <div className="rpg-panel-brown relative flex flex-col w-full h-full p-4 sm:p-5 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-900/50 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl drop-shadow">🗺️</span>
                <div>
                  <h2 className="font-serif text-xl font-bold text-amber-100 tracking-wide drop-shadow">
                    Salvation World Atlas
                  </h2>
                  <p className="text-xs text-amber-200/70">
                    Connected realm geography, landmarks, roads, and active contracts
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  audioManager.play('tap');
                  setIsExpanded(false);
                }}
                className="rpg-btn-square-brown h-8 w-8 text-xs font-bold text-amber-200"
              >
                ✕
              </button>
            </div>

            {/* Map Canvas Diagram */}
            <div className="rpg-slot-inset relative my-4 flex-1 p-4 overflow-hidden bg-stone-950/90">
              {/* Atmospheric grid lines */}
              <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

              {/* Highway Trails SVG */}
              <svg className="absolute inset-0 h-full w-full pointer-events-none opacity-60" viewBox="0 0 100 100">
                {/* Sunforge King's Highway */}
                <line x1="24" y1="52" x2="48" y2="52" stroke="#d97706" strokeWidth="3" strokeDasharray="3 3" />
                <line x1="48" y1="52" x2="68" y2="52" stroke="#d97706" strokeWidth="3" strokeDasharray="3 3" />
                <line x1="68" y1="52" x2="88" y2="52" stroke="#10b981" strokeWidth="3" strokeDasharray="3 3" />
                {/* Mountain Cavern Path */}
                <line x1="68" y1="24" x2="68" y2="52" stroke="#94a3b8" strokeWidth="3" strokeDasharray="3 3" />
              </svg>

              {/* Region Landmark Cards */}
              {WORLD_REGIONS.map((region) => {
                const isCurrent = currentZone === region.id;
                const isDiscovered = discoveredRegions.includes(region.id) || isCurrent;

                return (
                  <div
                    key={region.id}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all ${
                      isDiscovered ? 'opacity-100' : 'opacity-30'
                    }`}
                    style={{ left: `${region.x}%`, top: `${region.y}%` }}
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-xl transition-transform hover:scale-110 ${
                        isCurrent
                          ? 'border-2 border-yellow-400 bg-yellow-500/20 ring-4 ring-yellow-400/30'
                          : 'border border-yellow-700/50 bg-gray-900/90'
                      }`}
                    >
                      <span>{isDiscovered ? region.icon : '❓'}</span>
                    </div>

                    <span className="font-serif text-xs font-bold text-white mt-1 text-center whitespace-nowrap drop-shadow">
                      {isDiscovered ? region.name : 'Undiscovered'}
                    </span>

                    {/* Landmarks within City */}
                    {region.landmarks && isDiscovered && (
                      <div className="mt-1 flex gap-1">
                        {region.landmarks.map((lm) => (
                          <span
                            key={lm.name}
                            className="rounded-md border border-gray-700 bg-gray-900/90 px-1 py-0.5 text-[9px] text-gray-300"
                            title={lm.name}
                          >
                            {lm.icon}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Player Live Marker */}
              <div
                className="absolute pointer-events-none z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                style={{
                  left: `${activeZoneMeta.x}%`,
                  top: `${activeZoneMeta.y - 7}%`,
                }}
              >
                <span className="rounded-full bg-cyan-400 px-2 py-0.5 text-[10px] font-mono font-bold text-black shadow-lg animate-bounce">
                  You are here
                </span>
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-cyan-400" />
              </div>
            </div>

            {/* Region Details Footer */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-amber-900/50 pt-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                    Current Territory:
                  </span>
                  {activeContracts.length > 0 && (
                    <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[9px] text-amber-300 font-bold">
                      📜 {activeContracts.length} Active Bounties
                    </span>
                  )}
                </div>
                <p className="text-amber-100 font-serif">
                  <span className="font-bold text-amber-300">{activeZoneMeta.name}</span> — {activeZoneMeta.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    audioManager.play('tap');
                    setIsExpanded(false);
                    onReturnHome();
                  }}
                  className="rpg-btn-beige text-xs py-1.5 px-3"
                >
                  <span>🏡</span>
                  <span>Return Home [H]</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    audioManager.play('tap');
                    setIsExpanded(false);
                  }}
                  className="rpg-btn-brown text-xs py-1.5 px-3"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
