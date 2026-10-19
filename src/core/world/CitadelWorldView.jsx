import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import audioManager from '../audio/AudioManager';
import {
  PixelCitadelMonument,
  PixelDistrictBuilding,
  PixelPlayerAvatar,
  PixelLantern,
  PixelTree,
} from './pixelAssets';

export default function CitadelWorldView({
  profile = null,
  character = null,
  className = '',
}) {
  const navigate = useNavigate();
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const districts = [
    {
      id: 'farm',
      name: 'Sunforge Farmstead',
      desc: 'Cultivate seasonal crops, raise livestock, and harvest goods.',
      path: '/farm/plots',
      icon: '🌾',
      levelSnippet: `Farm L${profile?.farmLevel ?? 1}`,
      x: 18,
      y: 22,
    },
    {
      id: 'housing',
      name: "Warden's Manor",
      desc: 'Furnish your estate residence with hearth amenities and trophies.',
      path: '/housing',
      icon: '🏰',
      levelSnippet: `${profile?.houseId || 'starter-cottage'}`,
      x: 50,
      y: 16,
    },
    {
      id: 'adventure',
      name: 'Wilderness Gate',
      desc: 'Dispatch scouts into the outer wildlands for ancient relics.',
      path: '/adventure',
      icon: '🗺️',
      levelSnippet: 'Expeditions',
      x: 82,
      y: 22,
    },
    {
      id: 'mining',
      name: 'Deepforge Shaft',
      desc: 'Delve into subterranean cavern seams to mine valuable ores.',
      path: '/mining/click',
      icon: '⛏️',
      levelSnippet: `Mining L${profile?.miningLevel ?? 1}`,
      x: 14,
      y: 52,
    },
    {
      id: 'arena',
      name: 'The Colosseum',
      desc: 'Face gladiators and test combat stances in ranked duels.',
      path: '/arena',
      icon: '⚔️',
      levelSnippet: 'Colosseum Duels',
      x: 86,
      y: 52,
    },
    {
      id: 'workshop',
      name: 'Artisan Workshop',
      desc: 'Smelt ingots, weave cloth, crack geodes, and decipher codexes.',
      path: '/workshop',
      icon: '⚒️',
      levelSnippet: `Workshop L${profile?.workshopLevel ?? 1}`,
      x: 20,
      y: 80,
    },
    {
      id: 'market',
      name: 'Merchant Bazaar',
      desc: 'Trade harvested crops, smelted bars, and buy artisan tools.',
      path: '/market',
      icon: '🪙',
      levelSnippet: 'Bazaar Stalls',
      x: 50,
      y: 84,
    },
    {
      id: 'guild',
      name: 'Fellowship Hall',
      desc: 'Coordinate with fellow Wardens and contribute to guild orders.',
      path: '/guild',
      icon: '🛡️',
      levelSnippet: 'Warden Guild',
      x: 80,
      y: 80,
    },
  ];

  const handleDistrictClick = (district) => {
    audioManager.play('tap');
    setSelectedDistrict(district);
  };

  const handleEnterDistrict = (path) => {
    audioManager.play('tap');
    navigate(path);
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-3xl border-2 border-yellow-700/40 bg-[#10121a] shadow-2xl ${className}`}>
      {/* 2D Citadel Plaza Canvas */}
      <div className="relative min-h-[620px] w-full p-4 sm:p-6 select-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1f2438] via-[#141724] to-[#0a0c14]">
        {/* Stone Cobblestone Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a304720_1px,transparent_1px),linear-gradient(to_bottom,#2a304720_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        {/* Outer Citadel Walls & Greenery */}
        <div className="absolute top-2 left-6 opacity-60 pointer-events-none hidden sm:block">
          <PixelTree />
        </div>
        <div className="absolute top-2 right-6 opacity-60 pointer-events-none hidden sm:block">
          <PixelTree />
        </div>
        <div className="absolute top-24 left-1/4 pointer-events-none">
          <PixelLantern isFlickering={true} />
        </div>
        <div className="absolute top-24 right-1/4 pointer-events-none">
          <PixelLantern isFlickering={true} />
        </div>

        {/* Ambient Floating Sparks / Light Rays */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute h-2 w-2 rounded-full bg-yellow-300/30 blur-[1px] animate-pulse" style={{ top: '30%', left: '35%', animationDuration: '4s' }} />
          <div className="absolute h-2 w-2 rounded-full bg-amber-400/30 blur-[1px] animate-ping" style={{ top: '60%', left: '65%', animationDuration: '5s' }} />
        </div>

        {/* Enter 2D World Badge */}
        <button
          type="button"
          onClick={() => {
            audioManager.play('tap');
            navigate('/world');
          }}
          className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-2xl border border-yellow-500/50 bg-gray-950/90 px-3.5 py-1.5 text-xs font-bold text-yellow-300 shadow-xl backdrop-blur hover:bg-yellow-500/20 hover:border-yellow-400 transition"
          title="Enter 2D Fantasy RPG World"
        >
          <span className="text-sm">🌍</span>
          <span>Enter 2D World</span>
          <span>➔</span>
        </button>

        {/* =========================================================================
            CENTER: SUNFORGE CITADEL MONUMENT & PLAYER AVATAR
            ========================================================================= */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10">
          <div className="relative flex items-center justify-center">
            <PixelCitadelMonument />
            {/* Player Avatar Standing in Courtyard */}
            <div className="absolute bottom-1 -right-3 pointer-events-auto cursor-pointer hover:scale-110 transition-transform" title={`${character?.characterName || 'Warden'} (${profile?.title || 'Warden Initiate'})`}>
              <PixelPlayerAvatar />
            </div>
          </div>
          <div className="mt-2 rounded-full border border-yellow-500/40 bg-gray-950/80 px-3 py-0.5 text-center shadow-lg">
            <span className="font-serif text-[11px] font-bold text-yellow-300">
              The Sunforge Beacon
            </span>
          </div>
        </div>

        {/* =========================================================================
            DISTRICT BUILDINGS (8 INTERACTIVE HUBS)
            ========================================================================= */}
        {districts.map((district) => {
          const isSelected = selectedDistrict?.id === district.id;

          return (
            <div
              key={district.id}
              onClick={() => handleDistrictClick(district)}
              onDoubleClick={() => handleEnterDistrict(district.path)}
              className={`absolute group cursor-pointer transition-all duration-200 z-20 ${
                isSelected ? 'scale-110' : 'hover:scale-105'
              }`}
              style={{
                left: `${district.x}%`,
                top: `${district.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Building Sprite with Hover Glow Ring */}
              <div className="relative flex flex-col items-center">
                <div
                  className={`rounded-2xl p-2 transition-all ${
                    isSelected
                      ? 'ring-2 ring-yellow-400 bg-yellow-950/40 shadow-xl shadow-yellow-900/50'
                      : 'group-hover:bg-gray-800/40'
                  }`}
                >
                  <PixelDistrictBuilding type={district.id} />
                </div>

                {/* Building Label Badge */}
                <div className="mt-1 flex flex-col items-center">
                  <span className="rounded-lg border border-yellow-700/30 bg-gray-950/90 px-2.5 py-0.5 text-[10px] font-bold text-gray-200 group-hover:text-yellow-300 group-hover:border-yellow-500/50 transition-colors shadow-md truncate max-w-[110px]">
                    {district.name}
                  </span>
                  <span className="text-[9px] font-mono text-cyan-400 mt-0.5">
                    {district.levelSnippet}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* =========================================================================
            BOTTOM CONTEXTUAL DOCK: SELECTED DISTRICT INSPECTION & ENTER BUTTON
            ========================================================================= */}
        {selectedDistrict && (
          <div className="absolute inset-x-4 bottom-4 z-30 rounded-2xl border-2 border-yellow-700/40 bg-gray-950/95 p-4 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-2 duration-200 sm:inset-x-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedDistrict.icon}</span>
                <div>
                  <h3 className="font-serif text-base font-bold text-white sm:text-lg">
                    {selectedDistrict.name}
                  </h3>
                  <p className="text-xs text-gray-300 max-w-xl">
                    {selectedDistrict.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDistrict(null)}
                  className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleEnterDistrict(selectedDistrict.path)}
                  className="flex items-center gap-1.5 rounded-xl border border-yellow-500 bg-gradient-to-r from-yellow-500 to-amber-600 px-5 py-2 text-xs font-bold text-gray-950 shadow-lg shadow-yellow-900/50 hover:brightness-110 active:scale-95 transition"
                >
                  <span>Enter District</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
