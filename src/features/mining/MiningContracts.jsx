import React from 'react';
import Panel from '../../components/ui/Panel';
import SectionHeader from '../../components/ui/SectionHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { miningOres, formatDuration } from '../../data/miningData';
import { getItemCount } from '../../services/inventoryService';

export default function MiningContracts({
    miningContracts,
    inventory,
    miningContractTokens,
    now,
    handleDeliverContract,
    handleRefreshContract,
}) {
    return (
        <div className="mt-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                    Mining Contracts
                </p>
                <Badge variant={miningContractTokens > 0 ? 'warning' : 'ghost'}>
                    Tokens: {miningContractTokens}
                </Badge>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                {['daily', 'weekly'].map((type) => {
                    const contract = miningContracts?.[type];
                    const ore = miningOres.find((item) => item.id === contract?.oreId);
                    const owned = contract ? getItemCount(inventory, contract.oreId) : 0;
                    const isClaimed = contract?.claimed;
                    const canDeliver = contract && owned >= contract.amount && !isClaimed;
                    const timeLeft = contract?.expiresAt
                        ? Math.max(0, contract.expiresAt - now)
                        : 0;

                    return (
                        <Panel key={type} className="p-6">
                            <SectionHeader
                                kicker={type === 'weekly' ? 'Weekly Contract' : 'Daily Contract'}
                                className="mb-3"
                            />
                            {contract ? (
                                <div className="mt-3 space-y-2 text-sm text-gray-300">
                                    <p className="text-white font-semibold">
                                        Deliver {contract.amount} {ore?.name || 'Ore'}
                                    </p>
                                    <p>
                                        Reward: {contract.rewardGold} gold + {contract.rewardXp} XP
                                    </p>
                                    <p>
                                        Progress: {owned}/{contract.amount}
                                    </p>
                                    <p>Time left: {formatDuration(timeLeft)}</p>
                                    {isClaimed ? (
                                        <Badge variant="success">Completed</Badge>
                                    ) : (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleDeliverContract(type)}
                                                disabled={!canDeliver}
                                            >
                                                Deliver Ore
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleRefreshContract(type)}
                                                disabled={miningContractTokens <= 0}
                                            >
                                                Refresh ({miningContractTokens})
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="mt-3 text-sm text-gray-300">
                                    Contract parchment is being prepared.
                                </p>
                            )}
                        </Panel>
                    );
                })}
            </div>
        </div>
    );
}
