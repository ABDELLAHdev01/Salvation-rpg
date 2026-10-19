import React, { useState } from 'react';
import audioManager from '../../core/audio/AudioManager';

export default function MarketWorldView({
  marketItems = [],
  gold = 0,
  onBuy = () => {},
  onSell = () => {},
  onSellAllGoods = () => {},
  onSellAllOres = () => {},
  sellAllGoods = { totalCount: 0, totalValue: 0 },
  sellAllOres = { totalCount: 0, totalValue: 0 },
  formatGold = (v) => v,
  className = '',
}) {
  const [selectedStallId, setSelectedStallId] = useState('seeds');
  const [tradeQuantity, setTradeQuantity] = useState(1);

  // 4 Themed Merchant Stalls positioned across the 2D Bazaar Square
  const stalls = [
    {
      id: 'seeds',
      name: "Seedsman's Cart",
      vendor: 'Old Barnaby',
      quote: '"Freshly harvested seeds from the fertile southern valleys. Guaranteed to sprout!"',
      icon: '🌾',
      filterType: 'seed',
      x: 22,
      y: 34,
      color: '#15803d',
    },
    {
      id: 'minerals',
      name: 'Mineral Exchange',
      vendor: 'Torvald Deepdelver',
      quote: '"We trade pure ingots and raw subterranean seams. Gold talks, rubble walks."',
      icon: '⛏️',
      filterType: 'ore',
      x: 78,
      y: 34,
      color: '#b45309',
    },
    {
      id: 'produce',
      name: 'Harvest & Goods Stall',
      vendor: 'Mistress Linnea',
      quote: '"Eggs, milk, fine honey and fresh herbs. Valoria always pays honest prices for wholesome goods."',
      icon: '🧺',
      filterType: 'farm-good',
      x: 24,
      y: 74,
      color: '#d97706',
    },
    {
      id: 'gear',
      name: "Armorer's Pavillion",
      vendor: 'Garrison Smith',
      quote: '"Tempered steel, enchanted pickaxes, and gladiator shields for the discerning delver."',
      icon: '⚔️',
      filterType: 'gear',
      x: 76,
      y: 74,
      color: '#4f46e5',
    },
  ];

  const currentStall = stalls.find((s) => s.id === selectedStallId) || stalls[0];
  const stallItems = marketItems.filter((item) => {
    if (currentStall.filterType === 'seed') return item.type === 'seed';
    if (currentStall.filterType === 'ore') return item.type === 'ore' || item.type === 'bar';
    if (currentStall.filterType === 'farm-good') return item.type === 'farm-good' || item.type === 'farm-animal';
    if (currentStall.filterType === 'gear') return item.type === 'gear' || item.type === 'consumable';
    return true;
  });

  const handleSelectStall = (id) => {
    audioManager.play('tap');
    setSelectedStallId(id);
    setTradeQuantity(1);
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-3xl border-2 border-yellow-800/40 bg-[#16121a] shadow-2xl ${className}`}>
      {/* 2D Merchant Bazaar Square Canvas */}
      <div className="relative min-h-[640px] w-full p-4 sm:p-6 select-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2a1d2e] via-[#1a1320] to-[#0d0912]">
        {/* Cobblestone Market Square Paving */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#48305420_1px,transparent_1px),linear-gradient(to_bottom,#48305420_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />

        {/* Ambient Market Square Radiance */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Center Fountain or Market Cross Monument */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10 opacity-90">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-yellow-600/40 bg-gray-950/80 shadow-2xl">
            <span className="text-3xl">🪙</span>
          </div>
          <span className="mt-1 rounded-full border border-yellow-600/30 bg-gray-950/90 px-2.5 py-0.5 text-[9px] font-bold text-yellow-300">
            Valorian Trade Cross
          </span>
        </div>

        {/* =========================================================================
            4 THEMED MERCHANT STALLS
            ========================================================================= */}
        {stalls.map((stall) => {
          const isSelected = selectedStallId === stall.id;

          return (
            <div
              key={stall.id}
              onClick={() => handleSelectStall(stall.id)}
              className={`absolute cursor-pointer transition-all duration-200 z-20 ${
                isSelected ? 'scale-108' : 'hover:scale-103'
              }`}
              style={{
                left: `${stall.x}%`,
                top: `${stall.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 p-3.5 transition-all ${
                  isSelected
                    ? 'border-yellow-400 bg-gray-900/90 shadow-2xl ring-2 ring-yellow-400/50'
                    : 'border-yellow-800/40 bg-gray-950/70 hover:border-yellow-600/60'
                } w-40 h-34 sm:w-48 sm:h-38`}
                style={{
                  boxShadow: isSelected ? `0 0 25px ${stall.color}50` : undefined,
                }}
              >
                {/* Stall Awning Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-yellow-700/50 bg-gray-950/90 px-2.5 py-0.5 shadow-md truncate max-w-[140px]">
                  <span className="font-serif text-[10px] font-bold text-yellow-300">
                    {stall.name}
                  </span>
                </div>

                {/* Stall Graphic & Icon */}
                <div className="relative flex flex-col items-center">
                  <span className="text-3xl select-none filter drop-shadow">
                    {stall.icon}
                  </span>
                  <span className="mt-1 text-[11px] font-bold text-white">
                    {stall.vendor}
                  </span>
                  <span className="mt-0.5 text-[9px] font-mono text-yellow-400/80">
                    Click to browse
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* =========================================================================
            BOTTOM CONTEXTUAL BAZAAR DOCK: WARES, BUY/SELL, AND BULK TRADE ACTIONS
            ========================================================================= */}
        {currentStall && (
          <div className="absolute inset-x-4 bottom-4 z-30 max-h-[300px] overflow-y-auto rounded-2xl border-2 border-yellow-700/50 bg-gray-950/95 p-4 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-2 duration-200 sm:inset-x-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currentStall.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-base font-bold text-white sm:text-lg">
                      {currentStall.name}
                    </h3>
                    <span className="text-xs text-yellow-400 font-semibold">
                      · {currentStall.vendor}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 italic max-w-xl">
                    {currentStall.quote}
                  </p>
                </div>
              </div>

              {/* Bulk Actions at Produce or Mineral Stall */}
              <div className="flex items-center gap-2">
                {currentStall.id === 'produce' && sellAllGoods.totalCount > 0 && (
                  <button
                    type="button"
                    onClick={onSellAllGoods}
                    className="flex items-center gap-1 rounded-xl border border-yellow-500/50 bg-yellow-950/50 px-3 py-1.5 text-xs font-bold text-yellow-300 hover:brightness-110 active:scale-95 transition"
                  >
                    <span>🧺</span>
                    <span>Sell All Crops ({formatGold(sellAllGoods.totalValue)}g)</span>
                  </button>
                )}

                {currentStall.id === 'minerals' && sellAllOres.totalCount > 0 && (
                  <button
                    type="button"
                    onClick={onSellAllOres}
                    className="flex items-center gap-1 rounded-xl border border-yellow-500/50 bg-yellow-950/50 px-3 py-1.5 text-xs font-bold text-yellow-300 hover:brightness-110 active:scale-95 transition"
                  >
                    <span>⛏️</span>
                    <span>Sell All Ores ({formatGold(sellAllOres.totalValue)}g)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Wares Grid */}
            <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {stallItems.slice(0, 9).map((item) => {
                const canAfford = item.buyable && gold >= item.buyPrice * tradeQuantity;
                const canSell = item.sellable && item.owned >= tradeQuantity;

                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-yellow-700/20 bg-gray-900/60 p-3 hover:border-yellow-500/40 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white truncate max-w-[130px]">
                        {item.name}
                      </span>
                      <span className="font-mono text-[10px] text-gray-400">
                        In Pouch: {item.owned}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs">
                      {item.buyable && (
                        <span className="text-yellow-300 font-mono text-[11px]">
                          Buy: {formatGold(item.buyPrice)}g
                        </span>
                      )}
                      {item.sellable && (
                        <span className="text-emerald-400 font-mono text-[11px]">
                          Sell: {formatGold(item.sellPrice)}g
                        </span>
                      )}
                    </div>

                    {/* Trade Controls */}
                    <div className="mt-3 flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setTradeQuantity((q) => Math.max(1, q - 1))}
                          className="h-6 w-6 rounded bg-gray-800 text-xs font-bold text-gray-300 hover:text-white"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-mono text-xs text-yellow-300">
                          {tradeQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setTradeQuantity((q) => q + 1)}
                          className="h-6 w-6 rounded bg-gray-800 text-xs font-bold text-gray-300 hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        {item.buyable && (
                          <button
                            type="button"
                            onClick={() => onBuy(item)}
                            disabled={!canAfford}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition active:scale-95 ${
                              canAfford
                                ? 'bg-yellow-500 text-gray-950 hover:brightness-110 shadow-sm'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Buy
                          </button>
                        )}
                        {item.sellable && (
                          <button
                            type="button"
                            onClick={() => onSell(item)}
                            disabled={!canSell}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition active:scale-95 ${
                              canSell
                                ? 'border border-emerald-600/50 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/50'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Sell
                          </button>
                        )}
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
  );
}
