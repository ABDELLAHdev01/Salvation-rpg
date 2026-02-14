import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../shared/layout/Sidebar';
import authService from '../../core/services/AuthService';
import characterService from '../../core/services/CharacterService';
import { getItemById } from '../../core/data/itemsCatalog';

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

const getItemValue = (item) => item?.sellPrice ?? item?.price ?? item?.estimate ?? 0;

export default function Inventory() {
  const [profile, setProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');

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

  const categories = useMemo(() => {
    const unique = new Set(inventoryRows.map((item) => item.category || 'Misc'));
    return ['All', ...Array.from(unique)];
  }, [inventoryRows]);

  const types = useMemo(() => {
    const unique = new Set(inventoryRows.map((item) => item.type || 'misc'));
    return ['All', ...Array.from(unique)];
  }, [inventoryRows]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredRows = useMemo(() => {
    return inventoryRows.filter((item) => {
      const matchesSearch = !normalizedSearch || item.name.toLowerCase().includes(normalizedSearch);
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      const matchesType = typeFilter === 'All' || item.type === typeFilter;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [inventoryRows, normalizedSearch, categoryFilter, typeFilter]);

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

  const totalItems = sortedRows.reduce((sum, item) => sum + (item.amount || 0), 0);
  const debugCounts = useMemo(() => {
    const byType = {};
    const byCategory = {};

    inventoryRows.forEach((item) => {
      const type = item.type || 'misc';
      const category = item.category || 'Misc';
      byType[type] = (byType[type] || 0) + (item.amount || 0);
      byCategory[category] = (byCategory[category] || 0) + (item.amount || 0);
    });

    return {
      byType,
      byCategory,
    };
  }, [inventoryRows]);

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm.jpg')] bg-gray-900 bg-blend-multiply dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 pt-24">
        <div className="rounded-2xl p-6 shadow-xl backdrop-blur court-reveal glass-panel">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">Vault Ledger</p>
              <h1 className="mt-3 text-4xl font-extrabold text-white hero-title">Inventory</h1>
              <p className="mt-3 text-base text-gray-300">
                One global vault for ores, harvests, crafted wares, and relic gear.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-300">
              <span className="court-chip rounded-full px-3 py-1">Unique: {sortedRows.length}</span>
              <span className="court-chip rounded-full px-3 py-1">Total: {totalItems}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-yellow-700/30 bg-gray-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Filters</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-xs text-gray-300">
                  Search
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Item name"
                    className="mt-2 w-full rounded-lg border border-yellow-700/30 bg-gray-950/70 px-3 py-2 text-xs text-gray-100"
                  />
                </label>
                <label className="text-xs text-gray-300">
                  Category
                  <select
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-yellow-700/30 bg-gray-950/70 px-3 py-2 text-xs text-gray-100"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category} className="text-gray-900">
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-gray-300">
                  Type
                  <select
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-yellow-700/30 bg-gray-950/70 px-3 py-2 text-xs text-gray-100"
                  >
                    {types.map((type) => (
                      <option key={type} value={type} className="text-gray-900">
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-gray-300">
                  Sort
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-yellow-700/30 bg-gray-950/70 px-3 py-2 text-xs text-gray-100"
                  >
                    <option value="name" className="text-gray-900">Name</option>
                    <option value="quantity" className="text-gray-900">Quantity</option>
                    <option value="value" className="text-gray-900">Value</option>
                    <option value="rarity" className="text-gray-900">Rarity</option>
                  </select>
                </label>
              </div>
              <details className="mt-4 rounded-xl border border-yellow-700/20 bg-gray-950/70 px-3 py-2 text-xs text-gray-300">
                <summary className="cursor-pointer text-yellow-200">Inventory debug</summary>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">By Type</p>
                    <div className="mt-2 space-y-1">
                      {Object.entries(debugCounts.byType).map(([type, amount]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span>{type}</span>
                          <span className="text-yellow-200">{amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">By Category</p>
                    <div className="mt-2 space-y-1">
                      {Object.entries(debugCounts.byCategory).map(([category, amount]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span>{category}</span>
                          <span className="text-yellow-200">{amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </details>
            </div>

            <div className="image-panel image-panel-inventory ornament-frame p-4">
              <div className="image-panel-content">
                <p className="text-xs uppercase tracking-[0.3em] text-yellow-300">Catalog</p>
                <p className="mt-2 text-lg font-semibold text-white">Unified Inventory</p>
                <p className="mt-2 text-sm text-gray-300">
                  Every system deposits here. Crafted items, crops, ores, and relics now share one vault.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {sortedRows.length === 0 ? (
              <div className="rounded-xl border border-yellow-700/20 bg-gray-950/70 p-6 text-sm text-gray-300">
                Inventory is empty. Mine, farm, or craft to stock the vault.
              </div>
            ) : (
              sortedRows.map((item) => (
                <div
                  key={item.id}
                  className="court-card rounded-xl p-4 hover-lift"
                  title={`${item.name} · ${item.category || 'Misc'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-xl border border-yellow-700/30 bg-gray-950/70">
                      <img
                        src={item.image || '/raceicon/noimage.jpg'}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.target.onerror = null;
                          event.target.src = '/raceicon/noimage.jpg';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-xl font-semibold text-white">{item.name}</h2>
                        <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-200">
                          x{item.amount}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-300">
                        <span className="rounded-full border border-yellow-700/30 px-3 py-1">
                          {item.category || 'Misc'}
                        </span>
                        <span className="rounded-full border border-yellow-700/30 px-3 py-1">
                          {item.type || 'misc'}
                        </span>
                        {item.rarity && (
                          <span
                            className={`rounded-full border px-3 py-1 ${rarityStyles[item.rarity] || rarityStyles.Common
                              }`}
                          >
                            {item.rarity}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="mt-2 text-sm text-gray-300">{item.description}</p>
                      )}
                      <p className="mt-2 text-xs text-gray-400">Value: {item.value}g</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link
            to="/dashboard"
            className="mt-8 inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-yellow-200 action-ghost"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
