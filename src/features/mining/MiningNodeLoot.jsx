import React from 'react';

export default function MiningNodeLoot({
    pendingItems,
    breakPool,
    nodeBreakMultiplier,
}) {
    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-yellow-700/20 bg-gray-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Node Stash</p>
                {pendingItems.length === 0 ? (
                    <p className="mt-2 text-xs text-gray-400">No ores stored yet.</p>
                ) : (
                    <div className="mt-3 space-y-1 text-xs text-gray-400">
                        {pendingItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between">
                                <span>{item.name}</span>
                                <span className="text-yellow-200">{item.amount}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="rounded-xl border border-yellow-700/20 bg-gray-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Node Break Loot</p>
                <p className="mt-2 text-xs text-gray-400">
                    Breaks grant one bonus roll at +{Math.round((nodeBreakMultiplier - 1) * 100)}% yield.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                    {breakPool.map((ore) => (
                        <span
                            key={ore.id}
                            className="rounded-full border border-yellow-700/30 bg-yellow-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-yellow-200"
                        >
                            {ore.name}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
