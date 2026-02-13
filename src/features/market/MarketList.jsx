import React from 'react';
import MarketItemCard from './MarketItemCard';

export default function MarketList({
    filterId,
    groupedSections,
    sortedItems,
    collapsedSections,
    handleToggleSection,
    quantities,
    handleQuantityChange,
    handleBuy,
    handleSell,
    sellAllGoods,
    sellAllOres,
    handleSellAllGoods,
    handleSellAllOres,
    formatGold,
}) {
    const renderItemGrid = (items) => (
        <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
                <MarketItemCard
                    key={item.id}
                    item={item}
                    quantity={Math.max(1, quantities[item.id] || 1)}
                    handleQuantityChange={handleQuantityChange}
                    handleBuy={handleBuy}
                    handleSell={handleSell}
                    formatGold={formatGold}
                />
            ))}
        </div>
    );

    if (filterId === 'all') {
        return (
            <div className="mt-6 grid gap-6">
                {groupedSections.map((section) => (
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
                                        className={`rounded-full border border-yellow-700/40 px-2 py-0.5 text-[10px] font-semibold ${sellAllGoods.totalCount > 0
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
                                        className={`rounded-full border border-yellow-700/40 px-2 py-0.5 text-[10px] font-semibold ${sellAllOres.totalCount > 0
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
                        {!collapsedSections[section.id] && renderItemGrid(section.items)}
                    </div>
                ))}
            </div>
        );
    }

    // Determine if we should show the "Sell all" button for the current filter
    const showSellAll = (filterId === 'farm-goods' && sellAllGoods.totalCount > 0) ||
        (filterId === 'ore' && sellAllOres.totalCount > 0) ||
        // Also handle empty states but button still visible logically
        (filterId === 'farm-goods' || filterId === 'ore');

    const sellButtonLabel = filterId === 'farm-goods'
        ? `Sell all (${sellAllGoods.totalCount}) · ${formatGold(sellAllGoods.totalValue)}g`
        : `Sell all (${sellAllOres.totalCount}) · ${formatGold(sellAllOres.totalValue)}g`;

    const sellButtonWait = filterId === 'farm-goods' && sellAllGoods.totalCount <= 0;
    const sellOreWait = filterId === 'ore' && sellAllOres.totalCount <= 0;
    const isDisabled = sellButtonWait || sellOreWait;

    return (
        <div className="mt-6 space-y-4">
            {showSellAll && (
                <div className="flex items-center justify-end">
                    <button
                        type="button"
                        onClick={filterId === 'farm-goods' ? handleSellAllGoods : handleSellAllOres}
                        className={`rounded-full border border-yellow-700/40 px-3 py-1 text-xs font-semibold ${!isDisabled
                            ? 'text-yellow-200'
                            : 'text-gray-400'
                            }`}
                        disabled={isDisabled}
                    >
                        {sellButtonLabel}
                    </button>
                </div>
            )}
            {renderItemGrid(sortedItems)}
        </div>
    );
}
