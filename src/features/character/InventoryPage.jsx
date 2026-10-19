import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../../shared/layout/Sidebar';
import authService from '../../core/services/AuthService';
import characterService from '../../core/services/CharacterService';
import { getItemById } from '../../core/data/itemsCatalog';
import { removeItems } from '../../core/services/inventoryService';
import audioManager from '../../core/audio/AudioManager';
import ItemInspectModal from './widgets/ItemInspectModal';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

const rarityRank = {
  Common: 1,
  Uncommon: 2,
  Rare: 3,
  Epic: 4,
  Legendary: 5,
  Mythic: 6,
  Relic: 7,
};

const rarityStyles = {
  Common: 'border-gray-500/50 text-gray-300',
  Uncommon: 'border-emerald-400/50 text-emerald-200',
  Rare: 'border-sky-400/50 text-sky-200',
  Epic: 'border-fuchsia-400/50 text-fuchsia-200',
  Legendary: 'border-amber-400/50 text-amber-200',
  Mythic: 'border-rose-400/50 text-rose-200',
  Relic: 'border-yellow-400/50 text-yellow-200',
};

const VAULT_CATEGORIES = [
  { id: 'all', label: 'All Items' },
  { id: 'harvests', label: 'Harvests & Goods', match: (item) => item.type === 'seed' || item.type === 'farm-good' },
  { id: 'minerals', label: 'Ores & Minerals', match: (item) => item.type === 'ore' || item.category === 'Ore' },
  { id: 'crafted', label: 'Crafted Wares', match: (item) => item.type === 'crafted' },
  { id: 'gear', label: 'Gear & Relics', match: (item) => item.type === 'gear' || item.type === 'token' || item.type === 'consumable' },
];

const getItemValue = (item) => item?.sellPrice ?? item?.price ?? item?.estimate ?? 0;

