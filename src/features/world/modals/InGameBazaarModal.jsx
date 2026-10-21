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
      <div className="rpg-panel-brown relative w-full max-w-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/50 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl drop-shadow">🏛️</span>
            <div>
              <h2 className="font-serif text-lg font-bold text-amber-100 tracking-wide sm:text-xl drop-shadow">
                Merchant Bazaar Trading Post
              </h2>
              <p className="text-xs text-amber-300/70">
                Purchase farm seeds and trade harvested goods for imperial gold
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
            className={`${tab === 'buy' ? 'rpg-btn-beige active' : 'rpg-btn-brown'} text-xs py-1 px-4`}
          >
            🌱 Buy Farm Seeds
          </button>
          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              setTab('sell');
            }}
            className={`${tab === 'sell' ? 'rpg-btn-beige active' : 'rpg-btn-brown'} text-xs py-1 px-4`}
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
                className="rpg-slot-inset flex items-center justify-between p-2.5 bg-stone-950/70 hover:brightness-110 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded bg-black/60 border border-amber-900/60 p-1.5 shadow-inner">
                    <img src={getItemIcon(`seed-${crop.id}`)} alt={crop.name} className="h-8 w-8 object-contain pixelated drop-shadow-md" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-amber-100">{crop.name} Seeds</h4>
                    <p className="text-[11px] text-amber-300/70">
                      Matures in {Math.round(crop.growMs / 60000)}m · Yields ~{crop.yieldAmount} crops
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-amber-300">
                    🪙 {crop.seedCost}g
                  </span>
                  <button
                    type="button"
                    disabled={gold < crop.seedCost}
                    onClick={() => handleBuySeed(crop)}
                    className={`${
                      gold >= crop.seedCost
                        ? 'rpg-btn-beige'
                        : 'rpg-btn-brown opacity-60 cursor-not-allowed'
                    } text-xs py-1 px-3.5`}
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
                  className="rpg-slot-inset flex items-center justify-between p-2.5 bg-stone-950/70 hover:brightness-110 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded bg-black/60 border border-amber-900/60 p-1.5 shadow-inner">
                      <img src={getItemIcon(item.id)} alt={item.name} className="h-8 w-8 object-contain pixelated drop-shadow-md" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-amber-100">{item.name}</h4>
                      <p className="text-[11px] text-amber-300/70">
                        Pouch Stock: <span className="font-mono font-bold text-amber-300">{owned}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-amber-300">
                      +{item.price}g
                    </span>
                    <button
                      type="button"
                      disabled={owned <= 0}
                      onClick={() => handleSellItem(item)}
                      className={`${
                        owned > 0
                          ? 'rpg-btn-beige'
                          : 'rpg-btn-brown opacity-60 cursor-not-allowed'
                      } text-xs py-1 px-3.5`}
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
        <div className="mt-5 flex items-center justify-between border-t border-amber-900/50 pt-4 text-xs text-amber-300/70">
          <span>Stalls active at Valorian Bazaar</span>
          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              onClose();
            }}
            className="rpg-btn-brown text-xs py-1.5 px-4"
          >
            Back to Realm
          </button>
        </div>
      </div>
    </div>
  );
}
