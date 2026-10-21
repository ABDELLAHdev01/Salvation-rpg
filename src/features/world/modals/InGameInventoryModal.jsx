import React, { useState } from 'react';
import { getItemById } from '../../../core/data/itemsCatalog';
import { getItemIcon } from '../../../core/data/itemIcons';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn select-none">
      <div className="rpg-panel-brown relative w-full max-w-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/50 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl drop-shadow">🎒</span>
            <div>
              <h2 className="font-serif text-lg font-bold text-amber-100 tracking-wide sm:text-xl drop-shadow">
                Adventurer&apos;s Vault Pouch
              </h2>
              <p className="text-xs text-amber-300/70">
                In-World Resource Storage · {items.length} Unique Item Slots
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rpg-slot-inset flex items-center gap-1.5 px-3 py-1 font-mono text-xs font-bold text-amber-300 bg-stone-950/80">
              <span>🪙</span>
              <span>{gold} Gold</span>
            </div>
            <button
              type="button"
              onClick={() => {
                audioManager.play('tap');
                onClose();
              }}
              className="rpg-btn-square-brown h-8 w-8 text-xs font-bold text-amber-200"
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
              className={`${
                filter === cat.id ? 'rpg-btn-beige active' : 'rpg-btn-brown'
              } text-xs py-1 px-3`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Item Grid */}
        <div className="mt-4 max-h-[380px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-amber-200/60 font-serif">
              No items in this category. Mine cavern seams or harvest crops to gather resources!
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="rpg-slot-inset flex items-center justify-between p-2.5 bg-stone-950/70 hover:brightness-110 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded bg-black/60 border border-amber-900/60 p-1.5 shadow-inner">
                    <img
                      src={getItemIcon(item.id)}
                      alt={item.name}
                      className="h-8 w-8 object-contain pixelated drop-shadow-md"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-amber-100 capitalize">{item.name}</h4>
                    <p className="text-[11px] text-amber-300/70">{item.description || item.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {(item.id.includes('potion') || item.id.includes('elixir')) && (
                    <button
                      type="button"
                      onClick={() => onUseItem(item.id)}
                      className="rpg-btn-beige text-xs py-1 px-3"
                    >
                      Drink (+45 HP)
                    </button>
                  )}
                  <div className="text-right">
                    <span className="font-mono text-base font-bold text-amber-300 drop-shadow">
                      ×{item.count}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-amber-900/50 pt-4 text-xs text-amber-300/80">
          <span>Press <kbd className="rounded border border-amber-900/80 bg-stone-900 px-1 font-mono text-amber-300">Esc</kbd> or <kbd className="rounded border border-amber-900/80 bg-stone-900 px-1 font-mono text-amber-300">I</kbd> to close</span>
          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              onClose();
            }}
            className="rpg-btn-beige text-xs py-1.5 px-5 font-serif font-bold text-amber-950"
          >
            Back to Realm
          </button>
        </div>
      </div>
    </div>
  );
}
