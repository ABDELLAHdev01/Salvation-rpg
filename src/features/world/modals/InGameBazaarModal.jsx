import React, { useState } from 'react';
import toast from 'react-hot-toast';
import audioManager from '../../../core/audio/AudioManager';
import characterService from '../../../core/services/CharacterService';
import { addItems, removeItems } from '../../../core/services/inventoryService';
import { farmCrops } from '../../../core/data/farmData';
import { getItemIcon } from '../../../core/data/itemIcons';

const SELLABLE_GOODS = [
  { id: 'turnip', name: 'Turnip', price: 18, icon: '🥔' },
  { id: 'wheat', name: 'Golden Wheat', price: 24, icon: '🌾' },
  { id: 'herb', name: 'Herbal Leaf', price: 35, icon: '🌿' },
  { id: 'moonberry', name: 'Moonberry', price: 55, icon: '🍇' },
  { id: 'sunroot', name: 'Sunroot', price: 75, icon: '🥕' },
  { id: 'iron', name: 'Raw Iron Ore', price: 12, icon: '⚙️' },
  { id: 'copper', name: 'Raw Copper Ore', price: 15, icon: '🪨' },
  { id: 'gold', name: 'Raw Gold Ore', price: 40, icon: '🪙' },
  { id: 'mystery-geode', name: 'Uncut Geode', price: 65, icon: '💎' },
  { id: 'iron-bar', name: 'Smelted Iron Bar', price: 45, icon: '🧱' },
];

export default function InGameBazaarModal({
  isOpen,
  onClose,
  profile,
  onProfileUpdate = () => {},
}) {
  const [tab, setTab] = useState('buy'); // 'buy' | 'sell'

  if (!isOpen) return null;

  const gold = profile?.stats?.gold ?? 0;
  const inventory = profile?.inventory || {};

  const handleBuySeed = (crop) => {
    if (gold < crop.seedCost) {
      toast.error('Not enough gold to purchase seeds.');
      return;
    }

    audioManager.play('coin');
    const seedId = `seed-${crop.id}`;
    const nextInv = addItems(inventory, { [seedId]: 1 });
    const nextGold = gold - crop.seedCost;

    const updated = characterService.updateMockProfile({
      inventory: nextInv,
      stats: {
        ...(profile?.stats || {}),
        gold: nextGold,
      },
    });

    onProfileUpdate(updated);
    toast.success(`Purchased 1 ${crop.name} Seed! (-${crop.seedCost}g)`, { icon: '🌱' });
  };

  const handleSellItem = (item) => {
    const owned = inventory[item.id] || 0;
    if (owned <= 0) {
      toast.error(`No ${item.name} in inventory to sell.`);
      return;
    }

    audioManager.play('coin');
    const nextInv = removeItems(inventory, { [item.id]: 1 });
    const nextGold = gold + item.price;

    const updated = characterService.updateMockProfile({
      inventory: nextInv,
      stats: {
        ...(profile?.stats || {}),
        gold: nextGold,
      },
    });

    onProfileUpdate(updated);
    toast.success(`Sold 1 ${item.name} for ${item.price}g!`, { icon: '🪙' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-2xl rounded-3xl border-2 border-yellow-600/70 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-6 shadow-2xl shadow-yellow-950/50">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-yellow-700/40 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏛️</span>
            <div>
              <h2 className="font-serif text-lg font-bold text-yellow-300 tracking-wide sm:text-xl">
                Merchant Bazaar Trading Post
              </h2>
              <p className="text-xs text-gray-400">
                Purchase farm seeds and trade harvested goods for imperial gold
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
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              setTab('buy');
            }}
            className={`rounded-xl px-4 py-1.5 text-xs font-bold transition ${
              tab === 'buy'
                ? 'border border-yellow-400 bg-yellow-500/20 text-yellow-200 shadow'
                : 'border border-yellow-700/20 bg-gray-900/60 text-gray-400 hover:text-white'
            }`}
          >
            🌱 Buy Farm Seeds
          </button>
          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              setTab('sell');
            }}
            className={`rounded-xl px-4 py-1.5 text-xs font-bold transition ${
              tab === 'sell'
                ? 'border border-yellow-400 bg-yellow-500/20 text-yellow-200 shadow'
                : 'border border-yellow-700/20 bg-gray-900/60 text-gray-400 hover:text-white'
            }`}
          >
            🪙 Sell Crops &amp; Minerals
          </button>
        </div>

        {/* Listing */}
        <div className="mt-4 max-h-[360px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {tab === 'buy' ? (
            farmCrops.map((crop) => (
              <div
                key={crop.id}
                className="flex items-center justify-between rounded-2xl border border-yellow-700/30 bg-gray-900/70 p-3 hover:border-yellow-500/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-yellow-700/40 bg-black/50 p-1.5 shadow-inner">
                    <img src={getItemIcon(`seed-${crop.id}`)} alt={crop.name} className="h-8 w-8 object-contain pixelated drop-shadow-md" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-white">{crop.name} Seeds</h4>
                    <p className="text-[11px] text-gray-400">
                      Matures in {Math.round(crop.growMs / 60000)}m · Yields ~{crop.yieldAmount} crops
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-yellow-300">
                    🪙 {crop.seedCost}g
                  </span>
                  <button
                    type="button"
                    disabled={gold < crop.seedCost}
                    onClick={() => handleBuySeed(crop)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition active:scale-95 ${
                      gold >= crop.seedCost
                        ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-60'
                    }`}
                  >
                    Buy 1
                  </button>
                </div>
              </div>
            ))
          ) : (
            SELLABLE_GOODS.map((item) => {
              const owned = inventory[item.id] || 0;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-yellow-700/30 bg-gray-900/70 p-3 hover:border-yellow-500/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-yellow-700/40 bg-black/50 p-1.5 shadow-inner">
                      <img src={getItemIcon(item.id)} alt={item.name} className="h-8 w-8 object-contain pixelated drop-shadow-md" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-white">{item.name}</h4>
                      <p className="text-[11px] text-gray-400">
                        Pouch Stock: <span className="font-mono font-bold text-yellow-300">{owned}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-yellow-300">
                      +{item.price}g
                    </span>
                    <button
                      type="button"
                      disabled={owned <= 0}
                      onClick={() => handleSellItem(item)}
                      className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition active:scale-95 ${
                        owned > 0
                          ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow'
                          : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-60'
                      }`}
                    >
                      Sell 1
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-yellow-700/40 pt-4 text-xs text-gray-400">
          <span>Stalls active at Valorian Bazaar</span>
          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              onClose();
            }}
            className="rounded-xl bg-gray-900 border border-yellow-700/30 px-4 py-2 font-serif text-xs font-bold text-yellow-300 hover:text-white transition"
          >
            Back to Realm
          </button>
        </div>
      </div>
    </div>
  );
}