export default function Inventory() {
  const [profile, setProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (!MOCK_AUTH) {
      return;
    }

    const username = authService.getCurrentUsername();
    const nextProfile = characterService.getMockProfile(username);
    setProfile(nextProfile);
  }, []);

  const inventory = useMemo(() => profile?.inventory || {}, [profile?.inventory]);
  const inventoryRows = useMemo(() => {
    return Object.entries(inventory)
      .map(([itemId, amount]) => {
        const item = getItemById(itemId);
        if (!item) {
          return null;
        }
        return {
          ...item,
          amount,
          value: getItemValue(item),
          rarityRank: rarityRank[item.rarity] || 0,
        };
      })
      .filter(Boolean);
  }, [inventory]);

  const totalVaultValue = useMemo(() => {
    return inventoryRows.reduce((sum, item) => sum + (item.value || 0) * (item.amount || 0), 0);
  }, [inventoryRows]);

  const totalUnits = useMemo(() => {
    return inventoryRows.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [inventoryRows]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredRows = useMemo(() => {
    const categoryConfig = VAULT_CATEGORIES.find((cat) => cat.id === activeCategory);
    return inventoryRows.filter((item) => {
      const matchesSearch = !normalizedSearch || item.name.toLowerCase().includes(normalizedSearch);
      const matchesCategory =
        !categoryConfig || categoryConfig.id === 'all' ? true : categoryConfig.match(item);
      return matchesSearch && matchesCategory;
    });
  }, [inventoryRows, normalizedSearch, activeCategory]);

  const sortedRows = useMemo(() => {
    const rows = [...filteredRows];
    rows.sort((a, b) => {
      if (sortBy === 'quantity') return (b.amount || 0) - (a.amount || 0);
      if (sortBy === 'value') return (b.value || 0) - (a.value || 0);
      if (sortBy === 'rarity') return (b.rarityRank || 0) - (a.rarityRank || 0);
      return a.name.localeCompare(b.name);
    });
    return rows;
  }, [filteredRows, sortBy]);

  const handleQuickSell = (item, quantity) => {
    if (!profile || !item) return;
    const currentOwned = profile.inventory?.[item.id] || 0;
    const sellQty = Math.min(currentOwned, quantity);
    if (sellQty <= 0) return;

    const goldEarned = (item.value || 0) * sellQty;
    const nextInventory = removeItems(profile.inventory, { [item.id]: sellQty });
    const nextGold = (profile.stats?.gold || 0) + goldEarned;

    const updated = characterService.updateMockProfile({
      inventory: nextInventory,
      stats: {
        ...profile.stats,
        gold: nextGold,
      },
    });

    setProfile(updated);
    audioManager.play('coin');
    toast.success(`Sold ${sellQty}x ${item.name} for ${goldEarned}g!`, { icon: '🪙' });

    if (currentOwned - sellQty <= 0) {
      setSelectedItem(null);
    } else {
      setSelectedItem((prev) => (prev ? { ...prev, amount: currentOwned - sellQty } : null));
    }
  };

  return (
    <section className="min-h-screen bg-page-primary dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />

      {/* Inspect Item Modal */}
      {selectedItem && (
        <ItemInspectModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onQuickSell={handleQuickSell}
        />
      )}

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 pt-24">
        <div className="rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur court-reveal glass-panel">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-yellow-700/30 pb-6">
            <div>
              <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">The Solitary Vault</p>
              <h1 className="mt-2 text-4xl font-extrabold text-white hero-title">Estate Inventory</h1>
              <p className="mt-2 max-w-2xl text-base text-gray-300">
                Central storehouse for harvests, mined ores, forged weapons, and ancient relics.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-yellow-700/40 bg-gray-950/80 px-4 py-2 text-xs">
                <span className="text-gray-400 uppercase tracking-wider block text-[10px]">Estimated Value</span>
                <span className="font-bold text-yellow-400 font-mono text-sm">{totalVaultValue}g</span>
              </div>
              <div className="rounded-xl border border-yellow-700/40 bg-gray-950/80 px-4 py-2 text-xs">
                <span className="text-gray-400 uppercase tracking-wider block text-[10px]">Total Stored</span>
                <span className="font-bold text-white font-mono text-sm">{totalUnits} units</span>
              </div>
              <Link
                to="/dashboard"
                className="inline-flex items-center rounded-xl px-4 py-2.5 text-xs font-semibold text-yellow-200 action-ghost"
              >
                Command Deck
              </Link>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mt-6 flex flex-wrap gap-2 border-b border-yellow-700/20 pb-4">
            {VAULT_CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    audioManager.play('tap');
                    setActiveCategory(cat.id);
                  }}
                  className={`min-h-[38px] rounded-xl px-4 py-1.5 text-xs font-bold transition ${
                    isSelected
                      ? 'bg-yellow-500/20 border border-yellow-500/60 text-yellow-300 shadow-md'
                      : 'border border-yellow-700/30 text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Filter & Sort Controls */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-yellow-700/20 bg-gray-950/60 p-4">
            <div className="w-full sm:w-auto flex-1 max-w-md">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search vault items..."
                className="w-full rounded-xl border border-yellow-700/40 bg-gray-900/80 px-4 py-2 text-xs text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Sort By</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-yellow-700/40 bg-gray-900/80 px-3 py-2 text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="name">Item Name</option>
                <option value="quantity">Quantity</option>
                <option value="value">Unit Value</option>
                <option value="rarity">Rarity Rank</option>
              </select>
            </div>
          </div>

          {/* Item Grid */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedRows.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-yellow-700/20 bg-gray-950/70 p-12 text-center text-sm text-gray-400">
                <p className="text-2xl mb-2">📦</p>
                <p className="text-white font-bold">No vault items found.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Mine ores, tend crops, or forge wares to stock your estate reserves.
                </p>
              </div>
            ) : (
              sortedRows.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    audioManager.play('tap');
                    setSelectedItem(item);
                  }}
                  className="court-card group flex items-start gap-3.5 rounded-2xl border border-yellow-700/30 bg-gray-950/85 p-4 transition-all duration-300 hover:border-yellow-500/60 hover-lift cursor-pointer shadow"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-yellow-700/40 bg-gray-900 shadow">
                    <img
                      src={item.image || '/raceicon/noimage.webp'}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/raceicon/noimage.webp';
                      }}
                    />
                    <span className="absolute bottom-0 right-0 rounded-tl-md bg-gray-950/90 px-1.5 py-0.5 text-[10px] font-mono font-bold text-yellow-300 border-t border-l border-yellow-700/30">
                      x{item.amount}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-sm font-bold text-white truncate group-hover:text-yellow-300 transition">
                        {item.name}
                      </h3>
                      {item.rarity && (
                        <span
                          className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            rarityStyles[item.rarity] || rarityStyles.Common
                          }`}
                        >
                          {item.rarity}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-[11px] text-gray-400 line-clamp-1 italic">
                      {item.description || item.category || 'Estate commodity'}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-yellow-700/20 pt-2 text-xs">
                      <span className="font-mono text-yellow-400 font-semibold">
                        {item.value}g <span className="text-[10px] text-gray-400 font-normal">/ unit</span>
                      </span>
                      <span className="text-[10px] font-bold text-yellow-500/80 group-hover:text-yellow-300 transition">
                        Inspect →
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Navigation */}
          <div className="mt-10 flex flex-wrap gap-4 border-t border-yellow-700/20 pt-6">
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white action-primary"
            >
              Command Deck
            </Link>
            <Link
              to="/market"
              className="inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold text-yellow-200 action-ghost"
            >
              The Grand Bazaar
            </Link>
            <Link
              to="/workshop"
              className="inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold text-yellow-200 action-ghost"
            >
              Artisan Workshop
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
