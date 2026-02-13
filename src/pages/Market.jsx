import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import authService from '../services/AuthService';
import characterService from '../services/CharacterService';
import { itemsCatalog } from '../data/itemsCatalog';
import { farmAnimals, farmCrops } from '../data/farmData';
import { miningConsumables } from '../data/miningData';
import { addItems, getItemCount, removeItems } from '../services/inventoryService';

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

const marketFilters = [
  { id: 'all', label: 'All', predicate: () => true },
  { id: 'seeds', label: 'Seeds', predicate: (item) => item.type === 'seed' },
  { id: 'farm-goods', label: 'Farm Goods', predicate: (item) => item.type === 'farm-good' },
  { id: 'farm-animals', label: 'Farm Animals', predicate: (item) => item.type === 'farm-animal' },
  { id: 'ore', label: 'Ores', predicate: (item) => item.type === 'ore' },
  { id: 'consumables', label: 'Consumables', predicate: (item) => item.type === 'consumable' },
  { id: 'crafted', label: 'Crafted', predicate: (item) => item.type === 'crafted' },
  { id: 'gear', label: 'Gear', predicate: (item) => item.type === 'gear' },
  { id: 'tokens', label: 'Tokens', predicate: (item) => item.type === 'token' },
  {
    id: 'rare',
    label: 'Rare+',
    predicate: (item) => (rarityRank[item.rarity] || 0) >= 3,
  },
];

const groupedFilters = marketFilters.filter((filter) => !['all', 'rare'].includes(filter.id));
const COLLAPSED_SECTIONS_KEY = 'marketCollapsedSections';
const BULK_SELL_CONFIRM_KEY = 'marketBulkSellConfirmDisabled';
const seedLevelById = farmCrops.reduce((acc, crop) => {
  acc[crop.id] = crop.levelRequired || 1;
  return acc;
}, {});
const animalLevelById = farmAnimals.reduce((acc, animal) => {
  acc[animal.id] = animal.levelRequired || 1;
  return acc;
}, {});
const consumableLevelById = miningConsumables.reduce((acc, item) => {
  acc[item.id] = item.requiredMiningLevel || 1;
  return acc;
}, {});

const getBuyPrice = (item) => {
  if (!item) {
    return 0;
  }
  return (
    item.buyPrice ??
    item.price ??
    item.estimate ??
    (item.sellPrice ? Math.round(item.sellPrice * 1.3) : 0)
  );
};

const getSellPrice = (item) => {
  if (!item) {
    return 0;
  }
  if (item.sellPrice != null) {
    return item.sellPrice;
  }
  if (item.price != null) {
    return Math.round(item.price * 0.6);
  }
  if (item.estimate != null) {
    return Math.round(item.estimate * 0.6);
  }
  return 0;
};

const formatGold = (value) => new Intl.NumberFormat('en-US').format(value || 0);

