import React from 'react';
import Panel from '../../shared/ui/Panel';
import Button from '../../shared/ui/Button';
import Badge from '../../shared/ui/Badge';

const FarmUpgradePanel = React.memo(function FarmUpgradePanel({
    farmLevel,
    gold,
    landSize,
    nextExpandCost,
    nextExpandFarmLevel,
    handleExpandLand,
    LAND_EXPAND_SIZE,
}) {
    const canExpand = gold >= nextExpandCost && farmLevel >= nextExpandFarmLevel;

    return (
        <Panel variant="card">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold mb-4">Real Estate</p>
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-xl font-bold text-white">{landSize} Plots</h4>
                    <p className="text-xs text-gray-400 mt-1">Current Estate Size</p>
                </div>
                <Badge variant="gold">+{LAND_EXPAND_SIZE} Plots Available</Badge>
            </div>

            <Panel variant="subtle" className="mt-6">
                <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-gray-500">Upgrade Cost</span>
                    <span className={`font-bold ${gold >= nextExpandCost ? 'text-yellow-400' : 'text-red-400'}`}>
                        {nextExpandCost} Gold
                    </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Required Level</span>
                    <span className={`font-bold ${farmLevel >= nextExpandFarmLevel ? 'text-emerald-400' : 'text-red-400'}`}>
                        Lvl {nextExpandFarmLevel}
                    </span>
                </div>
            </Panel>

            <Button
                variant="ornate"
                onClick={handleExpandLand}
                className="mt-6 w-full"
                disabled={!canExpand}
            >
                Expand Frontier
            </Button>
        </Panel>
    );
});

export default FarmUpgradePanel;
