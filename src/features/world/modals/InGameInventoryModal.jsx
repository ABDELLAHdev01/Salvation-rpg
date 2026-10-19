import React, { useState } from 'react';
import { getItemById } from '../../../core/data/itemsCatalog';
import audioManager from '../../../core/audio/AudioManager';

export default function InGameInventoryModal({
  isOpen,
  onClose,
  inventory = {},
  gold = 0,
  onUseItem = () => {},
}) {
  const [filter, setFilter] = useState('all');

  if (!isOpen) return null;

  const items = Object.entries(inventory)
    .filter(([, count]) => Number(count) > 0)
    .map(([itemId, count]) => {
      const item = getItemById(itemId) || {
        id: itemId,
        name: itemId.replace(/[-_]/g, ' '),
        category: 'Resource',
        sellPrice: 10,
        description: 'An adventurer resource collected in the world.',
      };
      return { ...item, count: Number(count) };
    });

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'potions') return item.id.includes('potion') || item.id.includes('elixir');
    if (filter === 'crops') return item.id.includes('turnip') || item.id.includes('wheat') || item.id.includes('herb') || item.id.includes('berry') || item.id.includes('root') || item.id.includes('seed');
    if (filter === 'ores') return item.id.includes('iron') || item.id.includes('copper') || item.id.includes('gold') || item.id.includes('geode') || item.id.includes('crystal') || item.id.includes('bar');
    return true;
  });

  const getItemIcon = (id) => {
    if (id.includes('potion') || id.includes('elixir')) return '🧪';
    if (id.includes('iron-bar') || id.includes('copper-bar') || id.includes('gold-bar')) return '🧱';
    if (id.includes('iron')) return '⚙️';
    if (id.includes('copper')) return '🪨';
    if (id.includes('gold')) return '🪙';
    if (id.includes('crystal') || id.includes('geode')) return '💎';
    if (id.includes('seed')) return '🌱';
    if (id.includes('turnip')) return '🥔';
    if (id.includes('wheat')) return '🌾';
    if (id.includes('herb')) return '🌿';
    if (id.includes('berry')) return '🍇';
    if (id.includes('root')) return '🥕';
    if (id.includes('sword')) return '⚔️';
    if (id.includes('axe') || id.includes('pickaxe')) return '⛏️';
    return '📦';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-2xl rounded-3xl border-2 border-yellow-600/70 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-6 shadow-2xl shadow-yellow-950/50">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-yellow-700/40 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎒</span>
            <div>
              <h2 className="font-serif text-lg font-bold text-yellow-300 tracking-wide sm:text-xl">
                Adventurer&apos;s Vault Pouch
              </h2>
              <p className="text-xs text-gray-400">
                In-World Resource Storage · {items.length} Unique Item Slots
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-xl border border-yellow-600/40 bg-yellow-950/60 px-3 py-1 font-mono text-xs font-bold text-yellow-300">
              <span>🪙</span>
              <span>{gold} Gold</span>
            </div>
            <button
              type="button"
              onClick={() => {
                audioManager.play('tap');
                onClose();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-yellow-700/40 bg-gray-900 text-gray-400 hover:text-white transition"
              title="Close [Esc]"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'potions', label: '🧪 Elixirs' },
            { id: 'crops', label: '🌾 Harvest & Seeds' },
            { id: 'ores', label: '⛏️ Ores & Ingots' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                audioManager.play('tap');
                setFilter(cat.id);
              }}
              className={`rounded-xl px-3 py-1 text-xs font-bold transition ${
                filter === cat.id
                  ? 'border border-yellow-400 bg-yellow-500/20 text-yellow-200 shadow'
                  : 'border border-yellow-700/20 bg-gray-900/60 text-gray-400 hover:text-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Item Grid */}
        <div className="mt-4 max-h-[380px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              No items in this category. Mine cavern seams or harvest crops to gather resources!
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-yellow-700/30 bg-gray-900/70 p-3 hover:border-yellow-500/50 transition backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-yellow-700/40 bg-black/60 text-2xl shadow-inner">
                    {getItemIcon(item.id)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white capitalize">{item.name}</h4>
                    <p className="text-[11px] text-gray-400">{item.description || item.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {(item.id.includes('potion') || item.id.includes('elixir')) && (
                    <button
                      type="button"
                      onClick={() => onUseItem(item.id)}
                      className="rounded-xl border border-emerald-500/40 bg-emerald-950/70 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-900 transition active:scale-95"
                    >
                      Drink (+45 HP)
                    </button>
                  )}
                  <div className="text-right">
                    <span className="font-mono text-base font-bold text-yellow-300">
                      ×{item.count}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-yellow-700/40 pt-4 text-xs text-gray-400">
          <span>Press <kbd className="rounded border border-gray-700 bg-gray-800 px-1 font-mono text-yellow-300">Esc</kbd> or <kbd className="rounded border border-gray-700 bg-gray-800 px-1 font-mono text-yellow-300">I</kbd> to close</span>
          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              onClose();
            }}
            className="rounded-xl bg-yellow-500 px-5 py-2 font-serif text-xs font-bold text-black hover:bg-yellow-400 transition shadow"
          >
            Back to Realm
          </button>
        </div>
      </div>
    </div>
  );
}
