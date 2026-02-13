import React from 'react';
import Panel from '../../components/ui/Panel';
import SectionHeader from '../../components/ui/SectionHeader';
import Button from '../../components/ui/Button';

export default function MiningForgeDetail({
    currentForge,
    nextForge,
    miningForgeLevel,
    miningLevel,
    gold,
    handleUpgradeForge,
}) {
    return (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Panel className="p-5">
                <SectionHeader kicker="Forge Tier" className="mb-2" />
                <p className="mt-2 text-lg font-semibold text-white">
                    {currentForge?.name || 'Forge'}
                </p>
                {currentForge?.description && (
                    <p className="mt-2 text-xs text-gray-400">
                        {currentForge.description}
                    </p>
                )}
                <p className="mt-3 text-xs text-gray-400">Level {miningForgeLevel}</p>

                <div className="mt-4 rounded-xl border border-yellow-700/30 bg-gray-950/70 p-4">
                    <SectionHeader kicker="Forge Upgrade" className="mb-2" />
                    {nextForge ? (
                        <>
                            <p className="mt-2 text-sm font-semibold text-white">
                                {nextForge.name}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                                Requires mining level {nextForge.requiredMiningLevel} ·{' '}
                                {nextForge.price}g
                            </p>
                            {nextForge.description && (
                                <p className="mt-2 text-xs text-gray-400">
                                    {nextForge.description}
                                </p>
                            )}
                            <Button
                                className="mt-3 w-full"
                                size="sm"
                                onClick={handleUpgradeForge}
                                disabled={
                                    miningLevel < nextForge.requiredMiningLevel ||
                                    gold < nextForge.price
                                }
                            >
                                Upgrade Forge
                            </Button>
                        </>
                    ) : (
                        <p className="mt-2 text-xs text-gray-400">Forge fully upgraded.</p>
                    )}
                </div>
            </Panel>
        </div>
    );
}
