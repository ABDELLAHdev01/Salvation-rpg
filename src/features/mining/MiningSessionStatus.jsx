import React from 'react';
import { formatDuration } from '../../data/miningData';
import Panel from '../../components/ui/Panel';
import SectionHeader from '../../components/ui/SectionHeader';

export default function MiningSessionStatus({
    isMining,
    remainingMs,
    isMiningCooldown,
    miningCooldownRemaining,
    miningProgress,
    boosterCooldownRows,
}) {
    return (
        <Panel variant="image" className="image-panel-housing p-4">
            <SectionHeader kicker="Session" className="mb-2" />
            <p className="mt-2 text-2xl font-semibold text-white">
                {isMining ? 'In Progress' : 'Idle'}
            </p>
            <p className="mt-2 text-sm text-gray-300">
                {isMining
                    ? `Time left: ${formatDuration(remainingMs)}`
                    : isMiningCooldown
                        ? `Cooldown: ${formatDuration(miningCooldownRemaining)}`
                        : 'Start a new mining run.'}
            </p>
            <p className="mt-3 text-xs text-gray-400">Auto-claim active.</p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/50">
                <div
                    className="h-full rounded-full bg-yellow-500/70 transition-all"
                    style={{ width: `${miningProgress}%` }}
                />
            </div>
            {boosterCooldownRows.some((row) => row.isActive) ? (
                <div className="mt-3 space-y-2 text-xs text-gray-300">
                    {boosterCooldownRows
                        .filter((row) => row.isActive)
                        .map((row) => (
                            <div key={row.booster.id}>
                                <p>
                                    Booster cooldown: {row.booster.name} ({formatDuration(row.remaining)})
                                </p>
                                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/50">
                                    <div
                                        className="h-full rounded-full bg-amber-400/70"
                                        style={{ width: `${row.progress}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                </div>
            ) : (
                <p className="mt-3 text-xs text-gray-400">No booster cooldowns active.</p>
            )}
        </Panel>
    );
}
