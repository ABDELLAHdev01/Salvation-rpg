import React from 'react';
import Panel from '../../components/ui/Panel';
import SectionHeader from '../../components/ui/SectionHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { miningHirelings } from '../../data/miningData';

export default function MiningHirelings({
    miningHirelingsOwned,
    hirelingBreakdown,
    miningLevel,
    gold,
    hirelingTicksPerHour,
    handleHirelingPurchase,
    handleOpenDismiss,
}) {
    return (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Panel className="p-6">
                <SectionHeader
                    kicker="Worker Hirelings"
                    description="Passive miners add extra ticks while you are away."
                    className="mb-2"
                />
                <p className="mt-2 text-xs text-gray-400">
                    Total bonus: +{hirelingTicksPerHour} ticks/hour
                </p>

                {hirelingBreakdown.length > 0 && (
                    <details
                        className="mt-2 rounded-lg border border-yellow-700/20 bg-gray-950/70 px-3 py-2 text-xs text-gray-400"
                        open={miningHirelingsOwned.length > 0}
                    >
                        <summary className="flex cursor-pointer items-center justify-between text-yellow-200">
                            <span>Hireling contributions</span>
                            <span className="text-[10px] text-yellow-200">▾</span>
                        </summary>
                        <div className="mt-2 space-y-1">
                            {hirelingBreakdown.map((entry) => (
                                <div key={entry.id} className="flex items-center justify-between">
                                    <span>{entry.name}</span>
                                    <span className="text-yellow-200">{entry.count} ticks</span>
                                </div>
                            ))}
                        </div>
                    </details>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {miningHirelings.map((hireling) => {
                        const owned = miningHirelingsOwned.includes(hireling.id);
                        const meetsLevel = miningLevel >= hireling.requiredMiningLevel;
                        const canHire = !owned && meetsLevel && gold >= hireling.price;
                        const refundRate = hireling.refundRate ?? 0.4;
                        const refundAmount = Math.max(0, Math.round(hireling.price * refundRate));

                        return (
                            <div
                                key={hireling.id}
                                className="rounded-xl border border-yellow-700/20 bg-gray-950/70 p-4"
                            >
                                <p className="text-sm font-semibold text-white">{hireling.name}</p>
                                <p className="mt-1 text-xs text-gray-400">
                                    {hireling.description}
                                </p>
                                <p className="mt-2 text-xs text-gray-500">
                                    +{hireling.ticksPerHour} ticks/hour
                                </p>
                                <p className="mt-2 text-xs text-gray-500">
                                    Requires L{hireling.requiredMiningLevel} · {hireling.price}g
                                </p>
                                {owned && (
                                    <p className="mt-2 text-xs text-gray-500">
                                        Dismiss refund: {refundAmount}g
                                    </p>
                                )}
                                <div className="mt-3">
                                    <Badge variant={owned ? 'warning' : 'ghost'}>
                                        {owned ? 'Hired' : 'Not hired'}
                                    </Badge>
                                </div>
                                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                    <Button
                                        size="sm"
                                        onClick={() => handleHirelingPurchase(hireling.id)}
                                        disabled={!canHire}
                                    >
                                        Hire
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleOpenDismiss(hireling.id)}
                                        disabled={!owned}
                                    >
                                        Dismiss
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Panel>

            <Panel variant="image" className="image-panel-market p-6">
                <div className="image-panel-content">
                    <SectionHeader kicker="Passive Summary" className="mb-3" />
                    <p className="mt-3 text-sm text-gray-300">
                        Hirelings add {hirelingTicksPerHour} extra ticks per hour while
                        mining.
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                        Bonuses stack with your pickaxe and boosters.
                    </p>
                </div>
            </Panel>
        </div>
    );
}
