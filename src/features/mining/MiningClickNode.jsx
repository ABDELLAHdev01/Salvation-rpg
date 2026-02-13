import React from 'react';
import { miningOres } from '../../data/miningData';

export default function MiningClickNode({
    node,
    momentum,
    canClick,
    handleClickMine,
    lastClickReward,
}) {
    const nodeDurability = node?.durability ?? 0;
    const nodeMaxDurability = node?.maxDurability ?? 0;
    const nodeTier = node?.tier ?? 1;

    const nodeDurabilityPct = nodeMaxDurability > 0
        ? Math.max(0, Math.min(100, Math.round((nodeDurability / nodeMaxDurability) * 100)))
        : 0;

    const momentumValue = momentum?.value || 0;
    const momentumMax = momentum?.max || 100;

    const lastRewardItems = lastClickReward
        ? Object.entries(lastClickReward.yieldMap || {}).map(([oreId, amount]) => ({
            id: oreId,
            amount,
            name: (miningOres.find((ore) => ore.id === oreId) || {}).name || oreId,
        }))
        : [];

    const lastBurstItems = lastClickReward
        ? Object.entries(lastClickReward.burstYield || {}).map(([oreId, amount]) => ({
            id: oreId,
            amount,
            name: (miningOres.find((ore) => ore.id === oreId) || {}).name || oreId,
        }))
        : [];

    return (
        <div className="court-card rounded-2xl p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Node</p>

            {/* Durability Bar */}
            <div className="mt-4 rounded-xl border border-yellow-700/20 bg-gray-950/70 p-4">
                <div className="flex items-center justify-between text-xs text-gray-300">
                    <span>Durability</span>
                    <span className="text-yellow-200">{nodeDurability}/{nodeMaxDurability}</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/50">
                    <div
                        className="h-full rounded-full bg-emerald-400/70 transition-all"
                        style={{ width: `${nodeDurabilityPct}%` }}
                    />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <span>Node tier: {nodeTier}</span>
                    <span>Momentum: {momentumValue}/{momentumMax}</span>
                </div>
            </div>

            {/* Action Button */}
            <div className="mt-4 flex flex-wrap items-center gap-4">
                <button
                    type="button"
                    onClick={handleClickMine}
                    disabled={!canClick}
                    className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold ${canClick ? 'action-primary text-white' : 'bg-gray-700 text-gray-300'
                        }`}
                >
                    Mine Node
                </button>
                <span className="text-xs text-gray-400">
                    {canClick ? 'Keep clicking to build momentum.' : 'Start a run to enable clicks.'}
                </span>
            </div>

            {/* Last Click Feedback */}
            {lastClickReward && (
                <div className="mt-4 rounded-xl border border-yellow-700/20 bg-gray-950/70 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Last Click</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-300">
                        <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-yellow-200">
                            {lastClickReward.event || 'normal'}
                        </span>
                        <span className="text-gray-400">+{lastClickReward.xpGained} XP</span>
                        {lastClickReward.brokeNode && (
                            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-200">
                                Node broke!
                            </span>
                        )}
                    </div>
                    {lastRewardItems.length > 0 && (
                        <div className="mt-3 space-y-1 text-xs text-gray-400">
                            {lastRewardItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between">
                                    <span>{item.name}</span>
                                    <span className="text-yellow-200">+{item.amount}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {lastBurstItems.length > 0 && (
                        <div className="mt-3 space-y-1 text-xs text-gray-400">
                            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Break bonus</p>
                            {lastBurstItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between">
                                    <span>{item.name}</span>
                                    <span className="text-yellow-200">+{item.amount}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
