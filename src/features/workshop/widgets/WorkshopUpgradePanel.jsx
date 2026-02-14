import React, { memo } from 'react';
import Panel from '../../../shared/ui/Panel';
import Button from '../../../shared/ui/Button';

const WorkshopUpgradePanel = ({ upgrade, nextUpgrade, gold, handleUpgrade }) => {
    return (
        <Panel variant="ornament">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-300 font-bold mb-4">Artisan Gear</p>
            <h4 className="text-xl font-bold text-white">{nextUpgrade ? nextUpgrade.name : 'Masterwork Forge'}</h4>
            <p className="mt-2 text-sm text-gray-400">
                {nextUpgrade
                    ? `Reduces crafting duration to ${(nextUpgrade.durationMultiplier * 100).toFixed(0)}%.`
                    : 'Your tools are the pinnacle of mortal craftsmanship.'}
            </p>
            <div className="mt-4 p-4 rounded-xl bg-gray-950/50 border border-yellow-700/10">
                <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-gray-500">Current Efficiency</span>
                    <span className="text-yellow-500 font-bold">{(upgrade?.durationMultiplier * 100 || 100).toFixed(0)}%</span>
                </div>
                {nextUpgrade && (
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Upgrade Cost</span>
                        <span className={`font-bold ${gold >= nextUpgrade.cost ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {nextUpgrade.cost} Gold
                        </span>
                    </div>
                )}
            </div>
            <Button
                variant="ornate"
                className="mt-6 w-full"
                onClick={handleUpgrade}
                disabled={!nextUpgrade || gold < nextUpgrade.cost}
            >
                Reforge Tools
            </Button>
        </Panel>
    );
};

export default memo(WorkshopUpgradePanel);
