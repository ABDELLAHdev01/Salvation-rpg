import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../../shared/layout/Sidebar';
import authService from '../../core/services/AuthService';
import characterService from '../../core/services/CharacterService';
import { itemsCatalog } from '../../core/data/itemsCatalog';
import { farmAnimals, farmCrops } from '../../core/data/farmData';
import { miningConsumables } from '../../core/data/miningData';
import { addItems, getItemCount, removeItems } from '../../core/services/inventoryService';

import { marketFilters, groupedFilters, rarityRank } from './marketConstants';
import MarketFilters from './MarketFilters';
import MarketList from './MarketList';
import MarketBulkSaleModal from './MarketBulkSaleModal';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

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

  const inventory = useMemo(() => profile?.inventory || {}, [profile?.inventory]);
  const farmAnimalsOwned = useMemo(() => profile?.farmAnimals || {}, [profile?.farmAnimals]);
  const gold = profile?.stats?.gold ?? 0;
  const farmLevel = profile?.farmLevel ?? 1;
  const miningLevel = profile?.miningLevel ?? 1;
  const playerLevel = profile?.stats?.level ?? 1;

  const isAvailableForLevel = React.useCallback((item) => {
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
  }, [farmLevel, miningLevel, playerLevel]);

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
  }, [marketItems, filterId, normalizedSearch, showOwnedOnly, isAvailableForLevel]);

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
  }, [marketItems, isAvailableForLevel]);

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

          <MarketFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortBy={sortBy}
            setSortBy={setSortBy}
            filterId={filterId}
            setFilterId={setFilterId}
            filterCounts={filterCounts}
            showOwnedOnly={showOwnedOnly}
            setShowOwnedOnly={setShowOwnedOnly}
            handleToggleAllSections={handleToggleAllSections}
            allSectionsCollapsed={allSectionsCollapsed}
            hasGroupedSections={groupedSections.length > 0}
          />

          <MarketList
            filterId={filterId}
            groupedSections={groupedSections}
            sortedItems={sortedItems}
            collapsedSections={collapsedSections}
            handleToggleSection={handleToggleSection}
            quantities={quantities}
            handleQuantityChange={handleQuantityChange}
            handleBuy={handleBuy}
            handleSell={handleSell}
            sellAllGoods={sellAllGoods}
            sellAllOres={sellAllOres}
            handleSellAllGoods={handleSellAllGoods}
            handleSellAllOres={handleSellAllOres}
            formatGold={formatGold}
          />

          <MarketBulkSaleModal
            pendingBulkSale={pendingBulkSale}
            formatGold={formatGold}
            handleCancelBulkSale={handleCancelBulkSale}
            handleConfirmBulkSale={handleConfirmBulkSale}
            skipBulkConfirm={skipBulkConfirm}
            setSkipBulkConfirm={setSkipBulkConfirm}
          />
        </div>
      </div>
    </section>
  );
}
