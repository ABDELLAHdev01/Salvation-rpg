import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getPlayerEquippedGear, getGearStatTotals } from '../../../core/data/gearData';

const slotIcons = {
  weapon: '⚔️',
  shield: '🛡️',
  armor: '🥋',
  boots: '🥾',
  relic: '📜',
  trinket: '🔮',
};

const slotPlaceholders = [
  { slot: 'weapon', label: 'Main Hand' },
  { slot: 'shield', label: 'Offhand' },
  { slot: 'armor', label: 'Chest Armor' },
  { slot: 'boots', label: 'Greaves' },
  { slot: 'relic', label: 'Relic / Sigil' },
];

export default function PaperDollDeck({ profile, character }) {
  const equippedGear = useMemo(() => getPlayerEquippedGear(profile), [profile]);
  const gearTotals = useMemo(() => getGearStatTotals(profile), [profile]);

  const avatarUrl = character?.avatarUrl || profile?.avatarUrl || '/raceicon/noimage.webp';
  const characterName = character?.name || profile?.username || 'Warden';
  const characterClass = character?.className || 'Vanguard';
  const playerLevel = profile?.stats?.level ?? 1;

  // Map equipped items by slot
  const gearBySlot = useMemo(() => {
    return equippedGear.reduce((acc, item) => {
      acc[item.slot] = item;
      return acc;
    }, {});
  }, [equippedGear]);

  return (
    <div className="rounded-2xl border border-yellow-700/30 bg-gray-950/80 p-5 shadow-xl backdrop-blur flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-yellow-700/20 pb-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-yellow-500">
              Warden Silhouette
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">{characterName}</h2>
            <p className="text-xs text-gray-400 font-mono">
              Level {playerLevel} · {characterClass}
            </p>
          </div>
          <Link
            to="/character/edit"
            className="text-[11px] font-semibold text-yellow-400 hover:text-yellow-300 underline"
          >
            Edit
          </Link>
        </div>

        {/* Paper Doll Silhouette Frame */}
        <div className="relative mt-4 mx-auto w-40 h-44 rounded-xl border border-yellow-700/40 bg-gray-900/90 overflow-hidden shadow-inner group">
          <img
            src={avatarUrl}
            alt="Character silhouette"
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/raceicon/noimage.webp';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Total Stat Aggregate Bar */}
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-yellow-700/20 bg-gray-900/60 p-2.5 text-center">
          <div>
            <span className="text-[10px] uppercase text-gray-400 font-semibold block">Attack</span>
            <span className="text-xs font-mono font-bold text-amber-400">+{gearTotals.attack}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-gray-400 font-semibold block">Defense</span>
            <span className="text-xs font-mono font-bold text-sky-400">+{gearTotals.defense}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-gray-400 font-semibold block">Wisdom</span>
            <span className="text-xs font-mono font-bold text-emerald-400">+{gearTotals.wisdom}</span>
          </div>
        </div>

        {/* 5 Paper Doll Equipment Slots */}
        <div className="mt-4 space-y-2">
          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
            Active Gear Slots
          </p>
          {slotPlaceholders.map(({ slot, label }) => {
            const item = gearBySlot[slot] || (slot === 'relic' ? gearBySlot['trinket'] : null);
            return (
              <div
                key={slot}
                className="flex items-center justify-between rounded-xl border border-yellow-700/20 bg-gray-900/70 px-3 py-2 text-xs transition-colors hover:border-yellow-600/40"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm shrink-0">{slotIcons[slot] || '🛡️'}</span>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
                      {label}
                    </span>
                    <span className="font-bold text-white text-xs">
                      {item ? item.name : 'Empty Slot'}
                    </span>
                  </div>
                </div>
                {item ? (
                  <span className="text-[10px] text-yellow-300 font-mono font-semibold">
                    {item.attack ? `+${item.attack}A ` : ''}
                    {item.defense ? `+${item.defense}D ` : ''}
                    {item.wisdom ? `+${item.wisdom}W` : ''}
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-500 font-mono">None</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-yellow-700/20">
        <Link
          to="/arena/fight"
          className="w-full flex items-center justify-center rounded-xl bg-yellow-500/20 border border-yellow-500/50 hover:bg-yellow-500/30 py-2 text-xs font-bold text-yellow-300 transition-colors"
        >
          Enter Colosseum
        </Link>
      </div>
    </div>
  );
}