export default function Market() {
  const [profile, setProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterId, setFilterId] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [quantities, setQuantities] = useState({});
  const [collapsedSections, setCollapsedSections] = useState({});
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);
  const [pendingBulkSale, setPendingBulkSale] = useState(null);
  const [skipBulkConfirm, setSkipBulkConfirm] = useState(false);

  useEffect(() => {
    if (!MOCK_AUTH) {
      return;
    }

    const username = authService.getCurrentUsername();
    const nextProfile = characterService.getMockProfile(username);
    setProfile(nextProfile);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(COLLAPSED_SECTIONS_KEY);
    if (!stored) {
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') {
        setCollapsedSections(parsed);
      }
    } catch {
      localStorage.removeItem(COLLAPSED_SECTIONS_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(COLLAPSED_SECTIONS_KEY, JSON.stringify(collapsedSections));
  }, [collapsedSections]);

  useEffect(() => {
    const stored = localStorage.getItem(BULK_SELL_CONFIRM_KEY);
    setSkipBulkConfirm(stored === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem(BULK_SELL_CONFIRM_KEY, skipBulkConfirm ? 'true' : 'false');
  }, [skipBulkConfirm]);

  const inventory = profile?.inventory || {};
  const farmAnimalsOwned = profile?.farmAnimals || {};
  const gold = profile?.stats?.gold ?? 0;
  const farmLevel = profile?.farmLevel ?? 1;
  const miningLevel = profile?.miningLevel ?? 1;
  const playerLevel = profile?.stats?.level ?? 1;

  const isAvailableForLevel = (item) => {
    if (!item || !item.buyable) {
      return true;
    }

    if (item.type === 'seed') {
      const requiredLevel = seedLevelById[item.sourceId] || 1;
      return farmLevel >= requiredLevel;
    }

    if (item.type === 'farm-animal') {
      const requiredLevel = animalLevelById[item.id] || 1;
      return farmLevel >= requiredLevel;
    }

    if (item.type === 'consumable') {
      const requiredLevel = consumableLevelById[item.id] || 1;
      return miningLevel >= requiredLevel;
    }

    if (item.type === 'gear') {
      const requiredLevel = item.level || 1;
      return playerLevel >= requiredLevel;
    }

    return true;
  };

  const marketItems = useMemo(() => {
    return itemsCatalog.map((item, index) => {
      const buyPrice = getBuyPrice(item);
      const sellPrice = getSellPrice(item);
      return {
        ...item,
        index,
        buyPrice,
        sellPrice,
        buyable: buyPrice > 0,
        sellable: sellPrice > 0,
        owned: item.type === 'farm-animal'
          ? farmAnimalsOwned[item.id]?.count || 0
          : getItemCount(inventory, item.id),
        rarityRank: rarityRank[item.rarity] || 0,
      };
    });
  }, [inventory, farmAnimalsOwned]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredItems = useMemo(() => {
    const activeFilter = marketFilters.find((filter) => filter.id === filterId) || marketFilters[0];
    return marketItems.filter((item) => {
      const matchesFilter = activeFilter.predicate(item);
      const matchesSearch =
        !normalizedSearch ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        (item.category || '').toLowerCase().includes(normalizedSearch);
      const matchesOwned = !showOwnedOnly || item.owned > 0;
      const matchesLevel = isAvailableForLevel(item);
      return matchesFilter && matchesSearch && matchesOwned && matchesLevel;
    });
  }, [marketItems, filterId, normalizedSearch, showOwnedOnly, farmLevel, miningLevel, playerLevel]);

  const sortedItems = useMemo(() => {
    const rows = [...filteredItems];
    rows.sort((a, b) => {
      if (sortBy === 'buy') return b.buyPrice - a.buyPrice || a.index - b.index;
      if (sortBy === 'sell') return b.sellPrice - a.sellPrice || a.index - b.index;
      if (sortBy === 'category') return (a.category || '').localeCompare(b.category || '') || a.index - b.index;
      if (sortBy === 'rarity') return b.rarityRank - a.rarityRank || a.index - b.index;
      return a.name.localeCompare(b.name) || a.index - b.index;
    });
    return rows;
  }, [filteredItems, sortBy]);

  const filterCounts = useMemo(() => {
    const counts = {};
    marketFilters.forEach((filter) => {
      counts[filter.id] = marketItems.filter((item) =>
        filter.predicate(item) && isAvailableForLevel(item)
      ).length;
    });
    return counts;
  }, [marketItems, farmLevel, miningLevel, playerLevel]);

  const groupedSections = useMemo(() => {
    if (filterId !== 'all') {
      return [];
    }

    return groupedFilters
      .map((filter) => {
        const items = sortedItems.filter((item) => filter.predicate(item));
        return {
          id: filter.id,
          label: filter.label,
          items,
        };
      })
      .filter((section) => section.items.length > 0);
  }, [filterId, sortedItems]);

  const sellAllGoods = useMemo(() => {
    const items = marketItems.filter((item) => item.type === 'farm-good' && item.sellable && item.owned > 0);
    const itemMap = {};
    let totalValue = 0;
    let totalCount = 0;
    items.forEach((item) => {
      itemMap[item.id] = item.owned;
      totalCount += item.owned;
      totalValue += item.sellPrice * item.owned;
    });
    return { itemMap, totalCount, totalValue };
  }, [marketItems]);

  const sellAllOres = useMemo(() => {
    const items = marketItems.filter((item) => item.type === 'ore' && item.sellable && item.owned > 0);
    const itemMap = {};
    let totalValue = 0;
    let totalCount = 0;
    items.forEach((item) => {
      itemMap[item.id] = item.owned;
      totalCount += item.owned;
      totalValue += item.sellPrice * item.owned;
    });
    return { itemMap, totalCount, totalValue };
  }, [marketItems]);

  const allSectionsCollapsed = groupedSections.length > 0
    && groupedSections.every((section) => collapsedSections[section.id]);

  const handleToggleAllSections = () => {
    if (groupedSections.length === 0) {
      return;
    }

    if (allSectionsCollapsed) {
      setCollapsedSections({});
      return;
    }

    const next = {};
    groupedSections.forEach((section) => {
      next[section.id] = true;
    });
    setCollapsedSections(next);
  };

  const handleToggleSection = (sectionId) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleQuantityChange = (itemId, value) => {
    const next = Math.max(1, Number.parseInt(value, 10) || 1);
    setQuantities((prev) => ({ ...prev, [itemId]: next }));
  };

  const handleBuy = (item) => {
    if (!MOCK_AUTH || !profile) {
      return;
    }
    if (!item.buyable) {
      toast.error('This item is not for sale.');
      return;
    }
    const quantity = Math.max(1, quantities[item.id] || 1);
    const totalCost = item.buyPrice * quantity;

    if (gold < totalCost) {
      toast.error('Not enough gold for that purchase.');
      return;
    }

    let updated;
    if (item.type === 'farm-animal') {
      const current = farmAnimalsOwned[item.id] || { count: 0, lastCollectedAt: 0 };
      const nextAnimals = {
        ...farmAnimalsOwned,
        [item.id]: {
          count: current.count + quantity,
          lastCollectedAt: current.lastCollectedAt || Date.now(),
        },
      };
      updated = characterService.updateMockProfile({
        farmAnimals: nextAnimals,
        stats: {
          ...profile.stats,
          gold: gold - totalCost,
        },
      });
    } else {
      const nextInventory = addItems(inventory, { [item.id]: quantity });
      updated = characterService.updateMockProfile({
        inventory: nextInventory,
        stats: {
          ...profile.stats,
          gold: gold - totalCost,
        },
      });
    }

    setProfile(updated);
    toast.success(`Bought ${quantity} ${item.name}.`);
  };

  const handleSell = (item) => {
    if (!MOCK_AUTH || !profile) {
      return;
    }
    if (!item.sellable) {
      toast.error('This item cannot be sold.');
      return;
    }
    const owned = item.type === 'farm-animal'
      ? farmAnimalsOwned[item.id]?.count || 0
      : getItemCount(inventory, item.id);
    if (owned <= 0) {
      toast.error('No items to sell.');
      return;
    }
    const quantity = Math.min(owned, Math.max(1, quantities[item.id] || 1));
    const totalValue = item.sellPrice * quantity;

    let updated;
    if (item.type === 'farm-animal') {
      const current = farmAnimalsOwned[item.id] || { count: 0, lastCollectedAt: 0 };
      const nextCount = Math.max(0, current.count - quantity);
      const nextAnimals = { ...farmAnimalsOwned };
      if (nextCount > 0) {
        nextAnimals[item.id] = { count: nextCount, lastCollectedAt: current.lastCollectedAt };
      } else {
        delete nextAnimals[item.id];
      }
      updated = characterService.updateMockProfile({
        farmAnimals: nextAnimals,
        stats: {
          ...profile.stats,
          gold: gold + totalValue,
        },
      });
    } else {
      const nextInventory = removeItems(inventory, { [item.id]: quantity });
      updated = characterService.updateMockProfile({
        inventory: nextInventory,
        stats: {
          ...profile.stats,
          gold: gold + totalValue,
        },
      });
    }

    setProfile(updated);
    toast.success(`Sold ${quantity} ${item.name}.`);
  };

  const handleSellAllGoods = () => {
    if (!MOCK_AUTH || !profile) {
      return;
    }
    if (sellAllGoods.totalCount <= 0) {
      toast.error('No farm goods to sell.');
      return;
    }
    if (skipBulkConfirm) {
      const updated = characterService.updateMockProfile({
        inventory: removeItems(inventory, sellAllGoods.itemMap),
        stats: {
          ...profile.stats,
          gold: gold + sellAllGoods.totalValue,
        },
      });

      setProfile(updated);
      toast.success(`Sold all farm goods for ${formatGold(sellAllGoods.totalValue)}g.`);
      return;
    }

    setPendingBulkSale({
      type: 'goods',
      label: 'farm goods',
      totalCount: sellAllGoods.totalCount,
      totalValue: sellAllGoods.totalValue,
      itemMap: sellAllGoods.itemMap,
    });
  };

  const handleSellAllOres = () => {
    if (!MOCK_AUTH || !profile) {
      return;
    }
    if (sellAllOres.totalCount <= 0) {
      toast.error('No ores to sell.');
      return;
    }
    if (skipBulkConfirm) {
      const updated = characterService.updateMockProfile({
        inventory: removeItems(inventory, sellAllOres.itemMap),
        stats: {
          ...profile.stats,
          gold: gold + sellAllOres.totalValue,
        },
      });

      setProfile(updated);
      toast.success(`Sold all ores for ${formatGold(sellAllOres.totalValue)}g.`);
      return;
    }

    setPendingBulkSale({
      type: 'ores',
      label: 'ores',
      totalCount: sellAllOres.totalCount,
      totalValue: sellAllOres.totalValue,
      itemMap: sellAllOres.itemMap,
    });
  };

  const handleConfirmBulkSale = () => {
    if (!MOCK_AUTH || !profile || !pendingBulkSale) {
      return;
    }

    const updated = characterService.updateMockProfile({
      inventory: removeItems(inventory, pendingBulkSale.itemMap),
      stats: {
        ...profile.stats,
        gold: gold + pendingBulkSale.totalValue,
      },
    });

    setProfile(updated);
    toast.success(`Sold all ${pendingBulkSale.label} for ${formatGold(pendingBulkSale.totalValue)}g.`);
    setPendingBulkSale(null);
  };

  const handleCancelBulkSale = () => {
    setPendingBulkSale(null);
  };

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm.jpg')] bg-gray-900 bg-blend-multiply dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 pt-24">
        <div className="rounded-2xl p-8 shadow-xl backdrop-blur court-reveal glass-panel">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">World Exchange</p>
              <h1 className="mt-3 text-4xl font-extrabold text-white hero-title">Global Market</h1>
              <p className="mt-3 max-w-2xl text-base text-gray-300">
                One hub for trading every resource, relic, and crafted good across the realm.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-yellow-700/40 bg-gray-950/70 px-4 py-2 text-xs text-yellow-200">
                Gold: {formatGold(gold)}
              </div>
              <Link
                to="/inventory"
                className="inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold text-yellow-200 action-ghost"
              >
                Open Inventory
              </Link>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-yellow-700/30 bg-gray-900/80 p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-yellow-500">Market Controls</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Trade Ledger</h2>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-gray-300">
                <label className="flex items-center gap-2">
                  <span className="uppercase tracking-[0.3em] text-gray-400">Search</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Item name or category"
                    className="min-w-[180px] rounded-full border border-yellow-700/40 bg-gray-950/70 px-3 py-1 text-xs text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </label>
                <label className="flex items-center gap-2">
                  <span className="uppercase tracking-[0.3em] text-gray-400">Sort</span>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="rounded-full border border-yellow-700/40 bg-gray-950/70 px-3 py-1 text-xs text-gray-200"
                  >
                    <option value="name" className="text-gray-900">Name</option>
                    <option value="buy" className="text-gray-900">Buy Price</option>
                    <option value="sell" className="text-gray-900">Sell Price</option>
                    <option value="category" className="text-gray-900">Category</option>
                    <option value="rarity" className="text-gray-900">Rarity</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {marketFilters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setFilterId(filter.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    filterId === filter.id
                      ? 'action-primary text-white'
                      : 'border border-yellow-700/40 text-yellow-200'
                  }`}
                >
                  {filter.label} ({filterCounts[filter.id] || 0})
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-300">
              <button
                type="button"
                onClick={() => setShowOwnedOnly((prev) => !prev)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  showOwnedOnly ? 'action-primary text-white' : 'border border-yellow-700/40 text-yellow-200'
                }`}
              >
                Show owned only
              </button>
            </div>
            {filterId === 'all' && groupedSections.length > 0 && (
              <div className="mt-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleToggleAllSections}
                  className="rounded-full border border-yellow-700/40 px-3 py-1 text-xs font-semibold text-yellow-200"
                >
                  {allSectionsCollapsed ? 'Expand all' : 'Collapse all'}
                </button>
              </div>
            )}

            <div className="mt-6 grid gap-6">
              {filterId === 'all' ? (
                groupedSections.map((section) => (
                  <div key={section.id} className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm uppercase tracking-[0.3em] text-yellow-200">
                        {section.label}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">{section.items.length} items</span>
                        {section.id === 'farm-goods' && (
                          <button
                            type="button"
                            onClick={handleSellAllGoods}
                            className={`rounded-full border border-yellow-700/40 px-2 py-0.5 text-[10px] font-semibold ${
                              sellAllGoods.totalCount > 0
                                ? 'text-yellow-200'
                                : 'text-gray-400'
                            }`}
                            disabled={sellAllGoods.totalCount <= 0}
                          >
                            Sell all ({sellAllGoods.totalCount}) · {formatGold(sellAllGoods.totalValue)}g
                          </button>
                        )}
                        {section.id === 'ore' && (
                          <button
                            type="button"
                            onClick={handleSellAllOres}
                            className={`rounded-full border border-yellow-700/40 px-2 py-0.5 text-[10px] font-semibold ${
                              sellAllOres.totalCount > 0
                                ? 'text-yellow-200'
                                : 'text-gray-400'
                            }`}
                            disabled={sellAllOres.totalCount <= 0}
                          >
                            Sell all ({sellAllOres.totalCount}) · {formatGold(sellAllOres.totalValue)}g
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleSection(section.id)}
                          className="rounded-full border border-yellow-700/40 px-2 py-0.5 text-[10px] font-semibold text-yellow-200"
                        >
                          {collapsedSections[section.id] ? 'Show' : 'Hide'}
                        </button>
                      </div>
                    </div>
                    {!collapsedSections[section.id] && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {section.items.map((item) => {
                          const quantity = Math.max(1, quantities[item.id] || 1);
                          const owned = item.owned || 0;
                          return (
                            <div
                              key={item.id}
                              className="rounded-xl border border-yellow-700/30 bg-gray-950/70 p-4 hover-lift"
                            >
                              <div className="flex items-start gap-4">
                                <div className="h-16 w-16 overflow-hidden rounded-xl border border-yellow-700/30 bg-gray-900/70">
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
                                    <div>
                                      <p className="text-sm uppercase tracking-[0.3em] text-gray-400">{item.category || 'Misc'}</p>
                                      <p className="mt-1 text-xl font-semibold text-white">{item.name}</p>
                                    </div>
                                    <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-200">
                                      Owned: {owned}
                                    </span>
                                  </div>
                                  {item.description && (
                                    <p className="mt-2 text-sm text-gray-300">{item.description}</p>
                                  )}
                                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-300">
                                    <span className="rounded-full border border-yellow-700/30 bg-gray-900/60 px-3 py-1">
                                      Buy: {item.buyable ? `${formatGold(item.buyPrice)}g` : 'N/A'}
                                    </span>
                                    <span className="rounded-full border border-yellow-700/30 bg-gray-900/60 px-3 py-1">
                                      Sell: {item.sellable ? `${formatGold(item.sellPrice)}g` : 'N/A'}
                                    </span>
                                    {item.rarity && (
                                      <span className="rounded-full border border-yellow-700/30 bg-gray-900/60 px-3 py-1">
                                        {item.rarity}
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-300">
                                    <label className="flex items-center gap-2">
                                      Qty
                                      <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(event) => handleQuantityChange(item.id, event.target.value)}
                                        className="w-16 rounded-lg border border-yellow-700/30 bg-gray-900/70 px-2 py-1 text-xs text-white"
                                      />
                                    </label>
                                    {[1, 5, 10].map((pick) => (
                                      <button
                                        key={pick}
                                        type="button"
                                        onClick={() => handleQuantityChange(item.id, pick)}
                                        className="rounded-lg border border-yellow-700/30 px-2 py-1 text-[0.65rem] font-semibold text-yellow-200"
                                      >
                                        x{pick}
                                      </button>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => handleBuy(item)}
                                      disabled={!item.buyable}
                                      className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                                        item.buyable ? 'action-primary text-white' : 'bg-gray-700 text-gray-300'
                                      }`}
                                    >
                                      Buy
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSell(item)}
                                      disabled={!item.sellable || owned <= 0}
                                      className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                                        item.sellable && owned > 0
                                          ? 'border border-yellow-700/40 text-yellow-200'
                                          : 'bg-gray-700 text-gray-300'
                                      }`}
                                    >
                                      Sell
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="space-y-4">
                  {(filterId === 'farm-goods' || filterId === 'ore') && (
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={filterId === 'farm-goods' ? handleSellAllGoods : handleSellAllOres}
                        className={`rounded-full border border-yellow-700/40 px-3 py-1 text-xs font-semibold ${
                          filterId === 'farm-goods'
                            ? (sellAllGoods.totalCount > 0 ? 'text-yellow-200' : 'text-gray-400')
                            : (sellAllOres.totalCount > 0 ? 'text-yellow-200' : 'text-gray-400')
                        }`}
                        disabled={filterId === 'farm-goods'
                          ? sellAllGoods.totalCount <= 0
                          : sellAllOres.totalCount <= 0}
                      >
                        Sell all ({filterId === 'farm-goods' ? sellAllGoods.totalCount : sellAllOres.totalCount}) · {formatGold(filterId === 'farm-goods' ? sellAllGoods.totalValue : sellAllOres.totalValue)}g
                      </button>
                    </div>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {sortedItems.map((item) => {
                      const quantity = Math.max(1, quantities[item.id] || 1);
                      const owned = item.owned || 0;
                      return (
                        <div
                          key={item.id}
                          className="rounded-xl border border-yellow-700/30 bg-gray-950/70 p-4 hover-lift"
                        >
                          <div className="flex items-start gap-4">
                            <div className="h-16 w-16 overflow-hidden rounded-xl border border-yellow-700/30 bg-gray-900/70">
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
                                <div>
                                  <p className="text-sm uppercase tracking-[0.3em] text-gray-400">{item.category || 'Misc'}</p>
                                  <p className="mt-1 text-xl font-semibold text-white">{item.name}</p>
                                </div>
                                <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-200">
                                  Owned: {owned}
                                </span>
                              </div>
                              {item.description && (
                                <p className="mt-2 text-sm text-gray-300">{item.description}</p>
                              )}
                              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-300">
                                <span className="rounded-full border border-yellow-700/30 bg-gray-900/60 px-3 py-1">
                                  Buy: {item.buyable ? `${formatGold(item.buyPrice)}g` : 'N/A'}
                                </span>
                                <span className="rounded-full border border-yellow-700/30 bg-gray-900/60 px-3 py-1">
                                  Sell: {item.sellable ? `${formatGold(item.sellPrice)}g` : 'N/A'}
                                </span>
                                {item.rarity && (
                                  <span className="rounded-full border border-yellow-700/30 bg-gray-900/60 px-3 py-1">
                                    {item.rarity}
                                  </span>
                                )}
                              </div>
                              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-300">
                                <label className="flex items-center gap-2">
                                  Qty
                                  <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(event) => handleQuantityChange(item.id, event.target.value)}
                                    className="w-16 rounded-lg border border-yellow-700/30 bg-gray-900/70 px-2 py-1 text-xs text-white"
                                  />
                                </label>
                                {[1, 5, 10].map((pick) => (
                                  <button
                                    key={pick}
                                    type="button"
                                    onClick={() => handleQuantityChange(item.id, pick)}
                                    className="rounded-lg border border-yellow-700/30 px-2 py-1 text-[0.65rem] font-semibold text-yellow-200"
                                  >
                                    x{pick}
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => handleBuy(item)}
                                  disabled={!item.buyable}
                                  className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                                    item.buyable ? 'action-primary text-white' : 'bg-gray-700 text-gray-300'
                                  }`}
                                >
                                  Buy
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSell(item)}
                                  disabled={!item.sellable || owned <= 0}
                                  className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                                    item.sellable && owned > 0
                                      ? 'border border-yellow-700/40 text-yellow-200'
                                      : 'bg-gray-700 text-gray-300'
                                  }`}
                                >
                                  Sell
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Link
            to="/dashboard"
            className="mt-8 inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-yellow-200 action-ghost"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {pendingBulkSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-yellow-700/30 bg-gray-950/95 p-6 shadow-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-400">Confirm Sale</p>
            <h2 className="mt-3 text-xl font-semibold text-white">Sell all {pendingBulkSale.label}?</h2>
            <p className="mt-2 text-sm text-gray-300">
              This will sell {pendingBulkSale.totalCount} items for {formatGold(pendingBulkSale.totalValue)}g.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-300">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={skipBulkConfirm}
                  onChange={(event) => setSkipBulkConfirm(event.target.checked)}
                  className="h-4 w-4 rounded border-yellow-700/40 bg-gray-900/70 text-yellow-400"
                />
                Don't ask again
              </label>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelBulkSale}
                className="rounded-lg border border-yellow-700/40 px-4 py-2 text-xs font-semibold text-yellow-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkSale}
                className="rounded-lg px-4 py-2 text-xs font-semibold action-primary text-white"
              >
                Confirm Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
