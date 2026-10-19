import React, { useState } from 'react';
import audioManager from '../../core/audio/AudioManager';
import { estateAmenities, housingTiers } from '../../core/data/housingData';

export default function HousingWorldView({
  profile = null,
  activeHouse = null,
  ownedHouses = [],
  gold = 0,
  level = 1,
  onSetActiveHouse = () => {},
  onPurchaseAmenity = () => {},
  className = '',
}) {
  const [selectedAmenityId, setSelectedAmenityId] = useState('hearth-fire');
  const [showResidenceSelector, setShowResidenceSelector] = useState(false);

  const ownedAmenities = Array.isArray(profile?.estateAmenities) ? profile.estateAmenities : [];

  // Spatial arrangement of interior furnishings inside the manor hall
  const amenityLayouts = {
    'hearth-fire': { x: 50, y: 32, label: 'Grand Hearth', icon: '🔥', glow: '#f97316' },
    'delvers-trophy': { x: 74, y: 28, label: "Delver's Horn", icon: '⛏️', glow: '#eab308' },
    'herbalist-drying-rack': { x: 26, y: 28, label: 'Herb Dry-Rack', icon: '🌿', glow: '#22c55e' },
    'training-dummy': { x: 18, y: 70, label: 'Practice Dummy', icon: '⚔️', glow: '#ef4444' },
    'scrying-lectern': { x: 82, y: 70, label: 'Runemaster Desk', icon: '📜', glow: '#a855f7' },
    'vault-coffer': { x: 50, y: 76, label: 'Vault Coffer', icon: '💰', glow: '#eab308' },
  };

  const selectedAmenity = estateAmenities.find((a) => a.id === selectedAmenityId) || estateAmenities[0];
  const isSelectedOwned = ownedAmenities.includes(selectedAmenity.id);

  const handleSelectAmenity = (id) => {
    audioManager.play('tap');
    setSelectedAmenityId(id);
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-3xl border-2 border-yellow-800/40 bg-[#140e0b] shadow-2xl ${className}`}>
      {/* 2D Manor Interior Hall Canvas */}
      <div className="relative min-h-[640px] w-full p-4 sm:p-6 select-none bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#3a2014] via-[#21120b] to-[#120804]">
        {/* Parquet Timber Floor Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#572c1520_1px,transparent_1px),linear-gradient(to_bottom,#572c1520_1px,transparent_1px)] bg-[size:44px_44px] pointer-events-none" />

        {/* Ambient Warm Hearth Radiance */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-orange-600/20 blur-3xl pointer-events-none" />

        {/* Heraldic Residence Banner at Top Center */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              setShowResidenceSelector((prev) => !prev);
            }}
            className="flex items-center gap-2 rounded-2xl border border-yellow-600/50 bg-gray-950/90 px-4 py-1.5 shadow-xl hover:border-yellow-400 hover:scale-105 transition"
            title="Click to view and switch active residence"
          >
            <span className="text-base">🏰</span>
            <div className="text-left">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-yellow-400/80">
                Residence Tier
              </span>
              <span className="font-serif text-xs font-bold text-white">
                {activeHouse?.name || 'Warden Manor'}
              </span>
            </div>
            <span className="text-[10px] text-yellow-300">▼</span>
          </button>
        </div>

        {/* =========================================================================
            6 INTERACTIVE ESTATE AMENITIES
            ========================================================================= */}
        {estateAmenities.map((amenity) => {
          const layout = amenityLayouts[amenity.id] || { x: 50, y: 50, label: amenity.name, icon: '🛋️', glow: '#f59e0b' };
          const isOwned = ownedAmenities.includes(amenity.id);
          const isSelected = selectedAmenity?.id === amenity.id;

          return (
            <div
              key={amenity.id}
              onClick={() => handleSelectAmenity(amenity.id)}
              className={`absolute cursor-pointer transition-all duration-200 z-20 ${
                isSelected ? 'scale-108' : 'hover:scale-103'
              }`}
              style={{
                left: `${layout.x}%`,
                top: `${layout.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 p-3.5 transition-all ${
                  isSelected
                    ? 'border-yellow-400 bg-gray-900/90 shadow-2xl ring-2 ring-yellow-400/50'
                    : isOwned
                    ? 'border-yellow-700/60 bg-amber-950/40 shadow-lg'
                    : 'border-gray-800/60 bg-gray-950/40 opacity-40 hover:opacity-75'
                } w-38 h-32 sm:w-44 sm:h-36`}
                style={{
                  boxShadow: isOwned ? `0 0 20px ${layout.glow}30` : undefined,
                }}
              >
                {/* Amenity Plaque */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-yellow-700/50 bg-gray-950/90 px-2 py-0.5 shadow-md truncate max-w-[130px]">
                  <span className="font-serif text-[10px] font-bold text-yellow-300">
                    {layout.label}
                  </span>
                </div>

                {/* Amenity Icon Graphic */}
                <div className="relative flex flex-col items-center">
                  <span className={`text-3xl select-none filter drop-shadow ${isOwned && amenity.id === 'hearth-fire' ? 'animate-pulse' : ''}`}>
                    {layout.icon}
                  </span>

                  {/* Status Pill */}
                  <div className="mt-2 text-center">
                    {isOwned ? (
                      <span className="rounded-full bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800/40">
                        Active Furnishing
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[9px] font-mono text-gray-400">
                        Blueprint · {amenity.price}g
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* =========================================================================
            RESIDENCE SELECTOR MODAL / FLYOUT
            ========================================================================= */}
        {showResidenceSelector && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-lg rounded-2xl border-2 border-yellow-600/60 bg-gray-950/95 p-4 shadow-2xl backdrop-blur animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h4 className="font-serif text-sm font-bold text-yellow-300">
                Choose Active Residence
              </h4>
              <button
                type="button"
                onClick={() => setShowResidenceSelector(false)}
                className="text-xs text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="mt-3 grid gap-2 max-h-60 overflow-y-auto">
              {housingTiers.map((tier) => {
                const isOwned = ownedHouses.includes(tier.id);
                const isActive = activeHouse?.id === tier.id;
                return (
                  <div
                    key={tier.id}
                    className={`flex items-center justify-between rounded-xl border p-2.5 text-xs transition ${
                      isActive
                        ? 'border-yellow-400 bg-yellow-950/30'
                        : isOwned
                        ? 'border-gray-800 bg-gray-900/60 hover:border-yellow-700/50'
                        : 'border-gray-900 bg-gray-950/40 opacity-50'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-white">{tier.name}</p>
                      <p className="text-[11px] text-gray-400">{tier.effect?.name}: +{tier.effect?.percent}% {tier.effect?.stat}</p>
                    </div>
                    {isOwned ? (
                      <button
                        type="button"
                        onClick={() => {
                          onSetActiveHouse(tier.id);
                          setShowResidenceSelector(false);
                        }}
                        disabled={isActive}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                          isActive
                            ? 'bg-yellow-500/20 text-yellow-300 cursor-default'
                            : 'bg-yellow-500 text-gray-950 hover:brightness-110'
                        }`}
                      >
                        {isActive ? 'Active' : 'Equip'}
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-500">Unowned</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            BOTTOM CONTEXTUAL DOCK: SELECTED AMENITY PERKS & COMMISSION BUTTON
            ========================================================================= */}
        {selectedAmenity && (
          <div className="absolute inset-x-4 bottom-4 z-30 rounded-2xl border-2 border-yellow-700/50 bg-gray-950/95 p-4 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-2 duration-200 sm:inset-x-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedAmenity.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-base font-bold text-white sm:text-lg">
                      {selectedAmenity.name}
                    </h3>
                    <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-[10px] font-bold text-yellow-300">
                      {selectedAmenity.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 max-w-lg mt-0.5">
                    {selectedAmenity.description}
                  </p>
                  <p className="text-xs font-bold text-emerald-400 mt-1">
                    Passive Buff: {selectedAmenity.buff}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isSelectedOwned ? (
                  <span className="flex items-center gap-1.5 rounded-xl border border-emerald-500/50 bg-emerald-950/60 px-4 py-2 text-xs font-bold text-emerald-300">
                    <span>✓</span>
                    <span>Furnished in Manor</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onPurchaseAmenity(selectedAmenity)}
                    disabled={level < selectedAmenity.levelRequired || gold < selectedAmenity.price}
                    className="flex items-center gap-1.5 rounded-xl border border-amber-500 bg-gradient-to-r from-amber-500 to-yellow-600 px-4 py-2 text-xs font-bold text-gray-950 shadow-lg shadow-amber-950/50 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-95"
                  >
                    <span>🔨</span>
                    <span>Commission ({selectedAmenity.price}g · Lvl {selectedAmenity.levelRequired})</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedAmenityId(null)}
                  className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
