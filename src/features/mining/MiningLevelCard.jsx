import React from 'react';
import Panel from '../../components/ui/Panel';
import SectionHeader from '../../components/ui/SectionHeader';
import XpBar from '../../components/XpBar';

export default function MiningLevelCard({
    miningLevel,
    miningXp,
    xpToNext,
    hirelingBreakdown,
    miningHirelingsOwned,
}) {
    return (
        <Panel className="p-4">
            <SectionHeader kicker="Mining Level" className="mb-2" />
            <p className="mt-2 text-2xl font-semibold text-white">{miningLevel}</p>
            <div className="mt-3">
                <XpBar current={miningXp} target={xpToNext} label="Mining XP" tone="cyan" />
            </div>
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
        </Panel>
    );
}
