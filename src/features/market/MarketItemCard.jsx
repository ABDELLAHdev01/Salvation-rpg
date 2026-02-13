import React from 'react';

export default function MarketItemCard({
    item,
    quantity,
    handleQuantityChange,
    handleBuy,
    handleSell,
    formatGold,
}) {
    const owned = item.owned || 0;

    return (
        <div className="rounded-xl border border-yellow-700/30 bg-gray-950/70 p-4 hover-lift">
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
                            <p className="text-sm uppercase tracking-[0.3em] text-gray-400">
                                {item.category || 'Misc'}
                            </p>
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
                            className={`rounded-lg px-3 py-2 text-xs font-semibold ${item.buyable ? 'action-primary text-white' : 'bg-gray-700 text-gray-300'
                                }`}
                        >
                            Buy
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSell(item)}
                            disabled={!item.sellable || owned <= 0}
                            className={`rounded-lg px-3 py-2 text-xs font-semibold ${item.sellable && owned > 0
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
}
