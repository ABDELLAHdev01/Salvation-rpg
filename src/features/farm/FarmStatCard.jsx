import React from 'react';
import XpBar from '../../components/XpBar';
import { farmGoods } from '../../data/farmData';
import { getItemCount } from '../../services/inventoryService';

const FarmStatCard = React.memo(function FarmStatCard({ farmLevel, farmXp, farmXpTarget, gold, inventory }) {
    const goodsCount = farmGoods.reduce((sum, good) => sum + getItemCount(inventory, good.id), 0);

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
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-300">Inventory</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                        {goodsCount} goods
                    </p>
                </div>
            </div>
        </div>
    );
});

export default FarmStatCard;
