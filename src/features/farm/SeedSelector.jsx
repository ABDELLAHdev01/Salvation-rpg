import React from 'react';
import { farmCrops, farmGoods, getSeedImageSrc, getCropSeasonBadges } from '../../data/farmData';
import { getSeedItemId } from '../../data/itemsCatalog';
import { formatDuration } from '../../data/miningData';
import { getItemCount } from '../../services/inventoryService';

export default function SeedSelector({
    isOpen,
    plantMode,
    farmLevel,
    season,
    inventory,
    handlePlant,
    onClose,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-2xl rounded-2xl border border-yellow-700/30 bg-gray-950/95 p-6 shadow-xl">
                <p className="text-sm uppercase tracking-[0.3em] text-yellow-400">Choose Crop</p>
                <h2 className="mt-3 text-xl font-semibold text-white">What do you want to plant?</h2>
                {plantMode === 'bulk' && (
                    <p className="mt-2 text-xs text-gray-300">
                        This will plant all empty plots with the selected seed.
                    </p>
                )}
                <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {farmCrops.map((crop) => {
                        const seedItemId = getSeedItemId(crop.id);
                        const ownedSeeds = getItemCount(inventory, seedItemId);
                        const meetsLevel = farmLevel >= crop.levelRequired;
                        const disabled = !meetsLevel || ownedSeeds <= 0;
                        const badges = getCropSeasonBadges(crop.id);
                        return (
                            <div
                                key={crop.id}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-yellow-700/20 bg-gray-950/70 p-3"
                            >
                                <div className="flex flex-wrap items-center gap-3">
                                    <img
                                        src={getSeedImageSrc(crop.id)}
                                        alt={crop.seedName}
                                        className="seed-thumb h-12 w-12 object-contain"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-white">{crop.name}</p>
                                        <p className="mt-1 text-xs text-gray-400">
                                            Farm L{crop.levelRequired} · {crop.seedName} · {formatDuration(crop.growMs)}
                                        </p>
                                        {badges.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {badges.map((badge) => (
                                                    <span
                                                        key={`${crop.id}-${badge.season}`}
                                                        className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${badge.tone === 'good'
                                                            ? badge.season === season
                                                                ? 'bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-400/50'
                                                                : 'bg-emerald-500/10 text-emerald-200'
                                                            : badge.season === season
                                                                ? 'bg-rose-400/20 text-rose-100 ring-1 ring-rose-400/50'
                                                                : 'bg-rose-500/10 text-rose-200'
                                                            }`}
                                                    >
                                                        {badge.label}{badge.season === season ? ' · Today' : ''}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <p className="mt-1 text-xs text-gray-400">
                                            Yield: {crop.yieldAmount} {farmGoods.find((good) => good.id === crop.yieldId)?.name || 'Goods'}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">Seeds owned: {ownedSeeds}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handlePlant(crop.id)}
                                    className={`rounded-lg px-3 py-2 text-xs font-semibold ${disabled ? 'bg-gray-700 text-gray-300' : 'action-primary text-white'
                                        }`}
                                    disabled={disabled}
                                >
                                    Plant
                                </button>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-6 flex items-center justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-yellow-700/40 px-4 py-2 text-xs font-semibold text-yellow-200"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
