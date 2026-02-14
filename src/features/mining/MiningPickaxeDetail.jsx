import React from 'react';
import Panel from '../../shared/ui/Panel';
import SectionHeader from '../../shared/ui/SectionHeader';
import Button from '../../shared/ui/Button';
import { miningOres } from '../../core/data/miningData';

export default function MiningPickaxeDetail({
    currentPickaxe,
    nextPickaxe,
    miningLevel,
    gold,
    handleUpgradePickaxe,
    dailyVeinBonus,
    weeklySurgeBonus,
    miningPrestigeLevel,
}) {
    return (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Panel variant="image" className="image-panel-market p-5">
                <SectionHeader kicker="Pickaxe Portrait" className="mb-3" />
                <p className="mt-3 text-lg font-semibold text-white">
                    {currentPickaxe?.name || 'Pickaxe'}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                    {currentPickaxe?.rarity || 'Common'} tier
                </p>
                {currentPickaxe?.visual && (
                    <p className="mt-2 text-xs text-gray-400">{currentPickaxe.visual}</p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-4">
                    {currentPickaxe?.image && (
                        <div className="rounded-xl border border-yellow-700/30 bg-gray-950/70 p-2">
                            <img
                                src={currentPickaxe.image}
                                alt={currentPickaxe.name}
                                className="h-20 w-20 object-contain"
                            />
                            <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-gray-400">
                                Current
                            </p>
                        </div>
                    )}
                    {nextPickaxe?.image && (
                        <div className="rounded-xl border border-yellow-700/30 bg-gray-950/70 p-2">
                            <img
                                src={nextPickaxe.image}
                                alt={nextPickaxe.name}
                                className="h-20 w-20 object-contain"
                            />
                            <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-gray-400">
                                Next
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-4 rounded-xl border border-yellow-700/30 bg-gray-950/70 p-4">
                    <SectionHeader kicker="Pickaxe Upgrade" className="mb-2" />
                    {nextPickaxe ? (
                        <>
                            <p className="mt-2 text-sm font-semibold text-white">
                                {nextPickaxe.name}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                                Requires mining level {nextPickaxe.requiredMiningLevel} ·{' '}
                                {nextPickaxe.price}g
                            </p>
                            <Button
                                className="mt-3 w-full"
                                size="sm"
                                onClick={handleUpgradePickaxe}
                                disabled={
                                    miningLevel < nextPickaxe.requiredMiningLevel ||
                                    gold < nextPickaxe.price
                                }
                            >
                                Upgrade Pickaxe
                            </Button>
                        </>
                    ) : (
                        <p className="mt-2 text-xs text-gray-400">Pickaxe fully upgraded.</p>
                    )}
                </div>
            </Panel>

            <Panel className="p-5">
                <SectionHeader kicker="Mining Notes" className="mb-2" />
                <p className="mt-2 text-sm text-gray-300">
                    Rare nodes and critical strikes can spike your haul. Mishaps can reduce
                    a tick.
                </p>
                <div className="mt-3 space-y-1 text-xs text-gray-400">
                    <p>
                        Daily Vein: +25%{' '}
                        {miningOres.find((ore) => ore.id === dailyVeinBonus.oreId)?.name ||
                            'ore'}{' '}
                        yield
                    </p>
                    <p>
                        Weekly Surge: +
                        {Math.round((weeklySurgeBonus.xpMultiplier - 1) * 100)}% XP
                    </p>
                    <p>Prestige Rank: {miningPrestigeLevel} (boosts rare + crit rates)</p>
                </div>
            </Panel>
        </div>
    );
}
