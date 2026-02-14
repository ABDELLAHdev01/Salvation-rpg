import React from 'react';
import { farmCrops, farmGoods, getSeedImageSrc, getCropSeasonBadges } from '../../core/data/farmData';
import { getSeedItemId } from '../../core/data/itemsCatalog';
import { formatDuration } from '../../core/data/miningData';
import { getItemCount } from '../../core/services/inventoryService';
import Panel from '../../shared/ui/Panel';
import Button from '../../shared/ui/Button';
import Badge from '../../shared/ui/Badge';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
            <Panel variant="glass" className="w-full max-w-2xl max-h-[90vh] flex flex-col p-8">
                <div className="mb-6">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-yellow-500 font-bold">Botanical Archives</p>
                    <h2 className="mt-2 text-3xl font-bold text-white">Select Your Crop</h2>
                    {plantMode === 'bulk' && (
                        <p className="mt-2 text-sm text-emerald-400 font-medium italic">
                            Bulk action enabled: All fallow soil will be sown.
                        </p>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                    {farmCrops.map((crop) => {
                        const seedItemId = getSeedItemId(crop.id);
                        const ownedSeeds = getItemCount(inventory, seedItemId);
                        const meetsLevel = farmLevel >= crop.levelRequired;
                        const canPlant = meetsLevel && ownedSeeds > 0;
                        const badges = getCropSeasonBadges(crop.id);
                        const cropGood = farmGoods.find((good) => good.id === crop.yieldId);

                        return (
                            <Panel
                                key={crop.id}
                                variant="subtle"
                                className={`flex flex-wrap items-center justify-between gap-4 p-4 transition-all ${!meetsLevel ? 'opacity-40 grayscale' : 'hover:bg-gray-900/60'
                                    }`}
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-[240px]">
                                    <div className="h-16 w-16 rounded-xl bg-gray-900/80 border border-yellow-700/20 p-2 shadow-inner">
                                        <img
                                            src={getSeedImageSrc(crop.id)}
                                            alt={crop.seedName}
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-base font-bold text-white">{crop.name}</h4>
                                            {!meetsLevel && <Badge variant="danger">Lvl {crop.levelRequired} req</Badge>}
                                            {ownedSeeds > 0 && <Badge variant="cyan">{ownedSeeds} owned</Badge>}
                                        </div>
                                        <p className="mt-1 text-xs text-gray-400 font-medium">
                                            {crop.seedName} · {formatDuration(crop.growMs)} growth
                                        </p>

                                        {badges.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {badges.map((badge) => {
                                                    const isCurrentSeason = badge.season === season;
                                                    let badgeVariant = 'ghost';
                                                    if (isCurrentSeason) {
                                                        badgeVariant = badge.tone === 'good' ? 'success' : 'danger';
                                                    }
                                                    return (
                                                        <Badge
                                                            key={`${crop.id}-${badge.season}`}
                                                            variant={badgeVariant}
                                                            className={isCurrentSeason ? 'scale-110 origin-left border-current' : 'opacity-60'}
                                                        >
                                                            {badge.label}{isCurrentSeason ? ' (Today)' : ''}
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        <p className="mt-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                            Expected Yield: <span className="text-yellow-500">{crop.yieldAmount} {cropGood?.name || 'Goods'}</span>
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    variant={canPlant ? 'ornate' : 'secondary'}
                                    size="sm"
                                    onClick={() => handlePlant(crop.id)}
                                    disabled={!canPlant}
                                    className="min-w-[100px]"
                                >
                                    {meetsLevel ? (ownedSeeds > 0 ? 'Plant' : 'No Seeds') : `Level ${crop.levelRequired}`}
                                </Button>
                            </Panel>
                        );
                    })}
                </div>

                <div className="mt-8 flex items-center justify-end gap-4 border-t border-yellow-700/10 pt-6">
                    <Button variant="ghost" onClick={onClose}>
                        Return to Fields
                    </Button>
                </div>
            </Panel>
        </div>
    );
}
