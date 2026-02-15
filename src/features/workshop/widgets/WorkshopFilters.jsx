import React from 'react';
import Button from '../../../shared/ui/Button';

export default function WorkshopFilters({
    stationFilter, setStationFilter, stations,
    searchTerm, setSearchTerm,
    tagFilter, setTagFilter, tagCounts,
    showCraftableOnly, setShowCraftableOnly,
    handleClearFilters
}) {
    return (
        <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <select
                    value={stationFilter}
                    onChange={(event) => setStationFilter(event.target.value)}
                    className="h-10 w-full sm:w-auto rounded-xl border border-yellow-700/20 bg-gray-950/70 px-4 text-xs text-gray-100 focus:border-yellow-500/50 outline-none transition-all"
                >
                    <option value="all">All Stations</option>
                    {stations.map((station) => (
                        <option key={station.id} value={station.id}>
                            {station.name}
                        </option>
                    ))}
                </select>
                <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search blueprints..."
                    className="h-10 w-full sm:flex-1 rounded-xl border border-yellow-700/20 bg-gray-950/70 px-4 text-xs text-gray-100 focus:border-yellow-500/50 outline-none transition-all"
                />
                <Button variant="ghost" size="sm" onClick={handleClearFilters} className="w-full sm:w-auto">
                    Reset
                </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <Button
                    variant={tagFilter === 'all' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setTagFilter('all')}
                >
                    All
                </Button>
                <Button
                    variant={tagFilter === 'ore' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setTagFilter('ore')}
                >
                    Ore ({tagCounts.ore})
                </Button>
                <Button
                    variant={tagFilter === 'crop' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setTagFilter('crop')}
                >
                    Crop ({tagCounts.crop})
                </Button>
                <div className="ml-auto flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="craftableOnly"
                        checked={showCraftableOnly}
                        onChange={(event) => setShowCraftableOnly(event.target.checked)}
                        className="h-4 w-4 rounded border-yellow-700/30 bg-gray-950/70 text-yellow-500"
                    />
                    <label htmlFor="craftableOnly" className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                        Craftable Only
                    </label>
                </div>
            </div>
        </div>
    );
}
