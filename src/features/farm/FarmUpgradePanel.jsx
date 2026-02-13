import React from 'react';
import XpBar from '../../components/XpBar';

const FarmUpgradePanel = React.memo(function FarmUpgradePanel({
    farmLevel,
    farmXp,
    farmXpTarget,
    gold,
    landSize,
    nextExpandCost,
    nextExpandFarmLevel,
    handleExpandLand,
    LAND_EXPAND_SIZE,
}) {
    return (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="court-card rounded-xl p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Farm Level</p>
                <p className="mt-2 text-2xl font-semibold text-white">{farmLevel}</p>
                <div className="mt-3">
                    <XpBar current={farmXp} target={farmXpTarget} label="Farm XP" tone="emerald" />
                </div>
            </div>
            <div className="court-card rounded-xl p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Gold</p>
                <p className="mt-2 text-2xl font-semibold text-yellow-300">{gold}</p>
            </div>
            <div className="image-panel image-panel-housing ornament-frame p-4">
                <div className="image-panel-content">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-300">Land Size</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{landSize} plots</p>
                    <p className="mt-2 text-xs text-gray-400">
                        Next expansion: {nextExpandCost}g · Requires farm level {nextExpandFarmLevel}
                    </p>
                    <button
                        type="button"
                        onClick={handleExpandLand}
                        className={`mt-3 w-full rounded-lg px-3 py-2 text-xs font-semibold ${gold >= nextExpandCost && farmLevel >= nextExpandFarmLevel
                            ? 'action-primary text-white'
                            : 'bg-gray-700 text-gray-300'
                            }`}
                        disabled={gold < nextExpandCost || farmLevel < nextExpandFarmLevel}
                    >
                        Expand Land (+{LAND_EXPAND_SIZE} plots)
                    </button>
                </div>
            </div>
        </div>
    );
});

export default FarmUpgradePanel;
