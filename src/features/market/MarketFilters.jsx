import React from 'react';
import { marketFilters } from './marketConstants';

export default function MarketFilters({
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filterId,
    setFilterId,
    filterCounts,
    showOwnedOnly,
    setShowOwnedOnly,
    handleToggleAllSections,
    allSectionsCollapsed,
    hasGroupedSections,
}) {
    return (
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
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${filterId === filter.id
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
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${showOwnedOnly ? 'action-primary text-white' : 'border border-yellow-700/40 text-yellow-200'
                        }`}
                >
                    Show owned only
                </button>
            </div>
            {filterId === 'all' && hasGroupedSections && (
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
        </div>
    );
}
