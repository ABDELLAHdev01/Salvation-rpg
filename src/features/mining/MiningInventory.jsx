import React from 'react';
import Panel from '../../components/ui/Panel';
import SectionHeader from '../../components/ui/SectionHeader';
import { miningOres } from '../../data/miningData';
import { getItemCount } from '../../services/inventoryService';

export default function MiningInventory({ inventory, lastResultList = [], lastResult }) {
    return (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Panel className="p-6">
                <SectionHeader
                    kicker="Ore Inventory"
                    className="mb-4"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                    {miningOres.map((ore) => (
                        <div key={ore.id} className="rounded-xl border border-yellow-700/20 bg-gray-950/70 p-4">
                            <div className="flex items-center gap-3">
                                {ore.image && (
                                    <img
                                        src={ore.image}
                                        alt={ore.name}
                                        className="h-10 w-10 rounded-lg object-contain"
                                    />
                                )}
                                <p className="text-sm font-semibold text-white">{ore.name}</p>
                            </div>
                            <p className="mt-2 text-xs text-gray-400">Stored</p>
                            <p className="mt-1 text-xl font-semibold text-yellow-300">
                                {getItemCount(inventory, ore.id)}
                            </p>
                        </div>
                    ))}
                </div>
            </Panel>
            <Panel variant="image" className="image-panel-inventory p-6">
                <div className="image-panel-content">
                    <SectionHeader
                        kicker="Last Haul"
                        className="mb-3"
                    />
                    {lastResultList.length === 0 ? (
                        <p className="mt-3 text-sm text-gray-300">No mining rewards yet.</p>
                    ) : (
                        <>
                            <p className="mt-2 text-xs text-gray-400">
                                Run tier: {lastResult?.tier || 1}
                            </p>
                            <ul className="mt-3 space-y-2 text-sm text-gray-300">
                                {lastResultList.map((item) => (
                                    <li
                                        key={item.id}
                                        className="flex items-center justify-between"
                                    >
                                        <span>{item.name}</span>
                                        <span className="text-yellow-200">+{item.amount}</span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            </Panel>
        </div>
    );
}
