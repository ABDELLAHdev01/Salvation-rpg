import React from 'react';
import { miningOres } from '../../data/miningData';

export default function MiningClickInfoPanel({
    clickPreview,
    momentum,
    clickEfficiency,
    clickBaseXp,
    zoneMiningXpMultiplier,
    clickDamage,
    clickCooldownMs,
    nodeBreakMultiplier,
    dailyVeinBonus,
    weeklySurgeBonus,
    activeBoost,
}) {
    const momentumPct = typeof momentum === 'number'
        ? Math.round(momentum * 100)
        : Math.round(((momentum?.value || 0) / (momentum?.max || 100)) * 100);
    const momentumValueForCalc = typeof momentum === 'number' ? momentum * 100 : (momentum?.value || 0);
    const momentumMultiplier = 1 + Math.min(0.1, momentumValueForCalc * 0.001);

    return (
        <div className="image-panel image-panel-market ornament-frame p-6">
            <div className="image-panel-content">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-300">Click Preview</p>
                <p className="mt-3 text-sm text-gray-300">
                    {clickPreview
                        ? `Ore range: ${clickPreview.minAmount}-${clickPreview.maxAmount}`
                        : 'Click data loading...'}
                </p>
                {clickPreview && (
                    <div className="mt-3 space-y-1 text-xs text-gray-400">
                        <p>Crit chance: {Math.round(clickPreview.critChance * 100)}%</p>
                        <p>Rare chance: {Math.round(clickPreview.rareChance * 100)}%</p>
                    </div>
                )}

                <div className="mt-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Momentum</p>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/50">
                        <div
                            className="h-full rounded-full bg-cyan-400/70 transition-all"
                            style={{ width: `${momentumPct}%` }}
                        />
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                        Passive bonus: +{Math.round((momentumMultiplier - 1) * 100)}%
                    </p>
                </div>

                <div className="mt-4 rounded-xl border border-yellow-700/20 bg-gray-950/70 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Economy Math</p>
                    <div className="mt-3 space-y-1 text-xs text-gray-400">
                        <p>Click efficiency: x{clickEfficiency.toFixed(2)} (cap 1.60)</p>
                        <p>Base click XP: {clickBaseXp} · Zone XP x{zoneMiningXpMultiplier.toFixed(2)}</p>
                        <p>Node damage per click: {clickDamage}</p>
                        <p>Click cooldown: {clickCooldownMs}ms</p>
                        <p>Break bonus: +{Math.round((nodeBreakMultiplier - 1) * 100)}% yield</p>
                    </div>
                </div>

                <div className="mt-4 text-xs text-gray-400">
                    <p>Daily Vein: +25% {miningOres.find((ore) => ore.id === dailyVeinBonus.oreId)?.name || 'ore'} yield</p>
                    <p>Weekly Surge: +{Math.round((weeklySurgeBonus.xpMultiplier - 1) * 100)}% XP</p>
                    <p>Active boost: {activeBoost?.name || 'None'}</p>
                </div>
            </div>
        </div>
    );
}
