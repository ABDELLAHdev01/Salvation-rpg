import React, { memo } from 'react';
import Panel from '../../../shared/ui/Panel';
import Badge from '../../../shared/ui/Badge';
import Button from '../../../shared/ui/Button';

const WorkshopInventory = ({ workshopInventory, workshopInventoryTotal, getWorkshopItem, handleSell, handleSellAllCrafted }) => {
    return (
        <Panel variant="card">
            <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">Finished Wares</p>
                <Button variant="ghost" size="sm" onClick={handleSellAllCrafted} disabled={workshopInventoryTotal <= 0}>
                    Sell All
                </Button>
            </div>
            {Object.keys(workshopInventory).length === 0 ? (
                <p className="text-sm text-gray-500 italic py-4">Vault is empty.</p>
            ) : (
                <div className="space-y-4">
                    {Object.entries(workshopInventory).map(([itemId, amount]) => {
                        const item = getWorkshopItem(itemId);
                        return (
                            <div key={itemId} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-gray-950/40 border border-yellow-700/5 hover:bg-gray-950/60 transition-all">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{item?.name || itemId}</p>
                                    <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest mt-0.5">{item?.sellValue || 0} Gold</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="gold">x{amount}</Badge>
                                    <Button variant="secondary" size="sm" className="h-7 w-7 !p-0" onClick={() => handleSell(itemId, 1)}>
                                        $
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Panel>
    );
};

export default memo(WorkshopInventory);
